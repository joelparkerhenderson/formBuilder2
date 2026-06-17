import React from 'react';
import { HomeView } from './fbcntPageComponents';

type FbcntHomePageProps = React.ComponentProps<typeof HomeView>;

export function FbcntHomePage(props: FbcntHomePageProps) {
  return <HomeView {...props} />;
}
