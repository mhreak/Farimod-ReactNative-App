import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { styles } from "../../styles/styles";

export const SkeletonLoader = ({ width, height, borderRadius = 8, style = {} }) => {
  const pulseValue = useRef(new Animated.Value(0.4)).current;
  const shimmerValue = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false, 
        }),
        Animated.timing(pulseValue, {
          toValue: 0.4,
          duration: 1200,
          useNativeDriver: false,
        }),
      ])
    );

    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.delay(300),
      ])
    );

    pulseAnimation.start();
    shimmerAnimation.start();

    return () => {
      pulseAnimation.stop();
      shimmerAnimation.stop();
    };
  }, [pulseValue, shimmerValue]);

  const shimmerTranslateX = shimmerValue.interpolate({
    inputRange: [-1, 1],
    outputRange: [-300, 300],
  });

  return (
    <View
      style={[
        {
          width,
          height,
          backgroundColor: "#e0e0e0", 
          borderRadius,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            width: "100%",
            height: "100%",
            backgroundColor: "#f5f5f5",
            opacity: pulseValue, 
          },
        ]}
      />
      
      <Animated.View
        style={[
          styles.shimmerOverlay,
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            transform: [{ translateX: shimmerTranslateX }],
          },
        ]}
      />
    </View>
  );
};