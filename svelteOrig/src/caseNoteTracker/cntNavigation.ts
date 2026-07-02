import { pushWorkspaceState, readWorkspaceState, replaceWorkspaceState } from '../utils/fbNavigationWorkspace';

export type CntNavigationEntry = {
  kind: 'url' | 'cnt-view' | 'inline-patient-search' | 'inline-patient-registry';
  label: string;
  url?: string;
  view?: string;
};

let currentStack: CntNavigationEntry[] = readStackFromHistory();

function readStackFromHistoryState(state: unknown): CntNavigationEntry[] {
  const stack = readWorkspaceState(state).cntBackStack;
  return Array.isArray(stack) ? stack as CntNavigationEntry[] : [];
}

function readStackFromHistory(): CntNavigationEntry[] {
  if (typeof window === 'undefined') return [];
  return readStackFromHistoryState(window.history.state);
}

function writeHistoryState(stack: CntNavigationEntry[], mode: 'push' | 'replace') {
  if (typeof window === 'undefined') return;
  const workspace = { ...readWorkspaceState(), cntBackStack: stack };
  if (mode === 'push') pushWorkspaceState(workspace);
  else replaceWorkspaceState(workspace);
}

export function readCntNavigationStack(): CntNavigationEntry[] {
  return [...currentStack];
}

export function writeCntNavigationStack(stack: CntNavigationEntry[]) {
  currentStack = [...stack];
  writeHistoryState(currentStack, 'replace');
}

export function pushCntNavigation(entry: CntNavigationEntry) {
  currentStack = [...currentStack, entry];
  writeHistoryState(currentStack, 'push');
}

export function popCntNavigation() {
  const entry = currentStack.at(-1);
  currentStack = currentStack.slice(0, -1);
  writeHistoryState(currentStack, 'replace');
  return entry;
}

export function clearCntNavigationStack() {
  currentStack = [];
  writeHistoryState(currentStack, 'replace');
}

export function consumeCntNavigationPopState(state: unknown) {
  const nextStack = readStackFromHistoryState(state);
  const popped = currentStack.length > nextStack.length ? currentStack.at(-1) : undefined;
  currentStack = [...nextStack];
  return popped;
}

export function formBuilderHomeEntry(): CntNavigationEntry {
  const prefix = window.location.pathname.startsWith('/formBuilder2/') ? '/formBuilder2' : '';
  return { kind: 'url', label: 'formBuilder2 home', url: `${prefix}/index.html` };
}

export function cntHomeEntry(): CntNavigationEntry {
  const prefix = window.location.pathname.startsWith('/formBuilder2/') ? '/formBuilder2' : '';
  return { kind: 'url', label: 'Case note tracker home', url: `${prefix}/caseNoteTracker.html` };
}
