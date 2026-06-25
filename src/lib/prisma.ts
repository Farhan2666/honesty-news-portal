import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function getDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return url;
  try {
    const u = new URL(url);
    u.searchParams.set("connect_timeout", "3");
    return u.toString();
  } catch {
    return url;
  }
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: { db: { url: getDatabaseUrl() } },
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
