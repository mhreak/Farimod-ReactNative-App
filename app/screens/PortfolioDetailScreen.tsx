import React, { useEffect, useRef, useState, useCallback } from "react";
import AppText from "../components/Text";
import {
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
  Animated,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Image,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../config/colors";
import MainBackground from "../components/MainBackground";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Toast from "../components/Toast";
import { toPersianDigits } from "../utils/converters";
import MultiOptionRatingComponent, { StarDisplay } from "../components/RatingComponent";
import appConfig from "../config/config";

const { width, height } = Dimensions.get('window');

const CURRENT_MEMBER_ID = 1;

const modernColors = {
  ...colors,
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
  fashionPink: "#ff69b4",
  fashionGold: "#ffd700",
  fashionPurple: "#9370db",
  likeIcon: "#e91e63",
};

const transformContentReviewToRatingOptions = (contentReviewList) => {
  if (!contentReviewList || contentReviewList.length === 0) {
    return [
      {
        id: 'quality',
        title: 'کیفیت کار',
        subtitle: 'کیفیت کلی و دقت در جزئیات'
      },
      {
        id: 'creativity',
        title: 'خلاقیت',
        subtitle: 'نوآوری و ایده‌های جدید'
      },
      {
        id: 'materials',
        title: 'مواد و پارچه',
        subtitle: 'انتخاب و کیفیت مواد اولیه'
      },
      {
        id: 'style',
        title: 'سبک و طراحی',
        subtitle: 'زیبایی و هماهنگی کلی'
      }
    ];
  }

  const transformedOptions = contentReviewList
    .filter(item => item.Active)
    .sort((a, b) => a.ShowOrder - b.ShowOrder)
    .map(item => {
      return {
        id: `review_${item.ContentReviewItemId}`,
        title: item.Text || `مورد ${item.ShowOrder}`,
        subtitle: '',
        contentReviewItemId: item.ContentReviewItemId,
        showOrder: item.ShowOrder,
        averageRating: item.CalculatedAverageRating || 0
      };
    });

  return transformedOptions;
};

const portfolioRatingOptions = [
  {
    id: 'quality',
    title: 'کیفیت کار',
    subtitle: 'کیفیت کلی و دقت در جزئیات'
  },
  {
    id: 'creativity',
    title: 'خلاقیت',
    subtitle: 'نوآوری و ایده‌های جدید'
  },
  {
    id: 'materials',
    title: 'مواد و پارچه',
    subtitle: 'انتخاب و کیفیت مواد اولیه'
  },
  {
    id: 'style',
    title: 'سبک و طراحی',
    subtitle: 'زیبایی و هماهنگی کلی'
  }
];

const usePortfolioDetail = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPortfolio = useCallback(async (portfolioId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${appConfig.mobileApi}Portfolio/Get?portfolioId=${portfolioId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      const images = [
        result.Portfolio.FeaturedImageURL,
        result.Portfolio.FirstImageURL,
        result.Portfolio.SecondImageURL,
        result.Portfolio.ThirdImageURL,
        result.Portfolio.FourthImageURL,
        result.Portfolio.FifthImageURL
      ].filter(url => url && url.trim() !== '');

      const transformedData = {
        PortfolioId: result.Portfolio.PortfolioId,
        Title: result.Portfolio.Title || "نام نامشخص",
        Description: result.Portfolio.Description || "توضیحات موجود نیست",
        Category: "نمونه کار",
        MemberName: result.Portfolio.MemberName || "نام طراح نامشخص",
        ShamsiInsertDate: result.Portfolio.ShamsiInsertDate ||  "تاریخ نامشخص",
        ViewCount: 0,
        LikeCount: result.Portfolio.LikeCount || 0,
        Images: images,
        IsAvailable: result.Portfolio.Active,
        MemberId: result.Portfolio.MemberId,
        Status: result.Portfolio.Active ? "منتشر شده" : "غیرفعال",
        AverageRating: result.Portfolio.Rating || 0,
        RatingCount: result.Portfolio.RatingCount || 0,
        UserRating: result.UserRating || 0,
        UserDetailedRatings: result.UserDetailedRatings || {},
        DetailedRatingsAverages: {},
        IsMemberLiked: result.IsMemberLiked || false,
        ContentReviewItemList: result.ContentReviewItemList || []
      };

      setData(transformedData);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    fetchPortfolio,
    setData,
  };
};

// Component بهبود یافته برای نمایش تصاویر با fallback
const PortfolioImage = ({ source, style, resizeMode = "contain", onError, onLoad }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = (error) => {
    console.log('Portfolio image error:', error.nativeEvent?.error);
    setImageError(true);
    setIsLoading(false);
    if (onError) {
      onError(error);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
    if (onLoad) {
      onLoad();
    }
  };

  if (imageError || !source) {
    return null; // تصویر ارور شده نمایش داده نمی‌شود
  }

  return (
    <>
      <Image
        source={typeof source === 'string' ? { uri: source } : source}
        style={[style, { borderRadius: 50, borderWidth: 0 }]}
        resizeMode={resizeMode}
        onError={handleImageError}
        onLoad={handleImageLoad}
        onLoadStart={() => setIsLoading(true)}
      />
      {isLoading && (
        <View style={[style, { position: 'absolute', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 12 }]}>
          <ActivityIndicator size="small" color="#ccc" />
        </View>
      )}
    </>
  );
};

const SkeletonLoader = ({ width, height, borderRadius = 8, style = {} }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]).start(() => startAnimation());
    };

    startAnimation();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e0e0e0', '#f0f0f0'],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor,
          borderRadius,
        },
        style,
      ]}
    />
  );
};

const PortfolioDetailSkeleton = () => {
  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.contentSkeletonContainer}>
        <View style={styles.skeletonCard}>
          <SkeletonLoader width="100%" height={300} style={{ marginBottom: 15 }} borderRadius={12} />
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
            {[1, 2, 3].map((item) => (
              <SkeletonLoader key={item} width={20} height={8} borderRadius={4} />
            ))}
          </View>
        </View>

        <View style={styles.skeletonCard}>
          <SkeletonLoader width="80%" height={28} style={{ marginBottom: 15, alignSelf: 'flex-end' }} />
          <SkeletonLoader width="100%" height={18} style={{ marginBottom: 8, alignSelf: 'flex-end' }} />
          <SkeletonLoader width="95%" height={18} style={{ marginBottom: 8, alignSelf: 'flex-end' }} />
          <SkeletonLoader width="90%" height={18} style={{ alignSelf: 'flex-end' }} />
        </View>

        <View style={styles.skeletonCard}>
          <SkeletonLoader width="40%" height={22} style={{ marginBottom: 15, alignSelf: 'flex-end' }} />
          <SkeletonLoader width={150} height={30} style={{ alignSelf: 'flex-end' }} borderRadius={15} />
        </View>
      </View>
    </View>
  );
};

const PortfolioDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const { title, portfolioId } = route?.params || {};

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const { data: portfolio, loading, error, fetchPortfolio, setData } = usePortfolioDetail();

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');
  const [refreshing, setRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // State برای مدیریت تصاویر معتبر
  const [validImages, setValidImages] = useState([]);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [errorImages, setErrorImages] = useState(new Set());
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const modalSlideAnim = useRef(new Animated.Value(0)).current;
  const modalBackdropAnim = useRef(new Animated.Value(0)).current;
  const deleteModalSlideAnim = useRef(new Animated.Value(0)).current;
  const deleteModalBackdropAnim = useRef(new Animated.Value(0)).current;
  const [userDetailedRatings, setUserDetailedRatings] = useState({});
  const [dynamicRatingOptions, setDynamicRatingOptions] = useState([]);

  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const likeAnim = useRef(new Animated.Value(1)).current;
  const heartAnim = useRef(new Animated.Value(0)).current;

  const scrollY = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      setData(null);
      setUserDetailedRatings({});
      setDynamicRatingOptions([]);
      setLikeCount(0);
      setIsLiked(false);
      setValidImages([]);
      setLoadedImages(new Set());
      setErrorImages(new Set());
      setCurrentImageIndex(0);

      if (portfolioId) {
        fetchPortfolio(portfolioId);
      } else {
        fetchPortfolio(1);
      }
    }, [portfolioId])
  );

  useEffect(() => {
    if (portfolio) {
      setLikeCount(portfolio.LikeCount || 0);
      setIsLiked(portfolio.IsMemberLiked || false);

      // تنظیم تصاویر معتبر
      if (portfolio.Images && portfolio.Images.length > 0) {
        setValidImages(portfolio.Images);
        setLoadedImages(new Set());
        setErrorImages(new Set());
        setCurrentImageIndex(0);
      } else {
        setValidImages([]);
      }

      const ratingOptions = transformContentReviewToRatingOptions(portfolio.ContentReviewItemList);
      setDynamicRatingOptions(ratingOptions);

      if (portfolio.UserDetailedRatings) {
        setUserDetailedRatings(portfolio.UserDetailedRatings);
      }
    }
  }, [portfolio]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const showToast = (message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  useEffect(() => {
    if (error) {
      showToast('خطا در دریافت اطلاعات نمونه کار. لطفاً دوباره تلاش کنید.', 'error');
    }
  }, [error]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (portfolioId) {
      await fetchPortfolio(portfolioId);
    } else {
      await fetchPortfolio(1);
    }
    setRefreshing(false);
  };

  // Handle image load success
  const handleImageLoad = (imageIndex) => {
    setLoadedImages(prev => new Set([...prev, imageIndex]));
  };

  // Handle image load error
  const handleImageError = (imageIndex) => {
    setErrorImages(prev => new Set([...prev, imageIndex]));
  };

  // محاسبه تصاویر نهایی برای نمایش
  const getDisplayImages = () => {
    if (!validImages || validImages.length === 0) {
      return [];
    }

    // فیلتر تصاویری که ارور نداشته‌اند
    const workingImages = validImages.filter((_, index) => !errorImages.has(index));

    // اگر هیچ تصویر معتبری نداریم، تصویر پیش‌فرض را برگردان
    if (workingImages.length === 0) {
      return [require('../../assets/portfolio_icon.jpg')];
    }

    return workingImages;
  };

  // Handle scroll for image gallery
  const handleImageScroll = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / (width - 40));
    const displayImages = getDisplayImages();

    if (slideIndex >= 0 && slideIndex < displayImages.length) {
      setCurrentImageIndex(slideIndex);
    }
  };

  const isOwnPortfolio = portfolio && portfolio.MemberId === CURRENT_MEMBER_ID;

  const handleEditPortfolio = () => {
    navigation.navigate("AddNewPortfolio", {
      isEdit: true,
      portfolioData: portfolio
    });
  };

  const handleShowImages = (index = 0) => {
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  const handleShowActions = () => {
    setShowActionModal(true);
    Animated.parallel([
      Animated.timing(modalBackdropAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(modalSlideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCloseModal = () => {
    Animated.parallel([
      Animated.timing(modalBackdropAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(modalSlideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowActionModal(false);
    });
  };

  const handleDeletePortfolio = () => {
    handleCloseModal();
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

  const handleLike = async () => {
    if (isLiking || !portfolio) return;

    setIsLiking(true);

    const newIsLiked = !isLiked;
    const countChange = newIsLiked ? 1 : -1;
    const newLikeCount = likeCount + countChange;

    setIsLiked(newIsLiked);
    setLikeCount(newLikeCount);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(likeAnim, {
          toValue: 0.6,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(heartAnim, {
          toValue: 0.3,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(likeAnim, {
          toValue: 1.3,
          tension: 200,
          friction: 4,
          useNativeDriver: true,
        }),
        Animated.timing(heartAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(likeAnim, {
        toValue: 1,
        tension: 200,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    if (newIsLiked) {
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(heartAnim, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(heartAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
      }, 200);
    } else {
      Animated.timing(heartAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }

    try {
      const currentPortfolioId = portfolioId || portfolio.PortfolioId || 1;

      const response = await fetch(
        `${appConfig.mobileApi}Portfolio/Like?id=${currentPortfolioId}`,
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

    } catch (error) {
      setIsLiked(isLiked);
      setLikeCount(likeCount);
    } finally {
      setIsLiking(false);
    }
  };

  const confirmDeletePortfolio = async () => {
    handleCloseDeleteModal();

    try {
      setIsDeleting(true);

      await new Promise(resolve => setTimeout(resolve, 2000));

      showToast('نمونه کار با موفقیت حذف شد', 'success');
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } catch (error) {
      showToast(error.message || 'خطا در حذف نمونه کار', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderRatingSection = () => {
    return (
      <Animated.View
        style={[
          styles.card,
          styles.simpleRatingCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.simpleCardContent}>
          <AppText style={styles.simpleCardTitle}>امتیازدهی</AppText>

          <View style={styles.simpleRatingContainer}>
            <MultiOptionRatingComponent
              contentId={portfolio.PortfolioId}
              averageRating={portfolio.AverageRating || 0}
              ratingCount={portfolio.RatingCount || 0}
              initialRating={portfolio.UserRating || 0}
              initialDetailedRatings={userDetailedRatings}
              maxStars={5}
              size={24}
              starColor="#ffb300"
              enableMultipleOptions={true}
              ratingOptions={dynamicRatingOptions.length > 0 ? dynamicRatingOptions : portfolioRatingOptions}
              modalTitle="امتیازدهی نمونه کار"
              submitButtonText="ثبت امتیاز"
              cancelButtonText="لغو"
              showRatingCount={true}
              showRatingText={true}
              animated={true}
              allowHalfStars={false}
              onRatingSubmitted={(result) => {
                console.log('Portfolio rating submitted successfully:', result);

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
                console.error('Portfolio rating submission failed:', errorMessage);
                showToast(errorMessage || 'خطا در ثبت امتیاز', 'error');
              }}
              onRatingChange={(rating, detailedRatings) => {
                if (detailedRatings) {
                  setUserDetailedRatings(detailedRatings);
                }
              }}
              style={styles.simpleRating}
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
                            color="#ffb300"
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
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderContentReview = () => {
    if (!portfolio || !portfolio.ContentReviewItemList || portfolio.ContentReviewItemList.length === 0) {
      return null;
    }

    const itemsWithRating = portfolio.ContentReviewItemList
      .filter(item => item.Active && item.CalculatedAverageRating && item.CalculatedAverageRating > 0)
      .sort((a, b) => a.ShowOrder - b.ShowOrder);

    if (itemsWithRating.length === 0) {
      return null;
    }

    return (
      <Animated.View
        style={[
          styles.card,
          styles.contentReviewCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.simpleCardContent}>
          <View style={styles.contentReviewHeader}>
            <AppText style={styles.contentReviewTitle}>میانگین امتیاز در هر بخش</AppText>
          </View>

          <View style={styles.contentReviewList}>
            {itemsWithRating.map((item, index) => (
              <View key={item.ContentReviewItemId} style={styles.reviewItem}>
                <View style={styles.reviewItemHeader}>
                  <View style={styles.reviewItemLeft}>
                    <StarDisplay
                      rating={item.CalculatedAverageRating}
                      size={16}
                      starColor="#ffb300"
                      showHalfStars={true}
                    />
                    <AppText style={styles.reviewRatingText}>
                      {toPersianDigits(item.CalculatedAverageRating.toFixed(1))}
                    </AppText>
                  </View>
                  <View style={styles.reviewItemRight}>
                    <AppText style={styles.reviewItemTitle}>
                      {item.Text || `مورد ${item.ShowOrder}`}
                    </AppText>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderErrorComponent = () => (
    <View style={styles.errorContainer}>
      <View style={styles.errorIconContainer}>
        <LinearGradient
          colors={['#ff6b6b', '#ee5a52']}
          style={styles.errorIconGradient}
        >
          <MaterialIcons name="error-outline" size={60} color="#ffffff" />
        </LinearGradient>
      </View>
      <AppText style={styles.errorTitle}>خطا در دریافت اطلاعات</AppText>
      <AppText style={styles.errorSubtitle}>
        اتصال اینترنت خود را بررسی کنید
      </AppText>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => {
          if (portfolioId) {
            fetchPortfolio(portfolioId);
          } else {
            fetchPortfolio(1);
          }
        }}
      >
        <LinearGradient
          colors={[modernColors.primary, modernColors.primaryDark]}
          style={styles.retryButtonGradient}
        >
          <MaterialIcons name="refresh" size={22} color={colors.white} />
          <AppText style={styles.retryButtonText}>تلاش مجدد</AppText>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return <PortfolioDetailSkeleton />;
    }

    if (error) {
      return renderErrorComponent();
    }

    if (!portfolio) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <LinearGradient
              colors={['#9e9e9e', '#757575']}
              style={styles.emptyIconGradient}
            >
              <MaterialIcons name="brush" size={60} color="#ffffff" />
            </LinearGradient>
          </View>
          <AppText style={styles.emptyTitle}>نمونه کار یافت نشد</AppText>
          <AppText style={styles.emptySubtitle}>
            نمونه کار مورد نظر موجود نیست
          </AppText>
        </View>
      );
    }

    const displayImages = getDisplayImages();
    const isDefaultImage = displayImages.length === 1 && displayImages[0] === require('../../assets/portfolio_icon.jpg');

    return (
      <View style={styles.contentWrapper}>
        <View style={styles.contentCards}>
          <Animated.View
            style={[
              styles.card,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.imageGalleryContainer}>
              {displayImages.length > 0 ? (
                <>
                  {isDefaultImage ? (
                    // نمایش تصویر پیش‌فرض (بدون اسکرول)
                    <View style={styles.singleImageContainer}>
                      <View style={styles.imageContainer}>
                        <Image
                          source={require('../../assets/portfolio_icon.jpg')}
                          style={[styles.portfolioImage, styles.defaultImageStyle]}
                          resizeMode="contain"
                        />
                      </View>
                    </View>
                  ) : (
                    // نمایش تصاویر معتبر (با قابلیت اسکرول)
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      pagingEnabled
                      style={styles.imageScrollView}
                      onMomentumScrollEnd={handleImageScroll}
                      scrollEventThrottle={16}
                    >
                      {validImages.map((image, index) => {
                        // فقط تصاویری که ارور نداشته‌اند را نمایش بده
                        if (errorImages.has(index)) {
                          return null;
                        }

                        return (
                          <TouchableOpacity
                            key={index}
                            style={styles.imageItem}
                            onPress={() => handleShowImages(index)}
                            activeOpacity={0.9}
                          >
                            <View style={styles.imageContainer}>
                              <PortfolioImage
                                source={image}
                                style={styles.portfolioImage}
                                resizeMode="contain"
                                onLoad={() => handleImageLoad(index)}
                                onError={() => handleImageError(index)}
                              />
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  )}

                  <View
                    style={[
                      styles.imageLikeBadge,
                      {
                        backgroundColor: isLiked ? 'rgba(233, 30, 99, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                      }
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.imageLikeContent}
                      onPress={handleLike}
                      disabled={isLiking}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons
                        name={isLiked ? "favorite" : "favorite-border"}
                        size={18}
                        color={isLiked ? "#ffffff" : "#e91e63"}
                      />
                      <AppText style={[
                        styles.imageLikeCount,
                        { color: isLiked ? "#ffffff" : "#e91e63" }
                      ]}>
                        {toPersianDigits(likeCount.toString())}
                      </AppText>
                    </TouchableOpacity>
                  </View>

                  {/* نمایش dots فقط برای تصاویر معتبر */}
                  {!isDefaultImage && displayImages.length > 1 && (
                    <View style={styles.imageDots}>
                      {displayImages.map((_, index) => (
                        <View
                          key={index}
                          style={[
                            styles.imageDot,
                            index === currentImageIndex && styles.imageDotActive
                          ]}
                        />
                      ))}
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.noImageContainer}>
                  <View style={styles.singleImageContainer}>
                    <View style={styles.imageContainer}>
                      <Image
                        source={require('../../assets/portfolio_icon.jpg')}
                        style={[styles.portfolioImage, styles.defaultImageStyle]}
                        resizeMode="contain"
                      />
                    </View>
                  </View>

                  <View
                    style={[
                      styles.imageLikeBadge,
                      {
                        backgroundColor: isLiked ? 'rgba(233, 30, 99, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                      }
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.imageLikeContent}
                      onPress={handleLike}
                      disabled={isLiking}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons
                        name={isLiked ? "favorite" : "favorite-border"}
                        size={18}
                        color={isLiked ? "#ffffff" : "#e91e63"}
                      />
                      <AppText style={[
                        styles.imageLikeCount,
                        { color: isLiked ? "#ffffff" : "#e91e63" }
                      ]}>
                        {toPersianDigits(likeCount.toString())}
                      </AppText>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              styles.designerCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.simpleCardContent}>
              <View style={styles.designerSection}>
                <View style={styles.designerIconContainer}>
                  <MaterialIcons name="person" size={24} color="#77B2D2" />
                </View>
                <AppText style={styles.designerName}>
                  {portfolio.MemberName}
                </AppText>
              </View>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              styles.mainCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.simpleCardContent}>
              <AppText style={styles.simpleTitle}>
                {toPersianDigits(portfolio.Title)}
              </AppText>

              <AppText style={styles.simpleDescription}>
                {toPersianDigits(portfolio.Description)}
              </AppText>

              <View style={styles.dateSection}>
                <MaterialIcons name="calendar-today" size={16} color="#9e9e9e" />
                <AppText style={styles.dateText}>
                  {toPersianDigits(portfolio.ShamsiInsertDate)}
                </AppText>
              </View>
            </View>
          </Animated.View>

          {renderRatingSection()}

          {renderContentReview()}

          <View style={styles.bottomSpacing} />
        </View>
      </View>
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        <MainBackground />

        <Toast
          visible={toastVisible}
          message={toastMessage}
          type={toastType}
          onHide={() => setToastVisible(false)}
        />

        <Animated.View
          style={[
            styles.floatingHeart,
            {
              opacity: heartAnim,
              transform: [
                {
                  translateY: heartAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -200],
                  }),
                },
                {
                  scale: heartAnim.interpolate({
                    inputRange: [0, 0.3, 0.7, 1],
                    outputRange: [0.5, 2.0, 1.8, 0.3],
                  }),
                },
                {
                  rotate: heartAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '25deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['#ff69b4', '#e91e63']}
            style={styles.floatingHeartGradient}
          >
            <MaterialIcons name="favorite" size={40} color="#ffffff" />
          </LinearGradient>
        </Animated.View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
            style={styles.backButtonGradient}
          >
            <MaterialIcons name="arrow-forward" size={24} color="#6366f1" />
          </LinearGradient>
        </TouchableOpacity>

        {isOwnPortfolio && !loading && (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleShowActions}
            disabled={isDeleting}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
              style={styles.menuButtonGradient}
            >
              <MaterialIcons name="more-vert" size={24} color="#6366f1" />
            </LinearGradient>
          </TouchableOpacity>
        )}

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
            <AppText style={styles.headerTitle}>نمونه کار</AppText>
          </View>
        </Animated.View>

        <Animated.ScrollView
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
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {renderContent()}
        </Animated.ScrollView>

        <Modal
          visible={showActionModal}
          transparent={true}
          animationType="none"
          onRequestClose={handleCloseModal}
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
                onPress={handleCloseModal}
                activeOpacity={1}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.modalContent,
                {
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
              <View style={styles.modalHandle} />

              <View style={styles.modalHeader}>
                <AppText style={styles.modalTitle}>عملیات نمونه کار</AppText>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalActionItem}
                  onPress={() => {
                    handleCloseModal();
                    setTimeout(() => {
                      handleEditPortfolio();
                    }, 300);
                  }}
                >
                  <View style={styles.modalActionContent}>
                    <View style={[styles.modalActionIcon, { backgroundColor: modernColors.info }]}>
                      <MaterialIcons name="edit" size={22} color="#ffffff" />
                    </View>
                    <View style={styles.modalActionText}>
                      <AppText style={styles.modalActionTitle}>ویرایش نمونه کار</AppText>
                      <AppText style={styles.modalActionSubtitle}>ویرایش اطلاعات و تصاویر</AppText>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalActionItem}
                  onPress={handleDeletePortfolio}
                  disabled={isDeleting}
                >
                  <View style={styles.modalActionContent}>
                    <View style={[styles.modalActionIcon, { backgroundColor: modernColors.error }]}>
                      <MaterialIcons name="delete" size={22} color="#ffffff" />
                    </View>
                    <View style={styles.modalActionText}>
                      <AppText style={styles.modalActionTitle}>حذف نمونه کار</AppText>
                      <AppText style={styles.modalActionSubtitle}>حذف کامل از سیستم</AppText>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={handleCloseModal}
              >
                <AppText style={styles.modalCancelText}>لغو</AppText>
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
          <View style={styles.modalContainer}>
            <Animated.View
              style={[
                styles.modalBackdrop,
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
                  آیا از حذف این نمونه کار اطمینان دارید؟{'\n'}
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
                    onPress={confirmDeletePortfolio}
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
          visible={showImageModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowImageModal(false)}
        >
          <View style={styles.imageModalContainer}>
            <TouchableOpacity
              style={styles.imageModalBackdrop}
              onPress={() => setShowImageModal(false)}
              activeOpacity={1}
            />

            <View style={styles.imageModalContent}>
              <View style={styles.imageModalHeader}>
                <AppText style={styles.imageModalTitle}>گالری تصاویر</AppText>
                <TouchableOpacity
                  style={styles.imageModalCloseButton}
                  onPress={() => setShowImageModal(false)}
                >
                  <MaterialIcons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {(() => {
                const modalDisplayImages = getDisplayImages();
                const isModalDefaultImage = modalDisplayImages.length === 1 && modalDisplayImages[0] === require('../../assets/portfolio_icon.jpg');

                return modalDisplayImages.length > 0 && !isModalDefaultImage ? (
                  <>
                    <ScrollView
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      style={styles.imageScrollView}
                      onMomentumScrollEnd={(event) => {
                        const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
                        setSelectedImageIndex(slideIndex);
                      }}
                    >
                      {modalDisplayImages.map((image, index) => (
                        <View key={index} style={styles.imageSlide}>
                          <View style={styles.imagePlaceholderModal}>
                            <PortfolioImage
                              source={image}
                              style={styles.fullModalImage}
                              resizeMode="contain"
                            />
                          </View>
                        </View>
                      ))}
                    </ScrollView>

                    <View style={styles.imageIndicators}>
                      {modalDisplayImages.map((_, index) => (
                        <View
                          key={index}
                          style={[
                            styles.imageIndicator,
                            index === selectedImageIndex && styles.activeIndicator
                          ]}
                        />
                      ))}
                    </View>
                  </>
                ) : (
                  <View style={styles.imageSlide}>
                    <View style={styles.imagePlaceholderModal}>
                      <Image
                        source={require('../../assets/portfolio_icon.jpg')}
                        style={[styles.fullModalImage, styles.defaultImageStyle]}
                        resizeMode="contain"
                      />
                    </View>
                  </View>
                );
              })()}
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
    // borderRadius: 12,
  },
  defaultImageStyle: {
    // borderRadius: 200,
    // borderWidth: 2,
    // borderColor: '#e9ecef',
    // backgroundColor: '#f8f9fa',
  },
  singleImageContainer: {
    height: width - 40,
    marginBottom: 0,
  },
  fullModalImage: {
    width: '100%',
    height: '100%',
  },
  headerContainer: {
    alignItems: "center",
    paddingTop: StatusBar.currentHeight + 38,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    position: 'absolute',
    top: StatusBar.currentHeight + 38,
    right: 20,
    zIndex: 1000,
  },
  backButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  menuButton: {
    position: 'absolute',
    top: StatusBar.currentHeight + 38,
    left: 20,
    zIndex: 1000,
  },
  menuButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
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
  scrollView: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    paddingTop: 20,
  },
  imageGalleryContainer: {
    position: 'relative',
  },
  imageScrollView: {
    height: width - 40,
  },
  imageItem: {
    width: width - 40,
    height: width - 40,
    marginRight: 0,
  },
  imageContainer: {
    flex: 1,
    

    justifyContent: 'center',
    alignItems: 'center',

    overflow: 'hidden',
  },
  imageText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#9e9e9e',
    marginTop: 10,
    textAlign: 'center',
  },
  imageDots: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  imageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  imageDotActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 20,
  },
  imageLikeBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  noImageContainer: {
    height: width - 40,
    position: 'relative',
  },
  noImageContent: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  defaultPortfolioImage: {
    width: '100%',
    height: '100%',

  },
  noImageText: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#9e9e9e',
    marginTop: 15,
    textAlign: 'center',
  },
  noImageSubtext: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#bdbdbd',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  imageLikeContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  imageLikeCount: {
    fontSize: 15,
    fontFamily: "Yekan_Bakh_Bold",
    marginRight: 6,
  },
  designerCard: {
    marginBottom: 15,
  },
  designerSection: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  designerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(119, 178, 210,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    borderWidth: 1,
    borderColor: 'rgba(119, 178, 210, 0.2)',
  },
  designerName: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
  },
  mainCard: {
    marginBottom: 15,
  },
  simpleCardContent: {
    padding: 20,
  },
  simpleTitle: {
    fontSize: 22,
    fontFamily: "Yekan_Bakh_ExtraBold",
    color: "#2c3e50",
    marginBottom: 12,
    textAlign: "right",
    lineHeight: 32,
  },
  simpleDescription: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#6c757d",
    textAlign: "justify",
    lineHeight: 26,
    marginBottom: 15,
    direction: "rtl",
  },
  dateSection: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  dateText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#9e9e9e",
    marginRight: 6,
  },
  contentReviewCard: {
    marginBottom: 15,
  },
  contentReviewHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contentReviewTitle: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    marginRight: 0,
  },
  contentReviewList: {
    marginBottom: 20,
  },
  reviewItem: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderRightWidth: 4,
    borderRightColor: modernColors.fashionPink,
  },
  reviewItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewItemRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  reviewItemLeft: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  reviewItemTitle: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  reviewRatingText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#ffb300",
  },
  simpleRatingCard: {
    marginBottom: 15,
  },
  simpleCardTitle: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    marginBottom: 15,
    textAlign: 'right',
  },
  simpleRatingContainer: {
    alignItems: 'flex-end',
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
  contentCards: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  card: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: "rgba(255,255,255,0.8)"
  },
  floatingHeart: {
    position: 'absolute',
    top: height * 0.4,
    left: width * 0.5 - 30,
    zIndex: 1000,
    pointerEvents: 'none',
  },
  floatingHeartGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff69b4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  skeletonContainer: {
    flex: 1,
  },
  contentSkeletonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  skeletonCard: {
    backgroundColor: '#ffffff',
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  errorIconContainer: {
    marginBottom: 25,
  },
  errorIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff6b6b',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  errorTitle: {
    fontSize: 22,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#9e9e9e',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: modernColors.primary,
    shadowOffset: {
      width: 0,
      height: 6
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  retryButtonGradient: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 15,
    gap: 10,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIconContainer: {
    marginBottom: 25,
  },
  emptyIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#9e9e9e',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#9e9e9e',
    textAlign: 'center',
    lineHeight: 24,
  },
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
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
  },
  modalActions: {
    marginBottom: 20,
  },
  modalActionItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderRadius: 15,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  modalActionContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  modalActionIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  modalActionText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  modalActionTitle: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    marginBottom: 2,
  },
  modalActionSubtitle: {
    fontSize: 13,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#6c757d",
  },
  modalCancelButton: {
    backgroundColor: "#ffcdcd",
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  modalCancelText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.danger,
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
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
  },
  imageModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  imageModalContent: {
    flex: 1,
    paddingTop: StatusBar.currentHeight + 20,
  },
  imageModalHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  imageModalTitle: {
    fontSize: 20,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#ffffff',
  },
  imageModalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageSlide: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  imagePlaceholderModal: {
    width: width - 40,
    height: 300,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imageIndexText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#ffffff',
    marginTop: 10,
  },
  imageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  imageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeIndicator: {
    backgroundColor: '#ffffff',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default PortfolioDetailScreen;