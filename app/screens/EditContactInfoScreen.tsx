import React, { useEffect, useRef, useState } from "react";
import AppText from "../components/Text";
import { Formik } from "formik";
import {
  ScrollView,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Animated,
  Text,
  Platform,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import AppTextInput from "../components/TextInput";
import colors from "../config/colors";
import AppButton from "../components/Button";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";
import Screen from "../components/Screen";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import appConfig from "../config/config";
import { useAuth } from '../contexts/AuthContext';
import Tooltip from '../components/Tooltip';
import { StatusBar } from "expo-status-bar";
import AppPicker from "../components/Picker";

const EditContactInfoScreen = () => {
  const { user, logout } = useAuth(); // ✅ اضافه کردن logout
  const navigation = useNavigation();
  const route = useRoute();
  const { contactData, subscriptionPlan } = route.params || {};
  const { toastVisible, setToastVisible, toastMessage, toastType, showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // ✅ state برای mobile و initial mobile
  const [initialMobile, setInitialMobile] = useState("");
  const [loadingMobile, setLoadingMobile] = useState(true);

  const canShowContactInfo = subscriptionPlan?.planOption_ShowContanctInfo !== false;

  // State برای گروه‌های عضویت
  const [memberGroups, setMemberGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [groupsTotal, setGroupsTotal] = useState(0);

  // ✅ دریافت Mobile از API یا user context
  const fetchMobileNumber = async () => {
    setLoadingMobile(true);
    try {
      console.log("=== Fetching Mobile Number ===");
      console.log("Member ID:", user?.MemberId);
      console.log("User Mobile from context:", user?.Mobile);

      // دریافت از API
      const response = await fetch(
        `${appConfig.mobileApi}MemberInfo/GetProfileInfoToEdit?memberId=${user?.MemberId}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log("API Response Mobile:", data.Mobile);

        // ✅ استفاده از user.Mobile اگر API null برگرداند
        const mobileNumber = data.Mobile || user?.Mobile || "";

        console.log("Final mobile number:", mobileNumber);

        if (!mobileNumber) {
          Alert.alert(
            "هشدار",
            "شماره موبایل شما یافت نشد. لطفاً شماره موبایل خود را وارد کنید.",
            [{ text: "متوجه شدم" }]
          );
        }

        setInitialMobile(mobileNumber); // ✅ ذخیره شماره اولیه
      } else {
        console.error("Failed to fetch mobile from API");
        // fallback به user context
        const fallbackMobile = user?.Mobile || "";
        console.log("Using fallback mobile:", fallbackMobile);
        setInitialMobile(fallbackMobile);
      }
    } catch (error) {
      console.error("Error fetching mobile:", error);
      // fallback به user context
      const fallbackMobile = user?.Mobile || "";
      console.log("Error - using fallback mobile:", fallbackMobile);
      setInitialMobile(fallbackMobile);
    } finally {
      setLoadingMobile(false);
      console.log("==============================");
    }
  };

  const fetchProvinces = async () => {
    setLoadingProvinces(true);
    try {
      const response = await fetch("http://my.farimod.ir/api/MobileApp/Province/GetAllActive?page=1&pageSize=10000");

      if (response.ok) {
        const data = await response.json();
        const options = data.Items.map(p => ({
          value: p.ProvinceId,
          label: p.ProvinceName,
        }));
        setProvinces(options);
      } else {
        console.log("خطا در دریافت استان");
      }
    } catch (error) {
      console.log("Province error:", error);
    } finally {
      setLoadingProvinces(false);
    }
  };

  const fetchCities = async (provinceId) => {
    if (!provinceId) return setCities([]);

    setLoadingCities(true);
    try {
      const response = await fetch(
        `http://my.farimod.ir/api/MobileApp/City/GetAllActiveByProvinceId?provinceId=${provinceId}`
      );

      if (response.ok) {
        const data = await response.json();
        const options = data.Items.map(c => ({
          value: c.CityId,
          label: c.CityName,
        }));
        setCities(options);
      } else {
        setCities([]);
      }
    } catch (error) {
      console.log("City error:", error);
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  const fetchMemberGroups = async () => {
    try {
      setLoadingGroups(true);

      const url = `${appConfig.mobileApi}MemberGroup/GetAll?filterGroupName=&currentPage=1&pageSize=1000`;
      console.log('Fetching groups from:', url);

      const response = await fetch(url);

      if (response.ok) {
        const result = await response.json();
        console.log('Groups response:', result);

        const groupsArray = Array.isArray(result.Data) ? result.Data : [];
        const total = result.Total || 0;

        if (groupsArray.length > 0) {
          const activeGroups = groupsArray.filter(group => group && group.Active === true);

          const groupOptions = activeGroups.map(group => ({
            value: group.MemberGroupId,
            label: group.GroupName || `گروه ${group.MemberGroupId}`,
            memberCount: group.MemberCount || 0
          }));

          setMemberGroups(groupOptions);
          setGroupsTotal(total);
        } else {
          setMemberGroups([]);
        }
      } else {
        console.error('Error fetching groups:', response.status);
        setMemberGroups([]);
      }
    } catch (error) {
      console.error('Error fetching member groups:', error);
      setMemberGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  };

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const iconFadeAnim = useRef(new Animated.Value(0)).current;
  const iconSlideAnim = useRef(new Animated.Value(-30)).current;
  const formFadeAnim = useRef(new Animated.Value(0)).current;
  const formSlideAnim = useRef(new Animated.Value(30)).current;
  const backButtonAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // دریافت گروه‌های عضویت و شماره موبایل در ابتدا
    fetchProvinces();
    fetchMemberGroups();
    fetchMobileNumber(); // ✅ دریافت شماره موبایل
  }, []);

  useEffect(() => {
    // اگر مجوز نمایش اطلاعات تماس نداریم، هشدار بده و برگرد
    if (!canShowContactInfo) {
      Alert.alert(
        'دسترسی محدود',
        'نمایش و ویرایش اطلاعات تماس در پلن اشتراک شما فعال نیست. برای استفاده از این امکان، پلن خود را ارتقا دهید.',
        [
          {
            text: 'بازگشت',
            onPress: () => navigation.navigate("App", { screen: "MainTabs", params: { screen: "خانه" } }),
            style: 'cancel'
          }
        ],
        { cancelable: false }
      );
    }
  }, [canShowContactInfo, navigation]);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(backButtonAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.parallel([
        Animated.timing(iconFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true
        }),
        Animated.timing(iconSlideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true
        }),
      ]),
      Animated.parallel([
        Animated.timing(formFadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true
        }),
        Animated.timing(formSlideAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true
        }),
      ]),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true
        }),
      ])
    ).start();
  }, []);

  const showValidationErrors = (errors) => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const firstError = errors[errorKeys[0]];
      showToast(firstError, 'error');
    }
  };

  const submitContactInfo = async (values, { setErrors, resetForm }) => {
    // ✅ چک کردن تغییر شماره موبایل
    const mobileChanged = values.mobile !== initialMobile;

    console.log("=== Mobile Change Check ===");
    console.log("Initial mobile:", initialMobile);
    console.log("Current mobile:", values.mobile);
    console.log("Mobile changed:", mobileChanged);
    console.log("==========================");

    // ✅ اگر موبایل تغییر کرده، هشدار بده
    if (mobileChanged) {
      Alert.alert(
        "تغییر شماره موبایل",
        "با تغییر شماره موبایل، باید مجدداً وارد شوید. آیا ادامه می‌دهید؟",
        [
          {
            text: "لغو",
            style: "cancel",
            onPress: () => {
              console.log("Mobile change cancelled");
            }
          },
          {
            text: "ادامه",
            onPress: () => performSubmit(values, { setErrors, resetForm }, true)
          }
        ]
      );
    } else {
      // اگر تغییر نکرده، مستقیم ارسال کن
      performSubmit(values, { setErrors, resetForm }, false);
    }
  };

  const performSubmit = async (values, { setErrors, resetForm }, shouldLogout) => {
    setIsSubmitting(true);

    try {
      console.log('🚀 Submitting contact info...');
      console.log('📋 Form Values:', values);

      // ✅ چک کردن وجود Mobile
      if (!values.mobile || values.mobile.trim() === "") {
        Alert.alert('خطا', 'شماره موبایل الزامی است');
        setIsSubmitting(false);
        return;
      }

      console.log('📱 Mobile number:', values.mobile);

      // ساخت payload مطابق با API
      const payload = {
        MemberId: user?.MemberId || 0,
        AboutMe: contactData?.aboutMe || "",
        CityId: values.cityId || 0,
        ProvinceId: values.provinceId || 0,
        Mobile: values.mobile.trim(), // ✅ استفاده از mobile از فرم
        Phone1: values.phone1?.trim() || "",
        Phone2: values.phone2?.trim() || "",
        Email: values.email?.trim() || "",
        WebsiteAddress: values.websiteAddress?.trim() || "",
        TelegramAccountId: values.telegramAccountId?.trim() || "",
        WhatsappAccountMobileNumber: values.whatsappAccountMobileNumber?.trim() || "",
        InstagramAccountId: values.instagramAccountId?.trim() || "",
        Address: values.address?.trim() || "",
        MemberGroupIdList: values.memberGroupIdList || []
      };

      console.log('📤 Sending payload:');
      console.log(JSON.stringify(payload, null, 2));

      const response = await fetch(
        `${appConfig.mobileApi}MemberInfo/UpdateProfile`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
          },
          body: JSON.stringify(payload)
        }
      );

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error('خطا در به‌روزرسانی اطلاعات');
      }

      const result = await response.json();
      console.log('✅ Success:', result);

      setIsSubmitting(false);
      showToast('اطلاعات تماس با موفقیت به‌روزرسانی شد', 'success');

      // ✅ اگر باید logout کنیم
      if (shouldLogout) {
        setTimeout(async () => {
          await logout();
          Alert.alert(
            "موفق",
            "لطفاً مجدداً با شماره موبایل جدید وارد شوید",
            [
              {
                text: "باشه",
                onPress: () => navigation.navigate("Login")
              }
            ]
          );
        }, 1500);
      } else {
        setTimeout(() => {
          navigation.navigate("App", { screen: "MainTabs", params: { screen: "خانه" } });
        }, 2000);
      }

    } catch (error) {
      setIsSubmitting(false);
      console.error('❌ Submit error:', error);
      showToast(
        error.message || 'خطا در ذخیره اطلاعات',
        'error'
      );
    }
  };

  const validateForm = (values) => {
    const errors = {};

    // ✅ اعتبارسنجی موبایل
    if (!values.mobile || values.mobile.trim() === "") {
      errors.mobile = "شماره موبایل الزامی است";
    } else if (!/^09[0-9]{9}$/.test(values.mobile.trim())) {
      errors.mobile = "فرمت شماره موبایل صحیح نیست (مثال: 09123456789)";
    }

    // اعتبارسنجی ایمیل
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = "فرمت ایمیل صحیح نیست";
    }

    // اعتبارسنجی شماره تلفن (باید عددی باشد)
    if (values.phone1 && !/^[0-9+\-() ]+$/.test(values.phone1)) {
      errors.phone1 = "فرمت شماره تلفن صحیح نیست";
    }

    if (values.phone2 && !/^[0-9+\-() ]+$/.test(values.phone2)) {
      errors.phone2 = "فرمت شماره تلفن صحیح نیست";
    }

    if (values.whatsappAccountMobileNumber && !/^[0-9+\-() ]+$/.test(values.whatsappAccountMobileNumber)) {
      errors.whatsappAccountMobileNumber = "فرمت شماره واتساپ صحیح نیست";
    }

    return errors;
  };

  // ✅ نمایش loader تا زمانی که mobile بارگذاری شود
  if (loadingMobile) {
    return (
      <View style={[styles.backgroundContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText style={{ marginTop: 10, fontFamily: "Yekan_Bakh_Regular" }}>
          در حال بارگذاری...
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.backgroundContainer}>
      <View style={styles.backgroundWrapper}>
        <Image
          source={require('../../assets/backgrounds/background-1.jpg')}
          style={styles.backgroundImage}
        />
      </View>

      <LinearGradient
        colors={[
          'rgba(255,255,255,0.1)',
          'rgba(255,255,255,0.6)',
          'rgba(255,255,255,0.8)',
          'rgba(255,255,255,1)'
        ]}
        style={styles.gradientOverlay}
      >
        <Screen style={styles.container}>
          <Toast
            visible={toastVisible}
            message={toastMessage}
            type={toastType}
            onHide={() => setToastVisible(false)}
          />
          <View style={styles.headerButtons}>
            <View style={styles.headerLeft}>
              <Tooltip content="اطلاعات تماس خود شامل تلفن، ایمیل، شبکه‌های اجتماعی و آدرس را ویرایش کنید. این اطلاعات برای سایر کاربران قابل نمایش خواهد بود." />
            </View>

            <Animated.View
              style={[
                styles.backButton,
                {
                  opacity: backButtonAnim,
                  transform: [{ scale: backButtonAnim }]
                }
              ]}
            >
              <TouchableOpacity onPress={() => navigation.navigate("App", { screen: "MainTabs", params: { screen: "خانه" } })}>
                <View style={styles.backButtonGlass}>
                  <MaterialIcons name="arrow-forward" size={24} color="white" />
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Animated.View
                style={[
                  styles.iconContainer,
                  {
                    opacity: iconFadeAnim,
                    transform: [
                      { translateY: iconSlideAnim },
                      { scale: pulseAnim }
                    ]
                  }
                ]}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark || colors.primary]}
                  style={styles.iconCircle}
                >
                  <View style={styles.iconInnerCircle}>
                    <MaterialIcons
                      name="contacts"
                      color={colors.white}
                      size={50}
                    />
                  </View>
                  <View style={styles.iconRing} />
                </LinearGradient>
              </Animated.View>

              <Animated.View
                style={[
                  styles.formBox,
                  {
                    opacity: formFadeAnim,
                    transform: [{ translateY: formSlideAnim }]
                  }
                ]}
              >
                <View style={styles.glassOverlay} />

                <View style={styles.contentContainer}>
                  <AppText style={styles.titleText}>ویرایش اطلاعات تماس</AppText>

                  <Formik
                    initialValues={{
                      mobile: initialMobile, // ✅ اضافه کردن mobile به initialValues
                      provinceId: contactData?.provinceId || 0,
                      provinceName: contactData?.provinceName || "",
                      cityId: contactData?.cityId || 0,
                      cityName: contactData?.cityName || "",
                      phone1: contactData?.phone1 || "",
                      phone2: contactData?.phone2 || "",
                      email: contactData?.email || "",
                      websiteAddress: contactData?.websiteAddress || "",
                      telegramAccountId: contactData?.telegramAccountId || "",
                      instagramAccountId: contactData?.instagramAccountId || "",
                      whatsappAccountMobileNumber: contactData?.whatsappAccountMobileNumber || "",
                      address: contactData?.address || "",
                      memberGroupIdList: contactData?.memberGroupList?.map(g => g.MemberGroupId) || []
                    }}
                    onSubmit={submitContactInfo}
                    validate={validateForm}
                  >
                    {({ handleChange, handleSubmit, errors, values, setFieldValue, touched }) => (
                      <>
                        {useEffect(() => {
                          if (values.provinceId && values.cityId) {
                            fetchCities(values.provinceId).then(() => {
                              setTimeout(() => {
                                const found = cities.find(c => c.value === values.cityId);
                                if (found) {
                                  setFieldValue("cityName", found.label);
                                }
                              }, 200);
                            });
                          }
                        }, [])}

                        {/* اگر مجوز نداریم، پیام نمایش بده */}
                        {!canShowContactInfo && (
                          <View style={styles.permissionWarning}>
                            <MaterialIcons name="lock" size={24} color={colors.warning} />
                            <Text style={styles.permissionWarningText}>
                              ویرایش اطلاعات تماس در پلن اشتراک شما فعال نیست
                            </Text>
                          </View>
                        )}

                        {/* ✅ هشدار تغییر شماره موبایل */}
                        {values.mobile !== initialMobile && (
                          <View style={styles.warningBox}>
                            <MaterialIcons name="warning" size={20} color={colors.warning} />
                            <AppText style={styles.warningText}>
                              با تغییر شماره موبایل، باید مجدداً وارد شوید
                            </AppText>
                          </View>
                        )}

                        {/* ✅ فیلد موبایل - قابل ویرایش */}
                        <AppTextInput
                          autoCapitalize="none"
                          autoCorrect={false}
                          icon="phone-android"
                          keyboardType="phone-pad"
                          placeholder="شماره موبایل *"
                          onChangeText={handleChange("mobile")}
                          value={values.mobile}
                          error={errors.mobile}
                          editable={canShowContactInfo}
                        />

                        {/* بخش موقعیت مکانی */}
                        <View style={styles.sectionHeader}>
                          <MaterialIcons name="location-on" size={20} color={colors.primary} />
                          <AppText style={styles.sectionTitle}>موقعیت مکانی</AppText>
                        </View>

                        {/* استان */}
                        <View style={{ marginBottom: 15 }}>
                          <AppPicker
                            items={provinces}
                            onSelectItem={(item) => {
                              setFieldValue("provinceId", item?.value);
                              setFieldValue("provinceName", item?.label);

                              // reset city
                              setFieldValue("cityId", null);
                              setFieldValue("cityName", "");
                              fetchCities(item.value);
                            }}
                            selectedItem={
                              values.provinceId
                                ? provinces.find(p => p.value === values.provinceId)
                                : null
                            }
                            icon="map"
                            placeholder={loadingProvinces ? "در حال بارگذاری..." : "استان"}
                            disabled={loadingProvinces || !canShowContactInfo}
                          />
                        </View>

                        {/* شهر */}
                        <View style={{ marginBottom: 15 }}>
                          <AppPicker
                            items={cities}
                            onSelectItem={(item) => {
                              setFieldValue("cityId", item?.value);
                              setFieldValue("cityName", item?.label);
                            }}
                            selectedItem={
                              values.cityId
                                ? cities.find(c => c.value === values.cityId)
                                : null
                            }
                            icon="location-city"
                            placeholder={
                              !values.provinceId
                                ? "ابتدا استان را انتخاب کنید"
                                : loadingCities
                                  ? "در حال بارگذاری..."
                                  : cities.length === 0
                                    ? "شهری یافت نشد"
                                    : "شهر"
                            }
                            disabled={!values.provinceId || loadingCities || cities.length === 0 || !canShowContactInfo}
                          />

                          {/* پیام راهنما */}
                          {!values.provinceId && (
                            <AppText style={styles.helperText}>
                              لطفاً ابتدا استان را انتخاب کنید
                            </AppText>
                          )}
                        </View>

                        <AppTextInput
                          autoCapitalize="none"
                          autoCorrect={false}
                          icon="home"
                          keyboardType="default"
                          placeholder="آدرس کامل"
                          onChangeText={handleChange("address")}
                          value={values.address}
                          error={errors.address}
                          multiline={true}
                          numberOfLines={3}
                          editable={canShowContactInfo}
                        />

                        {/* بخش تلفن */}
                        <View style={styles.sectionHeader}>
                          <MaterialIcons name="phone" size={20} color={colors.primary} />
                          <AppText style={styles.sectionTitle}>اطلاعات تماس</AppText>
                        </View>

                        <AppTextInput
                          autoCapitalize="none"
                          autoCorrect={false}
                          icon="phone"
                          keyboardType="phone-pad"
                          placeholder="تلفن ثابت 1"
                          onChangeText={handleChange("phone1")}
                          value={values.phone1}
                          error={errors.phone1}
                          editable={canShowContactInfo}
                        />

                        <AppTextInput
                          autoCapitalize="none"
                          autoCorrect={false}
                          icon="phone"
                          keyboardType="phone-pad"
                          placeholder="تلفن ثابت 2 (اختیاری)"
                          onChangeText={handleChange("phone2")}
                          value={values.phone2}
                          error={errors.phone2}
                          editable={canShowContactInfo}
                        />

                        <AppTextInput
                          autoCapitalize="none"
                          autoCorrect={false}
                          icon="email"
                          keyboardType="email-address"
                          placeholder="ایمیل"
                          onChangeText={handleChange("email")}
                          value={values.email}
                          error={errors.email}
                          editable={canShowContactInfo}
                        />

                        <AppTextInput
                          autoCapitalize="none"
                          autoCorrect={false}
                          icon="language"
                          keyboardType="url"
                          placeholder="وبسایت (اختیاری)"
                          onChangeText={handleChange("websiteAddress")}
                          value={values.websiteAddress}
                          error={errors.websiteAddress}
                          editable={canShowContactInfo}
                        />

                        {/* بخش شبکه‌های اجتماعی */}
                        <View style={styles.sectionHeader}>
                          <MaterialIcons name="share" size={20} color={colors.primary} />
                          <AppText style={styles.sectionTitle}>شبکه‌های اجتماعی</AppText>
                        </View>

                        <AppTextInput
                          autoCapitalize="none"
                          autoCorrect={false}
                          icon="send"
                          keyboardType="default"
                          placeholder="آیدی تلگرام (مثال: @username)"
                          value={values.telegramAccountId}
                          error={errors.telegramAccountId}
                          editable={canShowContactInfo}
                          onChangeText={(text) => {
                            const nonPersianRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
                            const allowedFilter = /[^A-Za-z0-9._@]/g;

                            let cleaned = (text || "").replace(nonPersianRegex, "");
                            cleaned = cleaned.replace(allowedFilter, "");

                            if (cleaned.length > 0 && !cleaned.startsWith("@")) {
                              cleaned = "@" + cleaned;
                            }

                            setFieldValue("telegramAccountId", cleaned);
                          }}
                        />
                        <AppTextInput
                          autoCapitalize="none"
                          autoCorrect={false}
                          icon="camera-alt"
                          keyboardType="default"
                          placeholder="آیدی اینستاگرام (مثال: @username)"
                          value={values.instagramAccountId}
                          error={errors.instagramAccountId}
                          editable={canShowContactInfo}
                          onChangeText={(text) => {
                            const nonPersianRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
                            const allowedFilter = /[^A-Za-z0-9._@]/g;

                            let cleaned = (text || "").replace(nonPersianRegex, "");
                            cleaned = cleaned.replace(allowedFilter, "");

                            if (cleaned.length > 0 && !cleaned.startsWith("@")) {
                              cleaned = "@" + cleaned;
                            }

                            setFieldValue("instagramAccountId", cleaned);
                          }}
                        />

                        <AppTextInput
                          autoCapitalize="none"
                          autoCorrect={false}
                          icon="chat"
                          keyboardType="phone-pad"
                          placeholder="شماره واتساپ"
                          onChangeText={handleChange("whatsappAccountMobileNumber")}
                          value={values.whatsappAccountMobileNumber}
                          error={errors.whatsappAccountMobileNumber}
                          editable={canShowContactInfo}
                        />

                        {/* گروه‌های عضویت */}
                        <View style={styles.sectionDivider}>
                          <View style={styles.sectionLine} />
                          <AppText style={styles.sectionTitle}>گروه‌های عضویت</AppText>
                          <View style={styles.sectionLine} />
                        </View>

                        <View style={{ marginBottom: 15 }}>
                          <AppPicker
                            items={memberGroups}
                            selectedItems={
                              (values.memberGroupIdList || [])
                                .map(id => memberGroups.find(g => g.value === id))
                                .filter(Boolean)
                            }
                            icon="groups"
                            placeholder="انتخاب گروه‌های عضویت"
                            multiSelect={true}
                            onMultiSelectChange={(selectedItems) => {
                              const selectedIds = selectedItems.map(item => item.value);
                              console.log('Selected groups:', selectedIds);
                              setFieldValue("memberGroupIdList", selectedIds);
                            }}
                            onSelectItem={() => { }}
                            disabled={!canShowContactInfo || loadingGroups}
                          />
                        </View>

                        {errors.memberGroupIdList && (
                          <Text style={styles.errorText}>{errors.memberGroupIdList}</Text>
                        )}

                        <View style={styles.helpContainer}>
                          <MaterialIcons
                            name="info-outline"
                            size={16}
                            color={colors.medium}
                          />
                          <Text style={styles.helpText}>
                            شماره موبایل الزامی است. سایر فیلدها اختیاری هستند.
                          </Text>
                        </View>

                        <View style={styles.buttonContainer}>
                          <AppButton
                            title={isSubmitting ? "در حال ذخیره..." : "ذخیره تغییرات"}
                            onPress={handleSubmit}
                            color={colors.success}
                            disabled={isSubmitting || !canShowContactInfo || !values.mobile}
                            style={styles.submitButton}
                          />
                        </View>
                      </>
                    )}
                  </Formik>
                </View>
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Screen>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1
  },
  backgroundWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  headerButtons: {
    position: 'absolute',
    top: 15,
    left: 15,
    right: 15,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'repeat'
  },
  gradientOverlay: {
    flex: 1
  },
  container: {
    padding: 10,
    backgroundColor: 'transparent'
  },
  backButton: {
    right: 0,
    zIndex: 10,
    flexDirection: 'row-reverse',
    gap: 12,
    alignItems: 'center',
  },
  backButtonGlass: {
    backgroundColor: '#9E22AD',
    borderRadius: 25,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 206, 232, 0.5)'
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: -110,
    marginTop: 50,
    zIndex: 1000
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: 'rgba(255, 206, 232, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8
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
    zIndex: 99
  },
  iconRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 206, 232, 0.3)',
    borderStyle: 'dashed'
  },
  formBox: {
    borderRadius: 25,
    padding: 25,
    margin: 5,
    marginTop: 65,
    marginBottom: 80,
    position: 'relative',
    overflow: 'hidden'
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
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 1
  },
  contentContainer: {
    position: 'relative',
    zIndex: 1
  },
  titleText: {
    fontSize: 30,
    marginTop: 35,
    textAlign: "center",
    marginBottom: 30,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.primary,
    textShadowColor: 'rgba(255, 206, 232, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.primary,
    marginRight: 8,
  },
  helpContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
    marginBottom: 15,
  },
  helpText: {
    fontSize: 12,
    color: colors.medium,
    marginRight: 6,
    fontFamily: "Yekan_Bakh_Regular",
    flex: 1,
    textAlign: 'right',
  },
  helperText: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Regular",
    color: colors.medium,
    textAlign: 'right',
    marginTop: 5,
    marginRight: 5,
    opacity: 0.7,
  },
  buttonContainer: {
    marginTop: 20,
    gap: 15
  },
  submitButton: {
    marginBottom: 0
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 5,
    marginBottom: 10,
    textAlign: 'right',
    fontFamily: "Yekan_Bakh_Regular"
  },
  headerLeft: {
    zIndex: 10,
  },
  permissionWarning: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    gap: 10,
  },
  permissionWarningText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: colors.warning,
    textAlign: 'right',
  },
  sectionDivider: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginVertical: 20,
    gap: 10,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(203, 213, 225, 0.4)',
  },
  // ✅ استایل جدید برای هشدار تغییر موبایل
  warningBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    gap: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Yekan_Bakh_Regular",
    color: colors.warning,
    textAlign: 'right',
  },
});

export default EditContactInfoScreen;