import React, { useEffect, useRef, useState } from "react";
import AppText from "../components/Text";
import {
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
  Animated,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../config/colors";
import MainBackground from "../components/MainBackground";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import Toast from "../components/Toast";
import { formatPrice, toPersianDigits } from "../utils/converters";
import appConfig from "../config/config";
import { useAuth } from "../contexts/AuthContext";
import apiService from "../services/ApiService";
import axios from "axios";

const { width, height } = Dimensions.get("window");

const modernColors = {
  ...colors,
  primary: "#667eea",
  primaryDark: "#764ba2",
  primaryLight: "#f0f4ff",
  secondary: "#ff6b6b",
  tertiary: "#4ecdc4",
  accent: "#45b7d1",
  surface: "#ffffff",
  dark: "#2c3e50",
  medium: "#34495e",
  light: "#ecf0f1",
  success: "#2ecc71",
  warning: "#f39c12",
  error: "#e74c3c",
  info: "#3498db",
  gradientStart: "#667eea",
  gradientEnd: "#764ba2",
};

const CourseRegistrationScreen = ({ route }) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { courseId } = route.params;

  // Course data
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Discount states
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [codeApplied, setCodeApplied] = useState(false);

  // Registration states
  const [isRegistering, setIsRegistering] = useState(false);

  // Toast states
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info",
  );

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // const myketInstance = useMyket(
  //   "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQChXXM0/itjd4zMeRiTBoASWlgVRRSX4of23aNP7mXLHwzn5P7nOIcD9ObrE0fIludBGRffeSgkAmMDeqC6SY6fou5WJMVbOvZi7bbG2s9dbIeVy6TseHf0u/Y05e6RxCpUqDZ6UNJfwN9gyLcTnJkim9U9be7ibkS421RPcz8PZwIDAQAB",
  // );

  // Fetch course details on mount
  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  // Start animations when data is loaded
  useEffect(() => {
    if (courseData) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [courseData]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${appConfig.mobileApi}Course/Get?courseId=${courseId}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      console.log("Course data received:", result);

      // Set the course data from API
      if (result && result.Course) {
        setCourseData(result.Course);
      } else {
        throw new Error("Invalid data structure");
      }
    } catch (error) {
      console.error("Error fetching course details:", error);
      showToast("خطا در دریافت اطلاعات دوره", "error");
      setCourseData(null);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const handleApplyDiscountCode = async () => {
    if (!discountCode.trim()) {
      showToast("لطفا کد تخفیف را وارد کنید", "error");
      return;
    }

    if (!courseData?.AllowDiscountCode) {
      showToast("این دوره امکان استفاده از کد تخفیف را ندارد", "error");
      return;
    }

    try {
      setIsCheckingCode(true);

      const response = await fetch(
        `${appConfig.mobileApi}CourseRegistration/ApplyDiscountCode?courseId=${courseId}&code=${encodeURIComponent(discountCode)}`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        showToast(errorData.Message || "کد تخفیف معتبر نیست", "error");
        setDiscountAmount(0);
        setCodeApplied(false);
        return;
      }

      const result = await response.json();
      const discount = result.Discount || 0; // ✅ اصلاح شده

      setDiscountAmount(discount);
      setCodeApplied(true);
      showToast("کد تخفیف با موفقیت اعمال شد", "success");
    } catch (error) {
      console.error("Error applying discount code:", error);
      showToast("خطا در اعمال کد تخفیف", "error");
      setDiscountAmount(0);
      setCodeApplied(false);
    } finally {
      setIsCheckingCode(false);
    }
  };
  const handleRegister = async () => {
    if (!user?.MemberId) {
      showToast("لطفا ابتدا وارد حساب کاربری خود شوید", "error");
      return;
    }

    if (!courseData?.RegisterActive) {
      showToast("ثبت‌نام در این دوره غیرفعال است", "error");
      return;
    }

    try {
      setIsRegistering(true);

      const requestBody = {
        CourseId: courseId,
        MemberId: user.MemberId,
        DiscountCode: codeApplied ? discountCode : "",
      };

      console.log("Registration request:", requestBody); // برای دیباگ

      const response = await fetch(
        `${appConfig.mobileApi}CourseRegistration/Register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        showToast(errorData.Message || "خطا در ثبت‌نام", "error");
        return;
      }

      const result = await response.json();
      console.log("Registration result:", result); // برای دیباگ

      console.log(
        "requested to: ",
        `https://developer.myket.ir/api/partners/applications/${"ir.farimod.app"}/purchases/products/${requestBody.CourseId}/tokens/${"MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQChXXM0/itjd4zMeRiTBoASWlgVRRSX4of23aNP7mXLHwzn5P7nOIcD9ObrE0fIludBGRffeSgkAmMDeqC6SY6fou5WJMVbOvZi7bbG2s9dbIeVy6TseHf0u/Y05e6RxCpUqDZ6UNJfwN9gyLcTnJkim9U9be7ibkS421RPcz8PZwIDAQAB"}/consume`,
      );
      const res = await axios.put(
        `https://developer.myket.ir/api/partners/applications/${"ir.farimod.app"}/purchases/products/${requestBody.CourseId}/tokens/${"MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQChXXM0/itjd4zMeRiTBoASWlgVRRSX4of23aNP7mXLHwzn5P7nOIcD9ObrE0fIludBGRffeSgkAmMDeqC6SY6fou5WJMVbOvZi7bbG2s9dbIeVy6TseHf0u/Y05e6RxCpUqDZ6UNJfwN9gyLcTnJkim9U9be7ibkS421RPcz8PZwIDAQAB"}/consume`,
      );

      console.log("response myket:", res);
      // if (result.GatewayURL) {
      //   showToast('در حال انتقال به درگاه پرداخت...', 'success');
      //   setTimeout(() => {
      //     Linking.openURL(result.GatewayURL);
      //     navigation.navigate("App", { screen: "MainTabs", params: { screen: "خانه" } });
      //   }, 1500);
      // } else {
      //   showToast('ثبت‌نام با موفقیت انجام شد', 'success');
      //   setTimeout(() => {
      //     navigation.navigate("App", { screen: "MainTabs", params: { screen: "خانه" } });
      //   }, 1500);
      // }
    } catch (error) {
      console.error("Error registering:", error);
      showToast("خطا در ثبت‌نام. لطفا دوباره تلاش کنید", "error");
    } finally {
      setIsRegistering(false);
    }
  };
  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <MainBackground />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            navigation.navigate("App", {
              screen: "MainTabs",
              params: { screen: "خانه" },
            })
          }
          activeOpacity={0.7}
        >
          <View style={styles.backButtonContainer}>
            <MaterialIcons
              name="arrow-forward"
              size={24}
              color={modernColors.dark}
            />
          </View>
        </TouchableOpacity>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={modernColors.primary} />
          <AppText style={styles.loadingText}>در حال بارگذاری...</AppText>
        </View>
      </View>
    );
  }

  // Error state
  if (!courseData) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <MainBackground />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            navigation.navigate("App", {
              screen: "MainTabs",
              params: { screen: "خانه" },
            })
          }
          activeOpacity={0.7}
        >
          <View style={styles.backButtonContainer}>
            <MaterialIcons
              name="arrow-forward"
              size={24}
              color={modernColors.dark}
            />
          </View>
        </TouchableOpacity>

        <View style={styles.errorContainer}>
          <MaterialIcons
            name="error-outline"
            size={80}
            color={modernColors.medium}
          />
          <AppText style={styles.errorTitle}>دوره یافت نشد</AppText>
          <AppText style={styles.errorSubtitle}>
            اطلاعات دوره موجود نیست
          </AppText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchCourseDetails}
          >
            <AppText style={styles.retryButtonText}>تلاش مجدد</AppText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Calculate final price
  const registerAmount = courseData.RegisterAmount || 0;
  const finalPrice = Math.max(0, registerAmount - discountAmount);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <MainBackground />

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() =>
          navigation.navigate("App", {
            screen: "MainTabs",
            params: { screen: "خانه" },
          })
        }
        activeOpacity={0.7}
      >
        <View style={styles.backButtonContainer}>
          <MaterialIcons
            name="arrow-forward"
            size={24}
            color={modernColors.dark}
          />
        </View>
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.headerContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.headerIconWrapper}>
            <LinearGradient
              colors={["#7c91ee", "#5a67d8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerIconGradient}
            >
              <MaterialIcons name="book" size={32} color="#fff" />
            </LinearGradient>
          </View>
          <AppText style={styles.headerTitle}>ثبت‌نام در دوره</AppText>
          <AppText style={styles.headerSubtitle}>اطلاعات پرداخت</AppText>
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
          {/* Course Name Card */}
          <View style={styles.courseCard}>
            <View style={styles.courseCardHeader}>
              <View style={styles.courseIconBadge}>
                <MaterialIcons
                  name="menu-book"
                  size={20}
                  color={modernColors.info}
                />
              </View>
              <AppText style={styles.courseCardLabel}>نام دوره</AppText>
            </View>
            <AppText style={styles.courseNameText}>
              {courseData.CourseName || "نام دوره مشخص نشده"}
            </AppText>
          </View>

          {/* Discount Code Card */}
          {courseData.AllowDiscountCode && (
            <View style={styles.discountCard}>
              <View style={styles.discountHeader}>
                <AppText style={styles.discountTitle}>کد تخفیف دارید؟ </AppText>
              </View>

              <View style={styles.discountInputRow}>
                <TouchableOpacity
                  style={[
                    styles.applyButton,
                    (isCheckingCode || !discountCode.trim()) &&
                      styles.applyButtonDisabled,
                  ]}
                  onPress={handleApplyDiscountCode}
                  disabled={
                    isCheckingCode || !discountCode.trim() || codeApplied
                  }
                  activeOpacity={0.7}
                >
                  {isCheckingCode ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <AppText style={styles.applyButtonText}>
                      {codeApplied ? "✓" : "اعمال"}
                    </AppText>
                  )}
                </TouchableOpacity>

                <TextInput
                  style={[
                    styles.discountInput,
                    codeApplied && styles.discountInputSuccess,
                  ]}
                  placeholder="کد تخفیف خود را وارد کنید"
                  placeholderTextColor="#9ca3af"
                  value={discountCode}
                  onChangeText={setDiscountCode}
                  editable={!codeApplied}
                  autoCapitalize="characters"
                />
              </View>

              {codeApplied && discountAmount > 0 && (
                <View style={styles.discountSuccessBanner}>
                  <AppText style={styles.discountSuccessText}>
                    ✓ {toPersianDigits(formatPrice(discountAmount))} تومان تخفیف
                    اعمال شد
                  </AppText>
                </View>
              )}
            </View>
          )}

          {/* Price Summary Card */}
          <View style={styles.summaryCard}>
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.summaryHeader}
            >
              <MaterialIcons name="receipt" size={20} color="#fff" />
              <AppText style={styles.summaryHeaderText}>خلاصه پرداخت</AppText>
            </LinearGradient>

            <View style={styles.summaryContent}>
              <View style={styles.summaryRow}>
                <AppText style={styles.summaryValue}>
                  {toPersianDigits(formatPrice(registerAmount))}
                </AppText>
                <AppText style={styles.summaryLabel}>قیمت دوره:</AppText>
              </View>

              {discountAmount > 0 && (
                <View style={styles.summaryRow}>
                  <AppText style={[styles.summaryValue, styles.discountValue]}>
                    - {toPersianDigits(formatPrice(discountAmount))}
                  </AppText>
                  <AppText style={styles.summaryLabel}>تخفیف:</AppText>
                </View>
              )}

              <View style={styles.divider} />

              <View style={styles.totalRow}>
                <AppText style={styles.totalValue}>
                  {toPersianDigits(formatPrice(finalPrice))}
                </AppText>
                <AppText style={styles.totalLabel}>مبلغ قابل پرداخت:</AppText>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Payment Button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={[
            styles.paymentButton,
            (!courseData.RegisterActive || isRegistering) &&
              styles.paymentButtonDisabled,
          ]}
          onPress={handleRegister}
          disabled={!courseData.RegisterActive || isRegistering}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              courseData.RegisterActive
                ? ["#2ecc71", "#27ae60"]
                : ["#95a5a6", "#7f8c8d"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.paymentButtonGradient}
          >
            {isRegistering ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialIcons name="credit-card" size={22} color="#fff" />
                <AppText style={styles.paymentButtonText}>
                  {courseData.RegisterActive
                    ? "ثبت‌نام و پرداخت"
                    : "ثبت‌نام غیرفعال"}
                </AppText>
                {courseData.RegisterActive && (
                  <AppText style={styles.paymentButtonPrice}>
                    {toPersianDigits(formatPrice(finalPrice))}
                  </AppText>
                )}
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f3ff",
  },
  backButton: {
    position: "absolute",
    top: StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 40,
    right: 16,
    zIndex: 10,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  headerContainer: {
    alignItems: "center",
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 70 : 90,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  headerIconWrapper: {
    marginBottom: 16,
  },
  headerIconGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#667eea",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.dark,
    marginBottom: 6,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.medium,
    textAlign: "center",
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  courseCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  courseCardHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",

    marginBottom: 12,
  },
  courseCardLabel: {
    fontSize: 13,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.medium,
  },
  courseIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  courseNameText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.dark,
    textAlign: "right",
    lineHeight: 26,
  },
  discountCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  discountHeader: {
    marginBottom: 16,
  },
  discountTitle: {
    fontSize: 15,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.dark,
    textAlign: "right",
  },
  discountInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  discountInput: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    textAlign: "right",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    color: modernColors.dark,
  },
  discountInputSuccess: {
    backgroundColor: "#f0fdf4",
    borderColor: "#86efac",
  },
  applyButton: {
    backgroundColor: "#f59e0b",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 13,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonDisabled: {
    backgroundColor: "#d1d5db",
    opacity: 0.6,
  },
  applyButtonText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#fff",
  },
  discountSuccessBanner: {
    marginTop: 12,
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#22c55e",
  },
  discountSuccessText: {
    fontSize: 13,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#15803d",
    textAlign: "right",
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  summaryHeaderText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#fff",
  },
  summaryContent: {
    padding: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.medium,
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.dark,
  },
  discountValue: {
    color: "#22c55e",
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f0f4ff",
    padding: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.dark,
  },
  totalValue: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#667eea",
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 32 : 20,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  paymentButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#2ecc71",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 50,
  },
  paymentButtonDisabled: {
    opacity: 0.6,
  },
  paymentButtonGradient: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,

    gap: 10,
  },
  paymentButtonText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#fff",
  },
  paymentButtonPrice: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: "rgba(255, 255, 255, 0.9)",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.medium,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.dark,
    marginTop: 20,
    textAlign: "center",
  },
  errorSubtitle: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.medium,
    marginTop: 12,
    textAlign: "center",
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: modernColors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  retryButtonText: {
    fontSize: 15,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#fff",
  },
});

export default CourseRegistrationScreen;
