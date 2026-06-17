import React from 'react';
import { RequestPage } from './fbcntPageComponents';

type FbcntRequestPageProps = React.ComponentProps<typeof RequestPage>;

export function FbcntRequestPage(props: FbcntRequestPageProps) {
  return <RequestPage {...props} />;
}
