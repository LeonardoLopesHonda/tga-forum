'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

export type AsyncState<T> =
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: T;    error: null }
  | { status: 'error';   data: null; error: string };

export function useAsyncData<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading', data: null, error: null });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(() => {
    let cancelled = false;
    setState({ status: 'loading', data: null, error: null });
    fetcherRef.current()
      .then(data  => { if (!cancelled) setState({ status: 'success', data, error: null }); })
      .catch(err  => { if (!cancelled) setState({ status: 'error', data: null, error: err instanceof Error ? err.message : 'Something went wrong.' }); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => run(), [...deps, run]); // eslint-disable-line react-hooks/exhaustive-deps

  return { ...state, reload: run };
}
