import React from 'react';
import { RequestsView } from './fbcntPageComponents';

type FbcntRequestsPageProps = React.ComponentProps<typeof RequestsView>;

export function FbcntRequestsPage(props: FbcntRequestsPageProps) {
  return <RequestsView {...props} />;
}
