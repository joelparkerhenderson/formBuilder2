import React from 'react';
import { styles } from './fbcntPageComponents';
import { HighlightBlock } from './fbcntHighlightBlock';
import { fbAnimatedCollapsible as FbAnimatedCollapsible } from '../components/fbAnimatedSubquestion';

export function TreeNode({
  label,
  level,
  nodeKey,
  collapsed,
  toggleCollapsed,
  preventCollapse = false,
  children,
}: {
  key?: React.Key;
  label: string;
  level: number;
  nodeKey: string;
  collapsed: Record<string, boolean>;
  toggleCollapsed: (key: string) => void;
  preventCollapse?: boolean;
  children: React.ReactNode;
}) {
  const isCollapsed = !!collapsed[nodeKey];
  return (
    <>
    <HighlightBlock level={level}>
      <button
        type="button"
        style={{ ...styles.treeToggle, paddingLeft: `${level * 1.6}rem`, backgroundColor: 'transparent' }}
        onClick={() => {
          if (!isCollapsed && preventCollapse) return;
          toggleCollapsed(nodeKey);
        }}
        aria-disabled={!isCollapsed && preventCollapse}
      >
        <span aria-hidden="true">{isCollapsed ? '\u25b6' : '\u25bc'}</span>
        <strong>{label}</strong>
      </button>
    </HighlightBlock>
    <FbAnimatedCollapsible open={!isCollapsed}>
      {children}
    </FbAnimatedCollapsible>
    </>
  );
}
