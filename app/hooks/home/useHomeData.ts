import { useCallback, useMemo } from "react";
import appConfig from "../../config/config";
import { useFetchData } from "../useFetchData"; 
import { 
  HomePageSlide, 
  Portfolio, 
  ImageGallery, 
  BlogPost, 
  MemberGroup 
} from "../../types/home/home.types";

export const useHomePageSlides = () => {
  const options = useMemo(() => ({
    url: `${appConfig.mobileApi}HomePageSlide/GetAll`,
    errorMessage: 'خطا در دریافت اطلاعات اسلایدر صفحه اصلی',
    filterOrTransform: (items: HomePageSlide[]) => {
      return items
        .filter((slide) => slide.Active)
        .sort((a, b) => {
          if (a.ShowOrder && !b.ShowOrder) return -1;
          if (!a.ShowOrder && b.ShowOrder) return 1;
          return a.HomePageSlideId - b.HomePageSlideId;
        });
    },
  }), []);

  return useFetchData<HomePageSlide>(options);
};

export const usePortfolios = () => {
  const options = useMemo(() => ({
    url: `${appConfig.mobileApi}Portfolio/GetAllLast`,
    errorMessage: 'خطا در دریافت اطلاعات نمونه کارها',
    filterOrTransform: (items: Portfolio[]) => 
      items.filter(portfolio => portfolio.Active),
  }), []);

  return useFetchData<Portfolio>(options);
};

export const useImageGalleries = () => {
  const options = useMemo(() => ({
    url: `${appConfig.mobileApi}ImageGallery/GetAllLast`,
    errorMessage: 'خطا در دریافت اطلاعات گالری‌ها',
    filterOrTransform: (items: ImageGallery[]) => 
      items.filter(gallery => gallery.Active),
  }), []);

  return useFetchData<ImageGallery>(options);
};

export const useBlogPosts = () => {
  const options = useMemo(() => ({
    url: `${appConfig.mobileApi}BlogPost/GetAllLast`,
    errorMessage: 'خطا در دریافت اطلاعات مقالات',
    filterOrTransform: (items: BlogPost[]) => 
      items.filter(post => post.Active),
  }), []);

  return useFetchData<BlogPost>(options);
};

export const useMemberGroups = () => {
  const options = useMemo(() => ({
    url: `${appConfig.mobileApi}MemberGroup/GetAll?currentPage=1&pageSize=100`,
    errorMessage: 'خطا در دریافت اطلاعات گروه‌های اصلی',
    filterOrTransform: (items: MemberGroup[]) => 
      items.filter(group => group.Active && group.MemberCount > 0),
  }), []);

  return useFetchData<MemberGroup>(options);
};