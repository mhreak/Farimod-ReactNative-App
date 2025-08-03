import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
  Alert,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from './Text';
import colors from '../config/colors';

interface ImageUploadProps {
  onImagesChange?: (images: ImageItem[]) => void;
  onImageChange?: (image: ImageItem | null) => void;
  maxImages?: number;
  imageQuality?: number;
  allowCamera?: boolean;
  allowGallery?: boolean;
  style?: any;
  error?: string;
  multiple?: boolean;
  initialImages?: ImageItem[];
  initialImage?: ImageItem | null;
  placeholder?: string;
  aspectRatio?: [number, number];
}

interface ImageItem {
  id: string;
  uri: string;
  name?: string;
  type?: string;
  size?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesChange,
  onImageChange,
  maxImages = 5,
  imageQuality = 0.8,
  allowCamera = true,
  allowGallery = true,
  style,
  error,
  multiple = true,
  initialImages = [],
  initialImage = null,
  placeholder,
  aspectRatio = [16, 9],
}) => {
  const [images, setImages] = useState<ImageItem[]>(multiple ? initialImages : []);
  const [singleImage, setSingleImage] = useState<ImageItem | null>(multiple ? null : initialImage);
  const [isUploading, setIsUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const modalSlideAnim = useRef(new Animated.Value(300)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;
  const deleteModalSlideAnim = useRef(new Animated.Value(0)).current;
  const deleteModalBackdropAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const currentImages = multiple ? images : (singleImage ? [singleImage] : []);
  const canAddMore = multiple ? currentImages.length < maxImages : !singleImage;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  React.useEffect(() => {
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

  React.useEffect(() => {
    if (deleteModalVisible) {
      Animated.parallel([
        Animated.timing(deleteModalSlideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(deleteModalBackdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(deleteModalSlideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(deleteModalBackdropAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [deleteModalVisible]);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('خطا', 'برای انتخاب تصویر، مجوز دسترسی به گالری لازم است');
        return false;
      }

      if (allowCamera) {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus !== 'granted') {
          Alert.alert('خطا', 'برای گرفتن عکس، مجوز دسترسی به دوربین لازم است');
          return false;
        }
      }
    }
    return true;
  };

  const showImageSourceOptions = () => {
    setModalVisible(true);
  };

  const updateImages = (newImages: ImageItem[]) => {
    if (multiple) {
      setImages(newImages);
      onImagesChange?.(newImages);
    } else {
      const newImage = newImages.length > 0 ? newImages[0] : null;
      setSingleImage(newImage);
      onImageChange?.(newImage);
    }
  };

  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsUploading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: aspectRatio,
        quality: imageQuality,
        allowsMultipleSelection: multiple && maxImages > 1,
        selectionLimit: multiple ? maxImages - currentImages.length : 1,
      });

      if (!result.canceled) {
        const newImages = result.assets.map((asset, index) => ({
          id: Date.now().toString() + index,
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
          size: asset.fileSize,
        }));

        if (multiple) {
          const updatedImages = [...currentImages, ...newImages].slice(0, maxImages);
          updateImages(updatedImages);
        } else {
          updateImages(newImages);
        }
        setModalVisible(false);
      }
    } catch (error) {
      Alert.alert('خطا', 'مشکلی در انتخاب تصویر پیش آمد');
    } finally {
      setIsUploading(false);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsUploading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: aspectRatio,
        quality: imageQuality,
      });

      if (!result.canceled) {
        const newImage: ImageItem = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
          name: result.assets[0].fileName || `photo_${Date.now()}.jpg`,
          type: result.assets[0].type || 'image/jpeg',
          size: result.assets[0].fileSize,
        };

        if (multiple) {
          const updatedImages = [...currentImages, newImage].slice(0, maxImages);
          updateImages(updatedImages);
        } else {
          updateImages([newImage]);
        }
        setModalVisible(false);
      }
    } catch (error) {
      Alert.alert('خطا', 'مشکلی در گرفتن عکس پیش آمد');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (imageId: string) => {
    setImageToDelete(imageId);
    setDeleteModalVisible(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalVisible(false);
    setImageToDelete(null);
  };

  const confirmRemoveImage = () => {
    if (imageToDelete) {
      if (multiple) {
        const updatedImages = currentImages.filter(img => img.id !== imageToDelete);
        updateImages(updatedImages);
      } else {
        updateImages([]);
      }
    }
    handleCloseDeleteModal();
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(1)} کیلوبایت`;
    }
    const mb = kb / 1024;
    return `${mb.toFixed(1)} مگابایت`;
  };

  const getDefaultPlaceholder = () => {
    if (placeholder) return placeholder;
    return multiple ? 'تصاویر پست' : 'تصویر';
  };

  const getUploadText = () => {
    if (multiple) {
      return canAddMore ? 'برای افزودن تصویر کلیک کنید' : 'حداکثر تعداد تصویر انتخاب شده';
    }
    return singleImage ? 'برای تغییر تصویر کلیک کنید' : 'برای انتخاب تصویر کلیک کنید';
  };

  const getImageContainerStyle = () => {
    if (!multiple && singleImage) {
      return [styles.singleImageContainer];
    }
    return [styles.imagesContainer];
  };

  const getImageItemStyle = () => {
    if (!multiple) {
      return [styles.imageWrapper, styles.singleImageWrapper];
    }
    return [styles.imageWrapper];
  };

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="photo-camera" size={24} color={colors.primary} />
          <AppText style={styles.headerTitle}>{getDefaultPlaceholder()}</AppText>
        </View>
        {multiple && (
          <AppText style={styles.imageCounter}>
            {currentImages.length}/{maxImages}
          </AppText>
        )}
      </View>

      {canAddMore && (
        <TouchableOpacity
          style={[styles.uploadArea, isUploading && styles.uploadingArea]}
          onPress={showImageSourceOptions}
          disabled={isUploading}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['rgba(158, 34, 173, 0.1)', 'rgba(158, 34, 173, 0.05)']}
            style={styles.uploadGradient}
          >
            <View style={styles.uploadContent}>
              {isUploading ? (
                <>
                  <View style={styles.loadingContainer}>
                    <Animated.View style={[styles.loadingDot, { opacity: fadeAnim }]} />
                    <Animated.View style={[styles.loadingDot, { opacity: fadeAnim }]} />
                    <Animated.View style={[styles.loadingDot, { opacity: fadeAnim }]} />
                  </View>
                  <AppText style={styles.uploadText}>در حال آپلود...</AppText>
                </>
              ) : (
                <>
                  <View style={styles.uploadIconContainer}>
                    <MaterialIcons
                      name={multiple ? "add-photo-alternate" : "add-a-photo"}
                      size={40}
                      color={colors.primary}
                    />
                    <View style={styles.uploadIconRing} />
                  </View>
                  <AppText style={styles.uploadText}>
                    {getUploadText()}
                  </AppText>
                  <AppText style={styles.uploadSubtext}>
                    یا عکس بگیرید
                  </AppText>
                </>
              )}
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {currentImages.length > 0 && (
        <View style={getImageContainerStyle()}>
          {multiple ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imagesContent}
            >
              {currentImages.map((image, index) => (
                <View key={image.id} style={styles.imageItem}>
                  <View style={getImageItemStyle()}>
                    <Image source={{ uri: image.uri }} style={styles.image} />

                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeImage(image.id)}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={['#ff4757', '#ff3742']}
                        style={styles.removeButtonGradient}
                      >
                        <MaterialIcons name="close" size={16} color="white" />
                      </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.imageInfo}>
                      <View style={styles.imageInfoContent}>
                        <AppText style={styles.imageName} numberOfLines={1}>
                          {image.name || 'تصویر'}
                        </AppText>
                        {image.size && (
                          <AppText style={styles.imageSize}>
                            {formatFileSize(image.size)}
                          </AppText>
                        )}
                      </View>
                    </View>

                    <View style={styles.imageBadge}>
                      <AppText style={styles.imageBadgeText}>
                        {index + 1}
                      </AppText>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.singleImageItem}>
              <View style={getImageItemStyle()}>
                <Image source={{ uri: singleImage!.uri }} style={styles.image} />

                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(singleImage!.id)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['#ff4757', '#ff3742']}
                    style={styles.removeButtonGradient}
                  >
                    <MaterialIcons name="close" size={16} color="white" />
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.editButton}
                  onPress={showImageSourceOptions}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark || colors.primary]}
                    style={styles.editButtonGradient}
                  >
                    <MaterialIcons name="edit" size={16} color="white" />
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.imageInfo}>
                  <View style={styles.imageInfoContent}>
                    <AppText style={styles.imageName} numberOfLines={1}>
                      {singleImage!.name || 'تصویر'}
                    </AppText>
                    {singleImage!.size && (
                      <AppText style={styles.imageSize}>
                        {formatFileSize(singleImage!.size)}
                      </AppText>
                    )}
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={16} color={colors.danger} />
          <AppText style={styles.errorText}>{error}</AppText>
        </View>
      )}

      <View style={styles.guidelines}>
        <AppText style={styles.guidelinesText}>
          • {multiple ? `حداکثر ${maxImages} تصویر` : 'یک تصویر'} • فرمت‌های مجاز: JPG, PNG • حداکثر حجم: ۵ مگابایت
        </AppText>
      </View>

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
              <AppText style={styles.modalTitle}>
                {multiple ? 'انتخاب روش آپلود' : (singleImage ? 'تغییر تصویر' : 'انتخاب تصویر')}
              </AppText>
            </View>

            <View style={styles.imagePickerContainer}>
              {allowGallery && (
                <TouchableOpacity
                  style={styles.pickerOption}
                  onPress={pickImageFromGallery}
                  activeOpacity={0.8}
                >
                  <View style={[styles.pickerIcon, { backgroundColor: colors.primary }]}>
                    <MaterialIcons name="photo-library" size={32} color="white" />
                  </View>
                  <AppText style={styles.pickerLabel}>گالری</AppText>
                  <AppText style={styles.pickerDescription}>انتخاب از تصاویر موجود</AppText>
                </TouchableOpacity>
              )}

              {allowCamera && (
                <TouchableOpacity
                  style={styles.pickerOption}
                  onPress={takePhoto}
                  activeOpacity={0.8}
                >
                  <View style={[styles.pickerIcon, { backgroundColor: '#10B981' }]}>
                    <MaterialIcons name="camera-alt" size={32} color="white" />
                  </View>
                  <AppText style={styles.pickerLabel}>دوربین</AppText>
                  <AppText style={styles.pickerDescription}>گرفتن عکس جدید</AppText>
                </TouchableOpacity>
              )}
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

      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={handleCloseDeleteModal}
      >
        <View style={styles.deleteModalContainer}>
          <Animated.View
            style={[
              styles.deleteModalBackdrop,
              {
                opacity: deleteModalBackdropAnim,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.deleteBackdropTouchable}
              onPress={handleCloseDeleteModal}
              activeOpacity={1}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.deleteModalContent,
              {
                transform: [
                  {
                    translateY: deleteModalSlideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.deleteModalHandle} />

            <View style={styles.deleteModalHeader}>
              <View style={styles.deleteWarningIcon}>
                <MaterialIcons name="delete" size={32} color="#ffffff" />
              </View>
              <AppText style={styles.deleteModalTitle}>حذف تصویر</AppText>
              <AppText style={styles.deleteModalMessage}>
                آیا از حذف این تصویر اطمینان دارید؟{'\n'}
                این عمل قابل بازگشت نیست.
              </AppText>
            </View>

            <View style={styles.deleteModalActions}>
              <View style={styles.deleteButtonsRow}>
                <TouchableOpacity
                  style={styles.deleteModalCancelButton}
                  onPress={handleCloseDeleteModal}
                >
                  <AppText style={styles.deleteModalCancelText}>لغو</AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmDeleteButton}
                  onPress={confirmRemoveImage}
                >
                  <LinearGradient
                    colors={['#e74c3c', '#c0392b']}
                    style={styles.confirmDeleteGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <MaterialIcons name="delete-forever" size={20} color="#ffffff" />
                    <AppText style={styles.confirmDeleteText}>
                      بله، حذف کن
                    </AppText>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.deleteModalSafeArea, { height: insets.bottom }]} />
          </Animated.View>
        </View>
      </Modal>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  headerLeft: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Yekan_Bakh_Bold',
    color: colors.primary,
    marginRight: 8,
  },
  imageCounter: {
    fontSize: 14,
    fontFamily: 'Yekan_Bakh_Regular',
    color: colors.medium,
    backgroundColor: 'rgba(158, 34, 173, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  uploadArea: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(158, 34, 173, 0.2)',
    borderStyle: 'dashed',
  },
  uploadingArea: {
    opacity: 0.7,
  },
  uploadGradient: {
    padding: 30,
  },
  uploadContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIconContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  uploadIconRing: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(158, 34, 173, 0.2)',
    borderStyle: 'dashed',
  },
  uploadText: {
    fontSize: 16,
    fontFamily: 'Yekan_Bakh_Bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 5,
  },
  uploadSubtext: {
    fontSize: 14,
    fontFamily: 'Yekan_Bakh_Regular',
    color: colors.medium,
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    gap: 5,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  imagesContainer: {
    marginBottom: 15,
  },
  singleImageContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  imagesContent: {
    paddingHorizontal: 5,
    gap: 15,
  },
  imageItem: {
    marginRight: 15,
  },
  singleImageItem: {
    alignItems: 'center',
  },
  imageWrapper: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  singleImageWrapper: {
    width: 200,
    height: 200,
    borderRadius: 20,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  removeButtonGradient: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  editButtonGradient: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
  },
  imageInfoContent: {
    alignItems: 'center',
  },
  imageName: {
    fontSize: 10,
    fontFamily: 'Yekan_Bakh_Bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 2,
  },
  imageSize: {
    fontSize: 8,
    fontFamily: 'Yekan_Bakh_Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  imageBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageBadgeText: {
    fontSize: 10,
    fontFamily: 'Yekan_Bakh_Bold',
    color: 'white',
  },
  errorContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Yekan_Bakh_Regular',
    color: colors.danger,
    marginRight: 5,
    flex: 1,
  },
  guidelines: {
    backgroundColor: 'rgba(158, 34, 173, 0.05)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(158, 34, 173, 0.1)',
  },
  guidelinesText: {
    fontSize: 11,
    fontFamily: 'Yekan_Bakh_Regular',
    color: colors.medium,
    textAlign: 'center',
    lineHeight: 16,
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
    fontFamily: "Yekan_Bakh_ExtraBold",
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
    shadowOffset: {
      width: 0,
      height: 3,
    },
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
  deleteModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  deleteModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  deleteBackdropTouchable: {
    flex: 1,
  },
  deleteModalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 15,
    paddingBottom: 20,
    paddingHorizontal: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  deleteModalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  deleteModalHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  deleteWarningIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#e74c3c',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    marginBottom: 15,
  },
  deleteModalMessage: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#6c757d",
    textAlign: 'center',
    lineHeight: 24,
  },
  deleteModalActions: {
    marginTop: 10,
  },
  deleteButtonsRow: {
    flexDirection: 'row-reverse',
    gap: 15,
  },
  confirmDeleteButton: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#e74c3c',
    shadowOffset: {
      width: 0,
      height: 4,
    },
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
  },
  confirmDeleteText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#ffffff',
  },
  deleteModalCancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  deleteModalCancelText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#6c757d',
  },
  deleteModalSafeArea: {
    backgroundColor: '#ffffff',
    marginHorizontal: -25,
  },
});

export default ImageUpload;