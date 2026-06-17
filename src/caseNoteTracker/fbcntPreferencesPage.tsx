import React from 'react';
import { PreferencesView } from './fbcntPageComponents';

type FbcntPreferencesPageProps = React.ComponentProps<typeof PreferencesView>;

export function FbcntPreferencesPage(props: FbcntPreferencesPageProps) {
  return <PreferencesView {...props} />;
}
