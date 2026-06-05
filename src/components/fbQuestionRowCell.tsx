import React from 'react';

interface fbQuestionRowCellProps {
  id?: string;
  span?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const fbQuestionRowCell: React.FC<fbQuestionRowCellProps> = ({
  id,
  span = 1,
  children,
  style,
  className = '',
}) => {
  const getColSpanClass = () => {
    switch (span) {
      case 2: return 'md:col-span-2';
      case 3: return 'md:col-span-3';
      case 4: return 'md:col-span-4';
      case 5: return 'md:col-span-5';
      case 6: return 'md:col-span-6';
      case 7: return 'md:col-span-7';
      case 8: return 'md:col-span-8';
      case 9: return 'md:col-span-9';
      case 10: return 'md:col-span-10';
      case 11: return 'md:col-span-11';
      case 12: return 'md:col-span-12';
      default: return '';
    }
  };

  return (
    <div
      id={id}
      className={`${getColSpanClass()} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};
