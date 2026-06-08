'use client';

import React, { useRef, useEffect } from 'react';
import { Bold, Heading2 } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync value from prop to editor (only if the editor is not focused)
  useEffect(() => {
    if (editorRef.current && document.activeElement !== editorRef.current) {
      // Use fallback empty string to prevent null/undefined issues
      const normalizedValue = value || '';
      if (editorRef.current.innerHTML !== normalizedValue) {
        editorRef.current.innerHTML = normalizedValue;
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command: string, arg: string = '') => {
    document.execCommand(command, false, arg);
    handleInput();
    // Keep focus in the editor after applying formatting
    editorRef.current?.focus();
  };

  return (
    <div className="w-full border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#C9A227] focus-within:border-[#C9A227] bg-white transition-shadow">
      {/* Toolbar */}
      <div className="flex items-center gap-1 bg-gray-50 border-b border-gray-200 px-3 py-2 select-none">
        <button
          type="button"
          onClick={() => executeCommand('bold')}
          className="p-1.5 hover:bg-gray-200 rounded text-gray-700 transition-colors flex items-center justify-center"
          title="Bold (Ctrl+B)"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<h2>')}
          className="p-1.5 hover:bg-gray-200 rounded text-gray-700 transition-colors flex items-center justify-center"
          title="Heading"
        >
          <Heading2 size={16} />
        </button>
      </div>

      {/* Editable Area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className="w-full min-h-[180px] p-3 outline-none text-sm text-gray-800 overflow-y-auto"
        placeholder={placeholder}
        style={{
          minHeight: '180px',
        }}
      />
      
      {/* Placeholder Style */}
      <style jsx global>{`
        [contenteditable]:empty:before {
          content: attr(placeholder);
          color: #9ca3af;
          cursor: text;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
