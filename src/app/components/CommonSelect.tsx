'use client';

import { useState, useRef, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';

type Option = {
  _id: string;
  name: string;
};

type CommonSelectProps = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export default function CommonSelect({
  options,
  value,
  onChange,
  placeholder = '-- Select --',
  disabled = false,
}: CommonSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option._id === value);

  const handleSelect = (optionValue: string) => {
    if (disabled) return;
    onChange(optionValue);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={selectRef}>
      <button
        type="button"
        className={`w-full bg-white border border-gray-300 text-gray-800 py-2 px-3 rounded-md leading-tight focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out shadow-sm text-base flex justify-between items-center ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span>{selectedOption ? selectedOption.name : placeholder}</span>
        <FaChevronDown className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <li
              key={option._id}
              className="px-3 py-2 cursor-pointer hover:bg-blue-100"
              onClick={() => handleSelect(option._id)}
            >
              {option.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
