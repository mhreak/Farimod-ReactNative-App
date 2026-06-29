import { useEffect, useState, useMemo } from "react";
import appConfig from "../../../config/config";

export const useCategoryOptions = () => {
  const [categoryOptions, setCategoryOptions] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${appConfig.mobileApi}ProductCategory/GetAll?filterActive=true&currentPage=1&pageSize=100`,
          { signal: controller.signal } 
        );
        
        const result = await response.json();
        const options = (result.Data || []).map((cat: any) => ({
          label: cat.Name,
          value: cat.ProductCategoryId,
        }));
        
        setCategoryOptions(options);
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          console.log('خطا در دریافت دسته‌بندی‌ها:', e);
        }
      }
    };

    fetchCategories();

   
    return () => {
      controller.abort();
    };
  }, []); 

  return useMemo(() => categoryOptions, [categoryOptions]);
};