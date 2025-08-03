import React, { useEffect, useRef } from "react";
import AppText from "../components/Text";
import { StyleSheet, TouchableOpacity, View, Image, Animated } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import AppTextInput from "../components/TextInput";
import AppButton from "../components/Button";
import Screen from "../components/Screen";
import colors from "../config/colors";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { AppNavigationProp } from "../Navigators";

const EditProfileScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const iconFadeAnim = useRef(new Animated.Value(0)).current;
  const iconSlideAnim = useRef(new Animated.Value(-50)).current;
  const formFadeAnim = useRef(new Animated.Value(0)).current;
  const formSlideAnim = useRef(new Animated.Value(40)).current;
  const backButtonAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequential animations for better effect
    Animated.sequence([
      // Back button appears first
      Animated.timing(backButtonAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Icon appears with slide from top
      Animated.parallel([
        Animated.timing(iconFadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(iconSlideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Form appears with slide from bottom
      Animated.parallel([
        Animated.timing(formFadeAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(formSlideAnim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Continuous pulse animation for icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Continuous rotation for decorative ring
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.backgroundContainer}>
      <View style={styles.backgroundWrapper}>
        <Image
          source={require('../../assets/backgrounds/background-1.jpg')}
          style={styles.backgroundImage}
        />
      </View>

      <LinearGradient
        colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,1)']}
        style={styles.gradientOverlay}
      >
        <Screen style={styles.container}>
          <Animated.View
            style={[
              styles.backButton,
              {
                opacity: backButtonAnim,
                transform: [{ scale: backButtonAnim }],
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
            >
              <View style={styles.backButtonGlass}>
                <MaterialIcons
                  name="arrow-forward"
                  size={24}
                  color="white"
                />
              </View>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={[
              styles.iconContainer,
              {
                opacity: iconFadeAnim,
                transform: [
                  { translateY: iconSlideAnim },
                  { scale: pulseAnim },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark || colors.primary]}
              style={styles.iconCircle}
            >
              <View style={styles.iconInnerCircle}>
                <MaterialIcons name="person" color={colors.white} size={65} />
              </View>
              {/* Decorative ring with rotation */}
              <Animated.View
                style={[
                  styles.iconRing,
                  {
                    transform: [{ rotate: spin }],
                  },
                ]}
              />
            </LinearGradient>
          </Animated.View>

          <View style={styles.centerContainer}>
            <Animated.View
              style={[
                styles.editBox,
                {
                  opacity: formFadeAnim,
                  transform: [{ translateY: formSlideAnim }],
                },
              ]}
            >
              {/* Glassmorphism overlay */}
              <View style={styles.glassOverlay} />

              {/* Content */}
              <View style={styles.contentContainer}>
                <AppText style={styles.logingText}>ویرایش پروفایل</AppText>

                <AppTextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  icon="account-box"
                  keyboardType="default"
                  name="userName"
                  placeholder="نام کاربری"
                  onChangeText={() => { }}
                />

                <AppTextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  icon="person"
                  keyboardType="default"
                  name="fullName"
                  placeholder="نام و نام خانوادگی"
                  onChangeText={() => { }}
                />

                <AppTextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  icon="phone-android"
                  keyboardType="phone-pad"
                  name="mobileNumber"
                  placeholder="شماره موبایل"
                  onChangeText={() => { }}
                />

                <AppButton
                  title="ذخیره"
                  onPress={() => { }}
                  color={colors.success}
                />
              </View>
            </Animated.View>
          </View>
        </Screen>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
  },
  backgroundWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'repeat',
  },
  gradientOverlay: {
    flex: 1,
  },
  container: {
    padding: 10,
    justifyContent: "center",
    backgroundColor: 'transparent',
  },
  backButton: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 10,
  },
  backButtonGlass: {
    backgroundColor: '#9E22AD',
    borderRadius: 25,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 206, 232, 0.5)',
  },
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  editBox: {
    borderRadius: 25,
    padding: 25,
    width: "100%",
    position: 'relative',
    overflow: 'hidden',
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 206, 232, 0.7)',
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 206, 232, 1)',
    shadowColor: 'rgba(255, 255, 255, 1)',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 1,
  },
  contentContainer: {
    position: 'relative',
    zIndex: 1,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: -20,
    zIndex: 1000
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: -80,
    shadowColor: 'rgba(255, 206, 232, 0.2)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  iconInnerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 206, 232, 0.15)',
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: 'rgba(255, 206, 232, 0.4)',
    zIndex: 99,
  },
  iconRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 206, 232, 0.3)',
    borderStyle: 'dashed',
  },
  logingText: {
    marginTop: 50,
    fontSize: 30,
    textAlign: "center",
    marginBottom: 30,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.primary,
    textShadowColor: 'rgba(255, 206, 232, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default EditProfileScreen;