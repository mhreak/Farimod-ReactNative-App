import React, { ReactNode } from "react";
import Constants from "expo-constants";
import {
  StyleSheet,
  SafeAreaView,
  View,
  StyleSheetProperties,
  ViewStyle,
  StyleProp,
  TextStyle,
} from "react-native";

interface IProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}

const Screen: React.FC<IProps> = ({ children, style }) => {
  return (
    <SafeAreaView style={[styles.screen, style]}>
      <View style={[styles.view, style]}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    paddingTop: Constants.statusBarHeight,
    flex: 1,
    width: "100%",
  },
  view: {
    flex: 1,
  },
});

export default Screen;
