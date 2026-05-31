import * as React from 'react';

const defaultEmptyValues = ['', 'select', 'Select side'];

interface fbRoVFieldProps {
  label: string;
  value: any;
  lookupTable?: Record<string, string>;
  units?: string;
  coded?: boolean;
  emptyValues?: any[];
  preserveGridSpace?: boolean;
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>;
}

interface fbRoVTableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  tone?: 'standard' | 'muted';
  verticalAlign?: React.CSSProperties['verticalAlign'];
}

export const isFbRoVEmptyValue = (value: any, emptyValues: any[] = defaultEmptyValues) => (
  value === undefined ||
  value === null ||
  emptyValues.includes(value)
);

export const fbRoVCodedIcon: React.FC<{ coded: boolean }> = ({ coded }) => (
  <span
    className="material-icons fb-rov-coded-icon"
    title={coded ? 'Coded' : 'Not coded'}
  >
    {coded ? 'check_circle_outline' : 'warning'}
  </span>
);

export const fbRoVField: React.FC<fbRoVFieldProps> = ({
  label,
  value,
  lookupTable,
  units,
  coded,
  emptyValues = defaultEmptyValues,
  preserveGridSpace = true,
  labelProps,
}) => {
  if (isFbRoVEmptyValue(value, emptyValues)) {
    return preserveGridSpace ? <div></div> : null;
  }

  const displayValue = lookupTable && lookupTable[value] ? lookupTable[value] : value;
  const hasInlineDetails = !!units || coded !== undefined;

  return (
    <div className="space-y-2 fb-question-container fb-rov-field">
      <label className="fb-rov-field-label" {...labelProps}>{label}</label>
      <div className={hasInlineDetails ? 'fb-rov-field-value fb-rov-field-value-inline' : 'fb-rov-field-value'}>
        <span>{displayValue}</span>
        {units && <span className="fb-rov-field-units"> {units}</span>}
        {coded !== undefined && React.createElement(fbRoVCodedIcon, { coded })}
      </div>
    </div>
  );
};

export const fbRoVTableCell: React.FC<fbRoVTableCellProps> = ({
  tone = 'standard',
  verticalAlign = 'top',
  className = '',
  style,
  children,
  ...rest
}) => (
  <td
    className={`fb-rov-table-cell ${tone === 'muted' ? 'fb-rov-table-cell-muted' : 'fb-rov-table-cell-standard'} ${className}`.trim()}
    style={{ verticalAlign, ...style }}
    {...rest}
  >
    {children}
  </td>
);
