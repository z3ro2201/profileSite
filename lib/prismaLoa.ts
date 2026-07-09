import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prismaLoa?: PrismaClient;
};

function createPrismaLoa() {
  const url = process.env.LOA_DATABASE_URL;
  if (!url) throw new Error("LOA_DATABASE_URL is not set");

  const adapter = new PrismaMariaDb(url);

  return new PrismaClient({ adapter });
}

export const prismaLoa = globalForPrisma.prismaLoa ?? createPrismaLoa();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaLoa = prismaLoa;
}
