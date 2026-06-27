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
import { useAuth } from "../contexts/AuthContext";
import SubscriptionService from "../services/SubscriptionService";

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

const SubscriptionPurchaseScreen = ({ route }) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { plan, selectedOption } = route.params;

  // States
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [codeApplied, setCodeApplied] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Toast states
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info");

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
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
  }, []);

  const showToast = (message, type = "info") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const handleApplyDiscountCode = async () => {
    if (!discountCode.trim()) {
      showToast("لطفا کد تخفیف را وارد کنید", "error");
      return;
    }

    try {
      setIsCheckingCode(true);

      const timePeriod = SubscriptionService.calculateDays(selectedOption.value);
      const result = await SubscriptionService.applyDiscountCode(
        plan.id,
        discountCode,
        timePeriod
      );

      if (result.success) {
        const discount = result.data.Discount || 0;
        setDiscountAmount(discount);
        setCodeApplied(true);
        showToast("کد تخفیف با موفقیت اعمال شد", "success");
      } else {
        showToast(result.message, "error");
        setDiscountAmount(0);
        setCodeApplied(false);
      }
    } catch (error) {
      console.error("Error applying discount code:", error);
      showToast("خطا در اعمال کد تخفیف", "error");
      setDiscountAmount(0);
      setCodeApplied(false);
    } finally {
      setIsCheckingCode(false);
    }
  };

  const handlePurchase = async () => {
    if (!user?.MemberId) {
      showToast("لطفا ابتدا وارد حساب کاربری خود شوید", "error");
      return;
    }

    try {
      setIsPurchasing(true);

      const subscriptionTotalDays = SubscriptionService.calculateDays(
        selectedOption.value
      );

      const result = await SubscriptionService.buySubscriptionPlan(
        user.MemberId,
        plan.id,
        subscriptionTotalDays,
        codeApplied ? discountCode : ""
      );

      if (result.success) {
        if (result.data.GatewayURL) {
          showToast("در حال انتقال به درگاه پرداخت...", "success");
          setTimeout(() => {
            Linking.openURL(result.data.GatewayURL);
            navigation.navigate("App", { screen: "MainTabs", params: { screen: "خانه" } });
          }, 1500);
        } else {
          showToast("خرید با موفقیت انجام شد", "success");
          setTimeout(() => {
            navigation.navigate("App", { screen: "MainTabs", params: { screen: "خانه" } });
          }, 1500);
        }
      } else {
        showToast(result.message, "error");
      }
    } catch (error) {
      console.error("Error purchasing subscription:", error);
      showToast("خطا در خرید اشتراک. لطفا دوباره تلاش کنید", "error");
    } finally {
      setIsPurchasing(false);
    }
  };

  // Calculate prices
  const originalPrice = selectedOption.price;
  const finalPrice = Math.max(0, originalPrice - discountAmount);

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
        onPress={() => navigation.navigate("App", { screen: "MainTabs", params: { screen: "خانه" } })}
        activeOpacity={0.7}
      >
        <View style={styles.backButtonContainer}>
          <MaterialIcons name="arrow-forward" size={24} color={modernColors.dark} />
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
              colors={[plan.color, plan.color + "CC"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerIconGradient}
            >
              <MaterialIcons name={plan.icon} size={32} color="#fff" />
            </LinearGradient>
          </View>
          <AppText style={styles.headerTitle}>خرید اشتراک</AppText>
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
          {/* Plan Details Card */}
          <View style={styles.planCard}>
            <View style={styles.planCardHeader}>
              <View
                style={[
                  styles.planIconBadge,
                  { backgroundColor: `${plan.color}20` },
                ]}
              >
                <MaterialIcons name={plan.icon} size={20} color={plan.color} />
              </View>
              <AppText style={styles.planCardLabel}>پلن انتخابی</AppText>
            </View>
            <AppText style={styles.planNameText}>{plan.title}</AppText>

            <View style={styles.durationContainer}>
              <MaterialIcons
                name="schedule"
                size={16}
                color={modernColors.medium}
              />
              <AppText style={styles.durationText}>
                مدت اشتراک: {selectedOption.duration}
              </AppText>
            </View>
          </View>

          {/* Discount Code Card */}
          <View style={styles.discountCard}>
            <View style={styles.discountHeader}>
              <AppText style={styles.discountTitle}>کد تخفیف دارید؟</AppText>
            </View>

            <View style={styles.discountInputRow}>
              <TouchableOpacity
                style={[
                  styles.applyButton,
                  (isCheckingCode || !discountCode.trim()) &&
                  styles.applyButtonDisabled,
                ]}
                onPress={handleApplyDiscountCode}
                disabled={isCheckingCode || !discountCode.trim() || codeApplied}
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
                  {toPersianDigits(formatPrice(originalPrice))}
                </AppText>
                <AppText style={styles.summaryLabel}>قیمت اشتراک:</AppText>
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
            isPurchasing && styles.paymentButtonDisabled,
          ]}
          onPress={handlePurchase}
          disabled={isPurchasing}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#2ecc71", "#27ae60"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.paymentButtonGradient}
          >
            {isPurchasing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialIcons name="credit-card" size={22} color="#fff" />
                <AppText style={styles.paymentButtonText}>خرید اشتراک</AppText>
                <AppText style={styles.paymentButtonPrice}>
                  {toPersianDigits(formatPrice(finalPrice))}
                </AppText>
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
  planCard: {
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
  planCardHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 12,
  },
  planCardLabel: {
    fontSize: 13,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.medium,
  },
  planIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  planNameText: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.dark,
    textAlign: "right",
    marginBottom: 12,
  },
  durationContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-end",
  },
  durationText: {
    fontSize: 13,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.medium,
    marginRight: 6,
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
});

export default SubscriptionPurchaseScreen;