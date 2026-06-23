export type FbWorkspaceState = Record<string, unknown>;

const stateKey = 'fbNavigationWorkspace';

export function readWorkspaceState(historyState: unknown = window.history.state): FbWorkspaceState {
  const state = historyState as { [stateKey]?: FbWorkspaceState } | null;
  return state?.[stateKey] && typeof state[stateKey] === 'object' ? state[stateKey] : {};
}

export function replaceWorkspaceState(nextWorkspace: FbWorkspaceState) {
  const state = {
    ...(window.history.state || {}),
    [stateKey]: nextWorkspace,
  };
  window.history.replaceState(state, '', window.location.href);
}

export function pushWorkspaceState(nextWorkspace: FbWorkspaceState, href = window.location.href) {
  const state = {
    ...(window.history.state || {}),
    [stateKey]: nextWorkspace,
  };
  window.history.pushState(state, '', href);
}

