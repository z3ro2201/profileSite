import React, { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
}

export const Input: React.FC<InputProps> = ({ type = "text", value, onChange, placeholder = "", label, name, className = "", ...props }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        {...props}
      />
    </div>
  );
};
