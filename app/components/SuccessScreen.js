import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from "react-native";
import {
  CheckCircle,
  Eye,
  Users,
  Plus,
  Calendar,
  Home,
  ArrowLeft,
  FileText,
  Settings,
  Share2,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../config/colors";

const { width, height } = Dimensions.get("window");

// آیکون‌های موجود
const ICONS = {
  eye: Eye,
  users: Users,
  plus: Plus,
  calendar: Calendar,
  home: Home,
  arrowLeft: ArrowLeft,
  fileText: FileText,
  settings: Settings,
  share: Share2,
  check: CheckCircle,
};

const SuccessScreen = ({ route, navigation }) => {
  const {
    title = "عملیات موفق",
    message = "ثبت نام با موفقیت انجام شد",
    buttons = [], // آرایه دکمه‌ها
  } = route?.params || {};

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const checkScaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonsScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Main container animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Check mark animation with delay
    Animated.sequence([
      Animated.delay(200),
      Animated.spring(checkScaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // Rotation animation
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Fade in text
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      delay: 400,
      useNativeDriver: true,
    }).start();

    // Buttons animation
    Animated.spring(buttonsScale, {
      toValue: 1,
      tension: 50,
      friction: 7,
      delay: 600,
      useNativeDriver: true,
    }).start();

    // Confetti particles animation
    particles.forEach((particle, index) => {
      Animated.sequence([
        Animated.delay(index * 50),
        Animated.timing(particle.anim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  const particles = useRef(
    [...Array(20)].map(() => ({
      anim: new Animated.Value(0),
      x: Math.random() * width,
      delay: Math.random() * 1000,
    }))
  ).current;

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const getButtonWidth = () => {
    if (buttons.length === 0) return "100%";
    if (buttons.length === 1) return "100%";
    if (buttons.length === 2) return "48%";
    return "48%"; 
  };

  const renderButton = (button, index) => {
    const Icon = ICONS[button.icon] || ArrowLeft;
    const colors = button.colors || ["#fdbcff", "#ff81ee", "#b800ae"];
    const iconColor = button.iconColor || "#FFFFFF";
    const textColor = button.textColor || "#FFFFFF";

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.actionButton,
          { width: getButtonWidth() },
          buttons.length === 1 && styles.singleButton,
        ]}
        onPress={button.onPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={colors}
          style={styles.actionButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Icon size={24} color={iconColor} />
          <Text style={[styles.actionButtonText, { color: textColor }]}>
            {button.text}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#e8adff" />

      {/* Animated background particles */}
      <View style={styles.particlesContainer}>
        {particles.map((particle, index) => {
          const translateY = particle.anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, height],
          });
          const opacity = particle.anim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [1, 0.5, 0],
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.particle,
                {
                  left: particle.x,
                  opacity,
                  transform: [{ translateY }],
                },
              ]}
            />
          );
        })}
      </View>

      <LinearGradient
        colors={["#7369ff", "#7c58ff", "#ff1fa9"]}
        style={styles.gradient}
        locations={[0, 0.6, 1]}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            {/* Success Icon Container */}
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={["#10B981", "#059669", "#047857"]}
                style={styles.iconGradient}
              >
                <Animated.View
                  style={{
                    transform: [{ scale: checkScaleAnim }, { rotate }],
                  }}
                >
                  <CheckCircle size={80} color="#FFFFFF" strokeWidth={2.5} />
                </Animated.View>
              </LinearGradient>

              {/* Pulse rings */}
              <View style={styles.pulseContainer}>
                {[1, 2, 3].map((_, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.pulseRing,
                      {
                        opacity: scaleAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 0.3 - index * 0.1],
                        }),
                        transform: [
                          {
                            scale: scaleAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.8, 1.2 + index * 0.3],
                            }),
                          },
                        ],
                      },
                    ]}
                  />
                ))}
              </View>
            </Animated.View>

            {/* Success Message */}
            <Animated.View
              style={[
                styles.messageContainer,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
            </Animated.View>

            {/* Action Buttons */}
            {buttons.length > 0 && (
              <Animated.View
                style={[
                  styles.buttonsContainer,
                  {
                    transform: [{ scale: buttonsScale }],
                  },
                ]}
              >
                {buttons.map((button, index) => renderButton(button, index))}
              </Animated.View>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8d4ff",
  },
  particlesContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  particle: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 40,
    position: "relative",
  },
  iconGradient: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10B981",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  pulseContainer: {
    position: "absolute",
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: "#10B981",
  },
  messageContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "Yekan_Bakh_Bold",
    marginBottom: 16,
    letterSpacing: 1,
  },
  message: {
    fontSize: 18,
    color: "#94A3B8",
    textAlign: "center",
    fontFamily: "Yekan_Bakh_Regular",
    lineHeight: 28,
    paddingHorizontal: 20,
  },
  buttonsContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  actionButton: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 12,
  },
  singleButton: {
    width: "100%",
  },
  actionButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 64,
    flexDirection: "row-reverse",
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
  },
});

export default SuccessScreen;
