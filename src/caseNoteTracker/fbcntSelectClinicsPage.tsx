import React from 'react';
import { SelectClinicsView } from './fbcntPageComponents';

type FbcntSelectClinicsPageProps = React.ComponentProps<typeof SelectClinicsView>;

export function FbcntSelectClinicsPage(props: FbcntSelectClinicsPageProps) {
  return <SelectClinicsView {...props} />;
}
