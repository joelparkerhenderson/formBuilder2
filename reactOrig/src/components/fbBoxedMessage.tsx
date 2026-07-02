import React from 'react';

type BoxedMessageVariant = 'warning' | 'alert' | 'info';

interface fbBoxedMessageProps {
  text: React.ReactNode;
  variant: BoxedMessageVariant;
  style?: React.CSSProperties;
  className?: string;
}

const variantColour: Record<BoxedMessageVariant, string> = {
  warning: '#fd8a10',
  alert: '#d50000',
  info: '#1b6ec2',
};

const variantIcon: Record<BoxedMessageVariant, string> = {
  warning: 'warning',
  alert: 'error',
  info: 'info',
};

const FbBoxedMessage: React.FC<fbBoxedMessageProps> = ({
  text,
  variant,
  style,
  className = '',
}) => {
  const colour = variantColour[variant];

  return (
    <div
      className={className}
      style={{
        width: '100%',
        border: `0.2rem solid ${colour}`,
        borderRadius: '0.4rem',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        padding: '0.6rem 0.8rem',
        color: colour,
        backgroundColor: 'white',
        fontFamily: "'Roboto', sans-serif",
        fontWeight: 500,
        textAlign: 'left',
        ...style,
      }}
    >
      <span
        className="material-icons"
        aria-hidden="true"
        style={{
          color: colour,
          fontSize: '4rem',
          lineHeight: 1,
          flex: '0 0 auto',
        }}
      >
        {variantIcon[variant]}
      </span>
      <div style={{ flex: 1 }}>{text}</div>
    </div>
  );
};

export const fbBoxedWarning: React.FC<Omit<fbBoxedMessageProps, 'variant'>> = (props) => (
  <FbBoxedMessage {...props} variant="warning" />
);

export const fbBoxedAlert: React.FC<Omit<fbBoxedMessageProps, 'variant'>> = (props) => (
  <FbBoxedMessage {...props} variant="alert" />
);

export const fbBoxedInfo: React.FC<Omit<fbBoxedMessageProps, 'variant'>> = (props) => (
  <FbBoxedMessage {...props} variant="info" />
);
