import React from 'react';
import { fbQuestion as FbQuestion, fbQuestionRequiredMarkerContext } from './fbQuestion';

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
  requiredForAudit?: boolean;
  id?: string;
  name?: string;
  className?: string;
  style?: React.CSSProperties;
  selectStyle?: React.CSSProperties;
  placeholder?: string;
  subfield?: boolean;
  valueError?: string;
  children?: React.ReactNode;
  noWidthConstraint?: boolean;
  fullWidth?: boolean;
}

export const fbDropdown: React.FC<fbDropdownProps> = ({
  label,
  value = '',
  onChange,
  options,
  required = false,
  requiredForAudit = false,
  id,
  name,
  className = '',
  style,
  selectStyle,
  placeholder,
  subfield = false,
  valueError,
  children,
  noWidthConstraint = false,
  fullWidth = false,
}) => {
  const questionOwnsRequiredMarkers = React.useContext(fbQuestionRequiredMarkerContext);
  const renderRequiredMarkers = !questionOwnsRequiredMarkers;
  const parsedOptions = options.map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const renderSelect = () => {
    const childContent = React.Children.map(children, (child) => React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<any>, { selectedValue: value }) : child);
    return (
      <>
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
          width: '100%',
          maxWidth: fullWidth || noWidthConstraint ? undefined : '35rem',
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
      {childContent}
      </>
    );
  };

  if (!label) {
    if (required || requiredForAudit) {
      if (!renderRequiredMarkers) return renderSelect();
      return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.2rem', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ flex: 1, width: '100%' }}>{renderSelect()}</div>
          <span style={{ display: 'inline-flex', alignItems: 'flex-start', gap: '0.1rem', marginTop: '0.15rem' }}>
            {requiredForAudit && <span style={{ backgroundColor: '#fd8a10', color: 'white', fontSize: '0.8rem', fontWeight: 300, lineHeight: 1, padding: '0.05rem 0.2rem', display: 'inline-block', whiteSpace: 'nowrap' }}>RfA</span>}
            {required && <span style={{ color: '#d50000', fontSize: '1rem', fontWeight: 'bold', lineHeight: '1.2rem', display: 'inline-block', userSelect: 'none' }}>*</span>}
          </span>
        </div>
      );
    }
    return renderSelect();
  }

  return (
    <FbQuestion
      label={label}
      required={required}
      requiredForAudit={requiredForAudit}
      className={className}
      style={style}
      labelStyle={subfield ? { fontWeight: 300, fontSize: '1rem' } : undefined}
      valueError={valueError}
    >
      {renderSelect()}
    </FbQuestion>
  );
};
