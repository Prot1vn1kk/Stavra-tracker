"use client";

import type { MouseEvent } from "react";
import { GeoPoint, getDistrict } from "@/lib/moscowRoutes";

function pointFromCanvas(districtName: string, x: number, y: number) {
  const district = getDistrict(districtName);
  const latSpan = 0.035;
  const lngSpan = 0.055;
  return {
    lat: district.center.lat + (0.5 - y) * latSpan,
    lng: district.center.lng + (x - 0.5) * lngSpan,
  };
}

type RouteCanvasProps = {
  district: string;
  points: GeoPoint[];
  accent?: string;
  interactive?: boolean;
  onAddPoint?: (point: GeoPoint) => void;
};

function getBounds(points: GeoPoint[], district: string) {
  const fallback = getDistrict(district);
  const source = points.length ? points : fallback.route;
  const lats = source.map((point) => point.lat);
  const lngs = source.map((point) => point.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latPad = Math.max(0.004, (maxLat - minLat) * 0.25);
  const lngPad = Math.max(0.004, (maxLng - minLng) * 0.25);

  return {
    minLat: minLat - latPad,
    maxLat: maxLat + latPad,
    minLng: minLng - lngPad,
    maxLng: maxLng + lngPad
  };
}

function project(point: GeoPoint, bounds: ReturnType<typeof getBounds>) {
  const x = ((point.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 300 + 10;
  const y = (1 - (point.lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 220 + 10;
  return { x, y };
}

export function RouteCanvas({ district, points, accent, interactive, onAddPoint }: RouteCanvasProps) {
  const preset = getDistrict(district);
  const routePoints = points.length ? points : preset.route;
  const bounds = getBounds(routePoints, district);
  const projected = routePoints.map((point) => project(point, bounds));
  const path = projected.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
  const color = accent ?? preset.accent;

  function handleClick(event: MouseEvent<SVGSVGElement>) {
    if (!interactive || !onAddPoint) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    onAddPoint(pointFromCanvas(district, x, y));
  }

  return (
    <svg
      className={interactive ? "route-canvas route-canvas--interactive" : "route-canvas"}
      viewBox="0 0 320 240"
      role="img"
      aria-label={`Маршрут: ${preset.label}`}
      onClick={handleClick}
    >
      <rect x="0" y="0" width="320" height="240" rx="8" fill="#eef2f1" />
      <path d="M-20 58 C 62 30, 122 84, 180 52 S 280 42, 340 76" stroke="#c7ded9" strokeWidth="24" fill="none" opacity="0.6" />
      <path d="M18 198 C 92 176, 128 214, 192 186 S 260 150, 324 166" stroke="#b8d6c5" strokeWidth="28" fill="none" opacity="0.5" />
      {Array.from({ length: 7 }).map((_, index) => (
        <path
          key={`street-x-${index}`}
          d={`M ${-15 + index * 55} 0 L ${45 + index * 55} 240`}
          stroke="#ffffff"
          strokeWidth="3"
          opacity="0.72"
        />
      ))}
      {Array.from({ length: 5 }).map((_, index) => (
        <path
          key={`street-y-${index}`}
          d={`M 0 ${34 + index * 42} C 78 ${18 + index * 40}, 168 ${62 + index * 28}, 320 ${30 + index * 44}`}
          stroke="#ffffff"
          strokeWidth="2.5"
          opacity="0.62"
        />
      ))}
      <path d={path} fill="none" stroke="#111827" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.18" />
      <path d={path} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      {projected.map((point, index) => (
        <g key={`${point.x}-${point.y}-${index}`}>
          <circle cx={point.x} cy={point.y} r={index === 0 ? 7 : 5} fill="#ffffff" stroke={color} strokeWidth="3" />
          {index === routePoints.length - 1 && routePoints.length > 2 ? <circle cx={point.x} cy={point.y} r="2" fill="#111827" /> : null}
        </g>
      ))}
    </svg>
  );
}
