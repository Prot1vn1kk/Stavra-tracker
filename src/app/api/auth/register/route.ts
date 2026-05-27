import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, hashPassword, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
    weightKg?: number;
  };

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  const weightKg = Number(body.weightKg) || 70;

  if (!name || !email || password.length < 6) {
    return NextResponse.json({ error: "Укажите имя, email и пароль от 6 символов." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Пользователь с таким email уже есть." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      weightKg,
      passwordHash
    },
    select: {
      id: true,
      name: true,
      email: true,
      weightKg: true
    }
  });

  const response = NextResponse.json({ user });
  setSessionCookie(response, createSessionToken({ userId: user.id, email: user.email, name: user.name }));
  return response;
}
