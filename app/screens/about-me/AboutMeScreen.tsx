import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import AppText from "../../components/Text";
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
import colors from "../../config/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import MainBackground from "../../components/MainBackground";
import Toast from "../../components/Toast";
import ImageUpload from "../../components/ImageUpload";
import appConfig from "../../config/config";
import { VideoView, useVideoPlayer } from 'expo-video';
import Tooltip from '../../components/Tooltip';
import { styles , modernColors} from "./styles/styles";
import { EditableTextInput } from "./ui/EditableTextInput";
import useToast from "../../hooks/useToast";
import { MemberGroup,ProfileData } from "./types/AboutMe.types";


const AboutMeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const {showToast,toastMessage,setToastVisible,toastType,toastVisible}=useToast()

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // State
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    aboutMe: "",
    avatarUrl: null,
    introVideo: null,
    name: "",
    title: "",
    cityId: null,
    cityName: "",
    provinceId: null,
    provinceName: "",
    phone1: "",
    phone2: "",
    email: "",
    websiteAddress: "",
    telegramAccountId: "",
    instagramAccountId: "",
    whatsappAccountMobileNumber: "",
    address: "",
    mobile: "",
    memberGroupList: [],
  });

  
  const [profileLoading, setProfileLoading] = useState(false);
  const [savingAboutMe, setSavingAboutMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const hasLoadedRef = useRef(false);

  // Toast state

  const [videoModalVisible, setVideoModalVisible] = useState(false);

  const player = useVideoPlayer(profileData.introVideo || '', (player) => {
    player.loop = false;
    player.play();
  });

  useEffect(() => {
    if (!player) return;
    if (videoModalVisible) {
      player.play();  
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
  if (!user?.MemberId || hasLoadedRef.current) return;

  try {
    setProfileLoading(true);
    setError(null);

    const apiUrl = `${appConfig.mobileApi}MemberInfo/GetProfileInfoToEdit?memberId=${user.MemberId}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`خطای سرور: ${response.status}`);
    }

    const result = await response.json();
    const mobile = result.Mobile || user.Mobile || "";

    setProfileData({
      aboutMe: result.AboutMeText || "",
      avatarUrl: result.AvatarImageURL || null,
      introVideo: result.IntroductionVideoURL || null,
      name: user.FirstName && user.LastName ? `${user.FirstName} ${user.LastName}` : "کاربر",
      title: user.Skill || "طراح",
      cityId: result.CityId ?? null,
      cityName: result.CityName || "",
      provinceId: result.ProvinceId ?? null,
      provinceName: result.ProvinceName || "",
      phone1: result.Phone1 || "",
      phone2: result.Phone2 || "",
      email: result.Email || "",
      websiteAddress: result.WebsiteAddress || "",
      telegramAccountId: result.TelegramAccountId || "",
      instagramAccountId: result.InstagramAccountId || "",
      whatsappAccountMobileNumber: result.WhatsappAccountMobileNumber || "",
      address: result.Address || "",
      mobile,
      memberGroupList: result.MemberGroupList || [],
    });

    hasLoadedRef.current = true;
  } catch (err: any) {
    setError(err.message);
  } finally {
    setProfileLoading(false);
  }
}, [user?.MemberId, user?.FirstName, user?.LastName, user?.Skill, user?.Mobile]);


  const handleVideoPress = useCallback(() => {
    if (profileData.introVideo) {
      setVideoModalVisible(true);
    }
  }, [profileData.introVideo]);

  const updateAboutMe = useCallback(async (newText: string) => {
    try {
      setSavingAboutMe(true);
      setError(null);

      if (!profileData.mobile) {
        showToast('شماره موبایل شما یافت نشد. لطفاً ابتدا از بخش "ویرایش پروفایل" شماره موبایل خود را وارد کنید.',"error")
        return false;
      }

      const memberGroupIds = profileData.memberGroupList
        .filter(g => g?.MemberGroupId)
        .map(g => g.MemberGroupId);

      const updatePayload = {
        MemberId: user?.MemberId,
        AboutMe: newText.trim(),
        CityId: profileData.cityId ?? 0,
        ProvinceId: profileData.provinceId ?? 0,
        Mobile: profileData.mobile,
        Phone1: profileData.phone1 || "",
        Phone2: profileData.phone2 || "",
        Email: profileData.email || "",
        WebsiteAddress: profileData.websiteAddress || "",
        TelegramAccountId: profileData.telegramAccountId || "",
        WhatsappAccountMobileNumber: profileData.whatsappAccountMobileNumber || "",
        InstagramAccountId: profileData.instagramAccountId || "",
        Address: profileData.address || "",
        MemberGroupIdList: memberGroupIds,
      };

      const updateUrl = `${appConfig.mobileApi}MemberInfo/UpdateProfile`;
      const updateResponse = await fetch(updateUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        throw new Error(`خطای سرور در بروزرسانی: ${updateResponse.status} - ${errorText}`);
      }

      setProfileData(prev => ({ ...prev, aboutMe: newText.trim() }));
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setSavingAboutMe(false);
    }
  }, [profileData, user?.MemberId]);


  const updateAvatar = useCallback(async (imageFile:any) => {
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

  const updateIntroVideo = useCallback(async (videoFile:any) => {
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
    (navigation as any).navigate('EditContactInfo', { contactData: profileData });
  }, [navigation, profileData]);

  const getIconColor = useCallback((iconType:any) => {
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
            onPress={() => (navigation as any).navigate("App", { screen: "MainTabs", params: { screen: "پروفایل" } })}
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

          <View
            style={[
              styles.sectionTitleContainer,
            ]}
          >
            <AppText style={styles.sectionTitle}>پروفایل من</AppText>
          </View>

          <View
            style={[
              styles.cardsContainer,
            ]}
          >



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
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

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


export default AboutMeScreen;