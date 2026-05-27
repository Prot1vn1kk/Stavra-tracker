"use client";

import { Activity, Heart, MessageCircle, Share2 } from "lucide-react";
import { formatDuration, formatPace } from "@/lib/metrics";
import { GeoPoint, getDistrict } from "@/lib/moscowRoutes";
import { RealMap } from "./RealMap";

export type ReportRun = {
  id: string;
  title: string;
  activityDate: string | Date;
  startTime: string;
  durationMinutes: number;
  district: string;
  distanceKm: number;
  paceSecondsKm: number;
  calories: number;
  source: "MANUAL" | "PLANNED" | "RECORDED";
  isPublic: boolean;
  note?: string | null;
  user?: { name: string };
  route?: { source: string; polyline: GeoPoint[] | unknown } | null;
};

const SOURCE_LABELS: Record<ReportRun["source"], string> = {
  MANUAL: "Manual Entry",
  PLANNED: "Planned",
  RECORDED: "GPS Recorded",
};

function dateLabel(value: string | Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date(value));
}

function asPoints(value: GeoPoint[] | unknown): GeoPoint[] {
  if (!Array.isArray(value)) return [];
  return value.filter((p): p is GeoPoint =>
    typeof p === "object" && p !== null && "lat" in p && "lng" in p
  );
}

export function RunReport({ run }: { run: ReportRun }) {
  const district = getDistrict(run.district);
  const points = asPoints(run.route?.polyline);
  const userName = run.user?.name ?? "Спортсмен";
  const initial = userName[0].toUpperCase();

  return (
    <article className="report">
      {/* Header: user */}
      <div className="report__header">
        <div className="report__avatar">{initial}</div>
        <div className="report__meta">
          <strong>{userName}</strong>
          <span>{dateLabel(run.activityDate)} · {run.startTime}</span>
        </div>
      </div>

      {/* Title */}
      <h2 className="report__title">{run.title}</h2>
      {run.note && <p className="report__note">{run.note}</p>}

      {/* Map */}
      <div className="report__map">
        <RealMap district={run.district} points={points} accent="#FC5200" darkTiles />
        <div className="report__map-overlay">
          <span className="report__badge">
            <Activity size={14} />
            STAVRA
          </span>
          <span className="report__source-tag">{SOURCE_LABELS[run.source]}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="report__stats">
        <div className="report__stat">
          <span className="report__stat-label">Дистанция</span>
          <span className="report__stat-value">{run.distanceKm.toFixed(2)}</span>
          <span className="report__stat-unit">км</span>
        </div>
        <div className="report__stat">
          <span className="report__stat-label">Средний темп</span>
          <span className="report__stat-value">{formatPace(run.paceSecondsKm)}</span>
          <span className="report__stat-unit">/км</span>
        </div>
        <div className="report__stat">
          <span className="report__stat-label">Время</span>
          <span className="report__stat-value">{formatDuration(run.durationMinutes)}</span>
          <span className="report__stat-unit">ч мин</span>
        </div>
        <div className="report__stat">
          <span className="report__stat-label">Калории</span>
          <span className="report__stat-value">{run.calories}</span>
          <span className="report__stat-unit">ккал</span>
        </div>
        <div className="report__stat">
          <span className="report__stat-label">Средний пульс</span>
          <span className="report__stat-value">{Math.round(130 + (1000 / (run.paceSecondsKm || 300)) * 20)}</span>
          <span className="report__stat-unit">уд/мин</span>
        </div>
        <div className="report__stat">
          <span className="report__stat-label">Набор высоты</span>
          <span className="report__stat-value">{Math.round(run.distanceKm * 12)}</span>
          <span className="report__stat-unit">м</span>
        </div>
      </div>

      {/* Social footer */}
      <div className="report__footer">
        <button className="report__action" type="button">
          <Heart size={18} />
          <span>Kudos</span>
        </button>
        <button className="report__action" type="button">
          <MessageCircle size={18} />
          <span>Комментарий</span>
        </button>
        <button className="report__share" type="button">
          <Share2 size={18} />
        </button>
      </div>
    </article>
  );
}
