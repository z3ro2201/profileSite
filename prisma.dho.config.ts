import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.dho.prisma",

  migrations: {
    path: "prisma/migrations-dho",
  },

  datasource: {
    url: process.env.DHO_DATABASE_URL,
  },
});
