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
  SafeAreaView,
  Dimensions,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
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
import Screen from "../components/Screen";
import OTPInput from "../components/OTPInput";

const { height: screenHeight } = Dimensions.get('window');

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

  const [otp, setOtp] = useState("");
  const otpInputs = useRef<TextInput[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupToken, setSignupToken] = useState<string>("");

  // Timer states
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  const { data: memberGroups, loading: groupsLoading, error: groupsError, refetch } = useMemberGroups();

  // Animation values
  const iconFadeAnim = useRef(new Animated.Value(0)).current;
  const iconSlideAnim = useRef(new Animated.Value(-30)).current;
  const formFadeAnim = useRef(new Animated.Value(0)).current;
  const formSlideAnim = useRef(new Animated.Value(30)).current;
  const backButtonAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Sequential animations for better effect
    Animated.sequence([
      // Back button appears first
      Animated.timing(backButtonAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Icon appears
      Animated.parallel([
        Animated.timing(iconFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(iconSlideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // Form appears
      Animated.parallel([
        Animated.timing(formFadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(formSlideAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Continuous pulse animation for icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Clear OTP when moving to step 3
  useEffect(() => {
    if (currentStep === 3) {
      setOtp(""); // تغییر از array به string
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

  const validationSchemaStep2 = Yup.object().shape({
    otp: Yup.string()
      .length(5, "کد باید ۵ رقمی باشد")
      .required("کد تأیید وارد نشده است"),
  });

  // Timer functions
  const startResendTimer = (duration: number = 120) => {
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
          MemberGroupIdList: userData.selectedGroups
        }),
      });

      const result = await response.json();
      console.log('SignupFirstStep API Response:', response.status, result);

      if (response.status >= 200 && response.status < 300 && result.SignupToken) {
        setSignupToken(result.SignupToken);
        setFormData(userData);
        await sendSignupOTPSMS(result.SignupToken);
      } else {
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

        if (timerRef.current) {
          clearInterval(timerRef.current);
        }

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

  const handleStep1Submit = (values: Omit<IFormData, "selectedGroups">) => {
    setTempPersonalData(values);
    setCurrentStep(2);
  };

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

  const handleOtpChange = (code) => {
    setOtp(code);
  };

  const handleOtpSubmit = () => {
    if (otp.length !== 5) {
      setToastMessage("لطفاً کد ۵ رقمی را کامل وارد کنید");
      setToastType('error');
      setToastVisible(true);
      return;
    }

    validateSignupOTP(otp);
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

  const resendOTP = async () => {
    if (signupToken && canResend) {
      setCanResend(false);
      await sendSignupOTPSMS(signupToken);
      startResendTimer(120);
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
                sortType="length-asc" 
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

      {/* استفاده از کامپوننت OTP جدید */}
      <View style={styles.otpWrapper}>
        <OTPInput
          onCodeChange={handleOtpChange}
          code={otp}
          length={5}
        />
      </View>

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
          disabled={isSubmitting || otp.length !== 5}
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
      {/* Background */}
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
          {/* Toast خارج از ScrollView */}
          <Toast
            visible={toastVisible}
            message={toastMessage}
            type={toastType}
            onHide={hideToast}
            duration={3000}
          />

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* آیکون */}
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
                  <MaterialIcons name="person-add" color={colors.white} size={50} />
                </View>
                {/* Decorative ring */}
                <View style={styles.iconRing} />
              </LinearGradient>
            </Animated.View>

            {/* محتوای اصلی */}
            <Animated.View
              style={[
                styles.formBox,
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
                <AppText style={styles.titleText}>ثبت نام</AppText>

                {renderStepIndicator()}

                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}
              </View>
            </Animated.View>
          </ScrollView>
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
    backgroundColor: 'transparent',
  },

  // Icon Section
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: -110,
    marginTop: 50,
    zIndex: 1000,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",

  },
  iconInnerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 206, 232, 0.15)',
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: 'rgba(255, 206, 232, 0.4)',
    zIndex: 99,
  },
  iconRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 206, 232, 0.3)',
    borderStyle: 'dashed',
  },

  // Form Box
  formBox: {
    borderRadius: 25,
    padding: 25,
    margin: 5,
    marginTop: 65,
    marginBottom: 80,
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

    zIndex: 1,
  },
  contentContainer: {
    position: 'relative',
    zIndex: 1,
  },

  // Typography
  titleText: {
    fontSize: 30,
    marginTop: 35,
    textAlign: "center",
    marginBottom: 30,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.primary,
    textShadowColor: 'rgba(255, 206, 232, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Step Indicator
  stepIndicator: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    flexWrap: 'wrap',
  },
  stepContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  stepCircle: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: colors.light,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontFamily: 'Yekan_Bakh_Bold',
  },
  activeStepText: {
    color: colors.white,
  },
  stepLabel: {
    marginTop: 8,
    fontSize: 10,
    color: colors.medium,
    fontFamily: 'Yekan_Bakh_Regular',
    textAlign: 'center',
    maxWidth: 70,
  },
  stepLine: {
    width: 30,
    height: 2,
    backgroundColor: colors.light,
    marginHorizontal: 5,
    marginTop: -20,
  },
  activeStepLine: {
    backgroundColor: colors.primary,
  },

  // Step Content
  sectionTitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
    color: colors.dark,
    fontFamily: 'Yekan_Bakh_Bold',
  },
  sectionSubTitle: {
    fontSize: 14,
    fontFamily: 'Yekan_Bakh_Regular',
    textAlign: 'center',
    color: '#7e7e7e',
    marginBottom: 25,
    lineHeight: 22,
  },

  // Groups
  groupsContainer: {
    marginBottom: 25,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: colors.medium,
    fontFamily: 'Yekan_Bakh_Regular',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Yekan_Bakh_Bold',
    color: '#9e9e9e',
    marginTop: 15,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 15,
  },
  retryButtonText: {
    fontSize: 12,
    fontFamily: 'Yekan_Bakh_Bold',
    color: colors.white,
    marginRight: 8,
  },

  // OTP
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  otpInput: {
    width: 50,
    height: 55,
    borderWidth: 2,
    borderColor: colors.medium,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    backgroundColor: colors.white,
    fontFamily: 'Yekan_Bakh_Regular',
  },

  // Resend
  resendContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  resendText: {
    fontSize: 14,
    color: colors.primary,
    fontFamily: 'Yekan_Bakh_Regular',
    textDecorationLine: 'underline',
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
    color: colors.medium,
    fontFamily: 'Yekan_Bakh_Regular',
  },

  // Buttons
  nextButton: {
    marginTop: 25,
  },
  buttonContainer: {
    flexDirection: 'row-reverse',
    marginTop: 25,
    gap: 10,
  },
  backButton: {
    flex: 1,
    backgroundColor: colors.medium,
  },
  submitButton: {
    flex: 1,
  },
  finalButton: {
    marginTop: 30,
  },

  // Footer
  footerContainer: {
    marginTop: 25,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    fontFamily: 'Yekan_Bakh_Regular',
    color: colors.medium,
  },
  signupText: {
    fontSize: 16,
    color: colors.primary,
    textDecorationLine: 'underline',
    fontFamily: 'Yekan_Bakh_Regular',
  },

  // Success
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successText: {
    fontSize: 18,
    fontFamily: 'Yekan_Bakh_Bold',
    color: colors.dark,
    textAlign: 'center',
    marginTop: 20,
  },
  successSubText: {
    fontSize: 14,
    fontFamily: 'Yekan_Bakh_Regular',
    color: colors.medium,
    textAlign: 'center',
    marginTop: 10,
  },
  otpWrapper: {
    marginBottom: 25,
    marginTop: 10,
  },
});

export default SignupScreen;