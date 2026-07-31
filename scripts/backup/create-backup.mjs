import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import {
	artifactBaseName,
	assertArtifactOutsideRepository,
	buildFileManifest,
	cleanupTemp,
	copyOptionalRecoverySecrets,
	createTempDirectory,
	encryptFile,
	findPostgresBin,
	listFiles,
	parseCopyCounts,
	readPassphrase,
	run,
	sha256File,
	stat,
	writeJson
} from './backup-lib.mjs';

const repositoryRoot = resolve(new URL('../..', import.meta.url).pathname);
const projectRef = process.env.PETRONI_SUPABASE_PROJECT_REF;
if (!projectRef) throw new Error('Postavi PETRONI_SUPABASE_PROJECT_REF na odobreni produkcijski projekt.');
const artifactDirectory = await assertArtifactOutsideRepository(process.env.PETRONI_BACKUP_DIR ?? '', repositoryRoot);
const passphrase = await readPassphrase();
const postgresBin = await findPostgresBin();
const startedAt = new Date();
const baseName = artifactBaseName(startedAt);
const workRoot = await createTempDirectory('petroni-backup-');
const payloadRoot = join(workRoot, baseName);
const databaseRoot = join(payloadRoot, 'database');
const storageRoot = join(payloadRoot, 'storage');
const recoveryRoot = join(payloadRoot, 'recovery');
const tarPath = join(workRoot, `${baseName}.tar.gz`);
const encryptedPath = join(artifactDirectory, `${baseName}.tar.gz.enc`);

async function captureDump(extraArgs, transformScript = (script) => script) {
	const generated = await run('npx', ['supabase', 'db', 'dump', '--linked', ...extraArgs, '--dry-run'], {
		cwd: repositoryRoot,
		capture: true,
		label: 'Supabase priprema izvoza baze'
	});
	const script = transformScript(generated.toString('utf8'));
	return await run('bash', ['-s'], {
		cwd: repositoryRoot,
		env: { ...process.env, PATH: `${postgresBin}:${process.env.PATH}` },
		input: script,
		capture: true,
		label: 'PostgreSQL logički izvoz'
	});
}

try {
	await mkdir(databaseRoot, { recursive: true, mode: 0o700 });
	await mkdir(storageRoot, { recursive: true, mode: 0o700 });
	await mkdir(recoveryRoot, { recursive: true, mode: 0o700 });

	await run('npx', ['supabase', 'link', '--project-ref', projectRef], {
		cwd: repositoryRoot,
		capture: true,
		label: 'Povezivanje Supabase projekta'
	});
	const linkedRef = (await readFile(join(repositoryRoot, 'supabase/.temp/project-ref'), 'utf8')).trim();
	if (linkedRef !== projectRef) throw new Error(`Povezan je neočekivani Supabase projekt ${linkedRef}.`);

	const roles = await captureDump(['--role-only']);
	const publicSchema = await captureDump([]);
	const managedSchema = await captureDump(['--schema', 'auth,storage'], (script) =>
		script.replace('--schema=auth|storage', "--schema='auth|storage'")
	);
	const data = await captureDump(['--data-only', '--use-copy']);
	await writeFile(join(databaseRoot, 'roles.sql'), roles, { mode: 0o600 });
	await writeFile(join(databaseRoot, 'public-schema.sql'), publicSchema, { mode: 0o600 });
	await writeFile(join(databaseRoot, 'managed-schema.sql'), managedSchema, { mode: 0o600 });
	await writeFile(join(databaseRoot, 'data.sql'), data, { mode: 0o600 });

	const storageListingBuffer = await run(
		'npx',
		['supabase', 'storage', 'ls', 'ss:///', '--linked', '--recursive', '--experimental'],
		{ cwd: repositoryRoot, capture: true, label: 'Popis Supabase Storage objekata' }
	);
	const storageListing = JSON.parse(storageListingBuffer.toString('utf8'));
	const remotePaths = storageListing.paths.map((path) => path.replace(/^\//, '')).sort();
	const buckets = [...new Set(remotePaths.map((path) => path.split('/')[0]))];
	for (const bucket of buckets) {
		await run(
			'npx',
			['supabase', 'storage', 'cp', '-r', `ss:///${bucket}`, storageRoot, '--linked', '--experimental', '--jobs', '8'],
			{ cwd: repositoryRoot, quiet: true, label: `Preuzimanje Storage bucketa ${bucket}` }
		);
	}
	const localStoragePaths = await listFiles(storageRoot);
	if (JSON.stringify(localStoragePaths) !== JSON.stringify(remotePaths)) {
		throw new Error(`Storage popis se ne podudara: remote ${remotePaths.length}, lokalno ${localStoragePaths.length}.`);
	}
	await writeJson(join(payloadRoot, 'storage-paths.json'), { paths: remotePaths });

	await copyFile(join(repositoryRoot, 'docs/go-live/environment-recovery.md'), join(recoveryRoot, 'environment-recovery.md'));
	const includedRecoverySecrets = await copyOptionalRecoverySecrets(
		process.env.PETRONI_RECOVERY_SECRETS_FILE,
		repositoryRoot,
		join(recoveryRoot, 'secrets.env')
	);

	const copyCounts = parseCopyCounts(data.toString('utf8'));
	const payloadFiles = await buildFileManifest(payloadRoot, new Set(['manifest.json']));
	const storageFiles = payloadFiles.filter((file) => file.path.startsWith('storage/'));
	const manifest = {
		format: 1,
		created_at: startedAt.toISOString(),
		project_ref: projectRef,
		database: { copy_counts: copyCounts },
		storage: {
			buckets,
			objects: storageFiles.length,
			bytes: storageFiles.reduce((sum, file) => sum + file.bytes, 0)
		},
		recovery_secrets_included: includedRecoverySecrets,
		files: payloadFiles
	};
	await writeJson(join(payloadRoot, 'manifest.json'), manifest);

	await run('tar', ['-czf', tarPath, '-C', workRoot, baseName], { label: 'Pakiranje backupa' });
	await encryptFile(tarPath, encryptedPath, passphrase);
	const encryptedHash = await sha256File(encryptedPath);
	await writeFile(`${encryptedPath}.sha256`, `${encryptedHash}  ${baseName}.tar.gz.enc\n`, { mode: 0o600 });
	const encryptedStat = await stat(encryptedPath);
	console.log(
		JSON.stringify(
			{
				artifact: encryptedPath,
				sha256: encryptedHash,
				bytes: encryptedStat.size,
				storage_objects: manifest.storage.objects,
				storage_bytes: manifest.storage.bytes,
				database_tables: Object.keys(copyCounts).length,
				recovery_secrets_included: includedRecoverySecrets
			},
			null,
			2
		)
	);
} finally {
	await cleanupTemp(workRoot);
}
