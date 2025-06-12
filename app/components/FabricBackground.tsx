import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../config/colors";

const { width, height } = Dimensions.get("window");

interface IProps {
  children: React.ReactElement;
  gradientColors?: string[];
  gradientLocations?: number[];
  showFabricIcons?: boolean;
  animationDuration?: number;
  floatDuration?: number;
}

const FabricBackground: React.FC<IProps> = ({
  children,
  gradientColors = [colors.primary, colors.primaryLight, colors.tertiary],
  gradientLocations = [0, 0.5, 1],
  showFabricIcons = true,
  animationDuration = 2000,
  floatDuration = 4000,
}) => {
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // انیمیشن ستاره‌ها و فیدینگ
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // انیمیشن شناور برای المان‌ها - موج‌مانند
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: floatDuration,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: floatDuration,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animationDuration, floatDuration]);

  const fabricElements = [
    {
      name: "brush",
      size: 30,
      style: styles.fabricElement1,
      opacity: 0.7,
      rotateDirection: "normal",
    },
    {
      name: "palette",
      size: 25,
      style: styles.fabricElement2,
      opacity: 0.6,
      rotateDirection: "none",
    },
    {
      name: "tshirt-crew",
      size: 35,
      style: styles.fabricElement3,
      opacity: 0.5,
      rotateDirection: "reverse",
    },
    {
      name: "scissors-cutting",
      size: 28,
      style: styles.fabricElement4,
      opacity: 0.65,
      rotateDirection: "half",
    },
    {
      name: "tshirt-v",
      size: 32,
      style: styles.fabricElement5,
      opacity: 0.55,
      rotateDirection: "none",
    },
    {
      name: "pin",
      size: 26,
      style: styles.fabricElement6,
      opacity: 0.7,
      rotateDirection: "continue",
    },
    {
      name: "hanger",
      size: 30,
      style: styles.fabricElement7,
      opacity: 0.6,
      rotateDirection: "none",
    },
    {
      name: "tape-measure",
      size: 27,
      style: styles.fabricElement9,
      opacity: 0.5,
      rotateDirection: "none",
    },
  ];

  const getRotationTransform = (direction) => {
    switch (direction) {
      case "normal":
        return sparkleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "360deg"],
        });
      case "reverse":
        return sparkleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["360deg", "0deg"],
        });
      case "half":
        return sparkleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "180deg"],
        });
      case "continue":
        return sparkleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["180deg", "360deg"],
        });
      default:
        return "0deg";
    }
  };

  const getFloatTransform = (index) => {
    const variations = [
      { translateY: [0, -10], translateX: [0, 0] },
      { translateY: [0, 0], translateX: [0, 15] },
      { translateY: [0, 12], translateX: [0, 0] },
      { translateY: [0, 0], translateX: [0, -8] },
      { translateY: [0, -15], translateX: [0, 0] },
      { translateY: [0, 0], translateX: [0, 10] },
      { translateY: [0, 8], translateX: [0, 0] },
      { translateY: [0, -6], translateX: [0, 0] },
    ];

    const variation = variations[index] || variations[0];

    const transforms = [];

    if (variation.translateY[1] !== 0) {
      transforms.push({
        translateY: floatAnim.interpolate({
          inputRange: [0, 1],
          outputRange: variation.translateY,
        }),
      });
    }

    if (variation.translateX[1] !== 0) {
      transforms.push({
        translateX: floatAnim.interpolate({
          inputRange: [0, 1],
          outputRange: variation.translateX,
        }),
      });
    }

    return transforms;
  };

  return (
    <LinearGradient
      colors={gradientColors}
      locations={gradientLocations}
      style={styles.background}
    >
      <View style={styles.container}>
        {/* المان‌های تزئینی پارچه */}
        {showFabricIcons && (
          <View style={styles.decorativeElements}>
            {fabricElements.map((element, index) => (
              <Animated.View
                key={element.name}
                style={[
                  element.style,
                  {
                    opacity: sparkleAnim,
                    transform: [
                      ...(element.rotateDirection !== "none"
                        ? [
                            {
                              rotate: getRotationTransform(
                                element.rotateDirection
                              ),
                            },
                          ]
                        : []),
                      ...(element.rotateDirection === "none"
                        ? [{ scale: sparkleAnim }]
                        : []),
                      ...getFloatTransform(index),
                    ],
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={element.name}
                  size={element.size}
                  color={`rgba(255, 255, 255, ${element.opacity})`}
                />
              </Animated.View>
            ))}
          </View>
        )}

        {/* محتوای داخلی */}
        {children}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    position: "relative",
  },
  decorativeElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  fabricElement1: {
    position: "absolute",
    top: 120,
    right: 40,
  },
  fabricElement2: {
    position: "absolute",
    top: 80,
    left: 150,
  },
  fabricElement3: {
    position: "absolute",
    bottom: 150,
    right: 50,
  },
  fabricElement4: {
    position: "absolute",
    top: 160,
    left: 40,
  },
  fabricElement5: {
    position: "absolute",
    bottom: 250,
    left: 30,
  },
  fabricElement6: {
    position: "absolute",
    top: 180,
    right: 110,
  },
  fabricElement7: {
    position: "absolute",
    bottom: 100,
    right: 155,
  },
  fabricElement9: {
    position: "absolute",
    bottom: 180,
    left: 55,
  },
});

export default FabricBackground;
