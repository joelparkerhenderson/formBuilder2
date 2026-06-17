import React from 'react';
import { FindBatchView } from './fbcntPageComponents';

type FbcntFindBatchPageProps = React.ComponentProps<typeof FindBatchView>;

export function FbcntFindBatchPage(props: FbcntFindBatchPageProps) {
  return <FindBatchView {...props} />;
}
