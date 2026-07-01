import { useState, useRef, useCallback, useEffect } from "react";
import appConfig from "../../../config/config";

export const useBlogCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadingRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchCategories = useCallback(async () => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        filterActive: "true",
        currentPage: "1",
        pageSize: "20",
      });

      const url = `${appConfig.mobileApi}BlogPostCategory?${params.toString()}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      const data = result?.Data || [];

      if (isMountedRef.current) {
        setCategories(data);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err.message || "Unknown error");
        setCategories([]);
      }
    } finally {
      loadingRef.current = false;

      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const refresh = useCallback(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    refresh,
  };
};
