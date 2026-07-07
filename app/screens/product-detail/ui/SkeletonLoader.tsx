import React, { useEffect, useRef, memo } from "react";
import { Animated, StyleProp, ViewStyle, StyleSheet } from "react-native";

type SkeletonLoaderProps = {
  width: number | string;
  height: number | string;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

export const SkeletonLoader = memo(
  ({ width, height, borderRadius = 8, style }: SkeletonLoaderProps) => {
    const opacityValue = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(opacityValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityValue, {
            toValue: 0.4,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      animation.start();

      return () => {
        animation.stop();
      };
    }, [opacityValue]);

    return (
      <Animated.View
        style={[
          styles.base,
          {
            width,
            height,
            borderRadius,
            opacity: opacityValue,
          },
          style,
        ]}
      />
    );
  }
);

SkeletonLoader.displayName = "SkeletonLoader";

const styles = StyleSheet.create({
  base: {
    backgroundColor: "#e0e0e0", 
  },
});