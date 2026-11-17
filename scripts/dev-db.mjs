/**
 * Menjalankan PostgreSQL lokal untuk development tanpa perlu instalasi global.
 * Database ini memakai binary PostgreSQL asli dari paket embedded-postgres.
 *
 * Pemakaian:
 *   npm run db:start
 *
 * Data disimpan di folder .pgdata (diabaikan git). Hentikan dengan Ctrl+C
 * atau `npm run db:stop`.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import EmbeddedPostgres from "embedded-postgres";

const dataDir = path.resolve(".pgdata");
const port = Number(process.env.PG_PORT ?? 55432);
const user = process.env.PG_USER ?? "postgres";
const password = process.env.PG_PASSWORD ?? "postgres";
const database = process.env.PG_DATABASE ?? "rosmawati";

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  port,
  user,
  password,
  persistent: true,
  autoRehydrateSymlinks: true,
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
});

const initialised = existsSync(path.join(dataDir, "PG_VERSION"));

if (!initialised) {
  console.log(`Membuat cluster PostgreSQL di ${dataDir}...`);
  await pg.initialise();
}

await pg.start();

try {
  await pg.createDatabase(database);
  console.log(`Database "${database}" dibuat.`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  if (!/already exists/i.test(message)) {
    console.error(message);
    process.exitCode = 1;
    await pg.stop();
    process.exit(1);
  }
}

console.log(
  `PostgreSQL siap: postgresql://${user}:***@localhost:${port}/${database}`,
);
console.log("Tekan Ctrl+C untuk berhenti.");

let stopping = false;

async function shutdown(signal) {
  if (stopping) return;
  stopping = true;
  console.log(`\nMenerima ${signal}, menghentikan PostgreSQL...`);
  try {
    await pg.stop();
  } finally {
    process.exit(0);
  }
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

// Menjaga proses tetap hidup selama database dipakai.
setInterval(() => {}, 2 ** 31 - 1);
