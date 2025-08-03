import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
  Animated,
  StatusBar,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
} from "react-native";
import colors from "../config/colors";
import AppText from "../components/Text";
import { toPersianDigits } from "../utils/converters";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import MainBackground from "../components/MainBackground";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { AppNavigationProp } from "../Navigators";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from "../components/Toast";
import appConfig from "../config/config";

const { width, height } = Dimensions.get('window');

const modernColors = {
  ...colors,
  primary: "#667eea",
  primaryDark: "#5a67d8",
  primaryLight: "#e6fffa",
  secondary: "#764ba2",
  tertiary: "#00d4aa",
  accent: "#667eea",
  surface: "rgba(255, 255, 255, 0.95)",
  dark: "#1a202c",
  medium: "#2d3748",
  light: "#f7fafc",
  success: "#38a169",
  warning: "#ed8936",
  error: "#e53e3e",
  info: "#3182ce",
  gold: "#ffd700",
  silver: "#c0c0c0",
  bronze: "#cd7f32",
  glass: "rgba(255, 255, 255, 0.15)",
  glassDark: "rgba(255, 255, 255, 0.1)",
  shadow: "rgba(0, 0, 0, 0.15)"
};

interface ISubscriptionPlan {
  id: number;
  title: string;
  price: string;
  duration: string;
  features: string[];
  color: string;
  gradientColors: string[];
  glassColors: string[];
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  isPopular?: boolean;
  badgeBackgroundColor?: string;
  badgeText?: string;
  isActive?: boolean;
  subscriptionOptions?: {
    value: string;
    label: string;
    price: number;
    duration: string;
    icon: string;
  }[];
}

interface IActiveSubscription {
  MemberSubscriptionId: number;
  MemberId: number;
  MemberName: string;
  SubscriptionPlanId: number;
  SubscriptionPlanName: string;
  StartDate: string;
  ShamsiStartDate: string;
  FinishDate: string;
  ShamsiFinishDate: string;
  SubscriptionTotalDays: number;
  RemainingDaysToFinishDate: number;
  DiscountCodeId: number | null;
  DiscountCodeName: string;
  SubscriptionPrice: number;
  Discount: number;
  FinalAmount: number;
  InsertDate: string;
  ShamsiInsertDate: string;
  LastUpdateDate: string | null;
}

const useSubscriptionPlans = () => {
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubscriptionPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${appConfig.mobileApi}SubscriptionPlan/GetAllActive`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const plans = result.Data || [];

      const transformedPlans = plans.map((plan, index) => ({
        id: plan.SubscriptionPlanId,
        title: plan.Name,
        price: "99,000",
        duration: "ماهانه",
        features: [
          "لورم ایپسوم متن ساختگی",
          "صنعت چاپ و نشر",
          "استاندارد صنعت بوده",
          "کتابهای آموزشی شامل"
        ],
        color: plan.ColorHexCode,
        gradientColors: [plan.ColorHexCode, plan.ColorHexCode],
        glassColors: [`${plan.ColorHexCode}20`, `${plan.ColorHexCode}10`],
        icon: plan.IconName,
        isPopular: plan.ShowBadge,
        badgeBackgroundColor: plan.BadgeBackgroundColorHexCode,
        badgeText: plan.BadgeText,
        isActive: false, // Will be updated based on active subscription
        subscriptionOptions: [
          ...(plan.AllowFourteenDaysSubscription ? [{
            value: 'fourteen_days',
            label: `۱۴ روزه`,
            price: plan.FourteenDaysSubscriptionPrice,
            duration: '۱۴ روزه',
            icon: 'schedule'
          }] : []),
          ...(plan.AllowOneMonthSubscription ? [{
            value: 'one_month',
            label: `یک ماهه`,
            price: plan.OneMonthSubscriptionPrice,
            duration: 'یک ماهه',
            icon: 'calendar-today'
          }] : []),
          ...(plan.AllowThreeMonthsSubscription ? [{
            value: 'three_months',
            label: `سه ماهه`,
            price: plan.ThreeMonthsSubscriptionPrice,
            duration: 'سه ماهه',
            icon: 'calendar-view-month'
          }] : []),
          ...(plan.AllowSixMonthsSubscription ? [{
            value: 'six_months',
            label: `شش ماهه`,
            price: plan.SixMonthsSubscriptionPrice,
            duration: 'شش ماهه',
            icon: 'date-range'
          }] : []),
          ...(plan.AllowAnnualSubscription ? [{
            value: 'annual',
            label: `سالانه`,
            price: plan.AnnualSubscriptionPrice,
            duration: 'سالانه',
            icon: 'event'
          }] : [])
        ]
      }));

      setSubscriptionPlans(transformedPlans);
    } catch (err) {
      setError(err.message);
      setSubscriptionPlans([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    subscriptionPlans,
    setSubscriptionPlans,
    loading,
    error,
    fetchSubscriptionPlans,
  };
};

const useActiveSubscription = () => {
  const [activeSubscription, setActiveSubscription] = useState<IActiveSubscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchActiveSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${appConfig.mobileApi}SubscriptionPlan/GetActiveSubscriptionPlanOfMember`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setActiveSubscription(result);
    } catch (err) {
      setError(err.message);
      setActiveSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    activeSubscription,
    loading,
    error,
    fetchActiveSubscription,
  };
};

// Progress Bar Component
const SubscriptionProgressBar = ({ activeSubscription }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (activeSubscription) {
      // Progress based on remaining days (reverse calculation)
      const progressPercentage =
        (activeSubscription.RemainingDaysToFinishDate / activeSubscription.SubscriptionTotalDays) * 100;

      Animated.timing(progressAnim, {
        toValue: progressPercentage,
        duration: 1500,
        useNativeDriver: false,
      }).start();
    }
  }, [activeSubscription]);

  if (!activeSubscription) return null;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  // Progress based on remaining days (reverse calculation)
  const progressPercentage =
    (activeSubscription.RemainingDaysToFinishDate / activeSubscription.SubscriptionTotalDays) * 100;

  const getProgressColor = () => {
    if (progressPercentage <= 20) return ['#ef4444', '#dc2626']; // Red - almost expired
    if (progressPercentage <= 40) return ['#f59e0b', '#d97706']; // Orange - warning
    return ['#10b981', '#059669']; // Green - plenty of time
  };

  const getProgressIcon = () => {
    if (progressPercentage <= 20) return 'warning';
    if (progressPercentage <= 40) return 'schedule';
    return 'check-circle';
  };

  return (
    <View style={styles.progressContainer}>


      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]}>
            <LinearGradient
              colors={getProgressColor()}
              style={styles.progressGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </Animated.View>
        </View>
      </View>

      <View style={styles.progressInfo}>


      </View>
    </View>
  );
};

const ConfirmationModal = ({ visible, onClose, onConfirm, title, message, confirmText, type = "confirm" }) => {
  const [slideAnim] = useState(new Animated.Value(300));
  const [opacityAnim] = useState(new Animated.Value(0));
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  const iconName = type === "cancel" ? "warning" : "help-outline";
  const iconColor = type === "cancel" ? "#EF4444" : "#3B82F6";
  const iconBgColor = type === "cancel" ? "#FEE2E2" : "#EBF8FF";
  const confirmButtonColor = type === "cancel" ? "#EF4444" : "#10B981";

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.confirmModalContent,
            {
              transform: [{ translateY: slideAnim }],
              opacity: opacityAnim,
              marginBottom: Math.max(insets.bottom, 20),
            }
          ]}
        >
          <View style={[styles.modalIconContainer, { backgroundColor: iconBgColor }]}>
            <MaterialIcons name={iconName} size={48} color={iconColor} />
          </View>

          <AppText style={styles.modalTitle}>{title}</AppText>

          <AppText style={styles.modalMessage}>{message}</AppText>

          <View style={styles.modalButtonsContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelModalButton]}
              onPress={onClose}
            >
              <AppText style={styles.cancelModalText}>لغو</AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: confirmButtonColor }]}
              onPress={onConfirm}
            >
              <AppText style={styles.confirmModalText}>{confirmText}</AppText>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const SuccessModal = ({ visible, onClose, title, message }) => {
  const [slideAnim] = useState(new Animated.Value(300));
  const [opacityAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0));
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          delay: 100,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.confirmModalContent,
            {
              transform: [{ translateY: slideAnim }],
              opacity: opacityAnim,
              marginBottom: Math.max(insets.bottom, 20),
            }
          ]}
        >
          <Animated.View
            style={[
              styles.modalIconContainer,
              {
                backgroundColor: `${modernColors.success}20`,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <MaterialIcons name="check-circle" size={48} color={modernColors.success} />
          </Animated.View>

          <AppText style={styles.modalTitle}>{title}</AppText>

          <AppText style={styles.modalMessage}>{message}</AppText>

          <View style={styles.successButtonContainer}>
            <TouchableOpacity
              style={styles.successButton}
              onPress={onClose}
            >
              <AppText style={styles.successButtonText}>باشه</AppText>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const SubscriptionCard = ({ item, onPress, onCancel, animatedValue, showToast }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [tempSelectedItem, setTempSelectedItem] = useState(null);
  const [discountCode, setDiscountCode] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(0);

  const modalSlideAnim = useRef(new Animated.Value(300)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;

  const cardScale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  const openPicker = () => {
    setShowPicker(true);
    setTempSelectedItem(selectedOption);
    setDiscountCode('');
    setDiscountApplied(false);
    setDiscountPercentage(0);

    Animated.parallel([
      Animated.timing(modalSlideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closePicker = () => {
    Animated.parallel([
      Animated.timing(modalSlideAnim, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowPicker(false);
      setTempSelectedItem(null);
      setDiscountCode('');
      setDiscountApplied(false);
      setDiscountPercentage(0);
    });
  };

  const handleOptionSelect = (option) => {
    setTempSelectedItem(option);
  };

  const handleConfirm = () => {
    if (tempSelectedItem) {
      setSelectedOption(tempSelectedItem);
      onPress({ ...item, selectedOption: tempSelectedItem, discountCode: discountApplied ? discountCode : null });
    }
    closePicker();
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;

    setIsApplyingDiscount(true);

    setTimeout(() => {
      setIsApplyingDiscount(false);

      const validCodes = ['DISCOUNT10', 'SAVE10', 'تخفیف10', 'کد10', 'TEST10'];
      const isValid = validCodes.includes(discountCode.trim().toUpperCase());

      if (isValid) {
        setDiscountApplied(true);
        setDiscountPercentage(10);
        showToast('کد تخفیف با موفقیت اعمال شد', 'success');
      } else {
        setDiscountApplied(false);
        setDiscountPercentage(0);
        showToast('کد تخفیف معتبر نیست', 'error');
      }
    }, 1500);
  };

  const clearDiscount = () => {
    setDiscountCode('');
    setDiscountApplied(false);
    setDiscountPercentage(0);
  };

  const calculateDiscountedPrice = (originalPrice) => {
    if (!discountApplied || !tempSelectedItem) return originalPrice;
    const discount = (originalPrice * discountPercentage) / 100;
    return originalPrice - discount;
  };

  const formatPrice = (price) => {
    return toPersianDigits(price.toLocaleString());
  };

  return (
    <Animated.View style={[
      styles.subscriptionCard,
      {
        transform: [{ scale: cardScale }],
      }
    ]}>
      <View style={styles.glassContainer}>
        <View style={styles.glassBackground} />
        <View style={[styles.glassOverlay, { borderColor: item.color }]} />
      </View>

      {item.isPopular && (
        <View style={styles.popularBadge}>
          <View
            style={[styles.popularBadgeGradient, { backgroundColor: item.badgeBackgroundColor }]}
          >
            <AppText style={styles.popularBadgeText}>{item.badgeText}</AppText>
          </View>
        </View>
      )}

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={[styles.planIconContainer, {
            backgroundColor: `${item.color}20`,
            borderColor: item.color,
          }]}>
            <MaterialIcons name={item.icon} size={32} color={item.color} />
          </View>
          <View style={styles.titleContainer}>
            <AppText style={styles.planTitle}>{item.title}</AppText>
            {item.isActive && (
              <View style={styles.activeBadge}>
                <MaterialIcons name="check-circle" size={14} color={modernColors.success} />
                <AppText style={styles.activeBadgeText}>فعال</AppText>
              </View>
            )}
          </View>
        </View>

        <View style={styles.featuresContainer}>
          {item.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: `${modernColors.success}20` }]}>
                <MaterialIcons
                  name="check"
                  size={14}
                  color={modernColors.success}
                />
              </View>
              <AppText style={styles.featureText}>{feature}</AppText>
            </View>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          {item.isActive ? (
            <View style={styles.cancelButton} />
          ) : (
            <>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={openPicker}
              >
                <LinearGradient
                  colors={["#10B981", "#059669"]}
                  style={styles.selectButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialIcons name="rocket-launch" size={18} color="white" />
                  <AppText style={styles.selectButtonText}>انتخاب پلن</AppText>
                </LinearGradient>
              </TouchableOpacity>

              <Modal
                visible={showPicker}
                transparent={true}
                animationType="none"
                onRequestClose={() => { }}
              >
                <View style={styles.pickerModalOverlay}>
                  <Animated.View
                    style={[
                      styles.pickerModalContent,
                      {
                        transform: [{ translateY: modalSlideAnim }],
                        opacity: modalOpacityAnim,
                      }
                    ]}
                  >
                    <View style={styles.pickerModalHeader}>
                      <View style={styles.pickerModalHandle} />
                      <View style={styles.pickerHeaderRow}>
                        <View style={styles.pickerHeaderTitleContainer}>
                          <MaterialIcons name="auto-awesome-mosaic" size={24} color="#667eea" />
                          <AppText style={styles.pickerModalTitle}>انتخاب مدت اشتراک</AppText>
                        </View>
                      </View>
                    </View>

                    <ScrollView
                      style={styles.pickerScrollContainer}
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={styles.pickerScrollContent}
                      bounces={true}
                      keyboardShouldPersistTaps="handled"
                    >
                      {(item.subscriptionOptions || []).map((option, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.pickerSelectionOption,
                            tempSelectedItem && tempSelectedItem.value === option.value && styles.pickerSelectedOption,
                          ]}
                          onPress={() => handleOptionSelect(option)}
                          activeOpacity={0.7}
                        >
                          <LinearGradient
                            colors={tempSelectedItem && tempSelectedItem.value === option.value
                              ? ["#667eea", "#764ba2"]
                              : ['#f8fafc', '#f8fafc']
                            }
                            style={styles.pickerOptionGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                          >
                            <View style={styles.pickerOptionContent}>
                              <View style={styles.pickerOptionLeft}>
                                {option.icon && (
                                  <View style={[
                                    styles.pickerOptionIconContainer,
                                    tempSelectedItem && tempSelectedItem.value === option.value && styles.pickerSelectedIconContainer
                                  ]}>
                                    <MaterialIcons
                                      name={option.icon as any}
                                      size={20}
                                      color={tempSelectedItem && tempSelectedItem.value === option.value ? "#ffffff" : "#667eea"}
                                    />
                                  </View>
                                )}
                                <View style={styles.pickerOptionTextContainer}>
                                  <AppText style={[
                                    styles.pickerSelectionOptionText,
                                    tempSelectedItem && tempSelectedItem.value === option.value && styles.pickerSelectedOptionText,
                                  ]}>
                                    {option.label}
                                  </AppText>
                                  <AppText style={[
                                    styles.pickerPriceText,
                                    tempSelectedItem && tempSelectedItem.value === option.value && styles.pickerSelectedPriceText,
                                  ]}>
                                    {toPersianDigits(option.price.toString())} تومان
                                  </AppText>
                                </View>
                              </View>

                              {tempSelectedItem && tempSelectedItem.value === option.value && (
                                <MaterialIcons name="check" size={18} color="#ffffff" />
                              )}
                            </View>
                          </LinearGradient>
                        </TouchableOpacity>
                      ))}

                      <View style={styles.discountSection}>
                        <View style={styles.discountHeader}>
                          <MaterialIcons name="local-offer" size={20} color="#10B981" />
                          <AppText style={styles.discountHeaderText}>کد تخفیف</AppText>
                        </View>

                        <View style={styles.discountInputContainer}>
                          <View style={styles.discountInputWrapper}>
                            <TextInput
                              style={styles.discountInput}
                              placeholder="کد تخفیف را وارد کنید"
                              placeholderTextColor="#9ca3af"
                              value={discountCode}
                              onChangeText={setDiscountCode}
                              textAlign="right"
                              editable={!discountApplied}
                            />
                            {discountApplied && (
                              <TouchableOpacity
                                style={styles.clearDiscountButton}
                                onPress={clearDiscount}
                              >
                                <MaterialIcons name="close" size={16} color="#ef4444" />
                              </TouchableOpacity>
                            )}
                          </View>

                          <TouchableOpacity
                            style={[
                              styles.applyDiscountButton,
                              discountApplied && styles.appliedDiscountButton,
                              (!discountCode.trim() || isApplyingDiscount) && styles.disabledDiscountButton
                            ]}
                            onPress={handleApplyDiscount}
                            disabled={!discountCode.trim() || isApplyingDiscount || discountApplied}
                            activeOpacity={0.7}
                          >
                            {isApplyingDiscount ? (
                              <View style={styles.loadingContainer}>
                                <View style={styles.loadingSpinner} />
                              </View>
                            ) : discountApplied ? (
                              <MaterialIcons name="check" size={18} color="#ffffff" />
                            ) : (
                              <AppText style={styles.applyDiscountButtonText}>اعمال</AppText>
                            )}
                          </TouchableOpacity>
                        </View>


                      </View>

                      {tempSelectedItem && (
                        <View style={styles.summarySection}>
                          <View style={styles.summaryContent}>
                            <View style={styles.summaryRow}>
                              <AppText style={styles.summaryLabel}>پلن انتخابی:</AppText>
                              <AppText style={styles.summaryValue}>{item.title}</AppText>
                            </View>

                            <View style={styles.summaryRow}>
                              <AppText style={styles.summaryLabel}>مدت اشتراک:</AppText>
                              <AppText style={styles.summaryValue}>{tempSelectedItem.duration}</AppText>
                            </View>

                            <View style={styles.summaryRow}>
                              <AppText style={styles.summaryLabel}>قیمت اصلی:</AppText>
                              <AppText style={styles.summaryValue}>{formatPrice(tempSelectedItem.price)} تومان</AppText>
                            </View>

                            {discountApplied && (
                              <>
                                <View style={styles.summaryRow}>
                                  <AppText style={styles.summaryDiscountLabel}>تخفیف ({toPersianDigits(discountPercentage.toString())}%):</AppText>
                                  <AppText style={styles.summaryDiscountValue}>
                                    -{formatPrice((tempSelectedItem.price * discountPercentage) / 100)} تومان
                                  </AppText>
                                </View>

                                <View style={styles.summaryDivider} />

                                <View style={styles.summaryTotalRow}>
                                  <AppText style={styles.summaryTotalLabel}>قیمت نهایی:</AppText>
                                  <AppText style={styles.summaryTotalValue}>
                                    {formatPrice(calculateDiscountedPrice(tempSelectedItem.price))} تومان
                                  </AppText>
                                </View>
                              </>
                            )}

                            {!discountApplied && (
                              <View style={styles.summaryTotalRow}>
                                <AppText style={styles.summaryTotalLabel}>قیمت نهایی:</AppText>
                                <AppText style={styles.summaryTotalValue}>
                                  {formatPrice(tempSelectedItem.price)} تومان
                                </AppText>
                              </View>
                            )}
                          </View>
                        </View>
                      )}
                    </ScrollView>

                    <View style={styles.pickerActionButtons}>
                      <TouchableOpacity
                        style={styles.pickerResetButton}
                        onPress={closePicker}
                        activeOpacity={0.8}
                      >
                        <MaterialIcons name="close" size={20} color="#34495e" />
                        <AppText style={styles.pickerResetButtonText}>انصراف</AppText>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.pickerApplyButton}
                        onPress={handleConfirm}
                        activeOpacity={0.8}
                        disabled={!tempSelectedItem}
                      >
                        <LinearGradient
                          colors={tempSelectedItem ? ["#10B981", "#059669"] : ['#9ca3af', '#6b7280']}
                          style={styles.pickerApplyButtonGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <MaterialIcons name="check" size={20} color="#ffffff" />
                          <AppText style={styles.pickerApplyButtonText}>تأیید انتخاب</AppText>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                </View>
              </Modal>
            </>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const SubscriptionScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [modalType, setModalType] = useState("confirm");

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const { subscriptionPlans, setSubscriptionPlans, loading, error, fetchSubscriptionPlans } = useSubscriptionPlans();
  const { activeSubscription, loading: activeLoading, error: activeError, fetchActiveSubscription } = useActiveSubscription();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;
  const floatingAnim = useRef(new Animated.Value(0)).current;

  const showToast = (message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchSubscriptionPlans(),
        fetchActiveSubscription()
      ]);
    };

    loadData();
  }, []);

  // Update subscription plans to mark active one
  useEffect(() => {
    if (activeSubscription && subscriptionPlans.length > 0) {
      const updatedPlans = subscriptionPlans.map(plan => ({
        ...plan,
        isActive: plan.id === activeSubscription.SubscriptionPlanId
      }));
      setSubscriptionPlans(updatedPlans);
    }
  }, [activeSubscription, subscriptionPlans]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(cardsAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const floatingY = floatingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setModalType("confirm");
    setConfirmModalVisible(true);
  };

  const handleCancelSubscription = (plan) => {
    setSelectedPlan(plan);
    setModalType("cancel");
    setConfirmModalVisible(true);
  };

  const handleConfirmAction = () => {
    setConfirmModalVisible(false);

    setTimeout(() => {
      if (modalType === "confirm") {
        setSuccessModalVisible(true);
      } else {
        setSuccessModalVisible(true);
      }
    }, 300);
  };

  const handleCloseModal = () => {
    setConfirmModalVisible(false);
    setSelectedPlan(null);
  };

  const handleCloseSuccessModal = () => {
    setSuccessModalVisible(false);
    setSelectedPlan(null);
  };

  const renderSubscriptionCard = ({ item, index }) => (
    <SubscriptionCard
      item={item}
      onPress={handleSelectPlan}
      onCancel={handleCancelSubscription}
      animatedValue={cardsAnim}
      showToast={showToast}
    />
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        <MainBackground />

        <Toast
          visible={toastVisible}
          message={toastMessage}
          type={toastType}
          onHide={() => setToastVisible(false)}
        />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          <Animated.View
            style={[
              styles.headerContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <View style={styles.backButtonContainer}>
                <MaterialIcons
                  name="arrow-forward"
                  size={24}
                  color="white"
                />
              </View>
            </TouchableOpacity>

            <View style={styles.titleWrapper}>
              <AppText style={styles.headerTitle}>اشتراک ها</AppText>
            </View>
          </Animated.View>

          {activeSubscription && (
            <Animated.View
              style={[
                styles.currentPlanContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.currentPlanGlass}>
                <View style={styles.currentPlanContent}>
                  <MaterialIcons name="verified" size={24} color="#38a169" />
                  <View style={styles.planInfo}>
                    <AppText style={styles.currentPlanText}>
                      پلن فعال: {activeSubscription.SubscriptionPlanName}
                    </AppText>
                    <AppText style={styles.expiryText}>
                      اعتبار تا: {toPersianDigits(activeSubscription.ShamsiFinishDate)} ({toPersianDigits(activeSubscription.RemainingDaysToFinishDate.toString())} روز باقی مانده)
                    </AppText>
                  </View>
                </View>

                <SubscriptionProgressBar activeSubscription={activeSubscription} />
              </View>
            </Animated.View>
          )}

          <Animated.View
            style={[
              styles.plansContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <FlatList
              data={subscriptionPlans}
              renderItem={renderSubscriptionCard}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ height: 24 }} />}
              scrollEnabled={false}
            />
          </Animated.View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        <ConfirmationModal
          visible={confirmModalVisible}
          onClose={handleCloseModal}
          onConfirm={handleConfirmAction}
          title={modalType === "confirm" ? "انتخاب پلن اشتراک" : "لغو اشتراک"}
          message={
            modalType === "confirm"
              ? `آیا می‌خواهید پلن ${selectedPlan?.title} را انتخاب کنید؟`
              : `آیا می‌خواهید اشتراک ${selectedPlan?.title} را لغو کنید؟`
          }
          confirmText={modalType === "confirm" ? "تأیید" : "بله، لغو کن"}
          type={modalType}
        />

        <SuccessModal
          visible={successModalVisible}
          onClose={handleCloseSuccessModal}
          title={modalType === "confirm" ? "موفق" : "لغو شد"}
          message={
            modalType === "confirm"
              ? `پلن ${selectedPlan?.title} با موفقیت انتخاب شد.`
              : `اشتراک ${selectedPlan?.title} لغو شد.`
          }
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 30,
    paddingTop: StatusBar.currentHeight + 35,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: StatusBar.currentHeight + 45,
    right: 20,
    zIndex: 1000,
  },
  backButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -12,
  },
  titleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Yekan_Bakh_ExtraBold",
    color: "#2c3e50",
    marginRight: 12,
    textAlign: "center",
  },
  currentPlanContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  currentPlanGlass: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(56, 161, 105, 0.3)",
    backdropFilter: "blur(20px)",
  },
  currentPlanContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  planInfo: {
    marginRight: 12,
    flex: 1,
  },
  subscriptionDurationContainer: {
    marginTop: 8,
  },
  subscriptionDurationText: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#64748b",
    textAlign: 'right',
  },
  currentPlanText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  expiryText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#64748b",
  },
  // Progress Bar Styles
  progressContainer: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    marginRight: 8,
  },
  progressBarContainer: {
    marginBottom: 12,
    direction: "rtl"
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressGradient: {
    flex: 1,
    borderRadius: 4,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  progressInfoItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressInfoLabel: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#64748b",
    marginLeft: 4,
  },
  progressInfoValue: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
  },
  progressDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressDate: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  progressDateLabel: {
    fontSize: 11,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#64748b",
    marginLeft: 4,
  },
  progressDateValue: {
    fontSize: 11,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#475569",
  },
  plansContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  subscriptionCard: {
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 4,
  },
  glassContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  glassBackground: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    backdropFilter: "blur(20px)",
  },
  glassOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 24,
    borderWidth: 1.5,
  },
  popularBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
    borderRadius: 20,
    overflow: "hidden",
  },
  popularBadgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  popularBadgeText: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Bold",
    color: "white",
    marginRight: 6,
  },
  cardContent: {
    padding: 24,
  },
  cardHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 24,
  },
  planIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    marginLeft: 16,
  },
  titleContainer: {
    flex: 1,
  },
  planTitle: {
    fontSize: 22,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  activeBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "rgba(56, 161, 105, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-end",
  },
  activeBadgeText: {
    fontSize: 11,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#38a169",
    marginRight: 4,
  },
  featuresContainer: {
    marginBottom: 28,
    marginTop: 28,
  },
  featureItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 12,
  },
  featureIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  featureText: {
    fontSize: 15,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#475569",
    flex: 1,
  },
  buttonContainer: {
    marginTop: 8,
  },
  selectButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  selectButtonGradient: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  selectButtonText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: "white",
    marginRight: 8,
  },
  cancelButton: {
  },
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  pickerModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    flex: 1,
    maxHeight: '85%',
  },
  pickerModalHeader: {
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerModalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    marginBottom: 15,
  },
  pickerHeaderRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  pickerHeaderTitleContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  pickerModalTitle: {
    fontSize: 20,
    fontFamily: "Yekan_Bakh_ExtraBold",
    color: "#1F2937",
    marginRight: 8,
  },
  pickerScrollContainer: {
    flex: 1,
  },
  pickerScrollContent: {
    paddingVertical: 8,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  pickerSelectionOption: {
    borderRadius: 16,
    marginVertical: 3,
    overflow: 'hidden',
  },
  pickerSelectedOption: {
  },
  pickerOptionGradient: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 14,
  },
  pickerOptionContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerOptionLeft: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  pickerOptionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  pickerSelectedIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  pickerOptionTextContainer: {
    flex: 1,
  },
  pickerSelectionOptionText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  pickerSelectedOptionText: {
    color: '#ffffff',
  },
  pickerPriceText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#9ca3af',
  },
  pickerSelectedPriceText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  pickerActionButtons: {
    flexDirection: 'row-reverse',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  pickerResetButton: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pickerResetButtonText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#34495e",
    marginRight: 6,
  },
  pickerApplyButton: {
    flex: 2,
  },
  pickerApplyButtonGradient: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  pickerApplyButtonText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#ffffff',
    marginRight: 6,
  },
  discountSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    backgroundColor: '#fafbfc',
    marginTop: 20,
    borderRadius: 12,
  },
  discountHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 12,
  },
  discountHeaderText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    marginRight: 8,
  },
  discountInputContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  discountInputWrapper: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  discountInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#2c3e50",
    paddingVertical: 12,
    textAlign: 'right',
  },
  clearDiscountButton: {
    padding: 4,
    marginLeft: 8,
  },
  applyDiscountButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appliedDiscountButton: {
    backgroundColor: '#10B981',
  },
  disabledDiscountButton: {
    backgroundColor: '#9ca3af',
    opacity: 0.6,
  },
  applyDiscountButtonText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#ffffff',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSpinner: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderTopColor: 'transparent',
    borderRadius: 8,
  },
  summarySection: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#ffffff',
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 12,
  },
  summaryContent: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#2c3e50',
  },
  summaryDiscountLabel: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#10B981',
  },
  summaryDiscountValue: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#10B981',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 12,
  },
  summaryTotalRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#2c3e50',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_ExtraBold",
    color: '#10B981',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  confirmModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
    width: '100%',
    maxWidth: 350,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelModalButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelModalText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#374151',
  },
  confirmModalText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#FFFFFF',
  },
  successButtonContainer: {
    width: '100%',
    marginTop: 10,
  },
  successButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  successButtonText: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#FFFFFF',
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default SubscriptionScreen;