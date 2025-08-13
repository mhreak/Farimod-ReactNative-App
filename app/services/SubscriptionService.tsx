import AuthService from "./AuthService";

const API_BASE_URL = "http://89.42.208.49/api/MobileApp/SubscriptionPlan";

class SubscriptionService {
  // دریافت اطلاعات اشتراک فعال کاربر
  async getActiveSubscriptionPlan() {
    try {
      const token = await AuthService.getUserToken();

      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(
        `${API_BASE_URL}/GetActiveSubscriptionPlanOfMember`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            accept: "*/*",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data,
          message: "اطلاعات اشتراک دریافت شد",
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.Message || "خطا در دریافت اطلاعات اشتراک",
        };
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return {
        success: false,
        message: "خطا در اتصال به سرور",
      };
    }
  }

  // ذخیره اطلاعات اشتراک در AuthService
  async updateUserSubscription() {
    try {
      const result = await this.getActiveSubscriptionPlan();

      if (result.success) {
        const userData = await AuthService.getUserData();
        if (userData) {
          await AuthService.updateUserData({
            ...userData,
            ActiveSubscriptionPlan: result.data
          });
        }
        return result;
      }

      return result;
    } catch (error) {
      console.error('Error updating subscription:', error);
      return {
        success: false,
        message: "خطا در بروزرسانی اطلاعات اشتراک",
      };
    }
  }
}

export default new SubscriptionService();