import React from 'react';

interface fbTableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export const fbTable: React.FC<fbTableProps> = ({ children, style, className = '', ...props }) => {
  return (
    <table
      className={`min-w-full text-left font-sans font-light ${className}`}
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: 'white',
        ...style
      }}
      {...props}
    >
      {children}
    </table>
  );
};

export const fbTableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, ...props }) => {
  return <thead {...props}>{children}</thead>;
};

export const fbTableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, ...props }) => {
  return <tbody {...props}>{children}</tbody>;
};

interface fbTableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
}

export const fbTableRow: React.FC<fbTableRowProps> = ({ children, style, ...props }) => {
  return (
    <tr
      style={{
        borderBottom: '1px solid silver',
        ...style
      }}
      {...props}
    >
      {children}
    </tr>
  );
};

interface fbTableHeaderCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export const fbTableHeaderCell: React.FC<fbTableHeaderCellProps> = ({ children, style, className = '', ...props }) => {
  return (
    <th
      className={className}
      style={{
        padding: '0.4rem',
        fontFamily: "'Roboto', sans-serif",
        fontSize: '0.8rem',
        fontStyle: 'italic',
        fontWeight: 300,
        color: '#555555',
        textAlign: 'left',
        verticalAlign: 'bottom',
        ...style
      }}
      {...props}
    >
      {children}
    </th>
  );
};
