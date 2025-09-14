import { PrismaClient } from "@prisma/client";

const prismaClientSingletone = () => new PrismaClient();

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingletone>;
} & typeof global;

export const prisma = globalThis.prismaGlobal ?? prismaClientSingletone();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
