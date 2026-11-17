/**
 * Membuat hash bcrypt untuk ADMIN_PASSWORD_HASH.
 * Password diketik secara tersembunyi dan tidak pernah dicetak/di-log.
 *
 * Jalankan: npm run admin:hash
 */
import bcrypt from "bcryptjs";
import readline from "node:readline";

function askHidden(query) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });
    const originalWrite = rl._writeToOutput.bind(rl);
    let muted = false;

    rl._writeToOutput = (text) => {
      if (!muted) {
        originalWrite(text);
        return;
      }
      // Tetap tampilkan newline saat Enter, selain itu sensor input.
      if (text.includes("\n") || text.includes("\r")) {
        originalWrite("\n");
      } else {
        originalWrite("*");
      }
    };

    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
    muted = true;
  });
}

async function main() {
  if (!process.stdin.isTTY) {
    throw new Error("Jalankan perintah ini langsung di terminal interaktif.");
  }

  const password = await askHidden("Password admin baru: ");
  if (password.length < 10) {
    throw new Error("Password minimal 10 karakter.");
  }
  if (password.length > 72 || Buffer.byteLength(password, "utf8") > 72) {
    throw new Error("Password maksimal 72 karakter/byte (batas bcrypt).");
  }

  const confirmation = await askHidden("Ulangi password: ");
  if (password !== confirmation) {
    throw new Error("Password dan konfirmasi tidak sama.");
  }

  const hash = await bcrypt.hash(password, 12);
  console.log("\nSalin baris berikut ke .env (jangan commit .env):\n");
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  console.log(
    "\nSetelah .env diperbarui, login menggunakan password yang baru diketik tadi.",
  );
}

main().catch((error) => {
  console.error(`\nGagal: ${error.message}`);
  process.exitCode = 1;
});
