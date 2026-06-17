import React from 'react';
import { RequestPatientSelectPage } from './fbcntPageComponents';

type FbcntRequestPatientPageProps = React.ComponentProps<typeof RequestPatientSelectPage>;

export function FbcntRequestPatientPage(props: FbcntRequestPatientPageProps) {
  return <RequestPatientSelectPage {...props} />;
}
