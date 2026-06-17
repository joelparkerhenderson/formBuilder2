import React from 'react';
import { MyClinicsView } from './fbcntPageComponents';

type FbcntMyClinicsPageProps = React.ComponentProps<typeof MyClinicsView>;

export function FbcntMyClinicsPage(props: FbcntMyClinicsPageProps) {
  return <MyClinicsView {...props} />;
}
