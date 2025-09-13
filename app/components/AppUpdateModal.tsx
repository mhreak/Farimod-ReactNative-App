// components/AppUpdateModal.js
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Pressable,
  Linking,
  StyleSheet,
  BackHandler,
  Alert,
  StatusBar
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AppText from './Text';

const AppUpdateModal = ({
  visible,
  updateInfo,
  onDirectDownload,
  onCafeBazarDownload,
  onLater,
  onClose
}) => {
  const [slideAnim] = useState(new Animated.Value(300));
  const [opacityAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  // جلوگیری از بستن مدال در صورت اجباری بودن
  useEffect(() => {
    if (visible && updateInfo?.type === 'required') {
      const backAction = () => {
        return true; // جلوگیری از بستن اپ
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );

      return () => backHandler.remove();
    }
  }, [visible, updateInfo]);

  if (!updateInfo) return null;

  const isRequired = updateInfo.type === 'required';

  const handleBackdropPress = () => {
    // فقط در صورتی که اجباری نباشد، اجازه بستن با کلیک پس‌زمینه
    if (!isRequired && onClose) {
      onClose();
    }
  };

  const handleDirectDownload = () => {
    if (onDirectDownload) {
      onDirectDownload();
    }
  };

  const handleCafeBazarDownload = () => {
    if (onCafeBazarDownload) {
      onCafeBazarDownload();
    }
  };

  const handleLater = () => {
    if (onLater) {
      onLater();
    }
  };

  // تعیین اینکه آیا لینک مستقیم وجود دارد یا نه
  const hasDirectLink = updateInfo.downloadLink && updateInfo.downloadLink.trim() !== '';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={isRequired ? () => { } : onClose}
    >
      <Pressable
        style={[
          styles.modalOverlay,
          isRequired && styles.requiredOverlay
        ]}
        onPress={handleBackdropPress}
      >
        <Animated.View
          style={[
            styles.modalContent,
            isRequired && styles.requiredModalContent,
            {
              transform: [{ translateY: slideAnim }],
              opacity: opacityAnim,
            }
          ]}
        >
          {/* آیکون */}
          <View style={[
            styles.iconContainer,
            { backgroundColor: isRequired ? '#FEE2E2' : '#E0F7FA' }
          ]}>
            <MaterialIcons
              name={isRequired ? "warning" : "system-update"}
              size={48}
              color={isRequired ? "#EF4444" : "#0891B2"}
            />
          </View>

          {/* عنوان */}
          <AppText style={[
            styles.title,
            isRequired && styles.requiredTitle
          ]}>
            {updateInfo.title}
          </AppText>

          {/* پیام */}
          <AppText style={[
            styles.message,
            isRequired && styles.requiredMessage
          ]}>
            {updateInfo.message}
          </AppText>

   

          {/* نشانگر اجباری */}
          {isRequired && (
            <View style={styles.requiredIndicator}>
              <MaterialIcons name="error" size={16} color="#EF4444" />
              <AppText style={styles.requiredText}>
                این بروزرسانی اجباری است و باید انجام شود
              </AppText>
            </View>
          )}

          {/* دکمه‌ها عمودی */}
          <View style={styles.buttonsContainer}>
            {/* دکمه کافه بازار */}
            <TouchableOpacity
              style={[styles.button, styles.bazarButton]}
              onPress={handleCafeBazarDownload}
            >
              <MaterialIcons name="shop" size={20} color="#FFFFFF" />
              <AppText style={styles.bazarButtonText}>دانلود از کافه بازار</AppText>
            </TouchableOpacity>

            {/* دکمه دانلود مستقیم - همیشه نمایش داده می‌شود */}
            <TouchableOpacity
              style={[styles.button, styles.downloadButton]}
              onPress={handleDirectDownload}
            >
              <MaterialIcons name="download" size={20} color="#FFFFFF" />
              <AppText style={styles.downloadButtonText}>دانلود با لینک مستقیم</AppText>
            </TouchableOpacity>

            {/* دکمه بعداً - فقط اگر اجباری نباشد */}
            {!isRequired && (
              <TouchableOpacity
                style={[styles.button, styles.laterButton]}
                onPress={handleLater}
              >
                <MaterialIcons name="schedule" size={20} color="#6B7280" />
                <AppText style={styles.laterButtonText}>بعداً بروزرسانی می‌کنم</AppText>
              </TouchableOpacity>
            )}
          </View>

          {/* هشدار اجباری */}
          {isRequired && (
            <View style={styles.forceUpdateWarning}>
              <MaterialIcons name="block" size={18} color="#EF4444" />
              <AppText style={styles.forceUpdateWarningText}>
                تا زمان بروزرسانی، امکان استفاده از اپ وجود ندارد
              </AppText>
            </View>
          )}
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  requiredOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
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
    maxWidth: 380,
  },
  requiredModalContent: {
    borderWidth: 3,
    borderColor: '#EF4444',
    shadowOpacity: 0.4,
    elevation: 25,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  requiredTitle: {
    fontSize: 22,
    color: '#EF4444',
  },
  message: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  requiredMessage: {
    fontSize: 17,
    color: '#374151',
    fontFamily: "Yekan_Bakh_Bold",
  },
  versionContainer: {
    backgroundColor: '#F9FAFB',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginBottom: 15,
  },
  requiredVersionContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  versionText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#4B5563',
    textAlign: 'center',
    marginVertical: 2,
  },
  requiredIndicator: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  requiredText: {
    fontSize: 13,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#EF4444',
    marginRight: 8,
    textAlign: 'center',
    flex: 1,
  },
  buttonsContainer: {
    width: '100%',
    marginTop: 20,
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row-reverse',
    marginBottom: 12,
    minHeight: 50,
  },
  bazarButton: {
    backgroundColor: '#8FB937',
  },
  downloadButton: {
    backgroundColor: '#1E40AF',
  },
  laterButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  bazarButtonText: {
    fontSize: 15,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#FFFFFF',
    marginRight: 8,
  },
  downloadButtonText: {
    fontSize: 15,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#FFFFFF',
    marginRight: 8,
  },
  laterButtonText: {
    fontSize: 15,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#6B7280',
    marginRight: 8,
  },
  forceUpdateWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  forceUpdateWarningText: {
    fontSize: 13,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#EF4444',
    marginRight: 8,
    textAlign: 'center',
    flex: 1,
  },
});

export default AppUpdateModal;