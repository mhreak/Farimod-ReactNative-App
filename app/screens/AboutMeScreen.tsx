import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import AppText from "../components/Text";
import {
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
  Animated,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../config/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import MainBackground from "../components/MainBackground";
import Toast from "../components/Toast";
import ImageUpload from "../components/ImageUpload";
import appConfig from "../config/config";
import { VideoView, useVideoPlayer } from 'expo-video';
import Tooltip from '../components/Tooltip';

const { width, height } = Dimensions.get('window');

const modernColors = {
  ...colors,
  primary: "#6366f1",
  primaryDark: "#4f46e5",
  primaryLight: "#e0e7ff",
  secondary: "#8b5cf6",
  tertiary: "#06b6d4",
  accent: "#10b981",
  surface: "#ffffff",
  dark: "#2c3e50",
  medium: "#34495e",
  light: "#ecf0f1",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#06b6d4",
  gradientStart: "#6366f1",
  gradientEnd: "#8b5cf6",
  fashionIcon: "#8b5cf6",
  skillIcon: "#10b981",
  experienceIcon: "#f59e0b",
  educationIcon: "#8b5cf6",
  contactIcon: "#06b6d4",
  hobbyIcon: "#ef4444",
  goalIcon: "#6366f1",
  phoneIcon: "#10b981",
  emailIcon: "#ef4444",
  websiteIcon: "#06b6d4",
  telegramIcon: "#0088cc",
  instagramIcon: "#E1306C",
  whatsappIcon: "#25D366",
  addressIcon: "#f59e0b",
  locationIcon: "#8b5cf6",
  groupIcon: "#6366f1",
};

// Separate EditableTextInput component to isolate re-renders
const EditableTextInput = React.memo(({
  value,
  onChangeText,
  onSave,
  onCancel,
  loading
}) => {
  const inputRef = useRef(null);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSave = () => {
    onSave(localValue);
  };

  const handleCancel = () => {
    setLocalValue(value);
    onCancel();
  };

  return (
    <>
      <TextInput
        ref={inputRef}
        style={styles.inlineTextInput}
        value={localValue}
        onChangeText={setLocalValue}
        placeholder="متن درباره خود را وارد کنید..."
        placeholderTextColor="rgba(0,0,0,0.5)"
        multiline={true}
        textAlign="right"
        blurOnSubmit={false}
        editable={!loading}
        autoFocus={true}
        textAlignVertical="top"
      />
      <View style={styles.editButtonsRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.saveButton]}
          onPress={handleSave}
          disabled={loading}
        >
          <MaterialIcons
            name="check"
            size={18}
            color={modernColors.surface}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.cancelButton]}
          onPress={handleCancel}
          disabled={loading}
        >
          <MaterialIcons
            name="close"
            size={18}
            color={modernColors.surface}
          />
        </TouchableOpacity>
      </View>
    </>
  );
});

const AboutMeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // State
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    aboutMe: '',
    avatarUrl: null,
    introVideo: null,
    name: '',
    title: '',
    // Contact Info
    cityId: null,
    cityName: '',
    provinceId: null,
    provinceName: '',
    phone1: '',
    phone2: '',
    email: '',
    websiteAddress: '',
    telegramAccountId: '',
    instagramAccountId: '',
    whatsappAccountMobileNumber: '',
    address: '',
    memberGroupList: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');
  const [videoModalVisible, setVideoModalVisible] = useState(false);

  const player = useVideoPlayer(profileData.introVideo || '', (player) => {
    player.loop = false;
    player.play();
  });

  useEffect(() => {
    if (!player) return;
    if (videoModalVisible) {
      player.play();    // ✅ اضافه شد
    } else {
      player.pause();
    }
  }, [videoModalVisible, player]);

  useEffect(() => {
    if (profileData.introVideo && player) {
      player.replace(profileData.introVideo);
      player.pause();  // ✅ بعد از replace، pause کن چون modal بسته‌ست
    }
  }, [profileData.introVideo]);

  const fetchAllData = useCallback(async () => {
    if (!user?.MemberId || initialLoadDone) return;

    try {
      setLoading(true);
      setError(null);

      console.log("Loading profile data for member:", user.MemberId);
      console.log("User Mobile from context:", user.Mobile); // ✅ Debug

      const apiUrl = `${appConfig.mobileApi}MemberInfo/GetProfileInfoToEdit?memberId=${user.MemberId}`;
      console.log("📍 API URL:", apiUrl);

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`خطای سرور: ${response.status}`);
      }

      const result = await response.json();
      console.log("Profile data received:", result);

      // ✅ استفاده از mobile از user context اگر API null برگرداند
      const mobile = result.Mobile || user.Mobile || "";

      console.log("=== Mobile Resolution ===");
      console.log("From API:", result.Mobile);
      console.log("From Context:", user.Mobile);
      console.log("Final:", mobile);
      console.log("========================");

      setProfileData({
        aboutMe: result.AboutMeText || '',
        avatarUrl: result.AvatarImageURL,
        introVideo: result.IntroductionVideoURL,
        name: user?.FirstName && user?.LastName ? `${user.FirstName} ${user.LastName}` : "کاربر",
        title: user?.Skill || "طراح",
        cityId: result.CityId,
        cityName: result.CityName || '',
        provinceId: result.ProvinceId,
        provinceName: result.ProvinceName || '',
        phone1: result.Phone1 || '',
        phone2: result.Phone2 || '',
        email: result.Email || '',
        websiteAddress: result.WebsiteAddress || '',
        telegramAccountId: result.TelegramAccountId || '',
        instagramAccountId: result.InstagramAccountId || '',
        whatsappAccountMobileNumber: result.WhatsappAccountMobileNumber || '',
        address: result.Address || '',
        memberGroupList: result.MemberGroupList || [],
        mobile: mobile, // ✅ اضافه کردن mobile به state
      });

      setInitialLoadDone(true);

    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.MemberId, user?.FirstName, user?.LastName, user?.Skill, user?.Mobile, initialLoadDone]);
  const handleVideoPress = useCallback(() => {
    if (profileData.introVideo) {
      setVideoModalVisible(true);
    }
  }, [profileData.introVideo]);

  const updateAboutMe = useCallback(async (newText) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Updating AboutMe text...");

      // 1. ابتدا تمام اطلاعات فعلی را دریافت می‌کنیم
      const getUrl = `${appConfig.mobileApi}MemberInfo/GetProfileInfoToEdit?memberId=${user?.MemberId}`;
      console.log("📍 GET URL:", getUrl);

      const response = await fetch(getUrl);

      if (!response.ok) {
        throw new Error(`خطای سرور در دریافت اطلاعات: ${response.status}`);
      }

      const currentData = await response.json();
      console.log("Current data received:", currentData);

      // 2. ✅ استفاده از user.Mobile اگر API null برگرداند
      const mobile = currentData.Mobile || user?.Mobile;

      console.log("=== Mobile Resolution ===");
      console.log("Mobile from API:", currentData.Mobile);
      console.log("Mobile from user context:", user?.Mobile);
      console.log("Final mobile to use:", mobile);
      console.log("========================");

      // 3. ✅ اگر Mobile هنوز null است، خطا بده
      if (!mobile) {
        Alert.alert(
          'خطا',
          'شماره موبایل شما یافت نشد. لطفاً ابتدا از بخش "ویرایش پروفایل" شماره موبایل خود را وارد کنید.',
          [
            {
              text: 'باشه',
              onPress: () => navigation.navigate('EditProfile')
            }
          ]
        );
        throw new Error('شماره موبایل موجود نیست');
      }

      // 4. تبدیل MemberGroupList به آرایه ID ها
      let memberGroupIds = [];
      if (currentData.MemberGroupList && Array.isArray(currentData.MemberGroupList)) {
        memberGroupIds = currentData.MemberGroupList
          .filter(g => g && g.MemberGroupId)
          .map(g => g.MemberGroupId);
      }

      // 5. داده‌های کامل را با AboutMe جدید آماده می‌کنیم
      const updatePayload = {
        MemberId: user?.MemberId,
        AboutMe: newText || '',
        CityId: currentData.CityId || 0,
        ProvinceId: currentData.ProvinceId || 0,
        Mobile: mobile, // ✅ استفاده از mobile که حتماً مقدار دارد
        Phone1: currentData.Phone1 || '',
        Phone2: currentData.Phone2 || '',
        Email: currentData.Email || '',
        WebsiteAddress: currentData.WebsiteAddress || '',
        TelegramAccountId: currentData.TelegramAccountId || '',
        WhatsappAccountMobileNumber: currentData.WhatsappAccountMobileNumber || '',
        InstagramAccountId: currentData.InstagramAccountId || '',
        Address: currentData.Address || '',
        MemberGroupIdList: memberGroupIds,
      };

      console.log("=== Sending to UpdateProfile API ===");
      console.log(JSON.stringify(updatePayload, null, 2));
      console.log("====================================");

      // 6. ارسال به API
      const updateUrl = `${appConfig.mobileApi}MemberInfo/UpdateProfile`;
      console.log("📍 POST URL:", updateUrl);

      const updateResponse = await fetch(
        updateUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatePayload)
        }
      );

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error("Update failed:", errorText);
        throw new Error(`خطای سرور در بروزرسانی: ${updateResponse.status} - ${errorText}`);
      }

      const updateResult = await updateResponse.json();
      console.log("Update successful:", updateResult);

      // 7. بروزرسانی state محلی
      setProfileData(prev => ({
        ...prev,
        aboutMe: newText
      }));

      return true;
    } catch (err) {
      console.error('Error updating AboutMe:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.MemberId, user?.Mobile, navigation]);

  const updateAvatar = useCallback(async (imageFile) => {
    try {
      setUploadingAvatar(true);
      setLoading(true);
      setError(null);

      showToast('در حال آپلود تصویر...', 'info');

      if (!imageFile?.uri) {
        throw new Error('فایل تصویر یافت نشد');
      }

      const fileUri = imageFile.uri.startsWith('file://')
        ? imageFile.uri
        : `file://${imageFile.uri}`;

      const getMimeType = (uri) => {
        const ext = uri.split('.').pop()?.toLowerCase();
        if (ext === 'png') return 'image/png';
        if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
        return 'image/jpeg';
      };

      const mimeType = getMimeType(fileUri);

      const formData = new FormData();
      formData.append('avatarImage', {
        uri: fileUri,
        name: imageFile.name || `avatar_${Date.now()}.jpg`,
        type: mimeType,
      });

      const apiUrl = `${appConfig.mobileApi}MemberInfo/UploadAvatarImage?memberId=${user?.MemberId}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: '*/*',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`خطای سرور: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      setProfileData((prev) => ({
        ...prev,
        avatarUrl: result.AvatarImageURL || fileUri,
      }));

      showToast('تصویر با موفقیت آپلود شد', 'success');
      return true;
    } catch (err) {
      console.error('Error updating avatar:', err);
      showToast('خطا در آپلود تصویر: ' + err.message, 'error');
      setError(err.message);
      return false;
    } finally {
      setUploadingAvatar(false);
      setLoading(false);
    }
  }, [user?.MemberId]);

  const deleteAvatar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${appConfig.mobileApi}MemberInfo/DeleteAvatarImage?memberId=${user?.MemberId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`خطای سرور: ${response.status}`);
      }

      setProfileData(prev => ({
        ...prev,
        avatarUrl: null
      }));

      return true;
    } catch (err) {
      console.error('Error deleting avatar:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.MemberId]);

  const updateIntroVideo = useCallback(async (videoFile) => {
    try {
      setUploadingVideo(true);
      setLoading(true);
      setError(null);

      showToast('در حال آپلود ویدیو...', 'info');

      if (!videoFile?.uri) {
        throw new Error('فایل ویدیو یافت نشد');
      }

      const fileUri = videoFile.uri.startsWith('file://')
        ? videoFile.uri
        : `file://${videoFile.uri}`;

      const getMimeType = (uri) => {
        const ext = uri.split('.').pop()?.toLowerCase();
        if (ext === 'mp4') return 'video/mp4';
        if (ext === 'mov') return 'video/quicktime';
        if (ext === 'm4v') return 'video/x-m4v';
        return 'video/mp4';
      };

      const mimeType = getMimeType(fileUri);

      const formData = new FormData();
      formData.append('videoFile', {
        uri: fileUri,
        name: videoFile.name || `intro_${Date.now()}.mp4`,
        type: mimeType,
      });

      const apiUrl = `${appConfig.mobileApi}MemberInfo/UploadIntroductionVideo?memberId=${user?.MemberId}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: '*/*',
        },
      });

      if (!response.ok) {
        if (response.status === 413) {
          throw new Error('حجم ویدیو بیش از حد مجاز است (۶۰ مگابایت)');
        } else if (response.status === 415) {
          throw new Error('فرمت ویدیو پشتیبانی نمی‌شود');
        }

        const errorText = await response.text();
        throw new Error(`خطای سرور: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      setProfileData((prev) => ({
        ...prev,
        introVideo: result.IntroductionVideoURL || fileUri,
      }));

      showToast('ویدیو با موفقیت آپلود شد', 'success');
      return true;
    } catch (err) {
      console.error('Error updating intro video:', err);
      showToast('خطا در آپلود ویدیو: ' + err.message, 'error');
      setError(err.message);
      return false;
    } finally {
      setUploadingVideo(false);
      setLoading(false);
    }
  }, [user?.MemberId]);

  const deleteIntroVideo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${appConfig.mobileApi}MemberInfo/DeleteIntroductionVideo?memberId=${user?.MemberId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`خطای سرور: ${response.status}`);
      }

      setProfileData(prev => ({
        ...prev,
        introVideo: null
      }));

      return true;
    } catch (err) {
      console.error('Error deleting intro video:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.MemberId]);

  // Initialize animations
  useEffect(() => {
    fetchAllData();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Toast helper
  const showToast = useCallback((message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  }, []);

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error]);

  // Handlers
  const handleSaveEdit = useCallback(async (newValue) => {
    if (newValue.trim() === '') {
      Alert.alert('خطا', 'لطفا متن را وارد کنید');
      return;
    }

    const success = await updateAboutMe(newValue.trim());

    if (success) {
      setIsEditing(false);
      Keyboard.dismiss();
      showToast('اطلاعات با موفقیت به‌روزرسانی شد', 'success');
    } else {
      showToast('خطا در به‌روزرسانی اطلاعات', 'error');
    }
  }, [updateAboutMe, showToast]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    Keyboard.dismiss();
  }, []);

  const handleAvatarChange = useCallback(async (image) => {
    if (image) {
      await updateAvatar(image);
    } else {
      const success = await deleteAvatar();
      if (success) {
        showToast('تصویر پروفایل حذف شد', 'success');
      } else {
        showToast('خطا در حذف تصویر', 'error');
      }
    }
  }, [updateAvatar, deleteAvatar, showToast]);

  const handleVideoChange = useCallback(async (video) => {
    if (video) {
      await updateIntroVideo(video);
    } else {
      const success = await deleteIntroVideo();
      if (success) {
        showToast('ویدئوی معرفی حذف شد', 'success');
      } else {
        showToast('خطا در حذف ویدئو', 'error');
      }
    }
  }, [updateIntroVideo, deleteIntroVideo, showToast]);

  const handleEditContactInfo = useCallback(() => {
    navigation.navigate('EditContactInfo', { contactData: profileData });
  }, [navigation, profileData]);

  const getIconColor = useCallback((iconType) => {
    const iconColors = {
      person: modernColors.fashionIcon,
      videocam: modernColors.tertiary,
      camera: modernColors.accent,
      phone: modernColors.phoneIcon,
      email: modernColors.emailIcon,
      website: modernColors.websiteIcon,
      telegram: modernColors.telegramIcon,
      instagram: modernColors.instagramIcon,
      whatsapp: modernColors.whatsappIcon,
      address: modernColors.addressIcon,
      location: modernColors.locationIcon,
      group: modernColors.groupIcon,
    };
    return iconColors[iconType] || modernColors.primary;
  }, []);

  // چک کردن وجود اطلاعات تماس
  const hasContactInfo = profileData.provinceName || profileData.cityName || profileData.address ||
    profileData.phone1 || profileData.phone2 || profileData.email || profileData.websiteAddress ||
    profileData.telegramAccountId || profileData.instagramAccountId ||
    profileData.whatsappAccountMobileNumber ||
    (profileData.memberGroupList && profileData.memberGroupList.length > 0);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
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
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("App", { screen: "MainTabs", params: { screen: "پروفایل" } })}
          >
            <View style={styles.backButtonContainer}>
              <MaterialIcons
                name="arrow-forward"
                size={24}
                color="#6366f1"
              />
            </View>
          </TouchableOpacity>
          <View style={styles.headerLeft}>
            <Tooltip content="در این بخش می‌توانید تمام اطلاعات پروفایل خود شامل متن درباره من، تصویر، ویدیو و اطلاعات تماس را مشاهده و مدیریت کنید." />
          </View>

          <Animated.View
            style={[
              styles.sectionTitleContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <AppText style={styles.sectionTitle}>پروفایل من</AppText>
          </Animated.View>

          <Animated.View
            style={[
              styles.cardsContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* ═══════════════════════════════════════════════ */}
            {/* بخش اطلاعات تماس (بالای درباره من) */}
            {/* ═══════════════════════════════════════════════ */}

            {/* موقعیت مکانی */}
            {(profileData.provinceName || profileData.cityName) && (
              <View style={styles.detailItem}>
                <View style={[styles.labelContainer, { justifyContent: 'space-between' }]}>
                  <View style={{ flexDirection: 'row-reverse', alignItems: 'center', flex: 1 }}>
                    <LinearGradient
                      colors={[getIconColor('location'), getIconColor('location') + 'CC']}
                      style={styles.iconWrapper}
                    >
                      <MaterialIcons
                        name="location-on"
                        size={22}
                        color={modernColors.surface}
                      />
                    </LinearGradient>
                    <AppText style={styles.label}>موقعیت مکانی</AppText>
                  </View>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={handleEditContactInfo}
                    disabled={loading}
                  >
                    <MaterialIcons
                      name="edit"
                      size={18}
                      color={modernColors.surface}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.contentContainer}>
                  <AppText style={styles.value}>
                    {profileData.provinceName && profileData.cityName
                      ? `${profileData.provinceName}، ${profileData.cityName}`
                      : profileData.provinceName || profileData.cityName}
                  </AppText>
                </View>
                <View style={[styles.featureAccent, { backgroundColor: getIconColor('location') + "60" }]} />
              </View>
            )}

            {/* آدرس */}
            {profileData.address && (
              <View style={styles.detailItem}>
                <View style={[styles.labelContainer, { justifyContent: 'space-between' }]}>
                  <View style={{ flexDirection: 'row-reverse', alignItems: 'center', flex: 1 }}>
                    <LinearGradient
                      colors={[getIconColor('address'), getIconColor('address') + 'CC']}
                      style={styles.iconWrapper}
                    >
                      <MaterialIcons
                        name="home"
                        size={22}
                        color={modernColors.surface}
                      />
                    </LinearGradient>
                    <AppText style={styles.label}>آدرس</AppText>
                  </View>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={handleEditContactInfo}
                    disabled={loading}
                  >
                    <MaterialIcons
                      name="edit"
                      size={18}
                      color={modernColors.surface}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.contentContainer}>
                  <AppText style={styles.value}>{profileData.address}</AppText>
                </View>
                <View style={[styles.featureAccent, { backgroundColor: getIconColor('address') + "60" }]} />
              </View>
            )}

            {/* تلفن 1 */}
            {profileData.phone1 && (
              <View style={styles.detailItem}>
                <View style={[styles.labelContainer, { justifyContent: 'space-between' }]}>
                  <View style={{ flexDirection: 'row-reverse', alignItems: 'center', flex: 1 }}>
                    <LinearGradient
                      colors={[getIconColor('phone'), getIconColor('phone') + 'CC']}
                      style={styles.iconWrapper}
                    >
                      <MaterialIcons
                        name="phone"
                        size={22}
                        color={modernColors.surface}
                      />
                    </LinearGradient>
                    <AppText style={styles.label}>موبایل</AppText>
                  </View>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={handleEditContactInfo}
                    disabled={loading}
                  >
                    <MaterialIcons
                      name="edit"
                      size={18}
                      color={modernColors.surface}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.contentContainer}>
                  <AppText style={styles.value}>{profileData.phone1}</AppText>
                </View>
                <View style={[styles.featureAccent, { backgroundColor: getIconColor('phone') + "60" }]} />
              </View>
            )}

            {/* تلفن 2 */}
            {profileData.phone2 && (
              <View style={styles.detailItem}>
                <View style={[styles.labelContainer, { justifyContent: 'space-between' }]}>
                  <View style={{ flexDirection: 'row-reverse', alignItems: 'center', flex: 1 }}>
                    <LinearGradient
                      colors={[getIconColor('phone'), getIconColor('phone') + 'CC']}
                      style={styles.iconWrapper}
                    >
                      <MaterialIcons
                        name="phone"
                        size={22}
                        color={modernColors.surface}
                      />
                    </LinearGradient>
                    <AppText style={styles.label}>تلفن</AppText>
                  </View>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={handleEditContactInfo}
                    disabled={loading}
                  >
                    <MaterialIcons
                      name="edit"
                      size={18}
                      color={modernColors.surface}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.contentContainer}>
                  <AppText style={styles.value}>{profileData.phone2}</AppText>
                </View>
                <View style={[styles.featureAccent, { backgroundColor: getIconColor('phone') + "60" }]} />
              </View>
            )}

            {/* ایمیل */}
            {profileData.email && (
              <View style={styles.detailItem}>
                <View style={[styles.labelContainer, { justifyContent: 'space-between' }]}>
                  <View style={{ flexDirection: 'row-reverse', alignItems: 'center', flex: 1 }}>
                    <LinearGradient
                      colors={[getIconColor('email'), getIconColor('email') + 'CC']}
                      style={styles.iconWrapper}
                    >
                      <MaterialIcons
                        name="email"
                        size={22}
                        color={modernColors.surface}
                      />
                    </LinearGradient>
                    <AppText style={styles.label}>ایمیل</AppText>
                  </View>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={handleEditContactInfo}
                    disabled={loading}
                  >
                    <MaterialIcons
                      name="edit"
                      size={18}
                      color={modernColors.surface}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.contentContainer}>
                  <AppText style={styles.value}>{profileData.email}</AppText>
                </View>
                <View style={[styles.featureAccent, { backgroundColor: getIconColor('email') + "60" }]} />
              </View>
            )}

            {/* وبسایت */}
            {profileData.websiteAddress && (
              <View style={styles.detailItem}>
                <View style={[styles.labelContainer, { justifyContent: 'space-between' }]}>
                  <View style={{ flexDirection: 'row-reverse', alignItems: 'center', flex: 1 }}>
                    <LinearGradient
                      colors={[getIconColor('website'), getIconColor('website') + 'CC']}
                      style={styles.iconWrapper}
                    >
                      <MaterialIcons
                        name="language"
                        size={22}
                        color={modernColors.surface}
                      />
                    </LinearGradient>
                    <AppText style={styles.label}>وبسایت</AppText>
                  </View>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={handleEditContactInfo}
                    disabled={loading}
                  >
                    <MaterialIcons
                      name="edit"
                      size={18}
                      color={modernColors.surface}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.contentContainer}>
                  <AppText style={styles.value}>{profileData.websiteAddress}</AppText>
                </View>
                <View style={[styles.featureAccent, { backgroundColor: getIconColor('website') + "60" }]} />
              </View>
            )}

            {/* تلگرام */}
            {profileData.telegramAccountId && (
              <View style={styles.detailItem}>
                <View style={[styles.labelContainer, { justifyContent: 'space-between' }]}>
                  <View style={{ flexDirection: 'row-reverse', alignItems: 'center', flex: 1 }}>
                    <LinearGradient
                      colors={[getIconColor('telegram'), getIconColor('telegram') + 'CC']}
                      style={styles.iconWrapper}
                    >
                      <MaterialIcons
                        name="send"
                        size={22}
                        color={modernColors.surface}
                      />
                    </LinearGradient>
                    <AppText style={styles.label}>تلگرام</AppText>
                  </View>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={handleEditContactInfo}
                    disabled={loading}
                  >
                    <MaterialIcons
                      name="edit"
                      size={18}
                      color={modernColors.surface}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.contentContainer}>
                  <AppText style={styles.value}>{profileData.telegramAccountId}</AppText>
                </View>
                <View style={[styles.featureAccent, { backgroundColor: getIconColor('telegram') + "60" }]} />
              </View>
            )}

            {/* اینستاگرام */}
            {profileData.instagramAccountId && (
              <View style={styles.detailItem}>
                <View style={[styles.labelContainer, { justifyContent: 'space-between' }]}>
                  <View style={{ flexDirection: 'row-reverse', alignItems: 'center', flex: 1 }}>
                    <LinearGradient
                      colors={[getIconColor('instagram'), getIconColor('instagram') + 'CC']}
                      style={styles.iconWrapper}
                    >
                      <MaterialIcons
                        name="camera-alt"
                        size={22}
                        color={modernColors.surface}
                      />
                    </LinearGradient>
                    <AppText style={styles.label}>اینستاگرام</AppText>
                  </View>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={handleEditContactInfo}
                    disabled={loading}
                  >
                    <MaterialIcons
                      name="edit"
                      size={18}
                      color={modernColors.surface}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.contentContainer}>
                  <AppText style={styles.value}>{profileData.instagramAccountId}</AppText>
                </View>
                <View style={[styles.featureAccent, { backgroundColor: getIconColor('instagram') + "60" }]} />
              </View>
            )}

            {/* واتساپ */}
            {profileData.whatsappAccountMobileNumber && (
              <View style={styles.detailItem}>
                <View style={[styles.labelContainer, { justifyContent: 'space-between' }]}>
                  <View style={{ flexDirection: 'row-reverse', alignItems: 'center', flex: 1 }}>
                    <LinearGradient
                      colors={[getIconColor('whatsapp'), getIconColor('whatsapp') + 'CC']}
                      style={styles.iconWrapper}
                    >
                      <MaterialIcons
                        name="chat"
                        size={22}
                        color={modernColors.surface}
                      />
                    </LinearGradient>
                    <AppText style={styles.label}>واتساپ</AppText>
                  </View>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={handleEditContactInfo}
                    disabled={loading}
                  >
                    <MaterialIcons
                      name="edit"
                      size={18}
                      color={modernColors.surface}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.contentContainer}>
                  <AppText style={styles.value}>{profileData.whatsappAccountMobileNumber}</AppText>
                </View>
                <View style={[styles.featureAccent, { backgroundColor: getIconColor('whatsapp') + "60" }]} />
              </View>
            )}

            {/* گروه‌های عضویت */}
            {profileData.memberGroupList && profileData.memberGroupList.length > 0 && (
              <View style={styles.detailItem}>
                <View style={[styles.labelContainer, { justifyContent: 'space-between' }]}>
                  <View style={{ flexDirection: 'row-reverse', alignItems: 'center', flex: 1 }}>
                    <LinearGradient
                      colors={[getIconColor('group'), getIconColor('group') + 'CC']}
                      style={styles.iconWrapper}
                    >
                      <MaterialIcons
                        name="groups"
                        size={22}
                        color={modernColors.surface}
                      />
                    </LinearGradient>
                    <AppText style={styles.label}>گروه‌های عضویت</AppText>
                  </View>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={handleEditContactInfo}
                    disabled={loading}
                  >
                    <MaterialIcons
                      name="edit"
                      size={18}
                      color={modernColors.surface}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.contentContainer}>
                  {profileData.memberGroupList.map((group, index) => (
                    <View key={group.MemberGroupId} style={styles.groupItem}>
                      <View style={styles.groupBadge}>
                        <AppText style={styles.groupBadgeText}>
                          {group.MemberGroupName}
                        </AppText>
                      </View>
                    </View>
                  ))}
                </View>
                <View style={[styles.featureAccent, { backgroundColor: getIconColor('group') + "60" }]} />
              </View>
            )}



            {/* ═══════════════════════════════════════════════ */}
            {/* بخش درباره من، ویدیو و عکس (پایین‌تر) */}
            {/* ═══════════════════════════════════════════════ */}

            {/* بخش درباره من - متن */}
            <View style={styles.detailItem}>
              <View style={[styles.labelContainer, { justifyContent: 'space-between' }]}>
                <View style={{ flexDirection: 'row-reverse', alignItems: 'center', flex: 1 }}>
                  <LinearGradient
                    colors={[getIconColor('person'), getIconColor('person') + 'CC']}
                    style={styles.iconWrapper}
                  >
                    <MaterialIcons
                      name="person"
                      size={22}
                      color={modernColors.surface}
                    />
                  </LinearGradient>
                  <AppText style={styles.label}>درباره من</AppText>
                </View>
                {!isEditing && (
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setIsEditing(true)}
                    disabled={loading}
                  >
                    <MaterialIcons
                      name="edit"
                      size={18}
                      color={modernColors.surface}
                    />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.contentContainer}>
                {isEditing ? (
                  <EditableTextInput
                    value={profileData.aboutMe}
                    onSave={handleSaveEdit}
                    onCancel={handleCancelEdit}
                    loading={loading}
                  />
                ) : (
                  <AppText style={styles.descriptionValue}>
                    {profileData.aboutMe || 'متنی وارد نشده است'}
                  </AppText>
                )}
              </View>
              <View style={[styles.featureAccent, { backgroundColor: getIconColor('person') + "60" }]} />
            </View>

            {/* ویدئوی معرفی */}
            <View style={styles.detailItem}>
              <View style={[styles.labelContainer, { justifyContent: 'space-between' }]}>
                <View style={{ flexDirection: 'row-reverse', alignItems: 'center', flex: 1 }}>
                  <LinearGradient
                    colors={[getIconColor('videocam'), getIconColor('videocam') + 'CC']}
                    style={styles.iconWrapper}
                  >
                    <MaterialIcons
                      name="videocam"
                      size={22}
                      color={modernColors.surface}
                    />
                  </LinearGradient>
                  <AppText style={styles.label}>ویدئوی معرفی</AppText>
                </View>
              </View>

              <View style={styles.contentContainer}>
                {uploadingVideo && (
                  <View style={styles.uploadingOverlay}>
                    <View style={styles.uploadingContent}>
                      <ActivityIndicator size="large" color={modernColors.tertiary} />
                      <AppText style={styles.uploadingText}>در حال آپلود ویدیو...</AppText>
                    </View>
                  </View>
                )}
                <ImageUpload
                  key={`video-${profileData.introVideo || 'no-video'}`}
                  isMultiple={true}
                  maxImages={1}
                  allowVideos={true}
                  allowImages={false}
                  allowCamera={true}
                  allowGallery={true}
                  allowEditing={false}
                  aspectRatio={[16, 9]}
                  initialImages={profileData.introVideo ? [{ id: '1', uri: profileData.introVideo }] : []}
                  onImagesChange={(videos) => {
                    if (videos && videos.length > 0) {
                      handleVideoChange(videos[0]);
                    } else {
                      handleVideoChange(null);
                    }
                  }}
                  placeholder="ویدئوی معرفی"
                  onShowToast={showToast}
                  style={styles.videoUpload}
                  loading={loading}
                  onPress={handleVideoPress}
                />
              </View>
              <View style={[styles.featureAccent, { backgroundColor: getIconColor('videocam') + "60" }]} />
            </View>

            {/* تصویر پروفایل */}
            <View style={styles.detailItem}>
              <View style={[styles.labelContainer, { justifyContent: 'space-between' }]}>
                <View style={{ flexDirection: 'row-reverse', alignItems: 'center', flex: 1 }}>
                  <LinearGradient
                    colors={[getIconColor('camera'), getIconColor('camera') + 'CC']}
                    style={styles.iconWrapper}
                  >
                    <MaterialIcons
                      name="camera-alt"
                      size={22}
                      color={modernColors.surface}
                    />
                  </LinearGradient>
                  <AppText style={styles.label}>تصویر پروفایل</AppText>
                </View>
              </View>

              <View style={styles.contentContainer}>
                {uploadingAvatar && (
                  <View style={styles.uploadingOverlay}>
                    <View style={styles.uploadingContent}>
                      <ActivityIndicator size="large" color={modernColors.accent} />
                      <AppText style={styles.uploadingText}>در حال آپلود تصویر...</AppText>
                    </View>
                  </View>
                )}
                <ImageUpload
                  key={`avatar-${profileData.avatarUrl || 'no-avatar'}`}
                  isMultiple={false}
                  allowVideos={false}
                  allowImages={true}
                  allowCamera={true}
                  allowGallery={true}
                  allowEditing={true}
                  aspectRatio={[1, 1]}
                  initialImage={profileData.avatarUrl ? { id: '1', uri: profileData.avatarUrl } : null}
                  onImageChange={handleAvatarChange}
                  placeholder="تصویر پروفایل"
                  onShowToast={showToast}
                  style={styles.avatarUpload}
                  loading={loading}
                />
              </View>
              <View style={[styles.featureAccent, { backgroundColor: getIconColor('camera') + "60" }]} />
            </View>
          </Animated.View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal ویدیو */}
      <Modal
        visible={videoModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setVideoModalVisible(false);
          player?.pause();
        }}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalCloseArea}
            activeOpacity={1}
            onPress={() => {
              setVideoModalVisible(false);
              player?.pause();
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={styles.modalContent}
            >
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => {
                  setVideoModalVisible(false);
                  player?.pause();
                }}
              >
                <MaterialIcons name="close" size={28} color="#ffffff" />
              </TouchableOpacity>

              {profileData.introVideo && (
                <VideoView
                  player={player}
                  style={styles.modalVideo}
                  contentFit="contain"
                  allowsFullscreen
                  allowsPictureInPicture
                />
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </Modal>
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
  backButton: {
    position: 'absolute',
    top: StatusBar.currentHeight ? StatusBar.currentHeight + 16 : 60,
    right: 20,
    zIndex: 1000,
  },
  backButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    position: 'relative',
  },
  modalCloseButton: {
    position: 'absolute',
    top: -50,
    right: 0,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalVideo: {
    width: '100%',
    height: (width * 0.9) * (9 / 16),
    borderRadius: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    marginTop: 75,
    position: "relative",
  },
  sectionTitle: {
    textAlign: "center",
    fontSize: 26,
    fontFamily: "Yekan_Bakh_ExtraBold",
    color: "#2c3e50",
  },
  cardsContainer: {
    paddingHorizontal: 20,
  },
  detailItem: {
    marginBottom: 14,
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderColor: "rgba(203, 213, 225, 0.4)",
    position: "relative",
    overflow: "hidden",
    marginHorizontal: 5,
  },
  labelContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  label: {
    fontSize: 17,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
  },
  contentContainer: {
    paddingHorizontal: 15,
    marginTop: 15,
    position: 'relative',
  },
  descriptionValue: {
    fontSize: 16,
    color: "#374151",
    textAlign: 'right',
    lineHeight: 26,
    fontFamily: "Yekan_Bakh_Regular",
  },
  value: {
    fontSize: 16,
    color: "#374151",
    textAlign: 'right',
    lineHeight: 26,
    fontFamily: "Yekan_Bakh_Regular",
  },
  featureAccent: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 6,
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: modernColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLeft: {
    position: 'absolute',
    left: 16,
    top: StatusBar.currentHeight ? StatusBar.currentHeight + 16 : 60,
    zIndex: 1000,
  },
  editButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    justifyContent: 'flex-end',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: modernColors.success,
  },
  cancelButton: {
    backgroundColor: modernColors.error,
  },
  inlineTextInput: {
    fontSize: 16,
    color: "#374151",
    textAlign: 'right',
    lineHeight: 26,
    fontFamily: "Yekan_Bakh_Regular",
    borderWidth: 2,
    borderColor: modernColors.primary,
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#ffffff',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  videoUpload: {
    marginTop: 5,
  },
  avatarUpload: {
    marginTop: 5,
  },
  bottomSpacer: {
    height: 50,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    borderRadius: 12,
  },
  uploadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
  },
  groupItem: {
    marginBottom: 8,
  },
  groupBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  groupBadgeText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.primary,
  },
  emptyContactContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 30,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(203, 213, 225, 0.4)",
    marginHorizontal: 5,
    marginTop: 10,
  },
  emptyContactText: {
    fontSize: 15,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.medium,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  addContactButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: modernColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  addContactButtonText: {
    color: modernColors.surface,
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
  },
});

export default AboutMeScreen;