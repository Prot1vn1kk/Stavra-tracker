import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = getRequestSession(request);
  const run = await prisma.run.findUnique({
    where: { id: params.id },
    include: {
      route: true,
      user: {
        select: {
          name: true
        }
      }
    }
  });

  if (!run || (!run.isPublic && run.userId !== session?.userId)) {
    return NextResponse.json({ error: "Тренировка не найдена." }, { status: 404 });
  }

  return NextResponse.json({ run });
}
