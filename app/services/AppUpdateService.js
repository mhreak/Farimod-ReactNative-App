import apiService from "./ApiService";
import appInfo from "../config/appInfo"; 

const APP_VERSION = 1.1;

class AppUpdateService {
  static getCurrentAppVersion() {
    return APP_VERSION;
  }

  static async checkForUpdate(memberId) {
    try {
      const response = await apiService.get("AppRun/NotifyAppRun", {
        params: {
          memberId: memberId,
          mobileAppVersion: APP_VERSION,
        },
      });

      if (response.data) {
        return {
          success: true,
          data: {
            currentVersion: appInfo.versionNumber,
            latestVersion: response.data.MobileAppLastVersion,
            hasUpdate: response.data.MobileAppHasUpdate,
            isUpdateRequired: response.data.IsMobileAppUpdateRequired,
            downloadLink: response.data.MobileAppDownloadLink,
            cafeBazarLink: response.data.MobileAppCafeBazarPageLink,
          },
        };
      }

      return {
        success: false,
        error: "Invalid response format",
      };
    } catch (error) {
      console.error("Error checking for app update:", error);
      return {
        success: false,
        error: error.message || "خطا در بررسی بروزرسانی",
      };
    }
  }

  static shouldShowUpdateModal(updateInfo) {
    if (!updateInfo || !updateInfo.success) {
      return false;
    }

    const { hasUpdate, isUpdateRequired } = updateInfo.data;


    if (isUpdateRequired) {
      return true;
    }

 
    if (hasUpdate && !isUpdateRequired) {

      return true;
    }

    return false;
  }

  static getUpdateMessage(updateInfo) {
    if (!updateInfo || !updateInfo.success) {
      return null;
    }

    const { latestVersion, isUpdateRequired } = updateInfo.data;

    if (isUpdateRequired) {
      return {
        title: "بروزرسانی اجباری",
        message: `نسخه جدیدی از فریمد منتشر شده است. برای ادامه استفاده از برنامه، باید آن را بروزرسانی کنید.`,
        type: "required",
      };
    } else {
      return {
        title: "نیازمند بروزرسانی",
        message: `نسخه جدیدی از فریمد منتشر شده است. آیا می‌خواهید اکنون بروزرسانی کنید؟`,
        type: "optional",
      };
    }
  }
}

export default AppUpdateService;
