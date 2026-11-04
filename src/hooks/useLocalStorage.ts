import { useEffect, useState } from 'react';

/**
 * useState that persists to localStorage.
 * Falls back to the initial value if storage is unavailable or the data is corrupt.
 * Note: no schema validation/migration — the key is versioned instead (see App.tsx).
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or blocked (private mode): the app keeps working in memory.
    }
  }, [key, value]);

  return [value, setValue] as const;
}
