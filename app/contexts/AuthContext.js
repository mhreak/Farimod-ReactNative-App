import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthService from "../services/AuthService";
import SubscriptionService from "../services/SubscriptionService";

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
          // بروزرسانی اطلاعات subscription
          await updateSubscriptionInfo(userData);
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
      setIsLoading(false);
      console.log("Auth check completed");
    }
  };

  const updateSubscriptionInfo = async (userData = null) => {
    try {
      const currentUser = userData || user;
      if (!currentUser) return;

      console.log("Updating subscription info...");
      const subscriptionResult =
        await SubscriptionService.getActiveSubscriptionPlan();

      if (subscriptionResult.success) {
        const updatedUserData = {
          ...currentUser,
          ActiveSubscriptionPlan: subscriptionResult.data,
        };

        await AuthService.updateUserData(updatedUserData);
        setUser(updatedUserData);
        setIsAuthenticated(true);
        console.log("Subscription info updated successfully");
      } else {
        // اگر subscription دریافت نشد، همان user data قبلی را نگه دار
        setUser(currentUser);
        setIsAuthenticated(true);
        console.log("Could not fetch subscription, using existing user data");
      }
    } catch (error) {
      console.error("Error updating subscription info:", error);
      // در صورت خطا، همان user data قبلی را نگه دار
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
      }
    }
  };

  const login = async (userData) => {
    try {
      console.log("Logging in user:", userData);
      await AuthService.saveUserData(userData);

      // بروزرسانی subscription بعد از login
      await updateSubscriptionInfo(userData);

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
      await AuthService.updateUserData(updatedData);
      if (user) {
        const newUserData = { ...user, ...updatedData };
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
      await updateSubscriptionInfo();
      return { success: true };
    } catch (error) {
      console.error("Error refreshing subscription:", error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    checkAuthStatus,
    refreshSubscription,
    updateSubscriptionInfo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
