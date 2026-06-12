import React from 'react';
import { fbPopup as FbPopup } from './fbPopup';

export const fbSavingPopup: React.FC = () => {
  return <FbPopup title="Saving..." maxWidth="450px" titleMarginBottom="0" />;
};
