import React, { useEffect, useRef, useState, useCallback ,memo} from "react";
import AppText from "../../components/Text";
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
  RefreshControl,
  Modal,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../../config/colors";
import MainBackground from "../../components/MainBackground";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Toast from "../../components/Toast";
import { formatPersianDate, formatPrice, safeString, safeNumber, toPersianDigits } from "../../utils/converters";
import MultiOptionRatingComponent, { StarDisplay } from "../../components/RatingComponent";
import appConfig from "../../config/config";
import { useAuth } from "../../contexts/AuthContext"; // Add this import
import { useMemo } from "react";
import { modernColors , styles } from "./styles/styles";
import { ProductDetailsSkeleton } from "./ui/ProductDetailsSkeleton";
import { transformContentReviewToRatingOptions } from "./utils/transformContentReviewToRatingOptions";
import useToast from "../../hooks/useToast";
import ProductImage from "./ui/ProductImage";

const { width } = Dimensions.get('window');





// Custom hook for product details API
const useProductDetails = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

    const { user } = useAuth(); // Add this line
  const currentMemberId = user?.MemberId || user?.memberId || null;

  const fetchProductDetails = async (productId) => {
    try {
      setLoading(true);
      setError(null);


      const response = await fetch(
        `${appConfig.mobileApi}Product/Get?productId=${productId}&currentMemberId=${currentMemberId}`
      );


      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
            console.log('API Response Status:', result);


      // Transform the data to include necessary fields
      const transformedData = {
        ...result.Product,
        IsMemberLiked: result.IsMemberLiked || false,
        ContentReviewItemList: result.ContentReviewItemList || [],
        LikeCount: result.Product?.LikeCount || 0,
        AverageRating: result.Product?.Rating || 0,
        RatingCount: 0,
        UserRating: 0,
        UserDetailedRatings: {},
        DetailedRatingsAverages: {}
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
    fetchProductDetails,
    setData,
  };
};

const ProductDetailsScreen = ({ route }) => {

  const getProductImages = (productData) => {
  if (!productData) {
    return [require("../../../assets/Product_icon.jpg")];
  }

  const imageUrlFields = [
    "FeaturedImageURL",
    "FirstImageURL",
    "SecondImageURL",
    "ThirdImageURL",
    "FourthImageURL",
    "FifthImageURL",
  ];

  const images = imageUrlFields
    .map((field) => productData[field])
    .filter(
      (url) =>
        typeof url === "string" &&
        url !== "string" &&
        url.trim() !== ""
    );

  return images.length > 0
    ? images
    : [require("../../../assets/Product_icon.jpg")];
};

  const navigation = useNavigation();
  const {showToast,toastMessage,toastVisible,setToastVisible,toastType}=useToast()

  const { user } = useAuth(); // Add this line
  const currentMemberId = user?.MemberId || user?.memberId || null;

  const [selectedImageForDisplay, setSelectedImageForDisplay] = useState(0);


  // Image gallery state - Enhanced for scrolling
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Like states
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const heartAnim = useRef(new Animated.Value(0)).current;

  // Rating states
  const [userDetailedRatings, setUserDetailedRatings] = useState({});
  const [dynamicRatingOptions, setDynamicRatingOptions] = useState([]);

  // Modal states
  const [refreshing, setRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const modalSlideAnim = useRef(new Animated.Value(0)).current;
  const modalBackdropAnim = useRef(new Animated.Value(0)).current;
  const deleteModalSlideAnim = useRef(new Animated.Value(0)).current;
  const deleteModalBackdropAnim = useRef(new Animated.Value(0)).current;

  // Use custom hook for API
  const { data: productData, loading, error, fetchProductDetails, setData } = useProductDetails();

  // Enhanced parameter extraction with multiple fallback methods
  const getProductId = () => {

    // Method 1: Direct productId
    if (route?.params?.productId) {
      return route.params.productId;
    }

    // Method 2: From productData object
    if (route?.params?.productData?.ProductId) {
      return route.params.productData.ProductId;
    }

    // Method 3: Check for other possible parameter names
    if (route?.params?.product?.ProductId) {
      return route.params.product.ProductId;
    }

    // Method 4: Check for id parameter
    if (route?.params?.id) {
      return route.params.id;
    }

    return null;
  };

  const productId = getProductId();

  // useFocusEffect for fetching data
  useFocusEffect(
    useCallback(() => {
      if (productId) {
        fetchProductDetails(productId);
      } else {
      }
    }, [productId])
  );

  // Initialize like count and rating options when product data is loaded
  useEffect(() => {
    if (productData) {


      setLikeCount(productData.LikeCount || 0);
      setIsLiked(productData.IsMemberLiked || false);
      console.log(productData.IsMemberLiked, productData.LikeCount, 'Initial like state and count');

      const ratingOptions = transformContentReviewToRatingOptions(productData.ContentReviewItemList);
      setDynamicRatingOptions(ratingOptions);

      // Reset image index when new product loads
      setCurrentImageIndex(0);
      setSelectedImageIndex(0);
    }
  }, [productData]);



  // Show error toast when API call fails
  useEffect(() => {
    if (error) {
      showToast('خطا در دریافت اطلاعات محصول. لطفاً دوباره تلاش کنید.', 'error');
    }
  }, [error]);

  const handleThumbnailPress = (index) => {
    setCurrentImageIndex(index);
    setSelectedImageIndex(index);
    setSelectedImageForDisplay(index);

    // اسکرول کردن به تصویر انتخاب شده در ScrollView اصلی
    if (mainImageScrollRef.current) {
      mainImageScrollRef.current.scrollTo({
        x: index * (width - 40),
        animated: true
      });
    }
  };
  const mainImageScrollRef = useRef(null);
  // Refresh functionality
  const onRefresh = async () => {
    setRefreshing(true);
    if (productId) {
      await fetchProductDetails(productId);
    }
    setRefreshing(false);
  };

  
  const renderMainImages = () => {
    const productImages = getProductImages(productData);
    const isDefaultImage = productImages.length === 1 &&
      productImages[0] === require("../../../assets/Product_icon.jpg");

    const handleImagePress = (index) => {
      setModalImageIndex(index);
      setImageModalVisible(true);
    };

    if (productImages.length > 1 && !isDefaultImage) {
      return (
        <>
          <ScrollView
            ref={mainImageScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            style={styles.imageScrollView}
            onMomentumScrollEnd={handleImageScroll}
            scrollEventThrottle={16}
          >
            {productImages.map((image, index) => (
              <TouchableOpacity
                key={index}
                style={styles.imageSlide}
                onPress={() => handleImagePress(index)}
                activeOpacity={0.95}
              >
                <ProductImage
                  source={image}
                  style={styles.headerImageSquare}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* گرادیانت فقط روی تصویر اول */}
          {currentImageIndex === 0 && (
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
                    {productData.Active ? "فعال" : "غیرفعال"}
                  </AppText>
                </View>
              </View>
            </LinearGradient>
          )}

          <View style={styles.imageDots}>
            {productImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.imageDot,
                  index === currentImageIndex && styles.imageDotActive
                ]}
              />
            ))}
          </View>
        </>
      );
    } else {
      return (
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => handleImagePress(0)}
          activeOpacity={0.95}
        >
          <ProductImage
            source={productImages[0]}
            style={styles.headerImageSquare}
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    }
  };

  const ImageGallery = ({ images, selectedIndex, onImageSelect }) => {
    const renderImageItem = ({ item, index }) => {
      return (
        <TouchableOpacity
          style={[
            styles.thumbnailContainer,
            selectedIndex === index && styles.selectedThumbnail
          ]}
          onPress={() => handleThumbnailPress(index)}
          activeOpacity={0.7}
        >
          <ProductImage
            source={item}
            style={styles.thumbnailImageSquare} // استفاده از style مربعی
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    };

    const displayImages = images.filter(img =>
      img !== require("../../../assets/Product_icon.jpg") || images.length === 1
    );

    if (displayImages.length <= 1) {
      return null;
    }

    return (
      <View style={styles.imageGalleryContainer}>
        <FlatList
          data={displayImages}
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


  // Check if current user owns the product
  const isOwnProduct = productData && currentMemberId && productData.MemberId === currentMemberId;

  // Handle image scroll for main gallery
  const handleImageScroll = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / (width - 40));
    const productImages = getProductImages(productData);

    if (slideIndex >= 0 && slideIndex < productImages.length) {
      setCurrentImageIndex(slideIndex);
    }
  };

  // Modal functions
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

  const handleEditProduct = () => {
    navigation.navigate("AddProduct", {
      isEdit: true,
      productData: productData
    });
  };

  const handleDeleteProduct = () => {
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

  const confirmDeleteProduct = async () => {
    handleCloseDeleteModal();

    try {
      setIsDeleting(true);

      const response = await fetch(`${appConfig.mobileApi}Product/Delete?productId=${productData.ProductId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast('محصول با موفقیت حذف شد', 'success');
          navigation.navigate("App", { screen: "MyProduct" });

      } else {
        const errorData = await response.json();
        throw new Error(errorData.Message || 'خطا در حذف محصول');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      showToast(error.message || 'خطا در حذف محصول', 'error');
    } finally {
      setIsDeleting(false);
    }
  };


  const handleLike = async () => {
    if (isLiking || !productData || !currentMemberId) return;

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
        Animated.timing(heartAnim, {
          toValue: 0.3,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(heartAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
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


      const response = await fetch(
        `${appConfig.mobileApi}Product/Like?id=${currentProductId}&memberId=${currentMemberId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );


      if (!response.ok) {
        showToast("خطا در لایک محصول")
      }

      const result = await response.json();

    } catch (error) {

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
      setUserDetailedRatings(detailedRatings);
    }
  };

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

    if (!value || value === "نامشخص" || value === "تاریخ مشخص نشده") {
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[modernColors.primary]}
              tintColor={modernColors.primary}
            />
          }
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <View style={styles.backButtonContainer}>
              <MaterialIcons name="arrow-forward" size={24} color="#6366f1" />
            </View>
          </TouchableOpacity>

          {/* Menu Button for Own Products */}
          {isOwnProduct && !loading && (
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

          <View
            style={[
              styles.headerContainer,
            ]}
          >
            <View style={styles.titleWrapper}>
              <AppText style={styles.headerTitle}>جزئیات محصول</AppText>
            </View>
          </View>

          {/* Enhanced Image Header Container with Scrolling */}
          <View
            style={[
              styles.imageHeaderContainer, // استفاده از style مربعی
            ]}
          >
            {renderMainImages()}


            {/* Discount Badge */}
            {discountPercentage > 0 && (
              <View style={styles.discountBadge}>
                <AppText style={styles.discountText}>
                  {toPersianDigits(discountPercentage.toString())}% تخفیف
                </AppText>
              </View>
            )}

            {/* Owner Badge - positioned based on discount availability */}
            {isOwnProduct && (
              <View style={[
                discountPercentage > 0 ? styles.ownerBadgeWithDiscount : styles.ownerBadge,
                { backgroundColor: productData.Active ? modernColors.success : modernColors.warning }
              ]}>
                <AppText style={styles.ownerText}>
                  {productData.Active ? 'منتشر شده' : 'پیش‌نویس'}
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
          </View>

          {/* Thumbnail Gallery - Show only if multiple images exist */}
          {productImages.length > 1 && (
            <View
              style={[
                styles.imageGalleryWrapper,
              ]}
            >
              <ImageGallery
                images={productImages}
                selectedIndex={currentImageIndex}
                onImageSelect={handleThumbnailPress} // استفاده از تابع جدید
              />
            </View>
          )}

          {/* Product Info Section */}
          <View
            style={[
              styles.productInfoContainer, // استفاده از style جدید
            ]}
          >
            <View style={styles.priceSection}>
              {discountPercentage > 0 ? (
                <View style={styles.priceInOverlay}>
                  <AppText style={styles.originalPriceOverlay}>
                    {formatPrice(safeNumber(productData.Price))}
                  </AppText>
                  <AppText style={styles.specialPriceOverlay}>
                    {formatPrice(safeNumber(productData.SpecialSalePrice))}
                  </AppText>
                </View>
              ) : (
                <View style={styles.priceContainer}>
                  <AppText style={styles.productPrice}>
                    {formatPrice(safeNumber(productData.Price))}
                  </AppText>
                </View>
              )}
            </View>
          </View>


          <View
            style={[
              styles.sectionTitleContainer,
            ]}
          >
            <LinearGradient
              colors={['#E91E63', '#AD1457']}
              style={styles.sectionIconContainer}
            >
              <MaterialIcons name="info" size={26} color={modernColors.surface} />
            </LinearGradient>
            <AppText style={styles.sectionTitle}>مشخصات محصول</AppText>
          </View>



          <View
            style={[
              styles.cardsContainer,
            ]}
          >
            <SmartDetailItem
              label="درباره این محصول"
              value={safeString(productData.Description)}
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
              value={productData.Active ? "فعال" : "غیرفعال"}
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
                <MultiOptionRatingComponent
                  contentId={productData.ProductId}
                  averageRating={productData.AverageRating}
                  ratingCount={productData.RatingCount}
                  initialRating={productData.UserRating || 0}
                  initialDetailedRatings={userDetailedRatings}
                  maxStars={5}
                  size={24}
                  starColor={modernColors.fashionGold}
                  enableMultipleOptions={true}
                  ratingOptions={dynamicRatingOptions}
                  modalTitle="امتیازدهی محصول"
                  submitButtonText="ثبت امتیاز"
                  cancelButtonText="لغو"
                  showRatingCount={true}
                  showRatingText={true}
                  animated={true}
                  allowHalfStars={false}
                  onRatingSubmitted={(result) => {

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
                  onRatingChange={handleRatingChange}
                  style={styles.ratingComponent}
                />

                {/* User's detailed ratings */}
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

                {/* Average ratings from other users */}
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
              <View style={[styles.featureAccent, { backgroundColor: modernColors.fashionGold + "60" }]} />
            </View>
          </View>

 

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Action Modal */}
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
                <AppText style={styles.modalTitle}>عملیات محصول</AppText>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalActionItem}
                  onPress={() => {
                    handleCloseModal();
                    setTimeout(() => {
                      handleEditProduct();
                    }, 300);
                  }}
                >
                  <View style={styles.modalActionContent}>
                    <View style={[styles.modalActionIcon, { backgroundColor: modernColors.info }]}>
                      <MaterialIcons name="edit" size={22} color="#ffffff" />
                    </View>
                    <View style={styles.modalActionText}>
                      <AppText style={styles.modalActionTitle}>ویرایش محصول</AppText>
                      <AppText style={styles.modalActionSubtitle}>ویرایش نام، قیمت و مشخصات محصول</AppText>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalActionItem}
                  onPress={handleDeleteProduct}
                  disabled={isDeleting}
                >
                  <View style={styles.modalActionContent}>
                    <View style={[styles.modalActionIcon, { backgroundColor: modernColors.error }]}>
                      <MaterialIcons name="delete" size={22} color="#ffffff" />
                    </View>
                    <View style={styles.modalActionText}>
                      <AppText style={styles.modalActionTitle}>حذف محصول</AppText>
                      <AppText style={styles.modalActionSubtitle}>حذف کامل محصول از سیستم</AppText>
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

        {/* Delete Confirmation Modal */}
        <Modal
          visible={showDeleteConfirmModal}
          transparent={true}
          animationType="none"
          onRequestClose={handleCloseDeleteModal}
        >
          <View style={styles.modalContainer}>
            <View
              style={[
                styles.modalBackdrop,
              ]}
            >
              <TouchableOpacity
                style={styles.backdropTouchable}
                onPress={handleCloseDeleteModal}
                activeOpacity={1}
              />
            </View>

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
                  آیا از حذف این محصول اطمینان دارید؟{'\n'}
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
                    onPress={confirmDeleteProduct}
                    disabled={isDeleting}
                  >
                    <LinearGradient
                      colors={[modernColors.error, '#c0392b']}
                      style={styles.confirmDeleteGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      {isDeleting ? (
                        <ActivityIndicator size="small" color="#ffffff" />
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
        {/* Image Viewer Modal */}
        <Modal
          visible={imageModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setImageModalVisible(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' }}>

            {/* دکمه بستن */}
            <TouchableOpacity
              style={{ position: 'absolute', top: StatusBar.currentHeight + 20, right: 20, zIndex: 10 }}
              onPress={() => setImageModalVisible(false)}
            >
              <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 22, width: 44, height: 44, justifyContent: 'center', alignItems: 'center' }}>
                <MaterialIcons name="close" size={24} color="#ffffff" />
              </View>
            </TouchableOpacity>

            {/* تصویر وسط‌چین */}
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                contentOffset={{ x: modalImageIndex * width, y: 0 }}
                style={{ flexGrow: 0 }}
              >
                {getProductImages(productData).map((image, index) => (
                  <View key={index} style={{ width, height: width, justifyContent: 'center', alignItems: 'center' }}>
                    <ProductImage
                      source={image}
                      style={{ width: width, height: width }}
                      resizeMode="contain"
                    />
                  </View>
                ))}
              </ScrollView>
            </View>

          </View>
        </Modal>
      </View>
    </>
  );
};

export default ProductDetailsScreen;