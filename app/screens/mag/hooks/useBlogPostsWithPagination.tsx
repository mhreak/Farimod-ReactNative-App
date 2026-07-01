import { useState, useRef, useCallback } from "react";
import appConfig from "../../../config/config";

const ITEMS_PER_PAGE = 10;

export const useBlogPostsWithPagination = () => {
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<any>({});

  const requestIdRef = useRef(0); 
  const loadingRef = useRef(false);

  const fetchBlogPosts = useCallback(
    async (newPage = 1, pageSize = ITEMS_PER_PAGE, filterParams = {}) => {
      if (loadingRef.current) return;

      const requestId = ++requestIdRef.current;
      loadingRef.current = true;

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          filterActive: "true",
          currentPage: newPage.toString(),
          pageSize: pageSize.toString(),
        });

        if (filterParams.filterTitle) {
          params.append("filterTitle", filterParams.filterTitle);
        }

        if (filterParams.filterCategoryId) {
          params.append("filterCategoryId", filterParams.filterCategoryId);
        }

        if (filterParams.filterMemberId) {
          params.append("filterMemberId", filterParams.filterMemberId);
        }

        const url = `${appConfig.mobileApi}BlogPost/GetAll?${params.toString()}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();

        // اگر request قدیمی برگشت ignore شود
        if (requestId !== requestIdRef.current) return;

        const newItems = result?.Data || [];

        setData(prev =>
          newPage === 1 ? newItems : [...prev, ...newItems]
        );

        setTotal(result?.Total || 0);
        setPage(newPage);
        setFilters(filterParams);

        setHasMore(newItems.length === pageSize);
      } catch (err: any) {
        if (requestId !== requestIdRef.current) return;

        setError(err.message || "Unknown error");

        if (newPage === 1) {
          setData([]);
          setTotal(0);
        }
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    []
  );

  const loadMore = useCallback(() => {
    if (!loadingRef.current && hasMore) {
      fetchBlogPosts(page + 1, ITEMS_PER_PAGE, filters);
    }
  }, [page, hasMore, filters, fetchBlogPosts]);

  const refresh = useCallback(() => {
    fetchBlogPosts(1, ITEMS_PER_PAGE, filters);
  }, [filters, fetchBlogPosts]);

  return {
    data,
    total,
    loading,
    error,
    fetchBlogPosts,
    loadMore,
    refresh,
    hasMore,
    page,
    filters,
  };
};
