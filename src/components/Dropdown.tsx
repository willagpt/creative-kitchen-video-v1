import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}

export function Dropdown({ value, onChange, options, placeholder }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get the label for the current value
  const selectedLabel = options.find((opt) => opt.value === value)?.label || placeholder;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 flex items-center gap-2 px-3 py-2 rounded-md border border-zinc-700 bg-zinc-900 text-xs text-zinc-100 hover:border-zinc-600 cursor-pointer transition-colors whitespace-nowrap"
      >
        {selectedLabel}
        <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full mt-1 left-0 z-50 min-w-[160px] bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl py-1 overflow-hidden">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="w-full px-3 py-1.5 text-[12px] text-zinc-300 hover:bg-zinc-800 cursor-pointer flex items-center justify-between text-left transition-colors"
            >
              {option.label}
              {value === option.value && (
                <Check className="w-3.5 h-3.5 text-indigo-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
