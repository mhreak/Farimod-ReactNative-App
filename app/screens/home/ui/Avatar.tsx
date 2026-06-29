import React, { useEffect, useRef, useState } from "react";
import { View, Image, TouchableOpacity, Animated } from "react-native";
import { styles } from "../styles/styles";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import AppText from "../../../components/Text";
import { safeString } from "../../../utils/converters";
import { AvatarProps } from "../../../config/type";
import { LinearGradient } from "expo-linear-gradient";

export const Avatar = React.memo(
  ({ name, size = 150, onPress, showOnline = false, member }: AvatarProps) => {
    const [imageError, setImageError] = useState(false);
    const scaleValue = useRef(new Animated.Value(1)).current; // ✅

    const gradientColors = [
      ["#fa709a", "#fee140"],
      ["#667eea", "#764ba2"],
      ["#f093fb", "#f5576c"],
      ["#4facfe", "#00f2fe"],
      ["#43e97b", "#38f9d7"],
    ];

    const getGradientForName = (name: string) => {
      const index = name ? name.length % gradientColors.length : 0;
      return gradientColors[index];
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
        onPress();
      }
    };

    const handleImageError = () => {
      setImageError(true);
    };

    useEffect(() => {
      setImageError(false);
    }, [member?.AvatarImageURL]);

    const selectedGradient = getGradientForName(name);
    const hasProfileImage =
      member?.AvatarImageURL &&
      member.AvatarImageURL.trim() !== "" &&
      !imageError;

    return (
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        disabled={!onPress}
      >
        <Animated.View
          style={[
            styles.avatarContainer,
            {
              width: size,
              height: size,
              transform: [{ scale: scaleValue }],
            },
          ]}
        >
          {hasProfileImage ? (
            <View
              style={[
                styles.avatarImageContainer,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                },
              ]}
            >
              <Image
                source={{ uri: member.AvatarImageURL }}
                style={[
                  styles.avatarImage,
                  {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                  },
                ]}
                resizeMode="cover"
                onError={handleImageError}
              />
            </View>
          ) : (
            <LinearGradient
              colors={selectedGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.avatarGradient,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={member?.Gender ? "face-man" : "face-woman"}
                size={size * 0.7}
                color="white"
              />
            </LinearGradient>
          )}

          {member?.ShowBlueTick && (
            <View
              style={[
                styles.blueTickContainer,
                {
                  width: size * 0.28,
                  height: size * 0.28,
                  borderRadius: (size * 0.28) / 2,
                  bottom: size * 0.2,
                  right: size * 0.05,
                },
              ]}
            >
              <MaterialIcons
                name="verified"
                size={size * 0.22}
                color="#1DA1F2"
              />
            </View>
          )}

          {name && (
            <AppText
              style={[styles.nameText, { fontSize: size * 0.13 }]}
              numberOfLines={1}
            >
              {safeString(name, "کاربر")}
            </AppText>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  },
);
