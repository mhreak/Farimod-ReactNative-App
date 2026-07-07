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

export const LikeButton = memo(({ memberId, initialLikeCount = 0, initialIsLiked = false, onLikeSuccess }:any) => {
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLiking, setIsLiking] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');

  const stateRef = useRef({ isLiked, likeCount, isLiking });
  useEffect(() => {
    stateRef.current = { isLiked, likeCount, isLiking };
  }, [isLiked, likeCount, isLiking]);

  const heartAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setLikeCount(initialLikeCount);
    setIsLiked(initialIsLiked);
  }, [initialLikeCount, initialIsLiked]);

  const triggerAnimation = useCallback((willBeLiked:any) => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(heartAnim, { toValue: 0.3, duration: 100, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(heartAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
    ]).start();

    if (willBeLiked) {
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(heartAnim, { toValue: 0.8, duration: 200, useNativeDriver: true }),
          Animated.timing(heartAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start();
      }, 200);
    } else {
      Animated.timing(heartAnim, { toValue: 0, duration: 100, useNativeDriver: true }).start();
    }
  }, [ heartAnim]);

  const handleLike = useCallback(async () => {
    const { isLiked: currentIsLiked, likeCount: currentLikeCount, isLiking: currentIsLiking } = stateRef.current;
    const userId = user?.MemberId;

    if (currentIsLiking || !memberId || !userId) return;

    setIsLiking(true);

    const newIsLiked = !currentIsLiked;
    const countChange = newIsLiked ? 1 : -1;
    const newLikeCount = currentLikeCount + countChange;

    setIsLiked(newIsLiked);
    setLikeCount(newLikeCount);

    triggerAnimation(newIsLiked);

    try {
      const apiUrl = `${appConfig.mobileApi}Member/Like?likedMemberId=${memberId}&memberId=${userId}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Message || 'خطا در ثبت لایک');
      }

      const result = await response.json();

      if (result.LikeCount !== undefined) {
        setLikeCount(result.LikeCount);
      }

      if (onLikeSuccess) {
        setTimeout(() => {
          onLikeSuccess();
        }, 300);
      }

    } catch (error) {
      setIsLiked(currentIsLiked);
      setLikeCount(currentLikeCount);

      setToastMessage((error as any).message || 'خطا در ثبت لایک');
      setToastType('error');
      setToastVisible(true);
    } finally {
      setIsLiking(false);
    }
  }, [memberId, user?.MemberId, onLikeSuccess, triggerAnimation]);



  const animatedHeartStyle = {
    opacity: heartAnim,
    transform: [
      {
        translateY: heartAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -100],
        }),
      },
      {
        scale: heartAnim.interpolate({
          inputRange: [0, 0.3, 0.7, 1],
          outputRange: [0.5, 1.5, 1.2, 0.3],
        }),
      },
    ],
  };

  return (
    <>
      <View style={styles.likeSection}>
        <View >
          <TouchableOpacity
            style={styles.likeButton}
            onPress={handleLike}
            disabled={isLiking}
            activeOpacity={0.7}
          >
            <View style={styles.likeButtonInner}>
              <MaterialIcons
                name={isLiked ? "favorite" : "favorite-border"}
                size={20}
                color={isLiked ? modernColors.secondary : modernColors.medium}
              />
              <AppText style={[
                styles.likeText,
                { color: isLiked ? modernColors.secondary : modernColors.medium }
              ]}>
                {toPersianDigits(likeCount.toString())}
              </AppText>
            </View>
          </TouchableOpacity>
        </View>

        <Animated.View style={[styles.floatingHeart, animatedHeartStyle]}>
          <MaterialIcons name="favorite" size={30} color={modernColors.secondary} />
        </Animated.View>
      </View>
      
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType as any}
        duration={3000}
        onHide={() => setToastVisible(false)}
      />
    </>
  );
});