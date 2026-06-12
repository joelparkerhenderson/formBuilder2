import React from 'react';
import { fbQuestion as FbQuestion } from './fbQuestion';
import { fbTextInputWithUnits as FbTextInputWithUnits } from './fbTextInputWithUnits';

interface fbNumberInputProps {
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  required?: boolean;
  units?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  id?: string;
  name?: string;
  className?: string;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
  unitLabelProps?: React.HTMLAttributes<HTMLSpanElement>;
  subfield?: boolean;
}

export const fbNumberInput: React.FC<fbNumberInputProps> = ({
  label,
  value = '',
  onChange,
  required = false,
  units,
  placeholder = '',
  min,
  max,
  id,
  name,
  className = '',
  style,
  inputStyle,
  unitLabelProps,
  subfield = false,
}) => {
  const renderInput = () => {
    if (units) {
      return (
        <FbTextInputWithUnits
          value={value}
          onChange={onChange}
          units={units}
          type="number"
          placeholder={placeholder}
          min={min}
          max={max}
          inputStyle={inputStyle}
          unitLabelProps={unitLabelProps}
          style={{ maxWidth: 'calc(10ch + 5rem)' }}
        />
      );
    }

    return (
      <input
        type="number"
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
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
          maxWidth: '10ch',
          padding: '0.2rem 0.4rem',
          backgroundColor: 'white',
          ...inputStyle,
        }}
      />
    );
  };

  if (!label) {
    return renderInput();
  }

  return (
    <FbQuestion
      label={label}
      required={required}
      className={className}
      style={style}
      labelStyle={{
        fontFamily: "'Roboto', sans-serif",
        fontSize: '1rem',
        fontWeight: subfield ? 300 : 500,
      }}
    >
      {renderInput()}
    </FbQuestion>
  );
};
