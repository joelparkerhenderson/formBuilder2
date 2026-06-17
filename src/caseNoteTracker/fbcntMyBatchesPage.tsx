import React from 'react';
import { BatchView } from './fbcntPageComponents';

type FbcntMyBatchesPageProps = React.ComponentProps<typeof BatchView>;

export function FbcntMyBatchesPage(props: FbcntMyBatchesPageProps) {
  return <BatchView {...props} />;
}
