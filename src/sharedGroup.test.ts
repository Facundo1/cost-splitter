import { afterEach, describe, expect, it } from 'vitest';
import { sampleDinner } from './lib/sample';
import { encodeGroupParam } from './lib/link';
import { resetSharedGroup, sharedGroupFromLocation } from './sharedGroup';

afterEach(() => {
  resetSharedGroup();
  window.history.pushState(null, '', '/');
});

describe('shared group', () => {
  it('reads the link once and drops the query', () => {
    window.history.pushState(null, '', `/group?g=${encodeGroupParam(sampleDinner())}`);
    expect(sharedGroupFromLocation()?.groupName).toBe('Saturday dinner');
    expect(window.location.search).toBe('');
    expect(sharedGroupFromLocation()?.groupName).toBe('Saturday dinner');
  });

  it('drops a broken link and leaves the result empty', () => {
    window.history.pushState(null, '', '/group?g=nope');
    expect(sharedGroupFromLocation()).toBeNull();
    expect(window.location.search).toBe('');
    expect(sharedGroupFromLocation()).toBeNull();
  });
});
