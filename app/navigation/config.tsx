import React from "react";
import { I18nManager, ActivityIndicator, View } from "react-native";
import colors from "../config/colors";

export const LoadingFallback = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: '#fff' }}>
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

const customTransitionConfig = {
  animation: "timing" as const,
  config: {
    duration: 180,
    useNativeDriver: true,
  },
};

export const screenOptions = {
  gestureEnabled: true,
  gestureDirection: (I18nManager.isRTL ? "horizontal-inverted" : "horizontal") as any,
  transitionSpec: {
    open: customTransitionConfig,
    close: customTransitionConfig,
  },
  cardStyleInterpolator: ({ current, layouts }: any) => ({
    cardStyle: {
      transform: [
        {
          translateX: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [layouts.screen.width * (I18nManager.isRTL ? -1 : 1), 0],
          }),
        },
      ],
    },
  }),
  headerShown: false,
};