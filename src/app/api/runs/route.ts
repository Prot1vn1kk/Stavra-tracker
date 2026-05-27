import { RunSource } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getRequestSession } from "@/lib/auth";
import { estimateCalories, paceSecondsPerKm, routeDistanceKm, generateStravaTitle } from "@/lib/metrics";
import { buildRoute } from "@/lib/routeBuilder";
import { prisma } from "@/lib/prisma";

type CreateRunBody = {
  activityDate?: string;
  startTime?: string;
  durationMinutes?: number;
  district?: string;
  source?: RunSource;
  isPublic?: boolean;
  note?: string;
  manualPoints?: Array<{ lat: number; lng: number }>;
  preferExternalRouting?: boolean;
};

export async function GET(request: NextRequest) {
  const session = getRequestSession(request);
  if (!session) {
    return NextResponse.json({ error: "Нужно войти." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const district = searchParams.get("district");
  const source = searchParams.get("source") as RunSource | null;
  const month = searchParams.get("month");

  const start = month ? new Date(`${month}-01T00:00:00.000Z`) : null;
  const end = start ? new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1)) : null;

  const runs = await prisma.run.findMany({
    where: {
      userId: session.userId,
      ...(district ? { district } : {}),
      ...(source ? { source } : {}),
      ...(start && end ? { activityDate: { gte: start, lt: end } } : {})
    },
    include: {
      route: true
    },
    orderBy: [{ activityDate: "desc" }, { startTime: "desc" }]
  });

  return NextResponse.json({ runs });
}

export async function POST(request: NextRequest) {
  const session = getRequestSession(request);
  if (!session) {
    return NextResponse.json({ error: "Нужно войти." }, { status: 401 });
  }

  const body = (await request.json()) as CreateRunBody;
  const activityDate = body.activityDate ? new Date(`${body.activityDate}T00:00:00.000Z`) : null;
  const startTime = body.startTime?.trim() || "09:00";
  const durationMinutes = Math.max(5, Math.min(600, Number(body.durationMinutes) || 90));
  const district = body.district?.trim() || "Парк Горького";
  const source = body.source && Object.values(RunSource).includes(body.source) ? body.source : RunSource.MANUAL;

  if (!activityDate || Number.isNaN(activityDate.getTime())) {
    return NextResponse.json({ error: "Выберите корректную дату." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { weightKg: true }
  });

  if (!user) {
    return NextResponse.json({ error: "Профиль не найден." }, { status: 401 });
  }

  const route = await buildRoute({
    district,
    durationMinutes,
    manualPoints: body.manualPoints,
    preferExternalRouting: body.preferExternalRouting
  });

  const distanceKm = Number(routeDistanceKm(route.polyline).toFixed(2));
  const paceSecondsKm = paceSecondsPerKm(durationMinutes, distanceKm);
  const calories = estimateCalories(user.weightKg, durationMinutes, distanceKm);

  const run = await prisma.run.create({
    data: {
      userId: session.userId,
      title: generateStravaTitle(startTime, distanceKm, district),
      activityDate,
      startTime,
      durationMinutes,
      district,
      distanceKm,
      paceSecondsKm,
      calories,
      source,
      isPublic: Boolean(body.isPublic),
      note: body.note?.trim() || null,
      route: {
        create: {
          district,
          source: route.source,
          points: route.points,
          polyline: route.polyline
        }
      }
    },
    include: {
      route: true
    }
  });

  return NextResponse.json({ run }, { status: 201 });
}
