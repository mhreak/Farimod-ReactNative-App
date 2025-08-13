import { StatusBar } from "expo-status-bar";
import * as Font from "expo-font";
import { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { I18nManager, View, ActivityIndicator } from "react-native";
import { IntroProvider, useIntro } from "./app/contexts/IntroContext";
import { AuthProvider, useAuth } from "./app/contexts/AuthContext";

import { StackNavigator } from "./app/Navigators";

const forceLayoutDirection = () => {
  try {
    if (I18nManager.isRTL) {
      I18nManager.forceRTL(false);
      I18nManager.allowRTL(false);
    }
  } catch (error) {
    console.warn("Error forcing layout direction:", error);
  }
};

forceLayoutDirection();

// جداسازی منطق اصلی اپلیکیشن
function AppContent() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const { isIntroCompleted, isLoading: introLoading } = useIntro();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        Yekan_Bakh_Regular: require("./assets/fonts/Yekan_Bakh_EN_Regular.ttf"),
        Yekan_Bakh_Bold: require("./assets/fonts/Yekan_Bakh_EN_Bold.ttf"),
        Yekan_Bakh_ExtraBold: require("./assets/fonts/YekanBakhFaNum-ExtraBold.ttf"),
        iran_sans_medium: require("./assets/fonts/IRANSansWeb_Medium.ttf"),
        iran_sans_bold: require("./assets/fonts/IRANSansWeb_Bold.ttf"),
        iran_sans_black: require("./assets/fonts/IRANSansWeb_Black.ttf"),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  // نمایش لودینگ تا فونت‌ها و وضعیت‌های intro و auth بارگذاری شوند
  if (!fontsLoaded || introLoading || authLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StackNavigator />
      <StatusBar style="light" />
    </NavigationContainer>
  );
}

function App() {
  return (
    <AuthProvider>
      <IntroProvider>
        <AppContent />
      </IntroProvider>
    </AuthProvider>
  );
}

export default App;