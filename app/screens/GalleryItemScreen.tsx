import React, { useState, useEffect, useRef, useCallback } from "react";
import AppText from "../components/Text";
import ImageInput from "../components/ImageInput";
import { Image, View, StyleSheet, TouchableOpacity, StatusBar, Animated, Modal, Pressable, ScrollView, RefreshControl, Dimensions } from "react-native";
import ImageInputList from "../components/ImageInputList";
import FormImagePicker from "../components/forms/FormImagePicker";
import MainBackground from "../components/MainBackground";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MultiOptionRatingComponent, { StarDisplay } from "../components/RatingComponent";
import Toast from "../components/Toast";
import appConfig from "../config/config";
import { toPersianDigits } from "../utils/converters";
import { useAuth } from "../contexts/AuthContext";
const { width } = Dimensions.get('window');

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
const DotIndicator = ({ totalImages, currentIndex }) => {
  return (
    <View style={styles.dotIndicatorContainer}>
      {Array.from({ length: totalImages }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            currentIndex === index && styles.activeDot
          ]}
        />
      ))}
    </View>
  );
};

const GalleryItemScreen = () => {
  const { user } = useAuth();

  const [imageUri, setImageUri] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [fullScreenImageUri, setFullScreenImageUri] = useState(null);
  const [fullScreenModalVisible, setFullScreenModalVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // ✅ اضافه کنید

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
  const actionModalSlideAnim = useRef(new Animated.Value(0)).current;
  const actionModalBackdropAnim = useRef(new Animated.Value(0)).current;
  const deleteModalSlideAnim = useRef(new Animated.Value(0)).current;
  const deleteModalBackdropAnim = useRef(new Animated.Value(0)).current;
  const fullScreenScrollViewRef = useRef(null);

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

  const isOwnGallery = galleryData && user && galleryData.MemberId === user.MemberId;

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
    const index = imageUri.findIndex(img => img === uri);
    const targetIndex = index >= 0 ? index : 0;

    // ابتدا index را set کنید
    setCurrentImageIndex(targetIndex);
    setFullScreenImageUri(uri);

    // بعد modal را باز کنید
    setTimeout(() => {
      setFullScreenModalVisible(true);
    }, 50);
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

  const handleShowActions = () => {
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
    });
  };

  const handleDeleteGallery = () => {
    handleCloseActionModal();
    setTimeout(() => {
      setShowDeleteConfirmModal(true);
      Animated.parallel([
        Animated.timing(deleteModalBackdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(deleteModalSlideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, 300);
  };

  const handleCloseDeleteModal = () => {
    Animated.parallel([
      Animated.timing(deleteModalBackdropAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(deleteModalSlideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowDeleteConfirmModal(false);
    });
  };

  const confirmDeleteGallery = async () => {
    handleCloseDeleteModal();

    try {
      setIsDeleting(true);

      const response = await fetch(`${appConfig.mobileApi}ImageGallery/Delete?id=${galleryData.ImageGalleryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast('گالری با موفقیت حذف شد', 'success');
          navigation.navigate("App", { screen: "MainTabs", params: { screen: "خانه" } });

      } else {
        const errorData = await response.json();
        throw new Error(errorData.Message || 'خطا در حذف گالری');
      }
    } catch (error) {
      console.error('Error deleting gallery:', error);
      showToast(error.message || 'خطا در حذف گالری', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditGallery = () => {
    navigation.navigate("AddNewGallery", {
      isEdit: true,
      galleryData: galleryData
    });
  };

  const handleLike = async () => {
    if (isLiking || !galleryData || !user?.MemberId) return;

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
        `${appConfig.mobileApi}ImageGallery/Like?id=${galleryData.ImageGalleryId}&memberId=${user.MemberId}`,
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
useEffect(() => {
  if (fullScreenModalVisible && fullScreenScrollViewRef.current) {
    // با تاخیر بیشتر و استفاده از requestAnimationFrame
    requestAnimationFrame(() => {
      setTimeout(() => {
        fullScreenScrollViewRef.current?.scrollTo({
          x: currentImageIndex * width,
          y: 0,
          animated: false
        });
      }, 150);
    });
  }
}, [fullScreenModalVisible]);
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
          onPress={() => navigation.navigate("App", { screen: "MainTabs", params: { screen: "خانه" } })}
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
              isReadOnly={true} // ✅ فقط در این صفحه true
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
                  <MultiOptionRatingComponent
                    contentId={galleryData.ImageGalleryId}
                    averageRating={galleryData.Rating || 0}
                    ratingCount={galleryData.RatingCount || 0}
                    initialRating={galleryData.UserRating || 0}
                    initialDetailedRatings={userDetailedRatings}
                    maxStars={5}
                    size={24}
                    starColor={modernColors.fashionGold}
                    enableMultipleOptions={true}
                    ratingOptions={dynamicRatingOptions}
                    modalTitle="امتیازدهی گالری"
                    submitButtonText="ثبت امتیاز"
                    cancelButtonText="لغو"
                    showRatingCount={true}
                    showRatingText={true}
                    animated={true}
                    allowHalfStars={false}
                    onRatingSubmitted={(result) => {
                      console.log('Rating submitted successfully:', result);

                      if (result.ratings) {
                        setUserDetailedRatings(result.ratings);
                        const averageRating = result.averageRating;

                        setData(prevData => ({
                          ...prevData,
                          UserRating: averageRating,
                          UserDetailedRatings: result.ratings
                        }));

                        showToast(`امتیاز شما در ${Object.keys(result.ratings).length} بخش با موفقیت ثبت شد`, 'success');
                      } else {
                        setData(prevData => ({
                          ...prevData,
                          UserRating: result.rating
                        }));

                        showToast(`امتیاز ${toPersianDigits(result.rating.toString())} ستاره ثبت شد`, 'success');
                      }
                    }}
                    onRatingError={(errorMessage) => {
                      console.error('Rating submission failed:', errorMessage);
                      showToast(errorMessage || 'خطا در ثبت امتیاز', 'error');
                    }}
                    onRatingChange={(rating, detailedRatings) => {
                      if (detailedRatings) {
                        setUserDetailedRatings(detailedRatings);
                      }
                    }}
                    style={styles.ratingComponent}
                  />

                  {dynamicRatingOptions.length > 0 && Object.keys(userDetailedRatings).length > 0 && (
                    <View style={styles.userDetailedRatingsContainer}>
                      <AppText style={styles.userDetailedRatingsTitle}>امتیازات شما:</AppText>
                      {dynamicRatingOptions
                        .filter(option => userDetailedRatings[option.id])
                        .map((option) => (
                          <View key={option.id} style={styles.userRatingRow}>
                            <View style={styles.userRatingRowContent}>
                              <View style={styles.userRatingRowText}>
                                <AppText style={styles.userRatingRowTitle}>{option.title}</AppText>
                              </View>
                              <View style={styles.userRatingRowStars}>
                                <StarDisplay
                                  rating={userDetailedRatings[option.id]}
                                  maxStars={5}
                                  size={16}
                                  color={modernColors.fashionGold}
                                  emptyColor="#e0e0e0"
                                  showHalfStars={false}
                                  animated={false}
                                />
                                <AppText style={styles.userRatingScore}>
                                  {toPersianDigits(userDetailedRatings[option.id].toString())}
                                </AppText>
                              </View>
                            </View>
                          </View>
                        ))}
                    </View>
                  )}

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
                                <AppText style={styles.averageRatingScore}>
                                  {toPersianDigits(option.averageRating.toFixed(1))}
                                </AppText>
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
                {
                  opacity: actionModalBackdropAnim,
                },
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

              <View style={styles.actionModalHeader}>
                <AppText style={styles.actionModalTitle}>عملیات گالری</AppText>
              </View>

              <View style={styles.actionModalActions}>
                <TouchableOpacity
                  style={styles.actionModalActionItem}
                  onPress={() => {
                    handleCloseActionModal();
                    setTimeout(() => {
                      selectImageSource();
                    }, 300);
                  }}
                >
                  <View style={styles.actionModalActionContent}>
                    <View style={[styles.actionModalActionIcon, { backgroundColor: modernColors.success }]}>
                      <MaterialIcons name="add-a-photo" size={22} color="#ffffff" />
                    </View>
                    <View style={styles.actionModalActionText}>
                      <AppText style={styles.actionModalActionTitle}>افزودن تصویر</AppText>
                      <AppText style={styles.actionModalActionSubtitle}>افزودن تصویر جدید به گالری</AppText>
                    </View>
                  </View>
                </TouchableOpacity>

            
              </View>

              <TouchableOpacity
                style={styles.actionModalCancelButton}
                onPress={handleCloseActionModal}
              >
                <AppText style={styles.actionModalCancelText}>لغو</AppText>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>

        <Modal
          visible={showDeleteConfirmModal}
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
                style={styles.backdropTouchable}
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
              <View style={styles.modalHandle} />

              <View style={styles.deleteModalHeader}>
                <View style={styles.deleteWarningIcon}>
                  <MaterialIcons name="warning" size={32} color="#ffffff" />
                </View>
                <AppText style={styles.deleteModalTitle}>تأیید حذف</AppText>
                <AppText style={styles.deleteModalMessage}>
                  آیا از حذف این گالری اطمینان دارید؟{'\n'}
                  این عمل قابل بازگشت نیست.
                </AppText>
              </View>

              <View style={styles.deleteModalActions}>
                <View style={styles.deleteButtonsRow}>
                  <TouchableOpacity
                    style={styles.deleteModalCancelButton}
                    onPress={handleCloseDeleteModal}
                    disabled={isDeleting}
                  >
                    <AppText style={styles.deleteModalCancelText}>لغو</AppText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.confirmDeleteButton}
                    onPress={confirmDeleteGallery}
                    disabled={isDeleting}
                  >
                    <LinearGradient
                      colors={[modernColors.error, '#c0392b']}
                      style={styles.confirmDeleteGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      {isDeleting ? (
                        <MaterialIcons name="hourglass-empty" size={20} color="#ffffff" />
                      ) : (
                        <MaterialIcons name="delete-forever" size={20} color="#ffffff" />
                      )}
                      <AppText style={styles.confirmDeleteText}>
                        {isDeleting ? 'در حال حذف...' : 'بله، حذف کن'}
                      </AppText>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </View>
        </Modal>
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

            <ScrollView
              ref={fullScreenScrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              scrollEventThrottle={16}
              snapToInterval={width}
              snapToAlignment="center"
              contentContainerStyle={{ alignItems: 'center' }}
              onScrollEndDrag={(event) => {
                const newIndex = Math.round(
                  event.nativeEvent.contentOffset.x / width
                );
                if (newIndex !== currentImageIndex) {
                  setCurrentImageIndex(newIndex);
                }
              }}
              onMomentumScrollEnd={(event) => {
                const newIndex = Math.round(
                  event.nativeEvent.contentOffset.x / width
                );
                if (newIndex !== currentImageIndex) {
                  setCurrentImageIndex(newIndex);
                }
              }}
              style={styles.fullScreenScrollView}
            >
              {imageUri.map((uri, index) => (
                <View key={index} style={styles.fullScreenImageContainer}>
                  <Image
                    source={{ uri }}
                    style={styles.fullScreenImage}
                    resizeMode="contain"
                  />
                </View>
              ))}
            </ScrollView>
           
         

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
  menuButton: {
    position: 'absolute',
    top: StatusBar.currentHeight + 45,
    left: 20,
    zIndex: 1000,
  },
  menuButtonContainer: {
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
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  actionModalHeader: {
    alignItems: 'center',
    marginBottom: 25,
  },
  actionModalTitle: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
  },
  actionModalActions: {
    marginBottom: 20,
  },
  actionModalActionItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderRadius: 15,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  actionModalActionContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  actionModalActionIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  actionModalActionText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  actionModalActionTitle: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    marginBottom: 2,
  },
  actionModalActionSubtitle: {
    fontSize: 13,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#6c757d",
  },
  actionModalCancelButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 15,
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
  deleteModalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 15,
    paddingBottom: 35,
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
  deleteModalHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  deleteWarningIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: modernColors.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: modernColors.error,
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
    shadowColor: modernColors.error,
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
  fullScreenModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
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
  userDetailedRatingsContainer: {
    marginTop: 20,
    backgroundColor: '#e8f5e8',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  userDetailedRatingsTitle: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    textAlign: 'right',
    marginBottom: 15,
  },
  userRatingRow: {
    marginBottom: 10,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e8f5e8',
  },
  userRatingRowContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userRatingRowText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  userRatingRowTitle: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  userRatingRowStars: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginLeft: 15,
    gap: 8,
  },
  userRatingScore: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.success,
  },
  averageRatingScore: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#666",
  },
  imageCounterContainer: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 2,
  },
  imageCounterText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: 'white',
  },
  fullScreenScrollView: {
    flex: 1,
  },
  fullScreenImageContainer: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // fullScreenImage را تغییر دهید:
  fullScreenImage: {
    width: width,
    height: '100%',
  },
  // در styles، این استایل‌ها را اضافه کنید:
  dotIndicatorContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
});

export default GalleryItemScreen;