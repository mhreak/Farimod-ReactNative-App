import React, { useEffect, useRef, memo } from "react";
import { Animated, Easing } from "react-native";

const SkeletonLoader = ({ style }: any) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    animationRef.current = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    );

    animationRef.current.start();

    return () => {
      animationRef.current?.stop();
    };
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          backgroundColor: "#e1e5e9",
          opacity,
        },
        style,
      ]}
    />
  );
};

export default memo(SkeletonLoader);
