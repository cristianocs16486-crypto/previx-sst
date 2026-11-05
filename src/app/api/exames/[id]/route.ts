import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.exame.delete({ where: { id } });
  return Response.json({ ok: true });
}