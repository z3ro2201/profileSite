import React, { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  options: Option[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({ label, options, placeholder = "선택해주세요", value, onChange, name, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || "");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === selectedValue);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  useEffect(() => {
    if (value !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 외부 value prop과 내부 상태 동기화
      setSelectedValue(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue);
    setIsOpen(false);
    if (onChange) {
      onChange(optionValue);
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && <label className="block text-sm font-semibold text-foreground mb-2">{label}</label>}
      <div className="relative" ref={dropdownRef}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`px-4 py-3 border border-border rounded-lg bg-[var(--input-background)] cursor-pointer transition flex items-center justify-between ${isOpen ? "ring-2 ring-[#23c6a9] border-transparent" : "hover:border-[var(--muted-foreground)]"}`}
        >
          <span className={selectedValue ? "text-foreground" : "text-muted-foreground"}>{displayText}</span>
          <svg className={`w-5 h-5 text-muted-foreground transition-transform ml-2 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-[var(--card)] border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`px-4 py-3 cursor-pointer transition ${option.value === selectedValue ? "bg-[rgba(35,198,169,0.1)] text-[#23c6a9] font-medium" : "hover:bg-[var(--secondary)] text-foreground"}`}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
      {name && <input type="hidden" name={name} value={selectedValue} />}
    </div>
  );
};
