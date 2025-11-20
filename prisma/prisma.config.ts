import type { PrismaConfig } from "prisma";

export default {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: { 
    url: process.env.DATABASE_URL!,
    shadowDatabaseUrl: process.env.DIRECT_URL!,
  }
} satisfies PrismaConfig;