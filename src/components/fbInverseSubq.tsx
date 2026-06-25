import React from 'react';
import { fbAnimatedSubquestion as FbAnimatedSubquestion } from './fbAnimatedSubquestion';

interface fbInverseSubqProps {
  open: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const fbInverseSubq: React.FC<fbInverseSubqProps> = ({ open, children, style }) => (
  <FbAnimatedSubquestion open={open}>
    <div className="fb-subquestion fb-inverse-subq" style={{ paddingLeft: 0, ...style }}>
      {children}
    </div>
  </FbAnimatedSubquestion>
);
