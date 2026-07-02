import React from 'react';
import { fbQuestion as FbQuestion } from './fbQuestion';

interface fbSearchInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  autoFocus?: boolean;
  subfield?: boolean;
}

export const fbSearchInput: React.FC<fbSearchInputProps> = ({
  label,
  value,
  onChange,
  placeholder = '',
  id,
  autoFocus = false,
  subfield = false,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleClear = () => {
    onChange('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const renderInput = () => {
    return (
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
        <input
          ref={inputRef}
          type="text"
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full text-black font-sans"
          style={{
            fontFamily: "'Roboto', sans-serif",
            fontWeight: 400,
            border: '0.1rem solid silver',
            borderRadius: '0.4rem',
            padding: '0.3rem 2.2rem 0.3rem 0.5rem',
            fontSize: '1rem',
            boxSizing: 'border-box',
            height: '2rem',
            backgroundColor: 'white',
          }}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            onMouseDown={(e) => e.preventDefault()}
            style={{
              position: 'absolute',
              right: '0.5rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: 'silver',
              fontSize: '1.2rem',
              padding: '0.1rem',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%'
            }}
          >
            ✕
          </button>
        )}
      </div>
    );
  };

  if (!label) {
    return renderInput();
  }

  return (
    <FbQuestion
      label={label}
      required={false}
      style={{ width: '100%' }}
      labelStyle={subfield ? { fontWeight: 300, fontSize: '1rem' } : undefined}
    >
      {renderInput()}
    </FbQuestion>
  );
};
