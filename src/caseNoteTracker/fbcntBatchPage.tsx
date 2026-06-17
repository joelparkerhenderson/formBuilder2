import React from 'react';
import { BatchDetailView } from './fbcntPageComponents';

type FbcntBatchPageProps = React.ComponentProps<typeof BatchDetailView>;

export function FbcntBatchPage(props: FbcntBatchPageProps) {
  return <BatchDetailView {...props} />;
}
