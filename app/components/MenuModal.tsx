import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  ScrollView,
  Pressable,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons, Fontisto } from '@expo/vector-icons';
import AppText from './Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { InteractionManager } from "react-native";


const { height, width } = Dimensions.get('window');

const MenuModal = ({ visible, onClose, onNavigate, showToast }:any) => {
  const logoutSlideAnim = useRef(new Animated.Value(300)).current;
  const logoutOpacityAnim = useRef(new Animated.Value(0)).current;
  const modalSlideAnim = useRef(new Animated.Value(height)).current;
  const modalBackdropAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSupportTooltip, setShowSupportTooltip] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  const menuItems = [
    {
      id: 'courses',
      title: ' دوره‌ها',
      icon: 'school',
      colors: ['#002fff', '#c993ff'],
      screen: 'AllCourses'
    },
    {
      id: 'members',
      title: ' اعضا',
      icon: 'people',
      colors: ['#5eff00', '#9fb9ff'],
      screen: 'AllMembers'
    },
    {
      id: 'products',
      title: ' محصولات',
      icon: 'shopping-bag',
      colors: ['#0088ff', '#98ff98'],
      screen: 'AllProducts'
    },
    {
      id: 'articles',
      title: ' مقالات',
      icon: 'article',
      colors: ['#2cff72', '#c900a7'],
      screen: 'وبلاگ'
    },
    {
      id: 'portfolios',
      title: ' نمونه کارها',
      icon: 'brush',
      colors: ['#ff457d', '#ffe550'],
      screen: 'AllPortfolio'
    },
    {
      id: 'galleries',
      title: ' گالری‌ها',
      icon: 'photo-library',
      colors: ['#90ebe6', '#4456ff'],
      screen: 'AllGalleries'
    },
    {
      id: 'profile',
      title: 'پروفایل من',
      icon: 'account-circle',
      colors: ['#8aafff', '#ff7345'],
      screen: "پروفایل"
    },
    {
      id: 'instagram',
      title: 'اینستاگرام فریمد',
      icon: 'camera',

      colors: ['#6F0EF7', '#F70060'],
      screen: 'INSTAGRAM'
    },
    {
      id: 'support-guide',
      title: 'راهنمای تماس با پشتیبانی',
      icon: 'help',
      colors: ['#258067', '#4DBCA0'],
      screen: 'SUPPORT_GUIDE'
    },
    {
      id: 'farimod-app',
      title: 'استفاده از اپلیکیشن فریمد',
      icon: 'devices',
      colors: ['#667eea', '#764ba2', '#fa709a'],
      screen: 'farimod_APP',
    },
    {
      id: 'logout',
      title: 'خروج از حساب کاربری',
      icon: 'logout',
      colors: ['#bd001f', '#ff5050'],
      screen: 'LOGOUT'
    }
  ];

useEffect(() => {
  if (visible) {
    InteractionManager.runAfterInteractions(() => {
      setIsRendered(true);

      Animated.parallel([
        Animated.spring(modalSlideAnim, {
          toValue: 0,
          stiffness: 180,
          damping: 20,
          mass: 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(modalBackdropAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    });
  } else {
    Animated.parallel([
      Animated.timing(modalSlideAnim, {
        toValue: height,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(modalBackdropAnim, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsRendered(false);
      setShowLogoutModal(false);
      setShowSupportTooltip(false);
    });
  }
}, [visible]);

useEffect(() => {
  Animated.parallel([
    Animated.spring(logoutSlideAnim, {
      toValue: showLogoutModal ? 0 : 300,
      stiffness: 200,
      damping: 22,
      mass: 0.8,
      useNativeDriver: true,
    }),
    Animated.timing(logoutOpacityAnim, {
      toValue: showLogoutModal ? 1 : 0,
      duration: 140,
      useNativeDriver: true,
    }),
  ]).start();
}, [showLogoutModal]);

  const handleClose = () => {
    onClose();
  };

  const handleCallSupport = async () => {
    const baleUrl = "https://web.bale.ai/chat?uid=550124215";
    try {
      await Linking.openURL(baleUrl);
    } catch {
      showToast("خطا در باز کردن پیام‌رسان بله", "error");
    }
  };

  const handleMenuItemPress = (screen) => {
    if (screen === 'LOGOUT') {
      setShowLogoutModal(true);
    } else if (screen === 'SUPPORT_GUIDE') {
      setShowSupportTooltip(true);
    } else if (screen === 'farimod_APP') {
      Linking.openURL('https://farimod.ir/app-use').catch(() => {
        showToast("خطا در باز کردن لینک", "error");
      });
      handleClose();
    } else if (screen === 'INSTAGRAM') {
      Linking.openURL('https://www.instagram.com/farimod.comm').catch(() => {
        showToast("خطا در باز کردن اینستاگرام", "error");
      });
      handleClose();
    } else {
      onNavigate(screen);
      handleClose();
    }
  };

  const handleLogoutConfirm = () => {
    onNavigate('LOGOUT');
    setShowLogoutModal(false);
    handleClose();
  };

  if (!isRendered) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View
        style={[styles.modalBackdrop, { opacity: modalBackdropAnim }]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={handleClose}
          activeOpacity={1}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.modalContent,
          {
            paddingBottom: insets.bottom,
            transform: [{ translateY: modalSlideAnim }],
          },
        ]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
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

        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <View style={styles.menuItems}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => handleMenuItemPress(item.screen)}
                activeOpacity={0.8}
              >
                <View style={styles.menuItemContent}>
                  <LinearGradient
                    colors={item.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.menuItemIcon}
                  >
                    {item.iconFamily === 'MaterialCommunityIcons' ? (
                      <MaterialCommunityIcons name={item.icon} size={28} color="white" />
                    ) : (
                      <MaterialIcons name={item.icon} size={28} color="white" />
                    )}
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

        <View style={styles.fixedBottomSection}>
          <TouchableOpacity
            style={styles.supportButton}
            onPress={handleCallSupport}
            activeOpacity={0.8}
          >
            <MaterialIcons name="headset-mic" size={20} color="white" />
            <AppText style={styles.supportText}>پشتیبانی بله</AppText>
          </TouchableOpacity>
          <AppText style={styles.versionText}>نسخه 1.45</AppText>
        </View>
      </Animated.View>

      {showLogoutModal && (
        <Animated.View
          style={[styles.logoutOverlay, { opacity: logoutOpacityAnim }]}
          pointerEvents="auto"
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowLogoutModal(false)} />
          <Animated.View
            style={[
              styles.logoutModalContent,
              {
                transform: [{ translateY: logoutSlideAnim }],
                marginBottom: Math.max(insets.bottom, 20),
              }
            ]}
          >
            <View style={styles.logoutIconContainer}>
              <MaterialIcons name="logout" size={48} color="#EF4444" />
            </View>
            <AppText style={styles.logoutTitle}>خروج از حساب کاربری</AppText>
            <AppText style={styles.logoutMessage}>
              آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟
            </AppText>
            <View style={styles.logoutButtonsContainer}>
              <TouchableOpacity
                style={[styles.logoutButton, styles.cancelLogoutButton]}
                onPress={() => setShowLogoutModal(false)}
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
        </Animated.View>
      )}

      {showSupportTooltip && (
        <TouchableOpacity
          style={styles.tooltipModalOverlay}
          activeOpacity={1}
          onPress={() => setShowSupportTooltip(false)}
          pointerEvents="auto"
        >
          <View style={styles.tooltipContainer}>
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.tooltipHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.tooltipHeaderContent}>
                <View style={styles.tooltipIconWrapper}>
                  <MaterialIcons name="help" size={32} color="white" />
                </View>
                <AppText style={styles.tooltipTitle}>راهنمای تماس با پشتیبانی</AppText>
              </View>
              <TouchableOpacity
                onPress={() => setShowSupportTooltip(false)}
                style={styles.tooltipCloseButton}
              >
                <MaterialIcons name="close" size={24} color="white" />
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.tooltipContent}>
              <AppText style={styles.tooltipText}>
                برای ارتباط با پشتیبانی می‌توانید از طریق پیام‌رسان بله با ما در ارتباط باشید. بدین منظور از دکمه پشتیبانی بله در پایین منو استفاده کنید.
              </AppText>
              <TouchableOpacity
                style={styles.tooltipGotItButton}
                onPress={() => setShowSupportTooltip(false)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  style={styles.tooltipGotItGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <MaterialIcons name="check" size={20} color="white" />
                  <AppText style={styles.tooltipGotItText}>متوجه شدم</AppText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 15,
    paddingHorizontal: 20,
    maxHeight: height * 0.75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
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
  scrollContent: {
    flex: 1,
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
  fixedBottomSection: {
    paddingTop: 15,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  supportButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#10B981',
    gap: 6,
  },
  supportText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: 'white',
  },
  versionText: {
    fontSize: 13,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#9CA3AF',
  },
  logoutOverlay: {
    ...StyleSheet.absoluteFillObject,
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
    shadowOffset: { width: 0, height: 8 },
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
  tooltipModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tooltipContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    maxWidth: width - 40,
    width: '100%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  tooltipHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  tooltipHeaderContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  tooltipIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  tooltipTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Yekan_Bakh_Bold',
    color: 'white',
    textAlign: 'right',
  },
  tooltipCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltipContent: {
    padding: 24,
  },
  tooltipText: {
    fontSize: 16,
    fontFamily: 'Yekan_Bakh_Regular',
    color: '#374151',
    lineHeight: 28,
    textAlign: 'justify',
    marginBottom: 24,
  },
  tooltipGotItButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  tooltipGotItGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  tooltipGotItText: {
    fontSize: 16,
    fontFamily: 'Yekan_Bakh_Bold',
    color: 'white',
  },
});

export default MenuModal;