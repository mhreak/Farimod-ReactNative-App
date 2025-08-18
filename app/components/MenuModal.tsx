import React, { useRef, useEffect, useState } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  StatusBar,
  ScrollView,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import AppText from './Text';
import colors from '../config/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

const MenuModal = ({ visible, onClose, onNavigate }) => {
  const modalSlideAnim = useRef(new Animated.Value(0)).current;
  const modalBackdropAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  // State برای مدال خروج
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutSlideAnim] = useState(new Animated.Value(300));
  const [logoutOpacityAnim] = useState(new Animated.Value(0));

  const menuItems = [
    {
      id: 'courses',
      title: ' دوره‌ها',
      icon: 'school',
      colors: ['#002fff', '#c993ff'], // آبی به بنفش
      screen: 'AllCourses'
    },
    {
      id: 'members',
      title: ' اعضا',
      icon: 'people',
      colors: ['#5eff00', '#9fb9ff'], // صورتی به قرمز
      screen: 'AllMembers'
    },
    {
      id: 'products',
      title: ' محصولات',
      icon: 'shopping-bag',
      colors: ['#0088ff', '#98ff98'], // آبی روشن به آبی نئون
      screen: 'AllProducts'
    },
    {
      id: 'articles',
      title: ' مقالات',
      icon: 'article',
      colors: ['#2cff72', '#c900a7'], // سبز به فیروزه‌ای
      screen: 'مجله ی فریمد'
    },
    {
      id: 'portfolios',
      title: ' نمونه کارها',
      icon: 'brush',
      colors: ['#ff457d', '#ffe550'], // صورتی به زرد
      screen: 'AllPortfolio'
    },
    {
      id: 'galleries',
      title: ' گالری‌ها',
      icon: 'photo-library',
      colors: ['#90ebe6', '#4456ff'], // آبی پاستل به صورتی پاستل
      screen: 'AllGalleries'
    },
    {
      id: 'profile',
      title: 'پروفایل من',
      icon: 'account-circle',
      colors: ['#8aafff', '#ff7345'], // کرم به نارنجی
      screen: "پروفایل"
    },
    {
      id: 'logout',
      title: 'خروج از حساب کاربری',
      icon: 'logout',
      colors: ['#bd001f', '#ff5050'], // قرمز صورتی به صورتی
      screen: 'LOGOUT'
    }
  ];

  useEffect(() => {
    if (visible) {
      // ریست انیمیشن‌ها
      modalSlideAnim.setValue(0);
      modalBackdropAnim.setValue(0);

      Animated.parallel([
        Animated.timing(modalBackdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(modalSlideAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // ریست کردن مقادیر هنگام بسته شدن
      modalSlideAnim.setValue(0);
      modalBackdropAnim.setValue(0);
      setShowLogoutModal(false); // بستن مدال خروج
    }
  }, [visible]);

  // انیمیشن مدال خروج
  useEffect(() => {
    if (showLogoutModal) {
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
  }, [showLogoutModal]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(modalBackdropAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(modalSlideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleMenuItemPress = (screen) => {
    if (screen === 'LOGOUT') {
      setShowLogoutModal(true);
    } else {
      handleClose();
      // کاهش تاخیر
      setTimeout(() => {
        onNavigate(screen);
      }, 200);
    }
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    handleClose();
    setTimeout(() => {
      onNavigate('LOGOUT');
    }, 200);
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="none"
        onRequestClose={handleClose}
        statusBarTranslucent={true}
      >
        <View style={styles.modalContainer}>
          <Animated.View
            style={[
              styles.modalBackdrop,
              {
                opacity: modalBackdropAnim,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.backdropTouchable}
              onPress={handleClose}
              activeOpacity={1}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.modalContent,
              {
                paddingBottom: insets.bottom, // فقط safe area، بدون padding اضافی
                transform: [
                  {
                    translateY: modalSlideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* آیکون بستن همراه با عنوان */}
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View style={styles.headerTitleRow}>
                <TouchableOpacity
                  style={styles.closeIcon}
                  onPress={handleClose}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="close" size={30} color="#DC2626" />
                </TouchableOpacity>
                <AppText style={styles.modalTitle}>منوی اصلی</AppText>
              </View>
              <AppText style={styles.modalSubtitle}>دسترسی سریع به تمام بخش‌ها</AppText>
            </View>

            {/* قسمت اسکرول شونده */}
            <ScrollView
              style={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              bounces={true}
            >
              <View style={styles.menuItems}>
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.menuItem}
                    onPress={() => handleMenuItemPress(item.screen)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.menuItemContent}>
                      <LinearGradient
                        colors={item.colors}
                        style={styles.menuItemIcon}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <MaterialIcons name={item.icon} size={28} color="#ffffff" />
                      </LinearGradient>

                      <View style={styles.menuItemText}>
                        <AppText style={styles.menuItemTitle}>{item.title}</AppText>
                      </View>

                      <MaterialIcons name="chevron-left" size={24} color="#9e9e9e" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>


          </Animated.View>
        </View>
      </Modal>

      {/* مدال تأیید خروج */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="none"
        onRequestClose={handleLogoutCancel}
        statusBarTranslucent={true}
      >
        <Pressable style={styles.logoutModalOverlay} onPress={handleLogoutCancel}>
          <Animated.View
            style={[
              styles.logoutModalContent,
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
            <View style={styles.logoutButtonsContainer}>
              <TouchableOpacity
                style={[styles.logoutButton, styles.cancelLogoutButton]}
                onPress={handleLogoutCancel}
              >
                <AppText style={styles.cancelLogoutText}>انصراف</AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.logoutButton, styles.confirmLogoutButton]}
                onPress={handleLogoutConfirm}
              >
                <AppText style={styles.confirmLogoutText}>خروج</AppText>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',

  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouchable: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 15,
    paddingHorizontal: 20,
    maxHeight: height * 0.90,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
  },
  closeIcon: {
    position: 'absolute',
    left: 0,
    width: 40,
    height: 40,
    borderRadius: 100,
    top: 5,

    borderWidth: 3,
    borderColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#6c757d",
  },
  menuItems: {
    marginBottom: 20,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 15,
    marginBottom: 12,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',

  },
  menuItemContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  menuItemIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
    elevation: 2,
  },
  menuItemText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  menuItemTitle: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    marginBottom: 4,
  },

  closeButton: {
    backgroundColor: "#ef444450", 
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DC2626', 
    marginTop: 10,
    marginBottom: 40,

  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#DC2626', // متن سفید
  },

  // استایل‌های مدال خروج
  logoutModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logoutModalContent: {
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
  logoutButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  logoutButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
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
});

export default MenuModal;