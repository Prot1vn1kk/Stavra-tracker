import { GeoPoint } from "./moscowRoutes";

const EARTH_RADIUS_KM = 6371;

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

export function distanceBetweenKm(a: GeoPoint, b: GeoPoint) {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function routeDistanceKm(points: GeoPoint[]) {
  if (points.length < 2) return 0;
  return points.slice(1).reduce((total, point, index) => {
    return total + distanceBetweenKm(points[index], point);
  }, 0);
}

export function paceSecondsPerKm(durationMinutes: number, distanceKm: number) {
  if (distanceKm <= 0) return 0;
  return Math.round((durationMinutes * 60) / distanceKm);
}

export function durationFromPaceAndDistance(paceSecondsKm: number, distanceKm: number) {
  return Math.round((paceSecondsKm * distanceKm) / 60);
}

export function distanceFromPaceAndDuration(paceSecondsKm: number, durationMinutes: number) {
  if (paceSecondsKm <= 0) return 0;
  return Math.round(((durationMinutes * 60) / paceSecondsKm) * 100) / 100;
}

export function estimateCalories(weightKg: number, durationMinutes: number, distanceKm: number) {
  const hours = durationMinutes / 60;
  const speedKmh = hours > 0 ? distanceKm / hours : 0;
  const met = speedKmh < 6 ? 4.3 : speedKmh < 8 ? 7 : speedKmh < 10 ? 9.8 : 11.5;
  return Math.max(1, Math.round(met * weightKg * hours));
}

export function formatPace(seconds: number) {
  if (!seconds) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatDuration(minutes: number) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hrs) return `${mins} мин`;
  return `${hrs} ч ${mins.toString().padStart(2, "0")} мин`;
}

/**
 * Parse a pace string like "5:30" or "530" into seconds per km.
 * Returns 0 if invalid.
 */
export function parsePaceStr(value: string): number {
  const trimmed = value.trim();
  // Format "M:SS" or "MM:SS"
  const colonMatch = trimmed.match(/^(\d{1,2}):(\d{0,2})$/);
  if (colonMatch) {
    const mins = parseInt(colonMatch[1], 10);
    const secs = parseInt(colonMatch[2] || "0", 10);
    if (mins >= 2 && mins <= 15 && secs >= 0 && secs <= 59) return mins * 60 + secs;
  }
  // Plain number treated as minutes
  const num = parseFloat(trimmed.replace(",", "."));
  if (!isNaN(num) && num >= 2 && num <= 15) return Math.round(num * 60);
  return 0;
}

/**
 * Format pace seconds as "M:SS"
 */
export function paceToStr(seconds: number): string {
  if (!seconds) return "";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
