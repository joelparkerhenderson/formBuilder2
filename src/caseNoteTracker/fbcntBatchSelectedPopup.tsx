import React from 'react';
import { BatchSelectedPopup } from './fbcntPageComponents';

type FbcntBatchSelectedPopupProps = React.ComponentProps<typeof BatchSelectedPopup>;

export function FbcntBatchSelectedPopup(props: FbcntBatchSelectedPopupProps) {
  return <BatchSelectedPopup {...props} />;
}
