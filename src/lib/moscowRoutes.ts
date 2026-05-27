import { routeDistanceKm } from "./metrics";

export type GeoPoint = {
  lat: number;
  lng: number;
};

export type DistrictPreset = {
  name: string;
  label: string;
  center: GeoPoint;
  accent: string;
  route: GeoPoint[];
};

export const MOSCOW_DISTRICTS: DistrictPreset[] = [
  {
    name: "gorky-park",
    label: "Парк Горького",
    center: { lat: 55.7298, lng: 37.6032 },
    accent: "#ff5a1f",
    route: [
      { lat: 55.7313, lng: 37.6001 },
      { lat: 55.7289, lng: 37.5948 },
      { lat: 55.7245, lng: 37.5962 },
      { lat: 55.7212, lng: 37.6028 },
      { lat: 55.7257, lng: 37.6104 },
      { lat: 55.7313, lng: 37.6001 },
    ],
  },
  {
    name: "vdnh",
    label: "ВДНХ",
    center: { lat: 55.8298, lng: 37.6338 },
    accent: "#ef7d00",
    route: [
      { lat: 55.8316, lng: 37.6291 },
      { lat: 55.8353, lng: 37.6332 },
      { lat: 55.8341, lng: 37.6424 },
      { lat: 55.8272, lng: 37.6421 },
      { lat: 55.8255, lng: 37.6338 },
      { lat: 55.8316, lng: 37.6291 },
    ],
  },
  {
    name: "sokolniki",
    label: "Сокольники",
    center: { lat: 55.7942, lng: 37.6762 },
    accent: "#fb923c",
    route: [
      { lat: 55.7906, lng: 37.6798 },
      { lat: 55.7944, lng: 37.6694 },
      { lat: 55.8011, lng: 37.6715 },
      { lat: 55.8017, lng: 37.6841 },
      { lat: 55.7944, lng: 37.6894 },
      { lat: 55.7906, lng: 37.6798 },
    ],
  },
  {
    name: "izmailovo",
    label: "Измайлово",
    center: { lat: 55.7879, lng: 37.7832 },
    accent: "#f97316",
    route: [
      { lat: 55.7891, lng: 37.7711 },
      { lat: 55.7942, lng: 37.7831 },
      { lat: 55.7894, lng: 37.7974 },
      { lat: 55.7807, lng: 37.7939 },
      { lat: 55.7796, lng: 37.7795 },
      { lat: 55.7891, lng: 37.7711 },
    ],
  },
  {
    name: "krylatskoe",
    label: "Крылатское",
    center: { lat: 55.7646, lng: 37.4241 },
    accent: "#ea580c",
    route: [
      { lat: 55.7616, lng: 37.4158 },
      { lat: 55.7699, lng: 37.4166 },
      { lat: 55.7737, lng: 37.4279 },
      { lat: 55.7671, lng: 37.4378 },
      { lat: 55.7589, lng: 37.4302 },
      { lat: 55.7616, lng: 37.4158 },
    ],
  },
  {
    name: "arbat",
    label: "Арбат",
    center: { lat: 55.7522, lng: 37.5925 },
    accent: "#ff6b35",
    route: [
      { lat: 55.7528, lng: 37.5849 },
      { lat: 55.7556, lng: 37.5922 },
      { lat: 55.7529, lng: 37.6027 },
      { lat: 55.7486, lng: 37.6001 },
      { lat: 55.7478, lng: 37.5894 },
      { lat: 55.7528, lng: 37.5849 },
    ],
  },
  {
    name: "luzhniki",
    label: "Лужники",
    center: { lat: 55.7155, lng: 37.5535 },
    accent: "#ff4500",
    route: [
      { lat: 55.7182, lng: 37.5456 },
      { lat: 55.7198, lng: 37.5541 },
      { lat: 55.7171, lng: 37.5632 },
      { lat: 55.7124, lng: 37.5614 },
      { lat: 55.7108, lng: 37.5518 },
      { lat: 55.7138, lng: 37.5462 },
      { lat: 55.7182, lng: 37.5456 },
    ],
  },
  {
    name: "fili",
    label: "Фили",
    center: { lat: 55.7485, lng: 37.4812 },
    accent: "#e8590c",
    route: [
      { lat: 55.7512, lng: 37.4732 },
      { lat: 55.7538, lng: 37.4824 },
      { lat: 55.7502, lng: 37.4928 },
      { lat: 55.7452, lng: 37.4898 },
      { lat: 55.7438, lng: 37.4786 },
      { lat: 55.7512, lng: 37.4732 },
    ],
  },
  {
    name: "kolomenskoye",
    label: "Коломенское",
    center: { lat: 55.6692, lng: 37.6708 },
    accent: "#d97706",
    route: [
      { lat: 55.6728, lng: 37.6632 },
      { lat: 55.6752, lng: 37.6728 },
      { lat: 55.6714, lng: 37.6818 },
      { lat: 55.6648, lng: 37.6784 },
      { lat: 55.6636, lng: 37.6678 },
      { lat: 55.6728, lng: 37.6632 },
    ],
  },
  {
    name: "tsaritsyno",
    label: "Царицыно",
    center: { lat: 55.6162, lng: 37.6868 },
    accent: "#c2410c",
    route: [
      { lat: 55.6192, lng: 37.6798 },
      { lat: 55.6218, lng: 37.6884 },
      { lat: 55.6182, lng: 37.6962 },
      { lat: 55.6128, lng: 37.6932 },
      { lat: 55.6112, lng: 37.6838 },
      { lat: 55.6192, lng: 37.6798 },
    ],
  },
  {
    name: "ostankino",
    label: "Останкино",
    center: { lat: 55.8228, lng: 37.6118 },
    accent: "#fb8c00",
    route: [
      { lat: 55.8258, lng: 37.6052 },
      { lat: 55.8281, lng: 37.6138 },
      { lat: 55.8248, lng: 37.6212 },
      { lat: 55.8192, lng: 37.6178 },
      { lat: 55.8188, lng: 37.6088 },
      { lat: 55.8258, lng: 37.6052 },
    ],
  },
  {
    name: "neskuchny",
    label: "Нескучный сад",
    center: { lat: 55.7198, lng: 37.5912 },
    accent: "#ff7043",
    route: [
      { lat: 55.7228, lng: 37.5862 },
      { lat: 55.7242, lng: 37.5938 },
      { lat: 55.7208, lng: 37.5992 },
      { lat: 55.7168, lng: 37.5958 },
      { lat: 55.7162, lng: 37.5878 },
      { lat: 55.7228, lng: 37.5862 },
    ],
  },
  {
    name: "pokrovskoe",
    label: "Покровское-Стрешнево",
    center: { lat: 55.8082, lng: 37.4742 },
    accent: "#ef6c00",
    route: [
      { lat: 55.8112, lng: 37.4668 },
      { lat: 55.8142, lng: 37.4762 },
      { lat: 55.8108, lng: 37.4848 },
      { lat: 55.8048, lng: 37.4818 },
      { lat: 55.8038, lng: 37.4712 },
      { lat: 55.8112, lng: 37.4668 },
    ],
  },
  {
    name: "bitsevsky",
    label: "Битцевский парк",
    center: { lat: 55.6012, lng: 37.5632 },
    accent: "#e65100",
    route: [
      { lat: 55.6048, lng: 37.5558 },
      { lat: 55.6078, lng: 37.5652 },
      { lat: 55.6042, lng: 37.5742 },
      { lat: 55.5972, lng: 37.5708 },
      { lat: 55.5962, lng: 37.5598 },
      { lat: 55.6048, lng: 37.5558 },
    ],
  },
];

export function getDistrict(value: string) {
  return MOSCOW_DISTRICTS.find((d) => d.name === value || d.label === value) ?? MOSCOW_DISTRICTS[0];
}

/**
 * Interpolate N evenly-spaced points along a polyline segment.
 */
function interpolateSegment(a: GeoPoint, b: GeoPoint, steps: number): GeoPoint[] {
  const pts: GeoPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push({ lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t });
  }
  return pts;
}

/**
 * Densely interpolate a route so every segment has at least one point per ~50 m.
 */
function densifyRoute(points: GeoPoint[]): GeoPoint[] {
  if (points.length < 2) return points;
  const result: GeoPoint[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const segKm = routeDistanceKm([points[i], points[i + 1]]);
    const steps = Math.max(4, Math.ceil(segKm / 0.05)); // one point each ~50m
    const seg = interpolateSegment(points[i], points[i + 1], steps);
    if (i === 0) result.push(...seg);
    else result.push(...seg.slice(1)); // avoid duplicating shared endpoints
  }
  return result;
}

/**
 * Simple seeded pseudo-random based on index for deterministic organic noise.
 */
function seededNoise(seed: number): number {
  // Simple LCG hash — deterministic, no external deps
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x); // 0..1
}

/**
 * Generate a realistic running route that matches targetKm.
 *
 * Strategy:
 * - Densely interpolate the base preset route (many waypoints).
 * - Compute the cumulative distance along it.
 * - Walk only as many points as needed to reach targetKm (partial traversal).
 *   For distances larger than the base loop, loop the route.
 * - Apply small organic noise so it never looks like a clean geometric shape.
 */
export function scaleRouteToDistance(points: GeoPoint[], targetKm: number): GeoPoint[] {
  if (points.length < 2) return points;

  // Densify base route and close the loop
  const closed = [...points];
  if (closed[0].lat !== closed[closed.length - 1].lat || closed[0].lng !== closed[closed.length - 1].lng) {
    closed.push(closed[0]); // close the polygon
  }
  const dense = densifyRoute(closed);

  // Build cumulative distance table
  const cumDist: number[] = [0];
  for (let i = 1; i < dense.length; i++) {
    cumDist.push(cumDist[i - 1] + routeDistanceKm([dense[i - 1], dense[i]]));
  }
  const loopKm = cumDist[cumDist.length - 1] || 1;

  // How many full loops + remainder
  const fullLoops = Math.floor(targetKm / loopKm);
  const remainder = targetKm - fullLoops * loopKm;

  // Collect required points
  const collected: GeoPoint[] = [];
  for (let loop = 0; loop <= fullLoops; loop++) {
    const maxDist = loop < fullLoops ? loopKm : remainder;
    for (let i = 0; i < dense.length; i++) {
      if (cumDist[i] > maxDist + 0.001) break;
      collected.push(dense[i]);
    }
  }

  if (collected.length < 2) return points;

  // Apply small organic noise — amplitude ~15-25 m, seeded per index so it's stable
  const noiseMagnitude = 0.00012; // ~13 m in lat/lng degrees
  const result: GeoPoint[] = collected.map((p, i) => {
    // Two independent noise channels for lat / lng
    const nLat = (seededNoise(i * 3 + 1) - 0.5) * 2 * noiseMagnitude;
    const nLng = (seededNoise(i * 3 + 2) - 0.5) * 2 * noiseMagnitude * 1.6; // lng degree is narrower near Moscow
    // Smooth the noise with a sine envelope so start/end are clean
    const envelope = Math.sin((Math.PI * i) / collected.length);
    return {
      lat: p.lat + nLat * envelope,
      lng: p.lng + nLng * envelope,
    };
  });

  // Thin the result to ~150 points max to keep rendering fast
  const maxPts = 150;
  if (result.length <= maxPts) return result;
  const step = result.length / maxPts;
  const thinned: GeoPoint[] = [];
  for (let i = 0; i < maxPts; i++) {
    thinned.push(result[Math.round(i * step)]);
  }
  thinned.push(result[result.length - 1]); // always keep last point
  return thinned;
}

/**
 * Nudge a preset route based on workout duration.
 * Estimates distance from duration (approx 10 km/h) and scales the route.
 */
export function nudgePresetRoute(points: GeoPoint[], durationMinutes: number): GeoPoint[] {
  const estimatedKm = (durationMinutes / 60) * 10; // ~10 km/h average running speed
  return scaleRouteToDistance(points, estimatedKm);
}

