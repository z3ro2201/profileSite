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
      {label && <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>}
      <div className="relative" ref={dropdownRef}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`px-4 py-3 border border-gray-300 rounded-lg bg-white cursor-pointer transition flex items-center justify-between ${isOpen ? "ring-2 ring-blue-500 border-transparent" : "hover:border-gray-400"}`}
        >
          <span className={selectedValue ? "text-gray-900" : "text-gray-400"}>{displayText}</span>
          <svg className={`w-5 h-5 text-gray-400 transition-transform ml-2 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`px-4 py-3 cursor-pointer transition ${option.value === selectedValue ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-gray-50 text-gray-900"}`}
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
