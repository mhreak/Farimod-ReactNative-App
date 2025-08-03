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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../config/colors";
import MainBackground from "../components/MainBackground";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Toast from "../components/Toast";
import { toPersianDigits } from "../utils/converters";
import RatingComponent, { StarDisplay } from "../components/RatingComponent";
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

const portfolioData = {
  PortfolioId: 1,
  Title: "کالکشن پاییز و زمستان 1403",
  Description: "مجموعه‌ای از طراحی‌های مدرن و شیک برای فصل سرد سال، ترکیبی از سنت و مدرنیته در قالب پوشاک روزمره و مجلسی. این کالکشن شامل پیراهن‌های زنانه، کت و شلوارهای مردانه و لباس‌های کودکانه است که با استفاده از بهترین پارچه‌ها و تکنیک‌های خیاطی مدرن طراحی شده‌اند.",
  Category: "لایک",
  Tags: ["مدرن", "شیک", "پاییزه", "کژوال", "مجلسی"],
  Designer: "سارا احمدی",
  CreatedDate: "1403/05/15",
  ViewCount: 234,
  LikeCount: 89,
  Images: [
    "https://example.com/portfolio1.jpg",
    "https://example.com/portfolio2.jpg",
    "https://example.com/portfolio3.jpg"
  ],
  Materials: ["پنبه", "ابریشم", "کتان", "ساتن"],
  Colors: ["مشکی", "سفید", "طوسی", "سرمه‌ای"],
  Sizes: ["S", "M", "L", "XL"],
  Price: "درخواست قیمت",
  IsAvailable: true,
  MemberId: 1,
  Status: "منتشر شده",
  AverageRating: 4.2,
  RatingCount: 127,
  UserRating: 0,
  UserDetailedRatings: {},
  DetailedRatingsAverages: {
    quality: 4.7,
    creativity: 4.9,
    materials: 4.6,
    style: 4.8
  }
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

  return contentReviewList
    .filter(item => item.Active)
    .sort((a, b) => a.ShowOrder - b.ShowOrder)
    .map(item => {
      const avgText = item.CalculatedAverageRating ?
        `⭐ ${toPersianDigits(item.CalculatedAverageRating.toFixed(1))}` :
        'بدون امتیاز';

      const maxTitleLength = 30;
      const currentTitleLength = item.Text.length;
      const spacingNeeded = Math.max(0, maxTitleLength - currentTitleLength);
      const spacing = ' '.repeat(spacingNeeded + 5);

      return {
        id: `review_${item.ContentReviewItemId}`,
        title: `${item.Text}`,
        subtitle: '',
        contentReviewItemId: item.ContentReviewItemId,
        showOrder: item.ShowOrder,
        averageRating: item.CalculatedAverageRating || 0
      };
    });
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

  const fetchPortfolio = async (portfolioId) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching portfolio details for ID:', portfolioId);

      const response = await fetch(
        `${appConfig.mobileApi}Portfolio/Get?portfolioId=${portfolioId}`
      );

      console.log('API Response Status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API Response Data:', result);

      const transformedData = {
        PortfolioId: result.Portfolio.PotfolioId || result.Portfolio.PortfolioId,
        Title: result.Portfolio.Title || "نام نامشخص",
        Description: result.Portfolio.Description || "توضیحات موجود نیست",
        Category: "نمونه کار",
        Designer: "طراح",
        CreatedDate: result.Portfolio.InsertDate ?
          new Date(result.Portfolio.InsertDate).toLocaleDateString('fa-IR') :
          "تاریخ نامشخص",
        ViewCount: 0,
        LikeCount: result.Portfolio.LikeCount || 0,
        Images: [
          result.Portfolio.FeaturedImageFileName &&
          `${appConfig.mobileApi}Portfolio/GetPortfolioImage/${result.Portfolio.FeaturedImageFileName}`,
          result.Portfolio.FirstImageFileName &&
          `${appConfig.mobileApi}Portfolio/GetPortfolioImage/${result.Portfolio.FirstImageFileName}`,
          result.Portfolio.SecondImageFileName &&
          `${appConfig.mobileApi}olioImage/${result.Portfolio.SecondImageFileName}`,
          result.Portfolio.ThirdImageFileName &&
          `${appConfig.mobileApi}olioImage/${result.Portfolio.ThirdImageFileName}`,
          result.Portfolio.FourthImageFileName &&
          `${appConfig.mobileApi}Portfolio/GetPortfolioImage/${result.Portfolio.FourthImageFileName}`,
          result.Portfolio.FifthImageFileName &&
          `${appConfig.mobileApi}Portfolio/GetPortfolioImage/${result.Portfolio.FifthImageFileName}`
        ].filter(Boolean),
        IsAvailable: result.Portfolio.Active,
        MemberId: result.Portfolio.MemberId,
        Status: result.Portfolio.Active ? "منتشر شده" : "غیرفعال",
        AverageRating: result.Portfolio.Rating || 0,
        RatingCount: 0,
        UserRating: 0,
        UserDetailedRatings: {},
        DetailedRatingsAverages: {},
        IsMemberLiked: result.IsMemberLiked || false,
        ContentReviewItemList: result.ContentReviewItemList || []
      };

      setData(transformedData);
    } catch (err) {
      console.error('Portfolio Details API Error:', err);
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
    fetchPortfolio,
    setData,
  };
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
      <View style={styles.imageSkeletonContainer}>
        <SkeletonLoader width="100%" height="100%" borderRadius={0} />
      </View>

      <View style={styles.contentSkeletonContainer}>
        <SkeletonLoader width="90%" height={28} style={{ marginBottom: 20, alignSelf: 'flex-end' }} />

        <View style={styles.infoSkeletonRow}>
          <SkeletonLoader width={80} height={20} borderRadius={10} />
          <SkeletonLoader width={100} height={20} borderRadius={10} />
        </View>

        <SkeletonLoader width="95%" height={18} style={{ marginBottom: 12, alignSelf: 'flex-end' }} />
        <SkeletonLoader width="85%" height={18} style={{ marginBottom: 12, alignSelf: 'flex-end' }} />
        <SkeletonLoader width="92%" height={18} style={{ marginBottom: 12, alignSelf: 'flex-end' }} />
        <SkeletonLoader width="75%" height={18} style={{ marginBottom: 20, alignSelf: 'flex-end' }} />

        <View style={styles.tagsSkeletonContainer}>
          <SkeletonLoader width={60} height={25} borderRadius={12} />
          <SkeletonLoader width={80} height={25} borderRadius={12} />
          <SkeletonLoader width={70} height={25} borderRadius={12} />
        </View>

        <View style={styles.statsSkeletonContainer}>
          <SkeletonLoader width={80} height={20} />
          <SkeletonLoader width={80} height={20} />
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
  const rotateAnim = useRef(new Animated.Value(0)).current;

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

  useFocusEffect(
    useCallback(() => {
      if (portfolioId) {
        fetchPortfolio(portfolioId);
      } else {
        console.warn('No portfolioId provided, using default ID 1');
        fetchPortfolio(1);
      }
    }, [portfolioId])
  );

  useEffect(() => {
    if (portfolio) {
      setLikeCount(portfolio.LikeCount || 0);
      setIsLiked(portfolio.IsMemberLiked || false);

      const ratingOptions = transformContentReviewToRatingOptions(portfolio.ContentReviewItemList);
      setDynamicRatingOptions(ratingOptions);
      console.log('Dynamic Rating Options:', ratingOptions);
    }
  }, [portfolio]);

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

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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
      console.warn('No portfolioId for refresh, using default ID 1');
      await fetchPortfolio(1);
    }
    setRefreshing(false);
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

    // Optimistic update
    setIsLiked(newIsLiked);
    setLikeCount(newLikeCount);

    // Like animation
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
      // Call the like API
      const currentPortfolioId = portfolioId || portfolio.PortfolioId || 1;
      console.log('Sending like request for portfolio ID:', currentPortfolioId);

      const response = await fetch(
        `${appConfig.mobileApi}Portfolio/Like?id=${currentPortfolioId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Like API Response Status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Like API Response:', result);



    } catch (error) {
      console.error('Like API Error:', error);

      // Revert optimistic update on error
      setIsLiked(isLiked);
      setLikeCount(likeCount);

    } finally {
      setIsLiking(false);
    }
  };

  const handleRatingChange = (newRating, detailedRatings = null) => {
    if (portfolio) {
      const updatedPortfolio = {
        ...portfolio,
        UserRating: newRating
      };

      if (detailedRatings) {
        updatedPortfolio.UserDetailedRatings = detailedRatings;
        setUserDetailedRatings(detailedRatings);
      }

      setData(updatedPortfolio);
    }

    if (detailedRatings) {
      const ratingTexts = Object.entries(detailedRatings).map(([key, value]) => {
        const option = (dynamicRatingOptions.length > 0 ? dynamicRatingOptions : portfolioRatingOptions)
          .find(opt => opt.id === key);
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
      console.error('Error deleting portfolio:', error);
      showToast(error.message || 'خطا در حذف نمونه کار', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderErrorComponent = () => (
    <View style={styles.errorContainer}>
      <MaterialIcons name="design-services" size={80} color="#9e9e9e" />
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
            console.warn('No portfolioId for retry, using default ID 1');
            fetchPortfolio(1);
          }
        }}
      >
        <MaterialIcons name="refresh" size={20} color={colors.white} />
        <AppText style={styles.retryButtonText}>تلاش مجدد</AppText>
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
          <MaterialIcons name="design-services" size={80} color="#9e9e9e" />
          <AppText style={styles.emptyTitle}>نمونه کار یافت نشد</AppText>
          <AppText style={styles.emptySubtitle}>
            نمونه کار مورد نظر موجود نیست
          </AppText>
        </View>
      );
    }

    return (
      <View style={styles.contentWrapper}>
        <View style={styles.imageContainer}>
          <TouchableOpacity
            style={styles.imagePlaceholder}
            onPress={() => handleShowImages(0)}
          >
            <MaterialIcons name="design-services" size={60} color="#ccc" />
            <AppText style={styles.imageText}>گالری تصاویر</AppText>
          </TouchableOpacity>

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            style={styles.imageGradient}
          />



          <TouchableOpacity
            style={[
              styles.topLikeBadge,
              { backgroundColor: isLiked ? 'rgba(233, 30, 99, 0.8)' : 'rgba(255, 255, 255, 0.8)' }
            ]}
            onPress={handleLike}
            disabled={isLiking}
            activeOpacity={0.7}
          >
            <View style={styles.topLikeContent}>
              <MaterialIcons
                name={isLiked ? "favorite" : "favorite-border"}
                size={18}
                color={isLiked ? "#ffffff" : "#e91e63"}
              />
              <AppText style={[
                styles.topLikeCount,
                { color: isLiked ? "#ffffff" : "#e91e63" }
              ]}>
                {toPersianDigits(likeCount.toString())}
              </AppText>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <AppText style={styles.titleText}>
            {toPersianDigits(portfolio.Title)}
          </AppText>

          <AppText style={styles.descriptionText}>
            {toPersianDigits(portfolio.Description)}
          </AppText>

          <View style={styles.ratingSection}>
            <RatingComponent
              initialRating={portfolio.UserRating}
              averageRating={portfolio.AverageRating}
              ratingCount={portfolio.RatingCount}
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
              ratingOptions={dynamicRatingOptions.length > 0 ? dynamicRatingOptions : portfolioRatingOptions}
              modalTitle="امتیاز دهی نمونه کار"
              submitButtonText="ثبت امتیاز"
              cancelButtonText="لغو"
            />

            {dynamicRatingOptions.length > 0 && (
              <View style={styles.detailedRatingsContainer}>
                <AppText style={styles.detailedRatingsTitle}>میانگین امتیاز در هر بخش:</AppText>
                {dynamicRatingOptions.map((option) => {
                  return (
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
                  );
                })}
              </View>
            )}
          </View>

          <View style={styles.metaContainer}>
            <View style={styles.leftSection}>
              <View style={styles.dateContainer}>
                <MaterialIcons name="calendar-month" size={17} color="#666" />
                <AppText style={styles.dateText}>
                  {toPersianDigits(portfolio.CreatedDate)}
                </AppText>
              </View>
            </View>
          </View>
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
                    outputRange: [0, -150],
                  }),
                },
                {
                  scale: heartAnim.interpolate({
                    inputRange: [0, 0.3, 0.7, 1],
                    outputRange: [0.5, 1.8, 1.5, 0.3],
                  }),
                },
                {
                  rotate: heartAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '15deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <MaterialIcons name="favorite" size={50} color={modernColors.likeIcon} />
        </Animated.View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.backButtonContainer}>
            <MaterialIcons
              name="arrow-forward"
              size={24}
              color="#6366f1"
            />
          </View>
        </TouchableOpacity>

        {isOwnPortfolio && !loading && (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleShowActions}
            disabled={isDeleting}
          >
            <View style={styles.menuButtonContainer}>
              <MaterialIcons name="more-vert" size={24} color="#6366f1" />
            </View>
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

        <Animated.View
          style={[styles.floatingDecoration1, { transform: [{ rotate: spin }] }]}
        >
          <MaterialIcons name="brush" size={30} color="rgba(255, 105, 180, 0.3)" />
        </Animated.View>
        <Animated.View
          style={[styles.floatingDecoration2, { transform: [{ rotate: spin }] }]}
        >
          <MaterialIcons name="palette" size={25} color="rgba(255, 215, 0, 0.3)" />
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
              styles.animatedContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {renderContent()}
          </Animated.View>
        </ScrollView>

        <View style={styles.decorativeElements}>
          <View style={styles.floatingElements}>
            <Animated.View style={[styles.star1, { transform: [{ rotate: spin }] }]}>
              <MaterialIcons
                name="auto-awesome"
                size={22}
                color="rgba(147, 112, 219, 0.4)"
              />
            </Animated.View>
            <Animated.View style={[styles.star2, { transform: [{ rotate: spin }] }]}>
              <MaterialIcons
                name="diamond"
                size={18}
                color="rgba(255, 105, 180, 0.4)"
              />
            </Animated.View>
            <Animated.View style={[styles.star3, { transform: [{ rotate: spin }] }]}>
              <MaterialIcons
                name="star"
                size={20}
                color="rgba(255, 215, 0, 0.4)"
              />
            </Animated.View>
          </View>
        </View>

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
                {dynamicRatingOptions.length > 0 && (
                  <View style={styles.drawerRatingsSection}>
                    <AppText style={styles.drawerRatingsTitle}>امتیازات بخش‌ها:</AppText>
                    {dynamicRatingOptions.map((option) => (
                      <View key={option.id} style={styles.drawerRatingItem}>
                        <AppText style={styles.drawerRatingText}>{option.title}</AppText>
                        <View style={styles.drawerRatingRight}>
                          <AppText style={styles.drawerRatingScore}>
                            {toPersianDigits(option.averageRating.toFixed(1))}
                          </AppText>
                          <MaterialIcons name="star" size={16} color={modernColors.fashionGold} />
                        </View>
                      </View>
                    ))}
                  </View>
                )}

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
                  onPress={() => {
                    handleCloseModal();
                    setTimeout(() => {
                      handleShowImages();
                    }, 300);
                  }}
                >
                  <View style={styles.modalActionContent}>
                    <View style={[styles.modalActionIcon, { backgroundColor: modernColors.fashionPink }]}>
                      <MaterialIcons name="photo-library" size={22} color="#ffffff" />
                    </View>
                    <View style={styles.modalActionText}>
                      <AppText style={styles.modalActionTitle}>مشاهده گالری</AppText>
                      <AppText style={styles.modalActionSubtitle}>نمایش تمام تصاویر</AppText>
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

              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={styles.imageScrollView}
              >
                {portfolio?.Images?.map((image, index) => (
                  <View key={index} style={styles.imageSlide}>
                    <View style={styles.imagePlaceholderModal}>
                      <MaterialIcons name="image" size={80} color="#ccc" />
                      <AppText style={styles.imageIndexText}>
                        تصویر {toPersianDigits((index + 1).toString())}
                      </AppText>
                    </View>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.imageIndicators}>
                {portfolio?.Images?.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.imageIndicator,
                      index === selectedImageIndex && styles.activeIndicator
                    ]}
                  />
                ))}
              </View>
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
  headerContainer: {
    alignItems: "center",
    paddingTop: StatusBar.currentHeight + 35,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    position: 'absolute',
    top: StatusBar.currentHeight + 45,
    right: 20,
    zIndex: 1000,
  },
  backButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    width: 44,
    height: 44,
    borderRadius: 22,
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
  animatedContent: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
  },
  imageContainer: {
    height: 280,
    width: '100%',
    position: 'relative',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#999',
    marginTop: 10,
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  statusBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#ffffff',
  },
  topLikeBadge: {
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
  topLikeContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  topLikeCount: {
    fontSize: 15,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#ffffff',
    marginRight: 6,
  },
  contentContainer: {
    backgroundColor: '#ffffff',
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  titleText: {
    fontSize: 24,
    fontFamily: "Yekan_Bakh_ExtraBold",
    color: "#2c3e50",
    marginBottom: 15,
    textAlign: "right",
    lineHeight: 36,
  },
  designerContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff5f5',
    borderRadius: 15,
    borderRightWidth: 4,
    borderColor: modernColors.fashionPink,
  },
  designerText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.fashionPink,
    marginRight: 10,
  },
  descriptionText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#34495e",
    textAlign: "justify",
    lineHeight: 28,
    marginBottom: 25,
    textAlignVertical: "top",
    direction: "rtl",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    marginBottom: 15,
    textAlign: "right",
  },
  ratingSection: {
    marginBottom: 25,
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#dfdfdf',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingComponent: {
    alignItems: 'flex-end',
  },
  averageRatingsContainer: {
    marginTop: 20,
    backgroundColor: '#f0f4ff',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  averageRatingsTitle: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    textAlign: 'right',
    marginBottom: 15,
  },
  averageRatingRow: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  averageRatingContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  averageRatingText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  averageRatingTitle: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  averageRatingScore: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#667eea",
  },
  averageRatingStars: {
    marginLeft: 15,
  },
  detailedRatingsContainer: {
    marginTop: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  detailedRatingsTitle: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    textAlign: 'right',
    marginBottom: 15,
  },
  detailedRatingRow: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
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
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  ratingRowScores: {
    flexDirection: 'row-reverse',
    gap: 15,
  },
  userScore: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.primary,
  },
  avgScore: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#666',
  },
  ratingRowStars: {
    marginLeft: 15,
  },
  metaContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  leftSection: {
    alignItems: 'flex-end',
  },
  dateContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 15,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#666',
    marginRight: 10,
  },
  viewContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  viewText: {
    fontSize: 15,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#666',
    marginRight: 10,
  },
  likeSectionContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  likeButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeText: {
    fontSize: 15,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  floatingHeart: {
    position: 'absolute',
    top: height * 0.4,
    left: width * 0.5 - 25,
    zIndex: 1000,
    pointerEvents: 'none',
  },
  skeletonContainer: {
    flex: 1,
  },
  imageSkeletonContainer: {
    height: 280,
    width: '100%',
  },
  contentSkeletonContainer: {
    backgroundColor: '#ffffff',
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  infoSkeletonRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  tagsSkeletonContainer: {
    flexDirection: 'row-reverse',
    gap: 10,
    marginBottom: 20,
  },
  statsSkeletonContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#2c3e50',
    marginTop: 20,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#9e9e9e',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: modernColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 24,
    shadowColor: modernColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.white,
    marginRight: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#2c3e50',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#9e9e9e',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  floatingDecoration1: {
    position: 'absolute',
    top: 200,
    right: 30,
    zIndex: -1,
  },
  floatingDecoration2: {
    position: 'absolute',
    top: 400,
    left: 30,
    zIndex: -1,
  },
  decorativeElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  floatingElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star1: {
    position: "absolute",
    top: 300,
    left: 50,
  },
  star2: {
    position: "absolute",
    top: 500,
    right: 60,
  },
  star3: {
    position: "absolute",
    bottom: 200,
    left: 40,
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
  drawerRatingsSection: {
    backgroundColor: '#f8f9ff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e3e7ff',
  },
  drawerRatingsTitle: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    textAlign: 'right',
    marginBottom: 12,
  },
  drawerRatingItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  drawerRatingText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#2c3e50",
    flex: 1,
    textAlign: 'right',
  },
  drawerRatingRight: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  drawerRatingScore: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.fashionGold,
    minWidth: 25,
    textAlign: 'center',
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
    backgroundColor: '#f8f9fa',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  modalCancelText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#6c757d',
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
  imageScrollView: {
    flex: 1,
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
});

export default PortfolioDetailScreen;