import React from "react";
import { View, TouchableOpacity, Animated } from "react-native";
import { styles } from "../styles/styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppText from "../../../components/Text";
import { safeString } from "../../../utils/converters";
import { MemberGroup } from "../../../types/home/home.types";
import { LinearGradient } from "expo-linear-gradient";

export const MemberGroupCard = React.memo(
  ({
    item,
    onPress,
  }: {
    item: MemberGroup;
    onPress?: (group: MemberGroup) => void;
  }) => {
    const scaleValue = new Animated.Value(1);

    const gradientColors = [
      ["#667eea", "#764ba2"],
      ["#f093fb", "#f5576c"],
      ["#4facfe", "#00f2fe"],
      ["#43e97b", "#38f9d7"],
      ["#fa709a", "#fee140"],
      ["#30cfd0", "#330867"],
      ["#a8edea", "#fed6e3"],
      ["#ff9a9e", "#fecfef"],
      ["#ffecd2", "#fcb69f"],
      ["#ff6e7f", "#bfe9ff"],
      ["#8EC5FC", "#E0C3FC"],
      ["#fbc2eb", "#a6c1ee"],
      ["#fdcbf1", "#e6dee9"],
      ["#a1c4fd", "#c2e9fb"],
      ["#d299c2", "#fef9d7"],
      ["#FEE140", "#FA709A"],
      ["#FDBB2D", "#22C1C3"],
      ["#ee9ca7", "#ffdde1"],
      ["#89f7fe", "#66a6ff"],
      ["#cd9cf2", "#f6f3ff"],
    ];

    const fashionIcons = [
      "tshirt-crew",
      "hanger",

      "ruler",
      "draw",
      "palette",
      "scissors-cutting",
      "content-cut",
      "tag",
      "shopping",
      "badge-account",
      "brush",

      "dots-grid",
    ];

    const getGradientForGroup = (id: number) => {
      const index = id % gradientColors.length;
      return gradientColors[index];
    };

    const getIconForGroup = (id: number) => {
      const index = id % fashionIcons.length;
      return fashionIcons[index];
    };

    const handlePressIn = () => {
      Animated.spring(scaleValue, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    const handlePress = () => {
      if (onPress) {
        onPress(item);
      }
    };

    const selectedGradient = getGradientForGroup(item.MemberGroupId);
    const selectedIcon = getIconForGroup(item.MemberGroupId);

    return (
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        disabled={!onPress}
        style={styles.memberGroupCardWrapper}
      >
        <Animated.View
          style={[
            styles.memberGroupCard,
            {
              transform: [{ scale: scaleValue }],
            },
          ]}
        >
          <LinearGradient
            colors={selectedGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.memberGroupGradient}
          >
            <View style={styles.memberGroupContent}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name={selectedIcon}
                  size={28}
                  color="rgba(0, 0, 0, 0.95)"
                />
              </View>

              <AppText style={styles.memberGroupTitle} numberOfLines={2}>
                {safeString(item.GroupName, "گروه بدون نام")}
              </AppText>
            </View>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  },
);
