import React from 'react';

export const fbcpTextInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
  <input ref={ref} className="fbcp-text-input" {...props} />
));

