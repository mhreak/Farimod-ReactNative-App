import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "./contexts/AuthContext";
import { screenOptions, LoadingFallback } from "./navigation/config";
import { RootStackParamList } from "./navigation/types";
import { IntroFlowNavigator, AuthNavigator } from "./navigation/AuthAndIntroNavigator";
import AppNavigator from "./navigation/AppNavigator";

const Stack = createStackNavigator<RootStackParamList>();

export function StackNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <Stack.Navigator screenOptions={{ ...screenOptions, headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="App" component={AppNavigator} />
      ) : (
        <>
          <Stack.Screen name="IntroFlow" component={IntroFlowNavigator} />
          <Stack.Screen name="Auth" component={AuthNavigator} />
        </>
      )}
    </Stack.Navigator>
  );
}