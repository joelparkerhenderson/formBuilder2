import React from 'react';
import { HistoryView } from './fbcntPageComponents';

type FbcntHistoryPageProps = React.ComponentProps<typeof HistoryView>;

export function FbcntHistoryPage(props: FbcntHistoryPageProps) {
  return <HistoryView {...props} />;
}
