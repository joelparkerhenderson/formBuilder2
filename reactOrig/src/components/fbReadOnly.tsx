import * as React from 'react';

const defaultEmptyValues = ['', 'select', 'Select side'];

interface fbReadOnlyProps {
  label: string;
  value: any;
  lookupTable?: Record<string, string>;
  units?: string;
  coded?: boolean;
  bigLabel?: boolean;
  boldLabel?: boolean;
  emptyValues?: any[];
  preserveGridSpace?: boolean;
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>;
}

interface fbReadOnlyTableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  tone?: 'standard' | 'muted';
  verticalAlign?: React.CSSProperties['verticalAlign'];
}

export const isFbReadOnlyEmptyValue = (value: any, emptyValues: any[] = defaultEmptyValues) => (
  value === undefined ||
  value === null ||
  emptyValues.includes(value)
);

export const fbReadOnlyCodedIcon: React.FC<{ coded: boolean }> = ({ coded }) => (
  <span
    className="material-icons fb-read-only-coded-icon"
    title={coded ? 'Coded' : 'Not coded'}
    aria-label={coded ? 'Coded' : 'Not coded'}
    style={{ alignSelf: 'flex-start', display: 'inline-flex' }}
  >
    {coded ? 'check_circle_outline' : 'warning'}
  </span>
);

export const fbReadOnly: React.FC<fbReadOnlyProps> = ({
  label,
  value,
  lookupTable,
  units,
  coded,
  bigLabel = false,
  boldLabel = false,
  emptyValues = defaultEmptyValues,
  preserveGridSpace = true,
  labelProps,
}) => {
  if (isFbReadOnlyEmptyValue(value, emptyValues)) {
    return preserveGridSpace ? <div></div> : null;
  }

  const displayValue = lookupTable && lookupTable[value] ? lookupTable[value] : value;
  const hasInlineDetails = !!units || coded !== undefined;

  return (
    <div className="space-y-2 fb-question-container fb-read-only">
      <label
        className={`fb-read-only-label${bigLabel ? ' big-label' : ''}${boldLabel ? ' bold-label' : ''}`}
        {...labelProps}
      >
        {label}
      </label>
      <div className={hasInlineDetails ? 'fb-read-only-value fb-read-only-value-inline' : 'fb-read-only-value'}>
        <span>{displayValue}</span>
        {units && <span className="fb-read-only-units"> {units}</span>}
        {coded !== undefined && React.createElement(fbReadOnlyCodedIcon, { coded })}
      </div>
    </div>
  );
};

export const fbReadOnlyTableCell: React.FC<fbReadOnlyTableCellProps> = ({
  tone = 'standard',
  verticalAlign = 'top',
  className = '',
  style,
  children,
  ...rest
}) => (
  <td
    className={`fb-read-only-table-cell ${tone === 'muted' ? 'fb-read-only-table-cell-muted' : 'fb-read-only-table-cell-standard'} ${className}`.trim()}
    style={{ verticalAlign, ...style }}
    {...rest}
  >
    {children}
  </td>
);
