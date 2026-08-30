'use client';

import React, { useEffect, useRef, useState, useMemo, Component, ErrorInfo, ReactNode } from 'react';
import {
  X,
  MapPin,
  Clock,
  Navigation,
  Route,
  Building2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Layers,
  Compass,
  Maximize2,
  Search,
  ArrowUpDown,
  Copy,
  Check,
  Filter,
  Car,
  Battery,
  ChevronDown,
  ChevronUp,
  Eye,
} from 'lucide-react';

// ─── SS Realty Jonapur Office Coordinates (Exact Google Maps Pin) ─────────────
const OFFICE_LAT = 28.4624272;
const OFFICE_LNG = 77.1515298;
const OFFICE_NAME = 'SS REALTY';
const OFFICE_ADDRESS = 'Dalmia farm, Plot no-2, Jona Pur, Jaunapur, New Delhi, Delhi 110047';

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface RoutePoint {
  latitude: number;
  longitude: number;
  speed?: number;
  battery?: number;
  status: string;
  timestamp: string;
  distanceFromOfficeMeters: number;
}

export interface StopInfo {
  latitude: number;
  longitude: number;
  from: string;
  to: string;
  durationMinutes: number;
  status: string;
  index: number;
}

interface Props {
  agentName: string;
  date: string;
  routeHistory: RoutePoint[];
  routeDistanceKm: number;
  loadingRoute: boolean;
  officeLat?: number;
  officeLng?: number;
  officeName?: string;
  officeAddress?: string;
  onClose: () => void;
  onDateChange: (date: string) => void;
}

// ─── Safe Error Boundary ───────────────────────────────────────────────────────
class ModalErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('RouteMapModal internal error caught safely:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// ─── Helper Functions ──────────────────────────────────────────────────────────
function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(Math.max(0, a)), Math.sqrt(Math.max(0, 1 - a)));
}

function detectStops(path: RoutePoint[]): StopInfo[] {
  const stops: StopInfo[] = [];
  if (!Array.isArray(path) || path.length < 2) return stops;

  const STOP_RADIUS_M = 80;
  const MIN_STOP_MINUTES = 5;
  let stopStart = 0;

  for (let i = 1; i <= path.length; i++) {
    const curr = path[i] || path[path.length - 1];
    const start = path[stopStart];
    if (!start || !curr) continue;

    const distM = haversineMeters(start.latitude, start.longitude, curr.latitude, curr.longitude);
    const isSamePlace = distM < STOP_RADIUS_M;
    const isLast = i === path.length;

    if (!isSamePlace || isLast) {
      const endPoint = path[Math.min(i - 1, path.length - 1)];
      const startTime = new Date(start.timestamp).getTime();
      const endTime = new Date(endPoint.timestamp).getTime();
      const spanMinutes = Math.round((endTime - startTime) / 60000);

      if (spanMinutes >= MIN_STOP_MINUTES && stopStart < i - 1) {
        stops.push({
          latitude: start.latitude,
          longitude: start.longitude,
          from: start.timestamp,
          to: endPoint.timestamp,
          durationMinutes: spanMinutes,
          status: start.status || 'ON_FIELD_VISIT',
          index: stopStart,
        });
      }
      stopStart = i;
    }
  }
  return stops;
}

function fmtTime(iso?: string) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
  } catch {
    return '—';
  }
}

function fmtDur(minutes: number) {
  if (!minutes || minutes < 1) return '0 min';
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
}

function formatDateHeader(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const dateObj = new Date(y, m, d);
      return dateObj.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

function calcBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

// ─── Modal Inner Component ─────────────────────────────────────────────────────
function RouteMapModalInner({
  agentName,
  date,
  routeHistory = [],
  routeDistanceKm = 0,
  loadingRoute,
  officeLat,
  officeLng,
  officeName,
  officeAddress,
  onClose,
  onDateChange,
}: Props) {
  const effOfficeLat = officeLat || OFFICE_LAT;
  const effOfficeLng = officeLng || OFFICE_LNG;
  const effOfficeName = officeName || OFFICE_NAME;
  const effOfficeAddress = officeAddress || OFFICE_ADDRESS;

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);

  const [activeTab, setActiveTab] = useState<'interactive_map' | 'google_map' | 'timeline'>('interactive_map');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  // Waypoints Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_OFFICE' | 'ON_FIELD_VISIT' | 'STOPPED'>('ALL');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isStoppagesOpen, setIsStoppagesOpen] = useState(true);

  const stops = useMemo(() => detectStops(routeHistory), [routeHistory]);

  const latestPoint = routeHistory.length > 0 ? routeHistory[routeHistory.length - 1] : null;
  const firstPoint = routeHistory.length > 0 ? routeHistory[0] : null;

  const totalDurationMin = useMemo(() => {
    if (routeHistory.length < 2) return 0;
    try {
      const start = new Date(routeHistory[0].timestamp).getTime();
      const end = new Date(routeHistory[routeHistory.length - 1].timestamp).getTime();
      return Math.max(0, Math.round((end - start) / 60000));
    } catch {
      return 0;
    }
  }, [routeHistory]);

  // Google Maps Directions Link (Office -> Latest Location)
  const googleMapsDirectionsUrl = useMemo(() => {
    const destLat = latestPoint?.latitude ?? effOfficeLat;
    const destLng = latestPoint?.longitude ?? effOfficeLng;
    return `https://www.google.com/maps/dir/?api=1&origin=${effOfficeLat},${effOfficeLng}&destination=${destLat},${destLng}&travelmode=driving`;
  }, [latestPoint, effOfficeLat, effOfficeLng]);

  // Embedded Google Map Iframe URL
  const googleMapEmbedUrl = useMemo(() => {
    const lat = latestPoint?.latitude ?? effOfficeLat;
    const lng = latestPoint?.longitude ?? effOfficeLng;
    return `https://maps.google.com/maps?q=${lat},${lng}&z=14&output=embed`;
  }, [latestPoint, effOfficeLat, effOfficeLng]);

  // Enriched Waypoints with Time Gaps & Metadata
  const enrichedWaypoints = useMemo(() => {
    if (!Array.isArray(routeHistory) || routeHistory.length === 0) return [];

    return routeHistory.map((pt, index) => {
      const isFirst = index === 0;
      const isLast = index === routeHistory.length - 1;
      const isInOffice = (pt.distanceFromOfficeMeters || 0) < 200 || pt.status === 'IN_OFFICE';

      let timeGap = '';
      if (index > 0) {
        try {
          const prevTime = new Date(routeHistory[index - 1].timestamp).getTime();
          const currTime = new Date(pt.timestamp).getTime();
          const diffMin = Math.round((currTime - prevTime) / 60000);
          if (diffMin > 0) {
            timeGap = diffMin < 60 ? `+${diffMin}m` : `+${Math.floor(diffMin / 60)}h ${diffMin % 60}m`;
          }
        } catch {}
      }

      return {
        ...pt,
        originalIndex: index,
        isFirst,
        isLast,
        isInOffice,
        timeGap,
        formattedTime: fmtTime(pt.timestamp),
      };
    });
  }, [routeHistory]);

  // Counts for filter pills
  const counts = useMemo(() => {
    const officeCount = enrichedWaypoints.filter((p) => p.isInOffice).length;
    const fieldCount = enrichedWaypoints.filter((p) => !p.isInOffice).length;
    const stoppedCount = enrichedWaypoints.filter((p) => p.speed === undefined || p.speed < 2).length;
    return { officeCount, fieldCount, stoppedCount };
  }, [enrichedWaypoints]);

  // Filtered & Sorted Waypoints
  const filteredWaypoints = useMemo(() => {
    let list = enrichedWaypoints;

    // Status filter
    if (statusFilter === 'IN_OFFICE') {
      list = list.filter((p) => p.isInOffice);
    } else if (statusFilter === 'ON_FIELD_VISIT') {
      list = list.filter((p) => !p.isInOffice);
    } else if (statusFilter === 'STOPPED') {
      list = list.filter((p) => p.speed === undefined || p.speed < 2);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => {
        const timeStr = p.formattedTime.toLowerCase();
        const distStr = `${((p.distanceFromOfficeMeters || 0) / 1000).toFixed(2)} km`.toLowerCase();
        const coordStr = `${p.latitude.toFixed(5)}, ${p.longitude.toFixed(5)}`.toLowerCase();
        const statusStr = (p.status || '').toLowerCase();
        return timeStr.includes(q) || distStr.includes(q) || coordStr.includes(q) || statusStr.includes(q);
      });
    }

    // Sort order
    if (sortOrder === 'desc') {
      return [...list].reverse();
    }
    return list;
  }, [enrichedWaypoints, statusFilter, searchQuery, sortOrder]);

  const handleCopyCoords = (lat: number, lng: number, idx: number) => {
    const text = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 1800);
    }
  };

  const handleViewWaypointOnMap = (lat: number, lng: number) => {
    setActiveTab('interactive_map');
    setTimeout(() => {
      flyTo(lat, lng, 17);
    }, 200);
  };

  // ─── Leaflet Safe Initializer ───────────────────────────────────────────────
  useEffect(() => {
    let isCancelled = false;

    const initMap = async () => {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      try {
        // 1. Ensure Leaflet CSS & Script are loaded
        if (!(window as any).L) {
          if (!document.getElementById('leaflet-css-bundle')) {
            const link = document.createElement('link');
            link.id = 'leaflet-css-bundle';
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
            document.head.appendChild(link);
          }

          await new Promise<void>((resolve, reject) => {
            if (document.getElementById('leaflet-js-bundle')) {
              const checkInterval = setInterval(() => {
                if ((window as any).L) {
                  clearInterval(checkInterval);
                  resolve();
                }
              }, 50);
              setTimeout(() => {
                clearInterval(checkInterval);
                resolve();
              }, 3000);
              return;
            }

            const script = document.createElement('script');
            script.id = 'leaflet-js-bundle';
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Leaflet script failed to load'));
            document.head.appendChild(script);
          });
        }

        if (isCancelled || !mapContainerRef.current) return;

        const L = (window as any).L;
        if (!L) {
          setMapError(true);
          return;
        }

        // Clean up previous instance safely
        if (leafletMapInstanceRef.current) {
          try {
            leafletMapInstanceRef.current.remove();
          } catch {
            // ignore cleanup errors
          }
          leafletMapInstanceRef.current = null;
        }

        // Wipe internal Leaflet ID on container to prevent "Map container is already initialized"
        if ((mapContainerRef.current as any)._leaflet_id) {
          delete (mapContainerRef.current as any)._leaflet_id;
        }

        // Create Map
        const centerLat = latestPoint?.latitude ?? effOfficeLat;
        const centerLng = latestPoint?.longitude ?? effOfficeLng;

        const map = L.map(mapContainerRef.current, {
          center: [centerLat, centerLng],
          zoom: 13,
          zoomControl: true,
          scrollWheelZoom: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        leafletMapInstanceRef.current = map;
        setMapLoaded(true);
        setMapError(false);

        // Force resize recalculation
        setTimeout(() => {
          if (map) {
            try {
              map.invalidateSize();
            } catch {
              // ignore
            }
          }
        }, 200);
      } catch (err) {
        console.warn('Leaflet interactive map initialization notice:', err);
        setMapError(true);
      }
    };

    if (activeTab === 'interactive_map') {
      initMap();
    }

    return () => {
      isCancelled = true;
      if (leafletMapInstanceRef.current) {
        try {
          leafletMapInstanceRef.current.remove();
        } catch {
          // ignore
        }
        leafletMapInstanceRef.current = null;
      }
    };
  }, [activeTab, latestPoint?.latitude, latestPoint?.longitude, effOfficeLat, effOfficeLng]);

  // ─── Draw Route on Leaflet Map ──────────────────────────────────────────────
  useEffect(() => {
    if (!mapLoaded || !leafletMapInstanceRef.current || activeTab !== 'interactive_map') return;
    const L = (window as any).L;
    const map = leafletMapInstanceRef.current;
    if (!L || !map) return;

    try {
      // Clear old layers
      markersRef.current.forEach((m) => {
        try {
          m.remove();
        } catch {}
      });
      markersRef.current = [];

      if (polylineRef.current) {
        try {
          polylineRef.current.remove();
        } catch {}
        polylineRef.current = null;
      }

      // 1. Office Marker
      const officeIcon = L.divIcon({
        className: '',
        html: `<div style="background:#15803d;color:#fff;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,0.35);font-size:16px;">🏢</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });
      const officeMk = L.marker([effOfficeLat, effOfficeLng], { icon: officeIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:system-ui;min-width:180px"><b style="color:#15803d;font-size:13px">🏢 ${effOfficeName}</b><br><span style="font-size:11px;color:#555">${effOfficeAddress}</span></div>`
        );
      markersRef.current.push(officeMk);

      if (!Array.isArray(routeHistory) || routeHistory.length === 0) {
        map.setView([effOfficeLat, effOfficeLng], 13);
        return;
      }

      // 2. Polyline (Route Path)
      const latLngs = routeHistory.map((p) => [p.latitude, p.longitude]);
      const polyline = L.polyline(latLngs, {
        color: '#2563eb',
        weight: 5,
        opacity: 0.85,
        lineJoin: 'round',
      }).addTo(map);
      polylineRef.current = polyline;

      // 3. Direction Arrows
      const step = Math.max(1, Math.floor(routeHistory.length / 5));
      routeHistory.forEach((pt, i) => {
        if (i === 0 || i % step !== 0 || i >= routeHistory.length - 1) return;
        const next = routeHistory[i + 1];
        if (!next) return;
        const deg = calcBearing(pt.latitude, pt.longitude, next.latitude, next.longitude);
        const arIcon = L.divIcon({
          className: '',
          html: `<div style="color:#1d4ed8;font-size:14px;transform:rotate(${deg}deg);line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.4))">➤</div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        const ar = L.marker([pt.latitude, pt.longitude], { icon: arIcon, interactive: false }).addTo(map);
        markersRef.current.push(ar);
      });

      // 4. Start Marker
      if (firstPoint) {
        const startIcon = L.divIcon({
          className: '',
          html: `<div style="background:#16a34a;color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:12px;font-weight:900">S</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        const smk = L.marker([firstPoint.latitude, firstPoint.longitude], { icon: startIcon })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:system-ui"><b>🟢 Start (First Signal)</b><br><span style="font-size:11px">${fmtTime(
              firstPoint.timestamp
            )}</span><br><small style="color:#666">${((firstPoint.distanceFromOfficeMeters || 0) / 1000).toFixed(2)} km from Office</small></div>`
          );
        markersRef.current.push(smk);
      }

      // 5. End / Latest Marker
      if (latestPoint && routeHistory.length > 1) {
        const endIcon = L.divIcon({
          className: '',
          html: `<div style="background:#dc2626;color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:12px;font-weight:900">E</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        const emk = L.marker([latestPoint.latitude, latestPoint.longitude], { icon: endIcon })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:system-ui"><b>🔴 Latest Location</b><br><span style="font-size:11px">${fmtTime(
              latestPoint.timestamp
            )}</span><br><small style="color:#666">${((latestPoint.distanceFromOfficeMeters || 0) / 1000).toFixed(2)} km from Office</small></div>`
          );
        markersRef.current.push(emk);
      }

      // 6. Stoppage Badges
      stops.forEach((stop, si) => {
        const stopIcon = L.divIcon({
          className: '',
          html: `<div style="background:#f59e0b;color:#1c1917;border-radius:12px;padding:3px 8px;font-size:10px;font-weight:900;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);white-space:nowrap;cursor:pointer;">⏸ ${fmtDur(
            stop.durationMinutes
          )}</div>`,
          iconSize: [90, 26],
          iconAnchor: [45, 13],
        });
        const stmk = L.marker([stop.latitude, stop.longitude], { icon: stopIcon })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:system-ui;min-width:200px"><b style="color:#b45309;font-size:12px">⏸ Stoppage #${si + 1} (Ruka Tha)</b><br><b>Duration:</b> ${fmtDur(
              stop.durationMinutes
            )}<br><b>Time:</b> ${fmtTime(stop.from)} → ${fmtTime(stop.to)}<br><small style="color:#666">Status: ${
              stop.status
            }</small></div>`
          );
        markersRef.current.push(stmk);
      });

      // Fit bounds to fit office + all route points
      const allPoints: [number, number][] = [
        [effOfficeLat, effOfficeLng],
        ...routeHistory.map((p): [number, number] => [p.latitude, p.longitude]),
      ];
      map.fitBounds(L.latLngBounds(allPoints), { padding: [50, 50] });
    } catch (e) {
      console.warn('Error drawing route on Leaflet:', e);
    }
  }, [mapLoaded, routeHistory, stops, activeTab, firstPoint, latestPoint, effOfficeLat, effOfficeLng, effOfficeName, effOfficeAddress]);

  function flyTo(lat: number, lng: number, zoom = 16) {
    if (leafletMapInstanceRef.current) {
      try {
        leafletMapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 1 });
      } catch {}
    }
  }

  function flyToRoute() {
    if (!polylineRef.current || !leafletMapInstanceRef.current) return;
    try {
      leafletMapInstanceRef.current.fitBounds(polylineRef.current.getBounds(), { padding: [50, 50] });
    } catch {}
  }

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-5xl h-[92vh] max-h-[92vh] flex flex-col overflow-hidden">
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-stone-100 bg-gradient-to-r from-stone-50 via-white to-stone-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8B6914]/10 border border-[#8B6914]/20 flex items-center justify-center text-[#8B6914] shrink-0 shadow-2xs">
              <Route className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-black text-stone-900 tracking-tight" style={{ color: '#1C1917' }}>
                  {agentName} — Route & Map Playback
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Live GPS
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                {formatDateHeader(date)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="px-3 py-1.5 bg-stone-100 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 outline-none cursor-pointer hover:bg-stone-200 transition-all"
            />
            <button
              onClick={onClose}
              className="p-2 hover:bg-stone-100 text-stone-500 hover:text-stone-900 rounded-xl transition-all cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Key Metrics Strip ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-stone-100 shrink-0">
          <div className="bg-blue-50/80 p-3 flex items-center gap-2.5 border-r border-stone-100">
            <div className="p-1.5 bg-white rounded-lg shadow-2xs text-blue-700">
              <Route className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-900/60">Total Distance</p>
              <p className="text-sm font-black text-blue-950">{loadingRoute ? '…' : `${(routeDistanceKm || 0).toFixed(2)} km`}</p>
            </div>
          </div>

          <div className="bg-amber-50/80 p-3 flex items-center gap-2.5 border-r border-stone-100">
            <div className="p-1.5 bg-white rounded-lg shadow-2xs text-[#8B6914]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900/60">Shift Duration</p>
              <p className="text-sm font-black text-[#8B6914]">{loadingRoute ? '…' : fmtDur(totalDurationMin)}</p>
            </div>
          </div>

          <div className="bg-emerald-50/80 p-3 flex items-center gap-2.5 border-r border-stone-100">
            <div className="p-1.5 bg-white rounded-lg shadow-2xs text-emerald-700">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900/60">GPS Waypoints</p>
              <p className="text-sm font-black text-emerald-950">{loadingRoute ? '…' : `${routeHistory.length} points`}</p>
            </div>
          </div>

          <div className="bg-rose-50/80 p-3 flex items-center gap-2.5">
            <div className="p-1.5 bg-white rounded-lg shadow-2xs text-rose-700">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-rose-900/60">Stoppages (Ruka)</p>
              <p className="text-sm font-black text-rose-950">{loadingRoute ? '…' : `${stops.length} stops`}</p>
            </div>
          </div>
        </div>

        {/* ── Tab Switcher & Quick Navigation Bar ─────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-stone-100 bg-stone-50/60 shrink-0">
          <div className="flex items-center gap-1.5 bg-stone-200/60 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('interactive_map')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'interactive_map'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#8B6914]" />
              <span>Interactive Map</span>
            </button>

            <button
              onClick={() => setActiveTab('google_map')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'google_map'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>Google Maps View</span>
            </button>

            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'timeline'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Stops & Timeline ({routeHistory.length})</span>
            </button>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex items-center gap-2">
            <a
              href={googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 text-xs font-black rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              style={{ color: '#FFFFFF' }}
              title="Google Maps turn-by-turn navigation"
            >
              <ExternalLink className="w-3.5 h-3.5 text-white" />
              <span>Open in Google Maps</span>
            </a>

            {activeTab === 'interactive_map' && (
              <>
                <button
                  onClick={() => flyTo(effOfficeLat, effOfficeLng, 15)}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Building2 className="w-3.5 h-3.5" /> Office
                </button>
                <button
                  onClick={flyToRoute}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-stone-100 text-stone-800 border border-stone-200 hover:bg-stone-200 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Maximize2 className="w-3.5 h-3.5" /> Fit Route
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Main Body ──────────────────────────────────────────────────────── */}
        <div className="flex-1 min-h-0 overflow-hidden relative flex flex-col">
          {/* TAB 1: Interactive Zoomable Map */}
          {activeTab === 'interactive_map' && (
            <div className="w-full h-full relative">
              {loadingRoute && (
                <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-[#8B6914]" />
                  <p className="text-sm font-bold text-stone-700">Loading GPS breadcrumbs...</p>
                </div>
              )}

              {/* Map Legend Overlay */}
              <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-stone-200 p-3 text-[11px] font-bold space-y-1.5 pointer-events-auto">
                <p className="text-stone-400 uppercase tracking-wider text-[9px] font-black">Map Legend</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-1.5 rounded-full bg-blue-600 inline-block" />
                  <span>Route Trail</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-green-600 inline-block" />
                  <span>🟢 Start (S)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-600 inline-block" />
                  <span>🔴 Latest (E)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                  <span>⏸️ Stoppage</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">🏢</span>
                  <span>Jonapur Office</span>
                </div>
              </div>

              {/* Leaflet Map DOM Target */}
              <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: 400 }} />

              {mapError && (
                <div className="absolute inset-0 bg-stone-50 z-20 flex flex-col items-center justify-center p-6 text-center">
                  <AlertCircle className="w-10 h-10 text-amber-600 mb-2" />
                  <h4 className="font-black text-stone-800 text-sm">Interactive Map Falling Back to Google Maps</h4>
                  <p className="text-xs text-stone-500 max-w-sm mt-1 mb-3">
                    Map tiles can be viewed directly using the Google Maps tab or external navigation link.
                  </p>
                  <button
                    onClick={() => setActiveTab('google_map')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
                    style={{ color: '#FFFFFF' }}
                  >
                    Switch to Google Maps View
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Embedded Google Maps View */}
          {activeTab === 'google_map' && (
            <div className="w-full h-full relative bg-stone-100">
              <iframe
                title="Google Maps Navigation View"
                src={googleMapEmbedUrl}
                className="w-full h-full border-0"
                style={{ minHeight: 400 }}
                loading="lazy"
                allowFullScreen
              />
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-stone-200 px-4 py-2 text-xs font-bold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Satellite & Terrain Map powered by Google</span>
              </div>
            </div>
          )}

          {/* TAB 3: Stoppages & Full Chronological Timeline */}
          {activeTab === 'timeline' && (
            <div className="w-full h-full min-h-0 overflow-y-auto p-3 sm:p-5 space-y-4 custom-scrollbar bg-stone-50/40">
              {/* Detected Halts Section */}
              <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setIsStoppagesOpen(!isStoppagesOpen)}
                    className="flex items-center gap-2 text-left cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                      ⏸
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-stone-800 group-hover:text-amber-700 transition-colors">
                        Detected Stoppages & Halts ({stops.length})
                      </h3>
                      <span className="text-[11px] font-semibold text-stone-500">
                        Places where agent stayed stationary for 5+ mins
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setIsStoppagesOpen(!isStoppagesOpen)}
                    className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-stone-700 transition-all cursor-pointer"
                  >
                    {isStoppagesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {isStoppagesOpen && (
                  <div className="mt-3 pt-3 border-t border-stone-100">
                    {stops.length === 0 ? (
                      <div className="bg-stone-50 rounded-xl border border-stone-100 p-4 text-center text-xs text-stone-500 font-medium">
                        No continuous long stoppages (&gt;5 mins) detected on this date.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {stops.map((stop, si) => (
                          <div
                            key={si}
                            className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 shadow-2xs hover:bg-amber-100/70 transition-all flex flex-col justify-between gap-2.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-2xs shrink-0">
                                  #{si + 1}
                                </div>
                                <div>
                                  <p className="text-xs font-black text-amber-950">
                                    Stopped for {fmtDur(stop.durationMinutes)}
                                  </p>
                                  <p className="text-[11px] font-bold text-amber-800 mt-0.5">
                                    {fmtTime(stop.from)} → {fmtTime(stop.to)}
                                  </p>
                                </div>
                              </div>
                              <span
                                className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                                  stop.status === 'IN_OFFICE'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {stop.status}
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-amber-200/50 text-[11px]">
                              <span className="font-mono text-stone-600 font-semibold text-[10px]">
                                {stop.latitude.toFixed(5)}, {stop.longitude.toFixed(5)}
                              </span>
                              <button
                                onClick={() => {
                                  setActiveTab('interactive_map');
                                  setTimeout(() => flyTo(stop.latitude, stop.longitude, 16), 150);
                                }}
                                className="text-blue-600 hover:text-blue-800 font-black cursor-pointer text-xs flex items-center gap-1"
                              >
                                <span>View on Map</span>
                                <span>→</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Chronological GPS Waypoints Section (Dedicated Scroll Container) ── */}
              <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs flex flex-col">
                {/* Header & Filter Controls */}
                <div className="pb-3 border-b border-stone-100 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          📍
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-stone-900">
                          Chronological GPS Waypoints
                        </h3>
                        <span className="px-2 py-0.5 bg-stone-100 text-stone-700 text-[10px] font-black rounded-full">
                          {filteredWaypoints.length} of {routeHistory.length}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 font-medium mt-0.5 pl-9">
                        Full movement history with exact time, location, distance, speed & coordinates.
                      </p>
                    </div>

                    {/* Sort Order Toggle */}
                    <div className="flex items-center gap-2 pl-9 sm:pl-0">
                      <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Toggle chronological order"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5 text-stone-500" />
                        <span>{sortOrder === 'asc' ? 'Oldest First (04:48 PM ⬇)' : 'Newest First (Latest ⬆)'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Search Bar & Quick Filter Badges */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-sm">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by time (e.g. 05:32), distance, coords..."
                        className="w-full pl-8 pr-7 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 outline-none focus:bg-white focus:border-[#8B6914] transition-all"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1 flex-wrap text-xs font-bold">
                      <button
                        onClick={() => setStatusFilter('ALL')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          statusFilter === 'ALL'
                            ? 'bg-stone-900 text-white shadow-2xs'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        All ({enrichedWaypoints.length})
                      </button>
                      <button
                        onClick={() => setStatusFilter('IN_OFFICE')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          statusFilter === 'IN_OFFICE'
                            ? 'bg-emerald-700 text-white shadow-2xs'
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                        }`}
                      >
                        🏢 Office ({counts.officeCount})
                      </button>
                      <button
                        onClick={() => setStatusFilter('ON_FIELD_VISIT')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          statusFilter === 'ON_FIELD_VISIT'
                            ? 'bg-blue-700 text-white shadow-2xs'
                            : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                        }`}
                      >
                        🚗 Field ({counts.fieldCount})
                      </button>
                      <button
                        onClick={() => setStatusFilter('STOPPED')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          statusFilter === 'STOPPED'
                            ? 'bg-amber-700 text-white shadow-2xs'
                            : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                        }`}
                      >
                        🛑 Stopped ({counts.stoppedCount})
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── Scrollable Waypoint List ── */}
                <div className="mt-3">
                  {routeHistory.length === 0 ? (
                    <div className="bg-stone-50 rounded-2xl border border-stone-200 p-8 text-center text-xs text-stone-500 font-medium">
                      No GPS telemetry points recorded for this date.
                    </div>
                  ) : filteredWaypoints.length === 0 ? (
                    <div className="bg-stone-50 rounded-2xl border border-stone-200 p-8 text-center text-xs text-stone-500 font-medium">
                      No waypoints match the search or filter criteria.
                    </div>
                  ) : (
                    <div
                      className="max-h-[460px] sm:max-h-[500px] overflow-y-auto pr-1.5 space-y-2.5 custom-scrollbar"
                      style={{ scrollBehavior: 'smooth' }}
                    >
                      <div className="relative pl-6 space-y-2.5">
                        {/* Timeline Spine */}
                        <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-stone-200" />

                        {filteredWaypoints.map((pt, i) => {
                          const isCopied = copiedIndex === pt.originalIndex;
                          const googlePinUrl = `https://www.google.com/maps?q=${pt.latitude},${pt.longitude}`;

                          return (
                            <div key={pt.originalIndex} className="relative group">
                              {/* Node Indicator Dot */}
                              <div
                                className={`absolute -left-[19px] top-4 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs transition-transform group-hover:scale-125 z-10 ${
                                  pt.isFirst
                                    ? 'bg-emerald-500 ring-2 ring-emerald-300'
                                    : pt.isLast
                                    ? 'bg-red-500 ring-2 ring-red-300'
                                    : pt.isInOffice
                                    ? 'bg-emerald-500'
                                    : (pt.speed || 0) > 20
                                    ? 'bg-blue-600'
                                    : 'bg-amber-500'
                                }`}
                                title={`Waypoint #${pt.originalIndex + 1}`}
                              />

                              {/* Card Content */}
                              <div className="bg-white border border-stone-200/90 hover:border-[#8B6914]/50 rounded-2xl p-3 sm:p-3.5 shadow-2xs hover:shadow-sm transition-all flex flex-col gap-2.5">
                                {/* Top Row: Time, Location Distance, Status */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {/* Sequence Number */}
                                    <span className="w-6 h-6 rounded-lg bg-stone-100 text-stone-600 font-black text-[11px] flex items-center justify-center shrink-0">
                                      #{pt.originalIndex + 1}
                                    </span>

                                    {/* Exact Time */}
                                    <span className="font-mono text-sm font-black text-stone-900 bg-stone-50 px-2 py-0.5 rounded-lg border border-stone-200/70">
                                      {pt.formattedTime}
                                    </span>

                                    {/* Time Elapsed Delta */}
                                    {pt.timeGap && (
                                      <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                                        ⏱️ {pt.timeGap}
                                      </span>
                                    )}

                                    {/* Location Distance Pill */}
                                    <span
                                      className={`text-[11px] font-black px-2.5 py-0.5 rounded-lg border flex items-center gap-1 ${
                                        pt.isInOffice
                                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                          : 'bg-amber-50 text-amber-900 border-amber-200'
                                      }`}
                                    >
                                      {pt.isInOffice ? (
                                        <>
                                          <Building2 className="w-3 h-3 text-emerald-600" />
                                          <span>Jonapur Office</span>
                                        </>
                                      ) : (
                                        <>
                                          <MapPin className="w-3 h-3 text-amber-600" />
                                          <span>{((pt.distanceFromOfficeMeters || 0) / 1000).toFixed(2)} km from Office</span>
                                        </>
                                      )}
                                    </span>
                                  </div>

                                  {/* Status Tag */}
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span
                                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                        pt.status === 'IN_OFFICE'
                                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                                      }`}
                                    >
                                      {pt.status}
                                    </span>
                                  </div>
                                </div>

                                {/* Bottom Row: Coordinates, Speed, Battery & Quick Actions */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-stone-100 text-xs">
                                  {/* Coordinates & Telemetry */}
                                  <div className="flex items-center gap-2.5 flex-wrap">
                                    {/* Coordinates with Copy button */}
                                    <button
                                      onClick={() => handleCopyCoords(pt.latitude, pt.longitude, pt.originalIndex)}
                                      className="font-mono text-[11px] font-bold text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 px-2 py-0.5 rounded border border-stone-200/80 transition-colors flex items-center gap-1 cursor-pointer"
                                      title="Click to copy coordinates"
                                    >
                                      {isCopied ? (
                                        <Check className="w-3 h-3 text-emerald-600" />
                                      ) : (
                                        <Copy className="w-3 h-3 text-stone-400" />
                                      )}
                                      <span>
                                        {pt.latitude.toFixed(5)}, {pt.longitude.toFixed(5)}
                                      </span>
                                      {isCopied && <span className="text-[10px] text-emerald-600 font-black">Copied!</span>}
                                    </button>

                                    {/* Speed */}
                                    {pt.speed !== undefined && (
                                      <span
                                        className={`text-[11px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                                          pt.speed > 0
                                            ? 'text-blue-700 bg-blue-50 border-blue-200'
                                            : 'text-stone-500 bg-stone-50 border-stone-200'
                                        }`}
                                      >
                                        <Car className="w-3 h-3" />
                                        <span>{pt.speed > 0 ? `${Math.round(pt.speed)} km/h` : '0 km/h (Stopped)'}</span>
                                      </span>
                                    )}

                                    {/* Battery */}
                                    {pt.battery !== undefined && (
                                      <span className="text-[11px] font-semibold text-stone-500 bg-stone-50 px-2 py-0.5 rounded border border-stone-200/70 flex items-center gap-1">
                                        <Battery className="w-3 h-3 text-emerald-600" />
                                        <span>{pt.battery}%</span>
                                      </span>
                                    )}
                                  </div>

                                  {/* Map & Google Pin Action Buttons */}
                                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                                    <button
                                      onClick={() => handleViewWaypointOnMap(pt.latitude, pt.longitude)}
                                      className="px-2.5 py-1 bg-stone-100 hover:bg-[#8B6914]/10 text-stone-700 hover:text-[#8B6914] rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                                      title="Center interactive map on this waypoint"
                                    >
                                      <Eye className="w-3 h-3" />
                                      <span>Map</span>
                                    </button>

                                    <a
                                      href={googlePinUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                                      title="Open exact pin in Google Maps"
                                    >
                                      <ExternalLink className="w-3 h-3 text-blue-600" />
                                      <span>Google Pin</span>
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer status text inside Waypoint section */}
                {filteredWaypoints.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400 font-semibold">
                    <span>Scroll to view all movements from throughout the day</span>
                    <span>
                      Total: {routeHistory.length} points ({loadingRoute ? '…' : `${(routeDistanceKm || 0).toFixed(2)} km`})
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────────── */}
        <div className="px-5 py-3 border-t border-stone-100 bg-stone-50/80 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-stone-500 font-semibold">
            🗺️ Live Telemetry • SS Realty Jonapur Base • 10:00 AM – 07:00 PM IST
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm active:scale-95"
            style={{ color: '#FFFFFF' }}
          >
            Close Map
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Export with Error Boundary Wrapper ────────────────────────────────────────
export default function RouteMapModal(props: Props) {
  return (
    <ModalErrorBoundary
      fallback={
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
            <h3 className="text-base font-black text-stone-900">Map Playback Window</h3>
            <p className="text-xs text-stone-600">
              The route data can be viewed directly in Google Maps.
            </p>
            <div className="flex gap-2 justify-center">
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${props.officeLat || OFFICE_LAT},${props.officeLng || OFFICE_LNG}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                style={{ color: '#FFFFFF' }}
              >
                Open Google Maps
              </a>
              <button
                onClick={props.onClose}
                className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold"
                style={{ color: '#FFFFFF' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      }
    >
      <RouteMapModalInner {...props} />
    </ModalErrorBoundary>
  );
}
