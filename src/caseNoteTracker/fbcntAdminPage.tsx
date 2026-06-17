import React from 'react';
import { AdminView } from './fbcntPageComponents';

type FbcntAdminPageProps = React.ComponentProps<typeof AdminView>;

export function FbcntAdminPage(props: FbcntAdminPageProps) {
  return <AdminView {...props} />;
}
