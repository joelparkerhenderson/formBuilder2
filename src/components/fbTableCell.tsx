import React from 'react';

interface fbTableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export const fbTableCell: React.FC<fbTableCellProps> = ({
  children,
  className = '',
  style,
  ...props
}) => {
  return (
    <td
      className={`bg-white hover:bg-[#ffffcc] focus-within:bg-[#ffffcc] transition-colors ${className}`}
      style={{
        padding: '0.4rem',
        borderBottom: '1px solid silver',
        ...style
      }}
      {...props}
    >
      {children}
    </td>
  );
};
