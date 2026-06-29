

import React, { useEffect, useRef } from "react";
import {
  Animated,
} from "react-native";


export const SkeletonLoader = ({ style }: any) => {
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, { 
          toValue: 0.7,
          duration: 1200, 
          useNativeDriver: true 
        }),
        Animated.timing(opacityAnim, { 
          toValue: 0.3,
          duration: 1200, 
          useNativeDriver: true 
        }),
      ])
    );
    
    animation.start();
    
    return () => animation.stop();
  }, []); 

  return (
    <Animated.View 
      style={[
        { 
          backgroundColor: '#e1e5e9', 
          opacity: opacityAnim
        }, 
        style
      ]} 
    />
  );
};
