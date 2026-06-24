import React from 'react';
import { fbQuestion as FbQuestion } from './fbQuestion';
import { matchSmartDropdownOptions, normaliseSmartDropdownOptions, SmartDropdownOption } from '../utils/smartDropdown';

interface fbSmartDropdownProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: (SmartDropdownOption | string)[];
  required?: boolean;
  requiredForAudit?: boolean;
  placeholder?: string;
  subfield?: boolean;
  valueError?: string;
  id?: string;
  name?: string;
  children?: React.ReactNode;
  noWidthConstraint?: boolean;
  fullWidth?: boolean;
}

export const fbSmartDropdown: React.FC<fbSmartDropdownProps> = ({
  label,
  value,
  onChange,
  options,
  required,
  requiredForAudit,
  placeholder = 'Type here to search',
  subfield = false,
  valueError,
  id,
  name,
  children,
  noWidthConstraint = false,
  fullWidth = false,
}) => {
  const parsedOptions = React.useMemo(() => normaliseSmartDropdownOptions(options), [options]);
  const selected = parsedOptions.find((option) => option.value === value);
  const [inputValue, setInputValue] = React.useState(selected?.label || value || '');
  const [open, setOpen] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const nextSelected = parsedOptions.find((option) => option.value === value);
    setInputValue(nextSelected?.label || value || '');
  }, [parsedOptions, value]);

  React.useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const matches = matchSmartDropdownOptions(parsedOptions, inputValue, 20);
  const childContent = React.Children.map(children, (child) => React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<any>, { selectedValue: value }) : child);

  const control = (
    <>
      <div ref={wrapperRef} style={{ position: 'relative', width: '100%', maxWidth: fullWidth || noWidthConstraint ? undefined : '35rem' }}>
        <input
          id={id}
          name={name}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          value={inputValue}
          placeholder={placeholder}
          required={required}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setInputValue(event.target.value);
            onChange(event.target.value);
            setOpen(true);
          }}
          style={{
            width: '100%',
            height: '2rem',
            border: '0.1rem solid silver',
            borderRadius: '0.4rem',
            boxSizing: 'border-box',
            padding: '0.2rem 0.4rem',
            fontFamily: "'Roboto', sans-serif",
            fontSize: '1rem',
            fontWeight: 400,
          }}
        />
        {open && matches.length > 0 && (
          <div
            role="listbox"
            style={{
              position: 'absolute',
              zIndex: 1000,
              top: '2.1rem',
              left: 0,
              right: 0,
              maxHeight: '16rem',
              overflowY: 'auto',
              backgroundColor: 'white',
              border: '0.1rem solid silver',
              borderRadius: '0.4rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            {matches.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                onClick={() => {
                  onChange(option.value);
                  setInputValue(option.label);
                  setOpen(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  border: 'none',
                  backgroundColor: option.value === value ? '#ffffcc' : 'white',
                  padding: '0.25rem 0.4rem',
                  textAlign: 'left',
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: '1rem',
                  cursor: 'pointer',
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {childContent}
    </>
  );

  if (!label) return control;
  return (
    <FbQuestion
      label={label}
      required={required}
      requiredForAudit={requiredForAudit}
      labelStyle={subfield ? { fontWeight: 300, fontSize: '1rem' } : undefined}
      valueError={valueError}
    >
      {control}
    </FbQuestion>
  );
};
