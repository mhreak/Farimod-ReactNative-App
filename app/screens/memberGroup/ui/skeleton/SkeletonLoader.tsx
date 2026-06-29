
import { View } from "react-native";

export const SkeletonLoader = ({ width, height, borderRadius = 8, style = {} }: { width: number | string; height: number | string; borderRadius?: number; style?: any }) => {
  return (
    <View
      style={[
        {
          width,
          height,
          backgroundColor: '#e0e0e0',
          borderRadius,
        },
        style,
      ]}
    />
  );
};
