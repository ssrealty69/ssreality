'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, Upload, Download, Save, Trash2, 
  Layers, CheckCircle, AlertTriangle, HelpCircle, 
  Map, Edit, Check, X, ShieldAlert, Loader2, ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Plot {
  number: string;
  status: 'available' | 'sold' | 'reserved';
  sizeGaj: number;
  isCorner: boolean;
  facing?: string;
  price?: number;
  notes?: string;
}

interface Block {
  blockName: string;
  plots: Plot[];
}

interface PlotPlanConfiguratorProps {
  property: {
    _id: string;
    title: string;
    location: {
      address: string;
      city: string;
    };
  };
  existingPlan?: {
    blocks: Block[];
  } | null;
}

export default function PlotPlanConfigurator({ 
  property, 
  existingPlan = null 
}: PlotPlanConfiguratorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [blocks, setBlocks] = useState<Block[]>(existingPlan?.blocks || []);
  const [selectedPlot, setSelectedPlot] = useState<{ blockIdx: number; plotIdx: number; plot: Plot } | null>(null);
  const [isEditingPlot, setIsEditingPlot] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states for editing a single plot
  const [editNumber, setEditNumber] = useState('');
  const [editStatus, setEditStatus] = useState<'available' | 'sold' | 'reserved'>('available');
  const [editSize, setEditSize] = useState<number>(100);
  const [editIsCorner, setEditIsCorner] = useState(false);
  const [editFacing, setEditFacing] = useState('');
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editNotes, setEditNotes] = useState('');

  // Template Excel Download Generator
  const handleDownloadTemplate = () => {
    const templateData = [
      { 
        'Block': 'Block A', 
        'Plot Number': 'A-1', 
        'Size (Gaj)': 100, 
        'Type (Corner/Standard)': 'Corner', 
        'Status (Available/Sold/Reserved)': 'Available', 
        'Facing (e.g. East)': 'North'
      },
      { 
        'Block': 'Block A', 
        'Plot Number': 'A-2', 
        'Size (Gaj)': 120, 
        'Type (Corner/Standard)': 'Standard', 
        'Status (Available/Sold/Reserved)': 'Available', 
        'Facing (e.g. East)': 'North'
      },
      { 
        'Block': 'Block A', 
        'Plot Number': 'A-3', 
        'Size (Gaj)': 120, 
        'Type (Corner/Standard)': 'Standard', 
        'Status (Available/Sold/Reserved)': 'Sold', 
        'Facing (e.g. East)': 'East'
      },
      { 
        'Block': 'Block B', 
        'Plot Number': 'B-1', 
        'Size (Gaj)': 150, 
        'Type (Corner/Standard)': 'Corner', 
        'Status (Available/Sold/Reserved)': 'Reserved', 
        'Facing (e.g. East)': 'South'
      },
      { 
        'Block': 'Block B', 
        'Plot Number': 'B-2', 
        'Size (Gaj)': 180, 
        'Type (Corner/Standard)': 'Standard', 
        'Status (Available/Sold/Reserved)': 'Available', 
        'Facing (e.g. East)': 'West'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    
    // Set column widths for readability
    worksheet['!cols'] = [
      { wch: 12 }, // Block
      { wch: 15 }, // Plot Number
      { wch: 12 }, // Size
      { wch: 22 }, // Type
      { wch: 28 }, // Status
      { wch: 20 }  // Facing
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Plotting Template');
    XLSX.writeFile(workbook, `SS_Realty_Plotting_Template_${property.title.replace(/\s+/g, '_')}.xlsx`);
    toast.success('Excel Plotting Template downloaded!');
  };

  // Excel File Parsing & Uploading
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const bstr = event.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<any>(worksheet);

        if (rows.length === 0) {
          toast.error('The uploaded Excel sheet contains no plotting data.');
          return;
        }

        // Map and validate rows into Block & Plot structures
        const blocksMap: { [key: string]: Plot[] } = {};

        rows.forEach((row, idx) => {
          const rawBlock = row['Block'] || 'Main Block';
          const blockName = String(rawBlock).trim();

          const plotNum = row['Plot Number'] || row['Plot Num'] || row['PlotNo'] || `Plot-${idx + 1}`;
          const number = String(plotNum).trim();

          const size = Number(row['Size (Gaj)']) || Number(row['Size']) || Number(row['Gaj']) || 100;
          
          const rawType = String(row['Type (Corner/Standard)'] || row['Type'] || 'Standard').toLowerCase().trim();
          const isCorner = rawType.includes('corner') || rawType === 'yes' || rawType === 'true';

          const rawStatus = String(row['Status (Available/Sold/Reserved)'] || row['Status'] || 'Available').toLowerCase().trim();
          let status: 'available' | 'sold' | 'reserved' = 'available';
          if (rawStatus.includes('sold') || rawStatus === 'booked') status = 'sold';
          else if (rawStatus.includes('reserve') || rawStatus.includes('hold')) status = 'reserved';

          const facing = row['Facing (e.g. East)'] || row['Facing'] ? String(row['Facing (e.g. East)'] || row['Facing']).trim() : undefined;
          const price = Number(row['Estimated Price (Lakhs)']) || Number(row['Price']) || undefined;
          const notes = row['Admin Notes'] || row['Notes'] ? String(row['Admin Notes'] || row['Notes']).trim() : undefined;

          if (!blocksMap[blockName]) {
            blocksMap[blockName] = [];
          }

          blocksMap[blockName].push({
            number,
            status,
            sizeGaj: size,
            isCorner,
            facing,
            price,
            notes
          });
        });

        // Convert the map to the blocks array state
        const parsedBlocks: Block[] = Object.keys(blocksMap).map(key => ({
          blockName: key,
          plots: blocksMap[key]
        }));

        setBlocks(parsedBlocks);
        toast.success(`Successfully uploaded ${rows.length} plots across ${parsedBlocks.length} blocks!`);
      } catch (err) {
        console.error('Error parsing excel sheet:', err);
        toast.error('Failed to parse Excel file. Please use the official template.');
      }
    };
    reader.readAsBinaryString(file);

    // Reset file input value so upload can be triggered again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Double Click toggler (Toggles status: Available -> Sold -> Reserved -> Available)
  const handleTogglePlotStatus = (blockIdx: number, plotIdx: number) => {
    const updatedBlocks = [...blocks];
    const plot = updatedBlocks[blockIdx].plots[plotIdx];

    let newStatus: 'available' | 'sold' | 'reserved' = 'available';
    if (plot.status === 'available') newStatus = 'sold';
    else if (plot.status === 'sold') newStatus = 'reserved';

    plot.status = newStatus;
    setBlocks(updatedBlocks);
    toast.success(`Plot ${plot.number} toggled to ${newStatus.toUpperCase()}`);
  };

  // Open Edit Modal/Card for a specific plot
  const handleOpenEditPlot = (blockIdx: number, plotIdx: number) => {
    const plot = blocks[blockIdx].plots[plotIdx];
    setSelectedPlot({ blockIdx, plotIdx, plot });
    setEditNumber(plot.number);
    setEditStatus(plot.status);
    setEditSize(plot.sizeGaj);
    setEditIsCorner(plot.isCorner);
    setEditFacing(plot.facing || '');
    setEditPrice(plot.price || 0);
    setEditNotes(plot.notes || '');
    setIsEditingPlot(true);
  };

  // Save manual plot edits
  const handleSavePlotEdits = () => {
    if (!selectedPlot) return;
    const { blockIdx, plotIdx } = selectedPlot;

    const updatedBlocks = [...blocks];
    updatedBlocks[blockIdx].plots[plotIdx] = {
      number: editNumber,
      status: editStatus,
      sizeGaj: editSize,
      isCorner: editIsCorner,
      facing: editFacing || undefined,
      price: editPrice || undefined,
      notes: editNotes || undefined
    };

    setBlocks(updatedBlocks);
    setIsEditingPlot(false);
    setSelectedPlot(null);
    toast.success('Plot details updated locally!');
  };

  // Save Full Layout to Database
  const handleSaveLayout = async () => {
    if (blocks.length === 0) {
      toast.error('Please configure or upload at least one block of plots before saving.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/plot-plans/${property._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blocks }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success('Plotting layout map saved successfully!');
        router.push('/admin/floor-plans');
      } else {
        toast.error(result.error || 'Failed to save plotting map');
      }
    } catch (err) {
      console.error('Error saving plot plan:', err);
      toast.error('Server error saving configuration');
    } finally {
      setSaving(false);
    }
  };

  // Calculate quick stats
  const stats = (() => {
    let total = 0;
    let sold = 0;
    let reserved = 0;
    blocks.forEach(b => {
      b.plots.forEach(p => {
        total++;
        if (p.status === 'sold') sold++;
        else if (p.status === 'reserved') reserved++;
      });
    });
    return {
      total,
      sold,
      reserved,
      available: total - sold - reserved
    };
  })();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start pb-12">
      
      {/* Sidebar Configurations (1/3 Width) */}
      <div className="lg:col-span-1 lg:sticky lg:top-6 self-start space-y-6">
        {/* Page Header Card */}
        <div className="bg-white border border-[#C9A227]/20 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <button 
            onClick={() => router.push('/admin/floor-plans')}
            className="p-2 bg-gray-50 border border-gray-100 hover:border-[#C9A227]/30 text-gray-600 hover:text-[#C9A227] rounded-xl transition-all cursor-pointer flex items-center justify-center"
            title="Back to Floor Plans list"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-md font-extrabold text-[#1A1800] leading-tight">Configure Plotting Layout Map</h1>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-none">Property: <strong className="text-gray-600 font-bold">{property.title}</strong></p>
          </div>
        </div>

        {/* Step 1: Template Download & Excel Upload */}
        <div className="bg-white border border-[#C9A227]/20 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-[#C9A227]/10 flex items-center justify-center text-[#C9A227]">
              <FileSpreadsheet size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Excel Spreadsheet Upload</h3>
              <p className="text-[10px] text-gray-400 font-medium">Quickly configure all plots at once</p>
            </div>
          </div>

          <div className="space-y-3.5 pt-1">
            {/* Download Button */}
            <button
              onClick={handleDownloadTemplate}
              className="w-full flex items-center justify-center gap-2 bg-[#FAF9F5] border border-[#C9A227]/30 hover:border-[#C9A227] hover:bg-[#C9A227]/5 text-gray-700 font-bold px-4 py-3 rounded-xl text-xs transition-all shadow-sm cursor-pointer select-none"
            >
              <Download size={14} className="text-[#C9A227]" />
              Download Excel Template
            </button>

            {/* Drag & Drop Upload Trigger Zone */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 hover:border-[#C9A227] bg-gray-50/50 hover:bg-[#FAF9F5]/40 rounded-xl p-5 text-center cursor-pointer transition-all space-y-2 group"
            >
              <Upload className="mx-auto h-8 w-8 text-gray-400 group-hover:text-[#C9A227] group-hover:scale-110 transition-all" />
              <div>
                <p className="text-xs font-bold text-gray-700">Click to upload plotted Excel sheet</p>
                <p className="text-[9px] text-gray-400 mt-1">Supports .xlsx and .xls file formats</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".xlsx, .xls" 
                className="hidden" 
              />
            </div>
          </div>
        </div>

        {/* Dynamic Occupancy Dashboard (Only shows when data is uploaded) */}
        {blocks.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-widest border-b border-gray-100 pb-2.5 flex items-center gap-2">
              <Layers size={15} className="text-[#C9A227]" />
              Plotting Statistics
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">Total Blocks</p>
                <p className="text-xl font-black text-gray-800">{blocks.length}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">Total Plots</p>
                <p className="text-xl font-black text-gray-800">{stats.total}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100 text-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mb-1"></span>
                <p className="text-[8px] text-gray-400 font-extrabold uppercase">Available</p>
                <p className="text-md font-bold text-emerald-600">{stats.available}</p>
              </div>
              <div className="bg-red-50/50 p-2.5 rounded-lg border border-red-100 text-center">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block mb-1"></span>
                <p className="text-[8px] text-gray-400 font-extrabold uppercase">Sold</p>
                <p className="text-md font-bold text-red-600">{stats.sold}</p>
              </div>
              <div className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-100 text-center">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block mb-1"></span>
                <p className="text-[8px] text-gray-400 font-extrabold uppercase">Hold</p>
                <p className="text-md font-bold text-amber-600">{stats.reserved}</p>
              </div>
            </div>
          </div>
        )}

        {/* Double-Click status instructions */}
        <div className="bg-[#FAF9F5] border border-[#C9A227]/20 rounded-2xl p-4 text-[11px] text-gray-600 space-y-2.5">
          <h4 className="font-bold text-gray-800 flex items-center gap-1">
            <HelpCircle size={14} className="text-[#C9A227]" />
            Configurator Rules & Guidelines
          </h4>
          <p>1. **Upload spreadsheet**: Download the template, specify block names, plot numbers, sizes, types, and upload.</p>
          <p>2. **Quick Status Change**: **Double-click** any plot card in the grid to instantly cycle its status: `Available` → `Sold` → `Reserved` → `Available`.</p>
          <p>3. **Detailed Mutation**: **Single-click** any plot card to open the detail panel and change numbers, sizes, corner tags, facing, prices, or admin notes.</p>
          <p>4. **Save Configuration**: Click **"Save Plotting Map"** to publish all changes to the database live.</p>
        </div>

        {/* Global Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSaveLayout}
            disabled={saving || blocks.length === 0}
            className="flex-1 bg-[#C9A227] hover:bg-[#B8860B] text-[#1A1800] font-extrabold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 select-none hover:scale-[1.01] active:scale-[0.99]"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Save Plotting Map
          </button>
        </div>

      </div>

      {/* Main Grid View & Previewer (2/3 Width) */}
      <div className="lg:col-span-2 space-y-6">
        
        {blocks.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[400px] space-y-5">
            <div className="w-16 h-16 rounded-full bg-[#C9A227]/10 text-[#C9A227] flex items-center justify-center">
              <Map size={32} />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h3 className="text-lg font-bold text-gray-800">No Plotted Layout Configured</h3>
              <p className="text-xs text-gray-400">Please download the template Excel sheet, fill in your residential/commercial plot layouts (Block, Number, Gaj Size, corner flags), and upload here to preview the layout grid.</p>
            </div>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#C9A227] hover:bg-[#B8860B] text-[#1A1800] font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-md transition-colors cursor-pointer select-none"
            >
              Upload Plotted Excel
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {blocks.map((block, blockIdx) => (
              <div 
                key={blockIdx} 
                className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow duration-300"
              >
                {/* Block header */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-[#C9A227]" />
                    <h3 className="font-extrabold text-md text-gray-800 uppercase tracking-wide font-[var(--font-playfair)]">
                      {block.blockName}
                    </h3>
                  </div>
                  <span className="px-3 py-1 bg-gray-50 border border-gray-200/50 rounded-lg text-xs font-bold text-gray-500">
                    {block.plots.length} Plots
                  </span>
                </div>

                {/* Plotted visual map grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {block.plots.map((plot, plotIdx) => {
                    const isAvailable = plot.status === 'available';
                    const isReserved = plot.status === 'reserved';
                    const isSold = plot.status === 'sold';

                    let topBarColor = 'bg-emerald-500 shadow-[0_0_6px_#10B981]';
                    let cardStyle = 'bg-white border border-gray-200/80 text-emerald-800 hover:border-emerald-500 hover:bg-emerald-50/10 shadow-sm';
                    
                    if (isSold) {
                      topBarColor = 'bg-red-600 shadow-[0_0_8px_#DC2626]';
                      cardStyle = 'bg-red-50/90 border border-red-300/80 text-red-800 shadow-[inset_0_0_4px_rgba(220,38,38,0.05)]';
                    } else if (isReserved) {
                      topBarColor = 'bg-amber-500 shadow-[0_0_6px_#F59E0B]';
                      cardStyle = 'bg-white border border-gray-200/80 text-amber-800 hover:border-amber-500 hover:bg-amber-50/10 shadow-sm';
                    }

                    return (
                      <div
                        key={plotIdx}
                        onDoubleClick={() => handleTogglePlotStatus(blockIdx, plotIdx)}
                        onClick={() => handleOpenEditPlot(blockIdx, plotIdx)}
                        className={`rounded-xl overflow-hidden relative flex flex-col justify-center min-h-[95px] pt-3.5 pb-2.5 px-4 cursor-pointer select-none transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${cardStyle}`}
                        title="Double-click to cycle status, single-click to edit"
                      >
                        <div className={`absolute top-0 inset-x-0 h-1.5 ${topBarColor}`} />

                        {/* Plot Number */}
                        <span className={`font-extrabold text-sm tracking-wider block ${isSold ? 'text-red-700 line-through decoration-red-500 decoration-2' : 'text-gray-900'}`}>
                          Plot {plot.number}
                        </span>

                        {/* Plot Area Size in Gaj */}
                        <span className={`text-[10px] font-bold mt-1 block ${isSold ? 'text-red-600/70 line-through' : 'text-gray-400'}`}>
                          {plot.sizeGaj} Gaj
                        </span>

                        {/* Corner Ribbon */}
                        {plot.isCorner && (
                          <span className="absolute top-2.5 right-2 px-1.5 py-0.5 bg-amber-500 text-white rounded text-[7px] font-black uppercase tracking-wider shadow-[0_1px_3px_rgba(245,158,11,0.2)]">
                            CORNER
                          </span>
                        )}

                        {/* Small Status tags */}
                        {isAvailable && (
                          <span className="absolute bottom-2 right-2.5 w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_4px_#10B981]"></span>
                        )}
                        {isReserved && (
                          <span className="absolute bottom-2 right-2.5 w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_4px_#F59E0B]"></span>
                        )}
                        {isSold && (
                          <span className="absolute bottom-2 right-2.5 px-2 py-0.5 bg-red-600 text-white rounded-md text-[8px] font-black uppercase tracking-widest shadow-[0_2px_6px_rgba(220,38,38,0.3)] animate-pulse">
                            SOLD
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Step 3: Single Plot detailed Editor Popover Modal */}
      {isEditingPlot && selectedPlot && (
        <div className="fixed inset-0 bg-[#0d0c00]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white border border-[#C9A227]/30 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-[#C9A227]" />
            
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-5">
              <div>
                <h3 className="text-md font-bold text-gray-800 flex items-center gap-1.5">
                  <Edit size={16} className="text-[#C9A227]" />
                  Edit Plot details
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Plot {selectedPlot.plot.number} configuration</p>
              </div>
              <button 
                onClick={() => {
                  setIsEditingPlot(false);
                  setSelectedPlot(null);
                }}
                className="p-1.5 bg-gray-50 border border-gray-100 hover:border-gray-200 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Plot Number & Size */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-extrabold uppercase">Plot Number</label>
                  <input
                    type="text"
                    value={editNumber}
                    onChange={(e) => setEditNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C9A227] text-sm text-gray-800 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-extrabold uppercase">Size (Gaj)</label>
                  <input
                    type="number"
                    value={editSize}
                    onChange={(e) => setEditSize(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C9A227] text-sm text-gray-800 font-bold"
                  />
                </div>
              </div>

              {/* Status & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-extrabold uppercase">Availability Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C9A227] text-sm text-gray-800 font-extrabold cursor-pointer"
                  >
                    <option value="available">🟢 Available</option>
                    <option value="sold">🔴 Sold</option>
                    <option value="reserved">🟡 Reserved/Hold</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-extrabold uppercase">Plot Type</label>
                  <select
                    value={editIsCorner ? 'true' : 'false'}
                    onChange={(e) => setEditIsCorner(e.target.value === 'true')}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C9A227] text-sm text-gray-800 font-extrabold cursor-pointer"
                  >
                    <option value="false">Standard/Middle</option>
                    <option value="true">👑 Corner Plot</option>
                  </select>
                </div>
              </div>

              {/* Facing & Estimated Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-extrabold uppercase">Facing Direction</label>
                  <input
                    type="text"
                    placeholder="e.g. East, North"
                    value={editFacing}
                    onChange={(e) => setEditFacing(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C9A227] text-sm text-gray-800 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-extrabold uppercase">Estimated Price (Lakhs)</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C9A227] text-sm text-gray-800 font-bold"
                  />
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-extrabold uppercase">Admin/Customer Notes</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. facing 24m wide road, park facing"
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C9A227] text-sm text-gray-800 font-semibold"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSavePlotEdits}
                  className="flex-1 bg-[#C9A227] hover:bg-[#B8860B] text-[#1A1800] font-extrabold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01] active:scale-[0.99] select-none text-xs"
                >
                  <Check size={14} className="stroke-[2.5]" />
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditingPlot(false);
                    setSelectedPlot(null);
                  }}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-gray-700 font-bold rounded-xl transition-all cursor-pointer text-xs"
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
