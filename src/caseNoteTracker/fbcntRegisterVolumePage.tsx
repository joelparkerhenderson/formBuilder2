import React from 'react';
import { AddVolumePage } from './fbcntPageComponents';

type FbcntRegisterVolumePageProps = React.ComponentProps<typeof AddVolumePage>;

export function FbcntRegisterVolumePage(props: FbcntRegisterVolumePageProps) {
  return <AddVolumePage {...props} />;
}
