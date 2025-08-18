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
  Image,
  RefreshControl,
  Modal,
  Text,
  Pressable
} from "react-native";
import colors from "../config/colors";
import AppText from "../components/Text";
import { toPersianDigits } from "../utils/converters";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import MainBackground from "../components/MainBackground";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { AppNavigationProp, RootStackParamList } from "../Navigators";
import Toast from "../components/Toast";
import { useAuth } from "../contexts/AuthContext";
import PermissionService from "../services/PermissionService";
import SubscriptionInfo from "../components/SubscriptionInfo";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
};

const profileItems = [
  {
    id: 1,
    title: "درباره ی من",
    icon: "info",
    screenName: "AboutMe",
    color: "#8b5cf6",
    permission: "allowAboutMeText",
  },
  {
    id: 2,
    title: "فایل ها و مدارک",
    icon: "my-library-books",
    screenName: "MyResume",
    color: "#10b981",
    permission: "allowAddDocument",
  },
  {
    id: 3,
    title: "گالری من",
    icon: "image",
    screenName: "MyGallery",
    color: "#f59e0b",
    permission: "allowAddImageGallery",
  },
  {
    id: 4,
    title: "پست های منتشر شده",
    icon: "article",
    screenName: "MyPosts",
    color: "#06b6d4",
    permission: "allowAddBlogPost",
  },
  {
    id: 5,
    title: "دوره های ثبت نام شده",
    icon: "fact-check",
    screenName: "MyCourses",
    color: "#ef4444",
    permission: null, // همیشه در دسترس
  },
  {
    id: 9,
    title: "محصولات من",
    icon: "sell",
    screenName: "MyProduct",
    color: "#81cd4e",
    permission: "allowAddProduct",
  },
  {
    id: 6,
    title: "برگزاری دوره",
    icon: "laptop-chromebook",
    screenName: "MyTeachingCourses",
    color: "#e067c2",
    permission: "allowAddCourse",
  },
  {
    id: 8,
    title: "نمونه کار ها",
    icon: "collections-bookmark",
    screenName: "PortfolioList",
    color: "#6596ff",
    permission: "allowAddPortfolio",
  },
  {
    id: 7,
    title: "اشتراک ها",
    icon: "star",
    screenName: "Subscription",
    color: "#ffd700",
    permission: null, // همیشه در دسترس
  },
];

const ProfileCard = ({ item, onPress, user, onShowPermissionModal }) => {
  const hasPermission = item.permission ? PermissionService.hasPermission(user, item.permission) : true;

  const handlePress = () => {
    if (!hasPermission) {
      onShowPermissionModal(item.permission, item.screenName);
      return;
    }
    onPress(item.screenName);
  };

  return (
    <TouchableOpacity
      style={[
        styles.profileCard,
        { borderColor: hasPermission ? item.color : '#ddd' }
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={[
        styles.glassCard,
        { backgroundColor: hasPermission ? `${item.color}15` : '#f5f5f5' }
      ]}>
        {/* محتوای مرکزی */}
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <MaterialIcons
              name={item.icon}
              size={36}
              color={hasPermission ? item.color : '#999'}
            />
            {!hasPermission && (
              <View style={styles.lockOverlay}>
                <MaterialIcons name="lock" size={16} color="#fff" />
              </View>
            )}
          </View>
          <AppText style={[
            styles.cardTitle,
            { color: hasPermission ? "#2c3e50" : "#999" }
          ]}>
            {item.title}
          </AppText>
        </View>

        {/* متن عمودی در سمت راست */}
        {!hasPermission && (
          <View style={styles.upgradeTextVertical}>
            <AppText style={styles.upgradeTextRotated}>
              نیاز به ارتقای اشتراک
            </AppText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [toast, setToast] = useState({ visible: false, message: "", type: "info" });
  const [permissionModal, setPermissionModal] = useState({
    visible: false,
    permission: null,
    targetScreen: null
  });
  const [logoutModal, setLogoutModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Animation states for modals
  const [permissionSlideAnim] = useState(new Animated.Value(300));
  const [permissionOpacityAnim] = useState(new Animated.Value(0));
  const [logoutSlideAnim] = useState(new Animated.Value(300));
  const [logoutOpacityAnim] = useState(new Animated.Value(0));

  const insets = useSafeAreaInsets();

  // استفاده از AuthContext
  const { user, logout, isAuthenticated, refreshSubscription } = useAuth();

  // فیلتر کردن آیتم‌ها بر اساس IsInfinityPlan
  const filteredProfileItems = React.useMemo(() => {
    if (user?.ActiveSubscriptionPlan?.IsInfinityPlan) {
      return profileItems.filter(item => item.id !== 7); // حذف کارت اشتراک‌ها
    }
    return profileItems;
  }, [user?.ActiveSubscriptionPlan?.IsInfinityPlan]);

  // Disable swipe back gesture for this screen specifically
  React.useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      gestureEnabled: false,
    });

    return () => {
      navigation.getParent()?.setOptions({
        gestureEnabled: true,
      });
    };
  }, [navigation]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

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

  // Permission Modal Animations
  useEffect(() => {
    if (permissionModal.visible) {
      Animated.parallel([
        Animated.spring(permissionSlideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(permissionOpacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(permissionSlideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(permissionOpacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [permissionModal.visible]);

  // Logout Modal Animations
  useEffect(() => {
    if (logoutModal) {
      Animated.parallel([
        Animated.spring(logoutSlideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoutOpacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(logoutSlideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(logoutOpacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [logoutModal]);

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ visible: false, message: "", type: "info" });
  };

  const showPermissionModal = (permission, targetScreen) => {
    setPermissionModal({
      visible: true,
      permission,
      targetScreen
    });
  };

  const hidePermissionModal = () => {
    setPermissionModal({
      visible: false,
      permission: null,
      targetScreen: null
    });
  };

  const handleUpgradeFromModal = () => {
    hidePermissionModal();
    navigation.navigate("Subscription");
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const result = await refreshSubscription();
      if (result.success) {
        showToast('اطلاعات اشتراک بروزرسانی شد', 'success');
      } else {
        showToast('خطا در بروزرسانی اطلاعات', 'error');
      }
    } catch (error) {
      showToast('خطا در بروزرسانی اطلاعات', 'error');
    }
    setRefreshing(false);
  };

  const handleLogout = () => {
    setLogoutModal(true);
  };

  const confirmLogout = async () => {
    setLogoutModal(false);
    try {
      await logout();
      showToast('با موفقیت خارج شدید', 'success');
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Login" }],
        })
      );
    } catch (error) {
      console.error('Logout error:', error);
      showToast('خطا در خروج از حساب کاربری', 'error');
    }
  };

  const cancelLogout = () => {
    setLogoutModal(false);
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleCardPress = (screenName) => {
    navigation.navigate(screenName);
  };

  const renderProfileCard = ({ item }) => (
    <ProfileCard
      item={item}
      onPress={handleCardPress}
      user={user}
      onShowPermissionModal={showPermissionModal}
    />
  );

  // تعیین آیکون پروفایل بر اساس جنسیت
  const getGenderIcon = () => {
    if (user?.Gender === 1) { // مرد
      return "face-man";
    } else if (user?.Gender === 2) { // زن
      return "face-woman";
    } else { // جنسیت مشخص نشده
      return "account-circle";
    }
  };

  return (
    <>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      {/* Permission Upgrade Modal */}
      <Modal
        visible={permissionModal.visible}
        transparent={true}
        animationType="none"
        onRequestClose={hidePermissionModal}
      >
        <Pressable style={styles.modalOverlay} onPress={hidePermissionModal}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ translateY: permissionSlideAnim }],
                opacity: permissionOpacityAnim,
                marginBottom: Math.max(insets.bottom, 20),
              }
            ]}
          >
            {/* Icon */}
            <View style={styles.upgradeIconContainer}>
              <MaterialIcons name="star" size={48} color="#ffd700" />
            </View>

            {/* Title */}
            <AppText style={styles.upgradeTitle}>ارتقای اشتراک</AppText>

            {/* Message */}
            <AppText style={styles.upgradeMessage}>
              برای استفاده از این بخش نیاز به ارتقای اشتراک دارید. آیا می‌خواهید به صفحه اشتراک‌ها بروید؟
            </AppText>

            {/* Buttons */}
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelUpgradeButton]}
                onPress={hidePermissionModal}
              >
                <AppText style={styles.cancelUpgradeText}>خیر</AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmUpgradeButton]}
                onPress={handleUpgradeFromModal}
              >
                <AppText style={styles.confirmUpgradeText}>ارتقای اشتراک</AppText>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={logoutModal}
        transparent={true}
        animationType="none"
        onRequestClose={cancelLogout}
      >
        <Pressable style={styles.modalOverlay} onPress={cancelLogout}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ translateY: logoutSlideAnim }],
                opacity: logoutOpacityAnim,
                marginBottom: Math.max(insets.bottom, 20),
              }
            ]}
          >
            {/* Icon */}
            <View style={styles.logoutIconContainer}>
              <MaterialIcons name="logout" size={48} color="#EF4444" />
            </View>

            {/* Title */}
            <AppText style={styles.logoutTitle}>خروج از حساب کاربری</AppText>

            {/* Message */}
            <AppText style={styles.logoutMessage}>
              آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟
            </AppText>

            {/* Buttons */}
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelLogoutButton]}
                onPress={cancelLogout}
              >
                <AppText style={styles.cancelLogoutText}>انصراف</AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmLogoutButton]}
                onPress={confirmLogout}
              >
                <AppText style={styles.confirmLogoutText}>خروج</AppText>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Pressable>
      </Modal>

      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        <MainBackground />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {/* Header with back, edit, and logout buttons */}
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

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <View style={styles.editButtonContainer}>
              <MaterialIcons
                name="edit"
                size={24}
                color="white"
              />
            </View>
          </TouchableOpacity>

          <Animated.View
            style={[
              styles.headerContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.titleWrapper}>
              <AppText style={styles.headerTitle}>پروفایل</AppText>
            </View>
          </Animated.View>

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
            <View style={styles.profileImageContainer}>
              {user?.AvatarImageURL ? (
                <Image
                  source={{ uri: user.AvatarImageURL }}
                  style={styles.profileImage}
                />
              ) : (
                <LinearGradient
                  colors={['#8b5cf6', '#6366f1', '#06b6d4']}
                  style={styles.profileImageGradient}
                >
                  <MaterialCommunityIcons
                    name={getGenderIcon()}
                    size={85}
                    color="white"
                  />
                </LinearGradient>
              )}
            </View>

            <View style={styles.profileInfo}>
              <AppText style={styles.userNameText}>
                {user?.MemberName || "نام و نام خانوادگی"}
              </AppText>
              <View style={styles.mobileChip}>
                <MaterialIcons name="phone" size={16} color={modernColors.primary} />
                <AppText style={styles.userNameMobileText}>
                  {toPersianDigits(user?.Mobile || "09131234567")}
                </AppText>
              </View>
            </View>
          </Animated.View>

          {/* Profile Options - Horizontal FlatList with RTL */}
          <Animated.View
            style={[
              styles.cardsContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <FlatList
              data={filteredProfileItems}
              renderItem={renderProfileCard}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              inverted={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContainer}
              decelerationRate="fast"
              snapToInterval={width * 0.75 + 15}
              snapToAlignment="center"
              ItemSeparatorComponent={() => <View style={{ width: 15 }} />}
              centerContent={true}
            />
          </Animated.View>

          {/* Logout Button at Bottom */}
          <Animated.View
            style={[
              styles.bottomLogoutContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#E91E63', '#AD1457']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <MaterialIcons name="logout" size={24} color="white" />
                <Text style={styles.primaryButtonText}>خروج از حساب کاربری</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

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
  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
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
    marginTop: -12
  },
  editButton: {
    position: 'absolute',
    top: StatusBar.currentHeight + 45,
    left: 20,
    zIndex: 1000,
  },
  editButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 50,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -12
  },
  logoutButton: {
    position: 'absolute',
    top: StatusBar.currentHeight + 100,
    left: 20,
    zIndex: 1000,
  },
  logoutButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 50,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -12
  },
  titleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Yekan_Bakh_ExtraBold",
    color: "#2c3e50",
    marginHorizontal: 15,
    textAlign: "center",
  },
  profileHeaderContainer: {
    alignItems: "center",
    marginBottom: 30,
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
  },
  profileImage: {
    width: '100%',
    height: '100%',
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
  userNameText: {
    fontSize: 32,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    marginBottom: 12,
    textAlign: "center",
  },
  mobileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userNameMobileText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.primary,
    marginLeft: 8,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.secondary,
    marginLeft: 6,
  },
  cardsContainer: {
    marginBottom: 30,
    marginTop: 50,
  },
  horizontalScrollContainer: {
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    width: width * 0.75,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 2,
  },
  glassCard: {
    backdropFilter: 'blur(20px)',
    padding: 25,
    minHeight: 160,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 1)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontFamily: "Yekan_Bakh_Bold",
    textAlign: 'center',
    textShadowColor: "rgba(255, 255, 255, 0.9)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    lineHeight: 24,
  },
  lockOverlay: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upgradeText: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#999",
    textAlign: 'center',
    marginTop: 8,
  },
  bottomLogoutContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 20
  },
  bottomLogoutButton: {
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#ef4444',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoutGradient: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  logoutButtonText: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: "white",
    marginRight: 12,
  },
  bottomSpacer: {
    height: 50,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modalContent: {
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

  // Permission Modal Styles
  upgradeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF3CD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  upgradeTitle: {
    fontSize: 20,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  upgradeMessage: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },

  // Logout Modal Styles
  logoutIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutTitle: {
    fontSize: 20,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  logoutMessage: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },

  // Modal Buttons
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

  // Permission Modal Buttons
  cancelUpgradeButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  confirmUpgradeButton: {
    backgroundColor: '#ffd700',
  },
  cancelUpgradeText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#374151',
  },
  confirmUpgradeText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#FFFFFF',
  },

  // Logout Modal Buttons
  cancelLogoutButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  confirmLogoutButton: {
    backgroundColor: '#EF4444',
  },
  cancelLogoutText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#374151',
  },
  confirmLogoutText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#FFFFFF',
  },
  primaryButton: {
    width: "100%",
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 20,
  },
  buttonGradient: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 35,
  },
  primaryButtonText: {
    fontSize: 19,
    fontFamily: "Yekan_Bakh_Bold",
    color: "white",
    marginRight: 12,
  },

  // استایل جدید برای متن عمودی
  upgradeTextVertical: {
    position: 'absolute',
    left: 8,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 20,
  },
  upgradeTextRotated: {
    fontSize: 11,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#999",
    textAlign: 'center',
    transform: [{ rotate: '270deg' }],
    width: 100, // عرض کافی برای متن چرخیده
  },
});

export default ProfileScreen;