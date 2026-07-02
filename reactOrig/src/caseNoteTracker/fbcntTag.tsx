import React from 'react';
import { fbBlue } from './cntStyles';

export function FbcntTag({ title }: { title?: string }) {
  return (
    <span
      className="material-icons"
      title={title}
      aria-label={title || 'Tagged'}
      style={{
        color: fbBlue,
        backgroundColor: 'white',
        fontFamily: 'Material Icons',
        fontSize: '1rem',
        lineHeight: 1,
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
    >
      sell
    </span>
  );
}
