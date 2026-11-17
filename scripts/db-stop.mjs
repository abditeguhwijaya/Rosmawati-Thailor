/**
 * Menghentikan PostgreSQL lokal yang dijalankan oleh scripts/dev-db.mjs.
 * Memakai pg_ctl agar shutdown bersih (bukan kill paksa).
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const dataDir = path.resolve(".pgdata");

if (!existsSync(path.join(dataDir, "PG_VERSION"))) {
  console.log("Cluster lokal belum pernah dibuat. Tidak ada yang dihentikan.");
  process.exit(0);
}

const platformDir = `@embedded-postgres/${process.platform}-${process.arch}`;
const binary =
  process.platform === "win32"
    ? path.resolve("node_modules", platformDir, "native", "bin", "pg_ctl.exe")
    : path.resolve("node_modules", platformDir, "native", "bin", "pg_ctl");

if (!existsSync(binary)) {
  console.error(`pg_ctl tidak ditemukan di ${binary}`);
  process.exit(1);
}

const result = spawnSync(binary, ["stop", "-D", dataDir, "-m", "fast"], {
  stdio: "inherit",
});

process.exit(result.status ?? 1);
