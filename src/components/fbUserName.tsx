import React, { useState } from 'react';

interface fbUserNameProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const fbUserName: React.FC<fbUserNameProps> = ({
  value = '',
  onChange,
  id = 'username-input',
  className = 'fb-bottom-control-username',
  style,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <input
      type="text"
      id={id}
      name="username"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter username"
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{
        display: 'inline-block',
        height: '2.0rem',
        lineHeight: '2rem',
        padding: '0 0.5rem',
        border: '0.1rem solid silver',
        borderRadius: '0.4rem',
        fontFamily: "'Roboto', sans-serif",
        fontSize: '1rem',
        fontWeight: 400,
        color: 'black',
        boxSizing: 'border-box',
        backgroundColor: (isHovered || isFocused) ? '#fee715' : 'white',
        outline: 'none',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
        ...style,
      }}
    />
  );
};
