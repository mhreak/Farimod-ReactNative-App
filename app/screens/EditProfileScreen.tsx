import React, { useEffect, useRef, useState } from "react";
import AppText from "../components/Text";
import { StyleSheet, TouchableOpacity, View, Image, Animated, ScrollView, Alert } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import AppTextInput from "../components/TextInput";
import AppButton from "../components/Button";
import Screen from "../components/Screen";
import colors from "../config/colors";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { AppNavigationProp } from "../navigation/types";
import { useAuth } from "../contexts/AuthContext";
import ProfileService from "../services/ProfileService";

const EditProfileScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { user, updateUser, logout } = useAuth();

  // State برای نگه داشتن مقادیر فرم
  const [formData, setFormData] = useState({
    cityId: 0,
    provinceId: 0,
    cityName: "",
    provinceName: "",
    mobile: "",
    phone1: "",
    phone2: "",
    email: "",
    websiteAddress: "",
    telegramAccountId: "",
    instagramAccountId: "",
    whatsappAccountMobileNumber: "",
    address: "",
  });

  // شماره موبایل اولیه برای چک کردن تغییرات
  const [initialMobile, setInitialMobile] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // بارگذاری اطلاعات کاربر از API
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    if (!user || !user.MemberId) {
      setIsLoadingData(false);
      return;
    }

    try {
      setIsLoadingData(true);
      console.log("Loading profile data for member:", user.MemberId);
      console.log("User Mobile from context:", user.Mobile); // ✅ Debug

      // ✅ ارسال user به service برای fallback
      const result = await ProfileService.getProfileInfoToEdit(user.MemberId, user);

      if (result.success && result.data) {
        const data = result.data;

        // ✅ استفاده از چند fallback
        const mobile = data.Mobile || user.Mobile || "";

        // ✅ اگر هنوز mobile خالی است، به کاربر اطلاع بده
        if (!mobile) {
          Alert.alert(
            "هشدار",
            "شماره موبایل یافت نشد. لطفاً شماره موبایل خود را وارد کنید.",
            [{ text: "باشه" }]
          );
        }

        const profileData = {
          cityId: data.CityId || 0,
          provinceId: data.ProvinceId || 0,
          cityName: data.CityName || "",
          provinceName: data.ProvinceName || "",
          mobile: mobile,
          phone1: data.Phone1 || "",
          phone2: data.Phone2 || "",
          email: data.Email || "",
          websiteAddress: data.WebsiteAddress || "",
          telegramAccountId: data.TelegramAccountId || "",
          instagramAccountId: data.InstagramAccountId || "",
          whatsappAccountMobileNumber: data.WhatsappAccountMobileNumber || "",
          address: data.Address || "",
        };

        console.log("=== Profile Data Loaded ===");
        console.log("Mobile from API:", data.Mobile);
        console.log("Mobile from user:", user.Mobile);
        console.log("Final mobile:", mobile);
        console.log("==========================");

        setFormData(profileData);
        setInitialMobile(mobile);
      } else {
        console.error("Failed to load profile data:", result.error);
        Alert.alert("خطا", "خطا در بارگذاری اطلاعات پروفایل");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      Alert.alert("خطا", "خطا در بارگذاری اطلاعات");
    } finally {
      setIsLoadingData(false);
    }
  };

  // تابع برای تغییر مقادیر فرم
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // تابع ذخیره اطلاعات
  const handleSave = async () => {
    try {
      setIsLoading(true);

      // ✅ چک کردن تغییر شماره موبایل با مقدار اولیه
      const mobileChanged = formData.mobile !== initialMobile;

      console.log("=== Mobile Change Check ===");
      console.log("Initial mobile:", initialMobile);
      console.log("Current mobile:", formData.mobile);
      console.log("Mobile changed:", mobileChanged);
      console.log("==========================");

      if (mobileChanged) {
        Alert.alert(
          "تغییر شماره موبایل",
          "با تغییر شماره موبایل، باید مجدداً وارد شوید. آیا ادامه می‌دهید؟",
          [
            {
              text: "لغو",
              style: "cancel",
              onPress: () => setIsLoading(false)
            },
            {
              text: "ادامه",
              onPress: async () => {
                await performUpdate();
                // خروج از حساب کاربری
                await logout();
                Alert.alert("موفق", "لطفاً مجدداً وارد شوید", [
                  {
                    text: "باشه",
                    onPress: () => navigation.navigate("Login" as never)
                  }
                ]);
              }
            }
          ]
        );
      } else {
        await performUpdate();
        Alert.alert("موفق", "اطلاعات با موفقیت ذخیره شد");
        navigation.navigate("App", { screen: "MainTabs", params: { screen: "خانه" } });
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("خطا", "خطا در ذخیره اطلاعات");
    } finally {
      setIsLoading(false);
    }
  };

  const performUpdate = async () => {
    if (!user || !user.MemberId) {
      Alert.alert("خطا", "اطلاعات کاربر موجود نیست");
      return;
    }

    // ✅ استفاده از mobile فرم یا در صورت خالی بودن از initialMobile
    const mobileToSend = formData.mobile || initialMobile || user.Mobile;

    if (!mobileToSend) {
      Alert.alert("خطا", "شماره موبایل الزامی است");
      return;
    }

    const updatedData = {
      MemberId: user.MemberId,
      AboutMe: "", // درباره من در این صفحه ویرایش نمی‌شود
      CityId: formData.cityId,
      ProvinceId: formData.provinceId,
      Mobile: mobileToSend, // ✅ مطمئن می‌شویم که Mobile پر است
      Phone1: formData.phone1,
      Phone2: formData.phone2,
      Email: formData.email,
      WebsiteAddress: formData.websiteAddress,
      TelegramAccountId: formData.telegramAccountId,
      WhatsappAccountMobileNumber: formData.whatsappAccountMobileNumber,
      InstagramAccountId: formData.instagramAccountId,
      Address: formData.address,
      MemberGroupIdList: [], // لیست گروه‌ها فعلاً خالی است
    };

    console.log("=== Data sending to API ===");
    console.log(JSON.stringify(updatedData, null, 2));
    console.log("===========================");

    const result = await ProfileService.updateProfile(updatedData);

    if (!result.success) {
      throw new Error(result.error);
    }

    // بروزرسانی user در context (فقط برای نمایش)
    await updateUser({
      Mobile: mobileToSend,
      Phone1: formData.phone1,
      Phone2: formData.phone2,
      Email: formData.email,
      WebsiteAddress: formData.websiteAddress,
      TelegramAccountId: formData.telegramAccountId,
      InstagramAccountId: formData.instagramAccountId,
      WhatsappAccountMobileNumber: formData.whatsappAccountMobileNumber,
      Address: formData.address,
      CityId: formData.cityId,
      ProvinceId: formData.provinceId,
      CityName: formData.cityName,
      ProvinceName: formData.provinceName,
    });
  };

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const iconFadeAnim = useRef(new Animated.Value(0)).current;
  const iconSlideAnim = useRef(new Animated.Value(-50)).current;
  const formFadeAnim = useRef(new Animated.Value(0)).current;
  const formSlideAnim = useRef(new Animated.Value(40)).current;
  const backButtonAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequential animations for better effect
    Animated.sequence([
      // Back button appears first
      Animated.timing(backButtonAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
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

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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
              styles.backButton,
              {
                opacity: backButtonAnim,
                transform: [{ scale: backButtonAnim }],
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => navigation.navigate("App", { screen: "MainTabs", params: { screen: "خانه" } })}
            >
              <View style={styles.backButtonGlass}>
                <MaterialIcons
                  name="arrow-forward"
                  size={24}
                  color="white"
                />
              </View>
            </TouchableOpacity>
          </Animated.View>

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
                <MaterialIcons name="person" color={colors.white} size={65} />
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

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.centerContainer}>
              <Animated.View
                style={[
                  styles.editBox,
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
                  <AppText style={styles.logingText}>ویرایش پروفایل</AppText>

                  {isLoadingData ? (
                    <AppText style={styles.loadingText}>در حال بارگذاری...</AppText>
                  ) : (
                    <>
                      <AppTextInput
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="phone-android"
                        keyboardType="phone-pad"
                        name="mobile"
                        placeholder="شماره موبایل"
                        value={formData.mobile}
                        onChangeText={(text) => handleChange('mobile', text)}
                      />

                      <AppTextInput
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="map"
                        keyboardType="default"
                        name="provinceName"
                        placeholder="استان"
                        value={formData.provinceName}
                        onChangeText={(text) => handleChange('provinceName', text)}
                        editable={false}
                      />

                      <AppTextInput
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="location-city"
                        keyboardType="default"
                        name="cityName"
                        placeholder="شهر"
                        value={formData.cityName}
                        onChangeText={(text) => handleChange('cityName', text)}
                        editable={false}
                      />

                      <AppTextInput
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="phone"
                        keyboardType="phone-pad"
                        name="phone1"
                        placeholder="تلفن ثابت 1"
                        value={formData.phone1}
                        onChangeText={(text) => handleChange('phone1', text)}
                      />

                      <AppTextInput
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="phone"
                        keyboardType="phone-pad"
                        name="phone2"
                        placeholder="تلفن ثابت 2"
                        value={formData.phone2}
                        onChangeText={(text) => handleChange('phone2', text)}
                      />

                      <AppTextInput
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="email"
                        keyboardType="email-address"
                        name="email"
                        placeholder="ایمیل"
                        value={formData.email}
                        onChangeText={(text) => handleChange('email', text)}
                      />

                      <AppTextInput
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="web"
                        keyboardType="url"
                        name="websiteAddress"
                        placeholder="آدرس وب‌سایت"
                        value={formData.websiteAddress}
                        onChangeText={(text) => handleChange('websiteAddress', text)}
                      />

                      <AppTextInput
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="telegram"
                        keyboardType="default"
                        name="telegramAccountId"
                        placeholder="آیدی تلگرام"
                        value={formData.telegramAccountId}
                        onChangeText={(text) => handleChange('telegramAccountId', text)}
                      />

                      <AppTextInput
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="instagram"
                        keyboardType="default"
                        name="instagramAccountId"
                        placeholder="آیدی اینستاگرام"
                        value={formData.instagramAccountId}
                        onChangeText={(text) => handleChange('instagramAccountId', text)}
                      />

                      <AppTextInput
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="whatsapp"
                        keyboardType="phone-pad"
                        name="whatsappAccountMobileNumber"
                        placeholder="شماره واتساپ"
                        value={formData.whatsappAccountMobileNumber}
                        onChangeText={(text) => handleChange('whatsappAccountMobileNumber', text)}
                      />

                      <AppTextInput
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="location-on"
                        keyboardType="default"
                        name="address"
                        placeholder="آدرس"
                        value={formData.address}
                        onChangeText={(text) => handleChange('address', text)}
                        multiline
                        numberOfLines={3}
                      />

                      <AppButton
                        title={isLoading ? "در حال ذخیره..." : "ذخیره"}
                        onPress={handleSave}
                        color={colors.success}
                        disabled={isLoading || isLoadingData}
                      />
                    </>
                  )}
                </View>
              </Animated.View>
            </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 80,
    paddingBottom: 30,
  },
  backButton: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 10,
  },
  backButtonGlass: {
    backgroundColor: '#9E22AD',
    borderRadius: 25,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 206, 232, 0.5)',
  },
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  editBox: {
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
    zIndex: 1000,
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
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
    fontSize: 30,
    textAlign: "center",
    marginBottom: 30,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.primary,
    textShadowColor: 'rgba(255, 206, 232, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
    color: colors.primary,
    fontFamily: "Yekan_Bakh_Regular",
  },
});

export default EditProfileScreen;