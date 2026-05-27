import { RouteSource } from "@prisma/client";
import { GeoPoint, getDistrict, nudgePresetRoute } from "./moscowRoutes";

type BuildRouteInput = {
  district: string;
  durationMinutes: number;
  manualPoints?: GeoPoint[];
  preferExternalRouting?: boolean;
};

async function tryExternalRouting(points: GeoPoint[]) {
  const baseUrl = process.env.ROUTING_API_URL;
  if (!baseUrl || points.length < 2) {
    return null;
  }

  const coordinates = points.map((point) => `${point.lng},${point.lat}`).join(";");
  const url = `${baseUrl.replace(/\/$/, "")}/route/v1/foot/${coordinates}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(url, { next: { revalidate: 0 } });
    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      routes?: Array<{ geometry?: { coordinates?: [number, number][] } }>;
    };

    const routed = data.routes?.[0]?.geometry?.coordinates?.map(([lng, lat]) => ({ lat, lng }));
    return routed && routed.length >= 2 ? routed : null;
  } catch {
    return null;
  }
}

export async function buildRoute(input: BuildRouteInput) {
  const manualPoints = input.manualPoints?.filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng)) ?? [];

  if (manualPoints.length >= 2) {
    if (input.preferExternalRouting) {
      const routed = await tryExternalRouting(manualPoints);
      if (routed) {
        return {
          source: RouteSource.EXTERNAL_ROUTING,
          points: manualPoints,
          polyline: routed
        };
      }
    }

    return {
      source: RouteSource.MANUAL_POINTS,
      points: manualPoints,
      polyline: manualPoints
    };
  }

  const preset = getDistrict(input.district);
  const polyline = nudgePresetRoute(preset.route, input.durationMinutes);

  return {
    source: RouteSource.PRESET,
    points: preset.route,
    polyline
  };
}
