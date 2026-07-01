// contexts/AppUpdateContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { AppState, Linking, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppUpdateService from "../services/AppUpdateService";
import LinkHandlerService from "../services/LinkHandlerService";
import { useAuth } from "./AuthContext";

const AppUpdateContext = createContext();

export const useAppUpdate = () => {
  const context = useContext(AppUpdateContext);
  if (context === undefined) {
    throw new Error("useAppUpdate must be used within an AppUpdateProvider");
  }
  return context;
};

const LAST_UPDATE_CHECK_KEY = "lastUpdateCheck";
const DISMISSED_VERSION_KEY = "dismissedUpdateVersion";
const DISMISSED_VERSION_TIMESTAMP_KEY = "dismissedUpdateVersionTimestamp";
const CHECK_INTERVAL = 30 * 60 * 1000; 

export const AppUpdateProvider = ({ children }) => {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [isHomeScreen, setIsHomeScreen] = useState(false);

  const { user, isAuthenticated } = useAuth();

  // Consolidated effect for update checking and AppState listener
  useEffect(() => {
    if (!isAuthenticated || !user?.MemberId || !isHomeScreen) {
      return;
    }

    let intervalId: ReturnType<typeof setInterval> | null = null;
    let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;

    // Initial check for update on startup
    const performInitialCheck = async () => {
      try {
        const shouldCheck = await shouldCheckForUpdate();
        if (shouldCheck) {
          await checkForUpdate();
        }
      } catch (error) {
        console.error("Error in startup update check:", error);
      }
    };

    // Perform initial check
    performInitialCheck();

    // Set up periodic check interval (every 30 minutes)
    intervalId = setInterval(() => {
      console.log("Auto checking for update (30 min interval)...");
      checkForUpdate();
    }, CHECK_INTERVAL);

    // Handle app state changes (when app comes to foreground)
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "active") {
        console.log("App became active, checking for update...");
        checkForUpdateOnAppActivation();
      }
    };

    appStateSubscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // Cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (appStateSubscription) {
        appStateSubscription.remove();
      }
    };
  }, [isAuthenticated, user?.MemberId, isHomeScreen]);

  const checkForUpdateOnStartup = async () => {
    try {
      const shouldCheck = await shouldCheckForUpdate();
      if (shouldCheck) {
        await checkForUpdate();
      }
    } catch (error) {
      console.error("Error in startup update check:", error);
    }
  };

  const checkForUpdateOnAppActivation = async () => {
    try {
      const shouldCheck = await shouldCheckForUpdate();
      if (shouldCheck) {
        console.log("App activated - checking for update...");
        await checkForUpdate();
      }
    } catch (error) {
      console.error("Error in app activation update check:", error);
    }
  };

  const shouldCheckForUpdate = async () => {
    try {
      const lastCheckTime = await AsyncStorage.getItem(LAST_UPDATE_CHECK_KEY);

      if (!lastCheckTime) {
        return true; // اولین بار که اپ اجرا می‌شود
      }

      const timeSinceLastCheck = Date.now() - parseInt(lastCheckTime);
      const shouldCheck = timeSinceLastCheck > CHECK_INTERVAL;

      console.log(
        `Last check: ${new Date(parseInt(lastCheckTime)).toLocaleString()}`
      );
      console.log(
        `Time since last check: ${Math.round(
          timeSinceLastCheck / (1000 * 60)
        )} minutes`
      );
      console.log(`Should check: ${shouldCheck}`);

      return shouldCheck;
    } catch (error) {
      console.error("Error checking last update time:", error);
      return true; // در صورت خطا، چک کن
    }
  };

  const checkForUpdate = async () => {
    if (!user?.MemberId || isCheckingUpdate) {
      return;
    }

    try {
      setIsCheckingUpdate(true);
      console.log("Checking for app update...");

      const result = await AppUpdateService.checkForUpdate(user.MemberId);

      if (result.success) {
        const shouldShow = await shouldShowUpdateModal(result);

        if (shouldShow) {
          const message = AppUpdateService.getUpdateMessage(result);
          setUpdateInfo({
            ...result.data,
            ...message,
          });
          setShowUpdateModal(true);
          console.log("Update modal will be shown:", message.type);
        } else {
          console.log("Update available but modal should not be shown");
        }
      } else {
        console.log("No update available or check failed");
      }

      // ذخیره زمان آخرین چک
      await AsyncStorage.setItem(LAST_UPDATE_CHECK_KEY, Date.now().toString());
    } catch (error) {
      console.error("Error checking for update:", error);
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const shouldShowUpdateModal = async (updateResult) => {
    if (!updateResult.success || !updateResult.data.hasUpdate) {
      return false;
    }

    const { isUpdateRequired, latestVersion } = updateResult.data;

    // اگر بروزرسانی اجباری است، همیشه نشان بده
    if (isUpdateRequired) {
      console.log("Required update - showing modal");
      return true;
    }

    // اگر بروزرسانی اختیاری است، چک کن که آیا کاربر قبلاً آن را رد کرده
    try {
      const dismissedVersion = await AsyncStorage.getItem(
        DISMISSED_VERSION_KEY
      );
      const dismissedTimestamp = await AsyncStorage.getItem(
        DISMISSED_VERSION_TIMESTAMP_KEY
      );

      if (dismissedVersion && parseFloat(dismissedVersion) >= latestVersion) {
    
        if (dismissedTimestamp) {
          const timeSinceDismissed = Date.now() - parseInt(dismissedTimestamp);
          if (timeSinceDismissed < CHECK_INTERVAL) {
            console.log(
              "Optional update dismissed recently - not showing modal"
            );
            return false; 
          }
        }
      }
    } catch (error) {
      console.error("Error checking dismissed version:", error);
    }

    console.log("Optional update - showing modal");
    return true;
  };

  const handleDirectDownload = async () => {
    if (!updateInfo?.downloadLink) {
      Alert.alert("خطا", "لینک دانلود مستقیم موجود نیست", [
        { text: "باشه", style: "default" },
      ]);
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(updateInfo.downloadLink);
      if (canOpen) {
        await Linking.openURL(updateInfo.downloadLink);
        setShowUpdateModal(false);
      } else {
        Alert.alert("خطا", "امکان باز کردن لینک دانلود وجود ندارد", [
          { text: "باشه", style: "default" },
        ]);
      }
    } catch (error) {
      console.error("Error opening download link:", error);
      Alert.alert("خطا", "خطا در باز کردن لینک دانلود", [
        { text: "باشه", style: "default" },
      ]);
    }
  };

  const handleCafeBazarDownload = async () => {
    try {
      let bazarUrl = updateInfo?.cafeBazarLink;

      if (!bazarUrl) {
        // اگر لینک کافه بازار موجود نیست، از package name استفاده کن
        bazarUrl = "bazaar://details?id=com.yeganeh0.farimod2";
      }

      const canOpen = await Linking.canOpenURL(bazarUrl);
      if (canOpen) {
        await Linking.openURL(bazarUrl);
        setShowUpdateModal(false);
      } else {
        // اگر کافه بازار نصب نیست، لینک وب را باز کن
        const webUrl = "https://cafebazaar.ir/app/com.yeganeh0.farimod2";
        await Linking.openURL(webUrl);
        setShowUpdateModal(false);
      }
    } catch (error) {
      console.error("Error opening CafeBazar:", error);
      Alert.alert("خطا", "خطا در باز کردن کافه بازار", [
        { text: "باشه", style: "default" },
      ]);
    }
  };

  const handleLater = async () => {
    try {
      // ذخیره نسخه‌ای که کاربر رد کرده تا دوباره نشان داده نشود
      if (updateInfo?.latestVersion) {
        await AsyncStorage.setItem(
          DISMISSED_VERSION_KEY,
          updateInfo.latestVersion.toString()
        );
        // ذخیره زمان رد کردن
        await AsyncStorage.setItem(
          DISMISSED_VERSION_TIMESTAMP_KEY,
          Date.now().toString()
        );
        console.log(`Update dismissed for version ${updateInfo.latestVersion}`);
      }

      setShowUpdateModal(false);
      setUpdateInfo(null);
    } catch (error) {
      console.error("Error saving dismissed version:", error);
      setShowUpdateModal(false);
      setUpdateInfo(null);
    }
  };

  const handleClose = () => {
    // حالا همیشه می‌توان مدال را بست
    setShowUpdateModal(false);
    setUpdateInfo(null);
  };

  const setHomeScreenStatus = (status) => {
    setIsHomeScreen(status);
  };

  const manualCheckForUpdate = async () => {
    await checkForUpdate();
  };

  const value = {
    updateInfo,
    showUpdateModal,
    isCheckingUpdate,
    checkForUpdate: manualCheckForUpdate,
    handleDirectDownload,
    handleCafeBazarDownload,
    handleLater,
    handleClose,
    setHomeScreenStatus,
  };

  return (
    <AppUpdateContext.Provider value={value}>
      {children}
    </AppUpdateContext.Provider>
  );
};
