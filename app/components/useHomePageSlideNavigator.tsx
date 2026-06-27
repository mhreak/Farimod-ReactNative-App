import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

/**
 * @param {Object} slideData - اطلاعات اسلاید شامل ClickTrigger و ShowOrder
 * @param {Function} showToast - تابع نمایش Toast message
 */
export const useHomePageSlideNavigator = () => {
  const navigation = useNavigation();

  /**
   * مدیریت کلیک روی اسلاید بر اساس ClickTrigger
   * @param {Object} slideData - داده اسلاید
   * @param {Function} showToast - تابع نمایش پیام
   */
  const handleSlideClick = async (slideData, showToast) => {
    try {
      if (!slideData.ClickTrigger) {
        console.log('No ClickTrigger defined for this slide');
        return;
      }

      const clickTrigger = slideData.ClickTrigger;
      const entityId = slideData.EntityId || slideData.ShowOrder;

      console.log('Slide clicked:', {
        slideId: slideData.HomePageSlideId,
        clickTrigger: clickTrigger,
        entityId: entityId,
        showOrder: slideData.ShowOrder
      });

      switch (clickTrigger) {
        case 1:
          // بازکردن UserProfileScreen
          await navigateToUserProfile(entityId, showToast);
          break;

        case 2:
          // بازکردن CourseDetailsScreen
          await navigateToCourseDetails(entityId, showToast);
          break;

        case 3:
          // بازکردن ProductDetailsScreen
          await navigateToProductDetails(entityId, showToast);
          break;

        case 4:
          // بازکردن GalleryItemScreen
          await navigateToGalleryItem(entityId, showToast);
          break;

        case 5:
          // بازکردن PortfolioDetailScreen
          await navigateToPortfolioDetail(entityId, showToast);
          break;

        default:
          console.warn('Unknown ClickTrigger:', clickTrigger);
          if (showToast) {
            showToast('نوع لینک نامشخص است', 'warning');
          }
          break;
      }
    } catch (error) {
      console.error('Error handling slide click:', error);
      if (showToast) {
        showToast('خطا در باز کردن صفحه', 'error');
      }
    }
  };

  /**
   * نوتیگیت به صفحه پروفایل کاربر
   */
  const navigateToUserProfile = async (memberId, showToast) => {
    try {
      console.log('Navigating to UserProfile with memberId:', memberId);

      if (!memberId) {
        throw new Error('شناسه کاربر مشخص نیست');
      }

      // برای نمایش loading در صورت نیاز
      if (showToast) {
        showToast('در حال بارگذاری پروفایل...', 'info');
      }

      // فرض می‌کنیم که داده کاربر را از API دریافت کنیم
      const userData = {
        MemberId: memberId,
        Name: `کاربر ${memberId}`,
        // سایر فیلدهای مورد نیاز
      };

      navigation.navigate("UserProfile", {
        userData: userData
      });

    } catch (error) {
      console.error('Error navigating to UserProfile:', error);
      if (showToast) {
        showToast(error.message || 'خطا در باز کردن پروفایل کاربر', 'error');
      }
    }
  };

  /**
   * نوتیگیت به صفحه جزئیات دوره
   */
  const navigateToCourseDetails = async (courseId, showToast) => {
    try {
      console.log('Navigating to CourseDetails with courseId:', courseId);

      if (!courseId) {
        throw new Error('شناسه دوره مشخص نیست');
      }

      if (showToast) {
        showToast('در حال بارگذاری دوره...', 'info');
      }

      const courseData = {
        CourseId: courseId,
        CourseName: `دوره ${courseId}`,
        // سایر فیلدهای مورد نیاز
      };

      navigation.navigate("CourseDetails", {
        courseData: courseData,
        courseId: courseId
      });

    } catch (error) {
      console.error('Error navigating to CourseDetails:', error);
      if (showToast) {
        showToast(error.message || 'خطا در باز کردن جزئیات دوره', 'error');
      }
    }
  };

  /**
   * نوتیگیت به صفحه جزئیات محصول
   */
  const navigateToProductDetails = async (productId, showToast) => {
    try {
      console.log('Navigating to ProductDetails with productId:', productId);

      if (!productId) {
        throw new Error('شناسه محصول مشخص نیست');
      }

      if (showToast) {
        showToast('در حال بارگذاری محصول...', 'info');
      }

      const productData = {
        ProductId: productId,
        ProductName: `محصول ${productId}`,
        // سایر فیلدهای مورد نیاز
      };

      navigation.navigate("ProductDetails", {
        productData: productData,
        productId: productId
      });

    } catch (error) {
      console.error('Error navigating to ProductDetails:', error);
      if (showToast) {
        showToast(error.message || 'خطا در باز کردن جزئیات محصول', 'error');
      }
    }
  };

  /**
   * نوتیگیت به صفحه گالری
   */
  const navigateToGalleryItem = async (galleryId, showToast) => {
    try {
      console.log('Navigating to GalleryItem with galleryId:', galleryId);

      if (!galleryId) {
        throw new Error('شناسه گالری مشخص نیست');
      }

      if (showToast) {
        showToast('در حال بارگذاری گالری...', 'info');
      }

      navigation.navigate("GalleryItem", {
        galleryId: galleryId,
        title: `گالری ${galleryId}`
      });

    } catch (error) {
      console.error('Error navigating to GalleryItem:', error);
      if (showToast) {
        showToast(error.message || 'خطا در باز کردن گالری', 'error');
      }
    }
  };

  /**
   * نوتیگیت به صفحه جزئیات نمونه کار
   */
  const navigateToPortfolioDetail = async (portfolioId, showToast) => {
    try {
      console.log('Navigating to PortfolioDetail with portfolioId:', portfolioId);

      if (!portfolioId) {
        throw new Error('شناسه نمونه کار مشخص نیست');
      }

      if (showToast) {
        showToast('در حال بارگذاری نمونه کار...', 'info');
      }

      navigation.navigate("PortfolioDetail", {
        portfolioId: portfolioId,
        title: `نمونه کار ${portfolioId}`
      });

    } catch (error) {
      console.error('Error navigating to PortfolioDetail:', error);
      if (showToast) {
        showToast(error.message || 'خطا در باز کردن نمونه کار', 'error');
      }
    }
  };

  /**
   * تشخیص نوع صفحه بر اساس ClickTrigger
   */
  const getSlideTypeLabel = (clickTrigger) => {
    const typeLabels = {
      1: 'پروفایل کاربر',
      2: 'دوره آموزشی',
      3: 'محصول',
      4: 'گالری تصاویر',
      5: 'نمونه کار'
    };
    return typeLabels[clickTrigger] || 'نامشخص';
  };

  /**
   * بررسی قابلیت کلیک اسلاید
   */
  const isSlideClickable = (slideData) => {
    return slideData && slideData.ClickTrigger && slideData.ClickTrigger >= 1 && slideData.ClickTrigger <= 5;
  };

  return {
    handleSlideClick,
    getSlideTypeLabel,
    isSlideClickable,
    navigateToUserProfile,
    navigateToCourseDetails,
    navigateToProductDetails,
    navigateToGalleryItem,
    navigateToPortfolioDetail
  };
};

/**
 * کامپوننت wrapper برای اسلاید قابل کلیک
 */
export const ClickableSlide = ({
  children,
  slideData,
  showToast,
  activeOpacity = 0.8,
  disabled = false,
  onSlidePress
}) => {
  const { handleSlideClick, isSlideClickable } = useHomePageSlideNavigator();

  const handlePress = async () => {
    if (disabled) return;

    if (onSlidePress) {
      onSlidePress(slideData);
    }

    await handleSlideClick(slideData, showToast);
  };

  if (!isSlideClickable(slideData)) {
    return children;
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={activeOpacity}
      disabled={disabled}
    >
      {children}
    </TouchableOpacity>
  );
};

export default useHomePageSlideNavigator;