import React, { useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Animated,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import Screen from "../components/Screen";
import AppButton from "../components/Button";
import { Formik } from "formik";
import AppTextInput from "../components/TextInput";
import colors from "../config/colors";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AppText from "../components/Text";
import * as Yup from "yup";
import { MaterialIcons } from "@expo/vector-icons";
import { toPersianDigits } from "../utils/converters";
import { AppNavigationProp } from "../Navigators";
import { useMemberGroups } from "../config/useApi";
import { MemberGroup } from "../config/type";
import Toast from "../components/Toast";
import ChipsUI from '../components/ChipsUI';
import appConfig from '../config/config';

interface IFormData {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  selectedGroups: number[];
}

const SignupScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<IFormData>({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    selectedGroups: [],
  });
  const [tempPersonalData, setTempPersonalData] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
  });

  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const otpInputs = useRef<TextInput[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupToken, setSignupToken] = useState<string>(""); // Store signup token

  // Timer states
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  const { data: memberGroups, loading: groupsLoading, error: groupsError, refetch } = useMemberGroups();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const iconFadeAnim = useRef(new Animated.Value(0)).current;
  const iconSlideAnim = useRef(new Animated.Value(-50)).current;
  const formFadeAnim = useRef(new Animated.Value(0)).current;
  const formSlideAnim = useRef(new Animated.Value(40)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
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

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Clear OTP when moving to step 3
  useEffect(() => {
    if (currentStep === 3) {
      setOtp(["", "", "", "", ""]);
      // Start timer when entering OTP step
      startResendTimer();
    }
  }, [currentStep]);

  // Show toast when there's an error loading groups
  useEffect(() => {
    if (groupsError) {
      setToastMessage("خطا در بارگذاری گروه‌ها: " + groupsError);
      setToastType('error');
      setToastVisible(true);
    }
  }, [groupsError]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const validationSchemaStep2 = Yup.object().shape({
    otp: Yup.string()
      .length(5, "کد باید ۵ رقمی باشد")
      .required("کد تأیید وارد نشده است"),
  });

  // Timer functions
  const startResendTimer = (duration: number = 120) => { // 2 minutes default
    setResendTimer(duration);
    setCanResend(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${toPersianDigits(minutes.toString().padStart(2, '0'))}:${toPersianDigits(remainingSeconds.toString().padStart(2, '0'))}`;
  };

  // Step 2: Send signup data with groups and get token
  const sendSignupFirstStep = async (userData: IFormData) => {
    try {
      setIsSubmitting(true);

      const response = await fetch(`${appConfig.mobileApi}MobileAccount/SignupFirstStep`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FirstName: userData.firstName,
          LastName: userData.lastName,
          Mobile: userData.mobileNumber,
          MemberGroupIdList: userData.selectedGroups // گروه‌ها در مرحله ۲ ارسال می‌شوند
        }),
      });

      const result = await response.json();
      console.log('SignupFirstStep API Response:', response.status, result);

      if (response.status >= 200 && response.status < 300 && result.SignupToken) {
        // Success - store token and form data
        setSignupToken(result.SignupToken);
        setFormData(userData);

        // Automatically proceed to send SMS
        await sendSignupOTPSMS(result.SignupToken);

      } else {
        // Error response
        let errorMessage = "خطا در ارسال اطلاعات";
        if (result.Message) {
          errorMessage = result.Message;
        } else if (result.errors && result.errors.Mobile && result.errors.Mobile[0]) {
          errorMessage = result.errors.Mobile[0];
        } else if (result.title) {
          errorMessage = result.title;
        }

        setToastMessage(errorMessage);
        setToastType('error');
        setToastVisible(true);

        if (result.RedirectToLogin === true) {
          setTimeout(() => {
            navigation.navigate("Login");
          }, 1000);
        }
      }
    } catch (error) {
      console.error('SignupFirstStep error:', error);
      setToastMessage("خطا در اتصال به سرور");
      setToastType('error');
      setToastVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Send SMS OTP
  const sendSignupOTPSMS = async (token: string) => {
    try {
      const response = await fetch(
        `${appConfig.mobileApi}MobileAccount/SendSignupOTPSMS?signupToken=${encodeURIComponent(token)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();
      console.log('SendSignupOTPSMS API Response:', response.status, result);

      if (response.status >= 200 && response.status < 300) {
        setToastMessage(result.Message || "کد پیامکی با موفقیت ارسال شد");
        setToastType('success');
        setToastVisible(true);

        // Move to step 3 for OTP verification
        setTimeout(() => {
          setCurrentStep(3);
        }, 1000);
      } else {
        setToastMessage(result.Message || "خطا در ارسال پیامک");
        setToastType('error');
        setToastVisible(true);
      }
    } catch (error) {
      console.error('SendSignupOTPSMS error:', error);
      setToastMessage("خطا در ارسال پیامک");
      setToastType('error');
      setToastVisible(true);
    }
  };

  // Step 3: Validate OTP
  const validateSignupOTP = async (otpCode: string) => {
    try {
      setIsSubmitting(true);

      const response = await fetch(`${appConfig.mobileApi}MobileAccount/ValidateSignupOTP`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          SignupToken: signupToken,
          OTP: otpCode,
        }),
      });

      const result = await response.json();
      console.log('ValidateSignupOTP API Response:', response.status, result);

      if (response.status >= 200 && response.status < 300) {
        setToastMessage(result.Message || "کد با موفقیت تایید شد");
        setToastType('success');
        setToastVisible(true);

        // Clear timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }

        // Move to step 4 (final success step)
        setTimeout(() => {
          setCurrentStep(4);
        }, 1000);
      } else {
        setToastMessage(result.Message || "کد وارد شده اشتباه است");
        setToastType('error');
        setToastVisible(true);
      }
    } catch (error) {
      console.error('ValidateSignupOTP error:', error);
      setToastMessage("خطا در تایید کد");
      setToastType('error');
      setToastVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle step 1 (personal data) - just store temporarily and move to step 2
  const handleStep1Submit = (values: Omit<IFormData, "selectedGroups">) => {
    setTempPersonalData(values);
    setCurrentStep(2);
  };

  // Handle step 2 (groups + API call)
  const handleStep2Submit = async () => {
    if (formData.selectedGroups.length === 0) {
      setToastMessage("لطفاً حداقل یک گروه انتخاب کنید");
      setToastType('error');
      setToastVisible(true);
      return;
    }

    const submitData: IFormData = {
      ...tempPersonalData,
      selectedGroups: formData.selectedGroups,
    };

    await sendSignupFirstStep(submitData);
  };

  const handleOtpChange = (text: string, index: number) => {
    if (/^\d?$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      if (text && index < 4) {
        otpInputs.current[index + 1].focus();
      }
    }
  };

  const handleOtpSubmit = () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 5) {
      setToastMessage("لطفاً کد ۵ رقمی را کامل وارد کنید");
      setToastType('error');
      setToastVisible(true);
      return;
    }

    validateSignupOTP(otpCode);
  };

  const handleOtpKeyPress = (e: any, index: number, currentValue: string) => {
    if (e.nativeEvent.key === "Backspace" && !currentValue && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  const toggleGroup = (groupId: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedGroups: prev.selectedGroups.includes(groupId)
        ? prev.selectedGroups.filter((id) => id !== groupId)
        : [...prev.selectedGroups, groupId],
    }));
  };

  const hideToast = () => {
    setToastVisible(false);
  };

  // Resend OTP function with timer restart
  const resendOTP = async () => {
    if (signupToken && canResend) {
      setCanResend(false);
      await sendSignupOTPSMS(signupToken);
      // Restart timer after successful resend
      startResendTimer(120); // 2 minutes
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={[styles.stepContainer]}>
        <View
          style={[styles.stepCircle, currentStep >= 1 && styles.activeStep]}
        >
          <AppText
            style={[
              styles.stepNumber,
              currentStep >= 1 && styles.activeStepText,
            ]}
          >
            ۱
          </AppText>
        </View>
        <Text style={[styles.stepLabel]}>اطلاعات شخصی</Text>
      </View>

      <View
        style={[styles.stepLine, currentStep >= 2 && styles.activeStepLine]}
      />

      <View style={styles.stepContainer}>
        <View
          style={[styles.stepCircle, currentStep >= 2 && styles.activeStep]}
        >
          <Text
            style={[
              styles.stepNumber,
              currentStep >= 2 && styles.activeStepText,
            ]}
          >
            ۲
          </Text>
        </View>
        <Text style={styles.stepLabel}>انتخاب گروه</Text>
      </View>

      <View
        style={[styles.stepLine, currentStep >= 3 && styles.activeStepLine]}
      />

      <View style={styles.stepContainer}>
        <View
          style={[styles.stepCircle, currentStep >= 3 && styles.activeStep]}
        >
          <Text
            style={[
              styles.stepNumber,
              currentStep >= 3 && styles.activeStepText,
            ]}
          >
            ۳
          </Text>
        </View>
        <Text style={styles.stepLabel}>تأیید تلفن همراه</Text>
      </View>

      


    </View>
  );

  const renderStep1 = () => (
    <Formik
      initialValues={{
        firstName: tempPersonalData.firstName,
        lastName: tempPersonalData.lastName,
        mobileNumber: tempPersonalData.mobileNumber,
      }}
      onSubmit={(values) => {
        if (!values.firstName) {
          setToastMessage("نام وارد نشده است");
          setToastType('error');
          setToastVisible(true);
          return;
        }
        if (!values.lastName) {
          setToastMessage("نام خانوادگی وارد نشده است");
          setToastType('error');
          setToastVisible(true);
          return;
        }
        if (!values.mobileNumber) {
          setToastMessage("شماره موبایل وارد نشده است");
          setToastType('error');
          setToastVisible(true);
          return;
        }
        if (!/^09\d{9}$/.test(values.mobileNumber)) {
          setToastMessage("شماره موبایل باید با 09 شروع شده و 11 رقم باشد");
          setToastType('error');
          setToastVisible(true);
          return;
        }

        handleStep1Submit(values);
      }}
    >
      {({ handleChange, handleSubmit, values }) => (
        <View>
          <AppTextInput
            autoCapitalize="words"
            autoCorrect={false}
            icon="person"
            name="firstName"
            placeholder="نام"
            value={values.firstName}
            onChangeText={handleChange("firstName")}
          />

          <AppTextInput
            autoCapitalize="words"
            autoCorrect={false}
            icon="person"
            name="lastName"
            placeholder="نام خانوادگی"
            value={values.lastName}
            onChangeText={handleChange("lastName")}
          />

          <AppTextInput
            autoCapitalize="none"
            autoCorrect={false}
            icon="phone-android"
            keyboardType="phone-pad"
            name="mobileNumber"
            placeholder="شماره موبایل"
            value={values.mobileNumber}
            onChangeText={handleChange("mobileNumber")}
            maxLength={11}
          />

          <AppButton
            style={styles.nextButton}
            title="مرحله بعد"
            onPress={handleSubmit}
          />

          <View style={styles.footerContainer}>
            <AppText style={styles.footerText}>
              حساب کاربری دارید؟{" "}
            </AppText>
            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
            >
              <AppText style={styles.signupText}>وارد شوید</AppText>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Formik>
  );

  const renderStep2 = () => (
    <View>
      <AppText style={styles.sectionTitle}>انتخاب گروه‌ها</AppText>
      <AppText style={styles.sectionSubTitle}>
        جزء کدام یک از گروه‌های زیر هستید؟ می‌توانید چند گزینه انتخاب کنید
      </AppText>

      {groupsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText style={styles.loadingText}>در حال بارگذاری گروه‌ها...</AppText>
        </View>
      ) : groupsError ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#9e9e9e" />
          <AppText style={styles.errorText}>خطا در بارگذاری گروه‌ها</AppText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={refetch}
          >
            <MaterialIcons name="refresh" size={20} color={colors.white} />
            <AppText style={styles.retryButtonText}>تلاش مجدد</AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.groupsContainer}>
          <ChipsUI
            groups={memberGroups}
            selectedGroups={formData.selectedGroups}
            onToggleGroup={toggleGroup}
            allowMultipleSelection={true}
          />
        </View>
      )}

      <View style={styles.buttonContainer}>
        <AppButton
          style={[styles.backButton, { marginLeft: 10, width: "48%" }]}
          title="مرحله قبل"
          color={colors.medium}
          onPress={() => setCurrentStep(1)}
        />

        <AppButton
          style={[styles.submitButton, { width: "48%" }]}
          title={isSubmitting ? "در حال ارسال..." : "ادامه"}
          onPress={handleStep2Submit}
          disabled={isSubmitting}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <AppText style={styles.sectionTitle}>کد تأیید را وارد کنید</AppText>
      <AppText style={styles.sectionSubTitle}>
        کد ۵ رقمی ارسال شده به شماره {formData.mobileNumber} را وارد کنید
      </AppText>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (otpInputs.current[index] = ref!)}
            style={styles.otpInput}
            value={digit}
            onChangeText={(text) => handleOtpChange(text, index)}
            onKeyPress={(e) => handleOtpKeyPress(e, index, digit)}
            keyboardType="numeric"
            maxLength={1}
            textAlign="center"
            autoFocus={index === 0}
          />
        ))}
      </View>

      {/* Resend OTP with timer */}
      <View style={styles.resendContainer}>
        {canResend ? (
          <TouchableOpacity onPress={resendOTP}>
            <AppText style={styles.resendText}>ارسال مجدد کد</AppText>
          </TouchableOpacity>
        ) : (
          <View style={styles.timerContainer}>
            <AppText style={styles.timerText}>
              ارسال مجدد کد تا {formatTime(resendTimer)}
            </AppText>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <AppButton
          style={[styles.backButton, { marginLeft: 10, width: "48%" }]}
          title="تغییر شماره"
          color={colors.medium}
          onPress={() => setCurrentStep(1)}
        />

        <AppButton
          style={[styles.submitButton, { width: "48%" }]}
          title={isSubmitting ? "در حال تایید..." : "تایید کد"}
          onPress={handleOtpSubmit}
          disabled={isSubmitting}
        />
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View>
      <AppText style={styles.sectionTitle}>
        ثبت نام با موفقیت انجام شد!
      </AppText>
      <AppText style={styles.sectionSubTitle}>
        اکنون می‌توانید از حساب کاربری خود استفاده کنید
      </AppText>

      <View style={styles.successContainer}>
        <MaterialIcons name="check-circle" size={80} color={colors.success} />
        <AppText style={styles.successText}>
          خوش آمدید {formData.firstName} {formData.lastName}
        </AppText>
        <AppText style={styles.successSubText}>
          شماره موبایل شما با موفقیت تایید شد
        </AppText>


      </View>

      <AppButton
        style={styles.finalButton}
        title="ورود به برنامه"
        onPress={() => navigation.navigate("Login")}
      />
    </View>
  );

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
                <MaterialIcons name="person-add" color={colors.white} size={65} />
              </View>
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
              <ScrollView
                style={styles.contentScrollContainer}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
              >
                <AppText style={styles.logingText}>ثبت نام</AppText>

                {renderStepIndicator()}
                {currentStep === 1
                  ? renderStep1()
                  : currentStep === 2
                    ? renderStep2()
                    : currentStep === 3
                      ? renderStep3()
                      : renderStep4()}
              </ScrollView>
            </Animated.View>
          </View>
        </Screen>
      </LinearGradient>

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={hideToast}
        duration={3000}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // Background and Layout
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
    flex: 1,
    padding: 10,
    justifyContent: "center",
    fontFamily: "Yekan_Bakh_Regular",
    backgroundColor: 'transparent',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 10,
    justifyContent: "center",
    minHeight: '100%',
  },
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },

  // Login Box and Glassmorphism
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
  contentScrollContainer: {
    position: 'relative',
    zIndex: 2,
  },
  contentContainer: {
    backgroundColor: 'transparent',
    paddingBottom: 20,
    position: 'relative',
    zIndex: 2,
  },

  // Icon Styles
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: -20,
    zIndex: 1000,
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

  // Typography
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

  // Step Indicator Styles
  stepIndicator: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    flexWrap: "wrap",
  },
  stepContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 2,
  },
  stepCircle: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: colors.light,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.medium,
  },
  activeStep: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepNumber: {
    fontSize: 14,
    color: colors.medium,
    fontFamily: "Yekan_Bakh_Bold",
  },
  activeStepText: {
    color: colors.white,
  },
  stepLabel: {
    marginTop: 8,
    fontSize: 10,
    color: colors.medium,
    fontFamily: "Yekan_Bakh_Regular",
    textAlign: "center",
    maxWidth: 60,
  },
  stepLine: {
    width: 25,
    height: 2,
    backgroundColor: colors.light,
    marginHorizontal: 3,
    marginTop: -20,
  },
  activeStepLine: {
    backgroundColor: colors.primary,
  },

  // Step Content Styles
  sectionTitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 5,
    color: colors.dark,
    fontFamily: "Yekan_Bakh_Bold",
  },
  sectionSubTitle: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    textAlign: "center",
    color: "#7e7e7e",
    marginBottom: 20,
  },

  // Resend and Timer Styles
  resendContainer: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  resendText: {
    fontSize: 14,
    color: colors.primary,
    fontFamily: "Yekan_Bakh_Regular",
    textDecorationLine: 'underline',
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 14,
    color: colors.medium,
    fontFamily: "Yekan_Bakh_Regular",
    textAlign: 'center',
  },

  // Groups Section
  groupsSection: {
    marginBottom: 20,
  },
  groupsContainer: {
    marginBottom: 20,
  },

  // Loading and Error States
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.medium,
    fontFamily: "Yekan_Bakh_Regular",
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    width: '100%',
    marginVertical: 20,
  },
  errorText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#9e9e9e',
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  retryButtonText: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.white,
    marginRight: 8,
  },

  // Button Styles
  nextButton: {
    marginTop: 20,
  },
  buttonContainer: {
    flexDirection: "row-reverse",
    marginTop: 20,
  },
  backButton: {
    backgroundColor: colors.medium,
  },
  submitButton: {},
  finalButton: {
    marginTop: 30,
  },

  // Footer Styles (Login Link)
  footerContainer: {
    marginTop: 20,
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: colors.medium,
  },
  signupText: {
    fontSize: 16,
    color: colors.primary,
    textDecorationLine: "underline",
    fontFamily: "Yekan_Bakh_Regular",
  },

  // OTP Input Styles
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: colors.medium,
    borderRadius: 10,
    textAlign: "center",
    fontSize: 20,
    backgroundColor: colors.white,
    fontFamily: "Yekan_Bakh_Regular",
  },

  // Success Page Styles
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  successText: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.dark,
    textAlign: 'center',
    marginTop: 20,
  },
  successSubText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: colors.medium,
    textAlign: 'center',
    marginTop: 10,
  },
  successGroupText: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Regular",
    color: colors.success,
    textAlign: 'center',
    marginTop: 5,
  },
});

export default SignupScreen; 