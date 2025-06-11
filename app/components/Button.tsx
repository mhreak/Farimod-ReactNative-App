import React from "react";
import {
  StyleProp,
  StyleSheet,
  StyleSheetProperties,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from "react-native";

import colors from "../config/colors";
import AppText from "./Text";

interface AppButtonProps extends Omit<TouchableOpacityProps, "style"> {
  title: string;
  onPress?: () => void;
  color?: string;
  style?: StyleProp<ViewStyle>;
  textColor?: string;
}

const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  color = "primary",
  style,
  textColor = colors.white,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors[color as any] }, style]}
      onPress={onPress}
    >
      <AppText style={[styles.text, { color: textColor }]}>{title}</AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    // width: "100%",
    marginVertical: 8,
  },
  text: {
    fontSize: 18,
    textTransform: "uppercase",
    fontFamily: "Yekan_Bakh_Bold",
  },
});

export default AppButton;
