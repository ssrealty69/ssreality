'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layers, Copy, Check, Save, Info, RefreshCw, X, ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Flat {
  number: string;
  status: 'available' | 'sold' | 'reserved';
  bedrooms?: number;
  price?: number;
  notes?: string;
}

interface Floor {
  floorNumber: number;
  floorName: string;
  flats: Flat[];
}

// Per-floor setup config used before generation
interface FloorConfig {
  id: string;           // temp id for React key
  floorName: string;    // e.g. "Ground Floor", "Upper Ground Floor", "1st Floor"
  roomPrefix: string;   // e.g. "Room", "UG", "G", "Shop"
  roomCount: number;    // how many rooms/flats on this floor
  defaultBhk: number;  // 0 = commercial/other
}

interface Property {
  _id: string;
  title: string;
  location: { city: string };
}

interface FloorPlanConfiguratorProps {
  property: Property;
  existingPlan?: {
    totalFloors: number;
    flatsPerFloor: number;
    floors: Floor[];
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ordinal = (n: number) => {
  if (n === 1) return '1st Floor';
  if (n === 2) return '2nd Floor';
  if (n === 3) return '3rd Floor';
  return `${n}th Floor`;
};

const defaultFloorConfigs = (): FloorConfig[] => [
  { id: crypto.randomUUID(), floorName: 'Ground Floor', roomPrefix: 'Unit', roomCount: 2, defaultBhk: 3 },
  { id: crypto.randomUUID(), floorName: '1st Floor',    roomPrefix: 'Unit', roomCount: 2, defaultBhk: 3 },
  { id: crypto.randomUUID(), floorName: '2nd Floor',    roomPrefix: 'Unit', roomCount: 3, defaultBhk: 3 },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function FloorPlanConfigurator({ property, existingPlan }: FloorPlanConfiguratorProps) {
  const router = useRouter();

  // ── Setup state (before generation) ────────────────────────────────────────
  const [floorConfigs, setFloorConfigs] = useState<FloorConfig[]>(defaultFloorConfigs);

  // ── Generated floors state ──────────────────────────────────────────────────
  const [floors, setFloors]           = useState<Floor[]>(existingPlan?.floors || []);
  const [isGenerated, setIsGenerated] = useState(!!existingPlan);
  const [saving, setSaving]           = useState(false);
  const [copied, setCopied]           = useState(false);

  // ── Flat editor modal ────────────────────────────────────────────────────────
  const [editingFlat, setEditingFlat] = useState<{
    floorIndex: number;
    flatIndex:  number;
    number:     string;
    status:     'available' | 'sold' | 'reserved';
    bedrooms?:  number;
    price?:     string;
    notes?:     string;
  } | null>(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // Floor config helpers
  // ─────────────────────────────────────────────────────────────────────────────

  const addFloor = () => {
    const nextNum = floorConfigs.length;
    setFloorConfigs(prev => [
      ...prev,
      {
        id:         crypto.randomUUID(),
        floorName:  ordinal(nextNum),
        roomPrefix: 'Unit',
        roomCount:  2,
        defaultBhk: 3,
      },
    ]);
  };

  const removeFloor = (id: string) => {
    setFloorConfigs(prev => prev.filter(f => f.id !== id));
  };

  const updateFloorConfig = (id: string, patch: Partial<FloorConfig>) => {
    setFloorConfigs(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f));
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Generate layout
  // ─────────────────────────────────────────────────────────────────────────────

  const handleGenerateGrid = () => {
    if (floors.length > 0 && !confirm('Generating a new layout will overwrite any existing flat configurations. Proceed?')) return;
    if (floorConfigs.length === 0) { toast.error('Add at least one floor first'); return; }

    const generatedFloors: Floor[] = floorConfigs.map((fc, idx) => {
      const flats: Flat[] = Array.from({ length: fc.roomCount }, (_, j) => ({
        number:   `${fc.roomPrefix} ${j + 1}`,
        status:   'available',
        bedrooms: fc.defaultBhk > 0 ? fc.defaultBhk : undefined,
      }));
      return { floorNumber: idx, floorName: fc.floorName, flats };
    });

    setFloors(generatedFloors);
    setIsGenerated(true);
    toast.success('Building grid generated successfully!');
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Flat editor
  // ─────────────────────────────────────────────────────────────────────────────

  const handleOpenFlatEditor = (floorIndex: number, flatIndex: number, flat: Flat) => {
    setEditingFlat({
      floorIndex,
      flatIndex,
      number:   flat.number,
      status:   flat.status,
      bedrooms: flat.bedrooms,
      price:    flat.price ? flat.price.toString() : '',
      notes:    flat.notes || '',
    });
  };

  const handleApplyFlatEdits = () => {
    if (!editingFlat) return;
    const { floorIndex, flatIndex, number, status, bedrooms, price, notes } = editingFlat;
    if (!number.trim()) { toast.error('Room number/label is required'); return; }

    setFloors(prev => {
      const updated = [...prev];
      updated[floorIndex].flats[flatIndex] = {
        number:   number.trim(),
        status,
        bedrooms: bedrooms ? Number(bedrooms) : undefined,
        price:    price && price.trim() ? Number(price) : undefined,
        notes:    notes?.trim() || undefined,
      };
      return updated;
    });
    setEditingFlat(null);
    toast.success(`Room ${number} updated`);
  };

  const handleQuickToggleStatus = (floorIndex: number, flatIndex: number) => {
    setFloors(prev => {
      const updated = [...prev];
      const flat = updated[floorIndex].flats[flatIndex];
      flat.status = flat.status === 'available' ? 'sold' : flat.status === 'sold' ? 'reserved' : 'available';
      return updated;
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Per-floor room add/remove after generation
  // ─────────────────────────────────────────────────────────────────────────────

  const addRoomToFloor = (floorIndex: number) => {
    setFloors(prev => {
      const updated = [...prev];
      const floor = updated[floorIndex];
      const next = floor.flats.length + 1;
      floor.flats = [
        ...floor.flats,
        { number: `Unit ${next}`, status: 'available' },
      ];
      return updated;
    });
  };

  const removeRoomFromFloor = (floorIndex: number, flatIndex: number) => {
    setFloors(prev => {
      const updated = [...prev];
      updated[floorIndex].flats = updated[floorIndex].flats.filter((_, i) => i !== flatIndex);
      return updated;
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Save
  // ─────────────────────────────────────────────────────────────────────────────

  const handleSaveConfiguration = async () => {
    if (floors.length === 0) { toast.error('Generate the grid first'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/floor-plans', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId:   property._id,
          totalFloors:  floors.length,
          flatsPerFloor: Math.max(...floors.map(f => f.flats.length)),
          floors,
        }),
      });
      if (res.ok) {
        toast.success('Floor plan saved successfully');
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save');
      }
    } catch {
      toast.error('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/floor-plans/${property._id}`);
    setCopied(true);
    toast.success('Client-sharing link copied!');
  };

  useEffect(() => {
    if (copied) { const t = setTimeout(() => setCopied(false), 2000); return () => clearTimeout(t); }
  }, [copied]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

      {/* ── Left Sidebar ── */}
      <div className="lg:col-span-1 lg:sticky lg:top-6 self-start space-y-5">

        {/* Header */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/floor-plans')}
            className="p-2 bg-gray-50 border border-gray-100 hover:border-[#C9A227]/30 text-gray-600 hover:text-[#C9A227] rounded-xl transition-all cursor-pointer"
            title="Back to Floor Plans"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-md font-extrabold text-[#1A1800] leading-tight">Configure Floor Plan</h1>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-none">Property: <strong className="text-gray-600">{property.title}</strong></p>
          </div>
        </div>

        {/* ── Floor Setup ── */}
        {!isGenerated ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-md font-bold text-gray-800 flex items-center gap-2">
              <Layers size={18} className="text-[#C9A227]" />
              Floor Setup
            </h2>

            <p className="text-xs text-gray-500">Add each floor, set its name, room label prefix, room count, and default BHK type.</p>

            {/* Floor list */}
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {floorConfigs.map((fc, idx) => (
                <div key={fc.id} className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
                  {/* Floor header */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600">
                      {fc.floorName || `Floor Setup ${idx + 1}`}
                    </span>
                    <button
                      onClick={() => removeFloor(fc.id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      title="Remove this floor"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Floor Name */}
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Floor Name</label>
                    <input
                      type="text"
                      value={fc.floorName}
                      onChange={e => updateFloorConfig(fc.id, { floorName: e.target.value })}
                      placeholder="e.g. Upper Ground Floor"
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-[#C9A227]"
                    />
                  </div>

                  {/* Room Prefix + Count row */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Room Prefix</label>
                      <input
                        type="text"
                        value={fc.roomPrefix}
                        onChange={e => updateFloorConfig(fc.id, { roomPrefix: e.target.value })}
                        placeholder="e.g. Unit / UG / G / Shop"
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-[#C9A227]"
                      />
                      <p className="text-[9px] text-gray-400 mt-0.5">→ {fc.roomPrefix} 1, {fc.roomPrefix} 2…</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">No. of Rooms</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={fc.roomCount}
                        onChange={e => updateFloorConfig(fc.id, { roomCount: Math.max(1, Number(e.target.value)) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-[#C9A227]"
                      />
                    </div>
                  </div>

                  {/* Default BHK */}
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Default BHK Type</label>
                    <select
                      value={fc.defaultBhk}
                      onChange={e => updateFloorConfig(fc.id, { defaultBhk: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-[#C9A227]"
                    >
                      <option value={0}>Commercial / Other</option>
                      <option value={1}>1 BHK</option>
                      <option value={2}>2 BHK</option>
                      <option value={3}>3 BHK</option>
                      <option value={4}>4 BHK</option>
                      <option value={5}>5 BHK</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Floor button */}
            <button
              onClick={addFloor}
              className="w-full flex items-center justify-center gap-1.5 py-2 border-2 border-dashed border-[#C9A227]/40 hover:border-[#C9A227] text-[#C9A227] hover:bg-[#C9A227]/5 rounded-xl text-xs font-bold transition-all"
            >
              <Plus size={14} /> Add Another Floor
            </button>

            {/* Generate button */}
            <button
              onClick={handleGenerateGrid}
              className="w-full py-2.5 bg-[#C9A227] hover:bg-[#B8860B] text-[#1A1800] font-bold rounded-xl transition-colors shadow-sm text-sm"
            >
              Generate Layout Grid
            </button>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
            <h2 className="text-md font-bold text-gray-800 flex items-center gap-2">
              <Layers size={18} className="text-[#C9A227]" />
              {floors.length} Floors Configured
            </h2>
            <p className="text-xs text-gray-500">{floors.reduce((s, f) => s + f.flats.length, 0)} total rooms across all floors.</p>
            <button
              onClick={() => setIsGenerated(false)}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={14} /> Reconfigure Structure
            </button>
          </div>
        )}

        {/* Help panel */}
        {isGenerated && (
          <div className="bg-[#1A1800]/5 border border-[#1A1800]/10 rounded-2xl p-4 text-xs text-gray-600 space-y-2">
            <h3 className="font-bold text-gray-700 flex items-center gap-1.5">
              <Info size={14} className="text-[#C9A227]" />
              Quick Tips
            </h3>
            <ul className="list-disc pl-4 space-y-1.5">
              <li><strong>Single click</strong> a room to edit its name, BHK, price, notes.</li>
              <li><strong>Double click</strong> to quickly toggle status (Available → Sold → Reserved).</li>
              <li>Use <strong>+ Add Room</strong> under any floor to add more rooms after generation.</li>
              <li>Always click <strong>Save Layout</strong> when done.</li>
            </ul>
          </div>
        )}

        {/* Save / Copy */}
        {isGenerated && (
          <div className="space-y-2">
            <button
              onClick={handleSaveConfiguration}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-[#C9A227] hover:bg-[#B8860B] text-[#1A1800] font-bold py-3.5 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] text-sm disabled:opacity-75"
            >
              <Save size={18} />
              {saving ? 'Saving…' : 'Save Layout Plan'}
            </button>
            {existingPlan && (
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold py-3.5 rounded-xl transition-colors text-sm"
              >
                {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                {copied ? 'Copied!' : 'Copy Client-Share Link'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Right Grid ── */}
      <div className="lg:col-span-3">
        {floors.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm flex flex-col items-center justify-center space-y-4">
            <Layers size={48} className="text-gray-300" />
            <div>
              <h3 className="text-lg font-bold text-gray-800">Building Floor Plan Grid</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-sm">Configure your floors on the left, then click <strong>Generate Layout Grid</strong>.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
            {/* Legend */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-bold text-gray-800">Building Stack Diagram</h3>
                <p className="text-xs text-gray-500 mt-0.5">Top-to-bottom layout · click room to edit</p>
              </div>
              <div className="flex gap-4 text-xs font-semibold text-gray-500">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-300 inline-block" /> Available</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-50 border border-red-300 inline-block" /> Sold</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-50 border border-amber-300 inline-block" /> Reserved</span>
              </div>
            </div>

            {/* Floors (top → bottom) */}
            <div className="space-y-4">
              {floors.slice().reverse().map((floor, rIndex) => {
                const actualFloorIndex = floors.length - 1 - rIndex;
                return (
                  <div key={floor.floorNumber} className="flex flex-col sm:flex-row sm:items-start gap-3 bg-gray-50/40 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    {/* Floor label */}
                    <div className="sm:w-36 flex-shrink-0 font-bold text-gray-700 text-sm border-b sm:border-b-0 sm:border-r border-gray-200 pb-2 sm:pb-0 sm:pr-4">
                      <div>{floor.floorName}</div>
                      <div className="text-[10px] text-gray-400 font-normal mt-0.5">{floor.flats.length} room{floor.flats.length !== 1 ? 's' : ''}</div>
                    </div>

                    {/* Rooms grid */}
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-3">
                        {floor.flats.map((flat, flatIndex) => {
                          let statusColor = 'bg-emerald-50/50 border-emerald-300 text-emerald-800 hover:bg-emerald-50';
                          if (flat.status === 'sold')     statusColor = 'bg-red-50/40 border-red-200 text-gray-500 line-through hover:bg-red-50/70';
                          if (flat.status === 'reserved') statusColor = 'bg-amber-50/50 border-amber-300 text-amber-800 hover:bg-amber-50';

                          return (
                            <div
                              key={flatIndex}
                              onClick={() => handleOpenFlatEditor(actualFloorIndex, flatIndex, flat)}
                              onDoubleClick={e => { e.stopPropagation(); handleQuickToggleStatus(actualFloorIndex, flatIndex); }}
                              className={`relative p-3 rounded-lg border text-center cursor-pointer transition-all hover:scale-[1.04] select-none shadow-sm w-[90px] ${statusColor}`}
                              title="Click to edit · Double-click to toggle status"
                            >
                              <div className="font-bold text-sm tracking-wide leading-tight">{flat.number}</div>
                              {flat.bedrooms ? (
                                <div className="text-[10px] font-semibold mt-0.5 text-gray-500">{flat.bedrooms} BHK</div>
                              ) : (
                                <div className="text-[10px] font-semibold mt-0.5 text-gray-400">---</div>
                              )}
                              {flat.price && (
                                <div className="text-[9px] font-bold text-gray-600 mt-1">₹{flat.price}L</div>
                              )}
                              {flat.status === 'sold' && (
                                <div className="absolute top-1 right-1 px-1 bg-red-600 text-white rounded text-[7px] font-bold uppercase scale-75">Sold</div>
                              )}
                              {flat.status === 'reserved' && (
                                <div className="absolute top-1 right-1 px-1 bg-amber-500 text-white rounded text-[7px] font-bold uppercase scale-75">Booked</div>
                              )}
                              {flat.notes && (
                                <span className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full" title={flat.notes} />
                              )}
                            </div>
                          );
                        })}

                        {/* Add room to this floor */}
                        <button
                          onClick={() => addRoomToFloor(actualFloorIndex)}
                          className="w-[90px] p-3 rounded-lg border-2 border-dashed border-gray-200 hover:border-[#C9A227] text-gray-400 hover:text-[#C9A227] transition-all flex flex-col items-center justify-center gap-1 text-[10px] font-semibold"
                          title="Add a room to this floor"
                        >
                          <Plus size={16} />
                          Add Room
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Flat Edit Modal ── */}
      {editingFlat && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Modal header */}
            <div className="bg-[#1A1800] px-6 py-4 flex items-center justify-between text-white">
              <h3 className="font-bold text-md">Configure: {editingFlat.number}</h3>
              <button onClick={() => setEditingFlat(null)} className="p-1.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Room label + BHK */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Room Label / Number</label>
                  <input
                    type="text"
                    value={editingFlat.number}
                    onChange={e => setEditingFlat(prev => prev ? { ...prev, number: e.target.value } : null)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#C9A227]"
                    placeholder="e.g. Room 1 / UG 2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">BHK / Type</label>
                  <select
                    value={editingFlat.bedrooms || ''}
                    onChange={e => setEditingFlat(prev => prev ? { ...prev, bedrooms: e.target.value ? Number(e.target.value) : undefined } : null)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#C9A227]"
                  >
                    <option value="">Commercial / Other</option>
                    <option value={1}>1 BHK</option>
                    <option value={2}>2 BHK</option>
                    <option value={3}>3 BHK</option>
                    <option value={4}>4 BHK</option>
                    <option value={5}>5 BHK</option>
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Availability Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['available', 'sold', 'reserved'] as const).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setEditingFlat(prev => prev ? { ...prev, status: s } : null)}
                      className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1 ${
                        editingFlat.status === s
                          ? s === 'available' ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                          : s === 'sold'      ? 'bg-red-50 border-red-500 text-red-700'
                          :                    'bg-amber-50 border-amber-500 text-amber-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${s === 'available' ? 'bg-emerald-500' : s === 'sold' ? 'bg-red-500' : 'bg-amber-500'}`} />
                      {s === 'available' ? 'Available' : s === 'sold' ? 'Sold Out' : 'Reserved'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Pricing (in Lakhs, optional)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs text-gray-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={editingFlat.price}
                    onChange={e => setEditingFlat(prev => prev ? { ...prev, price: e.target.value } : null)}
                    placeholder="e.g. 55"
                    className="w-full pl-6 pr-12 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#C9A227]"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-400 font-bold">Lakh</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Private Notes / Booking Details</label>
                <textarea
                  value={editingFlat.notes}
                  onChange={e => setEditingFlat(prev => prev ? { ...prev, notes: e.target.value } : null)}
                  placeholder="e.g. Sold to Mr. Roy, token received."
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#C9A227] resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditingFlat(null)} className="flex-1 py-2 px-4 border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-semibold rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="button" onClick={handleApplyFlatEdits} className="flex-1 py-2 px-4 bg-[#C9A227] hover:bg-[#B8860B] text-[#1A1800] text-sm font-bold rounded-lg transition-colors">
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
