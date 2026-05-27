"use client";

import {
  Activity, CalendarDays, Check, Clock3, CloudUpload, Database,
  Filter, ListRestart, LogIn, LogOut, MapPin, MousePointer2, Plus, RotateCcw, Ruler, Zap
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  distanceFromPaceAndDuration,
  durationFromPaceAndDistance,
  estimateCalories,
  formatDuration,
  formatPace,
  paceSecondsPerKm,
  paceToStr,
  parsePaceStr,
  routeDistanceKm,
} from "@/lib/metrics";
import { GeoPoint, getDistrict, MOSCOW_DISTRICTS, scaleRouteToDistance } from "@/lib/moscowRoutes";
import { RealMap } from "./RealMap";
import { ReportRun, RunReport } from "./RunReport";

// ─── Types ───────────────────────────────────────────────────────────────────
type User = { id: string; name: string; email: string; weightKg: number };
type RunRecord = ReportRun & {
  storage?: "local" | "cloud";
  route?: { source: string; points?: GeoPoint[] | unknown; polyline: GeoPoint[] | unknown } | null;
};

// ─── Triplet lock — which field was last edited by user
type TripletLock = "distance" | "pace" | "duration";

// ─── Constants ────────────────────────────────────────────────────────────────
const LOCAL_RUNS_KEY = "stavra.localRuns";
const DEFAULT_PACE_STR = "6:00"; // 6 min/km default

// ─── Helpers ─────────────────────────────────────────────────────────────────
function todayStr() { return new Date().toISOString().slice(0, 10); }
function defaultStartTime() {
  const d = new Date(); d.setMinutes(0, 0, 0);
  return d.toTimeString().slice(0, 5);
}
function safeJson(s: string) { try { return JSON.parse(s); } catch { return {}; } }
function toDateStr(v: string | Date) { return new Date(v).toISOString().slice(0, 10); }

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const ctrl = new AbortController();
  const t = window.setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(url, {
      ...options,
      signal: ctrl.signal,
      headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    });
    const text = await res.text();
    const data = (text ? safeJson(text) : {}) as T & { error?: string };
    if (!res.ok) throw new Error((data as { error?: string }).error || "Ошибка сервера.");
    return data;
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError")
      throw new Error("Сервер не отвечает. Работаем в гостевом режиме.");
    throw e;
  } finally { window.clearTimeout(t); }
}

function readLocalRuns(): RunRecord[] {
  if (typeof window === "undefined") return [];
  const s = window.localStorage.getItem(LOCAL_RUNS_KEY);
  if (!s) return [];
  const p = safeJson(s);
  return Array.isArray(p) ? p : [];
}
function writeLocalRuns(runs: RunRecord[]) {
  window.localStorage.setItem(LOCAL_RUNS_KEY, JSON.stringify(runs));
}

function filterRuns(runs: RunRecord[], f: { month: string; district: string }) {
  return runs
    .filter(r => {
      const m = !f.month || toDateStr(r.activityDate).startsWith(f.month);
      const d = !f.district || r.district === f.district;
      return m && d;
    })
    .sort((a, b) => new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime());
}

// ─── Component ────────────────────────────────────────────────────────────────
export function StavraApp() {
  // Auth
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [authOpen, setAuthOpen] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "", weightKg: 70 });

  // Runs
  const [cloudRuns, setCloudRuns] = useState<RunRecord[]>([]);
  const [localRuns, setLocalRuns] = useState<RunRecord[]>([]);
  const [selectedRun, setSelectedRun] = useState<RunRecord | null>(null);

  // UI state
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");
  const [filters, setFilters] = useState({ month: "", district: "" });
  const [loading, setLoading] = useState(true);
  const messageTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Auto-dismiss message helper
  function showMessage(text: string, timeoutMs = 4000) {
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    setMessage(text);
    messageTimerRef.current = setTimeout(() => setMessage(""), timeoutMs);
  }

  // ── Form: basic fields
  const [activityDate, setActivityDate] = useState(todayStr);
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [district, setDistrict] = useState(MOSCOW_DISTRICTS[0].label);
  const [source, setSource] = useState<"MANUAL" | "PLANNED" | "RECORDED">("MANUAL");
  const [note, setNote] = useState("Ручная запись STAVRA для учебного журнала тренировок.");

  // ── Triplet: distance ↔ pace ↔ duration
  const [distanceKm, setDistanceKm] = useState(9.5);
  const [paceStr, setPaceStr] = useState(DEFAULT_PACE_STR);       // display string "6:00"
  const [durationMinutes, setDurationMinutes] = useState(90);      // minutes
  const lockRef = useRef<TripletLock>("duration");                  // which field drives recalc

  // ── Route
  const [routeMode, setRouteMode] = useState<"auto" | "points">("auto");
  const [manualPoints, setManualPoints] = useState<GeoPoint[]>([]);

  // Derived
  const selectedDistrict = useMemo(() => getDistrict(district), [district]);
  const autoScaledRoute = useMemo(
    () => scaleRouteToDistance(selectedDistrict.route, distanceKm),
    [selectedDistrict, distanceKm]
  );
  const previewPoints = useMemo(
    () => (routeMode === "points" && manualPoints.length >= 2 ? manualPoints : autoScaledRoute),
    [routeMode, manualPoints, autoScaledRoute]
  );

  const allRuns = useMemo(() => [...localRuns, ...cloudRuns], [localRuns, cloudRuns]);
  const visibleRuns = useMemo(() => filterRuns(allRuns, filters), [allRuns, filters]);
  const totalKm = useMemo(() => allRuns.reduce((s, r) => s + r.distanceKm, 0), [allRuns]);
  const totalCalories = useMemo(() => allRuns.reduce((s, r) => s + r.calories, 0), [allRuns]);

  // ─── Triplet recalculation ──────────────────────────────────────────────────
  function handleDistanceChange(raw: string) {
    const val = parseFloat(raw.replace(",", "."));
    if (isNaN(val) || val <= 0) return;
    const rounded = Math.round(val * 100) / 100;
    setDistanceKm(rounded);
    lockRef.current = "distance";
    // Recalc duration from pace
    const pace = parsePaceStr(paceStr);
    if (pace > 0) setDurationMinutes(durationFromPaceAndDistance(pace, rounded));
  }

  function handlePaceChange(raw: string) {
    setPaceStr(raw);
    lockRef.current = "pace";
    const pace = parsePaceStr(raw);
    if (pace <= 0) return;
    // Recalc duration from distance + new pace
    setDurationMinutes(durationFromPaceAndDistance(pace, distanceKm));
  }

  function handlePaceBlur() {
    const pace = parsePaceStr(paceStr);
    if (pace > 0) setPaceStr(paceToStr(pace));
  }

  function handleDurationChange(raw: number) {
    setDurationMinutes(raw);
    lockRef.current = "duration";
    // Recalc distance from pace + new duration
    const pace = parsePaceStr(paceStr);
    if (pace > 0) {
      const newDist = distanceFromPaceAndDuration(pace, raw);
      if (newDist > 0) setDistanceKm(newDist);
    }
  }

  // ─── Bootstrap ────────────────────────────────────────────────────────────
  useEffect(() => {
    const stored = readLocalRuns();
    setLocalRuns(stored);
    setSelectedRun(stored[0] ?? null);
    void loadSession();
  }, []);

  useEffect(() => { if (user) void loadCloudRuns(); else setCloudRuns([]); }, [user]);

  useEffect(() => {
    if (selectedRun && visibleRuns.some(r => r.id === selectedRun.id)) return;
    setSelectedRun(visibleRuns[0] ?? null);
  }, [selectedRun, visibleRuns]);

  function saveLocalRuns(next: RunRecord[]) { setLocalRuns(next); writeLocalRuns(next); }

  // ─── API calls ────────────────────────────────────────────────────────────
  async function loadSession() {
    try {
      const d = await api<{ user: User }>("/api/auth/me");
      setUser(d.user);
    } catch { setUser(null); }
    finally { setLoading(false); }
  }

  async function loadCloudRuns() {
    try {
      const d = await api<{ runs: RunRecord[] }>("/api/runs");
      setCloudRuns(d.runs.map(r => ({ ...r, storage: "cloud" as const })));
    } catch (e) { showMessage(e instanceof Error ? e.message : "Ошибка загрузки."); }
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setAuthError("");
    try {
      const endpoint = authMode === "register" ? "/api/auth/register" : "/api/auth/login";
      const d = await api<{ user: User }>(endpoint, { method: "POST", body: JSON.stringify(authForm) });
      setUser(d.user); setAuthOpen(false);
      showMessage(`Добро пожаловать, ${d.user.name}!`);
    } catch (e) { setAuthError(e instanceof Error ? e.message : "Ошибка входа."); }
  }

  async function handleLogout() {
    try { await api<{ ok: boolean }>("/api/auth/logout", { method: "POST", body: "{}" }); } catch { /* ok */ }
    setUser(null); setCloudRuns([]);
  }

  // ─── Create run ───────────────────────────────────────────────────────────
  function buildLocalRun(): RunRecord {
    const polyline = routeMode === "points" && manualPoints.length >= 2
      ? manualPoints
      : autoScaledRoute;
    const finalDistKm = routeMode === "points" && manualPoints.length >= 2
      ? Math.round(routeDistanceKm(manualPoints) * 100) / 100
      : distanceKm;
    const pace = parsePaceStr(paceStr);
    const finalPace = pace > 0 ? pace : paceSecondsPerKm(durationMinutes, finalDistKm);
    const weight = user?.weightKg ?? authForm.weightKg ?? 70;

    return {
      id: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: `STAVRA ${selectedDistrict.label}`,
      activityDate: `${activityDate}T00:00:00.000Z`,
      startTime,
      durationMinutes,
      district: selectedDistrict.label,
      distanceKm: finalDistKm,
      paceSecondsKm: finalPace,
      calories: estimateCalories(weight, durationMinutes, finalDistKm),
      source,
      isPublic: false,
      note: note.trim() || null,
      storage: "local",
      route: {
        source: routeMode === "points" ? "MANUAL_POINTS" : "SCALED_PRESET",
        points: polyline,
        polyline,
      },
    };
  }

  async function handleCreateRun(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage("");
    if (!user) {
      const run = buildLocalRun();
      saveLocalRuns([run, ...localRuns]); setSelectedRun(run);
      showMessage("Тренировка создана локально."); setSaving(false); return;
    }
    try {
      const polyline = routeMode === "points" && manualPoints.length >= 2 ? manualPoints : autoScaledRoute;
      const d = await api<{ run: RunRecord }>("/api/runs", {
        method: "POST",
        body: JSON.stringify({
          activityDate, startTime, durationMinutes, district, source,
          isPublic: true, note,
          manualPoints: routeMode === "points" ? manualPoints : polyline,
          preferExternalRouting: true,
        }),
      });
      const saved = { ...d.run, storage: "cloud" as const };
      setCloudRuns(c => [saved, ...c]); setSelectedRun(saved); showMessage("Сохранено в профиль.");
    } catch (e) {
      const run = buildLocalRun();
      saveLocalRuns([run, ...localRuns]); setSelectedRun(run);
      showMessage((e instanceof Error ? e.message : "Ошибка.") + " Сохранено локально.");
    } finally { setSaving(false); }
  }

  async function handleSync() {
    if (!user || !localRuns.length) return;
    setSyncing(true); setMessage("");
    try {
      const results = await Promise.all(
        localRuns.map(r => {
          const poly = Array.isArray((r.route as { polyline?: unknown })?.polyline)
            ? (r.route as { polyline: GeoPoint[] }).polyline
            : [];
          return api<{ run: RunRecord }>("/api/runs", {
            method: "POST",
            body: JSON.stringify({
              activityDate: toDateStr(r.activityDate), startTime: r.startTime,
              durationMinutes: r.durationMinutes, district: r.district,
              source: r.source, isPublic: false, note: r.note, manualPoints: poly,
              preferExternalRouting: false,
            }),
          }).then(d => ({ ...d.run, storage: "cloud" as const }));
        })
      );
      saveLocalRuns([]); setCloudRuns(c => [...results, ...c]);
      showMessage("История перенесена в профиль.");
    } catch (e) { showMessage(e instanceof Error ? e.message : "Ошибка синхронизации."); }
    finally { setSyncing(false); }
  }

  const handleAddPoint = useCallback((p: GeoPoint) => {
    setManualPoints(prev => [...prev, p]);
  }, []);

  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <main className="app-shell">
      {/* ── Topbar ── */}
      <header className="topbar">
        <div className="topbar__left">
          <div className="topbar__brand"><Activity size={20} />STAVRA</div>
        </div>
        <div className="topbar__right">
          {user ? (
            <>
              <div className="topbar__avatar" title={user.name}>{user.name[0].toUpperCase()}</div>
              <button className="icon-button" type="button" onClick={handleLogout} title="Выйти"><LogOut size={18} /></button>
            </>
          ) : (
            <button className="topbar__btn" type="button" onClick={() => setAuthOpen(true)}>
              <LogIn size={14} style={{ display: "inline", marginRight: 4 }} />Войти
            </button>
          )}
        </div>
      </header>

      {/* ── Banners ── */}
      {!user && (
        <div className="guest-banner">
          <Database size={16} />
          <span>Гостевой режим — данные хранятся в браузере</span>
          <button type="button" onClick={() => setAuthOpen(true)}>Создать профиль</button>
        </div>
      )}
      {user && localRuns.length > 0 && (
        <div className="guest-banner">
          <CloudUpload size={16} />
          <span>{localRuns.length} локальных записей ожидают переноса</span>
          <button type="button" onClick={handleSync} disabled={syncing}>{syncing ? "Переношу…" : "Перенести"}</button>
        </div>
      )}

      {/* ── Auth modal ── */}
      {authOpen && !user && (
        <div className="auth-overlay" onClick={e => { if (e.target === e.currentTarget) setAuthOpen(false); }}>
          <div className="auth-panel">
            <h2>{authMode === "register" ? "Создать аккаунт" : "Войти"}</h2>
            <div className="segmented">
              <button type="button" className={authMode === "register" ? "active" : ""} onClick={() => setAuthMode("register")}><Plus size={14} />Регистрация</button>
              <button type="button" className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")}>Вход</button>
            </div>
            <form className="auth-form" onSubmit={handleAuth}>
              {authMode === "register" && <label>Имя<input value={authForm.name} onChange={e => setAuthForm({ ...authForm, name: e.target.value })} required /></label>}
              <label>Email<input type="email" value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} required /></label>
              <label>Пароль<input type="password" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} minLength={6} required /></label>
              {authMode === "register" && <label>Вес (кг)<input type="number" min="35" max="180" value={authForm.weightKg} onChange={e => setAuthForm({ ...authForm, weightKg: Number(e.target.value) })} /></label>}
              {authError && <p className="form-error">{authError}</p>}
              <button className="primary-action" type="submit"><Check size={16} />{authMode === "register" ? "Создать" : "Войти"}</button>
            </form>
          </div>
        </div>
      )}

      {/* ── Workspace ── */}
      <section className="workspace">

        {/* ── LEFT: Sidebar ── */}
        <aside className="sidebar">
          {/* Profile card */}
          <div className="panel">
            <div className="profile-card">
              <div className="profile-card__avatar">{user ? user.name[0].toUpperCase() : "G"}</div>
              <div className="profile-card__name">{user ? user.name : "Guest"}</div>
              <div className="profile-card__sub">{user ? user.email : "Гостевой режим"}</div>
              <div className="profile-card__stats">
                <div className="profile-card__stat"><span>Тренировки</span><strong>{allRuns.length}</strong></div>
                <div className="profile-card__stat"><span>Км всего</span><strong>{totalKm.toFixed(1)}</strong></div>
                <div className="profile-card__stat"><span>Калории</span><strong>{totalCalories}</strong></div>
              </div>
            </div>
          </div>

          {/* Create form */}
          <div className="panel">
            <div className="panel__heading">
              <div><p className="panel__title">Новая запись</p><h2>Создать</h2></div>
            </div>
            <form style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 12 }} onSubmit={handleCreateRun}>

              {/* Date + time */}
              <div className="form-grid">
                <label><CalendarDays size={13} />Дата<input type="date" value={activityDate} onChange={e => setActivityDate(e.target.value)} required /></label>
                <label><Clock3 size={13} />Старт<input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required /></label>
              </div>

              {/* ── TRIPLET: Distance / Pace / Duration ── */}
              <div className="triplet-card">
                <div className="triplet-label">Параметры тренировки</div>
                <div className="triplet-grid">
                  <div className="triplet-field">
                    <div className="triplet-icon"><Ruler size={13} /></div>
                    <label className="triplet-inner">
                      <span>Дистанция</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        max="100"
                        value={distanceKm}
                        onChange={e => handleDistanceChange(e.target.value)}
                        className="triplet-input"
                      />
                      <em>км</em>
                    </label>
                  </div>
                  <div className="triplet-field">
                    <div className="triplet-icon"><Zap size={13} /></div>
                    <label className="triplet-inner">
                      <span>Темп</span>
                      <input
                        type="text"
                        value={paceStr}
                        onChange={e => handlePaceChange(e.target.value)}
                        onBlur={handlePaceBlur}
                        placeholder="5:30"
                        className="triplet-input"
                      />
                      <em>/км</em>
                    </label>
                  </div>
                  <div className="triplet-field">
                    <div className="triplet-icon"><Clock3 size={13} /></div>
                    <label className="triplet-inner">
                      <span>Время</span>
                      <input
                        type="number"
                        step="5"
                        min="5"
                        max="600"
                        value={durationMinutes}
                        onChange={e => handleDurationChange(Number(e.target.value))}
                        className="triplet-input"
                      />
                      <em>мин</em>
                    </label>
                  </div>
                </div>
                <div className="triplet-summary">
                  {formatDuration(durationMinutes)} · {distanceKm.toFixed(2)} км · {paceStr || formatPace(paceSecondsPerKm(durationMinutes, distanceKm))}/км
                </div>
              </div>

              {/* District + source */}
              <div className="form-grid">
                <label><MapPin size={13} />Район
                  <select value={district} onChange={e => { setDistrict(e.target.value); setManualPoints([]); }}>
                    {MOSCOW_DISTRICTS.map(d => <option value={d.label} key={d.name}>{d.label}</option>)}
                  </select>
                </label>
                <label>Тип
                  <select value={source} onChange={e => setSource(e.target.value as typeof source)}>
                    <option value="MANUAL">Manual</option>
                    <option value="PLANNED">Planned</option>
                    <option value="RECORDED">Recorded</option>
                  </select>
                </label>
              </div>

              {/* Route mode toggle */}
              <div className="segmented">
                <button type="button" className={routeMode === "auto" ? "active" : ""} onClick={() => setRouteMode("auto")}>
                  <ListRestart size={14} />Авто ({distanceKm.toFixed(1)} км)
                </button>
                <button type="button" className={routeMode === "points" ? "active" : ""} onClick={() => setRouteMode("points")}>
                  <MousePointer2 size={14} />Точки {manualPoints.length > 0 ? `(${manualPoints.length})` : ""}
                </button>
              </div>

              {/* Map builder */}
              <div className="route-builder">
                <RealMap
                  district={district}
                  points={previewPoints}
                  accent="#FC5200"
                  interactive={routeMode === "points"}
                  darkTiles
                  onAddPoint={handleAddPoint}
                />
              </div>

              {/* Route tools */}
              {routeMode === "points" && (
                <div className="route-tools">
                  <span>
                    {manualPoints.length < 2
                      ? "Кликайте по карте чтобы добавить точки"
                      : `${manualPoints.length} точек · ${routeDistanceKm(manualPoints).toFixed(2)} км`}
                  </span>
                  <button type="button" onClick={() => setManualPoints([])}>
                    <RotateCcw size={12} /> Очистить
                  </button>
                </div>
              )}

              <label>Заметка<textarea value={note} onChange={e => setNote(e.target.value)} rows={2} /></label>

              <button className="primary-action" type="submit" disabled={saving}>
                <Plus size={16} />
                {saving ? "Сохраняю…" : user ? "Сохранить в профиль" : "Создать локально"}
              </button>
              {message && <p className="status-line">{message}</p>}
            </form>
          </div>
        </aside>

        {/* ── CENTER: Feed ── */}
        <div className="feed">
          {selectedRun ? (
            <>
              <RunReport run={{ ...selectedRun, user: { name: user?.name ?? "Гость" } }} />
              {selectedRun.storage === "cloud" && selectedRun.isPublic
                ? <a className="share-link" href={`/runs/${selectedRun.id}`} target="_blank">Открыть скриншот-страницу →</a>
                : selectedRun.storage === "local"
                ? <div className="local-note">Запись в браузере · Войдите для публичной ссылки</div>
                : null}
            </>
          ) : (
            <div className="empty-state"><Activity size={36} /><span>Создайте первую тренировку</span></div>
          )}
        </div>

        {/* ── RIGHT: History ── */}
        <div className="panel history">
          <div className="panel__heading">
            <div><p className="panel__title">История</p><h2>{visibleRuns.length} записей</h2></div>
            <Filter size={18} color="var(--text-muted)" />
          </div>
          <div className="filters">
            <input type="month" value={filters.month} onChange={e => setFilters({ ...filters, month: e.target.value })} />
            <select value={filters.district} onChange={e => setFilters({ ...filters, district: e.target.value })}>
              <option value="">Все районы</option>
              {MOSCOW_DISTRICTS.map(d => <option value={d.label} key={d.name}>{d.label}</option>)}
            </select>
          </div>
          <div className="run-list">
            {visibleRuns.map(run => (
              <button type="button" key={run.id}
                className={`run-item${selectedRun?.id === run.id ? " active" : ""}`}
                onClick={() => setSelectedRun(run)}>
                <span>
                  <strong>{run.district}</strong>
                  <small>{new Date(run.activityDate).toLocaleDateString("ru-RU")} · {formatPace(run.paceSecondsKm)}/км</small>
                </span>
                <b>{run.distanceKm.toFixed(1)} км</b>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
