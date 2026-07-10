import React, { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
}

export const Input: React.FC<InputProps> = ({ type = "text", value, onChange, placeholder = "", label, name, className = "", ...props }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && <label className="block text-sm font-semibold text-foreground mb-2">{label}</label>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-border rounded-lg bg-[var(--input-background)] text-foreground focus:ring-2 focus:ring-[#23c6a9] focus:border-transparent outline-none transition"
        {...props}
      />
    </div>
  );
};
