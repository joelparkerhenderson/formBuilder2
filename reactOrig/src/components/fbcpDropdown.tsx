import React from 'react';

export const fbcpDropdown = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>((props, ref) => (
  <select ref={ref} className="fbcp-dropdown" {...props} />
));

