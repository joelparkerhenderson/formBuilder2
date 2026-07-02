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
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const [popupPosition, setPopupPosition] = React.useState({ top: 0, left: 0, width: 0, maxHeight: 256 });
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const generatedInputId = React.useId();
  const inputId = id || name || generatedInputId;
  const listboxId = `${inputId}-listbox`;

  const updatePopupPosition = React.useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    const edgeGap = 12;
    const preferredHeight = 256;
    const spaceBelow = window.innerHeight - rect.bottom - edgeGap;
    const spaceAbove = rect.top - edgeGap;
    const width = Math.min(rect.width, window.innerWidth - edgeGap * 2);
    const maxHeight = Math.min(preferredHeight, Math.max(120, spaceBelow >= spaceAbove ? spaceBelow : spaceAbove));
    const top = spaceBelow >= preferredHeight || spaceBelow >= spaceAbove ? rect.bottom + 2 : Math.max(edgeGap, rect.top - maxHeight - 2);
    const left = Math.max(edgeGap, Math.min(rect.left, window.innerWidth - width - edgeGap));
    setPopupPosition({ top, left, width, maxHeight });
  }, []);

  const openDropdown = React.useCallback(() => {
    setOpen(true);
    requestAnimationFrame(updatePopupPosition);
  }, [updatePopupPosition]);

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

  React.useEffect(() => {
    if (!open) return undefined;
    updatePopupPosition();
    const wrapper = wrapperRef.current;
    if (!wrapper) return undefined;
    const scrollParents: Array<Window | HTMLElement> = [window];
    let current = wrapper.parentElement;
    while (current) {
      const style = window.getComputedStyle(current);
      if (/(auto|scroll|overlay)/.test(`${style.overflow}${style.overflowY}${style.overflowX}`)) scrollParents.push(current);
      current = current.parentElement;
    }
    for (const parent of scrollParents) parent.addEventListener('scroll', updatePopupPosition, { passive: true });
    window.addEventListener('resize', updatePopupPosition);
    return () => {
      for (const parent of scrollParents) parent.removeEventListener('scroll', updatePopupPosition);
      window.removeEventListener('resize', updatePopupPosition);
    };
  }, [open, updatePopupPosition]);

  React.useEffect(() => {
    if (!open) setHighlightedIndex(-1);
    else if (matches.length === 0) setHighlightedIndex(-1);
    else if (highlightedIndex >= matches.length) setHighlightedIndex(matches.length - 1);
  }, [highlightedIndex, matches.length, open]);

  const selectOption = (option: SmartDropdownOption) => {
    onChange(option.value);
    setInputValue(option.label);
    setOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) openDropdown();
      setHighlightedIndex((current) => matches.length ? Math.min(current + 1, matches.length - 1) : -1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) openDropdown();
      setHighlightedIndex((current) => matches.length ? Math.max(current - 1, 0) : -1);
    } else if (event.key === 'Enter' && open && highlightedIndex >= 0 && matches[highlightedIndex]) {
      event.preventDefault();
      selectOption(matches[highlightedIndex]);
    } else if (event.key === 'Escape') {
      setOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const control = (
    <>
      <div ref={wrapperRef} style={{ position: 'relative', width: '100%', maxWidth: fullWidth || noWidthConstraint ? undefined : '35rem' }}>
        <input
          id={inputId}
          name={name}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={open && highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined}
          aria-autocomplete="list"
          value={inputValue}
          placeholder={placeholder}
          required={required}
          onFocus={openDropdown}
          onKeyDown={handleKeyDown}
          onChange={(event) => {
            setInputValue(event.target.value);
            onChange(event.target.value);
            openDropdown();
            setHighlightedIndex(-1);
          }}
          style={{
            width: '100%',
            height: '2rem',
            border: '0.1rem solid silver',
            borderRadius: '0.4rem',
            boxSizing: 'border-box',
            padding: '0.2rem 1.7rem 0.2rem 0.4rem',
            fontFamily: "'Roboto', sans-serif",
            fontSize: '1rem',
            fontWeight: 400,
          }}
        />
        <button
          type="button"
          aria-label={open ? 'Hide options' : 'Show options'}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => open ? setOpen(false) : openDropdown()}
          style={{
            position: 'absolute',
            right: '0.25rem',
            top: '50%',
            transform: 'translateY(-50%)',
            border: 'none',
            background: 'transparent',
            color: '#666',
            cursor: 'pointer',
            fontSize: '1rem',
            lineHeight: 1,
            padding: '0.1rem',
          }}
        >
          {open ? '\u25b2' : '\u25bc'}
        </button>
        {open && matches.length > 0 && (
          <div
            id={listboxId}
            role="listbox"
            style={{
              position: 'fixed',
              zIndex: 1000,
              top: popupPosition.top,
              left: popupPosition.left,
              width: popupPosition.width,
              maxHeight: popupPosition.maxHeight,
              overflowY: 'auto',
              backgroundColor: 'white',
              border: '0.1rem solid silver',
              borderRadius: '0.4rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            {matches.map((option, index) => (
              <button
                key={option.value}
                id={`${listboxId}-option-${index}`}
                type="button"
                role="option"
                aria-selected={option.value === value}
                onClick={() => {
                  selectOption(option);
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                style={{
                  display: 'block',
                  width: '100%',
                  border: 'none',
                  backgroundColor: highlightedIndex === index || option.value === value ? '#ffffcc' : 'white',
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
