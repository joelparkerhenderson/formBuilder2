import React from 'react';
import { fbQuestion as FbQuestion, fbQuestionRequiredMarkerContext } from './fbQuestion';
import { fbNumberInputWithUnits as FbNumberInputWithUnits } from './fbNumberInputWithUnits';

interface fbNumberInputProps {
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  required?: boolean;
  requiredForAudit?: boolean;
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
  valueError?: string;
}

export const fbNumberInput: React.FC<fbNumberInputProps> = ({
  label,
  value = '',
  onChange,
  required = false,
  requiredForAudit = false,
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
  valueError,
}) => {
  const questionOwnsRequiredMarkers = React.useContext(fbQuestionRequiredMarkerContext);
  const renderRequiredMarkers = !questionOwnsRequiredMarkers;
  const [hasBadInput, setHasBadInput] = React.useState(false);
  const currentValue = String(value ?? '');
  const automaticValueError = hasBadInput || (currentValue.trim() && !Number.isFinite(Number(currentValue)))
    ? 'Enter a number'
    : '';
  const displayedValueError = valueError || automaticValueError;

  const renderInput = () => {
    if (units) {
      return (
        <FbNumberInputWithUnits
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
          onBadInputChange={setHasBadInput}
        />
      );
    }

    return (
      <input
        type="number"
        id={id}
        name={name}
        value={value}
        onChange={(e) => {
          setHasBadInput(e.currentTarget.validity.badInput);
          onChange(e.target.value);
        }}
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
    if (required || requiredForAudit) {
      if (!renderRequiredMarkers) return renderInput();
      return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.2rem', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ flex: 1, width: '100%' }}>{renderInput()}</div>
          <span style={{ display: 'inline-flex', alignItems: 'flex-start', gap: '0.1rem', marginTop: '0.15rem' }}>
            {requiredForAudit && <span style={{ backgroundColor: '#fd8a10', color: 'white', fontSize: '0.8rem', fontWeight: 300, lineHeight: 1, padding: '0.05rem 0.2rem', display: 'inline-block', whiteSpace: 'nowrap' }}>RfA</span>}
            {required && <span style={{ color: '#d50000', fontSize: '1rem', fontWeight: 'bold', lineHeight: '1.2rem', display: 'inline-block', userSelect: 'none' }}>*</span>}
          </span>
        </div>
      );
    }
    return renderInput();
  }

  return (
    <FbQuestion
      label={label}
      required={required}
      requiredForAudit={requiredForAudit}
      className={className}
      style={style}
      labelStyle={{
        fontFamily: "'Roboto', sans-serif",
        fontSize: '1rem',
        fontWeight: subfield ? 300 : 500,
      }}
      valueError={displayedValueError}
    >
      {renderInput()}
    </FbQuestion>
  );
};
