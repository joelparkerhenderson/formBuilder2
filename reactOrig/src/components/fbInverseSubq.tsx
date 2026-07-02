import React from 'react';
import { fbAnimatedSubquestion as FbAnimatedSubquestion } from './fbAnimatedSubquestion';
import { fbSubfieldContext } from './fbQuestion';

interface fbInverseSubqProps {
  open: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const fbInverseSubq: React.FC<fbInverseSubqProps> = ({ open, children, style }) => (
  <FbAnimatedSubquestion open={open}>
    <div className="fb-subquestion fb-inverse-subq" style={{ paddingLeft: 0, ...style }}>
      <fbSubfieldContext.Provider value>
        {children}
      </fbSubfieldContext.Provider>
    </div>
  </FbAnimatedSubquestion>
);
