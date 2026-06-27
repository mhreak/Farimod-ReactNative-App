import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthService from "../services/AuthService";
import SubscriptionService from "../services/SubscriptionService";
import ProfileService from "../services/ProfileService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      console.log("Checking auth status...");

      const isLoggedIn = await AuthService.isLoggedIn();
      console.log("Is logged in:", isLoggedIn);

      if (isLoggedIn) {
        const userData = await AuthService.getUserData();
        console.log("User data:", userData);

        if (userData) {
          // ✅ Set user and auth state IMMEDIATELY to avoid blocking UI
          setUser(userData);
          setIsAuthenticated(true);

          // ✅ Update subscription and avatar info in background (non-blocking)
          // This won't block the app from loading
          Promise.all([
            updateSubscriptionInfo(userData).catch((error) => {
              console.error(
                "Error updating subscription (non-blocking):",
                error,
              );
            }),
            fetchUserAvatar(userData).catch((error) => {
              console.error("Error fetching avatar (non-blocking):", error);
            }),
          ]);
        } else {
          console.log("No user data found, clearing login state");
          await AuthService.logout();
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        console.log("User not logged in");
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      // ✅ ALWAYS set loading to false
      setIsLoading(false);
      console.log("Auth check completed");
    }
  };

  // ✅ دریافت عکس پروفایل از API
const fetchUserAvatar = async (userData = null) => {
  try {
    const currentUser = userData || user;
    if (!currentUser || !currentUser.MemberId) return { success: false };

    // فراخوانی مستقیم API برای گرفتن آخرین اطلاعات پروفایل
    const response = await fetch(
      `http://my.farimod.ir/api/MobileApp/MemberInfo/GetProfileInfoToEdit?memberId=${currentUser.MemberId}`,
    );
    const data = await response.json();

    if (data && data.AvatarImageURL) {
      console.log("Latest Avatar fetched:", data.AvatarImageURL);

      // آپدیت State سراسری با آدرس جدید عکس
      setUser((prev) => ({
        ...prev,
        AvatarImageURL: data.AvatarImageURL,
      }));

      return { success: true, avatarUrl: data.AvatarImageURL };
    }
    return { success: false };
  } catch (error) {
    console.error("Error fetching avatar:", error);
    return { success: false };
  }
};

  // ✅ اصلاح شده - ارسال memberId و عدم ذخیره در AsyncStorage
  const updateSubscriptionInfo = async (userData = null) => {
    try {
      const currentUser = userData || user;

      if (!currentUser || !currentUser.MemberId) {
        console.log("No user or memberId available");
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
        return;
      }

      console.log(
        "Updating subscription info for member:",
        currentUser.MemberId,
      );

      // ✅ Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Subscription API timeout")), 10000),
      );

      const subscriptionPromise = SubscriptionService.getActiveSubscriptionPlan(
        currentUser.MemberId,
      );

      // ✅ Race between API call and timeout
      const subscriptionResult = await Promise.race([
        subscriptionPromise,
        timeoutPromise,
      ]);

      if (subscriptionResult.success && subscriptionResult.data) {
        // ✅ فقط در state ذخیره می‌شود، نه در AsyncStorage
        const updatedUserData = {
          ...currentUser,
          ActiveSubscriptionPlan: subscriptionResult.data,
        };

        setUser(updatedUserData);
        setIsAuthenticated(true);
        console.log("Subscription info updated successfully:", {
          planName: subscriptionResult.data.SubscriptionPlanName,
          isInfinity: subscriptionResult.data.IsInfinityPlan,
        });
      } else {
        // اگر subscription دریافت نشد، ActiveSubscriptionPlan را null می‌کنیم
        const updatedUserData = {
          ...currentUser,
          ActiveSubscriptionPlan: null,
        };

        setUser(updatedUserData);
        setIsAuthenticated(true);
        console.log(
          "No active subscription found:",
          subscriptionResult.message,
        );
      }
    } catch (error) {
      console.error("Error updating subscription info:", error);

      // در صورت خطا، user را بدون subscription تنظیم می‌کنیم
      if (userData) {
        setUser({
          ...userData,
          ActiveSubscriptionPlan: null,
        });
        setIsAuthenticated(true);
      }
    }
  };

  const login = async (userData) => {
    try {
      console.log("Logging in user:", userData);

      // ✅ ذخیره بدون اشتراک در AsyncStorage
      await AuthService.saveUserData(userData);

      // ✅ Set user immediately
      setUser(userData);
      setIsAuthenticated(true);

      // ✅ برورسانی subscription و avatar بعد از login (در background)
      Promise.all([
        updateSubscriptionInfo(userData).catch((error) => {
          console.error("Error updating subscription during login:", error);
        }),
        fetchUserAvatar(userData).catch((error) => {
          console.error("Error fetching avatar during login:", error);
        }),
      ]);

      console.log("Login successful");
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log("Logging out user...");
      await AuthService.logout();
      setUser(null);
      setIsAuthenticated(false);
      console.log("Logout successful");
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    }
  };

  const updateUser = async (updatedData) => {
    try {
      console.log("Updating user data:", updatedData);

      // ✅ حذف subscription و AvatarImageURL قبل از ذخیره در AsyncStorage
      const { ActiveSubscriptionPlan, AvatarImageURL, ...dataWithoutExtra } =
        updatedData;

      await AuthService.updateUserData(dataWithoutExtra);

      if (user) {
        // ✅ حفظ subscription و AvatarImageURL فعلی در state
        const newUserData = {
          ...user,
          ...dataWithoutExtra,
          ActiveSubscriptionPlan: user.ActiveSubscriptionPlan,
          AvatarImageURL: user.AvatarImageURL, // نگه داشتن عکس فعلی
        };
        setUser(newUserData);
        console.log("User data updated successfully");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  const refreshSubscription = async () => {
    try {
      console.log("Refreshing subscription info...");

      if (!user || !user.MemberId) {
        console.log("No user or memberId for refresh");
        return { success: false, message: "کاربر وارد نشده است" };
      }

      await updateSubscriptionInfo(user);
      return { success: true, message: "اطلاعات اشتراک برورسانی شد" };
    } catch (error) {
      console.error("Error refreshing subscription:", error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    setUser,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    checkAuthStatus,
    refreshSubscription,
    updateSubscriptionInfo,
    fetchUserAvatar,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
