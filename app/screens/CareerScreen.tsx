import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIntro } from '../contexts/IntroContext'; // اضافه کردن context

import colors from "../config/colors";

const { width, height } = Dimensions.get("window");

const CareerScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { completeIntro } = useIntro(); // دسترسی به تابع تکمیل intro
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const handleContinue = () => {
    navigation.navigate("EventsScreen");
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleGetStarted = async () => {
    // علامت‌گذاری intro به عنوان کامل شده
    await completeIntro();
    // هدایت به صفحه لاگین
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={[colors.primary, colors.primaryDark, '#4A148C', colors.tertiary]}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingBottom: insets.bottom + 20 }]}
        >
          <View style={styles.container}>
            <Animated.View
              style={[
                styles.headerContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.titleWrapper}>
                <LinearGradient
                  colors={['#FFD700', '#FFA500']}
                  style={styles.headerIconContainer}
                >
                  <MaterialCommunityIcons
                    name="briefcase-variant"
                    size={30}
                    color="#fff"
                  />
                </LinearGradient>
                <Text style={styles.headerTitle}>پروژه‌گیری و کاریابی فشن</Text>

              </View>
            </Animated.View>

            <Animated.View
              style={[
                styles.mainCard,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={["rgba(255, 255, 255, 0.15)", "rgba(255, 255, 255, 0.08)"]}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.mainIconContainer}>
                  <LinearGradient
                    colors={['#E91E63', '#AD1457']}
                    style={styles.mainIconCircle}
                  >
                    <MaterialCommunityIcons
                      name="handshake"
                      size={45}
                      color="white"
                    />
                  </LinearGradient>
                  <View style={styles.sparkleContainer}>
                    <MaterialCommunityIcons
                      name="star-four-points"
                      size={16}
                      color="#FFD700"
                      style={styles.sparkle1}
                    />
                    <MaterialCommunityIcons
                      name="star-four-points"
                      size={12}
                      color="#FF6B6B"
                      style={styles.sparkle2}
                    />
                  </View>
                </View>

                <Text style={styles.mainDescription}>
                  طراحان لباس در این پلتفرم با ارائه و بارگذاری مدارک، رزومه، پورتفولیو و نمونه کار خود می‌توانند با تولیدکنندگان و مزون‌ها و کارخانجات لینک شوند و جذب پروژه و کاریابی داشته باشند.
                </Text>

                <View style={styles.careerContainer}>
                  <CareerFeature
                    icon="file-document-outline"
                    title="بارگذاری رزومه"
                    description="آپلود رزومه و مدارک شما"
                    color="#4CAF50"
                    gradientColors={['#4CAF50', '#2E7D32']}
                  />

                  <CareerFeature
                    icon="briefcase-outline"
                    title="پورتفولیو"
                    description="نمایش نمونه کارهای شما"
                    color="#FF9800"
                    gradientColors={['#FF9800', '#E65100']}
                  />

                  <CareerFeature
                    icon="account-group"
                    title="اتصال به مزون‌ها"
                    description="ارتباط مستقیم با کارفرمایان"
                    color="#2196F3"
                    gradientColors={['#2196F3', '#0D47A1']}
                  />

                  <CareerFeature
                    icon="factory"
                    title="کارخانجات تولیدی"
                    description="همکاری با تولیدکنندگان"
                    color="#9C27B0"
                    gradientColors={['#9C27B0', '#4A148C']}
                  />

                  <CareerFeature
                    icon="chart-line"
                    title="رشد حرفه‌ای"
                    description="توسعه مهارت‌ها و شبکه کاری"
                    color="#00BCD4"
                    gradientColors={['#00BCD4', '#006064']}
                  />
                </View>

                <View style={styles.linkSection}>
                  <LinearGradient
                    colors={['#3F51B5', '#1A237E']}
                    style={styles.linkIconContainer}
                  >
                    <MaterialCommunityIcons
                      name="link-variant"
                      size={24}
                      color="white"
                    />
                  </LinearGradient>
                  <Text style={styles.linkText}>
                    لینک سایت‌های کاریابی مد و فشن را از ما بخواهید
                  </Text>
                </View>
              </LinearGradient>
            </Animated.View>

            <Animated.View
              style={[
                styles.buttonsContainer,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim }
                  ],
                },
              ]}
            >


              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleContinue}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  style={styles.continueButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <MaterialCommunityIcons
                    name="arrow-left"
                    size={20}
                    color="white"
                  />
                  <Text style={styles.continueButtonText}>ادامه</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </LinearGradient>
    </>
  );
};

const CareerFeature = ({ icon, title, description, color, gradientColors }) => (
  <View style={styles.careerFeature}>
    <LinearGradient
      colors={gradientColors}
      style={styles.careerIconContainer}
    >
      <MaterialCommunityIcons name={icon} size={24} color="white" />
    </LinearGradient>
    <View style={styles.careerTextContainer}>
      <Text style={styles.careerTitle}>{title}</Text>
      <Text style={styles.careerDescription}>{description}</Text>
    </View>
    <View style={[styles.featureAccent, { backgroundColor: color + "20" }]} />
  </View>
);

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight + 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 35,
  },
  titleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  headerIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Yekan_Bakh_Bold",
    color: "white",
    marginHorizontal: 15,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    textAlign: "center",
  },
  mainCard: {
    borderRadius: 35,
    overflow: "hidden",
    marginBottom: 35,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  cardGradient: {
    padding: 30,
    position: "relative",
  },
  mainIconContainer: {
    alignItems: "center",
    marginBottom: 25,
    position: "relative",
  },
  mainIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
  },
  sparkleContainer: {
    position: "absolute",
    top: -10,
    right: -10,
  },
  sparkle1: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  sparkle2: {
    position: "absolute",
    top: 20,
    right: 25,
  },
  mainDescription: {
    fontSize: 17,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 30,
    paddingHorizontal: 5,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  careerContainer: {
    marginTop: 15,
  },
  careerFeature: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderRadius: 22,
    marginBottom: 14,
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  careerIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  careerTextContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  careerTitle: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#ffffff",
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    textAlign: "right",
  },
  careerDescription: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    textAlign: "right",
  },
  featureAccent: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
  },
  linkSection: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "rgba(63, 81, 181, 0.2)",
    padding: 22,
    borderRadius: 22,
    marginTop: 25,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  linkIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 15,
  },
  linkText: {
    fontSize: 15,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#ffffff",
    flex: 1,
    textAlign: "right",
    lineHeight: 22,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  buttonsContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  primaryButton: {
    width: "92%",
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 20,
    marginBottom: 18,
  },
  buttonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 35,
  },
  primaryButtonText: {
    fontSize: 19,
    fontFamily: "Yekan_Bakh_Bold",
    color: "white",
    marginLeft: 12,
  },
  continueButton: {
    width: "70%",
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 30,
  },
  continueButtonText: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: "white",
    marginLeft: 10,
  },
});

export default CareerScreen;