import { StatusBar } from "expo-status-bar";
import * as Font from "expo-font";
import { useEffect, useState } from "react";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { I18nManager } from "react-native";

import { StackNavigator } from "./app/Navigators";

// Make sure RTL is enabled
// I18nManager.forceRTL(true);

function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        Yekan_Bakh_Regular: require("./assets/fonts/Yekan_Bakh_EN_Regular.ttf"),
        Yekan_Bakh_Bold: require("./assets/fonts/Yekan_Bakh_EN_Bold.ttf"),
        iran_sans_medium: require("./assets/fonts/IRANSansWeb_Medium.ttf"),
        iran_sans_bold: require("./assets/fonts/IRANSansWeb_Bold.ttf"),
        iran_sans_black: require("./assets/fonts/IRANSansWeb_Black.ttf"),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <StackNavigator />
      <StatusBar style="light" />
    </NavigationContainer>
  );
}

export default App;
