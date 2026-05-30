import React, { useRef } from "react";
import { Calendar } from "lucide-react";

type UKFormDateInputProps = {
  value: string | null | undefined;
  onChange: (value: string) => void;
  className?: string;
};

export default function UKFormDateInput({
  value,
  onChange,
  className = "input",
}: UKFormDateInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse YYYY-MM-DD to DD/MM/YYYY
  let displayVal = "DD/MM/YYYY";
  if (value) {
    const parts = value.split("-");
    if (parts.length === 3) {
      displayVal = `${parts[2]}/${parts[1]}/${parts[0]}`;
    } else {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        displayVal = d.toLocaleDateString("en-GB");
      }
    }
  }

  return (
    <div
      className={`${className} flex items-center justify-between cursor-pointer relative min-h-[38px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 shadow-sm`}
      onClick={() => inputRef.current?.showPicker()}
    >
      <span
        className={
          value ? "text-slate-800 dark:text-slate-100" : "text-slate-400"
        }
      >
        {displayVal}
      </span>
      <Calendar size={16} className="text-slate-400 dark:text-slate-500" />
      <input
        ref={inputRef}
        type="date"
        className="absolute w-0 h-0 opacity-0 pointer-events-none"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
