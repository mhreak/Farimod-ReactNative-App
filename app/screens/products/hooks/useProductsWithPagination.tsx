import { useState, useCallback } from "react";
import appConfig from "../../../config/config";

const ITEMS_PER_PAGE = 20;

const EMPTY_FILTERS = {};

export const useProductsWithPagination = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async (
    page = 1, 
    pageSize = ITEMS_PER_PAGE, 
    filters = EMPTY_FILTERS as any
  ) => {
    try {
      setLoading(true);
      setError(null);

      let queryParams = `filterActive=true&currentPage=${page}&pageSize=${pageSize}`;

      if (filters.filterProductName) {
        queryParams += `&filterProductName=${encodeURIComponent(filters.filterProductName)}`;
      }
      if (filters.filterProductCategoryId) {
        queryParams += `&filterProductCategoryId=${filters.filterProductCategoryId}`;
      }
      if (filters.filterMemberId) {
        queryParams += `&filterMemberId=${filters.filterMemberId}`;
      }

      const response = await fetch(
        `${appConfig.mobileApi}Product/GetAll?${queryParams}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result.Data || []);
      setTotal(result.Total || 0);
    } catch (err: any) {
      setError(err.message || 'خطایی رخ داده است');
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []); 

  return { data, total, loading, error, fetchProducts };
};