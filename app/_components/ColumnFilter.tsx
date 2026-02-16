"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColumnFilterTextProps {
  type?: "text";
  label: string;
  value: string;
  onChange: (value: string) => void;
  suggestions?: string[];
}

interface ColumnFilterSelectProps {
  type: "select";
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { key: string; label: string }[];
}

type ColumnFilterProps = ColumnFilterTextProps | ColumnFilterSelectProps;

export function ColumnFilter(props: ColumnFilterProps) {
  if (props.type === "select") return <SelectFilter {...props} />;
  return <TextFilter {...props} />;
}

// Compute fixed position for dropdown so it escapes table overflow
function useDropdownPosition(
  ref: React.RefObject<HTMLDivElement | null>,
  isOpen: boolean
) {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left });
  }, [isOpen, ref]);

  return pos;
}

// ─── Text filter: click icon → label becomes input ────────────────────
function TextFilter({
  label,
  value,
  onChange,
  suggestions,
}: ColumnFilterTextProps) {
  const [editing, setEditing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownPos = useDropdownPosition(wrapperRef, showSuggestions);

  const filtered = useMemo(() => {
    if (!suggestions || !value) return [];
    return suggestions.filter((s) =>
      s.toLowerCase().includes(value.toLowerCase())
    );
  }, [suggestions, value]);

  useEffect(() => {
    if (!editing) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
        if (!value) setEditing(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editing, value]);

  const startEditing = () => {
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleClear = () => {
    onChange("");
    setEditing(false);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onChange("");
      setEditing(false);
      setShowSuggestions(false);
    }
  };

  if (!editing && !value) {
    return (
      <div className="flex gap-2 items-center h-7">
        <span>{label}</span>
        <button
          type="button"
          onClick={startEditing}
          className="p-0.5 rounded hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <Search className="w-4 h-4 text-sky-300" />
        </button>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="w-full">
      <div className="flex items-center gap-1 h-7">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (suggestions) setShowSuggestions(true);
          }}
          onFocus={() => {
            if (suggestions && value) setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={label}
          className="w-full h-full bg-sky-50 rounded-xl px-2 border border-blue-200 text-sm font-medium outline-none placeholder:text-cyan-900"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="p-0.5 rounded hover:bg-slate-200 cursor-pointer text-muted-foreground shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {showSuggestions && filtered.length > 0 && (
        <div
          style={{
            top: dropdownPos.top,
            left: dropdownPos.left,
            minWidth: 340,
            maxWidth: 420,
            whiteSpace: "normal",
          }}
          className="fixed bg-popover border rounded-md shadow-md z-50 max-h-65 overflow-y-auto overflow-x-hidden"
        >
          {filtered.map((item) => (
            <button
              type="button"
              key={item}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(item);
                setShowSuggestions(false);
              }}
              className="block w-full text-left px-3 py-2 text-xs hover:bg-slate-100 transition cursor-pointer border-b last:border-b-0 border-slate-100"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Select filter: dropdown only (for Төлөв) ────────────────────────
function SelectFilter({
  label,
  value,
  onChange,
  options,
}: ColumnFilterSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownPos = useDropdownPosition(wrapperRef, open);

  const selectedLabel = options.find((o) => o.key === value)?.label;

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={wrapperRef} className="w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full cursor-pointer"
      >
        <span className={value ? "text-blue-600" : undefined}>
          {selectedLabel || label}
        </span>
        <div className="flex items-center gap-0.5">
          {value && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
                setOpen(false);
              }}
              className="p-0.5 rounded hover:bg-slate-200 text-muted-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 text-muted-foreground/50 transition-transform",
              open && "rotate-180"
            )}
          />
        </div>
      </button>

      {open && (
        <div
          style={{
            top: dropdownPos.top,
            left: dropdownPos.left,
            minWidth: 180,
            whiteSpace: "normal",
          }}
          className="fixed bg-popover border rounded-md shadow-md z-50 overflow-y-auto overflow-x-hidden"
        >
          {options.map((opt) => (
            <button
              type="button"
              key={opt.key}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(opt.key === value ? "" : opt.key);
                setOpen(false);
              }}
              className={cn(
                "block w-full text-left px-3 py-2 text-xs hover:bg-slate-100 transition cursor-pointer",
                opt.key === value && "bg-blue-50 text-blue-700"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
