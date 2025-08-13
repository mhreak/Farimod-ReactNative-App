class PermissionService {
  // دریافت وضعیت دسترسی‌ها از userData
  static getPermissions(userData) {
    if (!userData || !userData.ActiveSubscriptionPlan) {
      return {
        allowAboutMeText: false,
        allowAddImageGallery: false,
        allowAddPortfolio: false,
        allowAddProduct: false,
        allowAddCourse: false,
        allowAddBlogPost: false,
        allowAddDocument: false,
        showContactInfo: false,
        showBlueTick: false,
      };
    }

    const plan = userData.ActiveSubscriptionPlan;

    return {
      allowAboutMeText: plan.PlanOption_AllowAboutMeText || false,
      allowAddImageGallery: plan.PlanOption_AllowAddImageGallery || false,
      allowAddPortfolio: plan.PlanOption_AllowAddPortfolio || false,
      allowAddProduct: plan.PlanOption_AllowAddProduct || false,
      allowAddCourse: plan.PlanOption_AllowAddCourse || false,
      allowAddBlogPost: plan.PlanOption_AllowAddBlogPost || false,
      allowAddDocument: plan.PlanOption_AllowAddDocument || false,
      showContactInfo: plan.PlanOption_ShowContanctInfo || false,
      showBlueTick: plan.PlanOption_ShowBlueTick || false,
    };
  }

  // بررسی دسترسی به یک قابلیت خاص
  static hasPermission(userData, permission) {
    if (!permission) return true; // اگر permission null باشد، دسترسی آزاد

    const permissions = this.getPermissions(userData);
    return permissions[permission] || false;
  }

  // دریافت اطلاعات subscription
  static getSubscriptionInfo(userData) {
    if (!userData || !userData.ActiveSubscriptionPlan) {
      return null;
    }

    const plan = userData.ActiveSubscriptionPlan;

    return {
      planId: plan.SubscriptionPlanId,
      planName: plan.SubscriptionPlanName,
      startDate: plan.ShamsiStartDate,
      finishDate: plan.ShamsiFinishDate,
      remainingDays: plan.RemainingDaysToFinishDate,
      isInfinity: plan.IsInfinityPlan,
      totalDays: plan.SubscriptionTotalDays,
      subscriptionPrice: plan.SubscriptionPrice,
      finalAmount: plan.FinalAmount,
    };
  }

  // بررسی اینکه آیا subscription هنوز فعال است
  static isSubscriptionActive(userData) {
    if (!userData || !userData.ActiveSubscriptionPlan) {
      return false;
    }

    const plan = userData.ActiveSubscriptionPlan;

    if (plan.IsInfinityPlan) {
      return true;
    }

    return plan.RemainingDaysToFinishDate > 0;
  }

  // دریافت پیام مناسب برای دسترسی محدود
  static getPermissionMessage(permission) {
    const messages = {
      allowAboutMeText: 'برای ویرایش متن درباره من، نیاز به ارتقای اشتراک دارید',
      allowAddImageGallery: 'برای افزودن تصاویر به گالری، نیاز به ارتقای اشتراک دارید',
      allowAddPortfolio: 'برای افزودن نمونه کار، نیاز به ارتقای اشتراک دارید',
      allowAddProduct: 'برای افزودن محصول، نیاز به ارتقای اشتراک دارید',
      allowAddCourse: 'برای افزودن دوره، نیاز به ارتقای اشتراک دارید',
      allowAddBlogPost: 'برای انتشار پست، نیاز به ارتقای اشتراک دارید',
      allowAddDocument: 'برای افزودن مدرک، نیاز به ارتقای اشتراک دارید',
    };

    return messages[permission] || 'دسترسی محدود - برای استفاده از این بخش، نیاز به ارتقای اشتراک دارید';
  }

  // استایل‌های مختلف برای حالت غیرفعال
  static getDisabledStyle() {
    return {
      opacity: 0.5,
      backgroundColor: '#f5f5f5',
      borderColor: '#ddd',
    };
  }

  static getDisabledTextStyle() {
    return {
      color: '#999',
    };
  }

  // آیکون‌های وضعیت دسترسی
  static getPermissionIcon(hasPermission) {
    return hasPermission ? 'check-circle' : 'lock';
  }

  static getPermissionIconColor(hasPermission) {
    return hasPermission ? '#4CAF50' : '#999';
  }

  // دریافت لیست تمام permissions برای debug
  static getAllPermissions(userData) {
    return this.getPermissions(userData);
  }

  // بررسی سطح دسترسی اشتراک
  static getSubscriptionLevel(userData) {
    if (!userData || !userData.ActiveSubscriptionPlan) {
      return 'none';
    }

    const permissions = this.getPermissions(userData);
    const permissionCount = Object.values(permissions).filter(Boolean).length;

    if (permissionCount === 0) return 'none';
    if (permissionCount <= 3) return 'basic';
    if (permissionCount <= 6) return 'premium';
    return 'unlimited';
  }
}

export default PermissionService;