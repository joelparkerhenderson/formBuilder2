import React from 'react';
import { PicklistView } from './fbcntPageComponents';

type FbcntPicklistPageProps = React.ComponentProps<typeof PicklistView>;

export function FbcntPicklistPage(props: FbcntPicklistPageProps) {
  return <PicklistView {...props} />;
}
