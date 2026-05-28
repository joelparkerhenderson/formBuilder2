import React from 'react';

interface Option {
  label: string;
  value: string;
}

interface fbGroupProps {
  type: 'radio' | 'checkbox';
  name: string;
  options: Option[];
  selectedValue?: string | string[]; // Can be string for radio, array of strings for checkbox
  onChange: (value: any) => void;
  direction?: 'row' | 'col';
  style?: React.CSSProperties;
}

export const fbGroup: React.FC<fbGroupProps> = ({
  type = 'radio',
  name,
  options,
  selectedValue,
  onChange,
  direction = 'col',
  style,
}) => {
  const isChecked = (val: string) => {
    if (type === 'checkbox') {
      return Array.isArray(selectedValue) ? selectedValue.includes(val) : false;
    }
    return selectedValue === val;
  };

  const handleChange = (val: string, checked: boolean) => {
    if (type === 'radio') {
      onChange(val);
    } else {
      const currentArr = Array.isArray(selectedValue) ? [...selectedValue] : [];
      if (checked) {
        if (!currentArr.includes(val)) {
          currentArr.push(val);
        }
      } else {
        const index = currentArr.indexOf(val);
        if (index > -1) {
          currentArr.splice(index, 1);
        }
      }
      onChange(currentArr);
    }
  };

  return (
    <div
      className="radio-checkbox-group-container"
      style={{
        display: 'flex',
        flexDirection: direction === 'row' ? 'row' : 'column',
        gap: direction === 'row' ? '1rem' : '0.1rem',
        ...style
      }}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className="radio-checkbox-item flex items-start gap-2 w-full"
          style={{
            paddingTop: '0.1rem',
            paddingBottom: '0.1rem',
            marginTop: 0,
            marginBottom: 0,
            cursor: 'pointer',
            fontFamily: "'Roboto', sans-serif",
            fontSize: '1rem',
            fontWeight: 300,
            userSelect: 'none',
            display: 'inline-flex',
            alignItems: 'flex-start',
            borderRadius: '0.4rem',
            boxSizing: 'border-box'
          }}
        >
          <input
            type={type}
            name={name}
            value={option.value}
            checked={isChecked(option.value)}
            onChange={(e) => handleChange(option.value, e.target.checked)}
            style={{
              cursor: 'pointer',
              width: '1rem',
              height: '1rem',
              marginTop: '0.2rem',
              flexShrink: 0,
              outline: 'none',
              boxShadow: 'none'
            }}
          />
          <span style={{ fontWeight: 300, lineHeight: '1.4rem' }}>{option.label}</span>
        </label>
      ))}
    </div>
  );
};
