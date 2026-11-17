
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import readline from "node:readline";

const prisma = new PrismaClient();

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });

    const originalWrite = rl._writeToOutput.bind(rl);
    let muted = false;

    rl._writeToOutput = (value) => {
      if (!muted) originalWrite(value);
      else if (value.includes("\n") || value.includes("\r")) {
        originalWrite("\n");
      } else {
        originalWrite("*");
      }
    };

    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });

    muted = true;
  });
}

async function main() {
  const email = (process.env.ADMIN_EMAIL || "")
    .trim()
    .toLowerCase();

  if (!email) {
    throw new Error("ADMIN_EMAIL tidak ditemukan.");
  }

  const admin = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (!admin) {
    throw new Error("Akun admin tidak ditemukan.");
  }

  if (!admin.isActive) {
    throw new Error("Akun admin tidak aktif.");
  }

  console.log(`Akun ditemukan: ${email}`);

  const password = await askHidden("Password admin baru: ");

  if (password.length < 10) {
    throw new Error("Password minimal 10 karakter.");
  }

  if (Buffer.byteLength(password, "utf8") > 72) {
    throw new Error("Password maksimal 72 byte.");
  }

  const confirmation = await askHidden("Ulangi password baru: ");

  if (password !== confirmation) {
    throw new Error("Konfirmasi password tidak cocok.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: {
      passwordHash,
      passwordChangedAt: new Date(),
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  console.log("\nBERHASIL: Password admin telah diperbarui.");
}

main()
  .catch((error) => {
    console.error("\nGAGAL:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
