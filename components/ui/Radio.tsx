import React, { InputHTMLAttributes } from "react";

interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
}

export const Radio: React.FC<RadioProps> = ({ name, value, checked, onChange, label, className = "", ...props }) => {
  return (
    <label className="flex items-center cursor-pointer group">
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className={`w-5 h-5 text-[#23c6a9] border-border focus:ring-2 focus:ring-[#23c6a9] cursor-pointer ${className}`} {...props} />
      {label && <span className="ml-3 text-foreground group-hover:text-foreground">{label}</span>}
    </label>
  );
};
