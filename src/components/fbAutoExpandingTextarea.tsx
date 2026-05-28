import React from 'react';

interface AutoExpandingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value?: string;
}

export const fbAutoExpandingTextarea: React.FC<AutoExpandingTextareaProps> = ({
  value = '',
  style,
  rows = 2,
  ...props
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const defaultHeight = (rows as number) * 20 + 12; // Dynamic minimum height based on rows count
      textarea.style.height = `${Math.max(defaultHeight, textarea.scrollHeight)}px`;
    }
  };

  React.useLayoutEffect(() => {
    adjustHeight();
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.stopPropagation(); // Prevent fbLayout key listener from catching it
    }
    if (props.onKeyDown) {
      props.onKeyDown(e);
    }
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      rows={rows}
      onKeyDown={handleKeyDown}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        resize: 'none',
        overflow: 'hidden',
        border: '0.1rem solid silver',
        borderRadius: '0.4rem',
        padding: '0.3rem 0.5rem',
        ...style
      }}
      {...props}
    />
  );
};
