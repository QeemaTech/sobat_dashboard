import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useUrlFilters<T extends Record<string, string>>(defaults: T) {
  const [params, setParams] = useSearchParams();

  const filters = useMemo(() => {
    const out = { ...defaults };
    (Object.keys(defaults) as (keyof T)[]).forEach((key) => {
      const v = params.get(String(key));
      if (v !== null) out[key] = v as T[keyof T];
    });
    return out;
  }, [params, defaults]);

  const setFilter = useCallback(
    (key: keyof T, value: string) => {
      setParams((prev) => {
        const next = new URLSearchParams(prev);
        if (!value) next.delete(String(key));
        else next.set(String(key), value);
        if (key !== 'page') next.delete('page');
        return next;
      });
    },
    [setParams]
  );

  const setFilters = useCallback(
    (patch: Partial<T>) => {
      setParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(patch).forEach(([k, v]) => {
          if (!v) next.delete(k);
          else next.set(k, String(v));
        });
        next.delete('page');
        return next;
      });
    },
    [setParams]
  );

  const resetFilters = useCallback(() => {
    setParams(new URLSearchParams());
  }, [setParams]);

  const page = Math.max(1, parseInt(params.get('page') || '1', 10) || 1);

  const setPage = useCallback(
    (p: number) => {
      setParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('page', String(p));
        return next;
      });
    },
    [setParams]
  );

  return { filters, setFilter, setFilters, resetFilters, page, setPage, params };
}
