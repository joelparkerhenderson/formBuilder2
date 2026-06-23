import React from 'react';
import { FbcntSmallButton } from './fbcntSmallButton';

export function FbcntButtonManageVolume({ onClick }: { onClick: () => void }) {
  return <FbcntSmallButton onClick={onClick}>Manage</FbcntSmallButton>;
}

