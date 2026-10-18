'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface PremiumSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export default function PremiumSelect({
  options,
  value,
  onChange,
  placeholder = 'Select option',
  label,
  className = '',
}: PremiumSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      {label && (
        <span className="block text-[9px] uppercase tracking-[0.25em] text-brand-muted font-semibold mb-1.5 font-sans">
          {label}
        </span>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          'w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-brand-white border rounded-xs text-xs font-sans tracking-wide transition-all duration-200 cursor-pointer select-none text-left shadow-soft-sm hover:shadow-soft-md',
          isOpen
            ? 'border-brand-green ring-1 ring-brand-green/20'
            : 'border-brand-black/10 hover:border-brand-black/25'
        )}
      >
        <span className={cn('truncate', selectedOption ? 'text-brand-black font-medium' : 'text-brand-muted')}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            'text-brand-muted transition-transform duration-200 shrink-0',
            isOpen && 'rotate-180 text-brand-green'
          )}
        />
      </button>

      {/* Floating Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-brand-white border border-brand-black/10 rounded-xs shadow-soft-xl max-h-60 overflow-y-auto py-1"
          >
            <ul role="listbox">
              {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'flex items-center justify-between px-3.5 py-2.5 text-xs font-sans tracking-wide cursor-pointer transition-colors duration-150',
                      isSelected
                        ? 'bg-brand-green/10 text-brand-green font-semibold'
                        : 'text-brand-charcoal hover:bg-brand-offwhite hover:text-brand-black'
                    )}
                  >
                    <div className="flex flex-col truncate pr-2">
                      <span className="truncate">{opt.label}</span>
                      {opt.description && (
                        <span className="text-[12px] text-brand-muted font-normal">{opt.description}</span>
                      )}
                    </div>
                    {isSelected && <Check size={13} className="text-brand-green shrink-0 ml-1" />}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

