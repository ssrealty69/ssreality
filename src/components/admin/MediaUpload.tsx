'use client';

import { useState, useRef } from 'react';
import { UploadCloud, X, FileText, Loader2, Image as ImageIcon, Plus, Trash2, GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface MediaUploadProps {
  label: string;
  description?: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}

export function MediaUpload({ label, description, value, onChange, folder = 'ss-realty/properties' }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file) return;
    
    // Validate size (max 10MB for premium smooth client experience)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onChange(data.url);
        toast.success('Image uploaded and optimized successfully!');
      } else {
        toast.error(data.error || 'Failed to upload image.');
      }
    } catch (err) {
      console.error('[Upload Client Error]', err);
      toast.error('Connection error during upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-3 p-5 rounded-2xl border border-gray-100 bg-gray-50/30 transition-all hover:bg-gray-50/60 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-bold text-gray-800">{label}</label>
          {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>
        {value && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full shrink-0">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            Image Saved
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Upload Zone */}
        <div 
          className={`md:col-span-2 relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all cursor-pointer select-none duration-300 ${
            dragActive ? 'border-[#C9A227] bg-[#C9A227]/5 scale-[0.99]' : 'border-gray-300 hover:border-[#C9A227] bg-white'
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden" 
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <Loader2 className="animate-spin text-[#C9A227]" size={32} />
              <span className="text-xs font-semibold text-gray-500">Uploading & Optimizing...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-2.5 rounded-full bg-amber-50 text-[#C9A227] transition-transform duration-300 group-hover:scale-110">
                <UploadCloud size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-700">Drag & Drop Image or Click to Browse</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Supports WebP, PNG, JPG (Max 10MB)</p>
              </div>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className="flex flex-col items-center justify-center border border-gray-200 rounded-xl bg-white p-3 h-full min-h-[120px] relative group overflow-hidden shadow-inner">
          {value ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={value} 
                alt="Upload Preview" 
                className="w-full h-24 object-cover rounded-lg shadow-sm bg-gray-50 border border-gray-100 transition-transform duration-500 group-hover:scale-105"
                onError={(e) => { e.currentTarget.style.opacity = '0.3'; e.currentTarget.title = 'Image failed to load'; }}
              />
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-transform duration-200 hover:scale-110 shadow-md"
                title="Remove image"
              >
                <X size={12} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center text-gray-300 gap-1">
              <ImageIcon size={32} />
              <span className="text-[10px] font-semibold">No Image Selected</span>
            </div>
          )}
        </div>
      </div>

      {/* Manual Input Fallback */}
      <div className="flex flex-col gap-1 pt-1">
        <label className="text-[10px] font-bold text-gray-500">Or Paste Image URL Address:</label>
        <input 
          type="url" 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.webp"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#C9A227] transition-all bg-white"
        />
      </div>
    </div>
  );
}

interface PdfUploadProps {
  label: string;
  description?: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}

export function PdfUpload({ label, description, value, onChange, folder = 'ss-realty/properties' }: PdfUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF documents are allowed.');
      return;
    }

    // Limit to 20MB for brochure PDFs
    if (file.size > 20 * 1024 * 1024) {
      toast.error('PDF exceeds 20MB limit.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onChange(data.url);
        toast.success('Brochure PDF uploaded successfully!');
      } else {
        toast.error(data.error || 'Failed to upload PDF.');
      }
    } catch (err) {
      console.error('[PDF Upload Error]', err);
      toast.error('Connection error during brochure upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const getFileName = (url: string) => {
    if (!url) return '';
    try {
      const decoded = decodeURIComponent(url);
      return decoded.substring(decoded.lastIndexOf('/') + 1);
    } catch {
      return 'brochure.pdf';
    }
  };

  return (
    <div className="space-y-3 p-5 rounded-2xl border border-gray-100 bg-gray-50/30 transition-all hover:bg-gray-50/60 duration-300">
      <div>
        <label className="block text-sm font-bold text-gray-800">{label}</label>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Upload Zone */}
        <div 
          className={`md:col-span-2 relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all cursor-pointer select-none duration-300 ${
            dragActive ? 'border-[#C9A227] bg-[#C9A227]/5 scale-[0.99]' : 'border-gray-300 hover:border-[#C9A227] bg-white'
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf"
            className="hidden" 
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <Loader2 className="animate-spin text-[#C9A227]" size={32} />
              <span className="text-xs font-semibold text-gray-500">Uploading PDF Document...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-2.5 rounded-full bg-red-50 text-red-500 transition-transform duration-300">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-700">Drag & Drop Brochure PDF or Click to Browse</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Supports PDF Only (Max 20MB)</p>
              </div>
            </div>
          )}
        </div>

        {/* Document Status */}
        <div className="flex flex-col items-center justify-center border border-gray-200 rounded-xl bg-white p-3 h-full min-h-[180px] relative shadow-inner overflow-hidden">
          {value ? (
            <div className="flex flex-col items-center text-center gap-2 w-full h-full">
              {/* Embedded PDF Google Docs viewer iframe for 100% robust cross-origin preview */}
              <div className="w-full h-28 rounded-lg border border-gray-100 overflow-hidden bg-gray-50 shadow-inner">
                <iframe 
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(value)}&embedded=true`} 
                  className="w-full h-full border-none"
                  title="PDF Preview"
                />
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[10px] font-bold text-gray-700 truncate max-w-[150px]" title={getFileName(value)}>
                  {getFileName(value)}
                </span>
                <a 
                  href={value} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[10px] text-[#C9A227] hover:underline font-bold"
                >
                  View PDF File
                </a>
              </div>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-transform duration-200 hover:scale-110 shadow-md z-10"
                title="Remove brochure"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center text-gray-300 gap-1">
              <FileText size={32} />
              <span className="text-[10px] font-semibold text-center">No PDF Uploaded</span>
            </div>
          )}
        </div>
      </div>

      {/* Manual Input Fallback */}
      <div className="flex flex-col gap-1 pt-1">
        <label className="text-[10px] font-bold text-gray-500">Or Paste Brochure File URL:</label>
        <input 
          type="url" 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/brochure.pdf"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#C9A227] transition-all bg-white"
        />
      </div>
    </div>
  );
}

interface MultiImageUploadProps {
  label: string;
  description?: string;
  images: string[];
  onChange: (images: string[]) => void;
  folder?: string;
}

export function MultiImageUpload({ label, description, images, onChange, folder = 'ss-realty/properties' }: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [canDrag, setCanDrag] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds the 10MB limit and was skipped.`);
        continue;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.success) {
          uploadedUrls.push(data.url);
        } else {
          toast.error(data.error || `Failed to upload ${file.name}`);
        }
      } catch (err) {
        console.error('[Multi-Upload Error]', err);
        toast.error(`Connection error uploading ${file.name}`);
      }
    }

    if (uploadedUrls.length > 0) {
      // Filter out empty URLs in the existing images and append newly uploaded URLs
      const cleanedExisting = images.filter(url => url.trim() !== '');
      onChange([...cleanedExisting, ...uploadedUrls]);
      toast.success(`Successfully uploaded ${uploadedUrls.length} image(s)!`);
    }
    setUploading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleUpload(e.target.files);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    // Ensure we keep at least one empty string if the array is totally empty to preserve inputs
    onChange(updated.length > 0 ? updated : ['']);
    toast.success('Image removed');
  };

  const handleManualUrlChange = (idx: number, url: string) => {
    const updated = [...images];
    updated[idx] = url;
    onChange(updated);
  };

  const handleAddManualInput = () => {
    onChange([...images, '']);
  }; 

  // Drag and drop logic
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setCanDrag(false);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = draggedIndex;
    if (sourceIndex === null || sourceIndex === targetIndex) return;

    const updated = [...images];
    const [draggedItem] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, draggedItem);

    onChange(updated);
    handleDragEnd();
    toast.success('Images reordered');
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    onChange(updated);
    toast.success('Images reordered');
  };

  return (
    <div className="space-y-4 p-5 rounded-2xl border border-gray-100 bg-gray-50/30 transition-all hover:bg-gray-50/60 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-3">
        <div>
          <label className="block text-sm font-bold text-gray-800">{label}</label>
          {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
          {images.filter(u => u.trim() !== '').length > 0 && (
            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full w-fit">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              {images.filter(u => u.trim() !== '').length} photo{images.filter(u => u.trim() !== '').length !== 1 ? 's' : ''} saved
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            multiple
            className="hidden" 
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 bg-[#C9A227] hover:bg-[#B8860B] text-[#1A1800] text-xs font-bold px-3.5 py-2 rounded-lg transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-75"
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" size={14} />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <UploadCloud size={14} />
                <span>Upload Photos</span>
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={handleAddManualInput}
            className="flex items-center gap-1 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-bold px-3 py-2 rounded-lg transition-all"
          >
            <Plus size={14} /> Add Link Field
          </button>
        </div>
      </div>

      {/* Grid of uploaded images / link inputs */}
      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-10 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
          <div className="p-3 rounded-full bg-gray-100">
            <ImageIcon size={28} className="text-gray-300" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-400">No images uploaded yet</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Click &ldquo;Upload Photos&rdquo; above to add images</p>
          </div>
        </div>
      ) : ( 
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((url, index) => (
            <div 
              key={index} 
              draggable={canDrag}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, index)}
              className={`flex flex-col border rounded-xl bg-white overflow-hidden shadow-sm hover:shadow transition-all relative group duration-300 ${
                draggedIndex === index ? 'opacity-30 border-dashed border-[#C9A227] scale-[0.98]' : 'border-gray-200'
              } ${
                dragOverIndex === index ? 'border-[#C9A227] scale-[1.03] ring-4 ring-[#C9A227]/15 shadow-md' : ''
              }`}
            >
              {/* Image Preview Container */}
              <div className="h-28 bg-gray-50 flex items-center justify-center overflow-hidden relative shadow-inner">
                {url ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={url} 
                      alt={`${label} ${index + 1}`} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { e.currentTarget.style.opacity = '0.3'; }}
                    />
                    
                    {/* Drag & Reorder buttons inside a sleek glass pill in top-left */}
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white rounded-lg p-0.5 shadow-md z-10">
                      <div 
                        onMouseDown={() => setCanDrag(true)}
                        onMouseUp={() => setCanDrag(false)}
                        onTouchStart={() => setCanDrag(true)}
                        onTouchEnd={() => setCanDrag(false)}
                        className="p-1 hover:bg-white/20 rounded cursor-grab active:cursor-grabbing transition-colors duration-200"
                        title="Drag handle to reorder"
                      >
                        <GripVertical size={14} />
                      </div>
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={(e) => { e.stopPropagation(); handleMove(index, 'left'); }}
                        className="p-1 hover:bg-white/20 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors duration-200"
                        title="Move earlier"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <button
                        type="button"
                        disabled={index === images.length - 1}
                        onClick={(e) => { e.stopPropagation(); handleMove(index, 'right'); }}
                        className="p-1 hover:bg-white/20 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors duration-200"
                        title="Move later"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-90 group-hover:opacity-100 hover:scale-110 shadow transition-all duration-200 z-10"
                      title="Remove Photo"
                    >
                      <Trash2 size={12} />
                    </button>
                    <span className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/60 text-white text-[9px] font-bold rounded">
                      Photo #{index + 1}
                    </span>
                  </>
                ) : (
                  <>
                    {/* Drag controls for empty inputs so they can also be rearranged */}
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white rounded-lg p-0.5 shadow-md z-10">
                      <div 
                        onMouseDown={() => setCanDrag(true)}
                        onMouseUp={() => setCanDrag(false)}
                        onTouchStart={() => setCanDrag(true)}
                        onTouchEnd={() => setCanDrag(false)}
                        className="p-1 hover:bg-white/20 rounded cursor-grab active:cursor-grabbing transition-colors duration-200"
                        title="Drag handle to reorder"
                      >
                        <GripVertical size={14} />
                      </div>
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={(e) => { e.stopPropagation(); handleMove(index, 'left'); }}
                        className="p-1 hover:bg-white/20 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors duration-200"
                        title="Move earlier"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <button
                        type="button"
                        disabled={index === images.length - 1}
                        onClick={(e) => { e.stopPropagation(); handleMove(index, 'right'); }}
                        className="p-1 hover:bg-white/20 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors duration-200"
                        title="Move later"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-90 hover:scale-110 shadow transition-all duration-200 z-10"
                      title="Remove Field"
                    >
                      <Trash2 size={12} />
                    </button>

                    <div className="flex flex-col items-center text-gray-300 gap-1">
                      <ImageIcon size={28} />
                      <span className="text-[9px] font-bold text-gray-400">Paste URL below</span>
                    </div>
                  </>
                )}
              </div>

              {/* Link Text Input Fallback */}
              <div className="p-2 border-t border-gray-100 bg-gray-50/30">
                <input 
                  type="url"
                  value={url}
                  onChange={(e) => handleManualUrlChange(index, e.target.value)}
                  placeholder="https://example.com/gallery.jpg"
                  className="w-full border border-gray-300 rounded-md px-2.5 py-1 text-[10px] outline-none focus:ring-1 focus:ring-[#C9A227] transition-all bg-white"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
