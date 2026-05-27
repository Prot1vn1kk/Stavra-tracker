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
 * Scale preset route polygon around its centroid to match targetKm.
 * Adds slight wobble per vertex to look natural.
 */
export function scaleRouteToDistance(points: GeoPoint[], targetKm: number): GeoPoint[] {
  if (points.length < 2) return points;
  const currentKm = routeDistanceKm(points) || 1;
  const factor = targetKm / currentKm;

  const center = points.reduce(
    (acc, p) => ({ lat: acc.lat + p.lat / points.length, lng: acc.lng + p.lng / points.length }),
    { lat: 0, lng: 0 }
  );

  return points.map((p, i) => {
    const wobble = Math.sin(i * 2.094) * 0.0005 * factor;
    return {
      lat: center.lat + (p.lat - center.lat) * factor + wobble,
      lng: center.lng + (p.lng - center.lng) * factor - wobble,
    };
  });
}

/**
 * Nudge a preset route based on workout duration.
 * Estimates distance from duration (approx 10 km/h) and scales the route.
 */
export function nudgePresetRoute(points: GeoPoint[], durationMinutes: number): GeoPoint[] {
  const estimatedKm = (durationMinutes / 60) * 10; // ~10 km/h average running speed
  return scaleRouteToDistance(points, estimatedKm);
}

