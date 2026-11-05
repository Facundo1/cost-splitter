import { describe, expect, it } from 'vitest';
import { routeName, routePath } from './route';

describe('routes', () => {
  it('treats the group path as the app, including the project prefix', () => {
    expect(routeName('/')).toBe('home');
    expect(routeName('/group')).toBe('group');
    expect(routeName('/group/')).toBe('group');
    expect(routeName('/cost-splitter/')).toBe('home');
    expect(routeName('/cost-splitter/group')).toBe('group');
    expect(routeName('/cost-splitter/group/')).toBe('group');
  });

  it('builds both paths from wherever the app is hosted', () => {
    expect(routePath('/', 'group')).toBe('/group');
    expect(routePath('/group', 'home')).toBe('/');
    expect(routePath('/cost-splitter/', 'group')).toBe('/cost-splitter/group');
    expect(routePath('/cost-splitter/group/', 'home')).toBe('/cost-splitter/');
  });
});
