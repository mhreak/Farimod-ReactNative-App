import React from "react";
import { StyleProp, Text, TextStyle } from "react-native";

import defaultStyles from "../config/styles";

interface AppTextProps {
  children: React.ReactNode; // Changed from ReactElement to ReactNode
  style?: StyleProp<TextStyle>; // Changed from StyleMedia to proper type
  [key: string]: any; // For ...otherProps
}
const AppText: React.FC<AppTextProps> = ({
  children,
  style,
  ...otherProps
}) => {
  return (
    <Text style={[defaultStyles.text, style]} {...otherProps}>
      {children}
    </Text>
  );
};

export default AppText;
