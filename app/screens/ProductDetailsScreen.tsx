import React, { useEffect, useRef, useState } from "react";
import AppText from "../components/Text";
import {
  ScrollView,
  StyleSheet,
  View,
  Image,
  Dimensions,
  Animated,
  StatusBar,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../config/colors";
import MainBackground from "../components/MainBackground";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import Toast from "../components/Toast";
import { formatPersianDate, formatPrice, safeString, safeNumber, toPersianDigits } from "../utils/converters";
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
  priceIcon: "#2ecc71",
  sellerIcon: "#3498db",
  categoryIcon: "#9b59b6",
  statusIcon: "#e67e22",
  dateIcon: "#e74c3c",
  likeIcon: "#e91e63",
  fashionGold: "#ffd700",
};

const transformContentReviewToRatingOptions = (contentReviewList) => {
  if (!contentReviewList || contentReviewList.length === 0) {
    return [
      {
        id: 'quality',
        title: 'کیفیت محصول',
        subtitle: 'کیفیت کلی و ساخت'
      },
      {
        id: 'price',
        title: 'ارزش خرید',
        subtitle: 'تناسب قیمت و کیفیت'
      },
      {
        id: 'design',
        title: 'طراحی',
        subtitle: 'زیبایی و جذابیت'
      },
      {
        id: 'satisfaction',
        title: 'رضایت کلی',
        subtitle: 'رضایت از خرید'
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

// Skeleton Component for loading states
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

// Product Details Skeleton
const ProductDetailsSkeleton = () => {
  return (
    <View style={styles.container}>
      <MainBackground />

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton}>
        <View style={styles.backButtonContainer}>
          <MaterialIcons name="arrow-forward" size={24} color="#6366f1" />
        </View>
      </TouchableOpacity>

      {/* Header Skeleton */}
      <View style={styles.headerContainer}>
        <SkeletonLoader width={200} height={26} borderRadius={13} />
      </View>

      {/* Image Header Skeleton */}
      <View style={styles.imageHeaderContainer}>
        <SkeletonLoader width="100%" height="100%" borderRadius={30} />
      </View>

      {/* Product Info Skeleton */}
      <View style={styles.productInfoContainer}>
        <View style={styles.priceSection}>
          <SkeletonLoader width={120} height={20} borderRadius={10} style={{ marginBottom: 8 }} />
          <SkeletonLoader width={100} height={16} borderRadius={8} />
        </View>
        <View style={styles.likeSectionContainer}>
          <SkeletonLoader width={28} height={28} borderRadius={14} style={{ marginBottom: 4 }} />
          <SkeletonLoader width={20} height={14} borderRadius={7} />
        </View>
      </View>

      {/* Section Title Skeleton */}
      <View style={styles.sectionTitleContainer}>
        <SkeletonLoader width={50} height={50} borderRadius={25} style={{ marginLeft: 15 }} />
        <SkeletonLoader width={150} height={24} borderRadius={12} />
      </View>

      {/* Detail Items Skeleton */}
      <View style={styles.cardsContainer}>
        {[1, 2, 3, 4, 5].map((item) => (
          <View key={item} style={styles.detailItemSkeleton}>
            <View style={styles.skeletonRowContainer}>
              <SkeletonLoader width={44} height={44} borderRadius={22} style={{ marginLeft: 12 }} />
              <SkeletonLoader width="70%" height={17} borderRadius={8} />
            </View>
          </View>
        ))}
      </View>

      {/* Buttons Skeleton */}
      <View style={styles.buttonsContainer}>
        <SkeletonLoader width="92%" height={56} borderRadius={30} style={{ marginBottom: 18 }} />
        <SkeletonLoader width="70%" height={48} borderRadius={25} />
      </View>
    </View>
  );
};

// Custom hook for product details API
const useProductDetails = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProductDetails = async (productId) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching product details for ID:', productId);

      const response = await fetch(
        `${appConfig.mobileApi}Product/Get?productId=${productId}`
      );

      console.log('API Response Status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API Response Data:', result);

      // Transform the data to include necessary fields
      const transformedData = {
        ...result.Product, // استفاده از result.Product به جای result.Data
        IsMemberLiked: result.IsMemberLiked || false,
        ContentReviewItemList: result.ContentReviewItemList || [],
        LikeCount: result.Product?.LikeCount || 0,
        AverageRating: result.Product?.Rating || 0,
        RatingCount: 0,
        UserRating: 0,
        UserDetailedRatings: {},
        DetailedRatingsAverages: {}
      };

      console.log('Transformed Product Data:', transformedData);
      setData(transformedData);
    } catch (err) {
      console.error('Product Details API Error:', err);
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
    fetchProductDetails,
    setData,
  };
};

// Helper function to get product description
const getProductDescription = (productData) => {
  const description = [];

  // Base description
  description.push(`محصول ${productData.ProductName || 'نامشخص'} یکی از محصولات با کیفیت و قابل اعتماد است که با بهترین مواد اولیه تولید شده است.`);

  // Seller info
  if (productData.MemberName) {
    description.push(`این محصول توسط ${productData.MemberName} عرضه می‌شود.`);
  }

  // Status info
  if (productData.Active) {
    description.push("این محصول در حال حاضر موجود بوده و آماده ارسال است.");
  } else {
    description.push("این محصول در حال حاضر موجود نمی‌باشد.");
  }

  // Price info
  if (productData.SpecialSalePrice > 0) {
    const discountPercent = Math.round(((productData.Price - productData.SpecialSalePrice) / productData.Price) * 100);
    description.push(`این محصول دارای ${discountPercent}% تخفیف ویژه می‌باشد.`);
  }

  // Like info
  if (productData.LikeCount > 0) {
    description.push(`تاکنون ${toPersianDigits(productData.LikeCount.toString())} نفر این محصول را پسندیده‌اند.`);
  }

  return description.join(' ');
};

// Helper function to get available product images
const getProductImages = (productData) => {
  const images = [];

  const imageFields = [
    'ProductImageFileName',
    'FirstProductImageFileName',
    'SecondProductImageFileName',
    'ThirdProductImageFileName',
    'ForthProductImageFileName',
    'FifthProductImageFileName',
    'FeaturedProductImageFileName'
  ];

  imageFields.forEach(field => {
    if (productData[field] && productData[field] !== 'string' && productData[field] !== null) {
      images.push(`${appConfig.mobileApi}Product/GetProductImage/${productData[field]}`);
    }
  });

  // If no images found, return default image
  if (images.length === 0) {
    images.push(require("../../assets/sample_clothe.jpg"));
  }

  return images;
};

const ProductDetailsScreen = ({ route }) => {
  const navigation = useNavigation();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Toast states
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  // Image gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Like states
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const likeAnim = useRef(new Animated.Value(1)).current;
  const heartAnim = useRef(new Animated.Value(0)).current;

  // Rating states
  const [userDetailedRatings, setUserDetailedRatings] = useState({});
  const [dynamicRatingOptions, setDynamicRatingOptions] = useState([]);

  // Use custom hook for API
  const { data: productData, loading, error, fetchProductDetails, setData } = useProductDetails();

  // Enhanced parameter extraction with multiple fallback methods
  const getProductId = () => {
    console.log('Route params:', route?.params);

    // Method 1: Direct productId
    if (route?.params?.productId) {
      console.log('Found productId:', route.params.productId);
      return route.params.productId;
    }

    // Method 2: From productData object
    if (route?.params?.productData?.ProductId) {
      console.log('Found ProductId in productData:', route.params.productData.ProductId);
      return route.params.productData.ProductId;
    }

    // Method 3: Check for other possible parameter names
    if (route?.params?.product?.ProductId) {
      console.log('Found ProductId in product:', route.params.product.ProductId);
      return route.params.product.ProductId;
    }

    // Method 4: Check for id parameter
    if (route?.params?.id) {
      console.log('Found id:', route.params.id);
      return route.params.id;
    }

    console.error('No product ID found in route params');
    return null;
  };

  const productId = getProductId();

  useEffect(() => {
    if (productId) {
      console.log('Fetching product details for ID:', productId);
      fetchProductDetails(productId);
    } else {
      console.error('No product ID available for fetching details');
    }
  }, [productId]);

  // Initialize like count and rating options when product data is loaded
  useEffect(() => {
    if (productData) {
      console.log('Product Data received:', productData);
      console.log('Product LikeCount:', productData.LikeCount);
      console.log('Product IsMemberLiked:', productData.IsMemberLiked);

      setLikeCount(productData.LikeCount || 0);
      setIsLiked(productData.IsMemberLiked || false);

      const ratingOptions = transformContentReviewToRatingOptions(productData.ContentReviewItemList);
      setDynamicRatingOptions(ratingOptions);
      console.log('Dynamic Rating Options:', ratingOptions);
    }
  }, [productData]);

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
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

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

  // Toast helper function
  const showToast = (message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // Like functionality
  const handleLike = async () => {
    if (isLiking || !productData) return;

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
      const currentProductId = productId || productData.ProductId;
      console.log('Sending like request for product ID:', currentProductId);

      const response = await fetch(
        `${appConfig.mobileApi}Product/Like?id=${currentProductId}`,
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

  // Rating functionality
  const handleRatingChange = (newRating, detailedRatings = null) => {
    if (productData) {
      const updatedProductData = {
        ...productData,
        UserRating: newRating
      };

      if (detailedRatings) {
        updatedProductData.UserDetailedRatings = detailedRatings;
        setUserDetailedRatings(detailedRatings);
      }

      setData(updatedProductData);
    }

    if (detailedRatings) {
      const ratingTexts = Object.entries(detailedRatings).map(([key, value]) => {
        const option = (dynamicRatingOptions.length > 0 ? dynamicRatingOptions : [])
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

  // Show error toast when API call fails
  useEffect(() => {
    if (error) {
      showToast('خطا در دریافت اطلاعات محصول. لطفاً دوباره تلاش کنید.', 'error');
    }
  }, [error]);

  // Show loading skeleton while data is being fetched
  if (loading) {
    return <ProductDetailsSkeleton />;
  }

  // Show error state
  if (error && !productData) {
    return (
      <View style={styles.container}>
        <MainBackground />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.backButtonContainer}>
            <MaterialIcons name="arrow-forward" size={24} color="#6366f1" />
          </View>
        </TouchableOpacity>

        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={80} color="#9e9e9e" />
          <AppText style={styles.errorTitle}>خطا در دریافت اطلاعات</AppText>
          <AppText style={styles.errorSubtitle}>
            لطفاً اتصال اینترنت خود را بررسی کنید
          </AppText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => productId && fetchProductDetails(productId)}
          >
            <MaterialIcons name="refresh" size={20} color={colors.white} />
            <AppText style={styles.retryButtonText}>تلاش مجدد</AppText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // If no product data and no product ID, show error
  if (!productData && !productId) {
    return (
      <View style={styles.container}>
        <MainBackground />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.backButtonContainer}>
            <MaterialIcons name="arrow-forward" size={24} color="#6366f1" />
          </View>
        </TouchableOpacity>
        <View style={styles.errorContainer}>
          <MaterialIcons name="info" size={80} color="#9e9e9e" />
          <AppText style={styles.errorTitle}>محصول یافت نشد</AppText>
          <AppText style={styles.errorSubtitle}>
            اطلاعات محصول مورد نظر موجود نیست
          </AppText>
        </View>
      </View>
    );
  }

  // If still loading but we have productId, show skeleton
  if (!productData && productId) {
    return <ProductDetailsSkeleton />;
  }

  const getIconColor = (iconType) => {
    const iconColors = {
      'attach-money': modernColors.priceIcon,
      'person': modernColors.sellerIcon,
      'category': modernColors.categoryIcon,
      'check-circle': modernColors.success,
      'cancel': modernColors.error,
      'date-range': modernColors.dateIcon,
      'favorite': modernColors.likeIcon,
      'description': modernColors.info,
    };
    return iconColors[iconType] || modernColors.primary;
  };

  // Smart Detail Item Component
  const SmartDetailItem = ({ label, value, icon, maxLength = 30 }) => {
    console.log(`SmartDetailItem - Label: ${label}, Value: ${value}, Type: ${typeof value}`);

    if (!value || value === "نامشخص" || value === "تاریخ مشخص نشده") {
      console.log(`SmartDetailItem - ${label} hidden because value is empty or invalid`);
      return null;
    }

    const isLongText = value.length > maxLength;

    if (isLongText) {
      return (
        <View style={styles.detailItem}>
          <View style={styles.labelContainer}>
            <LinearGradient
              colors={[getIconColor(icon), getIconColor(icon) + 'CC']}
              style={styles.iconWrapper}
            >
              <MaterialIcons
                name={icon}
                size={22}
                color={modernColors.surface}
              />
            </LinearGradient>
            <AppText style={styles.label}>{label}</AppText>
          </View>

          <View style={styles.contentContainer}>
            <AppText style={styles.descriptionValue}>{value}</AppText>
          </View>
          <View style={[styles.featureAccent, { backgroundColor: getIconColor(icon) + "60" }]} />
        </View>
      );
    } else {
      return (
        <View style={styles.detailItem}>
          <View style={styles.rowContainer}>
            <View style={styles.labelContainer}>
              <LinearGradient
                colors={[getIconColor(icon), getIconColor(icon) + 'CC']}
                style={styles.iconWrapper}
              >
                <MaterialIcons
                  name={icon}
                  size={22}
                  color={modernColors.surface}
                />
              </LinearGradient>
              <AppText style={styles.label}>{label}</AppText>
            </View>
            <View style={styles.valueContainer}>
              <AppText style={styles.value}>{value}</AppText>
            </View>
          </View>
          <View style={[styles.featureAccent, { backgroundColor: getIconColor(icon) + "60" }]} />
        </View>
      );
    }
  };

  // Calculate discount percentage
  const discountPercentage = productData.SpecialSalePrice > 0 && productData.Price > 0
    ? Math.round(((productData.Price - productData.SpecialSalePrice) / productData.Price) * 100)
    : 0;

  // Get product images
  const productImages = getProductImages(productData);

  // Image gallery component
  const ImageGallery = ({ images, selectedIndex, onImageSelect }) => {
    const renderImageItem = ({ item, index }) => (
      <TouchableOpacity
        style={[
          styles.thumbnailContainer,
          selectedIndex === index && styles.selectedThumbnail
        ]}
        onPress={() => onImageSelect(index)}
      >
        <Image
          source={typeof item === 'string' ? { uri: item } : item}
          style={styles.thumbnailImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );

    return (
      <View style={styles.imageGalleryContainer}>
        <FlatList
          data={images}
          renderItem={renderImageItem}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailsContainer}
          ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
        />
      </View>
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        <MainBackground />

        {/* Toast Component */}
        <Toast
          visible={toastVisible}
          message={toastMessage}
          type={toastType}
          onHide={() => setToastVisible(false)}
        />

        {/* Floating Heart Animation */}
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

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <View style={styles.backButtonContainer}>
              <MaterialIcons name="arrow-forward" size={24} color="#6366f1" />
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
            <View style={styles.titleWrapper}>
              <AppText style={styles.headerTitle}>جزئیات محصول</AppText>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.imageHeaderContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Image
              style={styles.headerImage}
              source={typeof productImages[selectedImageIndex] === 'string'
                ? { uri: productImages[selectedImageIndex] }
                : productImages[selectedImageIndex]
              }
            />
            <LinearGradient
              colors={['transparent', 'rgba(102, 126, 234, 0.9)', 'rgba(118, 75, 162, 0.95)']}
              style={styles.overlay}
            >
              <View style={styles.titleBackground}>
                <AppText style={styles.productTitle}>
                  {toPersianDigits(safeString(productData.ProductName, "نام محصول مشخص نشده"))}
                </AppText>
                <View style={styles.statusChip}>
                  <MaterialIcons
                    name={productData.Active ? "check-circle" : "cancel"}
                    size={16}
                    color={modernColors.surface}
                  />
                  <AppText style={styles.statusText}>
                    {productData.Active ? "موجود" : "ناموجود"}
                  </AppText>
                </View>
              </View>
            </LinearGradient>

            {/* Discount Badge */}
            {discountPercentage > 0 && (
              <View style={styles.discountBadge}>
                <AppText style={styles.discountText}>
                  {toPersianDigits(discountPercentage.toString())}% تخفیف
                </AppText>
              </View>
            )}

            <View
              style={[
                styles.topLikeBadge,
                {
                  backgroundColor: isLiked ? 'rgba(233, 30, 99, 0.8)' : 'rgba(255, 255, 255, 0.8)',
           
                }
              ]}
            >
              <TouchableOpacity
                style={styles.topLikeContent}
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
                  styles.topLikeCount,
                  { color: isLiked ? "#ffffff" : "#e91e63" }
                ]}>
                  {toPersianDigits(likeCount.toString())}
                </AppText>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Image Gallery */}
          {productImages.length > 1 && (
            <Animated.View
              style={[
                styles.imageGalleryWrapper,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <ImageGallery
                images={productImages}
                selectedIndex={selectedImageIndex}
                onImageSelect={setSelectedImageIndex}
              />
            </Animated.View>
          )}

          {/* Product Info Section */}
          <Animated.View
            style={[
              styles.productInfoContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.priceSection}>
              {discountPercentage > 0 ? (
                <View style={styles.priceContainer}>
                  <AppText style={styles.originalPrice}>
                    {formatPrice(safeNumber(productData.Price))}
                  </AppText>
                  <AppText style={styles.specialPrice}>
                    {formatPrice(safeNumber(productData.SpecialSalePrice))}
                  </AppText>
                </View>
              ) : (
                <AppText style={styles.productPrice}>
                  {formatPrice(safeNumber(productData.Price))}
                </AppText>
              )}
            </View>
          </Animated.View>

          <Animated.View
            style={[styles.floatingDecoration2, { transform: [{ rotate: spin }] }]}
          />

          <Animated.View
            style={[
              styles.sectionTitleContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={['#E91E63', '#AD1457']}
              style={styles.sectionIconContainer}
            >
              <MaterialIcons name="info" size={26} color={modernColors.surface} />
            </LinearGradient>
            <AppText style={styles.sectionTitle}>مشخصات محصول</AppText>
            <View style={styles.sparkleContainer}>
              <MaterialIcons name="star-half" size={16} color="#FFD700" style={styles.sparkle1} />
              <MaterialIcons name="star-half" size={12} color="#FF6B6B" style={styles.sparkle2} />
            </View>
          </Animated.View>

          <Animated.View
            style={[styles.floatingDecoration1, { transform: [{ rotate: spin }] }]}
          />

          <Animated.View
            style={[
              styles.cardsContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <SmartDetailItem
              label="درباره این محصول"
              value={getProductDescription(productData)}
              icon="description"
              maxLength={50}
            />

            <SmartDetailItem
              label="فروشنده"
              value={safeString(productData.MemberName)}
              icon="person"
            />

            <SmartDetailItem
              label="دسته‌بندی"
              value={safeString(productData.ProductCategories) || "عمومی"}
              icon="category"
            />

            <SmartDetailItem
              label="وضعیت"
              value={productData.Active ? "موجود" : "ناموجود"}
              icon={productData.Active ? "check-circle" : "cancel"}
            />

            {/* Rating Section */}
            <View style={styles.detailItem}>
              <View style={styles.labelContainer}>
                <LinearGradient
                  colors={[modernColors.fashionGold, modernColors.fashionGold + 'CC']}
                  style={styles.iconWrapper}
                >
                  <MaterialIcons name="star" size={22} color={modernColors.surface} />
                </LinearGradient>
                <AppText style={styles.label}>امتیاز محصول</AppText>
              </View>

              <View style={styles.ratingSection}>
                <RatingComponent
                  initialRating={productData.UserRating}
                  averageRating={productData.AverageRating}
                  ratingCount={productData.RatingCount}
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
                  modalTitle="امتیاز دهی محصول"
                  submitButtonText="ثبت امتیاز"
                  cancelButtonText="لغو"
                />

                {/* نمایش میانگین امتیاز در هر بخش فقط اگر حداقل یک بخش امتیاز داشته باشد */}
                {dynamicRatingOptions.length > 0 &&
                  dynamicRatingOptions.some(option => option.averageRating != null && option.averageRating !== 0) && (
                    <View style={styles.detailedRatingsContainer}>
                      <AppText style={styles.detailedRatingsTitle}>میانگین امتیاز در هر بخش:</AppText>
                      {dynamicRatingOptions
                        .filter(option => option.averageRating != null && option.averageRating !== 0)
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
              <View style={[styles.featureAccent, { backgroundColor: modernColors.fashionGold + "60" }]} />
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.buttonsContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: pulseAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.primaryButton}
              disabled={!productData.Active}
            >
              <LinearGradient
                colors={productData.Active ?
                  ['#E91E63', '#AD1457', '#880E4F'] :
                  ['#9e9e9e', '#757575', '#616161']
                }
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <MaterialIcons name="shopping-cart" size={22} color="white" />
                <AppText style={styles.primaryButtonText}>
                  {productData.Active ? "افزودن به سبد خرید" : "محصول موجود نیست"}
                </AppText>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                style={styles.secondaryButtonGradient}
              >
                <MaterialIcons name="share" size={20} style={{ marginRight: 8 }} />
                <AppText style={styles.secondaryButtonText}>اشتراک گذاری محصول</AppText>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.decorativeElements}>
            <View style={styles.floatingElements}>
              <Animated.View style={[styles.star1, { transform: [{ rotate: spin }] }]}>
                <MaterialIcons name="star" size={22} color="rgba(255, 215, 0, 0.4)" />
              </Animated.View>
              <Animated.View style={[styles.star2, { transform: [{ rotate: spin }] }]}>
                <MaterialIcons name="auto-awesome" size={18} color="rgba(255, 107, 107, 0.4)" />
              </Animated.View>
              <Animated.View style={[styles.star3, { transform: [{ rotate: spin }] }]}>
                <MaterialIcons name="diamond" size={20} color="rgba(78, 205, 196, 0.4)" />
              </Animated.View>
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
    paddingTop: StatusBar.currentHeight + 35,
    paddingHorizontal: 20,
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
  floatingHeart: {
    position: 'absolute',
    top: height * 0.4,
    left: width * 0.5 - 25,
    zIndex: 1000,
    pointerEvents: 'none',
  },
  imageHeaderContainer: {
    position: 'relative',
    height: 320,
    margin: 20,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: modernColors.primary,
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    padding: 15,
    justifyContent: 'flex-end',
  },
  titleBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 20,
    padding: 20,
    backdropFilter: 'blur(15px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
  },
  productTitle: {
    fontSize: 24,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.surface,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 12,
    lineHeight: 32,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statusText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.surface,
    marginLeft: 6,
  },
  discountBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  discountText: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#fff',
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
  imageGalleryWrapper: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  imageGalleryContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.3)',
  },
  thumbnailsContainer: {
    paddingHorizontal: 10,
  },
  thumbnailContainer: {
    width: 70,
    height: 70,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedThumbnail: {
    borderColor: modernColors.primary,
    transform: [{ scale: 1.1 }],
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  productInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.3)',
  },
  priceSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  productPrice: {
    fontSize: 20,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.priceIcon,
    textAlign: 'right',
  },
  originalPrice: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#999',
    textAlign: 'right',
    textDecorationLine: 'line-through',
    marginBottom: 4,
  },
  specialPrice: {
    fontSize: 20,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#ff6b6b',
    textAlign: 'right',
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
  likeCountText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.dark,
    marginTop: 4,
    textAlign: 'center',
  },
  floatingDecoration1: {
    position: 'absolute',
    bottom: 50,
    right: 75,
  },
  floatingDecoration2: {
    position: 'absolute',
    top: 800,
    left: 100,
  },
  sectionTitleContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    marginTop: 10,
    position: "relative",
    paddingHorizontal: 20,
  },
  cardsContainer: {
    paddingHorizontal: 20,
  },
  sectionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
  },
  sparkleContainer: {
    position: "absolute",
    top: -10,
    right: -10,
  },
  sparkle1: {
    position: "absolute",
    top: 0,
    right: 90,
  },
  sparkle2: {
    position: "absolute",
    top: 350,
    right: 25,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
  },
  detailItem: {
    marginBottom: 14,
    backgroundColor: "rgba(248, 250, 252, 0.3)",
    backdropFilter: "blur(15px)",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(203, 213, 225, 0.4)",
    position: "relative",
    overflow: "hidden",
    marginHorizontal: 5,
  },
  // Skeleton styles
  detailItemSkeleton: {
    marginBottom: 14,
    backgroundColor: "rgba(248, 250, 252, 0.3)",
    backdropFilter: "blur(15px)",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(203, 213, 225, 0.4)",
    position: "relative",
    overflow: "hidden",
    marginHorizontal: 5,
  },
  skeletonRowContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  // Row container for label and value in same line
  rowContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  valueContainer: {
    flex: 1,
    paddingLeft: 15,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  label: {
    fontSize: 17,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
  },
  value: {
    fontSize: 16,
    color: "#374151",
    textAlign: 'left',
    lineHeight: 26,
    fontFamily: "Yekan_Bakh_Regular",
  },
  contentContainer: {
    paddingHorizontal: 15,
    marginTop: 15,
  },
  descriptionValue: {
    fontSize: 16,
    color: "#374151",
    textAlign: 'right',
    lineHeight: 26,
    fontFamily: "Yekan_Bakh_Regular",
  },
  featureAccent: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 6,
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  ratingSection: {
    marginTop: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  ratingComponent: {
    alignItems: 'flex-end',
  },
  detailedRatingsContainer: {
    marginTop: 15,
    backgroundColor: 'rgba(255, 248, 225, 0.5)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.1)',
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
    fontSize: 13,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
  },
  ratingRowStars: {
    marginLeft: 10,
  },
  buttonsContainer: {
    alignItems: "center",
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  primaryButton: {
    width: "92%",
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 20,
    marginBottom: 18,
    marginTop: 15,
  },
  buttonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 35,
  },
  primaryButtonText: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: "white",
    marginLeft: 12,
  },
  secondaryButton: {
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 2,
  },
  secondaryButtonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 35,
  },
  secondaryButtonText: {
    fontSize: 17,
    fontFamily: "Yekan_Bakh_Regular",
    textAlign: "center",
  },
  // Error state styles
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
    top: 600,
    left: 60,
  },
  star2: {
    position: "absolute",
    top: 800,
    right: 70,
  },
  star3: {
    position: "absolute",
    bottom: 100,
    left: 50,
  },
  bottomSpacer: {
    height: 30,
  },
});

export default ProductDetailsScreen;