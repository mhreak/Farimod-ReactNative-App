import { enableScreens } from 'react-native-screens';
enableScreens(true);

import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import {
  I18nManager,
  View,
  ActivityIndicator,
  PixelRatio,
  StyleSheet,
} from "react-native";
import { useEffect, useCallback } from "react";

import * as SplashScreen from "expo-splash-screen";
import * as Updates from "expo-updates";
import { useFonts } from "expo-font";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { IntroProvider, useIntro } from "./app/contexts/IntroContext";
import { AuthProvider, useAuth } from "./app/contexts/AuthContext";
import {
  AppUpdateProvider,
  useAppUpdate,
} from "./app/contexts/AppUpdateContext";

import AppUpdateModal from "./app/components/AppUpdateModal";
import { StackNavigator } from "./app/Navigators";

SplashScreen.preventAutoHideAsync();

I18nManager.allowRTL(false);
I18nManager.forceRTL(false);

const fixRTL = async () => {
  try {
    if (I18nManager.isRTL) {
      I18nManager.allowRTL(false);
      I18nManager.forceRTL(false);
      await Updates.reloadAsync();
    }
  } catch (e) {
    console.warn("RTL fix error:", e);
  }
};

const fontScale = PixelRatio.getFontScale();
const scaleFix = fontScale > 1 ? 1 / fontScale : 1;

function AppContent() {
  const { isLoading: introLoading } = useIntro();
  const { isLoading: authLoading } = useAuth();

  const {
    updateInfo,
    showUpdateModal,
    handleLater,
    handleClose,
    handleDirectDownload,
    handleCafeBazarDownload,
  } = useAppUpdate();

  const [fontsLoaded, fontError] = useFonts({
    Yekan_Bakh_Regular: require("./assets/fonts/Yekan_Bakh_EN_Regular.ttf"),
    Yekan_Bakh_Bold: require("./assets/fonts/Yekan_Bakh_EN_Bold.ttf"),
    Yekan_Bakh_ExtraBold: require("./assets/fonts/YekanBakhFaNum-ExtraBold.ttf"),
    iran_sans_medium: require("./assets/fonts/IRANSansWeb_Medium.ttf"),
    iran_sans_bold: require("./assets/fonts/IRANSansWeb_Bold.ttf"),
    iran_sans_black: require("./assets/fonts/IRANSansWeb_Black.ttf"),
    ...Ionicons.font,
    ...MaterialIcons.font,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (fontError) {
    console.error("Font loading error:", fontError);
  }

  if (introLoading || authLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.root} onLayout={onLayoutRootView}>
      <NavigationContainer >
        <StackNavigator />
        <StatusBar style="light" />
      </NavigationContainer>

      <AppUpdateModal
        visible={showUpdateModal}
        updateInfo={updateInfo}
        onDirectDownload={handleDirectDownload}
        onCafeBazarDownload={handleCafeBazarDownload}
        onLater={handleLater}
        onClose={handleClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: "hidden",
  },
});

export default function App() {
  useEffect(() => {
    fixRTL().catch(console.warn);
  }, []);

  return (
    <AuthProvider>
      <IntroProvider>
        <AppUpdateProvider>
          <AppContent />
        </AppUpdateProvider>
      </IntroProvider>
    </AuthProvider>
  );
}