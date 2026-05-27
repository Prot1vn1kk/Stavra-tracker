"use client";

import type { LatLngExpression, LayerGroup, Map as LeafletMap } from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import { GeoPoint, getDistrict } from "@/lib/moscowRoutes";
import { fetchStreetRoute } from "@/lib/routing";

export type RealMapProps = {
  district: string;
  points: GeoPoint[];
  accent?: string;
  interactive?: boolean;
  darkTiles?: boolean;
  onAddPoint?: (point: GeoPoint) => void;
};

function toLatLng(p: GeoPoint): LatLngExpression {
  return [p.lat, p.lng];
}

export function RealMap({ district, points, accent, interactive, darkTiles = true, onAddPoint }: RealMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const routeLayerRef = useRef<LayerGroup | null>(null);
  const waypointLayerRef = useRef<LayerGroup | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const onAddPointRef = useRef(onAddPoint);
  const interactiveRef = useRef(interactive);
  const [mapReady, setMapReady] = useState(false);
  const [routedPoints, setRoutedPoints] = useState<GeoPoint[]>([]);
  const [fetching, setFetching] = useState(false);

  const preset = useMemo(() => getDistrict(district), [district]);
  const color = accent ?? "#FC5200";

  // Stable key for points dependency instead of JSON.stringify
  const pointsKey = useMemo(
    () => points.map(p => `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`).join("|"),
    [points]
  );

  // Keep refs in sync
  useEffect(() => {
    onAddPointRef.current = onAddPoint;
    interactiveRef.current = interactive;
  }, [onAddPoint, interactive]);

  // Toggle dragging/scroll when interactive prop changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (interactive) {
      map.dragging.enable();
      map.scrollWheelZoom.enable();
      map.touchZoom.enable();
    } else {
      map.dragging.disable();
      map.scrollWheelZoom.disable();
      map.touchZoom.disable();
    }
    window.setTimeout(() => map.invalidateSize(), 60);
  }, [interactive]);

  // Fetch OSRM street route whenever points or district change
  useEffect(() => {
    let cancelled = false;
    const rawPoints = points.length >= 2 ? points : preset.route;

    async function getRoute() {
      setFetching(true);
      try {
        const routed = await fetchStreetRoute(rawPoints);
        if (!cancelled) setRoutedPoints(routed);
      } catch {
        if (!cancelled) setRoutedPoints(rawPoints);
      } finally {
        if (!cancelled) setFetching(false);
      }
    }

    void getRoute();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointsKey, district]);

  // ─── Initialize Leaflet map once ─────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];

    async function setup() {
      if (!containerRef.current || mapRef.current) return;
      const L = await import("leaflet");
      if (cancelled || !containerRef.current) return;

      leafletRef.current = L;

      const map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        dragging: false,
        touchZoom: false,
        doubleClickZoom: false,
      }).setView([preset.center.lat, preset.center.lng], 14);

      const tileUrl = darkTiles
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

      const tileLayer = L.tileLayer(tileUrl, { maxZoom: 19 });
      tileLayer.addTo(map);

      // Enable interaction if needed at init time
      if (interactive) {
        L.control.zoom({ position: "bottomright" }).addTo(map);
        map.dragging.enable();
        map.scrollWheelZoom.enable();
        map.touchZoom.enable();
      }

      // Click → add waypoint
      map.on("click", (e) => {
        if (!interactiveRef.current || !onAddPointRef.current) return;
        onAddPointRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
      });

      routeLayerRef.current = L.layerGroup().addTo(map);
      waypointLayerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;

      // Staggered invalidateSize to ensure tiles render in scrolled containers
      [80, 250, 600, 1200].forEach((ms) => {
        timers.push(
          window.setTimeout(() => {
            if (!cancelled) map.invalidateSize();
          }, ms)
        );
      });

      // Mark ready after first invalidation
      timers.push(
        window.setTimeout(() => {
          if (!cancelled) setMapReady(true);
        }, 120)
      );
    }

    void setup();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── ResizeObserver — fixes blank maps in hidden/scrolled containers ─────
  useEffect(() => {
    const el = containerRef.current;
    const map = mapRef.current;
    if (!el || !map) return;

    const ro = new ResizeObserver(() => {
      map.invalidateSize();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [mapReady]);

  // ─── Draw routed polyline ────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    const routeLayer = routeLayerRef.current;
    const L = leafletRef.current;
    if (!map || !routeLayer || !L || !mapReady || routedPoints.length < 2) return;

    routeLayer.clearLayers();
    const latLngs = routedPoints.map(toLatLng);

    // Glow
    L.polyline(latLngs, { color, weight: 14, opacity: 0.18, lineCap: "round", lineJoin: "round" }).addTo(routeLayer);
    // Main track
    L.polyline(latLngs, { color, weight: 5, opacity: 1, lineCap: "round", lineJoin: "round" }).addTo(routeLayer);

    // Start marker
    L.circleMarker(toLatLng(routedPoints[0]), {
      radius: 7, color: "#22c55e", weight: 3, fillColor: "#fff", fillOpacity: 1,
    }).addTo(routeLayer);

    // Finish marker
    L.circleMarker(toLatLng(routedPoints[routedPoints.length - 1]), {
      radius: 6, color, weight: 3, fillColor: "#1C1C1E", fillOpacity: 1,
    }).addTo(routeLayer);

    // Fit bounds with delay
    const bounds = L.polyline(latLngs).getBounds();
    const fitTimer = window.setTimeout(() => {
      map.invalidateSize();
      map.fitBounds(bounds, { padding: [24, 24], maxZoom: 16, animate: false });
    }, 150);

    return () => clearTimeout(fitTimer);
  }, [routedPoints, color, mapReady]);

  // ─── Draw numbered waypoint markers (interactive mode) ───────────────────
  useEffect(() => {
    const wpLayer = waypointLayerRef.current;
    const L = leafletRef.current;
    if (!wpLayer || !mapReady) return;
    if (!interactive || !L) { wpLayer?.clearLayers(); return; }

    wpLayer.clearLayers();
    points.forEach((p, i) => {
      const isFirst = i === 0;
      const isLast = i === points.length - 1 && points.length > 1;
      L.circleMarker(toLatLng(p), {
        radius: 9,
        color: isFirst ? "#22c55e" : isLast ? color : "#ffffff",
        weight: 2.5,
        fillColor: "#131315",
        fillOpacity: 0.9,
      })
        .bindTooltip(`${i + 1}`, { permanent: true, direction: "center", className: "wp-label" })
        .addTo(wpLayer);
    });
  }, [points, color, mapReady, interactive]);

  return (
    <div
      ref={containerRef}
      className={`real-map${interactive ? " real-map--interactive" : ""}`}
      aria-label={`Маршрут: ${preset.label}`}
      role="img"
    >
      {fetching && (
        <div className="map-loading">
          <span className="map-loading__dot" />
          <span className="map-loading__dot" />
          <span className="map-loading__dot" />
        </div>
      )}
    </div>
  );
}
