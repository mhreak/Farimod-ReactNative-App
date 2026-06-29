import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";

export const SkeletonLoader = ({ width, height, borderRadius = 8, style = {} }: any) => {
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true, 
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true, 
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [opacityAnim]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: "#e0e0e0", 
          borderRadius,
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
};