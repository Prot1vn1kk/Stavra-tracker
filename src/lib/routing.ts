import type { GeoPoint } from "./moscowRoutes";

/**
 * Fetches a street-following route between waypoints using the OSRM API.
 * Falls back to direct-line coordinates if the API is unavailable.
 */
export async function fetchStreetRoute(points: GeoPoint[]): Promise<GeoPoint[]> {
  if (points.length < 2) return points;

  try {
    const coords = points.map((p) => `${p.lng},${p.lat}`).join(";");
    const url = `https://router.project-osrm.org/route/v1/foot/${coords}?geometries=geojson&overview=full`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) return points;

    const data = await response.json() as {
      code: string;
      routes: Array<{ geometry: { coordinates: [number, number][] } }>;
    };

    if (data.code !== "Ok" || !data.routes?.[0]) return points;

    return data.routes[0].geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
  } catch {
    // API unavailable — fall back to preset coordinates
    return points;
  }
}
