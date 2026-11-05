import type { Ledger } from './lib/ledger';
import { encodeGroupParam, ledgerFromSearch } from './lib/link';
import { routeName, routePath, type RouteName } from './lib/route';

let pending: Ledger | null | undefined;

export function resetSharedGroup(): void {
  pending = undefined;
}

export function sharedGroupFromLocation(): Ledger | null {
  if (routeName(window.location.pathname) !== 'group') return pending ?? null;
  if (pending !== undefined) return pending;
  const params = new URLSearchParams(window.location.search);
  pending = params.has('g') ? ledgerFromSearch(window.location.search) : null;
  if (params.has('g')) window.history.replaceState(null, '', window.location.pathname);
  return pending;
}

export function openRoute(route: RouteName): void {
  const next = routePath(window.location.pathname, route);
  if (window.location.pathname !== next) window.history.pushState(null, '', next);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function groupLink(ledger: Ledger): string {
  return `${window.location.origin}${routePath(window.location.pathname, 'group')}?g=${encodeGroupParam(ledger)}`;
}
