import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { screenOptions } from "./config";

import WelcomeIntroScreen from "../screens/WelcomeIntroScreen";
import WhyFrimodScreen from "../screens/WhyFrimodScreen";
import LoginScreen from "../screens/LoginScreen";
import OTPScreen from "../screens/OTPScreen";
import SignupScreen from "../screens/SignupScreen";
import EventsScreen from "../screens/EventsScreen";
import CareerScreen from "../screens/CareerScreen";

const IntroStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

export function IntroFlowNavigator() {
  return (
    <IntroStack.Navigator screenOptions={screenOptions} initialRouteName="WelcomeIntro">
      <IntroStack.Screen name="WelcomeIntro" component={WelcomeIntroScreen} />
      <IntroStack.Screen name="WhyFrimod" component={WhyFrimodScreen} />
      <IntroStack.Screen name="EventsScreen" component={EventsScreen} />
      <IntroStack.Screen name="CareerScreen" component={CareerScreen} />
    </IntroStack.Navigator>
  );
}


export function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={screenOptions} initialRouteName="Login">
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="OTP" component={OTPScreen} options={{ gestureEnabled: true }} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}