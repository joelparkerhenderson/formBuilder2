import React from 'react';
import { SelectorView } from './fbcntPageComponents';

type FbcntSelectorPageProps = React.ComponentProps<typeof SelectorView>;

export function FbcntSelectorPage(props: FbcntSelectorPageProps) {
  return <SelectorView {...props} />;
}
