export type RouteName = 'home' | 'group';

export function routeName(pathname: string): RouteName {
  return /\/group\/?$/.test(pathname) ? 'group' : 'home';
}

export function routePath(pathname: string, route: RouteName): string {
  const base = pathname.replace(/\/group\/?$/, '') || '/';
  const root = base.endsWith('/') ? base : `${base}/`;
  return route === 'home' ? root : `${root}group`;
}
