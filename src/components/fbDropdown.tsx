import React from 'react';
import { fbQuestion as FbQuestion } from './fbQuestion';

interface DropdownOption {
  value: string;
  label: string;
}

interface fbDropdownProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: (DropdownOption | string)[];
  required?: boolean;
  id?: string;
  name?: string;
  className?: string;
  style?: React.CSSProperties;
  selectStyle?: React.CSSProperties;
  placeholder?: string;
  subfield?: boolean;
}

export const fbDropdown: React.FC<fbDropdownProps> = ({
  label,
  value = '',
  onChange,
  options,
  required = false,
  id,
  name,
  className = '',
  style,
  selectStyle,
  placeholder,
  subfield = false,
}) => {
  const parsedOptions = options.map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const renderSelect = () => {
    return (
      <select
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full text-black"
        style={{
          fontFamily: "'Roboto', sans-serif",
          fontSize: '1rem',
          fontWeight: 400,
          border: '0.1rem solid silver',
          borderRadius: '0.4rem',
          boxSizing: 'border-box',
          height: '2rem',
          padding: '0.2rem 0.4rem',
          backgroundColor: 'white',
          ...selectStyle,
        }}
      >
        {placeholder !== undefined && (
          <option value="">{placeholder}</option>
        )}
        {parsedOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  };

  if (!label) {
    return renderSelect();
  }

  return (
    <FbQuestion
      label={label}
      required={required}
      className={className}
      style={style}
      labelStyle={subfield ? { fontWeight: 300, fontSize: '1rem' } : undefined}
    >
      {renderSelect()}
    </FbQuestion>
  );
};
