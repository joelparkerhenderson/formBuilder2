import React from 'react';
import { LocationsView } from './fbcntPageComponents';

type FbcntLibrariesPageProps = React.ComponentProps<typeof LocationsView>;

export function FbcntLibrariesPage(props: FbcntLibrariesPageProps) {
  return <LocationsView {...props} />;
}
