import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const funcionarios = await prisma.funcionario.findMany({
    include: { epis: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(funcionarios);
}

export async function POST(req: Request) {
  const body = await req.json();
  console.log("Recebido:", body);

  if (!body.nome || !body.funcao || !body.cpf) {
    return NextResponse.json(
      { error: "nome, funcao e cpf são obrigatórios" },
      { status: 400 }
    );
  }

  const data = await prisma.funcionario.create({
    data: {
      nome: body.nome,
      funcao: body.funcao,
      cpf: body.cpf,
      cargo: body.cargo ?? null,
      telefone: body.telefone ?? null,
      whatsapp: body.whatsapp ?? null,
      salario: body.salario ?? null,
      pin: body.pin ?? "1234",
    },
  });

  return NextResponse.json(data);
}