import React from 'react';
import { LocatorView } from './fbcntPageComponents';

type FbcntLocatorPageProps = React.ComponentProps<typeof LocatorView>;

export function FbcntLocatorPage(props: FbcntLocatorPageProps) {
  return <LocatorView {...props} />;
}
