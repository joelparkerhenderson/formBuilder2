export type CntNavigationEntry = {
  kind: 'url' | 'cnt-view' | 'inline-patient-search' | 'inline-patient-registry';
  label: string;
  url?: string;
  view?: string;
};

const stackKey = 'fbcntNavigationStack';

export function readCntNavigationStack(): CntNavigationEntry[] {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(stackKey) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCntNavigationStack(stack: CntNavigationEntry[]) {
  sessionStorage.setItem(stackKey, JSON.stringify(stack));
}

export function pushCntNavigation(entry: CntNavigationEntry) {
  const stack = readCntNavigationStack();
  stack.push(entry);
  writeCntNavigationStack(stack);
}

export function popCntNavigation() {
  const stack = readCntNavigationStack();
  const entry = stack.pop();
  writeCntNavigationStack(stack);
  return entry;
}

export function clearCntNavigationStack() {
  sessionStorage.removeItem(stackKey);
}

export function formBuilderHomeEntry(): CntNavigationEntry {
  const prefix = window.location.pathname.startsWith('/formBuilder2/') ? '/formBuilder2' : '';
  return { kind: 'url', label: 'formBuilder2 home', url: `${prefix}/index.html` };
}

export function cntHomeEntry(): CntNavigationEntry {
  const prefix = window.location.pathname.startsWith('/formBuilder2/') ? '/formBuilder2' : '';
  return { kind: 'url', label: 'Case note tracker home', url: `${prefix}/caseNoteTracker.html` };
}
