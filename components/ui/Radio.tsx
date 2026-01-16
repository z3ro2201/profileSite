import React, { InputHTMLAttributes } from "react";

interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
}

export const Radio: React.FC<RadioProps> = ({ name, value, checked, onChange, label, className = "", ...props }) => {
  return (
    <label className="flex items-center cursor-pointer group">
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className={`w-5 h-5 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer ${className}`} {...props} />
      {label && <span className="ml-3 text-gray-700 group-hover:text-gray-900">{label}</span>}
    </label>
  );
};
