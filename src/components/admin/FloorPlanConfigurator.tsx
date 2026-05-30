'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layers, Copy, Check, Save, Info, RefreshCw, X, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

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

interface Property {
  _id: string;
  title: string;
  location: {
    city: string;
  };
}

interface FloorPlanConfiguratorProps {
  property: Property;
  existingPlan?: {
    totalFloors: number;
    flatsPerFloor: number;
    floors: Floor[];
  };
}

export default function FloorPlanConfigurator({ 
  property, 
  existingPlan 
}: FloorPlanConfiguratorProps) {
  const router = useRouter();
  
  // Setup inputs
  const [totalFloorsInput, setTotalFloorsInput] = useState(existingPlan?.totalFloors || 5);
  const [flatsPerFloorInput, setFlatsPerFloorInput] = useState(existingPlan?.flatsPerFloor || 4);
  const [numberingStyle, setNumberingStyle] = useState<'prefix' | 'simple'>('prefix');
  const [defaultBhk, setDefaultBhk] = useState<number>(2); // Default 2 BHK

  // Core floor state
  const [floors, setFloors] = useState<Floor[]>(existingPlan?.floors || []);
  const [isGenerated, setIsGenerated] = useState(!!existingPlan);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Modal Editing Flat State
  const [editingFlat, setEditingFlat] = useState<{
    floorIndex: number;
    flatIndex: number;
    number: string;
    status: 'available' | 'sold' | 'reserved';
    bedrooms?: number;
    price?: string;
    notes?: string;
  } | null>(null);

  // Generate blank layout grid
  const handleGenerateGrid = () => {
    if (floors.length > 0 && !confirm('Generating a new layout will overwrite any existing flat configurations. Proceed?')) {
      return;
    }

    const generatedFloors: Floor[] = [];
    // Loop through floor numbers (0 is Ground, 1 is 1st floor...)
    for (let i = 0; i < totalFloorsInput; i++) {
      const floorNum = i;
      const floorName = floorNum === 0 
        ? 'Ground Floor' 
        : floorNum === 1 
          ? '1st Floor' 
          : floorNum === 2 
            ? '2nd Floor' 
            : floorNum === 3 
              ? '3rd Floor' 
              : `${floorNum}th Floor`;

      const flats: Flat[] = [];
      for (let j = 1; j <= flatsPerFloorInput; j++) {
        let flatNum = '';
        if (numberingStyle === 'prefix') {
          flatNum = floorNum === 0 ? `G-${j}` : `${floorNum}0${j}`;
        } else {
          // simple continuous numbers
          flatNum = (floorNum * flatsPerFloorInput + j).toString();
        }

        flats.push({
          number: flatNum,
          status: 'available',
          bedrooms: defaultBhk > 0 ? defaultBhk : undefined,
        });
      }

      generatedFloors.push({
        floorNumber: floorNum,
        floorName,
        flats
      });
    }

    setFloors(generatedFloors);
    setIsGenerated(true);
    toast.success('Visual building grid generated successfully');
  };

  // Open single flat editor
  const handleOpenFlatEditor = (floorIndex: number, flatIndex: number, flat: Flat) => {
    setEditingFlat({
      floorIndex,
      flatIndex,
      number: flat.number,
      status: flat.status,
      bedrooms: flat.bedrooms,
      price: flat.price ? flat.price.toString() : '',
      notes: flat.notes || '',
    });
  };

  // Apply single flat modal edits
  const handleApplyFlatEdits = () => {
    if (!editingFlat) return;
    const { floorIndex, flatIndex, number, status, bedrooms, price, notes } = editingFlat;

    if (!number.trim()) {
      toast.error('Flat number is required');
      return;
    }

    setFloors(prev => {
      const updated = [...prev];
      updated[floorIndex].flats[flatIndex] = {
        number: number.trim(),
        status,
        bedrooms: bedrooms ? Number(bedrooms) : undefined,
        price: price && price.trim() ? Number(price) : undefined,
        notes: notes?.trim() || undefined,
      };
      return updated;
    });

    setEditingFlat(null);
    toast.success(`Flat ${number} updated successfully`);
  };

  // Quick toggle flat status (click to toggle directly from available <-> sold for speed!)
  const handleQuickToggleStatus = (floorIndex: number, flatIndex: number) => {
    setFloors(prev => {
      const updated = [...prev];
      const flat = updated[floorIndex].flats[flatIndex];
      // Toggle between available and sold
      flat.status = flat.status === 'available' ? 'sold' : flat.status === 'sold' ? 'reserved' : 'available';
      return updated;
    });
  };

  // Save full configuration
  const handleSaveConfiguration = async () => {
    if (floors.length === 0) {
      toast.error('Please generate and configure your building grid first');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/floor-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property._id,
          totalFloors: floors.length,
          flatsPerFloor: floors[0].flats.length,
          floors
        })
      });

      if (res.ok) {
        toast.success('Floor plan layout saved successfully');
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  // Copy shareable link
  const handleCopyLink = () => {
    const link = `${window.location.origin}/floor-plans/${property._id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Client-sharing link copied to clipboard!');
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Configuration Sidebar */}
      <div className="lg:col-span-1 lg:sticky lg:top-6 self-start space-y-6">
        {/* Page Header Card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <button 
            onClick={() => router.push('/admin/floor-plans')}
            className="p-2 bg-gray-50 border border-gray-100 hover:border-[#C9A227]/30 text-gray-600 hover:text-[#C9A227] rounded-xl transition-all cursor-pointer flex items-center justify-center"
            title="Back to Floor Plans list"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-md font-extrabold text-[#1A1800] leading-tight">Configure Floor Plan</h1>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-none">Property: <strong className="text-gray-600 font-bold">{property.title}</strong></p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-md font-bold text-gray-800 flex items-center gap-2">
            <Layers size={18} className="text-[#C9A227]" />
            Building Structure
          </h2>
          
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Total Floors</label>
              <input
                type="number"
                min={1}
                max={50}
                value={totalFloorsInput}
                onChange={(e) => setTotalFloorsInput(Math.max(1, Number(e.target.value)))}
                disabled={isGenerated && floors.length > 0}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#C9A227] disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Flats per Floor</label>
              <input
                type="number"
                min={1}
                max={20}
                value={flatsPerFloorInput}
                onChange={(e) => setFlatsPerFloorInput(Math.max(1, Number(e.target.value)))}
                disabled={isGenerated && floors.length > 0}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#C9A227] disabled:opacity-60"
              />
            </div>

            {!isGenerated && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Default Flat Type</label>
                  <select
                    value={defaultBhk}
                    onChange={(e) => setDefaultBhk(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#C9A227]"
                  >
                    <option value={1}>1 BHK</option>
                    <option value={2}>2 BHK</option>
                    <option value={3}>3 BHK</option>
                    <option value={4}>4 BHK</option>
                    <option value={0}>Commercial/Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Numbering Pattern</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setNumberingStyle('prefix')}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                        numberingStyle === 'prefix'
                          ? 'bg-[#C9A227]/10 border-[#C9A227] text-[#C9A227]'
                          : 'bg-gray-50 border-gray-200 text-gray-600'
                      }`}
                    >
                      Floor prefix (e.g. 101)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNumberingStyle('simple')}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                        numberingStyle === 'simple'
                          ? 'bg-[#C9A227]/10 border-[#C9A227] text-[#C9A227]'
                          : 'bg-gray-50 border-gray-200 text-gray-600'
                      }`}
                    >
                      Continuous (e.g. 1, 2)
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {!isGenerated ? (
            <button
              onClick={handleGenerateGrid}
              className="w-full py-2.5 bg-[#C9A227] hover:bg-[#B8860B] text-[#1A1800] font-bold rounded-xl transition-colors shadow-sm text-sm"
            >
              Generate Layout Grid
            </button>
          ) : (
            <button
              onClick={() => setIsGenerated(false)}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={14} />
              Reconfigure Structure
            </button>
          )}
        </div>

        {/* Dynamic Help Panel */}
        {isGenerated && (
          <div className="bg-[#1A1800]/5 border border-[#1A1800]/10 rounded-2xl p-4 text-xs text-gray-600 space-y-2">
            <h3 className="font-bold text-gray-700 flex items-center gap-1.5">
              <Info size={14} className="text-[#C9A227]" />
              Quick Toggles
            </h3>
            <ul className="list-disc pl-4 space-y-1.5">
              <li><strong>Double click</strong> a unit card to quickly toggle its availability status (`Available` → `Sold` → `Reserved`).</li>
              <li><strong>Single click</strong> a unit card to edit custom BHK tags, prices, flat numbers, and admin details.</li>
              <li>Always remember to click the <strong>Save Layout</strong> button below after changes!</li>
            </ul>
          </div>
        )}

        {/* Action Controls */}
        {isGenerated && (
          <div className="space-y-2">
            <button
              onClick={handleSaveConfiguration}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-[#C9A227] hover:bg-[#B8860B] text-[#1A1800] font-bold py-3.5 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] text-sm disabled:opacity-75"
            >
              <Save size={18} />
              {saving ? 'Saving changes...' : 'Save Layout Plan'}
            </button>

            {existingPlan && (
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold py-3.5 rounded-xl transition-colors text-sm"
              >
                {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                {copied ? 'Copied Client Link!' : 'Copy Client-Share Link'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Building Layout Grid View */}
      <div className="lg:col-span-3">
        {floors.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm flex flex-col items-center justify-center space-y-4">
            <Layers size={48} className="text-gray-300" />
            <div>
              <h3 className="text-lg font-bold text-gray-800">Building Floor Plan Grid</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-sm">Use the left settings panel to set up your floor and flat quantities, then generate the interactive availability grid.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-bold text-gray-800">Building Stack Diagram</h3>
                <p className="text-xs text-gray-500 mt-0.5">Top-to-bottom layout visualization</p>
              </div>
              <div className="flex gap-4 text-xs font-semibold text-gray-500">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-300 inline-block"></span> Available</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-50 border border-red-300 inline-block"></span> Sold</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-50 border border-amber-300 inline-block"></span> Reserved</span>
              </div>
            </div>

            {/* Vertical floor stacking: Reverse loop (from top floor to bottom floor) */}
            <div className="space-y-4">
              {floors.slice().reverse().map((floor, rIndex) => {
                const actualFloorIndex = floors.length - 1 - rIndex;
                return (
                  <div key={floor.floorNumber} className="flex flex-col sm:flex-row sm:items-center gap-3 bg-gray-50/40 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    {/* Floor Label */}
                    <div className="sm:w-32 flex-shrink-0 font-bold text-gray-700 text-sm border-b sm:border-b-0 sm:border-r border-gray-200 pb-2 sm:pb-0 sm:pr-4">
                      {floor.floorName}
                    </div>

                    {/* Floor flats row */}
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                      {floor.flats.map((flat, flatIndex) => {
                        let statusColor = 'bg-emerald-50/50 border-emerald-300 text-emerald-800 hover:bg-emerald-50';
                        if (flat.status === 'sold') {
                          statusColor = 'bg-red-50/40 border-red-200 text-gray-500 line-through hover:bg-red-50/70';
                        } else if (flat.status === 'reserved') {
                          statusColor = 'bg-amber-50/50 border-amber-300 text-amber-800 hover:bg-amber-50';
                        }

                        return (
                          <div
                            key={flatIndex}
                            onClick={() => handleOpenFlatEditor(actualFloorIndex, flatIndex, flat)}
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              handleQuickToggleStatus(actualFloorIndex, flatIndex);
                            }}
                            className={`p-3 rounded-lg border text-center cursor-pointer transition-all hover:scale-[1.03] select-none shadow-sm relative group ${statusColor}`}
                          >
                            {/* Flat Details */}
                            <div className="font-bold text-sm tracking-wide">{flat.number}</div>
                            {flat.bedrooms ? (
                              <div className="text-[10px] font-semibold mt-0.5 text-gray-500 group-hover:text-gray-700">
                                {flat.bedrooms} BHK
                              </div>
                            ) : (
                              <div className="text-[10px] font-semibold mt-0.5 text-gray-400">---</div>
                            )}
                            {flat.price && (
                              <div className="text-[9px] font-bold text-gray-600 mt-1">
                                ₹{flat.price} L
                              </div>
                            )}

                            {/* Badge Indicators for hover/sold */}
                            {flat.status === 'sold' && (
                              <div className="absolute top-1 right-1 px-1 bg-red-600 text-white rounded text-[8px] font-bold uppercase scale-75 select-none line-through">
                                Sold
                              </div>
                            )}
                            {flat.status === 'reserved' && (
                              <div className="absolute top-1 right-1 px-1 bg-amber-500 text-white rounded text-[8px] font-bold uppercase scale-75 select-none">
                                Book
                              </div>
                            )}
                            {flat.notes && (
                              <span className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full" title={flat.notes}></span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Popover Flat Editor Modal */}
      {editingFlat && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#1A1800] px-6 py-4 flex items-center justify-between text-white border-b border-white/5">
              <h3 className="font-bold text-md font-[var(--font-playfair)]">
                Configure Unit: Flat {editingFlat.number}
              </h3>
              <button 
                onClick={() => setEditingFlat(null)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <div className="p-6 space-y-4">
              {/* Flat number & size */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Unit Number</label>
                  <input
                    type="text"
                    value={editingFlat.number}
                    onChange={(e) => setEditingFlat(prev => prev ? { ...prev, number: e.target.value } : null)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#C9A227]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">BHK Bedrooms</label>
                  <select
                    value={editingFlat.bedrooms || ''}
                    onChange={(e) => setEditingFlat(prev => prev ? { ...prev, bedrooms: e.target.value ? Number(e.target.value) : undefined } : null)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#C9A227]"
                  >
                    <option value="">Commercial / Plot</option>
                    <option value={1}>1 BHK</option>
                    <option value={2}>2 BHK</option>
                    <option value={3}>3 BHK</option>
                    <option value={4}>4 BHK</option>
                    <option value={5}>5 BHK</option>
                  </select>
                </div>
              </div>

              {/* Status Picker segmented control */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Availability Status</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingFlat(prev => prev ? { ...prev, status: 'available' } : null)}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1 ${
                      editingFlat.status === 'available'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Available
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingFlat(prev => prev ? { ...prev, status: 'sold' } : null)}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1 ${
                      editingFlat.status === 'sold'
                        ? 'bg-red-50 border-red-500 text-red-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Sold Out
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingFlat(prev => prev ? { ...prev, status: 'reserved' } : null)}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1 ${
                      editingFlat.status === 'reserved'
                        ? 'bg-amber-50 border-amber-500 text-amber-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Reserved
                  </button>
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
                    onChange={(e) => setEditingFlat(prev => prev ? { ...prev, price: e.target.value } : null)}
                    placeholder="e.g. 55"
                    className="w-full pl-6 pr-12 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#C9A227]"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-400 font-bold">Lakh</span>
                </div>
              </div>

              {/* Private note */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Private Notes / Booking Details</label>
                <textarea
                  value={editingFlat.notes}
                  onChange={(e) => setEditingFlat(prev => prev ? { ...prev, notes: e.target.value } : null)}
                  placeholder="e.g. Sold to Mr. Roy, Booking token received."
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#C9A227] resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingFlat(null)}
                  className="flex-1 py-2 px-4 border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyFlatEdits}
                  className="flex-1 py-2 px-4 bg-[#C9A227] hover:bg-[#B8860B] text-[#1A1800] text-sm font-bold rounded-lg transition-colors"
                >
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
