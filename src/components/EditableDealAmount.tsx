'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Pencil, Check, X } from 'lucide-react';

interface EditableDealAmountProps {
  leadId: string;
  value: number;
  onUpdate: (id: string, value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'badge' | 'table' | 'inline';
  className?: string;
}

export default function EditableDealAmount({
  leadId,
  value,
  onUpdate,
  variant = 'badge',
  className = '',
}: EditableDealAmountProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const parseAmount = (input: string): number => {
    const clean = input.trim().toLowerCase().replace(/[₹,\s]/g, '');
    if (clean.endsWith('k')) {
      const num = parseFloat(clean.slice(0, -1));
      return isNaN(num) ? value : Math.round(num * 1000);
    }
    if (clean.endsWith('l') || clean.endsWith('lac') || clean.endsWith('lakh')) {
      const num = parseFloat(clean.replace(/lac|lakh|l/g, ''));
      return isNaN(num) ? value : Math.round(num * 100000);
    }
    if (clean.endsWith('cr')) {
      const num = parseFloat(clean.replace(/cr/g, ''));
      return isNaN(num) ? value : Math.round(num * 10000000);
    }
    const parsed = parseInt(clean, 10);
    return isNaN(parsed) || parsed < 0 ? value : parsed;
  };

  const handleSave = () => {
    const numeric = parseAmount(inputValue);
    if (numeric !== value && numeric >= 0) {
      onUpdate(leadId, numeric);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setInputValue(value.toString());
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div 
        className={`inline-flex items-center gap-1 bg-zinc-950 border border-zinc-500 rounded px-1.5 py-0.5 shadow-sm ${className}`}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <span className="text-zinc-400 font-mono text-[11px]">₹</span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="w-16 bg-transparent text-white font-mono text-[11px] font-semibold focus:outline-none"
          placeholder="Amount"
        />
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="text-emerald-400 hover:text-emerald-300 p-0.5 cursor-pointer"
          title="Save deal amount"
        >
          <Check className="w-3 h-3" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            handleCancel();
          }}
          className="text-zinc-500 hover:text-zinc-300 p-0.5 cursor-pointer"
          title="Cancel"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  const formatted = `₹${value.toLocaleString('en-IN')}`;

  if (variant === 'table') {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
        className={`group inline-flex items-center gap-1.5 font-mono text-zinc-200 hover:text-white bg-zinc-900/60 hover:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer text-[11px] ${className}`}
        title="Click to edit deal amount"
      >
        <span className="font-semibold text-zinc-100">{formatted}</span>
        <Pencil className="w-2.5 h-2.5 text-zinc-500 group-hover:text-zinc-300 transition-colors opacity-60 group-hover:opacity-100" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      className={`group inline-flex items-center gap-1 font-mono text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer text-[10px] whitespace-nowrap shrink-0 ${className}`}
      title="Click to edit deal amount"
    >
      <span className="font-medium">{formatted}</span>
      <Pencil className="w-2.5 h-2.5 text-zinc-500 group-hover:text-zinc-300 opacity-60 group-hover:opacity-100 shrink-0" />
    </button>
  );
}
