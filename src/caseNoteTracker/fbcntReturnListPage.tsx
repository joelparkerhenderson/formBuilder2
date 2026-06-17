import React from 'react';
import { ReturnListView } from './fbcntPageComponents';

type FbcntReturnListPageProps = React.ComponentProps<typeof ReturnListView>;

export function FbcntReturnListPage(props: FbcntReturnListPageProps) {
  return <ReturnListView {...props} />;
}
