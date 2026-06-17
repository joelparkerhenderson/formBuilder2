import React from 'react';
import { TagsView } from './fbcntPageComponents';

type FbcntTagsPageProps = React.ComponentProps<typeof TagsView>;

export function FbcntTagsPage(props: FbcntTagsPageProps) {
  return <TagsView {...props} />;
}
