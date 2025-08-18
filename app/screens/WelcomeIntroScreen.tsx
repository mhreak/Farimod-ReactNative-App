import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  PixelRatio,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../config/colors";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get("window");

const responsiveFontSize = (size) => {
  const scale = width / 400;
  const newSize = size * scale;

  if (newSize < size * 0.8) return size * 0.8;
  if (newSize > size * 1.2) return size * 1.2;

  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

const normalize = (size) => {
  if (width < 350) {
    return size * 0.85;
  } else if (width > 400) {
    return size * 1.1;
  }
  return size;
};

const WelcomeIntroScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),
      Animated.loop(
        Animated.sequence([
          Animated.timing(sparkleAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(sparkleAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 15000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleContinue = () => {
    navigation.navigate("WhyFrimod");
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={[colors.primary, colors.primaryLight, colors.tertiary]}
        locations={[0, 0.5, 1]}
        style={styles.background}
      >
        <View style={[styles.container, { paddingBottom: insets.bottom + 60 }]}>
          <View style={styles.decorativeElements}>
            <Animated.View
              style={[
                styles.fabricElement1,
                {
                  opacity: sparkleAnim,
                  transform: [
                    {
                      rotate: sparkleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "360deg"],
                      }),
                    },
                    {
                      translateY: floatAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -10],
                      }),
                    },
                  ],
                },
              ]}
            >
              <MaterialCommunityIcons
                name="brush"
                size={responsiveFontSize(30)}
                color="rgba(255, 255, 255, 0.7)"
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.fabricElement2,
                {
                  opacity: sparkleAnim,
                  transform: [
                    { scale: sparkleAnim },
                    {
                      translateX: floatAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 15],
                      }),
                    },
                  ],
                },
              ]}
            >
              <MaterialCommunityIcons
                name="palette"
                size={responsiveFontSize(25)}
                color="rgba(255, 255, 255, 0.6)"
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.fabricElement3,
                {
                  opacity: sparkleAnim,
                  transform: [
                    {
                      rotate: sparkleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["360deg", "0deg"],
                      }),
                    },
                    {
                      translateY: floatAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 12],
                      }),
                    },
                  ],
                },
              ]}
            >
              <MaterialCommunityIcons
                name="tshirt-crew"
                size={responsiveFontSize(35)}
                color="rgba(255, 255, 255, 0.5)"
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.fabricElement4,
                {
                  opacity: sparkleAnim,
                  transform: [
                    {
                      rotate: sparkleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "180deg"],
                      }),
                    },
                    {
                      translateX: floatAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -8],
                      }),
                    },
                  ],
                },
              ]}
            >
              <MaterialCommunityIcons
                name="scissors-cutting"
                size={responsiveFontSize(28)}
                color="rgba(255, 255, 255, 0.65)"
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.fabricElement5,
                {
                  opacity: sparkleAnim,
                  transform: [
                    { scale: sparkleAnim },
                    {
                      translateY: floatAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -15],
                      }),
                    },
                  ],
                },
              ]}
            >
              <MaterialCommunityIcons
                name="tshirt-v"
                size={responsiveFontSize(32)}
                color="rgba(255, 255, 255, 0.55)"
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.fabricElement6,
                {
                  opacity: sparkleAnim,
                  transform: [
                    {
                      rotate: sparkleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["180deg", "360deg"],
                      }),
                    },
                    {
                      translateX: floatAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 10],
                      }),
                    },
                  ],
                },
              ]}
            >
              <MaterialCommunityIcons
                name="pin"
                size={responsiveFontSize(26)}
                color="rgba(255, 255, 255, 0.7)"
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.fabricElement7,
                {
                  opacity: sparkleAnim,
                  transform: [
                    { scale: sparkleAnim },
                    {
                      translateY: floatAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 8],
                      }),
                    },
                  ],
                },
              ]}
            >
              <MaterialCommunityIcons
                name="hanger"
                size={responsiveFontSize(30)}
                color="rgba(255, 255, 255, 0.6)"
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.fabricElement9,
                {
                  opacity: sparkleAnim,
                  transform: [
                    { scale: sparkleAnim },
                    {
                      translateY: floatAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -6],
                      }),
                    },
                  ],
                },
              ]}
            >
              <MaterialCommunityIcons
                name="tape-measure"
                size={responsiveFontSize(27)}
                color="rgba(255, 255, 255, 0.5)"
              />
            </Animated.View>
          </View>

          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.logoWrapper}>
              <LinearGradient
                colors={[colors.white, colors.primaryLight]}
                style={styles.logoCircle}
              >
                <Image
                  source={require('../../assets/main-icon.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </LinearGradient>

              <Animated.View
                style={[
                  styles.sparkle1,
                  {
                    opacity: sparkleAnim,
                    transform: [{ scale: sparkleAnim }],
                  },
                ]}
              >
                <Text style={styles.sparkleText}>✨</Text>
              </Animated.View>

              <Animated.View
                style={[
                  styles.sparkle2,
                  {
                    opacity: sparkleAnim,
                    transform: [{ scale: sparkleAnim }],
                  },
                ]}
              >
                <Text style={styles.sparkleText}>✨</Text>
              </Animated.View>

              <Animated.View
                style={[
                  styles.sparkle3,
                  {
                    opacity: sparkleAnim,
                    transform: [{ scale: sparkleAnim }],
                  },
                ]}
              >
                <Text style={styles.sparkleText}>✨</Text>
              </Animated.View>

              <Animated.View
                style={[
                  styles.sparkle4,
                  {
                    opacity: sparkleAnim,
                    transform: [{ scale: sparkleAnim }],
                  },
                ]}
              >
                <Text style={styles.sparkleText}>✨</Text>
              </Animated.View>
            </View>

            {/* راه‌حل 3: استفاده از allowFontScaling={false} */}
            <Text style={styles.appName} allowFontScaling={false}>
              فریمد | Farimod
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.mainText} allowFontScaling={false}>
              به اپلیکیشن معرفی طراحان پارچه و لباس ایران
            </Text>
            <View style={styles.appNameContainer}>
              <Text style={styles.appNameHighlight} allowFontScaling={false}>
                فریمد
              </Text>
              <MaterialCommunityIcons
                name="heart"
                size={responsiveFontSize(20)}
                color={colors.primary}
                style={styles.heartIcon}
              />
            </View>
            <Text style={styles.mainText} allowFontScaling={false}>خوش آمدید!</Text>

            <View style={styles.separator}>
              <View style={styles.separatorLine} />
              <Ionicons
                name="sparkles"
                size={responsiveFontSize(30)}
                color={colors.primary}
              />
              <View style={styles.separatorLine} />
            </View>

            <Text style={styles.subText} allowFontScaling={false}>
              به خانواده بزرگ طراحان پارچه و لباس ایران بپیوندید.
            </Text>

            <View style={styles.starsContainer}>
              {/* Stars commented out as in original */}
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                locations={[0, 1]}
                style={styles.buttonGradient}
                start={{ x: 1, y: 1 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText} allowFontScaling={false}>ادامه</Text>
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={responsiveFontSize(20)}
                  color="white"
                />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: StatusBar.currentHeight + 60,
    paddingBottom: 60,
    paddingHorizontal: 30,
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
    right: 30,
  },
  fabricElement2: {
    position: "absolute",
    top: 200,
    left: 40,
  },
  fabricElement3: {
    position: "absolute",
    bottom: 150,
    right: 50,
  },
  fabricElement4: {
    position: "absolute",
    top: 160,
    left: 20,
  },
  fabricElement5: {
    position: "absolute",
    bottom: 250,
    left: 30,
  },
  fabricElement6: {
    position: "absolute",
    top: 280,
    right: 25,
  },
  fabricElement7: {
    position: "absolute",
    bottom: 320,
    right: 35,
  },
  fabricElement9: {
    position: "absolute",
    bottom: 180,
    left: 55,
  },
  logoContainer: {
    alignItems: "center",
    zIndex: 1,
  },
  logoWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  logoCircle: {
    width: width * 0.4, // responsive width
    height: width * 0.4, // responsive height
    maxWidth: 150,
    maxHeight: 150,
    minWidth: 120,
    minHeight: 120,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
    borderWidth: 2,
    borderColor: colors.white,
  },
  logoImage: {
    width: "65%", // responsive به جای 100px ثابت
    height: "65%",
    borderRadius: 100,
  },
  sparkle1: {
    position: "absolute",
    top: -10,
    right: -10,
  },
  sparkle2: {
    position: "absolute",
    top: -5,
    left: -15,
  },
  sparkle3: {
    position: "absolute",
    bottom: -10,
    right: -5,
  },
  sparkle4: {
    position: "absolute",
    bottom: -5,
    left: -10,
  },
  sparkleText: {
    fontSize: responsiveFontSize(16),
  },
  appName: {
    fontSize: responsiveFontSize(42),
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.primary,
    marginTop: 25,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    textAlign: 'center', // اضافه شده
  },
  welcomeText: {
    fontSize: responsiveFontSize(20),
    fontFamily: "Yekan_Bakh_Regular",
    color: colors.primaryDark,
    marginTop: 5,
  },
  contentContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    zIndex: 1,
    paddingHorizontal: 10, // اضافه شده
  },
  mainText: {
    fontSize: responsiveFontSize(18),
    fontFamily: "Yekan_Bakh_Regular",
    color: colors.dark,
    textAlign: "center",
    lineHeight: responsiveFontSize(28),
  },
  appNameHighlight: {
    fontSize: responsiveFontSize(28),
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.primary,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  appNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  heartIcon: {
    marginLeft: 8,
    marginTop: 2,
  },
  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
  },
  separatorLine: {
    height: 1,
    width: 40,
    backgroundColor: colors.primary,
    opacity: 0.3,
    marginHorizontal: 10,
  },
  subText: {
    fontSize: responsiveFontSize(16),
    fontFamily: "Yekan_Bakh_Regular",
    color: colors.medium,
    textAlign: "center",
    lineHeight: responsiveFontSize(24),
  },
  starsContainer: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-between",
    width: 120,
  },
  star: {
    fontSize: responsiveFontSize(18),
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    zIndex: 1,
  },
  continueButton: {
    width: "80%",
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: colors.primary,
  },
  buttonGradient: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 30,
  },
  buttonText: {
    fontSize: responsiveFontSize(18),
    fontFamily: "Yekan_Bakh_Bold",
    color: "white",
    marginLeft: 10,
  },
});

export default WelcomeIntroScreen;