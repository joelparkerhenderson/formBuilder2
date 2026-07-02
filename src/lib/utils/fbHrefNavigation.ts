type HrefBackMap = Record<string, string>;

const storageKey = 'fbHrefBackNavigation';

function normaliseHref(href: string) {
  if (typeof window === 'undefined') return href;
  return new URL(href, window.location.href).href;
}

function readMap(): HrefBackMap {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(sessionStorage.getItem(storageKey) || '{}') as HrefBackMap;
  } catch {
    return {};
  }
}

function writeMap(map: HrefBackMap) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(storageKey, JSON.stringify(map));
}

export function rememberHrefReturn(targetHref: string, sourceHref = window.location.href) {
  const map = readMap();
  map[normaliseHref(targetHref)] = normaliseHref(sourceHref);
  writeMap(map);
}

export function openHrefWithReturn(targetHref: string, sourceHref = window.location.href) {
  rememberHrefReturn(targetHref, sourceHref);
  window.location.href = targetHref;
}

export function returnByHref(fallbackHref: string) {
  const map = readMap();
  const currentHref = normaliseHref(window.location.href);
  const targetHref = map[currentHref] || normaliseHref(fallbackHref);
  delete map[currentHref];
  writeMap(map);
  window.location.href = targetHref;
}

export function handleHrefNavigationClick(event: MouseEvent, targetHref: string) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  openHrefWithReturn(targetHref);
}
