import React, { useEffect, useRef, useState,memo,useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
  StatusBar,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Linking } from 'react-native';
import Toast from "../../../components/Toast";
import Ionicons from "@expo/vector-icons/Ionicons";
import colors from "../../../config/colors";
import AppText from "../../../components/Text";
import MainBackground from "../../../components/MainBackground";
import { toPersianDigits, safeNumber, formatPrice, safeString } from "../../../utils/converters";
import appConfig from "../../../config/config";
import { useMemberProfile } from "../../../config/useApi";
import { VideoView } from 'expo-video';
import { useVideoPlayer } from 'expo-video';
import { useAuth } from "../../../contexts/AuthContext";
import { styles ,modernColors,PROFILE_CONSTANTS } from "../styles/styles";


export const SkeletonLoader = memo(({ width, height, borderRadius = 8, style = {} }:any) => {
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 800, 
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.6,
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
});

SkeletonLoader.displayName = "SkeletonLoader";