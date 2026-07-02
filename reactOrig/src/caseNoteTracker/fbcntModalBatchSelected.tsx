import React from 'react';
import { BatchSelectedModalContent } from './fbcntModalBatchSelectedContent';

type FbcntModalBatchSelectedProps = React.ComponentProps<typeof BatchSelectedModalContent>;

export function FbcntModalBatchSelected(props: FbcntModalBatchSelectedProps) {
  return <BatchSelectedModalContent {...props} />;
}
