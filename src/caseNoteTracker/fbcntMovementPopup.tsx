import React from 'react';
import { MovementPopup } from './fbcntPageComponents';

type FbcntMovementPopupProps = React.ComponentProps<typeof MovementPopup>;

export function FbcntMovementPopup(props: FbcntMovementPopupProps) {
  return <MovementPopup {...props} />;
}
