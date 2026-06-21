import { PrismaClient } from "@/prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prismaClientSingletone = () =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingletone>;
} & typeof global;

export const prisma = globalThis.prismaGlobal ?? prismaClientSingletone();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
