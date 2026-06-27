import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://my.farimod.ir/api/MobileApp/MobileAccount";

class AuthService {
  // Send OTP to mobile number
  async sendOTP(mobile) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/SendOTPSMS?mobile=${mobile}`,
        {
          method: "POST",
          headers: {
            accept: "*/*",
          },
        },
      );

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data,
          message: data.Message || data.message || "کد تایید ارسال شد",
        };
      } else {
        // پشتیبانی از هر دو فرمت message و Message
        return {
          success: false,
          message: data.message || data.Message || "خطا در ارسال کد تایید",
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "خطا در اتصال به سرور",
      };
    }
  }

  // Verify OTP and login
  async verifyOTP(mobile, otp) {
    try {
      const response = await fetch(`${API_BASE_URL}/Login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
        },
        body: JSON.stringify({
          Mobile: mobile,
          OTP: otp,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save user data to storage
        await this.saveUserData(data);

        return {
          success: true,
          data,
          message: "ورود موفقیت‌آمیز",
        };
      } else {
        // پشتیبانی از هر دو فرمت message و Message
        return {
          success: false,
          message: data.message || data.Message || "کد تایید اشتباه است",
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "خطا در اتصال به سرور",
      };
    }
  }

  // Save user data to AsyncStorage
  // Save user data to AsyncStorage
  async saveUserData(userData) {
    try {
      await AsyncStorage.setItem("userToken", userData.Token);

      // ✅ حذف اطلاعات اشتراک و عکس پروفایل قبل از ذخیره
      const {
        ActiveSubscriptionPlan,
        AvatarImageURL,
        ...userDataWithoutExtra
      } = userData;

      await AsyncStorage.setItem(
        "userData",
        JSON.stringify(userDataWithoutExtra),
      );
      await AsyncStorage.setItem("isLoggedIn", "true");
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  }

  // ✅ Update user data in storage - حذف subscription و عکس پروفایل قبل از ذخیره
  async updateUserData(userData) {
    try {
      const currentData = await this.getUserData();
      if (currentData) {
        // ✅ حذف اشتراک و عکس پروفایل از داده‌های ورودی
        const { ActiveSubscriptionPlan, AvatarImageURL, ...dataWithoutExtra } =
          userData;

        const updatedData = { ...currentData, ...dataWithoutExtra };
        await AsyncStorage.setItem("userData", JSON.stringify(updatedData));
      }
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  }
  // Get user data from AsyncStorage
  async getUserData() {
    try {
      const userData = await AsyncStorage.getItem("userData");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  }

  // Get user token from AsyncStorage
  async getUserToken() {
    try {
      return await AsyncStorage.getItem("userToken");
    } catch (error) {
      console.error("Error getting user token:", error);
      return null;
    }
  }

  // Check if user is logged in
  async isLoggedIn() {
    try {
      const isLoggedIn = await AsyncStorage.getItem("isLoggedIn");
      const token = await AsyncStorage.getItem("userToken");
      return isLoggedIn === "true" && token !== null;
    } catch (error) {
      console.error("Error checking login status:", error);
      return false;
    }
  }

  // Logout user
  async logout() {
    try {
      await AsyncStorage.multiRemove(["userToken", "userData", "isLoggedIn"]);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }

  // ✅ Update user data in storage - حذف subscription قبل از ذخیره
  async updateUserData(userData) {
    try {
      const currentData = await this.getUserData();
      if (currentData) {
        // ✅ حذف اشتراک از داده‌های ورودی
        const { ActiveSubscriptionPlan, ...dataWithoutSubscription } = userData;

        const updatedData = { ...currentData, ...dataWithoutSubscription };
        await AsyncStorage.setItem("userData", JSON.stringify(updatedData));
      }
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  }

  // Get authorization header for API calls
  async getAuthHeader() {
    const token = await this.getUserToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Validate mobile number format
  validateMobileNumber(mobile) {
    const mobileRegex = /^09\d{9}$/;
    return mobileRegex.test(mobile);
  }

  // Validate OTP format
  validateOTP(otp) {
    return otp.length === 5 && /^\d+$/.test(otp);
  }
}

export default new AuthService();
