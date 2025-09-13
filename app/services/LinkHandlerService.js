// services/LinkHandlerService.js
import { Linking, Alert, Platform } from "react-native";

class LinkHandlerService {
  // Package name اپ خود را اینجا قرار دهید
  static APP_PACKAGE_NAME = "com.yourcompany.yourapp";

  static async openUpdateLink(updateInfo) {
    try {
      let updateUrl = null;

      // اولویت با CafeBazar است
      if (updateInfo.cafeBazarLink) {
        updateUrl = updateInfo.cafeBazarLink;
      } else if (updateInfo.downloadLink) {
        updateUrl = updateInfo.downloadLink;
      } else {
        // اگر لینک مستقیم موجود نیست، به فروشگاه هدایت کن
        return await this.openAppStore();
      }

      const canOpen = await Linking.canOpenURL(updateUrl);
      if (canOpen) {
        await Linking.openURL(updateUrl);
        return { success: true };
      } else {
        // اگر لینک باز نشد، به فروشگاه هدایت کن
        return await this.openAppStore();
      }
    } catch (error) {
      console.error("Error opening update link:", error);
      return {
        success: false,
        error: "خطا در باز کردن لینک بروزرسانی",
      };
    }
  }

  static async openAppStore() {
    try {
      if (Platform.OS === "android") {
        // ابتدا سعی کن CafeBazar را باز کنی
        const cafeBazarUrl = `bazaar://details?id=${this.APP_PACKAGE_NAME}`;
        const canOpenBazar = await Linking.canOpenURL(cafeBazarUrl);

        if (canOpenBazar) {
          await Linking.openURL(cafeBazarUrl);
          return { success: true };
        }

        // اگر CafeBazar موجود نبود، Google Play را امتحان کن
        const playStoreUrl = `market://details?id=${this.APP_PACKAGE_NAME}`;
        const canOpenPlayStore = await Linking.canOpenURL(playStoreUrl);

        if (canOpenPlayStore) {
          await Linking.openURL(playStoreUrl);
          return { success: true };
        }

        // اگر هیچ‌کدام کار نکرد، لینک وب Google Play را باز کن
        const playStoreWebUrl = `https://play.google.com/store/apps/details?id=${this.APP_PACKAGE_NAME}`;
        await Linking.openURL(playStoreWebUrl);
        return { success: true };
      } else if (Platform.OS === "ios") {
        // برای iOS - App Store
        const appStoreUrl = `itms-apps://itunes.apple.com/app/idYOUR_APP_ID`; // App ID خود را جایگزین کنید
        const canOpenAppStore = await Linking.canOpenURL(appStoreUrl);

        if (canOpenAppStore) {
          await Linking.openURL(appStoreUrl);
          return { success: true };
        }

        // لینک وب App Store
        const appStoreWebUrl = `https://apps.apple.com/app/idYOUR_APP_ID`;
        await Linking.openURL(appStoreWebUrl);
        return { success: true };
      }

      return {
        success: false,
        error: "پلتفرم پشتیبانی نمی‌شود",
      };
    } catch (error) {
      console.error("Error opening app store:", error);
      return {
        success: false,
        error: "خطا در باز کردن فروشگاه اپ",
      };
    }
  }

  static async openCustomUrl(url) {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return { success: true };
      } else {
        return {
          success: false,
          error: "امکان باز کردن لینک وجود ندارد",
        };
      }
    } catch (error) {
      console.error("Error opening custom URL:", error);
      return {
        success: false,
        error: "خطا در باز کردن لینک",
      };
    }
  }

  static showErrorAlert(message) {
    Alert.alert("خطا", message, [{ text: "باشه", style: "default" }]);
  }

  static showSuccessAlert(message) {
    Alert.alert("موفقیت", message, [{ text: "باشه", style: "default" }]);
  }
}

export default LinkHandlerService;
