import { useState, useEffect, useCallback, useRef } from "react";

interface FetchDataOptions<T> {
  url: string;
  errorMessage: string;
  filterOrTransform?: (data: any[]) => T[];
}

export const useFetchData = <T>({ url, errorMessage, filterOrTransform }: FetchDataOptions<T>) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const transformRef = useRef(filterOrTransform);
  useEffect(() => {
    transformRef.current = filterOrTransform;
  }, [filterOrTransform]);

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url, { signal });
      if (signal?.aborted) return;

      const result = await response.json();

      if (response.ok && result?.Data) {
        const processedData = transformRef.current 
          ? transformRef.current(result.Data) 
          : result.Data;
          
        setData(processedData);
      } else {
        setError(errorMessage);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError('خطا در ارتباط با سرور');
        console.error(`Error fetching from ${url}:`, err);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [url, errorMessage]); 

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);

    return () => controller.abort();
  }, [fetchData]);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};