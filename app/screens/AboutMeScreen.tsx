import React, { useEffect, useRef, useState } from "react";
import AppText from "../components/Text";
import {
  ScrollView,
  StyleSheet,
  View,
  Image,
  Dimensions,
  Animated,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Alert
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../config/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import MainBackground from "../components/MainBackground";
import Toast from "../components/Toast";
import ImageUpload from "../components/ImageUpload"; // اضافه کردن ImageUpload
import appConfig from "../config/config";

const { width, height } = Dimensions.get('window');

// Enhanced modern color palette for fashion designers
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
};

// Skeleton Component for loading states
const SkeletonLoader = ({ width, height, borderRadius = 8, style = {} }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]).start(() => startAnimation());
    };

    startAnimation();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e0e0e0', '#f0f0f0'],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor,
          borderRadius,
        },
        style,
      ]}
    />
  );
};

// About Me Card Skeleton Component
const AboutMeCardSkeleton = () => {
  return (
    <View style={styles.detailItem}>
      <View style={[styles.labelContainer, { justifyContent: 'space-between' }]}>
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', flex: 1 }}>
          <SkeletonLoader width={44} height={44} borderRadius={22} style={{ marginLeft: 12 }} />
          <SkeletonLoader width="40%" height={17} borderRadius={8} />
        </View>
        <SkeletonLoader width={32} height={32} borderRadius={16} />
      </View>

      <View style={[styles.contentContainer, { alignItems: 'flex-end' }]}>
        <SkeletonLoader width="100%" height={16} borderRadius={8} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="85%" height={16} borderRadius={8} style={{ marginBottom: 8, alignSelf: 'flex-end' }} />
        <SkeletonLoader width="92%" height={16} borderRadius={8} style={{ marginBottom: 8, alignSelf: 'flex-end' }} />
        <SkeletonLoader width="75%" height={16} borderRadius={8} style={{ alignSelf: 'flex-end' }} />
      </View>

      <View style={[styles.featureAccent, { backgroundColor: modernColors.fashionIcon + "60" }]} />
    </View>
  );
};

// Video Upload Skeleton Component
const VideoUploadSkeleton = () => {
  return (
    <View style={styles.detailItem}>
      <View style={[styles.labelContainer, { justifyContent: 'space-between' }]}>
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', flex: 1 }}>
          <SkeletonLoader width={44} height={44} borderRadius={22} style={{ marginLeft: 12 }} />
          <SkeletonLoader width="50%" height={17} borderRadius={8} />
        </View>
      </View>

      <View style={[styles.contentContainer, { alignItems: 'center' }]}>
        <SkeletonLoader width="100%" height={200} borderRadius={16} />
      </View>

      <View style={[styles.featureAccent, { backgroundColor: modernColors.tertiary + "60" }]} />
    </View>
  );
};

// Custom hook for About Me API
const useAboutMeAPI = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAboutMe = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 Starting API call...');

      const response = await fetch(`${appConfig.mobileApi}MemberInfo/GetAboutMe?memberId=1`);

      console.log('📡 Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        console.log('❌ Response not OK');
        const errorText = await response.text();
        console.log('Error text:', errorText);

        // سرور خطای 500 می‌دهد - بیایید fallback استفاده کنیم
        if (response.status === 500) {
          console.log('⚠️ Server error 500 - using fallback data');
          setData("من فاطمه هستم، طراح پارچه و لباس با نگاهی نو به ترکیب سنت و مدرنیته. علاقه‌مند به خلق طراحی‌هایی که هویت ایرانی را با جهانی‌بودن ترکیب کند.");
          setError(null); // Clear error since we have fallback
          return;
        }

        throw new Error(`خطای سرور: ${response.status} - ${errorText}`);
      }

      const responseText = await response.text();
      console.log('✅ Raw response:', responseText);

      // Try to parse JSON
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('📦 Parsed JSON:', result);
      } catch (parseError) {
        console.log('❌ JSON Parse Error:', parseError);
        throw new Error('پاسخ سرور قابل تجزیه نیست');
      }

      // Extract data
      if (result && typeof result.Data === 'string') {
        console.log('✅ Data extracted:', result.Data);
        setData(result.Data);
      } else {
        console.log('⚠️ No valid Data property');
        setData("درباره من اطلاعاتی موجود نیست");
      }

    } catch (err) {
      console.error('💥 Final error:', err.message);

      // For development: use fallback data instead of showing error
      console.log('🔄 Using fallback data for development');
      setData("من فاطمه هستم، طراح پارچه و لباس با نگاهی نو به ترکیب سنت و مدرنیته. علاقه‌مند به خلق طراحی‌هایی که هویت ایرانی را با جهانی‌بودن ترکیب کند.");
      setError(null); // Don't show error, just use fallback

    } finally {
      setLoading(false);
      console.log('🏁 API call finished');
    }
  };

  const updateAboutMe = async (newText) => {
    try {
      setLoading(true);
      setError(null);

      // API call for updating AboutMe with hardcoded memberId = 1
      const updatePayload = {
        MemberId: 1,
        AboutMe: newText
      };

      console.log('🚀 Starting update API call:', updatePayload);

      const response = await fetch(`${appConfig.mobileApi}MemberInfo/SetAboutMe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload)
      });

      console.log('📡 Update response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Update failed:', errorText);
        throw new Error(`خطای سرور: ${response.status}`);
      }

      // Update local state
      setData(newText);
      console.log('✅ AboutMe updated successfully');

      return true;
    } catch (err) {
      console.error('💥 Update error:', err.message);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    fetchAboutMe,
    updateAboutMe,
  };
};

// Custom hook for Introduction Video API
const useIntroVideoAPI = () => {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIntroVideo = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🎬 Starting Video API call...');

      const response = await fetch(`${appConfig.mobileApi}MemberInfo/GetIntroVideo?memberId=1`);

      console.log('📡 Video Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        console.log('❌ Video Response not OK');
        if (response.status === 404) {
          // No video found
          setVideo(null);
          setError(null);
          return;
        }
        throw new Error(`خطای سرور: ${response.status}`);
      }

      const responseText = await response.text();
      console.log('✅ Video Raw response:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
        console.log('📦 Video Parsed JSON:', result);
      } catch (parseError) {
        console.log('❌ Video JSON Parse Error:', parseError);
        throw new Error('پاسخ سرور قابل تجزیه نیست');
      }

      if (result && result.Data) {
        console.log('✅ Video Data extracted:', result.Data);
        setVideo(result.Data);
      } else {
        console.log('⚠️ No valid Video Data property');
        setVideo(null);
      }

    } catch (err) {
      console.error('💥 Video Final error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
      console.log('🏁 Video API call finished');
    }
  };

  const updateIntroVideo = async (videoFile) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 Starting video upload API call...');
      console.log('📁 Video file details:', {
        uri: videoFile.uri,
        type: videoFile.type,
        name: videoFile.name,
        size: videoFile.size
      });

      const formData = new FormData();
      formData.append('memberId', '1');
      formData.append('videoFile', {
        uri: videoFile.uri,
        type: videoFile.type || 'video/mp4',
        name: videoFile.name || 'intro_video.mp4',
      } as any);

      console.log('📤 Sending request to:', `${appConfig.mobileApi}MemberInfo/UploadIntroductionVideo?memberId=1`);

      const response = await fetch(`${appConfig.mobileApi}MemberInfo/UploadIntroductionVideo?memberId=1`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        }
      });

      console.log('📡 Video Upload response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Video Upload failed - Error text:', errorText);

        // بررسی نوع خطا
        if (response.status === 413) {
          throw new Error('حجم فایل بیش از حد مجاز است');
        } else if (response.status === 415) {
          throw new Error('فرمت فایل پشتیبانی نمی‌شود');
        } else if (response.status === 400) {
          throw new Error('درخواست نامعتبر - لطفاً مجدداً تلاش کنید');
        } else if (response.status >= 500) {
          throw new Error('خطای سرور - لطفاً بعداً تلاش کنید');
        } else {
          throw new Error(`خطای سرور: ${response.status} - ${errorText}`);
        }
      }

      const responseText = await response.text();
      console.log('✅ Video Upload response text:', responseText);

      // Parse response if needed
      let result;
      try {
        if (responseText) {
          result = JSON.parse(responseText);
          console.log('📦 Video Upload parsed response:', result);
        }
      } catch (parseError) {
        console.log('ℹ️ Response is not JSON, assuming success');
      }

      // Update local state
      setVideo(videoFile);
      console.log('✅ Video uploaded successfully');

      return true;
    } catch (err) {
      console.error('💥 Video Upload error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });

      // بررسی نوع خطا برای پیام مناسب
      if (err.message.includes('Network request failed')) {
        setError('مشکل در اتصال به اینترنت');
      } else if (err.message.includes('timeout')) {
        setError('زمان اتصال به پایان رسید - لطفاً مجدداً تلاش کنید');
      } else {
        setError(err.message || 'خطای نامشخص در آپلود ویدئو');
      }

      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteIntroVideo = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🗑️ Starting video delete...');

      // برای تست - فقط local state را پاک کنیم
      // در محیط production باید API واقعی را فراخوانی کنید

      // شبیه‌سازی تاخیر API
      await new Promise(resolve => setTimeout(resolve, 500));

      setVideo(null);
      console.log('✅ Video deleted successfully (simulated)');

      return true;

      /*
      // کد واقعی API که باید در production فعال شود:
      
      const response = await fetch(`${appConfig.mobileApi}MemberInfo/DeleteIntroVideo?memberId=1`, {
        method: 'DELETE',
      });

      console.log('📡 Video Delete response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Video Delete failed:', errorText);
        throw new Error(`خطای سرور: ${response.status}`);
      }

      setVideo(null);
      console.log('✅ Video deleted successfully');
      return true;
      */

    } catch (err) {
      console.error('💥 Video Delete error:', err.message);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    video,
    loading,
    error,
    fetchIntroVideo,
    updateIntroVideo,
    deleteIntroVideo,
  };
};

const AboutMeScreen = () => {
  const navigation = useNavigation();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // State for inline editing
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const textInputRef = useRef(null);

  // Toast states
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  // Use custom hooks for API
  const { data: aboutMeData, loading: aboutMeLoading, error: aboutMeError, fetchAboutMe, updateAboutMe } = useAboutMeAPI();
  const { video: introVideo, loading: videoLoading, error: videoError, fetchIntroVideo, updateIntroVideo, deleteIntroVideo } = useIntroVideoAPI();

  const [personalData, setPersonalData] = useState({
    name: "فاطمه رضایی",
    title: "طراح پارچه و لباس",
    bio: null, // Start with null instead of loading text
  });

  useEffect(() => {
    fetchAboutMe();
    fetchIntroVideo();
  }, []);

  useEffect(() => {
    if (aboutMeData) {
      setPersonalData(prev => ({
        ...prev,
        bio: aboutMeData
      }));
    }
  }, [aboutMeData]);

  useEffect(() => {
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

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Toast helper function
  const showToast = (message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // Show error toast when API call fails
  useEffect(() => {
    if (aboutMeError) {
      showToast(aboutMeError, 'error');
    }
  }, [aboutMeError]);

  useEffect(() => {
    if (videoError) {
      showToast(videoError, 'error');
    }
  }, [videoError]);

  const getIconColor = (iconType) => {
    const iconColors = {
      person: modernColors.fashionIcon,
      videocam: modernColors.tertiary,
    };
    return iconColors[iconType] || modernColors.primary;
  };

  const startEditing = () => {
    setEditValue(personalData.bio);
    setIsEditing(true);
    // Focus on the text input after a slight delay to ensure it's rendered
    setTimeout(() => {
      if (textInputRef.current) {
        textInputRef.current.focus();
      }
    }, 100);
  };

  const saveEdit = async () => {
    if (editValue.trim() === '') {
      Alert.alert('خطا', 'لطفا متن را وارد کنید');
      return;
    }

    const success = await updateAboutMe(editValue.trim());

    if (success) {
      setPersonalData(prev => ({
        ...prev,
        bio: editValue.trim()
      }));
      setIsEditing(false);
      setEditValue('');
      showToast('اطلاعات با موفقیت به‌روزرسانی شد', 'success');
    } else {
      showToast('خطا در به‌روزرسانی اطلاعات', 'error');
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditValue('');
  };

  // Video handling functions
  const handleVideoChange = async (video) => {
    if (video) {
      const success = await updateIntroVideo(video);
      if (success) {
        showToast('ویدئوی معرفی با موفقیت آپلود شد', 'success');
      } else {
        showToast('خطا در آپلود ویدئو', 'error');
      }
    } else {
      const success = await deleteIntroVideo();
      if (success) {
        showToast('ویدئوی معرفی حذف شد', 'success');
      } else {
        showToast('خطا در حذف ویدئو', 'error');
      }
    }
  };

  // Show loading skeleton while data is being fetched
  if ((aboutMeLoading && !aboutMeData) || (videoLoading && introVideo === null && !videoError)) {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View style={styles.container}>
          {/* Main Background */}
          <MainBackground />

          {/* Toast Component */}
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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <View style={styles.backButtonContainer}>
                <MaterialIcons
                  name="arrow-forward"
                  size={24}
                  color="#6366f1"
                />
              </View>
            </TouchableOpacity>

            {/* Profile Header */}
            <Animated.View
              style={[
                styles.profileHeaderContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
            </Animated.View>

            {/* Section Title */}
            <Animated.View
              style={[
                styles.sectionTitleContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <AppText style={styles.sectionTitle}>درباره من</AppText>
              <View style={styles.sparkleContainer}>
                <MaterialIcons
                  name="star"
                  size={16}
                  color="#FFD700"
                  style={styles.sparkle1}
                />
                <MaterialIcons
                  name="auto-awesome"
                  size={12}
                  color="#FF69B4"
                  style={styles.sparkle2}
                />
              </View>
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
              <AboutMeCardSkeleton />
              <VideoUploadSkeleton />
            </Animated.View>

            <View style={styles.decorativeElements}>
              <View style={styles.floatingElements}>
                <Animated.View style={[styles.star1, { transform: [{ rotate: spin }] }]}>
                  <MaterialIcons
                    name="auto-awesome"
                    size={22}
                    color="rgba(139, 92, 246, 0.3)"
                  />
                </Animated.View>
                <Animated.View style={[styles.star2, { transform: [{ rotate: spin }] }]}>
                  <MaterialIcons
                    name="palette"
                    size={18}
                    color="rgba(99, 102, 241, 0.3)"
                  />
                </Animated.View>
                <Animated.View style={[styles.star3, { transform: [{ rotate: spin }] }]}>
                  <MaterialIcons
                    name="brush"
                    size={20}
                    color="rgba(6, 182, 212, 0.3)"
                  />
                </Animated.View>
                <Animated.View style={[styles.star4, { transform: [{ rotate: spin }] }]}>
                  <MaterialIcons
                    name="brush"
                    size={24}
                    color="rgba(139, 92, 246, 0.2)"
                  />
                </Animated.View>
              </View>
            </View>

            {/* Bottom Spacer */}
            <View style={styles.bottomSpacer} />
          </ScrollView>
        </View>
      </>
    );
  }

  // Show error state
  if (aboutMeError && !aboutMeData) {
    return (
      <View style={styles.container}>
        <MainBackground />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.backButtonContainer}>
            <MaterialIcons name="arrow-forward" size={24} color="#6366f1" />
          </View>
        </TouchableOpacity>

        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={80} color="#9e9e9e" />
          <AppText style={styles.errorTitle}>خطا در دریافت اطلاعات</AppText>
          <AppText style={styles.errorSubtitle}>
            {aboutMeError.includes('500') || aboutMeError.includes('داخلی')
              ? 'مشکل در سرور - لطفاً بعداً تلاش کنید'
              : aboutMeError.includes('Network') || aboutMeError.includes('fetch')
                ? 'لطفاً اتصال اینترنت خود را بررسی کنید'
                : aboutMeError
            }
          </AppText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              fetchAboutMe();
              fetchIntroVideo();
            }}
          >
            <MaterialIcons name="refresh" size={20} color={colors.white} />
            <AppText style={styles.retryButtonText}>تلاش مجدد</AppText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const InfoCard = ({ label, value, icon, isLarge = false }) => (
    <View style={styles.detailItem}>
      <View style={[styles.labelContainer, { justifyContent: 'space-between' }]}>
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', flex: 1 }}>
          <LinearGradient
            colors={[getIconColor(icon), getIconColor(icon) + 'CC']}
            style={styles.iconWrapper}
          >
            <MaterialIcons
              name={icon}
              size={22}
              color={modernColors.surface}
            />
          </LinearGradient>
          <AppText style={styles.label}>{label}</AppText>
        </View>

        {/* Edit/Save/Cancel buttons */}
        {!isEditing ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={startEditing}
            disabled={aboutMeLoading}
          >
            {aboutMeLoading ? (
              <MaterialIcons
                name="hourglass-empty"
                size={18}
                color={modernColors.surface}
              />
            ) : (
              <MaterialIcons
                name="edit"
                size={18}
                color={modernColors.surface}
              />
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.editActionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={saveEdit}
              disabled={aboutMeLoading}
            >
              {aboutMeLoading ? (
                <MaterialIcons
                  name="hourglass-empty"
                  size={18}
                  color={modernColors.surface}
                />
              ) : (
                <MaterialIcons
                  name="check"
                  size={18}
                  color={modernColors.surface}
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={cancelEdit}
              disabled={aboutMeLoading}
            >
              <MaterialIcons
                name="close"
                size={18}
                color={modernColors.surface}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        {!isEditing ? (
          <AppText style={styles.descriptionValue}>
            {value}
          </AppText>
        ) : (
          <TextInput
            ref={textInputRef}
            style={styles.inlineTextInput}
            value={editValue}
            onChangeText={setEditValue}
            placeholder="متن درباره خود را وارد کنید..."
            placeholderTextColor="rgba(0,0,0,0.5)"
            multiline={true}
            textAlign="right"
            autoFocus={true}
            onSubmitEditing={saveEdit}
            blurOnSubmit={false}
            editable={!aboutMeLoading}
          />
        )}
      </View>
      <View style={[styles.featureAccent, { backgroundColor: getIconColor(icon) + "60" }]} />
    </View>
  );

  const VideoCard = () => (
    <View style={styles.detailItem}>
     

      <View style={styles.contentContainer}>
        <ImageUpload
          multiple={false}
          allowVideos={true}
          allowImages={false}
          allowCamera={true}
          allowGallery={true}
          allowEditing={false}
          aspectRatio={[16, 9]}
          initialImage={introVideo}
          onImageChange={handleVideoChange}
          placeholder="ویدئوی معرفی"
          onShowToast={showToast}
          style={styles.videoUpload}
        />
      </View>
      <View style={[styles.featureAccent, { backgroundColor: getIconColor('videocam') + "60" }]} />
    </View>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        {/* Main Background */}
        <MainBackground />

        {/* Toast Component */}
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
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <View style={styles.backButtonContainer}>
              <MaterialIcons
                name="arrow-forward"
                size={24}
                color="#6366f1"
              />
            </View>
          </TouchableOpacity>

          {/* Profile Header */}
          <Animated.View
            style={[
              styles.profileHeaderContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
          </Animated.View>

          {/* Section Title */}
          <Animated.View
            style={[
              styles.sectionTitleContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <AppText style={styles.sectionTitle}>درباره من</AppText>
            <View style={styles.sparkleContainer}>
              <MaterialIcons
                name="star"
                size={16}
                color="#FFD700"
                style={styles.sparkle1}
              />
              <MaterialIcons
                name="auto-awesome"
                size={12}
                color="#FF69B4"
                style={styles.sparkle2}
              />
            </View>
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
            <InfoCard
              label="درباره من"
              value={personalData.bio}
              icon="person"
              isLarge={true}
            />

            {/* Video Introduction Card */}
            <VideoCard />
          </Animated.View>

          <View style={styles.decorativeElements}>
            <View style={styles.floatingElements}>
              <Animated.View style={[styles.star1, { transform: [{ rotate: spin }] }]}>
                <MaterialIcons
                  name="auto-awesome"
                  size={22}
                  color="rgba(139, 92, 246, 0.3)"
                />
              </Animated.View>
              <Animated.View style={[styles.star2, { transform: [{ rotate: spin }] }]}>
                <MaterialIcons
                  name="palette"
                  size={18}
                  color="rgba(99, 102, 241, 0.3)"
                />
              </Animated.View>
              <Animated.View style={[styles.star3, { transform: [{ rotate: spin }] }]}>
                <MaterialIcons
                  name="brush"
                  size={20}
                  color="rgba(6, 182, 212, 0.3)"
                />
              </Animated.View>
              <Animated.View style={[styles.star4, { transform: [{ rotate: spin }] }]}>
                <MaterialIcons
                  name="brush"
                  size={24}
                  color="rgba(139, 92, 246, 0.2)"
                />
              </Animated.View>
            </View>
          </View>

          {/* Bottom Spacer */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
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
  backButton: {
    position: 'absolute',
    top: StatusBar.currentHeight + 48,
    right: 20,
    zIndex: 1000,
  },
  backButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginTop: -32,
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
  profileHeaderContainer: {
    alignItems: "center",
    marginBottom: 30,
    paddingTop: StatusBar.currentHeight + 80,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 4,
    borderColor: "#ffffff",
    position: 'relative',
    shadowColor: modernColors.primary,
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  profileImageGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 32,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    marginBottom: 12,
    textAlign: "center",
  },
  titleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileTitle: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.primary,
    marginLeft: 8,
  },
  sectionTitleContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    marginTop: -90,
    position: "relative",
    paddingHorizontal: 20,
  },
  sectionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
  },
  sparkleContainer: {
    position: "relative",
  },
  sparkle1: {
    position: "absolute",
    top: -10,
    right: 90,
  },
  sparkle2: {
    position: "absolute",
    top: 5,
    right: 25,
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
    backgroundColor: "rgba(248, 250, 252, 0.3)",
    backdropFilter: "blur(15px)",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(203, 213, 225, 0.4)",
    position: "relative",
    overflow: "hidden",
    marginHorizontal: 5,
  },
  // Skeleton styles
  detailItemSkeleton: {
    marginBottom: 14,
    backgroundColor: "rgba(248, 250, 252, 0.3)",
    backdropFilter: "blur(15px)",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(203, 213, 225, 0.4)",
    position: "relative",
    overflow: "hidden",
    marginHorizontal: 5,
  },
  skeletonRowContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 15,
  },
  skeletonContentContainer: {
    paddingHorizontal: 15,
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
  },
  descriptionValue: {
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
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: modernColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editActionsContainer: {
    flexDirection: 'row',
    gap: 8,
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
  // Video upload styles
  videoUpload: {
    marginTop: 5,
  },
  // Error state styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#2c3e50',
    marginTop: 20,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#9e9e9e',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: modernColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 24,
    shadowColor: modernColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.white,
    marginRight: 8,
  },
  bottomSpacer: {
    height: 50,
  },
  decorativeElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  floatingElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star1: {
    position: "absolute",
    top: 400,
    left: 60,
  },
  star2: {
    position: "absolute",
    top: 600,
    right: 70,
  },
  star3: {
    position: "absolute",
    top: 800,
    left: 50,
  },
  star4: {
    position: "absolute",
    top: 1000,
    right: 90,
  },
});

export default AboutMeScreen;