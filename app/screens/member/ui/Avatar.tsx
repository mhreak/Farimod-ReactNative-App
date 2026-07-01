import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import { View, Animated, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { styles } from "../styles/styles";

const GRADIENT_COLORS = [
  ['#fa709a', '#fee140'],
  ['#667eea', '#764ba2'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
  ['#43e97b', '#38f9d7'],
  ['#ff9a56', '#ffad56'],
  ['#a8edea', '#fed6e3'],
  ['#fbc2eb', '#a6c1ee'],
];

const getGradientForName = (name?: string) => {
  const index = name ? name.length % GRADIENT_COLORS.length : 0;
  return GRADIENT_COLORS[index];
};

export const Avatar = memo(({ name, size = 80, onPress, member }: any) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 40,
      friction: 7,
    }).start();
  }, [scaleValue]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 40,
      friction: 7,
    }).start();
  }, [scaleValue]);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoading(false);
    setImageError(true);
  }, []);

  useEffect(() => {
    if (member?.AvatarImageURL) {
      setImageLoading(true);
      setImageError(false);
    }
  }, [member?.AvatarImageURL]);

  const selectedGradient = getGradientForName(name);
  const hasProfileImage = !!(member?.AvatarImageURL && member.AvatarImageURL.trim() !== '');
  const shouldShowImage = hasProfileImage && !imageError && !imageLoading;

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      <Animated.View
        style={{
          width: size,
          height: size,
          transform: [{ scale: scaleValue }],
        }}
      >
        <LinearGradient
          colors={selectedGradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.avatarGradient,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: 3,
              borderColor: '#fff',
            },
          ]}
        >
          <MaterialCommunityIcons
            name={member?.Gender ? "face-man" : "face-woman"}
            size={size * 0.6}
            color="white"
          />
        </LinearGradient>

        {hasProfileImage && (
          <Image
            source={{ uri: member.AvatarImageURL }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: 3,
              borderColor: '#fff',
              opacity: shouldShowImage ? 1 : 0,
              backgroundColor: 'transparent',
            }}
            resizeMode="cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}

        {member?.ShowBlueTick && (
          <View style={[
            styles.blueTickContainer,
            {
              width: size * 0.28,
              height: size * 0.28,
              borderRadius: (size * 0.28) / 2,
              bottom: size * 0.05,
              right: size * 0.05,
            }
          ]}>
            <MaterialIcons
              name="verified"
              size={size * 0.22}
              color="#1DA1F2"
            />
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
});
