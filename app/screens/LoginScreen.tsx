import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Animated,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import Screen from "../components/Screen";
import AppButton from "../components/Button";
import { Formik } from "formik";
import AppTextInput from "../components/TextInput";
import colors from "../config/colors";
import { useNavigation } from "@react-navigation/native";
import * as Yup from "yup";
import AppText from "../components/Text";
import { AppNavigationProp } from "../Navigators";
import { MaterialIcons } from "@expo/vector-icons";
import Toast from "../components/Toast";
import AuthService from "../services/AuthService";
import { useIntro } from '../contexts/IntroContext';


const validationSchema = Yup.object().shape({
  mobileNumber: Yup.string()
    .matches(/^09\d{9}$/, "شماره موبایل معتبر نیست")
    .required("شماره موبایل وارد نشده است"),
});

const LoginScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "info" });

  // Animation values
  const iconFadeAnim = useRef(new Animated.Value(0)).current;
  const iconSlideAnim = useRef(new Animated.Value(-50)).current;
  const formFadeAnim = useRef(new Animated.Value(0)).current;
  const formSlideAnim = useRef(new Animated.Value(40)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const { completeIntro } = useIntro();

  useEffect(() => {
    // Sequential animations for better effect
    Animated.sequence([
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

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ visible: false, message: "", type: "info" });
  };

  const handleSendOTP = async (values) => {
    setIsLoading(true);

    const result = await AuthService.sendOTP(values.mobileNumber);

    if (result.success) {
      showToast(result.message, "success");
      // Navigate to OTP screen after a short delay
      setTimeout(() => {
        navigation.navigate("OTP", { mobileNumber: values.mobileNumber });
      }, 1000);
    } else {
      showToast(result.message, "error");
    }

    setIsLoading(false);
  };
  const handleGoToSignup = async () => {
    try {
      await completeIntro();
      navigation.navigate("Signup");
    } catch (error) {
      console.error('Error completing intro:', error);
      // Fallback - navigate anyway if intro completion fails
      navigation.navigate("Signup");
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.backgroundContainer}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

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
                <MaterialIcons name="phone-android" color={colors.white} size={65} />
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
                styles.loginBox,
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
                <AppText style={styles.logingText}>ورود به حساب کاربری</AppText>
                <AppText style={styles.description}>
                  شماره موبایل خود را وارد کنید تا کد تایید برای شما ارسال شود
                </AppText>

                <Formik
                  initialValues={{ mobileNumber: "" }}
                  onSubmit={handleSendOTP}
                  validationSchema={validationSchema}
                >
                  {({ handleChange, handleSubmit, errors, values }) => (
                    <>
                      <View>
                        <AppTextInput
                          autoCapitalize="none"
                          autoCorrect={false}
                          icon="phone-android"
                          keyboardType="phone-pad"
                          name="mobileNumber"
                          placeholder="شماره موبایل"
                          value={values.mobileNumber}
                          onChangeText={handleChange("mobileNumber")}
                        />
                        {errors.mobileNumber && (
                          <AppText style={styles.errorText}>
                            {errors.mobileNumber}
                          </AppText>
                        )}
                        <AppButton
                          style={styles.loginButton}
                          title={isLoading ? "در حال ارسال..." : "ارسال کد تایید"}
                          onPress={handleSubmit}
                          disabled={isLoading}
                        />
                        <View style={styles.footerContainer}>
                          <AppText style={styles.footerText}>
                            حساب کاربری ندارید؟{" "}
                          </AppText>
                          <TouchableOpacity
                            onPress={() => navigation.navigate("Signup")}
                          >
                            <AppText style={styles.signupText}>ثبت نام کنید</AppText>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </>
                  )}
                </Formik>
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
    fontFamily: "Yekan_Bakh_Regular",
    backgroundColor: 'transparent',
  },
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loginBox: {
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
  loginButton: {
    marginTop: 10,
  },
  logingText: {
    marginTop: 50,
    fontSize: 30,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.primary,
    textShadowColor: 'rgba(255, 206, 232, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    fontFamily: "Yekan_Bakh_Regular",
    color: colors.medium,
    lineHeight: 24,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    marginTop: 5,
    textAlign: 'center',
  },
  footerContainer: {
    marginTop: 20,
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
  },
  signupText: {
    fontSize: 16,
    color: colors.primary,
    textDecorationLine: "underline",
  },
});

export default LoginScreen;