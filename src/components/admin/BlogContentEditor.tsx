'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Link2, Unlink, Image as ImageIcon, Heading1, Heading2, Heading3, 
  Quote, Type, Eye, Code, Palette, Loader2, Eraser, Minus, Check
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BlogContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function BlogContentEditor({ value, onChange, placeholder = 'Write your blog post here...' }: BlogContentEditorProps) {
  const [showHtml, setShowHtml] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeFormats, setActiveFormats] = useState<string[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<'headings' | 'size' | 'color' | 'font' | 'lists' | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('#1A1800');
  
  // ── Image Customization States ──
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [imageLinkUrl, setImageLinkUrl] = useState<string>('');
  const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number } | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = (name: 'headings' | 'size' | 'color' | 'font' | 'lists') => {
    setActiveDropdown(prev => prev === name ? null : name);
  };

  const closeDropdown = () => {
    setActiveDropdown(null);
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // ── Image Selection & Toolbar Position Logic ──
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const updateToolbarPos = (img: HTMLImageElement) => {
      const rect = img.getBoundingClientRect();
      const containerRect = editor.parentElement!.getBoundingClientRect();
      
      // Position floating toolbar 55px above the image and horizontally centered
      setToolbarPos({
        top: rect.top - containerRect.top + editor.scrollTop - 55,
        left: Math.max(10, rect.left - containerRect.left + (rect.width - 340) / 2)
      });
    };

    const handleEditorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        const img = target as HTMLImageElement;
        setSelectedImage(img);
        
        const link = img.closest('a');
        setImageLinkUrl(link ? link.getAttribute('href') || '' : '');
        
        // Let image sizing/load happen before positioning
        setTimeout(() => updateToolbarPos(img), 30);
      } else {
        const isToolbarClick = (e.target as HTMLElement).closest('.img-floating-toolbar');
        if (!isToolbarClick) {
          setSelectedImage(null);
          setToolbarPos(null);
        }
      }
    };

    const handleScroll = () => {
      if (selectedImage) {
        updateToolbarPos(selectedImage);
      }
    };

    editor.addEventListener('click', handleEditorClick);
    editor.addEventListener('scroll', handleScroll);
    
    return () => {
      editor.removeEventListener('click', handleEditorClick);
      editor.removeEventListener('scroll', handleScroll);
    };
  }, [selectedImage]);

  // Sync value from parent, but only if it's different from the editor's innerHTML
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  // ── Table Column Resizing Logic ──────────────────────────────────────────
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    let isResizing = false;
    let currentCell: HTMLTableCellElement | null = null;
    let startX = 0;
    let startWidth = 0;

    const getResizeTarget = (e: MouseEvent): { cell: HTMLTableCellElement; side: 'right' | 'left' } | null => {
      const target = e.target as HTMLElement;
      const cell = target.closest('th, td') as HTMLTableCellElement;
      if (!cell) return null;

      const rect = cell.getBoundingClientRect();
      const edgeThreshold = 10; // 10px active zone

      const nearRight = (e.clientX - rect.left) > (rect.width - edgeThreshold);
      const nearLeft = (e.clientX - rect.left) < edgeThreshold;

      if (nearRight) {
        return { cell, side: 'right' };
      } else if (nearLeft) {
        const prevCell = cell.previousElementSibling as HTMLTableCellElement;
        if (prevCell) {
          return { cell: prevCell, side: 'left' };
        }
      }
      return null;
    };

    const handleMouseDown = (e: MouseEvent) => {
      const targetInfo = getResizeTarget(e);
      if (!targetInfo) return;

      isResizing = true;
      currentCell = targetInfo.cell;
      startX = e.clientX;
      
      const table = currentCell.closest('table');
      if (table) {
        // Initialize widths of all columns if table layout is not fixed yet
        if (table.style.tableLayout !== 'fixed') {
          // Get the current rendered widths of all cells in the first row
          const firstRow = table.rows[0];
          if (firstRow) {
            const cellWidths: number[] = [];
            for (let j = 0; j < firstRow.cells.length; j++) {
              cellWidths.push(firstRow.cells[j].getBoundingClientRect().width);
            }
            
            // Apply these rendered widths to all cells in the table as inline styles
            for (let i = 0; i < table.rows.length; i++) {
              const row = table.rows[i];
              for (let j = 0; j < row.cells.length; j++) {
                const cell = row.cells[j];
                const w = cellWidths[j];
                if (cell) {
                  cell.style.width = `${w}px`;
                  cell.style.minWidth = `${w}px`;
                }
              }
            }
            table.style.tableLayout = 'fixed';
            table.style.width = '100%';
          }
        }
      }

      const rect = currentCell.getBoundingClientRect();
      startWidth = rect.width;
      
      e.preventDefault();
      e.stopPropagation();
      document.body.style.cursor = 'col-resize';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && currentCell) {
        const deltaX = e.clientX - startX;
        const newWidth = Math.max(50, startWidth + deltaX);
        
        currentCell.style.width = `${newWidth}px`;
        currentCell.style.minWidth = `${newWidth}px`;
        
        const table = currentCell.closest('table');
        if (table) {
          const colIndex = currentCell.cellIndex;
          const rows = table.rows;
          for (let i = 0; i < rows.length; i++) {
            const cellInRow = rows[i].cells[colIndex];
            if (cellInRow) {
              cellInRow.style.width = `${newWidth}px`;
              cellInRow.style.minWidth = `${newWidth}px`;
            }
          }
        }
        
        e.preventDefault();
        triggerChange();
      } else {
        const targetInfo = getResizeTarget(e);
        const target = e.target as HTMLElement;
        const cell = target.closest('th, td') as HTMLTableCellElement;
        if (cell) {
          cell.style.cursor = targetInfo ? 'col-resize' : 'text';
        }
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        isResizing = false;
        currentCell = null;
        document.body.style.cursor = '';
        triggerChange(); // Make sure the final resized size is saved in states
      }
    };

    editor.addEventListener('mousedown', handleMouseDown);
    editor.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      editor.removeEventListener('mousedown', handleMouseDown);
      editor.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const checkActiveFormats = () => {
    const formats = [];
    if (document.queryCommandState('bold')) formats.push('bold');
    if (document.queryCommandState('italic')) formats.push('italic');
    if (document.queryCommandState('underline')) formats.push('underline');
    if (document.queryCommandState('strikeThrough')) formats.push('strikeThrough');
    if (document.queryCommandState('insertUnorderedList')) formats.push('unorderedList');
    if (document.queryCommandState('insertOrderedList')) formats.push('orderedList');
    
    // Check if cursor selection is inside a blockquote
    const selection = window.getSelection();
    if (selection && selection.anchorNode) {
      let parent: HTMLElement | null = selection.anchorNode.parentElement;
      while (parent && parent.tagName !== 'DIV') {
        if (parent.tagName === 'BLOCKQUOTE') {
          formats.push('quote');
          break;
        }
        parent = parent.parentElement;
      }
    }
    
    setActiveFormats(formats);
  };

  const handleCommand = (command: string, value: string = '') => {
    if (showHtml) return;
    document.execCommand(command, false, value);
    checkActiveFormats();
    triggerChange();
  };

  const triggerChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // ── Links ────────────────────────────────────────────────────────────────
  const handleCreateLink = () => {
    if (showHtml) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.toString().trim() === '') {
      toast.error('Please highlight the text you want to link first!');
      return;
    }

    const url = prompt('Enter the link URL (e.g. /properties or https://example.com):');
    if (url !== null) {
      // Ensure custom CSS classes for beautiful public rendering of links
      const html = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-[#C9A227] hover:underline font-bold">${selection.toString()}</a>`;
      document.execCommand('insertHTML', false, html);
      triggerChange();
    }
  };

  // ── Colors ───────────────────────────────────────────────────────────────
  const colors = [
    { name: 'Dark Gold', value: '#B8860B' },
    { name: 'SS Brand Gold', value: '#C9A227' },
    { name: 'Dark Gray', value: '#1A1800' },
    { name: 'Light Slate', value: '#6b6450' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Emerald', value: '#10B981' },
  ];

  const applyInlineStyle = (styleProp: 'fontSize' | 'fontFamily' | 'color', styleValue: string) => {
    if (showHtml) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.toString().trim() === '') {
      toast.error('Please highlight the text you want to style first!');
      return;
    }

    const range = selection.getRangeAt(0);
    const textNodes: Text[] = [];
    
    const collectTextNodes = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (selection.containsNode(node, true) || node === range.startContainer || node === range.endContainer) {
          textNodes.push(node as Text);
        }
      } else {
        node.childNodes.forEach(child => collectTextNodes(child));
      }
    };
    
    collectTextNodes(range.commonAncestorContainer);
    
    if (textNodes.length === 0) return;
    
    const savedSelections: { node: Text; start: number; end: number }[] = [];
    
    textNodes.forEach(node => {
      let startOffset = 0;
      let endOffset = node.length;
      
      if (node === range.startContainer) {
        startOffset = range.startOffset;
      }
      if (node === range.endContainer) {
        endOffset = range.endOffset;
      }
      
      if (startOffset < endOffset) {
        savedSelections.push({
          node,
          start: startOffset,
          end: endOffset
        });
      }
    });

    savedSelections.reverse().forEach(({ node, start, end }) => {
      const parent = node.parentNode;
      if (!parent) return;
      
      const fullText = node.nodeValue || '';
      const selectedPart = fullText.slice(start, end);
      
      if (parent.nodeName === 'SPAN' && parent.childNodes.length === 1 && (parent as HTMLElement).style[styleProp]) {
        const span = parent as HTMLElement;
        if (styleValue === 'default' && styleProp === 'fontSize') {
          span.style.fontSize = '';
          if (span.style.cssText === '') {
            const textNode = document.createTextNode(selectedPart);
            span.replaceWith(textNode);
          }
        } else {
          span.style[styleProp] = styleValue;
        }
        return;
      }
      
      const beforeText = fullText.slice(0, start);
      const afterText = fullText.slice(end);
      
      const fragment = document.createDocumentFragment();
      
      if (beforeText) {
        fragment.appendChild(document.createTextNode(beforeText));
      }
      
      if (styleValue === 'default' && styleProp === 'fontSize') {
        fragment.appendChild(document.createTextNode(selectedPart));
      } else {
        const span = document.createElement('span');
        span.style[styleProp] = styleValue;
        span.textContent = selectedPart;
        fragment.appendChild(span);
      }
      
      if (afterText) {
        fragment.appendChild(document.createTextNode(afterText));
      }
      
      parent.replaceChild(fragment, node);
    });

    selection.removeAllRanges();
    triggerChange();
  };

  const handleColor = (color: string) => {
    applyInlineStyle('color', color);
    setSelectedColor(color);
    closeDropdown();
  };

  // ── Fonts ────────────────────────────────────────────────────────────────
  const fonts = [
    { name: 'Inter (Website Default Body)', value: 'var(--font-inter), sans-serif' },
    { name: 'Playfair Display (Website Default Heading)', value: 'var(--font-playfair), Georgia, serif' },
    { name: 'Outfit', value: 'Outfit, sans-serif' },
    { name: 'Lora', value: 'Lora, serif' },
    { name: 'Montserrat', value: 'Montserrat, sans-serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Courier New (Mono)', value: 'Courier New, Courier, monospace' },
  ];

  const handleFont = (fontFamily: string) => {
    applyInlineStyle('fontFamily', fontFamily);
  };

  const handleFontSize = (size: string) => {
    applyInlineStyle('fontSize', size);
  };

  // ── Image Formatting & Resizing Customizations ──
  const handleResizeImage = (change: number) => {
    if (!selectedImage) return;
    
    let currentWidth = selectedImage.clientWidth || 400;
    let newWidth = Math.max(100, currentWidth + change);
    
    selectedImage.style.width = `${newWidth}px`;
    selectedImage.style.height = 'auto';
    
    triggerChange();
    
    // Reposition the toolbar after the image has resized
    setTimeout(() => {
      if (selectedImage && editorRef.current) {
        const rect = selectedImage.getBoundingClientRect();
        const containerRect = editorRef.current.parentElement!.getBoundingClientRect();
        setToolbarPos({
          top: rect.top - containerRect.top + editorRef.current.scrollTop - 55,
          left: Math.max(10, rect.left - containerRect.left + (rect.width - 340) / 2)
        });
      }
    }, 50);
  };

  const handleImageLink = () => {
    if (!selectedImage) return;
    const url = prompt('Enter the redirect link URL for this image (e.g. /properties or https://example.com) or leave empty to remove link:', imageLinkUrl);
    
    if (url === null) return; // user cancelled
    
    const trimmedUrl = url.trim();
    const link = selectedImage.closest('a');
    
    if (trimmedUrl === '') {
      if (link) {
        link.replaceWith(selectedImage);
        setImageLinkUrl('');
        toast.success('Link removed from image!');
      }
    } else {
      if (link) {
        link.setAttribute('href', trimmedUrl);
        setImageLinkUrl(trimmedUrl);
        toast.success('Image link updated!');
      } else {
        const newLink = document.createElement('a');
        newLink.setAttribute('href', trimmedUrl);
        newLink.setAttribute('target', '_blank');
        newLink.setAttribute('rel', 'noopener noreferrer');
        
        selectedImage.parentNode?.insertBefore(newLink, selectedImage);
        newLink.appendChild(selectedImage);
        setImageLinkUrl(trimmedUrl);
        toast.success('Link added to image!');
      }
    }
    triggerChange();
  };

  const handleDeleteImage = () => {
    if (!selectedImage) return;
    if (confirm('Are you sure you want to delete this image?')) {
      const link = selectedImage.closest('a');
      if (link) {
        link.remove();
      } else {
        selectedImage.remove();
      }
      setSelectedImage(null);
      setToolbarPos(null);
      triggerChange();
      toast.success('Image deleted from article!');
    }
  };

  const handleAlign = (alignType: string) => {
    if (showHtml) return;
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      
      // Check if we are selecting elements inside a table
      const table = (container.nodeType === Node.ELEMENT_NODE ? container as HTMLElement : container.parentElement)?.closest('table');
      
      if (table) {
        const cells = table.querySelectorAll('td, th');
        let alignedAny = false;
        
        cells.forEach(cell => {
          if (selection.containsNode(cell, true) || cell.contains(range.startContainer) || cell.contains(range.endContainer)) {
            const cellEl = cell as HTMLTableCellElement;
            cellEl.style.textAlign = alignType;
            // Also apply alignment to child paragraphs and divs so tailwind/prose defaults are perfectly overridden
            cellEl.querySelectorAll('p, div, span').forEach(child => {
              (child as HTMLElement).style.textAlign = alignType;
            });
            alignedAny = true;
          }
        });
        
        if (alignedAny) {
          triggerChange();
          return;
        }
      }
      
      // Fallback: If not selecting multiple cells, check if cursor is inside a single cell
      let parent: HTMLElement | null = selection.anchorNode ? selection.anchorNode.parentElement : null;
      let cellElement: HTMLTableCellElement | null = null;
      while (parent && parent.tagName !== 'DIV') {
        if (parent.tagName === 'TD' || parent.tagName === 'TH') {
          cellElement = parent as HTMLTableCellElement;
          break;
        }
        parent = parent.parentElement;
      }
      
      if (cellElement) {
        cellElement.style.textAlign = alignType;
        cellElement.querySelectorAll('p, div, span').forEach(child => {
          (child as HTMLElement).style.textAlign = alignType;
        });
        triggerChange();
        return;
      }
    }
    
    let command = 'justifyLeft';
    if (alignType === 'center') command = 'justifyCenter';
    if (alignType === 'right') command = 'justifyRight';
    if (alignType === 'justify') command = 'justifyFull';
    
    document.execCommand(command);
    triggerChange();
  };

  // ── Cloudinary Inline Image Insertion ────────────────────────────────────
  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image exceeds 10MB limit.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'ss-realty/blog'); // Saved in blog uploads folder

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Focus back to the editor before inserting HTML
        if (editorRef.current) {
          editorRef.current.focus();
        }
        
        // Build high-end, responsive HTML image element with premium styling rules
        const imgHtml = `
          <div class="my-6 max-w-full block">
            <img 
              src="${data.url}" 
              alt="Embedded Blog Image" 
              class="max-w-full h-auto mx-auto rounded-2xl shadow-md border border-[#E8D5A3]/30 object-cover" 
              style="display: block; max-height: 500px;"
            />
            <p class="text-center text-xs text-[#a09060] mt-2 italic font-semibold">SS Realty blog image</p>
          </div>
          <p><br></p>
        `;
        
        document.execCommand('insertHTML', false, imgHtml);
        triggerChange();
        toast.success('Image embedded successfully at cursor position!');
      } else {
        toast.error(data.error || 'Failed to upload image.');
      }
    } catch (err) {
      console.error('[Editor Image Upload Error]', err);
      toast.error('Connection error during image upload.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Drag & Drop ─────────────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'ss-realty/blog');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (editorRef.current) {
          editorRef.current.focus();
        }

        const imgHtml = `
          <div class="my-6 max-w-full block">
            <img 
              src="${data.url}" 
              alt="Embedded Blog Image" 
              class="max-w-full h-auto mx-auto rounded-2xl shadow-md border border-[#E8D5A3]/30 object-cover" 
              style="display: block; max-height: 500px;"
            />
            <p class="text-center text-xs text-[#a09060] mt-2 italic font-semibold">SS Realty blog image</p>
          </div>
          <p><br></p>
        `;
        
        document.execCommand('insertHTML', false, imgHtml);
        triggerChange();
        toast.success('Image embedded successfully!');
      } else {
        toast.error(data.error || 'Failed to upload image.');
      }
    } catch (err) {
      console.error('[Editor Drop Image Upload Error]', err);
      toast.error('Connection error during image upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleCustomList = (className: string) => {
    if (showHtml) return;
    
    const selection = window.getSelection();
    if (selection && selection.anchorNode) {
      let parent: HTMLElement | null = selection.anchorNode.parentElement;
      let ulElement: HTMLUListElement | null = null;
      
      while (parent && parent.tagName !== 'DIV') {
        if (parent.tagName === 'UL') {
          ulElement = parent as HTMLUListElement;
          break;
        }
        parent = parent.parentElement;
      }
      
      if (ulElement) {
        if (ulElement.className === className) {
          ulElement.className = '';
        } else {
          ulElement.className = className;
        }
        triggerChange();
      } else {
        document.execCommand('insertUnorderedList');
        
        const newSelection = window.getSelection();
        if (newSelection && newSelection.anchorNode) {
          let newParent: HTMLElement | null = newSelection.anchorNode.parentElement;
          while (newParent && newParent.tagName !== 'DIV') {
            if (newParent.tagName === 'UL') {
              newParent.className = className;
              break;
            }
            newParent = newParent.parentElement;
          }
        }
        triggerChange();
      }
    }
  };

  const handleBulletList = () => {
    if (showHtml) return;
    
    const selection = window.getSelection();
    if (selection && selection.anchorNode) {
      let parent: HTMLElement | null = selection.anchorNode.parentElement;
      let ulElement: HTMLUListElement | null = null;
      
      while (parent && parent.tagName !== 'DIV') {
        if (parent.tagName === 'UL') {
          ulElement = parent as HTMLUListElement;
          break;
        }
        parent = parent.parentElement;
      }
      
      if (ulElement && ulElement.className) {
        ulElement.className = '';
        triggerChange();
        return;
      }
    }
    handleCommand('insertUnorderedList');
  };

  const handleQuoteToggle = () => {
    if (showHtml) return;
    
    const selection = window.getSelection();
    if (selection && selection.anchorNode) {
      let parent: HTMLElement | null = selection.anchorNode.parentElement;
      let insideQuote = false;
      
      while (parent && parent.tagName !== 'DIV') {
        if (parent.tagName === 'BLOCKQUOTE') {
          insideQuote = true;
          break;
        }
        parent = parent.parentElement;
      }
      
      if (insideQuote) {
        handleCommand('formatBlock', '<p>');
      } else {
        handleCommand('formatBlock', '<blockquote>');
      }
    }
  };

  return (
    <div className="w-full border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-[#C9A227] focus-within:border-transparent transition-all duration-300">
      
      {/* ── Toolbar ────────────────────────────────────────────────────────── */}
      <div ref={toolbarRef} className="flex flex-wrap items-center gap-1.5 p-3 border-b border-gray-200 bg-white select-none sticky top-0 z-20 shadow-xs">
        
        {/* WordPress-style Paragraph & Headings Dropdown */}
        <div className="relative flex-shrink-0">
          <button 
            type="button" 
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => toggleDropdown('headings')}
            className={`p-1.5 rounded transition-colors text-gray-700 flex items-center gap-1 font-bold text-xs ${activeDropdown === 'headings' ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
            title="Paragraph & Headings Style"
          >
            <Type size={16} />
            <span className="text-[10px] text-gray-500 font-semibold">Heading Style</span>
            <span className="text-[8px] font-bold text-gray-400">▼</span>
          </button>
          {activeDropdown === 'headings' && (
            <div className="absolute left-0 mt-1 flex flex-col gap-0.5 p-2 bg-white border border-gray-200 rounded-xl shadow-lg z-30 min-w-[160px] animate-scale-in">
              <span className="text-[9px] font-bold text-gray-400 mb-1 px-1">TEXT FORMATS:</span>
              
              <button 
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  handleCommand('formatBlock', '<p>');
                  closeDropdown();
                }}
                className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-xs hover:bg-gray-50 rounded-lg text-gray-700 transition-colors"
              >
                <span className="w-5 h-5 flex items-center justify-center font-bold text-gray-400 bg-gray-100 rounded text-[10px]">p</span>
                <span>Normal Paragraph</span>
              </button>

              <button 
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  handleCommand('formatBlock', '<h1>');
                  closeDropdown();
                }}
                className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-xs hover:bg-gray-50 rounded-lg text-gray-900 font-bold transition-colors"
              >
                <span className="w-5 h-5 flex items-center justify-center font-bold text-gray-600 bg-gray-100 rounded text-[10px]">H1</span>
                <span>Heading 1</span>
              </button>

              <button 
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  handleCommand('formatBlock', '<h2>');
                  closeDropdown();
                }}
                className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-xs hover:bg-gray-50 rounded-lg text-gray-900 font-bold transition-colors"
              >
                <span className="w-5 h-5 flex items-center justify-center font-bold text-gray-600 bg-gray-100 rounded text-[10px]">H2</span>
                <span>Heading 2</span>
              </button>

              <button 
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  handleCommand('formatBlock', '<h3>');
                  closeDropdown();
                }}
                className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-xs hover:bg-gray-50 rounded-lg text-gray-900 font-bold transition-colors"
              >
                <span className="w-5 h-5 flex items-center justify-center font-bold text-gray-600 bg-gray-100 rounded text-[10px]">H3</span>
                <span>Heading 3</span>
              </button>

              <button 
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  handleCommand('formatBlock', '<h4>');
                  closeDropdown();
                }}
                className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-xs hover:bg-gray-50 rounded-lg text-gray-900 font-bold transition-colors"
              >
                <span className="w-5 h-5 flex items-center justify-center font-bold text-gray-600 bg-gray-100 rounded text-[10px]">H4</span>
                <span>Heading 4</span>
              </button>

              <button 
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  handleCommand('formatBlock', '<h5>');
                  closeDropdown();
                }}
                className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-xs hover:bg-gray-50 rounded-lg text-gray-900 font-bold transition-colors"
              >
                <span className="w-5 h-5 flex items-center justify-center font-bold text-gray-600 bg-gray-100 rounded text-[10px]">H5</span>
                <span>Heading 5</span>
              </button>

              <button 
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  handleCommand('formatBlock', '<h6>');
                  closeDropdown();
                }}
                className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-xs hover:bg-gray-50 rounded-lg text-gray-900 font-bold transition-colors"
              >
                <span className="w-5 h-5 flex items-center justify-center font-bold text-gray-600 bg-gray-100 rounded text-[10px]">H6</span>
                <span>Heading 6</span>
              </button>
            </div>
          )}
        </div>

        <span className="w-px h-6 bg-gray-200 mx-1 flex-shrink-0" />

        {/* Text Size (T) Dropdown */}
        <div className="relative flex-shrink-0">
          <button 
            type="button" 
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => toggleDropdown('size')}
            className={`p-1.5 rounded transition-colors text-gray-700 flex items-center gap-1 font-bold text-base min-w-[28px] justify-center ${activeDropdown === 'size' ? 'bg-gray-200' : 'hover:bg-gray-200'}`} 
            title="Text Size (T)"
          >
            <span className="font-serif leading-none">T</span>
            <span className="text-[8px] font-bold text-gray-400">▼</span>
          </button>
          {activeDropdown === 'size' && (
            <div className="absolute left-0 mt-1 flex flex-col gap-0.5 p-2 bg-white border border-gray-200 rounded-xl shadow-lg z-30 min-w-[130px] animate-scale-in max-h-[300px] overflow-y-auto no-scrollbar">
              <span className="text-[9px] font-bold text-gray-400 mb-1 px-1">SELECT SIZE:</span>
              
              <button 
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  handleFontSize('default');
                  closeDropdown();
                }}
                className="w-full text-left px-2 py-1.5 text-xs hover:bg-gray-50 rounded-lg text-red-500 font-bold transition-colors"
              >
                Default Size
              </button>
              
              {['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '40px'].map((sz) => (
                <button 
                  key={sz}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    handleFontSize(sz);
                    closeDropdown();
                  }}
                  className="w-full text-left px-2 py-1.5 text-xs hover:bg-gray-50 rounded-lg text-gray-700 font-semibold transition-colors"
                  style={{ fontSize: sz }}
                >
                  {sz}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="w-px h-6 bg-gray-200 mx-1 flex-shrink-0" />

        {/* Text Formats */}
        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleCommand('bold')}
          className={`p-1.5 rounded transition-colors flex-shrink-0 ${activeFormats.includes('bold') ? 'bg-[#C9A227]/20 text-[#B8860B]' : 'hover:bg-gray-200 text-gray-700'}`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleCommand('italic')}
          className={`p-1.5 rounded transition-colors flex-shrink-0 ${activeFormats.includes('italic') ? 'bg-[#C9A227]/20 text-[#B8860B]' : 'hover:bg-gray-200 text-gray-700'}`}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleCommand('underline')}
          className={`p-1.5 rounded transition-colors flex-shrink-0 ${activeFormats.includes('underline') ? 'bg-[#C9A227]/20 text-[#B8860B]' : 'hover:bg-gray-200 text-gray-700'}`}
          title="Underline"
        >
          <Underline size={16} />
        </button>
        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleCommand('strikeThrough')}
          className={`p-1.5 rounded transition-colors flex-shrink-0 ${activeFormats.includes('strikeThrough') ? 'bg-[#C9A227]/20 text-[#B8860B]' : 'hover:bg-gray-200 text-gray-700'}`}
          title="Strike-through"
        >
          <Strikethrough size={16} />
        </button>

        <span className="w-px h-6 bg-gray-200 mx-1 flex-shrink-0" />

        {/* Color Palette (Dropdown list trigger) */}
        <div className="relative flex-shrink-0">
          <button 
            type="button" 
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => toggleDropdown('color')}
            className={`p-1.5 rounded transition-colors flex items-center justify-center flex-shrink-0 ${activeDropdown === 'color' ? 'bg-gray-200' : 'hover:bg-gray-200'}`} 
            title="Text Color"
          >
            <Palette size={16} style={{ color: selectedColor }} />
          </button>
          {activeDropdown === 'color' && (
            <div className="absolute left-0 mt-1 flex flex-col gap-1 p-2 bg-white border border-gray-200 rounded-xl shadow-lg z-30 min-w-[140px] animate-scale-in">
              <span className="text-[9px] font-bold text-gray-400 mb-1 px-1">SELECT TEXT COLOR:</span>
              {colors.map((c) => (
                <button 
                  key={c.name}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleColor(c.value)}
                  className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-xs hover:bg-gray-50 rounded-lg text-gray-700 transition-colors font-semibold"
                >
                  <span className="w-3.5 h-3.5 rounded-full border border-gray-200" style={{ backgroundColor: c.value }} />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Fonts Trigger */}
        <div className="relative flex-shrink-0">
          <button 
            type="button" 
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => toggleDropdown('font')}
            className={`p-1.5 rounded transition-colors text-gray-700 flex items-center gap-1 font-bold text-xs ${activeDropdown === 'font' ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
            title="Font Family"
          >
            <span className="text-xs font-bold font-mono">F</span>
            <span className="text-[10px] text-gray-500 font-semibold">Font</span>
            <span className="text-[8px] font-bold text-gray-400">▼</span>
          </button>
          {activeDropdown === 'font' && (
            <div className="absolute left-0 mt-1 flex flex-col gap-1 p-2 bg-white border border-gray-200 rounded-xl shadow-lg z-30 min-w-[190px] animate-scale-in max-h-[300px] overflow-y-auto no-scrollbar">
              <span className="text-[9px] font-bold text-gray-400 mb-1 px-1">SELECT FONT:</span>
              {fonts.map((f) => (
                <button 
                  key={f.name}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    handleFont(f.value);
                    closeDropdown();
                  }}
                  className="w-full text-left px-2 py-1.5 text-xs hover:bg-gray-50 rounded-lg text-gray-700 transition-colors font-semibold"
                  style={{ fontFamily: f.value }}
                >
                  {f.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="w-px h-6 bg-gray-200 mx-1 flex-shrink-0" />

        {/* Alignment */}
        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleAlign('left')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors text-gray-700 flex-shrink-0" 
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleAlign('center')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors text-gray-700 flex-shrink-0" 
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>
        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleAlign('right')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors text-gray-700 flex-shrink-0" 
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>
        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleAlign('justify')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors text-gray-700 flex-shrink-0" 
          title="Justify"
        >
          <AlignJustify size={16} />
        </button>

        <span className="w-px h-6 bg-gray-200 mx-1 flex-shrink-0" />

        {/* Lists & Pointers Consolidated Dropdown */}
        <div className="relative flex-shrink-0">
          <button 
            type="button" 
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => toggleDropdown('lists')}
            className={`p-1.5 rounded transition-colors text-gray-700 flex items-center gap-1 ${activeDropdown === 'lists' ? 'bg-gray-200' : 'hover:bg-gray-200'}`} 
            title="Lists & Pointers"
          >
            <List size={16} />
            <span className="text-[8px] font-bold text-gray-400">▼</span>
          </button>
          {activeDropdown === 'lists' && (
            <div className="absolute left-0 mt-1 flex flex-col gap-0.5 p-2 bg-white border border-gray-200 rounded-xl shadow-lg z-30 min-w-[170px] animate-scale-in">
              <span className="text-[9px] font-bold text-gray-400 mb-1 px-1">LIST FORMATS:</span>
              
              <button 
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  handleBulletList();
                  closeDropdown();
                }}
                className="flex items-center gap-2.5 w-full text-left px-2 py-1.5 text-xs hover:bg-gray-50 rounded-lg text-gray-700 font-semibold transition-colors"
              >
                <span className="w-4 h-4 flex items-center justify-center font-bold text-gray-400 bg-gray-100 rounded text-xs">•</span>
                <span>Bullet List (•)</span>
              </button>

              <button 
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  handleCommand('insertOrderedList');
                  closeDropdown();
                }}
                className="flex items-center gap-2.5 w-full text-left px-2 py-1.5 text-xs hover:bg-gray-50 rounded-lg text-gray-700 font-semibold transition-colors"
              >
                <span className="w-4 h-4 flex items-center justify-center font-bold text-gray-400 bg-gray-100 rounded text-[9px]">1.</span>
                <span>Numbered List (1, 2)</span>
              </button>

              <button 
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  handleCustomList('list-arrows');
                  closeDropdown();
                }}
                className="flex items-center gap-2.5 w-full text-left px-2 py-1.5 text-xs hover:bg-gray-50 rounded-lg text-gray-700 font-semibold transition-colors"
              >
                <span className="w-4 h-4 flex items-center justify-center font-bold text-gray-400 bg-gray-100 rounded text-[9px]">➤</span>
                <span>Arrow Pointers (➤)</span>
              </button>

              <button 
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  handleCustomList('list-squares');
                  closeDropdown();
                }}
                className="flex items-center gap-2.5 w-full text-left px-2 py-1.5 text-xs hover:bg-gray-50 rounded-lg text-gray-700 font-semibold transition-colors"
              >
                <span className="w-4 h-4 flex items-center justify-center font-bold text-gray-400 bg-gray-100 rounded text-[9px]">■</span>
                <span>Square List (■)</span>
              </button>

              <button 
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  handleCustomList('list-checkboxes');
                  closeDropdown();
                }}
                className="flex items-center gap-2.5 w-full text-left px-2 py-1.5 text-xs hover:bg-gray-50 rounded-lg text-gray-700 font-semibold transition-colors"
              >
                <span className="w-4 h-4 flex items-center justify-center font-bold text-gray-400 bg-gray-100 rounded text-[9px]">☐</span>
                <span>Checklist (☐)</span>
              </button>
            </div>
          )}
        </div>

        <span className="w-px h-6 bg-gray-200 mx-1 flex-shrink-0" />

        {/* Embeds: Link & Image */}
        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleCreateLink}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors text-gray-700 flex-shrink-0" 
          title="Insert Link on Selection"
        >
          <Link2 size={16} />
        </button>
        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleCommand('unlink')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors text-gray-700 flex-shrink-0" 
          title="Remove Link"
        >
          <Unlink size={16} />
        </button>
        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleImageUploadClick}
          disabled={uploading}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors text-gray-700 disabled:opacity-50 relative flex items-center justify-center flex-shrink-0" 
          title="Insert Image (Cloudinary)"
        >
          {uploading ? <Loader2 size={16} className="animate-spin text-[#C9A227]" /> : <ImageIcon size={16} />}
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
          accept="image/*" 
          className="hidden" 
        />

        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleCommand('insertHorizontalRule')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors text-gray-700 font-bold flex-shrink-0" 
          title="Horizontal Line Divider"
        >
          <Minus size={16} />
        </button>

        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleQuoteToggle}
          className={`p-1.5 rounded transition-colors flex-shrink-0 ${activeFormats.includes('quote') ? 'bg-[#C9A227]/20 text-[#B8860B]' : 'hover:bg-gray-200 text-gray-700'}`}
          title="Toggle Blockquote"
        >
          <Quote size={16} />
        </button>

        <button 
          type="button" 
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleCommand('removeFormat')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors text-red-500 font-bold flex-shrink-0" 
          title="Clear Format Settings"
        >
          <Eraser size={16} />
        </button>

        <span className="flex-grow" />

        {/* Visual / HTML Toggle */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setShowHtml(!showHtml);
            // Ensure synchronization when toggling
            if (showHtml && editorRef.current) {
              editorRef.current.innerHTML = value || '';
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg border transition-all duration-300 flex-shrink-0 ${
            showHtml 
              ? 'bg-amber-50 border-[#C9A227]/30 text-[#C9A227] shadow-sm' 
              : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-600'
          }`}
          title={showHtml ? "Switch to Visual Editor" : "Switch to Raw HTML Code View"}
        >
          {showHtml ? (
            <>
              <Eye size={12} />
              <span>Visual Editor</span>
            </>
          ) : (
            <>
              <Code size={12} />
              <span>HTML Source</span>
            </>
          )}
        </button>

      </div>

      {/* ── Content Editing Area ───────────────────────────────────────────── */}
      <div className="relative min-h-[350px] flex flex-col flex-grow">
        
        {/* Loader Overlays */}
        {uploading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2 z-20 transition-all duration-300">
            <Loader2 className="animate-spin text-[#C9A227]" size={36} />
            <span className="text-xs font-bold text-gray-600">Uploading Inline Cloudinary Image...</span>
          </div>
        )}

        {showHtml ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-5 outline-none font-mono text-sm border-none bg-gray-50 text-gray-800 leading-relaxed resize-y focus:ring-0 max-h-[600px] overflow-y-auto"
            style={{ minHeight: '350px', height: '450px' }}
            placeholder="Write or edit raw HTML content here..."
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={triggerChange}
            onBlur={triggerChange}
            onKeyUp={checkActiveFormats}
            onMouseUp={checkActiveFormats}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="w-full p-6 outline-none prose prose-lg max-w-none text-gray-800 focus:ring-0 leading-relaxed font-sans cursor-text overflow-auto max-h-[600px]"
            style={{ minHeight: '350px', height: '450px' }}
          />
        )}

        {/* Custom Placeholder Overlay when editor is empty */}
        {!value && !showHtml && (
          <div 
            onClick={() => editorRef.current?.focus()} 
            className="absolute top-6 left-6 text-gray-400 text-sm font-medium pointer-events-none select-none"
          >
            {placeholder}
          </div>
        )}
        {/* Floating Image Config Toolbar */}
        {selectedImage && toolbarPos && (
          <div 
            className="img-floating-toolbar absolute bg-white/95 backdrop-blur-md border border-[#E8D5A3] shadow-lg rounded-xl p-2 flex items-center gap-2.5 z-30 transition-all duration-300 animate-scale-in"
            style={{ 
              top: `${toolbarPos.top}px`, 
              left: `${toolbarPos.left}px`,
              width: '340px'
            }}
          >
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Align Left */}
              <button
                type="button"
                onClick={() => {
                  selectedImage.style.display = 'inline-block';
                  selectedImage.style.float = 'left';
                  selectedImage.style.marginRight = '1.5rem';
                  selectedImage.style.marginBottom = '1rem';
                  selectedImage.style.marginLeft = '0';
                  triggerChange();
                }}
                className="p-1.5 hover:bg-gray-100 rounded text-gray-700 font-bold text-xs flex items-center justify-center transition-colors"
                title="Align Left (Float Left)"
              >
                <AlignLeft size={14} />
              </button>

              {/* Align Center */}
              <button
                type="button"
                onClick={() => {
                  selectedImage.style.display = 'block';
                  selectedImage.style.float = 'none';
                  selectedImage.style.marginLeft = 'auto';
                  selectedImage.style.marginRight = 'auto';
                  selectedImage.style.marginBottom = '1rem';
                  triggerChange();
                }}
                className="p-1.5 hover:bg-gray-100 rounded text-gray-700 font-bold text-xs flex items-center justify-center transition-colors"
                title="Align Center"
              >
                <AlignCenter size={14} />
              </button>

              {/* Align Right */}
              <button
                type="button"
                onClick={() => {
                  selectedImage.style.display = 'inline-block';
                  selectedImage.style.float = 'right';
                  selectedImage.style.marginLeft = '1.5rem';
                  selectedImage.style.marginBottom = '1rem';
                  selectedImage.style.marginRight = '0';
                  triggerChange();
                }}
                className="p-1.5 hover:bg-gray-100 rounded text-gray-700 font-bold text-xs flex items-center justify-center transition-colors"
                title="Align Right (Float Right)"
              >
                <AlignRight size={14} />
              </button>
            </div>

            <span className="w-px h-5 bg-gray-200 flex-shrink-0" />

            {/* Size Adjustments */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => handleResizeImage(-50)}
                className="p-1 px-1.5 hover:bg-gray-100 rounded text-gray-700 font-bold text-[10px] transition-colors"
                title="Make Image Smaller (Decrease Size)"
              >
                A-
              </button>
              
              {/* 50% & 100% Quick Presets */}
              <button
                type="button"
                onClick={() => {
                  selectedImage.style.width = '50%';
                  selectedImage.style.height = 'auto';
                  triggerChange();
                }}
                className="p-1 px-1.5 hover:bg-gray-100 rounded text-gray-600 font-bold text-[10px] transition-colors"
                title="Resize to 50% Width"
              >
                50%
              </button>

              <button
                type="button"
                onClick={() => {
                  selectedImage.style.width = '100%';
                  selectedImage.style.height = 'auto';
                  triggerChange();
                }}
                className="p-1 px-1.5 hover:bg-gray-100 rounded text-gray-600 font-bold text-[10px] transition-colors"
                title="Resize to Full 100% Width"
              >
                100%
              </button>

              <button
                type="button"
                onClick={() => handleResizeImage(50)}
                className="p-1 px-1.5 hover:bg-gray-100 rounded text-gray-700 font-bold text-[10px] transition-colors"
                title="Make Image Larger (Increase Size)"
              >
                A+
              </button>
            </div>

            <span className="w-px h-5 bg-gray-200 flex-shrink-0" />

            {/* Image Link & Eraser */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={handleImageLink}
                className={`p-1.5 rounded transition-colors ${imageLinkUrl ? 'bg-[#C9A227]/20 text-[#B8860B]' : 'hover:bg-gray-100 text-gray-700'}`}
                title="Attach Redirect Link to Image"
              >
                <Link2 size={14} />
              </button>

              <button
                type="button"
                onClick={handleDeleteImage}
                className="p-1.5 hover:bg-red-50 rounded text-red-500 font-bold transition-colors"
                title="Delete Image from Article"
              >
                <Eraser size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Editor Footer / Info panel */}
      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-[10px] text-gray-400 font-medium select-none">
        <span>Drag & drop images directly inside editor to auto-upload to Cloudinary!</span>
        <span>HTML5 Premium Editor</span>
      </div>

    </div>
  );
}
