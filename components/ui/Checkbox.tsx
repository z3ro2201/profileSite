import React, { InputHTMLAttributes } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ value, checked, onChange, label, name, className = "", ...props }) => {
  return (
    <label className="flex items-center cursor-pointer group">
      <input type="checkbox" name={name} value={value} checked={checked} onChange={onChange} className={`w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer ${className}`} {...props} />
      {label && <span className="ml-3 text-gray-700 group-hover:text-gray-900">{label}</span>}
    </label>
  );
};
