import React, { useState, useEffect, useRef, useCallback } from "react";
import AppText from "../components/Text";
import ImageInput from "../components/ImageInput";
import { Image, View, StyleSheet, TouchableOpacity, StatusBar, Animated, Modal, Pressable, ScrollView, RefreshControl } from "react-native";
import ImageInputList from "../components/ImageInputList";
import FormImagePicker from "../components/forms/FormImagePicker";
import MainBackground from "../components/MainBackground";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RatingComponent, { StarDisplay } from "../components/RatingComponent";
import Toast from "../components/Toast";
import appConfig from "../config/config";
import { toPersianDigits } from "../utils/converters";

const CURRENT_MEMBER_ID = 2;

const modernColors = {
  primary: "#667eea",
  primaryDark: "#764ba2",
  primaryLight: "#f0f4ff",
  secondary: "#ff6b6b",
  tertiary: "#4ecdc4",
  accent: "#45b7d1",
  surface: "#ffffff",
  dark: "#2c3e50",
  medium: "#34495e",
  light: "#ecf0f1",
  success: "#2ecc71",
  warning: "#f39c12",
  error: "#e74c3c",
  info: "#3498db",
  gradientStart: "#667eea",
  gradientEnd: "#764ba2",
  schoolIcon: "#2ecc71",
  fashionGold: "#ffd700",
};

const transformContentReviewToRatingOptions = (contentReviewList) => {
  if (!contentReviewList || contentReviewList.length === 0) {
    return [
      {
        id: 'content',
        title: 'کیفیت تصاویر',
        subtitle: 'کیفیت و زیبایی تصاویر'
      },
      {
        id: 'creativity',
        title: 'خلاقیت',
        subtitle: 'میزان خلاقیت و ابتکار'
      },
      {
        id: 'composition',
        title: 'ترکیب‌بندی',
        subtitle: 'کیفیت ترکیب‌بندی تصاویر'
      },
      {
        id: 'overall',
        title: 'کیفیت کلی',
        subtitle: 'ارزیابی کلی گالری'
      }
    ];
  }

  return contentReviewList
    .filter(item => item.Active)
    .sort((a, b) => a.ShowOrder - b.ShowOrder)
    .map(item => ({
      id: `review_${item.ContentReviewItemId}`,
      title: item.Text,
      subtitle: '',
      contentReviewItemId: item.ContentReviewItemId,
      showOrder: item.ShowOrder,
      averageRating: item.CalculatedAverageRating || 0
    }));
};

const useGalleryDetail = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGallery = async (galleryId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${appConfig.mobileApi}ImageGallery/Get?id=${galleryId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      const transformedData = {
        ...result.ImageGallery,
        ContentReviewItemList: result.ContentReviewItemList || [],
        IsMemberLiked: result.IsMemberLiked || false,
        UserRating: 0,
        UserDetailedRatings: {},
        RatingCount: 0
      };

      setData(transformedData);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    fetchGallery,
    setData,
  };
};

const GalleryItemScreen = () => {
  const [imageUri, setImageUri] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [fullScreenImageUri, setFullScreenImageUri] = useState(null);
  const [fullScreenModalVisible, setFullScreenModalVisible] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const { galleryId, title } = route.params || {};
  const galleryTitle = title || "گالری";

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const modalSlideAnim = useRef(new Animated.Value(300)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;
  const reviewModalSlideAnim = useRef(new Animated.Value(0)).current;
  const reviewModalBackdropAnim = useRef(new Animated.Value(0)).current;

  const { data: galleryData, loading, error, fetchGallery, setData } = useGalleryDetail();

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');
  const [refreshing, setRefreshing] = useState(false);

  const [userDetailedRatings, setUserDetailedRatings] = useState({});
  const [dynamicRatingOptions, setDynamicRatingOptions] = useState([]);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const likeAnim = useRef(new Animated.Value(1)).current;

  // Check if this is user's own gallery
  const isOwnGallery = galleryData && galleryData.MemberId === CURRENT_MEMBER_ID;

  useFocusEffect(
    useCallback(() => {
      if (galleryId) {
        fetchGallery(galleryId);
      }
    }, [galleryId])
  );

  useEffect(() => {
    if (galleryData) {
      setLikeCount(galleryData.LikeCount || 0);
      setIsLiked(galleryData.IsMemberLiked || false);

      const ratingOptions = transformContentReviewToRatingOptions(galleryData.ContentReviewItemList);
      setDynamicRatingOptions(ratingOptions);

      // Set existing images from API
      if (galleryData.ImageGalleryItemList) {
        const existingImages = galleryData.ImageGalleryItemList.map(item => item.ImageURL);
        setImageUri(existingImages);
      }
    }
  }, [galleryData]);

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
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();
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

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const showToast = (message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (galleryId) {
      await fetchGallery(galleryId);
    }
    setRefreshing(false);
  };

  const selectImageSource = () => {
    setModalVisible(true);
  };

  const selectFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('متأسفانه، برای این عملیات نیاز به دسترسی گالری داریم!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImageUri(prev => [...prev, result.assets[0].uri]);
        setModalVisible(false);
      }
    } catch (error) {
      console.log('خطا در انتخاب عکس از گالری:', error);
    }
  };

  const selectFromCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('متأسفانه، برای این عملیات نیاز به دسترسی دوربین داریم!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImageUri(prev => [...prev, result.assets[0].uri]);
        setModalVisible(false);
      }
    } catch (error) {
      console.log('خطا در گرفتن عکس:', error);
    }
  };

  const handleImagePress = (uri) => {
    setFullScreenImageUri(uri);
    setFullScreenModalVisible(true);
  };

  const handleShowReviewModal = () => {
    setShowReviewModal(true);
    Animated.parallel([
      Animated.timing(reviewModalBackdropAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(reviewModalSlideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCloseReviewModal = () => {
    Animated.parallel([
      Animated.timing(reviewModalBackdropAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(reviewModalSlideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowReviewModal(false);
    });
  };

  const handleLike = async () => {
    if (isLiking || !galleryData) return;

    setIsLiking(true);

    const newIsLiked = !isLiked;
    const countChange = newIsLiked ? 1 : -1;
    const newLikeCount = likeCount + countChange;

    setIsLiked(newIsLiked);
    setLikeCount(newLikeCount);

    Animated.sequence([
      Animated.timing(likeAnim, {
        toValue: 0.6,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(likeAnim, {
        toValue: 1.3,
        tension: 200,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.spring(likeAnim, {
        toValue: 1,
        tension: 200,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const response = await fetch(
        `${appConfig.mobileApi}ImageGallery/AddToLike?id=${galleryData.ImageGalleryId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Like API Response:', result);

    } catch (error) {
      console.error('Like API Error:', error);
      setIsLiked(isLiked);
      setLikeCount(likeCount);
      showToast('خطا در ثبت لایک', 'error');
    } finally {
      setIsLiking(false);
    }
  };

  const handleRatingChange = (newRating, detailedRatings = null) => {
    if (galleryData) {
      const updatedGalleryData = {
        ...galleryData,
        UserRating: newRating
      };

      if (detailedRatings) {
        updatedGalleryData.UserDetailedRatings = detailedRatings;
        setUserDetailedRatings(detailedRatings);
      }

      setData(updatedGalleryData);
    }

    if (detailedRatings) {
      const ratingTexts = Object.entries(detailedRatings).map(([key, value]) => {
        const option = dynamicRatingOptions.find(opt => opt.id === key);
        return `${option?.title}: ${toPersianDigits(value.toString())}`;
      }).join('، ');

      showToast(`امتیازها ثبت شد - ${ratingTexts}`, 'success');
    } else {
      showToast(`امتیاز ${toPersianDigits(newRating.toString())} ستاره ثبت شد`, 'success');
    }
  };

  const handleRatingSubmit = async (rating, detailedRatings = null) => {
    try {
      console.log('Submitting rating:', rating);
      if (detailedRatings) {
        console.log('Detailed ratings:', detailedRatings);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      if (detailedRatings) {
        const totalCategories = Object.keys(detailedRatings).length;
        showToast(`امتیاز شما در ${toPersianDigits(totalCategories.toString())} بخش با موفقیت ثبت شد`, 'success');
      } else {
        showToast('امتیاز شما با موفقیت ثبت شد', 'success');
      }
    } catch (error) {
      showToast('خطا در ثبت امتیاز', 'error');
    }
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

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.backButtonContainer}>
            <MaterialIcons
              name="arrow-forward"
              size={26}
              color="#6366f1"
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
          <View style={styles.headerRow}>
            {isOwnGallery ? (
              <TouchableOpacity style={styles.addIconHeader} onPress={selectImageSource}>
                <LinearGradient
                  colors={['#4CAF50', '#45A049']}
                  style={styles.addIconGradient}
                >
                  <MaterialIcons name="add-a-photo" size={26} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View></View>
            )}

            <View style={styles.titleWrapper}>
              <AppText style={styles.headerTitle}>{galleryTitle}</AppText>
              <View style={styles.sparkleContainer}>
                <Animated.View style={[{ transform: [{ rotate: spin }] }]}>
                  <MaterialIcons
                    name="star-half"
                    size={16}
                    color="#FFD700"
                    style={styles.sparkle1}
                  />
                </Animated.View>
                <Animated.View style={[{ transform: [{ rotate: spin }] }]}>
                  <MaterialIcons
                    name="diamond"
                    size={12}
                    color="#FF6B6B"
                    style={styles.sparkle2}
                  />
                </Animated.View>
              </View>
            </View>
          </View>
        </Animated.View>

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
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <ImageInputList
              imageUris={imageUri}
              onAddImage={(uri) => setImageUri((prev) => [...prev, uri])}
              onRemoveImage={(uri) =>
                setImageUri(imageUri.filter((image) => image !== uri))
              }
              onImagePress={handleImagePress}
              isReadOnly={!isOwnGallery}
            />

            {!isOwnGallery && galleryData && (
              <View style={styles.galleryInfoSection}>
                <View style={styles.galleryMetaContainer}>
                  <View style={styles.likeSection}>
                    <View>
                      <TouchableOpacity
                        style={[
                          styles.likeButton,
                          { backgroundColor: isLiked ? modernColors.secondary : '#f0f0f0' }
                        ]}
                        onPress={handleLike}
                        disabled={isLiking}
                        activeOpacity={0.7}
                      >
                        <MaterialIcons
                          name={isLiked ? "favorite" : "favorite-border"}
                          size={24}
                          color={isLiked ? "#ffffff" : modernColors.secondary}
                        />
                        <AppText style={[
                          styles.likeCount,
                          { color: isLiked ? "#ffffff" : modernColors.secondary }
                        ]}>
                          {toPersianDigits(likeCount.toString())}
                        </AppText>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.galleryStats}>
                    <View style={styles.statItem}>
                      <MaterialIcons name="photo" size={20} color={modernColors.info} />
                      <AppText style={styles.statText}>
                        {toPersianDigits(galleryData.ImageCount?.toString() || '0')} تصویر
                      </AppText>
                    </View>
                    <View style={styles.statItem}>
                      <MaterialIcons name="calendar-month" size={20} color={modernColors.info} />
                      <AppText style={styles.statText}>
                        {toPersianDigits(galleryData.ShamsiInsertDate || '')}
                      </AppText>
                    </View>
                  </View>
                </View>

                <View style={styles.ratingSection}>
                  <RatingComponent
                    initialRating={galleryData.UserRating || 0}
                    averageRating={galleryData.Rating || 0}
                    ratingCount={galleryData.RatingCount || 0}
                    onRatingChange={handleRatingChange}
                    onSubmit={handleRatingSubmit}
                    maxStars={5}
                    size={24}
                    showRatingText={true}
                    showRatingCount={true}
                    animated={true}
                    allowHalfStars={false}
                    starColor={modernColors.fashionGold}
                    style={styles.ratingComponent}
                    enableMultipleOptions={true}
                    ratingOptions={dynamicRatingOptions}
                    modalTitle="امتیاز دهی گالری"
                    submitButtonText="ثبت امتیاز"
                    cancelButtonText="لغو"
                  />

                  {dynamicRatingOptions.length > 0 && dynamicRatingOptions.some(option => option.averageRating && option.averageRating > 0) && (
                    <View style={styles.detailedRatingsContainer}>
                      <AppText style={styles.detailedRatingsTitle}>میانگین امتیاز در هر بخش:</AppText>
                      {dynamicRatingOptions
                        .filter(option => option.averageRating && option.averageRating > 0)
                        .map((option) => (
                          <View key={option.id} style={styles.detailedRatingRow}>
                            <View style={styles.ratingRowContent}>
                              <View style={styles.ratingRowText}>
                                <AppText style={styles.ratingRowTitle}>{option.title}</AppText>
                              </View>

                              <View style={styles.ratingRowStars}>
                                <StarDisplay
                                  rating={option.averageRating}
                                  maxStars={5}
                                  size={16}
                                  color={modernColors.fashionGold}
                                  emptyColor="#e0e0e0"
                                  showHalfStars={true}
                                  animated={false}
                                />
                               
                              </View>
                            </View>
                          </View>
                        ))}
                    </View>
                  )}
                </View>
              </View>
            )}
          </Animated.View>
        </ScrollView>

        {/* مدال انتخاب عکس - فقط برای گالری خودی */}
        {isOwnGallery && (
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
        )}



        {/* مدال نمایش عکس در full screen */}
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
    alignItems: "center",
    marginBottom: 50,
    paddingTop: StatusBar.currentHeight + 35,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "relative",
  },
  addIconHeader: {
    position: "absolute",
    left: 0,
    borderRadius: 25,
    overflow: "hidden",
  },
  addIconGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  reviewIconHeader: {
    position: "absolute",
    left: 0,
    borderRadius: 25,
    overflow: "hidden",
  },
  reviewIconGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: 'absolute',
    top: StatusBar.currentHeight + 45,
    right: 20,
    zIndex: 1000,
  },
  backButtonContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
    marginTop: -12
  },
  titleWrapper: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Yekan_Bakh_ExtraBold",
    color: "#2c3e50",
    marginHorizontal: 15,
    textAlign: "center",
  },
  sparkleContainer: {
    position: "absolute",
    top: -10,
    left: -10,
  },
  sparkle1: {
    position: "absolute",
    top: 0,
    left: 90,
  },
  sparkle2: {
    position: "absolute",
    top: 25,
    left: 25,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 0,
  },
  galleryInfoSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 15,
    marginVertical: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  galleryMetaContainer: {
    marginBottom: 20,
  },
  likeSection: {
    alignItems: 'center',
    marginBottom: 15,
  },
  likeButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  likeCount: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    marginRight: 8,
  },
  galleryStats: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#666",
    marginRight: 8,
  },
  ratingSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  ratingComponent: {
    alignItems: 'flex-end',
  },
  detailedRatingsContainer: {
    marginTop: 15,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  detailedRatingsTitle: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    textAlign: 'right',
    marginBottom: 10,
  },
  detailedRatingRow: {
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 8,
  },
  ratingRowContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingRowText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  ratingRowTitle: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
  },
  ratingRowStars: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginLeft: 10,
  },
  ratingScore: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.fashionGold,
    marginRight: 4,
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
  reviewModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  reviewModalBackdrop: {
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
  reviewModalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 15,
    paddingBottom: 35,
    paddingHorizontal: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  reviewModalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  reviewModalTitle: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
  },
  reviewModalScroll: {
    maxHeight: 400,
  },
  galleryInfoInModal: {
    backgroundColor: '#f8f9ff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e3e7ff',
  },
  galleryTitleInModal: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    textAlign: 'center',
    marginBottom: 15,
  },
  quickStatsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  quickStat: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  quickStatText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#666",
    marginRight: 6,
  },
  likeButtonInModal: {
    alignItems: 'center',
  },
  fullLikeButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fullLikeText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    marginRight: 8,
  },
  ratingInModal: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  ratingComponentInModal: {
    alignItems: 'flex-end',
  },
  detailedRatingsInModal: {
    marginTop: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  detailedRatingsTitleInModal: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    textAlign: 'right',
    marginBottom: 10,
  },
  detailedRatingRowInModal: {
    marginBottom: 8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  ratingRowContentInModal: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingRowTextInModal: {
    flex: 1,
    alignItems: 'flex-end',
  },
  ratingRowTitleInModal: {
    fontSize: 13,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
  },
  ratingRowStarsInModal: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginLeft: 10,
  },
  ratingScoreInModal: {
    fontSize: 13,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.fashionGold,
    marginRight: 4,
    minWidth: 25,
    textAlign: 'center',
  },
  reviewModalCloseButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginTop: 15,
  },
  reviewModalCloseText: {
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

export default GalleryItemScreen;