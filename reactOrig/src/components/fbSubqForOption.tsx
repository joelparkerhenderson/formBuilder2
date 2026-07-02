import React from 'react';
import { fbAnimatedSubquestion as FbAnimatedSubquestion } from './fbAnimatedSubquestion';
import { fbSubfieldContext } from './fbQuestion';

interface fbSubqForOptionProps {
  optionValue: string;
  selectedValue?: string;
  children: React.ReactNode;
}

export const fbSubqForOption: React.FC<fbSubqForOptionProps> = ({ optionValue, selectedValue = '', children }) => (
  <FbAnimatedSubquestion open={selectedValue === optionValue}>
    <div className="fb-subquestion" style={{ paddingLeft: '1.5rem' }}>
      <fbSubfieldContext.Provider value>
        {children}
      </fbSubfieldContext.Provider>
    </div>
  </FbAnimatedSubquestion>
);
