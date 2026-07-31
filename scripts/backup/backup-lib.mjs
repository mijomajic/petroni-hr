import { createCipheriv, createDecipheriv, createHash, randomBytes, scryptSync } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import {
	access,
	chmod,
	copyFile,
	mkdir,
	mkdtemp,
	open,
	readFile,
	readdir,
	rm,
	stat,
	writeFile
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { spawn } from 'node:child_process';

const MAGIC = Buffer.from('PETRONI-BACKUP-V1\n', 'utf8');
const AUTH_TAG_BYTES = 16;
const SCRYPT_OPTIONS = { N: 2 ** 18, r: 8, p: 1, maxmem: 512 * 1024 * 1024 };

export async function run(command, args, options = {}) {
	const {
		cwd,
		env = process.env,
		input,
		capture = false,
		quiet = false,
		label = `${command} ${args.join(' ')}`
	} = options;

	return await new Promise((resolvePromise, rejectPromise) => {
		const child = spawn(command, args, {
			cwd,
			env,
			stdio: [
				input === undefined ? 'ignore' : 'pipe',
				capture ? 'pipe' : quiet ? 'ignore' : 'inherit',
				quiet ? 'ignore' : 'inherit'
			]
		});
		const chunks = [];
		if (capture) child.stdout.on('data', (chunk) => chunks.push(chunk));
		child.on('error', rejectPromise);
		child.on('close', (code) => {
			if (code !== 0) {
				rejectPromise(new Error(`${label} završio je kodom ${code}.`));
				return;
			}
			resolvePromise(capture ? Buffer.concat(chunks) : undefined);
		});
		if (input !== undefined) child.stdin.end(input);
	});
}

export async function findPostgresBin() {
	const candidates = [
		process.env.PETRONI_POSTGRES_BIN,
		'/opt/homebrew/opt/postgresql@17/bin',
		'/usr/local/opt/postgresql@17/bin'
	].filter(Boolean);

	for (const candidate of candidates) {
		try {
			await access(join(candidate, 'pg_dump'));
			await access(join(candidate, 'psql'));
			return candidate;
		} catch {
			// Try the next known location.
		}
	}

	throw new Error(
		'PostgreSQL 17 alati nisu pronađeni. Instaliraj `brew install postgresql@17` ili postavi PETRONI_POSTGRES_BIN.'
	);
}

export async function readPassphrase() {
	let passphrase = process.env.PETRONI_BACKUP_PASSPHRASE;
	if (process.env.PETRONI_BACKUP_PASSPHRASE_FILE) {
		const passphraseStat = await stat(process.env.PETRONI_BACKUP_PASSPHRASE_FILE);
		if ((passphraseStat.mode & 0o077) !== 0) {
			throw new Error('PETRONI_BACKUP_PASSPHRASE_FILE mora imati dozvole 600.');
		}
		passphrase = await readFile(process.env.PETRONI_BACKUP_PASSPHRASE_FILE, 'utf8');
	}
	passphrase = passphrase?.replace(/[\r\n]+$/, '');
	if (!passphrase || passphrase.length < 20) {
		throw new Error(
		'Postavi PETRONI_BACKUP_PASSPHRASE_FILE ili PETRONI_BACKUP_PASSPHRASE s najmanje 20 znakova.'
		);
	}
	return passphrase;
}

async function writeChunk(stream, chunk) {
	if (!stream.write(chunk)) await new Promise((resolvePromise) => stream.once('drain', resolvePromise));
}

export async function encryptFile(source, destination, passphrase) {
	const salt = randomBytes(16);
	const iv = randomBytes(12);
	const key = scryptSync(passphrase, salt, 32, SCRYPT_OPTIONS);
	const cipher = createCipheriv('aes-256-gcm', key, iv);
	const header = Buffer.from(
		`${JSON.stringify({ alg: 'aes-256-gcm', kdf: 'scrypt', salt: salt.toString('base64'), iv: iv.toString('base64') })}\n`,
		'utf8'
	);
	const output = createWriteStream(destination, { mode: 0o600 });
	await writeChunk(output, MAGIC);
	await writeChunk(output, header);
	for await (const chunk of createReadStream(source)) await writeChunk(output, cipher.update(chunk));
	await writeChunk(output, cipher.final());
	await writeChunk(output, cipher.getAuthTag());
	output.end();
	await new Promise((resolvePromise, rejectPromise) => {
		output.on('finish', resolvePromise);
		output.on('error', rejectPromise);
	});
	await chmod(destination, 0o600);
}

async function readEncryptedHeader(file) {
	const handle = await open(file, 'r');
	try {
		const prefix = Buffer.alloc(4096);
		const { bytesRead } = await handle.read(prefix, 0, prefix.length, 0);
		const content = prefix.subarray(0, bytesRead);
		if (!content.subarray(0, MAGIC.length).equals(MAGIC)) throw new Error('Nepoznat format backup arhive.');
		const lineEnd = content.indexOf(0x0a, MAGIC.length);
		if (lineEnd < 0) throw new Error('Oštećeno zaglavlje backup arhive.');
		return { header: JSON.parse(content.subarray(MAGIC.length, lineEnd).toString('utf8')), offset: lineEnd + 1 };
	} finally {
		await handle.close();
	}
}

export async function decryptFile(source, destination, passphrase) {
	const { header, offset } = await readEncryptedHeader(source);
	if (header.alg !== 'aes-256-gcm' || header.kdf !== 'scrypt') throw new Error('Nepodržan format enkripcije.');
	const sourceStat = await stat(source);
	if (sourceStat.size <= offset + AUTH_TAG_BYTES) throw new Error('Backup arhiva je prekratka.');
	const handle = await open(source, 'r');
	const tag = Buffer.alloc(AUTH_TAG_BYTES);
	await handle.read(tag, 0, AUTH_TAG_BYTES, sourceStat.size - AUTH_TAG_BYTES);
	await handle.close();
	const key = scryptSync(passphrase, Buffer.from(header.salt, 'base64'), 32, SCRYPT_OPTIONS);
	const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(header.iv, 'base64'));
	decipher.setAuthTag(tag);
	const output = createWriteStream(destination, { mode: 0o600 });
	for await (const chunk of createReadStream(source, { start: offset, end: sourceStat.size - AUTH_TAG_BYTES - 1 })) {
		await writeChunk(output, decipher.update(chunk));
	}
	await writeChunk(output, decipher.final());
	output.end();
	await new Promise((resolvePromise, rejectPromise) => {
		output.on('finish', resolvePromise);
		output.on('error', rejectPromise);
	});
}

export async function sha256File(file) {
	const hash = createHash('sha256');
	for await (const chunk of createReadStream(file)) hash.update(chunk);
	return hash.digest('hex');
}

export async function listFiles(root, current = root) {
	const files = [];
	for (const entry of await readdir(current, { withFileTypes: true })) {
		const absolute = join(current, entry.name);
		if (entry.isDirectory()) files.push(...(await listFiles(root, absolute)));
		else if (entry.isFile()) files.push(relative(root, absolute).split(sep).join('/'));
	}
	return files.sort();
}

export async function buildFileManifest(root, excluded = new Set()) {
	const files = [];
	for (const path of await listFiles(root)) {
		if (excluded.has(path)) continue;
		const absolute = join(root, path);
		const fileStat = await stat(absolute);
		files.push({ path, bytes: fileStat.size, sha256: await sha256File(absolute) });
	}
	return files;
}

export function parseCopyCounts(dataSql) {
	const counts = {};
	let active;
	for (const line of dataSql.split('\n')) {
		const match = line.match(/^COPY "([^"]+)"\."([^"]+)" \(/);
		if (match) {
			active = `${match[1]}.${match[2]}`;
			counts[active] = 0;
			continue;
		}
		if (active && line === '\\.') {
			active = undefined;
			continue;
		}
		if (active) counts[active] += 1;
	}
	return counts;
}

export async function createTempDirectory(prefix) {
	return await mkdtemp(join(tmpdir(), prefix));
}

export async function ensurePrivateDirectory(path) {
	await mkdir(path, { recursive: true, mode: 0o700 });
	await chmod(path, 0o700);
}

export async function copyOptionalRecoverySecrets(source, repositoryRoot, destination) {
	if (!source) return false;
	if (!isAbsolute(source)) throw new Error('PETRONI_RECOVERY_SECRETS_FILE mora biti apsolutna putanja.');
	const resolvedSource = resolve(source);
	const resolvedRepo = resolve(repositoryRoot);
	const repoRelative = relative(resolvedRepo, resolvedSource);
	if (repoRelative === '' || (!repoRelative.startsWith('..') && !isAbsolute(repoRelative))) {
		throw new Error('Recovery secrets datoteka mora biti izvan Git repozitorija.');
	}
	const sourceStat = await stat(resolvedSource);
	if ((sourceStat.mode & 0o077) !== 0) throw new Error('Recovery secrets datoteka mora imati dozvole 600.');
	await copyFile(resolvedSource, destination);
	await chmod(destination, 0o600);
	return true;
}

export async function cleanupTemp(path) {
	if (!path || !resolve(path).startsWith(resolve(tmpdir()) + sep)) {
		throw new Error('Odbijeno čišćenje putanje koja nije privremena.');
	}
	await rm(path, { recursive: true, force: true });
}

export async function writeJson(path, value, mode = 0o600) {
	await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, { mode });
	await chmod(path, mode);
}

export async function assertArtifactOutsideRepository(artifactDirectory, repositoryRoot) {
	const resolvedArtifact = resolve(artifactDirectory);
	const resolvedRepo = resolve(repositoryRoot);
	const repoRelative = relative(resolvedRepo, resolvedArtifact);
	if (repoRelative === '' || (!repoRelative.startsWith('..') && !isAbsolute(repoRelative))) {
		throw new Error('PETRONI_BACKUP_DIR mora biti izvan Git repozitorija.');
	}
	await ensurePrivateDirectory(resolvedArtifact);
	return resolvedArtifact;
}

export function artifactBaseName(timestamp = new Date()) {
	return `petroni-${timestamp.toISOString().replace(/[:.]/g, '-')}`;
}

export { basename, dirname, join, resolve, stat, writeFile };
