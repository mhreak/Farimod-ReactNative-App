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
import appConfig from '../config/config'; // Import config

interface IFormData {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  selectedGroups: number[];
}

const SignupScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<IFormData>({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    selectedGroups: [],
  });

  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const otpInputs = useRef<TextInput[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for API calls

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  // Fetch member groups from API
  const { data: memberGroups, loading: groupsLoading, error: groupsError, refetch } = useMemberGroups();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const iconFadeAnim = useRef(new Animated.Value(0)).current;
  const iconSlideAnim = useRef(new Animated.Value(-50)).current;
  const formFadeAnim = useRef(new Animated.Value(0)).current;
  const formSlideAnim = useRef(new Animated.Value(40)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start all animations immediately
    Animated.parallel([
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

  // Clear OTP when moving to step 2
  useEffect(() => {
    if (currentStep === 2) {
      setOtp(["", "", "", "", ""]);
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

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const validationSchemaStep2 = Yup.object().shape({
    otp: Yup.string()
      .length(5, "کد باید ۵ رقمی باشد")
      .required("کد تأیید وارد نشده است"),
  });

  // API call function for sending registration data
  const sendRegistrationData = async (userData: Omit<IFormData, "selectedGroups">) => {
    try {
      setIsSubmitting(true);

      const response = await fetch(`${appConfig.mobileApi}MobileAccount/SignUp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FirstName: userData.firstName,
          LastName: userData.lastName,
          Mobile: userData.mobileNumber,
        }),
      });

      const result = await response.json();
      console.log('API Response:', response.status, result);

      if (response.status >= 200 && response.status < 300) {
        // Success response
        console.log('Success - showing toast');
        setToastMessage(result.Message || "عملیات با موفقیت انجام شد");
        setToastType('success');
        setToastVisible(true);

        // Save form data and move to next step
        setFormData((prev) => ({
          ...prev,
          firstName: userData.firstName,
          lastName: userData.lastName,
          mobileNumber: userData.mobileNumber,
        }));

        setTimeout(() => {
          setCurrentStep(2);
        }, 1000);
      } else {
        // Error response - Always show error message
        console.log('Error detected - showing toast');
        let errorMessage = "خطا در ارسال اطلاعات";

        if (result.Message) {
          errorMessage = result.Message;
          console.log('Using result.Message:', errorMessage);
        } else if (result.errors && result.errors.Mobile && result.errors.Mobile[0]) {
          errorMessage = result.errors.Mobile[0];
          console.log('Using validation error:', errorMessage);
        } else if (result.title) {
          errorMessage = result.title;
          console.log('Using result.title:', errorMessage);
        }

        console.log('Setting toast message:', errorMessage);
        setToastMessage(errorMessage);
        setToastType('error');
        setToastVisible(true);

        // Force re-render by logging state
        setTimeout(() => {
          console.log('Toast state after setting:', {
            visible: toastVisible,
            message: toastMessage,
            type: toastType
          });
        }, 100);

        // Check for redirect to login
        if (result.RedirectToLogin === true) {
          setTimeout(() => {
            navigation.navigate("Login");
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      console.log('Network error - showing toast');
      setToastMessage("خطا در اتصال به سرور");
      setToastType('error');
      setToastVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep1Submit = async (values: Omit<IFormData, "selectedGroups">) => {
    await sendRegistrationData(values);
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

    // Here you can add OTP verification API call
    // For now, we simulate successful verification
    setCurrentStep(3);
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

  const handleFinalSubmit = () => {
    if (formData.selectedGroups.length === 0) {
      setToastMessage("لطفاً حداقل یک گروه انتخاب کنید");
      setToastType('warning');
      setToastVisible(true);
      return;
    }

    console.log("Final form data:", formData);

    // Show success message
    setToastMessage("ثبت نام با موفقیت انجام شد");
    setToastType('success');
    setToastVisible(true);

    // Navigate after a short delay
    setTimeout(() => {
      navigation.navigate("MainTabs");
    }, 1500);
  };

  const hideToast = () => {
    setToastVisible(false);
  };

  // Test function for Toast
  const testToast = () => {
    console.log('Test button pressed');
    setToastMessage("تست پیام خطا");
    setToastType('error');
    setToastVisible(true);
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
        <Text style={styles.stepLabel}>تأیید تلفن همراه</Text>
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
        <Text style={styles.stepLabel}>گروه کاربری</Text>
      </View>
    </View>
  );

  const renderStep1 = () => (
    <Formik
      initialValues={{
        firstName: formData.firstName,
        lastName: formData.lastName,
        mobileNumber: formData.mobileNumber,
      }}
      onSubmit={(values, { setFieldError }) => {
        // Validate fields and show toast errors instead of inline errors
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
            title={isSubmitting ? "در حال ارسال..." : "مرحله بعد"}
            onPress={handleSubmit}
            disabled={isSubmitting}
          />

        
        </View>
      )}
    </Formik>
  );

  const renderStep2 = () => (
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

      <View style={styles.buttonContainer}>
        <AppButton
          style={[styles.backButton, { marginLeft: 10, width: "48%" }]}
          title="تغییر شماره"
          color={colors.medium}
          onPress={() => setCurrentStep(1)}
        />

        <AppButton
          style={[styles.submitButton, { width: "48%" }]}
          title="تایید کد"
          onPress={handleOtpSubmit}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <AppText style={styles.sectionTitle}>
        جزء کدام یک از گروه های زیر هستید؟
      </AppText>
      <AppText style={styles.sectionSubTitle}>
        میتوانید چند گزینه انتخاب کنید
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
        <ChipsUI
          groups={memberGroups}
          selectedGroups={formData.selectedGroups}
          onToggleGroup={toggleGroup}
          allowMultipleSelection={true}
        />
      )}

      <View style={styles.buttonContainer}>
        <AppButton
          style={[styles.backButton, { marginLeft: 10, width: "50%" }]}
          title="مرحله قبل"
          color={colors.danger}
          onPress={() => setCurrentStep(2)}
        />

        <AppButton
          style={[styles.submitButton, { width: "50%" }]}
          title="ثبت نام"
          onPress={handleFinalSubmit}
          disabled={groupsLoading}
        />
      </View>
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
              <View style={styles.glassOverlay} />

              <View style={styles.contentContainer}>
                <AppText style={styles.logingText}>ثبت نام</AppText>

                {renderStepIndicator()}
                {currentStep === 1
                  ? renderStep1()
                  : currentStep === 2
                    ? renderStep2()
                    : renderStep3()}
              </View>
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
    zIndex: 0,
  },
  contentContainer: {
    position: 'relative',
    zIndex: 1,
    backgroundColor: 'transparent',
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
    fontSize: 40,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Yekan_Bakh_Bold",
  },

  // Step Indicator Styles
  stepIndicator: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  stepContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    fontSize: 16,
    color: colors.medium,
    fontFamily: "Yekan_Bakh_Bold",
  },
  activeStepText: {
    color: colors.white,
  },
  stepLabel: {
    marginTop: 8,
    fontSize: 12,
    color: colors.medium,
    fontFamily: "Yekan_Bakh_Regular",
  },
  stepLine: {
    width: 50,
    height: 2,
    backgroundColor: colors.light,
    marginHorizontal: 5,
    marginTop: -20,
  },
  activeStepLine: {
    backgroundColor: colors.primary,
  },

  // Step 2 Styles
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

  // Updated Groups Container Styles (keeping original badge style)
  groupsContainer: {
    maxHeight: 300,
    marginBottom: 20,
    paddingVertical: 10,
  },
  groupsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  group: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: colors.light,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 10,
    minWidth: "45%",
    position: "relative",
    borderWidth: 1,
    borderColor: colors.medium,
  },
  selectedGroup: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  groupInfo: {
    flex: 1,
    marginRight: 10,
  },
  groupText: {
    fontSize: 14,
    color: colors.dark,
    fontFamily: "Yekan_Bakh_Regular",
    marginBottom: 2,
  },
  selectedGroupText: {
    color: colors.white,
  },
  groupMemberCount: {
    fontSize: 12,
    color: colors.medium,
    fontFamily: "Yekan_Bakh_Regular",
  },
  selectedGroupMemberCount: {
    color: 'rgba(255, 255, 255, 0.8)',
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
  chipsContainer: {
    maxHeight: 250,
    marginBottom: 20,
  },

  // Optional: Update your existing groupsContainer style if you want to keep both options
  groupsContainerChips: {
    maxHeight: 250,
    marginBottom: 20,
    paddingVertical: 0,
  },
});

export default SignupScreen;