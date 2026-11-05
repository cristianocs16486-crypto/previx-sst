import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  const exames = await prisma.exame.findMany({ orderBy: { createdAt: "desc" } });
  return Response.json(exames);
}

export async function POST(req: Request) {
  const { funcionario, tipo, resultado } = await req.json();
  const novo = await prisma.exame.create({
    data: { funcionario, tipo, resultado }
  });
  return Response.json(novo);
}