import React from 'react';
import { MovementModalContent } from './fbcntModalMovementContent';

type FbcntModalMovementProps = React.ComponentProps<typeof MovementModalContent>;

export function FbcntModalMovement(props: FbcntModalMovementProps) {
  return <MovementModalContent {...props} />;
}
