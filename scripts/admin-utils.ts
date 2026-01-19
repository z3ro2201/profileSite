import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

async function main() {
  const email = "admin@example.com";
  const plainPassword = "mgoon1358!";

  const hash = await bcrypt.hash(plainPassword, 12);

  await prisma.user.update({
    where: { email },
    data: { passwordHash: hash },
  });

  console.log("✅ Admin password set for", email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
