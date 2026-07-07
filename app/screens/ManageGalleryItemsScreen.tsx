import React, { useState, useEffect, useRef, useCallback } from "react";
import AppText from "../components/Text";
import {
  Image,
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Platform
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import axios from 'axios';
import MainBackground from "../components/MainBackground";
import Toast from "../components/Toast";
import appConfig from "../config/config";
import { toPersianDigits } from "../utils/converters";
import { useAuth } from "../contexts/AuthContext";

const modernColors = {
  primary: "#667eea",
  primaryDark: "#764ba2",
  success: "#2ecc71",
  warning: "#f39c12",
  error: "#e74c3c",
  info: "#3498db",
};

const ManageGalleryItemsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const { galleryId, galleryTitle } = route.params || {};

  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modals
  const [modalVisible, setModalVisible] = useState(false);
  const [fullScreenModalVisible, setFullScreenModalVisible] = useState(false);
  const [fullScreenImageUri, setFullScreenImageUri] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDeleteGalleryModal, setShowDeleteGalleryModal] = useState(false);

  // Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const modalSlideAnim = useRef(new Animated.Value(300)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;
  const actionModalSlideAnim = useRef(new Animated.Value(0)).current;
  const actionModalBackdropAnim = useRef(new Animated.Value(0)).current;
  const deleteGalleryModalSlideAnim = useRef(new Animated.Value(0)).current;
  const deleteGalleryModalBackdropAnim = useRef(new Animated.Value(0)).current;

  const showToast = (message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // Fetch gallery items
  const fetchGalleryItems = async () => {
    if (!galleryId) {
      console.log('❌ No gallery ID provided');
      return;
    }

    try {
      setLoading(true);

      console.log('📥 Fetching gallery items for ID:', galleryId);

      const response = await fetch(
        `${appConfig.mobileApi}ImageGallery/Get?id=${galleryId}`
      );

      if (!response.ok) {
        throw new Error('خطا در دریافت اطلاعات گالری');
      }

      const result = await response.json();
      console.log('📥 Gallery API response:', result);

      // Check different possible response structures
      let items = [];

      if (result.ImageGallery?.ImageGalleryItemList) {
        items = result.ImageGallery.ImageGalleryItemList;
        console.log('✅ Found items in ImageGallery.ImageGalleryItemList');
      } else if (result.ImageGalleryItemList) {
        items = result.ImageGalleryItemList;
        console.log('✅ Found items in ImageGalleryItemList');
      } else if (Array.isArray(result)) {
        items = result;
        console.log('✅ Response is array');
      }

      // Sort by ShowOrder
      if (items && items.length > 0) {
        items.sort((a, b) => (a.ShowOrder || 0) - (b.ShowOrder || 0));
        console.log('✅ Items sorted, total:', items.length);
        console.log('📸 First item:', items[0]);
      } else {
        console.log('⚠️ No items found');
      }

      setGalleryItems(items || []);
    } catch (error) {
      console.error('❌ Error fetching gallery:', error);
      showToast('خطا در دریافت تصاویر', 'error');
      setGalleryItems([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGalleryItems();
    }, [galleryId])
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (modalVisible) {
      Animated.parallel([
        Animated.timing(modalSlideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalSlideAnim, {
          toValue: 300,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [modalVisible]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGalleryItems();
    setRefreshing(false);
  };

  // Add new image
  const selectImageSource = () => {
    setModalVisible(true);
  };

  const selectFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showToast('نیاز به دسترسی گالری دارید', 'error');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled) {
        setModalVisible(false);
        await uploadNewImage(result.assets[0]);
      }
    } catch (error) {
      console.error('❌ Error selecting image:', error);
      showToast('خطا در انتخاب تصویر', 'error');
    }
  };

  const selectFromCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showToast('نیاز به دسترسی دوربین دارید', 'error');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled) {
        setModalVisible(false);
        await uploadNewImage(result.assets[0]);
      }
    } catch (error) {
      console.error('❌ Error taking photo:', error);
      showToast('خطا در گرفتن عکس', 'error');
    }
  };

  const uploadNewImage = async (imageAsset) => {
    try {
      setUploadingImage(true);
      console.log('📤 Uploading new image...');

      const formData = new FormData();

      // Gallery item data
      formData.append('ImageGalleryItemId', '0');
      formData.append('ImageGalleryId', galleryId ? galleryId.toString() : '0');
      formData.append('Title', galleryTitle || 'تصویر جدید');
      formData.append('ImageFileName', '');
      formData.append('ImageURL', '');
      formData.append('ShowOrder', galleryItems ? galleryItems.length.toString() : '0');
      formData.append('Active', 'true');
      formData.append('ActiveStr', 'فعال');
      formData.append('InsertDate', new Date().toISOString());
      formData.append('ShamsiInsertDate', '');

      // Image file
      let imageUri = imageAsset.uri;
      if (Platform.OS === 'android' && !imageUri.startsWith('file://')) {
        imageUri = `file://${imageUri}`;
      }

      let fileType = imageAsset.type || 'image/jpeg';
      if (!fileType.startsWith('image/')) {
        const uriParts = imageUri.split('.');
        const fileExtension = uriParts[uriParts.length - 1].toLowerCase();
        fileType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';
      }

      const fileName = imageAsset.fileName || `gallery-item-${Date.now()}.jpg`;

      const imageFile = {
        uri: imageUri,
        type: fileType,
        name: fileName
      };

      formData.append('imageFile', imageFile);

      console.log('📦 Uploading with FormData...');
      console.log('📦 Gallery ID:', galleryId);
      console.log('📦 Current items count:', galleryItems ? galleryItems.length : 0);

      const response = await axios.post(
        `${appConfig.mobileApi}ImageGalleryItem/Add`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': '*/*',
          },
          timeout: 60000,
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`📤 Upload: ${percent}%`);
          },
        }
      );

      console.log('✅ Image uploaded:', response.data);
      showToast('تصویر با موفقیت اضافه شد', 'success');

      // Refresh list
      await fetchGalleryItems();

    } catch (error) {
      console.error('❌ Upload error:', error);
      console.error('❌ Error details:', error.response?.data);
      showToast(error.message || 'خطا در آپلود تصویر', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  // Delete item
  const handleShowItemActions = (item) => {
    setSelectedItem(item);
    setShowActionModal(true);
    Animated.parallel([
      Animated.timing(actionModalBackdropAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(actionModalSlideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCloseActionModal = () => {
    Animated.parallel([
      Animated.timing(actionModalBackdropAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(actionModalSlideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowActionModal(false);
      setSelectedItem(null);
    });
  };

  const confirmDeleteItem = async () => {
    if (!selectedItem) return;

    handleCloseActionModal();

    try {
      setDeletingItemId(selectedItem.ImageGalleryItemId);

      console.log('🗑️ Deleting item:', selectedItem.ImageGalleryItemId);

      const response = await fetch(
        `${appConfig.mobileApi}ImageGalleryItem/Delete?imageGalleryItemId=${selectedItem.ImageGalleryItemId}&imageGalleryId=${galleryId}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        showToast('تصویر با موفقیت حذف شد', 'success');
        await fetchGalleryItems();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.Message || 'خطا در حذف تصویر');
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      showToast(error.message || 'خطا در حذف تصویر', 'error');
    } finally {
      setDeletingItemId(null);
      setSelectedItem(null);
    }
  };

  // Delete entire gallery
  const handleShowDeleteGallery = () => {
    setShowDeleteGalleryModal(true);
    Animated.parallel([
      Animated.timing(deleteGalleryModalBackdropAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(deleteGalleryModalSlideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCloseDeleteGalleryModal = () => {
    Animated.parallel([
      Animated.timing(deleteGalleryModalBackdropAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(deleteGalleryModalSlideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowDeleteGalleryModal(false);
    });
  };

  const confirmDeleteGallery = async () => {
    handleCloseDeleteGalleryModal();

    try {
      setIsDeleting(true);

      console.log('🗑️ Deleting gallery:', galleryId);

      const response = await fetch(
        `${appConfig.mobileApi}ImageGallery/Delete?imageGalleryId=${galleryId}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        showToast('گالری با موفقیت حذف شد', 'success');
                (navigation as any).navigate("App", { screen: "MyGallery" });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.Message || 'خطا در حذف گالری');
      }
    } catch (error) {
      showToast(error.message || 'خطا در حذف گالری', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImagePress = (uri) => {
    setFullScreenImageUri(uri);
    setFullScreenModalVisible(true);
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={{ flex: 1 }}>
        <MainBackground />

        <Toast
          visible={toastVisible}
          message={toastMessage}
          type={toastType}
          onHide={() => setToastVisible(false)}
        />

        {/* Header */}
        <View
          style={[
            styles.headerContainer,
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>           navigation.navigate("App", { screen: "MainTabs", params: { screen: "خانه" } })}
          >
            <View style={styles.backButtonContainer}>
              <MaterialIcons name="arrow-forward" size={26} color="#6366f1" />
            </View>
          </TouchableOpacity>

          <View style={styles.titleWrapper}>
            <AppText style={styles.headerTitle}>{galleryTitle || 'مدیریت گالری'}</AppText>
            <AppText style={styles.subtitleText}>
              {toPersianDigits((galleryItems?.length || 0).toString())} تصویر
            </AppText>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={selectImageSource}
            disabled={uploadingImage}
          >
            <View
              style={styles.addButtonGradient}
            >
              {uploadingImage ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <MaterialIcons name="add-a-photo" size={26} color="white" />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[modernColors.primary]}
              tintColor={modernColors.primary}
            />
          }
        >
          <View
            style={[
              styles.content,
            ]}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={modernColors.primary} />
                <AppText style={styles.loadingText}>در حال بارگذاری...</AppText>
              </View>
            ) : !galleryItems || galleryItems.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="photo-library" size={80} color="#ccc" />
                <AppText style={styles.emptyText}>هنوز تصویری اضافه نشده</AppText>
                <AppText style={styles.emptySubtext}>
                  از دکمه بالا تصویر جدید اضافه کنید
                </AppText>
              </View>
            ) : (
              <View style={styles.gridContainer}>
                {galleryItems.map((item) => (
                  <View key={item.ImageGalleryItemId} style={styles.imageCard}>
                    <TouchableOpacity
                      style={styles.imageWrapper}
                      onPress={() => handleImagePress(item.ImageURL)}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={{ uri: item.ImageURL }}
                        style={styles.imageItem}
                        resizeMode="cover"
                      />

                      {deletingItemId === item.ImageGalleryItemId && (
                        <View style={styles.deletingOverlay}>
                          <ActivityIndicator color="white" size="large" />
                        </View>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleShowItemActions(item)}
                      disabled={deletingItemId === item.ImageGalleryItemId}
                    >
                      <LinearGradient
                        colors={['#e74c3c', '#c0392b']}
                        style={styles.deleteButtonGradient}
                      >
                        <MaterialIcons name="delete" size={20} color="white" />
                      </LinearGradient>
                    </TouchableOpacity>

              
                  </View>
                ))}
              </View>
            )}

            {/* Delete Gallery Button */}
            {galleryItems && galleryItems.length > 0 && (
              <View style={styles.dangerZone}>
                <TouchableOpacity
                  style={styles.deleteGalleryButton}
                  onPress={handleShowDeleteGallery}
                  disabled={isDeleting}
                >
                  <LinearGradient
                    colors={['#e74c3c', '#c0392b']}
                    style={styles.deleteGalleryGradient}
                  >
                    <MaterialIcons name="delete-forever" size={24} color="white" />
                    <AppText style={styles.deleteGalleryText}>
                      {isDeleting ? 'در حال حذف...' : 'حذف کل گالری'}
                    </AppText>
                  </LinearGradient>
                </TouchableOpacity>
               
              </View>
            )}
          </View>
        </ScrollView>

        {/* Add Image Modal */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="none"
          onRequestClose={() => setModalVisible(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setModalVisible(false)}
          >
            <Animated.View
              style={[
                styles.modalContent,
                {
                  transform: [{ translateY: modalSlideAnim }],
                  opacity: modalOpacityAnim,
                }
              ]}
            >
              <View style={styles.modalHeader}>
                <View style={styles.modalHandle} />
                <AppText style={styles.modalTitle}>انتخاب روش</AppText>
              </View>

              <View style={styles.imagePickerContainer}>
                <TouchableOpacity
                  style={styles.pickerOption}
                  onPress={selectFromGallery}
                  activeOpacity={0.8}
                >
                  <View style={[styles.pickerIcon, { backgroundColor: '#6366F1' }]}>
                    <MaterialIcons name="photo-library" size={32} color="white" />
                  </View>
                  <AppText style={styles.pickerLabel}>گالری</AppText>
                  <AppText style={styles.pickerDescription}>انتخاب از تصاویر موجود</AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.pickerOption}
                  onPress={selectFromCamera}
                  activeOpacity={0.8}
                >
                  <View style={[styles.pickerIcon, { backgroundColor: '#10B981' }]}>
                    <MaterialIcons name="camera-alt" size={32} color="white" />
                  </View>
                  <AppText style={styles.pickerLabel}>دوربین</AppText>
                  <AppText style={styles.pickerDescription}>گرفتن عکس جدید</AppText>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <AppText style={styles.cancelText}>لغو</AppText>
              </TouchableOpacity>

              <View style={[styles.modalSafeArea, { height: insets.bottom }]} />
            </Animated.View>
          </Pressable>
        </Modal>

        {/* Delete Item Confirmation Modal */}
        <Modal
          visible={showActionModal}
          transparent={true}
          animationType="none"
          onRequestClose={handleCloseActionModal}
        >
          <View style={styles.actionModalContainer}>
            <Animated.View
              style={[
                styles.actionModalBackdrop,
                { opacity: actionModalBackdropAnim },
              ]}
            >
              <TouchableOpacity
                style={styles.backdropTouchable}
                onPress={handleCloseActionModal}
                activeOpacity={1}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.actionModalContent,
                {
                  transform: [
                    {
                      translateY: actionModalSlideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [300, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.modalHandle} />

              <View style={styles.deleteWarningIcon}>
                <MaterialIcons name="warning" size={32} color="#ffffff" />
              </View>

              <AppText style={styles.actionModalTitle}>حذف تصویر</AppText>
              <AppText style={styles.actionModalMessage}>
                آیا از حذف این تصویر اطمینان دارید؟
              </AppText>

              <View style={styles.deleteButtonsRow}>
                <TouchableOpacity
                  style={styles.actionModalCancelButton}
                  onPress={handleCloseActionModal}
                >
                  <AppText style={styles.actionModalCancelText}>لغو</AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmDeleteButton}
                  onPress={confirmDeleteItem}
                >
                  <LinearGradient
                    colors={['#e74c3c', '#c0392b']}
                    style={styles.confirmDeleteGradient}
                  >
                    <MaterialIcons name="delete" size={20} color="#ffffff" />
                    <AppText style={styles.confirmDeleteText}>حذف</AppText>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>

        {/* Delete Gallery Confirmation Modal */}
        <Modal
          visible={showDeleteGalleryModal}
          transparent={true}
          animationType="none"
          onRequestClose={handleCloseDeleteGalleryModal}
        >
          <View style={styles.actionModalContainer}>
            <Animated.View
              style={[
                styles.actionModalBackdrop,
                { opacity: deleteGalleryModalBackdropAnim },
              ]}
            >
              <TouchableOpacity
                style={styles.backdropTouchable}
                onPress={handleCloseDeleteGalleryModal}
                activeOpacity={1}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.actionModalContent,
                {
                  transform: [
                    {
                      translateY: deleteGalleryModalSlideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [300, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.modalHandle} />

              <View style={styles.deleteWarningIcon}>
                <MaterialIcons name="warning" size={32} color="#ffffff" />
              </View>

              <AppText style={styles.actionModalTitle}>حذف کل گالری</AppText>
              <AppText style={styles.actionModalMessage}>
                آیا از حذف کل گالری اطمینان دارید؟{'\n'}
                تمام تصاویر این گالری حذف خواهند شد.{'\n'}
                این عمل قابل بازگشت نیست!
              </AppText>

              <View style={styles.deleteButtonsRow}>
                <TouchableOpacity
                  style={styles.actionModalCancelButton}
                  onPress={handleCloseDeleteGalleryModal}
                  disabled={isDeleting}
                >
                  <AppText style={styles.actionModalCancelText}>لغو</AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmDeleteButton}
                  onPress={confirmDeleteGallery}
                  disabled={isDeleting}
                >
                  <LinearGradient
                    colors={['#e74c3c', '#c0392b']}
                    style={styles.confirmDeleteGradient}
                  >
                    {isDeleting ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <MaterialIcons name="delete-forever" size={20} color="#ffffff" />
                    )}
                    <AppText style={styles.confirmDeleteText}>
                      {isDeleting ? 'در حال حذف...' : 'بله، حذف کن'}
                    </AppText>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>

        {/* Full Screen Image Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={fullScreenModalVisible}
          onRequestClose={() => setFullScreenModalVisible(false)}
        >
          <View style={styles.fullScreenModalOverlay}>
            <TouchableOpacity
              style={styles.fullScreenCloseButton}
              onPress={() => setFullScreenModalVisible(false)}
            >
              <MaterialIcons name="close" size={30} color="white" />
            </TouchableOpacity>

            {fullScreenImageUri && (
              <Image
                source={{ uri: fullScreenImageUri }}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            )}
          </View>
        </Modal>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: StatusBar.currentHeight + 30,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backButton: {
    width: 50,
    height: 50,
  },
  backButtonContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#7f8c8d",
    marginTop: 2,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'#4CAF50',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#7f8c8d",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#7f8c8d",
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#95a5a6",
    marginTop: 10,
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  imageCard: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  imageItem: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  deletingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  deleteButtonGradient: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageTitleContainer: {
    padding: 10,
    backgroundColor: '#f8f9fa',
  },
  imageTitle: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#2c3e50",
    textAlign: 'center',
  },
  dangerZone: {
    marginTop: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  deleteGalleryButton: {
    width: '100%',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  deleteGalleryGradient: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 10,
  },
  deleteGalleryText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#ffffff',
  },
  dangerWarning: {
    fontSize: 13,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#e74c3c',
    marginTop: 10,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalSafeArea: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: -20,
  },
  modalHeader: {
    alignItems: 'center',
    paddingBottom: 25,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#1F2937",
  },
  imagePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 25,
    gap: 15,
  },
  pickerOption: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingVertical: 25,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pickerIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  pickerLabel: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#1F2937',
    marginBottom: 4,
  },
  pickerDescription: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  cancelButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 15,
    paddingVertical: 16,
    marginTop: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  cancelText: {
    fontSize: 16,
    color: '#DC2626',
    fontFamily: "Yekan_Bakh_Bold",
    textAlign: 'center',
  },
  actionModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  actionModalBackdrop: {
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
  actionModalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 15,
    paddingBottom: 35,
    paddingHorizontal: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  deleteWarningIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: modernColors.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center',
    shadowColor: modernColors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionModalTitle: {
    fontSize: 20,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    textAlign: 'center',
    marginBottom: 15,
  },
  actionModalMessage: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#6c757d",
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 25,
  },
  deleteButtonsRow: {
    flexDirection: 'row-reverse',
    gap: 15,
  },
  confirmDeleteButton: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: modernColors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmDeleteGradient: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 10,
    backgroundColor:'#c0392b'
  },
  confirmDeleteText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#ffffff',
  },
  actionModalCancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  actionModalCancelText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#6c757d',
  },
  fullScreenModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  fullScreenCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    padding: 10,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default ManageGalleryItemsScreen;