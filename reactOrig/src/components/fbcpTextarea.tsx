import React from 'react';

export const fbcpTextarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>((props, ref) => (
  <textarea ref={ref} className="fbcp-textarea" rows={1} {...props} />
));

