import React from 'react';
import { fbQuestion as FbQuestion } from './fbQuestion';

interface fbBloodPressureProps {
  label?: string;
  systolic: string | number;
  diastolic: string | number;
  onChange: (value: { systolic: string; diastolic: string }) => void;
  required?: boolean;
  id?: string;
  name?: string;
  className?: string;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
  valueError?: string;
  subfield?: boolean;
}

export const fbBloodPressure: React.FC<fbBloodPressureProps> = ({
  label,
  systolic = '',
  diastolic = '',
  onChange,
  required = false,
  id,
  name,
  className = '',
  style,
  inputStyle,
  valueError,
  subfield = false,
}) => {
  const systolicId = id ? `${id}-systolic` : undefined;
  const diastolicId = id ? `${id}-diastolic` : undefined;
  const controlName = name || id || 'blood-pressure';

  const renderInput = () => (
    <div
      className="fb-blood-pressure-control"
      style={{
        display: 'inline-grid',
        gridTemplateColumns: '4.5ch auto',
        gridTemplateRows: '1.4rem 0.2rem 1.4rem',
        columnGap: '0.5rem',
        alignItems: 'center',
        border: '0.1rem solid silver',
        borderRadius: '0.4rem',
        backgroundColor: 'white',
        padding: '0.2rem',
        boxSizing: 'border-box',
      }}
    >
      <input
        className="fb-blood-pressure-input"
        id={systolicId}
        name={`${controlName}_systolic`}
        type="number"
        value={systolic}
        onChange={(event) => onChange({ systolic: event.target.value, diastolic: String(diastolic ?? '') })}
        required={required}
        aria-label={label ? `${label} systolic` : 'Systolic blood pressure'}
        style={{
          ...inputStyle,
          width: '4.5ch',
          height: '1.4rem',
          border: 'none',
          borderWidth: 0,
          borderRadius: 0,
          padding: 0,
          textAlign: 'center',
          fontFamily: "'Roboto', sans-serif",
          fontSize: '1rem',
          fontWeight: 400,
          backgroundColor: 'white',
          boxSizing: 'border-box',
          outline: 'none',
          boxShadow: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          gridColumn: 2,
          gridRow: '1 / 4',
          alignSelf: 'center',
          padding: 0,
          fontFamily: "'Roboto', sans-serif",
          fontSize: '0.8rem',
          fontWeight: 400,
          color: 'black',
        }}
      >
        mmHg
      </div>
      <div
        aria-hidden="true"
        style={{
          gridColumn: 1,
          gridRow: 2,
          height: '0.2rem',
          backgroundColor: 'silver',
        }}
      />
      <input
        className="fb-blood-pressure-input"
        id={diastolicId}
        name={`${controlName}_diastolic`}
        type="number"
        value={diastolic}
        onChange={(event) => onChange({ systolic: String(systolic ?? ''), diastolic: event.target.value })}
        required={required}
        aria-label={label ? `${label} diastolic` : 'Diastolic blood pressure'}
        style={{
          ...inputStyle,
          width: '4.5ch',
          height: '1.4rem',
          border: 'none',
          borderWidth: 0,
          borderRadius: 0,
          padding: 0,
          textAlign: 'center',
          fontFamily: "'Roboto', sans-serif",
          fontSize: '1rem',
          fontWeight: 400,
          backgroundColor: 'white',
          boxSizing: 'border-box',
          outline: 'none',
          boxShadow: 'none',
        }}
      />
    </div>
  );

  if (!label) return renderInput();

  return (
    <FbQuestion
      label={label}
      required={required}
      className={className}
      style={style}
      labelStyle={subfield ? { fontWeight: 300, fontSize: '1rem' } : undefined}
      valueError={valueError}
    >
      {renderInput()}
    </FbQuestion>
  );
};
