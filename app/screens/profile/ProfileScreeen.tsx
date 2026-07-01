import React, { useEffect, useRef, useState, useCallback } from "react";
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
import { useFocusEffect } from "@react-navigation/native";

import colors from "../../config/colors";
import AppText from "../../components/Text";
import { toPersianDigits } from "../../utils/converters";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import MainBackground from "../../components/MainBackground";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "../../components/Toast";
import { useAuth } from "../../contexts/AuthContext";
import PermissionService from "../../services/PermissionService";
import SubscriptionInfo from "../../components/SubscriptionInfo";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Tooltip from '../../components/Tooltip';
import { AppNavigationProp } from "../../navigation/types";
import { styles , modernColors } from "./styles/styles";
import { profileItems } from "./contants/ProfileItems";
import { ProfileCard } from "./ui/ProfileCard";

const { width, height } = Dimensions.get('window');


const ProfileScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const [toast, setToast] = useState({ visible: false, message: "", type: "info" });


  const [permissionModal, setPermissionModal] = useState({
    visible: false,
    permission: null,
    targetScreen: null
  });
  const [logoutModal, setLogoutModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Animation states for modals
  const permissionSlideAnim = useRef(new Animated.Value(300)).current;
  const permissionOpacityAnim = useRef(new Animated.Value(0)).current;
  const logoutSlideAnim = useRef(new Animated.Value(300)).current;
  const logoutOpacityAnim = useRef(new Animated.Value(0)).current;

  const insets = useSafeAreaInsets();

  const { user, logout, isAuthenticated, refreshSubscription, setUser } = useAuth();

  const filteredProfileItems = React.useMemo(() => {
    if (user?.ActiveSubscriptionPlan?.IsInfinityPlan) {
      return profileItems.filter(item => item.id !== 7);
    }
    return profileItems;
  }, [user?.ActiveSubscriptionPlan?.IsInfinityPlan]);

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

  const fetchProfile = useCallback(async () => {
    if (!user?.MemberId) return;

    try {
      const response = await fetch(
        `http://my.farimod.ir/api/MobileApp/MemberInfo/GetProfileInfoToEdit?memberId=${user.MemberId}`
      );

      const data = await response.json();

      if (data?.AvatarImageURL) {
        setUser(prev => {
          if (prev.AvatarImageURL === data.AvatarImageURL && prev.MemberName === data.MemberName) {
            return prev;
          }
          return {
            ...prev,
            ...data,
            AvatarImageURL: data.AvatarImageURL + '?t=' + new Date().getTime()
          };
        });
      }
    } catch (e) {
      console.log("Error fetching profile from GetProfileInfoToEdit: ", e);
    }
  }, [user?.MemberId, setUser]);



    useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );



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

  const showToast = (message: any, type = "info") => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ visible: false, message: "", type: "info" });
  };

  const showPermissionModal = (permission: any, targetScreen: any) => {
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
        // showToast('اطلاعات اشتراک بروزرسانی شد', 'success');
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


  const handleCardPress = (screenName : any) => {
    navigation.navigate(screenName);
  };

  const renderProfileCard = ({ item }:any) => (
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
        type={toast.type as any}
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
          <View style={styles.headerActions}>
            {/* <TouchableOpacity
              style={styles.backButton}
              onPress={goToHome}
            >
              <View style={styles.backButtonContainer}>
                <MaterialIcons name="arrow-forward" size={24} color="white" />
              </View>
            </TouchableOpacity> */}

            <View style={styles.headerLeft}>
              <Tooltip content="در این بخش می‌توانید اطلاعات پروفایل، دوره‌ها، نمونه‌کارها و محصولات خود را مدیریت کنید." />
            </View>
          </View>



          <View
            style={[
              styles.headerContainer,
     
            ]}
          >
            <View style={styles.titleWrapper}>
              <AppText style={styles.headerTitle}>پروفایل</AppText>
            </View>
          </View>

          {/* Profile Header */}
          <View
            style={[
              styles.profileHeaderContainer,
            ]}
          >
            <View style={styles.profileImageContainer}>
              {user?.AvatarImageURL ? (
                <Image
                  key={user.AvatarImageURL} // اضافه کردن کلید برای رندر مجدد اجباری
                  source={{
                    uri: user.AvatarImageURL,
                    cache: 'reload' // اجبار به لود مجدد در سیستم عامل
                  }}
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
          </View>

          {/* Profile Options - Horizontal FlatList with RTL */}
          <View
            style={[
              styles.cardsContainer,
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
          </View>

          {/* Logout Button at Bottom */}
          <View
            style={[
              styles.bottomLogoutContainer,
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
          </View>

          {/* Bottom Spacer */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </>
  );
};



export default ProfileScreen;