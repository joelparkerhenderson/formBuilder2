import React from 'react';
import { CreateBatchPage } from './fbcntPageComponents';

type FbcntCreateBatchPageProps = React.ComponentProps<typeof CreateBatchPage>;

export function FbcntCreateBatchPage(props: FbcntCreateBatchPageProps) {
  return <CreateBatchPage {...props} />;
}
