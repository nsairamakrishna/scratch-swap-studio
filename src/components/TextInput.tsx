
import React, { useState } from 'react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  width?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  placeholder = '',
  className = '',
  width = '100px'
}) => {
  const [localValue, setLocalValue] = useState<string>(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    onChange(e.target.value);
  };

  return (
    <input
      type="text"
      value={localValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={`rounded px-2 bg-white/90 text-black text-sm mx-1 focus:outline-none focus:ring-2 focus:ring-white ${className}`}
      style={{ width }}
    />
  );
};

export default TextInput;
