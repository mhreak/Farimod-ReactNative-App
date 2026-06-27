import React, { useState, useRef, useEffect } from 'react';
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
import { VideoView, useVideoPlayer } from 'expo-video';


interface ImageUploadProps {
  onImagesChange?: (images: ImageItem[]) => void;
  onImageChange?: (image: ImageItem | ImageItem[] | null) => void;
  maxImages?: number;
  imageQuality?: number;
  allowCamera?: boolean;
  allowGallery?: boolean;
  allowImages?: boolean;
  style?: any;
  error?: string;
  isMultiple?: boolean;
  initialImages?: ImageItem[];
  initialImage?: ImageItem | null;
  placeholder?: string;
  aspectRatio?: [number, number];
  allowEditing?: boolean;
  allowVideos?: boolean;
  onShowToast?: (message: string, type: 'success' | 'error' | 'warning') => void;
  loading?: boolean;
  imageResizeMode?: 'cover' | 'contain';
  allowFreeAspectRatio?: boolean;
  onPress?: () => void;
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
  allowImages = true,
  style,
  error,
  isMultiple = true,
  initialImages = [],
  initialImage = null,
  placeholder,
  aspectRatio = [16, 9],
  allowEditing = true,
  allowVideos = false,
  onShowToast,
  loading = false,
  imageResizeMode = 'contain',
  allowFreeAspectRatio = false,
  onPress,
}) => {
  const [images, setImages] = useState<ImageItem[]>(isMultiple ? initialImages : []);
  const [singleImage, setSingleImage] = useState<ImageItem | null>(isMultiple ? null : initialImage);
  const [isUploading, setIsUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageForView, setSelectedImageForView] = useState<ImageItem | null>(null);

  const normalizeImageItem = (image: any, fallbackId?: string): ImageItem | null => {
    if (!image || !image.uri) return null;

    return {
      id: image.id || fallbackId || `image_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      uri: image.uri,
      name: image.name || image.fileName || image.label || (image.uri?.toLowerCase().includes('.mp4') ? 'ویدئو' : 'تصویر'),
      type: image.type || image.mimeType || (image.uri?.toLowerCase().includes('.mp4') ? 'video/mp4' : 'image/jpeg'),
      size: image.size,
    };
  };

  // Animation refs
  const loadingRotation = useRef(new Animated.Value(0)).current;
  const modalSlideAnim = useRef(new Animated.Value(300)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;
  const deleteModalSlideAnim = useRef(new Animated.Value(0)).current;
  const deleteModalBackdropAnim = useRef(new Animated.Value(0)).current;
  const imageViewerScaleAnim = useRef(new Animated.Value(0)).current;
  const imageViewerOpacityAnim = useRef(new Animated.Value(0)).current;

  const insets = useSafeAreaInsets();

  const currentImages = isMultiple ?
    (images || []).filter(img => img && img.uri) :
    (singleImage && singleImage.uri ? [singleImage] : []);
  const canAddMore = isMultiple ? currentImages.length < maxImages : !singleImage;

  const isVideo = (uri: string) => {
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.m4v'];
    return videoExtensions.some(ext => uri.toLowerCase().includes(ext));
  };

  const showToastMessage = (message: string, type: 'success' | 'error' | 'warning' = 'error') => {
    if (onShowToast) {
      onShowToast(message, type);
    } else {
      console.log(`Toast ${type}: ${message}`);
    }
  };

  // Loading animation
  React.useEffect(() => {
    if (isUploading || loading) {
      Animated.loop(
        Animated.timing(loadingRotation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      loadingRotation.setValue(0);
    }
  }, [isUploading, loading]);

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

  useEffect(() => {
    if (isMultiple) {
      const normalizedInitialImages = (initialImages || [])
        .map((image, index) => normalizeImageItem(image, `initial-image-${index}`))
        .filter((image): image is ImageItem => Boolean(image));
      setImages(normalizedInitialImages);
    } else {
      setSingleImage(normalizeImageItem(initialImage, 'initial-single-image'));
    }
  }, [initialImage, initialImages, isMultiple]);

  React.useEffect(() => {
    if (imageViewerVisible) {
      Animated.parallel([
        Animated.spring(imageViewerScaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(imageViewerOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(imageViewerScaleAnim, {
          toValue: 0.7,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(imageViewerOpacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [imageViewerVisible]);

  const requestPermissions = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (libraryStatus !== 'granted') {
          showToastMessage('برای انتخاب فایل، مجوز دسترسی به گالری لازم است');
          return false;
        }

        if (allowCamera) {
          const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
          if (cameraStatus !== 'granted') {
            showToastMessage('برای ضبط ویدئو، مجوز دسترسی به دوربین لازم است');
            return false;
          }
        }
      }
      return true;
    } catch (error) {
      console.error('Permission request error:', error);
      showToastMessage('مشکل در درخواست مجوزها');
      return false;
    }
  };

  const showImageSourceOptions = () => {
    setModalVisible(true);
  };

  const updateImages = (newImages: ImageItem[]) => {
    const validImages = (newImages || []).filter(img => img && img.uri);

    if (isMultiple) {
      setImages(validImages);
      if (onImagesChange) {
        onImagesChange(validImages);
      }
      if (onImageChange) {
        onImageChange(validImages);
      }
    } else {
      const newImage = validImages.length > 0 ? validImages[0] : null;
      setSingleImage(newImage);
      if (onImageChange) {
        onImageChange(newImage);
      }
    }
  };

  const validateFileSize = (assets: any[]) => {
    const validAssets = assets.filter((asset) => {
      if (asset.fileSize) {
        let maxSize;
        if (asset.type?.includes('video')) {
          maxSize = 60 * 1024 * 1024; // 60MB for videos
        } else {
          maxSize = 5 * 1024 * 1024; // 5MB for images
        }

        if (asset.fileSize > maxSize) {
          const fileSizeInMB = (asset.fileSize / (1024 * 1024)).toFixed(1);
          const maxSizeInMB = asset.type?.includes('video') ? '۶۰' : '۵';
          showToastMessage(
            `حجم ${asset.type?.includes('video') ? 'ویدئو' : 'تصویر'} (${fileSizeInMB} مگابایت) نباید بیشتر از ${maxSizeInMB} مگابایت باشد`
          );
          return false;
        }
      }
      return true;
    });
    return validAssets;
  };

  const VideoThumbnail = ({ uri, style }: { uri: string; style?: any }) => {
    const player = useVideoPlayer(uri, (p) => {
      p.loop = false;
      p.pause();
    });
    return (
      <VideoView
        player={player}
        style={style}
        contentFit="cover"
        nativeControls={false}
      />
    );
  };

  const VideoPlayerView = ({ uri, style }: { uri: string; style?: any }) => {
    const player = useVideoPlayer(uri, (p) => {
      p.loop = false;
      p.play(); 
    });
    return (
      <VideoView
        player={player}
        style={style}
        contentFit="contain"
        nativeControls={true}   
        allowsFullscreen
      />
    );
  };
  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsUploading(true);
    try {
      let mediaTypes;
      if (allowVideos && allowImages) {
        mediaTypes = 'All';
      } else if (allowVideos && !allowImages) {
        mediaTypes = 'Videos';
      } else {
        mediaTypes = 'Images';
      }

      const shouldEnableEditing = !isMultiple && (allowEditing || allowFreeAspectRatio) && !allowVideos;
      const enableMultipleSelection = isMultiple && maxImages > 1 && !shouldEnableEditing;
      const selectionCount = isMultiple ? Math.max(1, Math.min(maxImages - currentImages.length, maxImages)) : 1;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaTypes,
        allowsEditing: shouldEnableEditing,
        aspect: (shouldEnableEditing && !allowFreeAspectRatio) ? aspectRatio : undefined,
        quality: imageQuality,
        allowsMultipleSelection: enableMultipleSelection,
        selectionLimit: selectionCount,
      });

      if (!result.canceled && result.assets) {
        const validAssets = validateFileSize(result.assets);
        if (validAssets.length === 0) {
          setIsUploading(false);
          return;
        }

        const newImages = validAssets.map((asset, index) => {
          if (!asset || !asset.uri) return null;

          let processedUri = asset.uri;
          if (Platform.OS === 'ios' && !asset.uri.startsWith('file://')) {
            processedUri = `file://${asset.uri}`;
          }

          const imageItem: ImageItem = {
            id: Date.now().toString() + index,
            uri: processedUri, 
            name: asset.fileName || `${asset.type?.includes('video') ? 'video' : 'image'}_${Date.now()}.${asset.type?.includes('video') ? 'mp4' : 'jpg'}`,
            type: asset.type || (allowVideos && !allowImages ? 'video/mp4' : 'image/jpeg'),
            size: asset.fileSize,
          };
          return imageItem;
        }).filter(item => item !== null);

        if (isMultiple && enableMultipleSelection) {
          const updatedImages = [...currentImages, ...newImages].slice(0, maxImages);
          updateImages(updatedImages);
        } else {
          updateImages(newImages);
        }
        setModalVisible(false);

        if (validAssets.length < result.assets.length) {
          showToastMessage('برخی فایل‌ها به دلیل حجم زیاد نادیده گرفته شدند', 'warning');
        }
      }
    } catch (error) {
      console.error('Gallery picker error:', error);
      showToastMessage('مشکلی در انتخاب فایل پیش آمد');
    } finally {
      setIsUploading(false);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsUploading(true);
    try {
      let mediaTypes;
      if (allowVideos && allowImages) {
        mediaTypes = 'All';
      } else if (allowVideos && !allowImages) {
        mediaTypes = 'Videos';
      } else {
        mediaTypes = 'Images';
      }

      const shouldEnableEditing = !isMultiple && (allowEditing || allowFreeAspectRatio) && !allowVideos;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: mediaTypes,
        allowsEditing: shouldEnableEditing,
        aspect: (shouldEnableEditing && !allowFreeAspectRatio) ? aspectRatio : undefined,
        quality: allowVideos && !allowImages ? 1.0 : imageQuality,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (!asset.uri) {
          showToastMessage('خطا در دریافت فایل از دوربین');
          setIsUploading(false);
          return;
        }

        const validAssets = validateFileSize(result.assets);
        if (validAssets.length === 0) {
          setIsUploading(false);
          return;
        }

        const validAsset = validAssets[0];

        let processedUri = validAsset.uri;
        if (Platform.OS === 'ios' && !validAsset.uri.startsWith('file://')) {
          processedUri = `file://${validAsset.uri}`;
        }

        const newImage: ImageItem = {
          id: Date.now().toString(),
          uri: processedUri, 
          name: validAsset.fileName || `${validAsset.type?.includes('video') ? 'captured_video' : 'captured_photo'}_${Date.now()}.${validAsset.type?.includes('video') ? 'mp4' : 'jpg'}`,
          type: validAsset.type || (allowVideos && !allowImages ? 'video/mp4' : 'image/jpeg'),
          size: validAsset.fileSize,
        };

        if (isMultiple) {
          const updatedImages = [...currentImages, newImage].slice(0, maxImages);
          updateImages(updatedImages);
        } else {
          updateImages([newImage]);
        }
        setModalVisible(false);
        showToastMessage(`${validAsset.type?.includes('video') ? 'ویدئو' : 'عکس'} با موفقیت ضبط شد`, 'success');
      }
    } catch (error) {
      console.error('Camera capture error:', error);
      if (error.message && (error.message.includes('User cancelled') || error.message.includes('cancelled'))) {
      } else if (error.message && error.message.includes('Camera permission')) {
        showToastMessage('مجوز دسترسی به دوربین لازم است');
      } else if (error.message && error.message.includes('not available')) {
        showToastMessage('دوربین در دسترس نیست');
      } else {
        showToastMessage('مشکلی در ضبط ویدئو پیش آمد: ' + (error.message || 'خطای نامشخص'));
      }
    } finally {
      setIsUploading(false);
    }
  };


  const isValidVideoFormat = (uri) => {
    const supportedFormats = ['.mp4', '.mov', '.m4v'];
    return supportedFormats.some(format =>
      uri.toLowerCase().includes(format)
    );
  };


  const removeImage = (imageId: string) => {
    setImageToDelete(imageId);
    setDeleteModalVisible(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalVisible(false);
    setImageToDelete(null);
  };

  const handleImagePress = (image: ImageItem) => {
    setSelectedImageForView(image);
    setImageViewerVisible(true);
  };

  const handleCloseImageViewer = () => {
    setImageViewerVisible(false);
    setTimeout(() => {
      setSelectedImageForView(null);
    }, 300);
  };

  const confirmRemoveImage = () => {
    if (imageToDelete) {
      if (isMultiple) {
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

    if (allowVideos && !allowImages) {
      return isMultiple ? 'ویدئوهای پست' : 'ویدئو';
    } else if (!allowVideos && allowImages) {
      return isMultiple ? 'تصاویر پست' : 'تصویر';
    } else {
      return isMultiple ? 'فایل‌های پست' : 'فایل';
    }
  };

  const getUploadText = () => {
    const fileType = allowVideos && !allowImages ? 'ویدئو' :
      !allowVideos && allowImages ? 'تصویر' :
        'فایل';

    if (isMultiple) {
      return canAddMore ?
        `برای افزودن ${fileType} کلیک کنید` :
        `حداکثر تعداد ${fileType} انتخاب شده`;
    }
    return singleImage ?
      `برای تغییر ${fileType} کلیک کنید` :
      `برای انتخاب ${fileType} کلیک کنید`;
  };

  const getImageContainerStyle = () => {
    if (!isMultiple && singleImage) {
      return [styles.singleImageContainer];
    }
    return [styles.imagesContainer];
  };

  const getImageItemStyle = () => {
    if (!isMultiple) {
      const [width, height] = aspectRatio;
      const ratio = height / width;
      const imageWidth = 250;
      const imageHeight = imageWidth * ratio;

      return [
        styles.imageWrapper,
        styles.singleImageWrapper,
        {
          width: imageWidth,
          height: imageHeight,
        }
      ];
    }
    return [styles.imageWrapper];
  };

  const getAspectRatioText = () => {
    if (allowFreeAspectRatio) return 'آزاد';
    const [width, height] = aspectRatio;
    return `${width}:${height}`;
  };

  const getUploadTypeText = () => {
    if (allowVideos && allowImages) {
      return isMultiple ? 'تکی و چندتایی' : 'تکی';
    } else if (allowVideos && !allowImages) {
      return isMultiple ? 'ویدئو (تکی و چندتایی)' : 'ویدئو (تکی)';
    } else if (!allowVideos && allowImages) {
      return isMultiple ? 'تصویر (تکی و چندتایی)' : 'تصویر (تکی)';
    }
    return isMultiple ? 'تکی و چندتایی' : 'تکی';
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons
            name={allowVideos ? "perm-media" : "photo-camera"}
            size={24}
            color={colors.primary}
          />
          <AppText style={styles.headerTitle}>{getDefaultPlaceholder()}</AppText>
          {!isMultiple && (allowEditing || allowFreeAspectRatio) && !allowVideos && (
            <View style={styles.aspectRatioBadge}>
              <AppText style={styles.aspectRatioText}>{getAspectRatioText()}</AppText>
            </View>
          )}
          <View style={styles.uploadTypeBadge}>
            <AppText style={styles.uploadTypeText}>{getUploadTypeText()}</AppText>
          </View>
        </View>
        {isMultiple && (
          <AppText style={styles.imageCounter}>
            {currentImages.length}/{maxImages}
          </AppText>
        )}
      </View>

      {canAddMore && (
        <TouchableOpacity
          style={[styles.uploadArea, (isUploading || loading) && styles.uploadingArea]}
          onPress={showImageSourceOptions}
          disabled={isUploading || loading}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['rgba(158, 34, 173, 0.1)', 'rgba(158, 34, 173, 0.05)']}
            style={styles.uploadGradient}
          >
            <View style={styles.uploadContent}>
              {(isUploading || loading) ? (
                <Animated.View
                  style={[
                    styles.loadingIcon,
                    {
                      transform: [
                        {
                          rotate: loadingRotation.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg'],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <MaterialIcons name="refresh" size={32} color={colors.primary} />
                </Animated.View>
              ) : (
                <>
                  <View style={styles.uploadIconContainer}>
                    <MaterialIcons
                      name={allowVideos ? "perm-media" : (isMultiple ? "add-photo-alternate" : "add-a-photo")}
                      size={40}
                      color={colors.primary}
                    />
                    <View style={styles.uploadIconRing} />
                    {allowEditing && !isMultiple && (
                      <View style={styles.cropIcon}>
                        <MaterialIcons name="edit" size={16} color={colors.primary} />
                      </View>
                    )}
                  </View>
                  <AppText style={styles.uploadText}>
                    {getUploadText()}
                  </AppText>
                </>
              )}
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {currentImages.length > 0 && (
        <View style={getImageContainerStyle()}>
          {isMultiple ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imagesContent}
              scrollEnabled={true}
              nestedScrollEnabled={Platform.OS === 'android'}
              style={styles.scrollViewStyle}
            >
              {currentImages.map((item, index) =>
                item ? (
                  <View key={item.id} style={styles.imageItem}>
                    <TouchableOpacity
                      onPress={() => {
                        if (item.uri && isVideo(item.uri) && onPress) {
                          onPress();        
                        } else {
                          handleImagePress(item);
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.imageWrapper}>
                        {item.uri && isVideo(item.uri) && isValidVideoFormat(item.uri) ? (
                          <View style={styles.videoContainer}>
                            <VideoThumbnail
                              uri={item.uri}        
                              style={styles.image}
                            />
                            <View style={styles.videoPlayIcon}>
                              <MaterialIcons name="play-arrow" size={24} color="white" />
                            </View>
                            <View style={styles.videoBadge}>
                              <MaterialIcons name="videocam" size={12} color="white" />
                              <AppText style={styles.videoBadgeText}>فیلم</AppText>
                            </View>
                          </View>
                        ) : item.uri ? (
                          <Image source={{ uri: item.uri }} style={styles.image} />
                        ) : (
                          <View style={styles.errorImageContainer}>
                            <MaterialIcons name="broken-image" size={40} color={colors.medium} />
                            <AppText style={styles.errorImageText}>خطا در بارگذاری</AppText>
                          </View>
                        )}
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeImage(item.id)}
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
                              {item?.name || (item.uri && isVideo(item.uri) ? 'فیلم' : 'تصویر')}
                            </AppText>
                            {item?.size && (
                              <AppText style={styles.imageSize}>
                                {formatFileSize(item.size)}
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
                    </TouchableOpacity>
                  </View>
                ) : null
              )}
            </ScrollView>
          ) : (
            <View style={styles.singleImageItem}>
              <TouchableOpacity
                onPress={() => {
                  if (singleImage && isVideo(singleImage.uri) && onPress) {
                    onPress();  
                  } else if (singleImage) {
                    handleImagePress(singleImage);
                  }
                }}
                activeOpacity={0.8}
              >
                <View style={getImageItemStyle()}>
                  {singleImage && singleImage.uri && isVideo(singleImage.uri) ? (
                    <View style={styles.videoContainer}>
                      <VideoThumbnail
                        uri={singleImage.uri}    
                        style={styles.image}
                      />
                      <View style={styles.videoPlayIcon}>
                        <MaterialIcons name="play-arrow" size={24} color="white" />
                      </View>
                      <View style={styles.videoBadge}>
                        <MaterialIcons name="videocam" size={12} color="white" />
                        <AppText style={styles.videoBadgeText}>فیلم</AppText>
                      </View>
                    </View>
                  ) : singleImage && singleImage.uri ? (
                    <Image source={{ uri: singleImage.uri }} style={styles.image} />
                  ) : (
                    <View style={styles.errorImageContainer}>
                      <MaterialIcons name="broken-image" size={40} color={colors.medium} />
                      <AppText style={styles.errorImageText}>خطا در بارگذاری</AppText>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => singleImage && removeImage(singleImage.id)}
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

                  {allowEditing && !isMultiple && (
                    <View style={styles.cropBadge}>
                      <AppText style={styles.cropBadgeText}>{getAspectRatioText()}</AppText>
                    </View>
                  )}

                  <View style={styles.imageInfo}>
                    <View style={styles.imageInfoContent}>
                      <AppText style={styles.imageName} numberOfLines={1}>
                        {singleImage?.name || (singleImage && singleImage.uri && isVideo(singleImage.uri) ? 'فیلم' : 'تصویر')}
                      </AppText>
                      {singleImage?.size && (
                        <AppText style={styles.imageSize}>
                          {formatFileSize(singleImage.size)}
                        </AppText>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
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
          • {isMultiple ? `حداکثر ${maxImages} فایل` : `یک فایل`}
          {!isMultiple && allowEditing && !allowVideos && ` • نسبت ابعاد: ${getAspectRatioText()}`}
          • فرمت‌های مجاز: {allowImages && allowVideos ? 'JPG, PNG, MP4, MOV' :
            allowVideos && !allowImages ? 'MP4, MOV' : 'JPG, PNG'}
          • حداکثر حجم: {allowVideos && !allowImages ? '۶۰ مگابایت' :
            !allowVideos && allowImages ? '۵ مگابایت' :
              'تصویر: ۵ مگابایت، ویدئو: ۶۰ مگابایت'}
          {allowVideos && ' • بدون محدودیت زمان'}
        </AppText>
      </View>

      {/* Modal for selecting image source */}
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
                {isMultiple ? 'انتخاب روش آپلود' : (singleImage ? `تغییر ${allowVideos ? 'فایل' : 'تصویر'}` : `انتخاب ${allowVideos ? 'فایل' : 'تصویر'}`)}
              </AppText>
              {!isMultiple && allowEditing && !allowVideos && (
                <AppText style={styles.modalSubtitle}>
                  تصویر با نسبت ابعاد {getAspectRatioText()} برش داده می‌شود
                </AppText>
              )}
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
                  <AppText style={styles.pickerDescription}>
                    {!isMultiple && allowEditing && !allowVideos ? 'انتخاب و ویرایش تصویر' : `انتخاب از ${allowVideos ? 'فایل‌های' : 'تصاویر'} موجود`}
                  </AppText>
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
                  <AppText style={styles.pickerDescription}>
                    {!isMultiple && allowEditing && !allowVideos ? 'عکس گرفتن و ویرایش' : `گرفتن ${allowVideos ? 'عکس/فیلم' : 'عکس'} جدید`}
                  </AppText>
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

      {/* Delete confirmation modal */}
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
              <AppText style={styles.deleteModalTitle}>حذف {selectedImageForView && selectedImageForView.uri && isVideo(selectedImageForView.uri) ? 'فیلم' : 'تصویر'}</AppText>
              <AppText style={styles.deleteModalMessage}>
                آیا از حذف این {selectedImageForView && selectedImageForView.uri && isVideo(selectedImageForView.uri) ? 'فیلم' : 'تصویر'} اطمینان دارید؟{'\n'}
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

      {/* Image viewer modal */}
      <Modal
        visible={imageViewerVisible}
        transparent={true}
        animationType="none"
        onRequestClose={handleCloseImageViewer}
        statusBarTranslucent={true}
      >
        <View style={styles.imageViewerContainer}>
          <Animated.View
            style={[
              styles.imageViewerBackdrop,
              {
                opacity: imageViewerOpacityAnim,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.imageViewerBackdropTouchable}
              onPress={handleCloseImageViewer}
              activeOpacity={1}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.imageViewerContent,
              {
                opacity: imageViewerOpacityAnim,
                transform: [{ scale: imageViewerScaleAnim }],
              },
            ]}
          >
            {selectedImageForView && (
              <>
                <View style={styles.imageViewerHeader}>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleCloseImageViewer}
                    activeOpacity={0.7}
                  >
                    <View style={styles.closeButtonContainer}>
                      <MaterialIcons name="close" size={24} color="#ffffff" />
                    </View>
                  </TouchableOpacity>

                  <View style={styles.imageViewerInfo}>
                    <AppText style={styles.imageViewerTitle} numberOfLines={1}>
                      {selectedImageForView?.name || (selectedImageForView && selectedImageForView.uri && isVideo(selectedImageForView.uri) ? 'فیلم' : 'تصویر')}
                    </AppText>
                    {selectedImageForView?.size && (
                      <AppText style={styles.imageViewerSize}>
                        {formatFileSize(selectedImageForView.size)}
                      </AppText>
                    )}
                  </View>
                </View>

                <View style={styles.imageContainer}>
                  {selectedImageForView.uri && isVideo(selectedImageForView.uri) ? (
                    <VideoPlayerView                        // ✅ تغییر اینجا
                      uri={selectedImageForView.uri}
                      style={styles.fullScreenImage}
                    />
                  ) : selectedImageForView.uri ? (
                    <Image
                      source={{ uri: selectedImageForView.uri }}
                      style={styles.fullScreenImage}
                      resizeMode="contain"
                    />
                  ) : null}
                </View>

                <View style={styles.imageViewerFooter}>
                  <View style={styles.imageActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => {
                        handleCloseImageViewer();
                        setTimeout(() => {
                          if (selectedImageForView) {
                            removeImage(selectedImageForView.id);
                          }
                        }, 300);
                      }}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={['#ff4757', '#ff3742']}
                        style={styles.actionButtonGradient}
                      >
                        <MaterialIcons name="delete" size={20} color="white" />
                      </LinearGradient>
                      <AppText style={styles.actionButtonText}>حذف</AppText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => {
                        handleCloseImageViewer();
                        setTimeout(() => {
                          showImageSourceOptions();
                        }, 300);
                      }}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={[colors.primary, colors.primaryDark || colors.primary]}
                        style={styles.actionButtonGradient}
                      >
                        <MaterialIcons name="edit" size={20} color="white" />
                      </LinearGradient>
                      <AppText style={styles.actionButtonText}>ویرایش</AppText>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
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
    flex: 1,
    flexWrap: 'wrap',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Yekan_Bakh_Bold',
    color: colors.primary,
    marginRight: 8,
  },
  aspectRatioBadge: {
    backgroundColor: 'rgba(158, 34, 173, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  aspectRatioText: {
    fontSize: 12,
    fontFamily: 'Yekan_Bakh_Bold',
    color: colors.primary,
  },
  uploadTypeBadge: {
    backgroundColor: 'rgba(34, 139, 173, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  uploadTypeText: {
    fontSize: 10,
    fontFamily: 'Yekan_Bakh_Regular',
    color: '#228BAD',
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
    backgroundColor: 'transparent',
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
  cropIcon: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 2,
  },
  uploadText: {
    fontSize: 16,
    fontFamily: 'Yekan_Bakh_Bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 5,
  },
  loadingIcon: {
    marginBottom: 15,
  },
  videoContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  videoPlayIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoBadge: {
    position: 'absolute',
    top: 8,
    left: 40,
    backgroundColor: 'rgba(220, 38, 127, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  videoBadgeText: {
    fontSize: 9,
    fontFamily: 'Yekan_Bakh_Bold',
    color: 'white',
    marginRight: 2,
  },
  imagesContainer: {
    marginBottom: 15,
  },
  scrollViewStyle: {
    height: 140,
  },
  singleImageContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  imagesContent: {
    paddingHorizontal: 5,
    paddingVertical: 10,
    gap: 15,
  },
  imageItem: {
    marginHorizontal: 0,
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
    backgroundColor: 'transparent',
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
    borderRadius: 20,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  errorImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  errorImageText: {
    fontSize: 10,
    fontFamily: 'Yekan_Bakh_Regular',
    color: colors.medium,
    marginTop: 5,
    textAlign: 'center',
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
  cropBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(158, 34, 173, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  cropBadgeText: {
    fontSize: 10,
    fontFamily: 'Yekan_Bakh_Bold',
    color: 'white',
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
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#6B7280",
    textAlign: 'center',
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
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  deleteModalMessage: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
  deleteModalActions: {
    paddingTop: 10,
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
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
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
  imageViewerContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  imageViewerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  imageViewerBackdropTouchable: {
    flex: 1,
  },
  imageViewerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  imageViewerHeader: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerInfo: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 15,
  },
  imageViewerTitle: {
    fontSize: 16,
    fontFamily: 'Yekan_Bakh_Bold',
    color: '#ffffff',
    textAlign: 'right',
    marginBottom: 4,
  },
  imageViewerSize: {
    fontSize: 12,
    fontFamily: 'Yekan_Bakh_Regular',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
  },
  imageViewerFooter: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  imageActions: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: 'Yekan_Bakh_Bold',
    color: '#ffffff',
    textAlign: 'center',
  },
});

export default ImageUpload;