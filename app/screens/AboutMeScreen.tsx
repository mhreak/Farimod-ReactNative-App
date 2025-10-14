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
  ActivityIndicator
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
    title: ''
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

  // Fetch initial data
  const fetchAllData = useCallback(async () => {
    if (!user?.MemberId || initialLoadDone) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${appConfig.mobileApi}MemberInfo/GetAboutMe?memberId=${user.MemberId}`);

      if (!response.ok) {
        throw new Error(`خطای سرور: ${response.status}`);
      }

      const result = await response.json();

      setProfileData({
        aboutMe: result.AboutMeText || '',
        avatarUrl: result.AvatarImageURL,
        introVideo: result.IntroductionVideoURL,
        name: user?.FirstName && user?.LastName ? `${user.FirstName} ${user.LastName}` : "کاربر",
        title: user?.Skill || "طراح"
      });

      setInitialLoadDone(true);

    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.MemberId, user?.FirstName, user?.LastName, user?.Skill, initialLoadDone]);

  // Update about me
  const updateAboutMe = useCallback(async (newText) => {
    try {
      setLoading(true);
      setError(null);

      const updatePayload = {
        MemberId: user?.MemberId,
        AboutMe: newText
      };

      const response = await fetch(`${appConfig.mobileApi}MemberInfo/SetAboutMe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload)
      });

      if (!response.ok) {
        throw new Error(`خطای سرور: ${response.status}`);
      }

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
  }, [user?.MemberId]);

  const updateAvatar = useCallback(async (imageFile) => {
    try {
      setUploadingAvatar(true);
      setLoading(true);
      setError(null);

      // نمایش توست در حال آپلود
      showToast('در حال آپلود تصویر...', 'info');

      if (!imageFile?.uri) {
        throw new Error('فایل تصویر یافت نشد');
      }

      // اطمینان از URI صحیح (باید با file:// شروع شود)
      const fileUri = imageFile.uri.startsWith('file://')
        ? imageFile.uri
        : `file://${imageFile.uri}`;

      // تعیین نوع MIME صحیح بر اساس پسوند
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

      console.log('Uploading to:', apiUrl);
      console.log('FormData:', { uri: fileUri, type: mimeType });

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

      // نمایش توست در حال آپلود
      showToast('در حال آپلود ویدیو...', 'info');

      if (!videoFile?.uri) {
        throw new Error('فایل ویدیو یافت نشد');
      }

      // اطمینان از URI صحیح
      const fileUri = videoFile.uri.startsWith('file://')
        ? videoFile.uri
        : `file://${videoFile.uri}`;

      // نوع MIME برای ویدیو
      const getMimeType = (uri) => {
        const ext = uri.split('.').pop()?.toLowerCase();
        if (ext === 'mp4') return 'video/mp4';
        if (ext === 'mov') return 'video/quicktime';
        if (ext === 'm4v') return 'video/x-m4v';
        return 'video/mp4';
      };

      const mimeType = getMimeType(fileUri);

      // ساخت FormData
      const formData = new FormData();
      formData.append('videoFile', {
        uri: fileUri,
        name: videoFile.name || `intro_${Date.now()}.mp4`,
        type: mimeType,
      });

      const apiUrl = `${appConfig.mobileApi}MemberInfo/UploadIntroductionVideo?memberId=${user?.MemberId}`;

      console.log('Uploading video to:', apiUrl);
      console.log('Video file:', { uri: fileUri, type: mimeType });

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

  const getIconColor = useCallback((iconType) => {
    const iconColors = {
      person: modernColors.fashionIcon,
      videocam: modernColors.tertiary,
      camera: modernColors.accent,
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
            {/* About Me Card */}
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
                {!isEditing ? (
                  <AppText style={styles.descriptionValue}>
                    {profileData.aboutMe || "اطلاعاتی وارد نشده است"}
                  </AppText>
                ) : (
                  <EditableTextInput
                    value={profileData.aboutMe}
                    onSave={handleSaveEdit}
                    onCancel={handleCancelEdit}
                    loading={loading}
                  />
                )}
              </View>
              <View style={[styles.featureAccent, { backgroundColor: getIconColor('person') + "60" }]} />
            </View>

            {/* Video Card */}
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
                />
              </View>
              <View style={[styles.featureAccent, { backgroundColor: getIconColor('videocam') + "60" }]} />
            </View>

            {/* Profile Image Card */}
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
});

export default AboutMeScreen;