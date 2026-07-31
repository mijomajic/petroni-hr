import { createServer } from 'node:net';
import { mkdir, readFile, readdir } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import {
	buildFileManifest,
	cleanupTemp,
	createTempDirectory,
	decryptFile,
	findPostgresBin,
	readPassphrase,
	run,
	sha256File,
	writeJson
} from './backup-lib.mjs';

const archive = resolve(process.argv[2] ?? '');
if (!process.argv[2]) throw new Error('Uporaba: npm run backup:restore-test -- /apsolutna/putanja/backup.tar.gz.enc');
const passphrase = await readPassphrase();
const postgresBin = await findPostgresBin();
const workRoot = await createTempDirectory('petroni-restore-');
const tarPath = join(workRoot, 'backup.tar.gz');
const extractRoot = join(workRoot, 'extracted');
const databaseData = join(workRoot, 'postgres');
const socketRoot = join(workRoot, 'socket');
const startedAt = Date.now();
let databaseStarted = false;

async function freePort() {
	return await new Promise((resolvePromise, rejectPromise) => {
		const server = createServer();
		server.on('error', rejectPromise);
		server.listen(0, '127.0.0.1', () => {
			const address = server.address();
			server.close(() => resolvePromise(address.port));
		});
	});
}

function psqlArgs(socket, port, database = 'petroni_restore') {
	return ['-X', '-v', 'ON_ERROR_STOP=1', '-h', socket, '-p', String(port), '-U', 'postgres', '-d', database];
}

try {
	await mkdir(extractRoot, { recursive: true, mode: 0o700 });
	await mkdir(socketRoot, { recursive: true, mode: 0o700 });
	const archiveHash = await sha256File(archive);
	try {
		const expectedHash = (await readFile(`${archive}.sha256`, 'utf8')).trim().split(/\s+/)[0];
		if (archiveHash !== expectedHash) throw new Error('SHA-256 arhive ne odgovara sidecar datoteci.');
	} catch (error) {
		if (error?.code !== 'ENOENT') throw error;
	}
	await decryptFile(archive, tarPath, passphrase);
	await run('tar', ['-xzf', tarPath, '-C', extractRoot], { quiet: true, label: 'Raspakiravanje backupa' });
	const payloadEntries = await readdir(extractRoot);
	if (payloadEntries.length !== 1) throw new Error('Backup mora sadržavati točno jedan payload direktorij.');
	const payloadRoot = join(extractRoot, payloadEntries[0]);
	const manifest = JSON.parse(await readFile(join(payloadRoot, 'manifest.json'), 'utf8'));
	const actualFiles = await buildFileManifest(payloadRoot, new Set(['manifest.json']));
	if (JSON.stringify(actualFiles) !== JSON.stringify(manifest.files)) throw new Error('Hash ili popis datoteka u backupu nije valjan.');

	const port = await freePort();
	await run(join(postgresBin, 'initdb'), ['-D', databaseData, '--username=postgres', '--auth=trust', '--no-locale'], {
		quiet: true,
		label: 'Inicijalizacija izolirane PostgreSQL baze'
	});
	await run(
		join(postgresBin, 'pg_ctl'),
		['-D', databaseData, '-l', join(workRoot, 'postgres.log'), '-o', `-k ${socketRoot} -p ${port}`, 'start'],
		{ quiet: true, label: 'Pokretanje izolirane PostgreSQL baze' }
	);
	databaseStarted = true;
	await run(join(postgresBin, 'createdb'), ['-h', socketRoot, '-p', String(port), '-U', 'postgres', 'petroni_restore'], {
		quiet: true,
		label: 'Izrada izolirane restore baze'
	});

	const bootstrap = `
create role anon nologin;
create role authenticated nologin;
create role service_role nologin;
create role authenticator nologin;
create role dashboard_user nologin;
create role supabase_admin nologin;
create role supabase_auth_admin nologin;
create role supabase_storage_admin nologin;
create schema extensions authorization postgres;
create schema vault authorization postgres;
create extension if not exists pgcrypto with schema extensions;
create extension if not exists "uuid-ossp" with schema extensions;
create extension if not exists pg_stat_statements with schema extensions;
create publication supabase_realtime;
`;
	await run(join(postgresBin, 'psql'), psqlArgs(socketRoot, port), { input: bootstrap, quiet: true, label: 'Restore bootstrap' });
	for (const file of ['roles.sql', 'managed-schema.sql']) {
		await run(join(postgresBin, 'psql'), [...psqlArgs(socketRoot, port), '-f', join(payloadRoot, 'database', file)], {
			quiet: true,
			label: `Restore ${file}`
		});
	}
	const publicSchema = (await readFile(join(payloadRoot, 'database/public-schema.sql'), 'utf8')).replace(
		/^CREATE EXTENSION IF NOT EXISTS "supabase_vault".*$/m,
		''
	);
	await run(join(postgresBin, 'psql'), psqlArgs(socketRoot, port), {
		input: publicSchema,
		quiet: true,
		label: 'Restore public schema'
	});
	await run(
		join(postgresBin, 'psql'),
		[...psqlArgs(socketRoot, port), '-f', join(payloadRoot, 'database/data.sql')],
		{
			env: { ...process.env, PGOPTIONS: '-c session_replication_role=replica' },
			quiet: true,
			label: 'Restore database data'
		}
	);

	const expectedCounts = manifest.database.copy_counts;
	const countQuery = Object.keys(expectedCounts)
		.map((name) => {
			const [schema, table] = name.split('.');
			return `select '${schema}.${table}' as name, count(*)::bigint as rows from "${schema}"."${table}"`;
		})
		.join(' union all ');
	const countOutput = await run(
		join(postgresBin, 'psql'),
		[...psqlArgs(socketRoot, port), '-At', '-F', '\t', '-c', countQuery],
		{ capture: true, label: 'Provjera restore brojeva redaka' }
	);
	const restoredCounts = Object.fromEntries(
		countOutput
			.toString('utf8')
			.trim()
			.split('\n')
			.filter(Boolean)
			.map((line) => {
				const [name, rows] = line.split('\t');
				return [name, Number(rows)];
			})
	);
	if (JSON.stringify(restoredCounts) !== JSON.stringify(expectedCounts)) throw new Error('Brojevi redaka nakon restorea nisu jednaki backupu.');

	const evidence = {
		format: 1,
		completed_at: new Date().toISOString(),
		archive: basename(archive),
		archive_sha256: archiveHash,
		project_ref: manifest.project_ref,
		duration_seconds: Math.round((Date.now() - startedAt) / 100) / 10,
		database_tables_verified: Object.keys(restoredCounts).length,
		database_rows_verified: Object.values(restoredCounts).reduce((sum, rows) => sum + rows, 0),
		storage_buckets: manifest.storage.buckets,
		storage_objects_verified: manifest.storage.objects,
		storage_bytes_verified: manifest.storage.bytes,
		result: 'pass'
	};
	const evidenceDirectory = resolve(process.env.PETRONI_RESTORE_EVIDENCE_DIR ?? dirname(archive));
	await mkdir(evidenceDirectory, { recursive: true, mode: 0o700 });
	const evidencePath = join(evidenceDirectory, `${basename(archive, '.tar.gz.enc')}.restore-evidence.json`);
	await writeJson(evidencePath, evidence);
	console.log(JSON.stringify({ evidence: evidencePath, ...evidence }, null, 2));
} finally {
	if (databaseStarted) {
		await run(join(postgresBin, 'pg_ctl'), ['-D', databaseData, 'stop', '-m', 'fast'], {
			quiet: true,
			label: 'Zaustavljanje izolirane PostgreSQL baze'
		}).catch(() => undefined);
	}
	await cleanupTemp(workRoot);
}
