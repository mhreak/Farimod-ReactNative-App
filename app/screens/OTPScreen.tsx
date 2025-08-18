import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Animated,
  BackHandler,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import Screen from "../components/Screen";
import AppButton from "../components/Button";
import { Formik } from "formik";
import colors from "../config/colors";
import { useNavigation, useRoute, useFocusEffect, CommonActions } from "@react-navigation/native";
import * as Yup from "yup";
import AppText from "../components/Text";
import { AppNavigationProp } from "../Navigators";
import { MaterialIcons } from "@expo/vector-icons";
import Toast from "../components/Toast";
import OTPInput from "../components/OTPInput";
import AuthService from "../services/AuthService";
import { useAuth } from "../contexts/AuthContext";

const validationSchema = Yup.object().shape({
  otp: Yup.string()
    .length(5, "کد تایید باید 5 رقم باشد")
    .required("کد تایید وارد نشده است"),
});

const OTPScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { mobileNumber } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "info" });
  const [countdown, setCountdown] = useState(120); // 2 minutes

  // استفاده از AuthContext
  const { login } = useAuth();

  // Animation values
  const iconFadeAnim = useRef(new Animated.Value(0)).current;
  const iconSlideAnim = useRef(new Animated.Value(-50)).current;
  const formFadeAnim = useRef(new Animated.Value(0)).current;
  const formSlideAnim = useRef(new Animated.Value(40)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  
  // Handle back button - Fixed version
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription?.remove();
    }, [navigation])
  );

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

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ visible: false, message: "", type: "info" });
  };

  const handleVerifyOTP = async (values) => {
    setIsLoading(true);

    try {
      const result = await AuthService.verifyOTP(mobileNumber, values.otp);

      if (result.success) {
        // استفاده از login function از AuthContext
        await login(result.data);

        showToast(result.message, "success");

        // Navigate to main tabs
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "MainTabs" }],
          })
        );
      } else {
        showToast(result.message, "error");
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      showToast('خطا در اتصال به سرور', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown === 0) {
      setIsLoading(true);
      const result = await AuthService.sendOTP(mobileNumber);

      if (result.success) {
        setCountdown(120);
        showToast(result.message, "success");
      } else {
        showToast(result.message, "error");
      }

      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                <MaterialIcons name="security" color={colors.white} size={65} />
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
                <AppText style={styles.logingText}>تایید کد یکبار مصرف</AppText>
                <AppText style={styles.otpDescription}>
                  کد تایید ۵ رقمی به شماره {mobileNumber} ارسال شد
                </AppText>

                <Formik
                  initialValues={{ otp: "" }}
                  onSubmit={handleVerifyOTP}
                  validationSchema={validationSchema}
                >
                  {({ handleSubmit, errors, setFieldValue, values }) => (
                    <>
                      <View style={styles.otpContainer}>
                        <OTPInput
                          onCodeChange={(code) => setFieldValue("otp", code)}
                          code={values.otp}
                        />
                        {errors.otp && (
                          <AppText style={styles.errorText}>
                            {errors.otp}
                          </AppText>
                        )}
                      </View>

                      <AppButton
                        style={styles.loginButton}
                        title={isLoading ? "در حال بررسی..." : "تایید"}
                        onPress={handleSubmit}
                        disabled={isLoading || values.otp.length !== 5}
                      />

                      <View style={styles.resendContainer}>
                        {countdown > 0 ? (
                          <AppText style={styles.countdownText}>
                            ارسال مجدد کد در {formatTime(countdown)}
                          </AppText>
                        ) : (
                          <TouchableOpacity
                            onPress={handleResendOTP}
                            disabled={isLoading}
                          >
                            <AppText style={[
                              styles.resendText,
                              isLoading && styles.disabledText
                            ]}>
                              ارسال مجدد کد تایید
                            </AppText>
                          </TouchableOpacity>
                        )}
                      </View>

                      <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                      >
                        <MaterialIcons name="arrow-forward" size={20} color={colors.primary} />
                        <AppText style={styles.backText}>تغییر شماره موبایل</AppText>
                      </TouchableOpacity>
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
    marginTop: 20,
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
  otpDescription: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    fontFamily: "Yekan_Bakh_Regular",
    color: colors.medium,
    lineHeight: 24,
  },
  otpContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    marginTop: 10,
    textAlign: 'center',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  countdownText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: colors.medium,
  },
  resendText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: colors.primary,
    textDecorationLine: "underline",
  },
  disabledText: {
    color: colors.medium,
    textDecorationLine: "none",
  },
  backButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  backText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: colors.primary,
    marginRight: 8,
  },
});

export default OTPScreen;