import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
  StatusBar,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

import Ionicons from "@expo/vector-icons/Ionicons";
import colors from "../config/colors";
import AppText from "../components/Text";
import MainBackground from "../components/MainBackground";
import { toPersianDigits, safeNumber, formatPrice, safeString } from "../utils/converters";
import appConfig from "../config/config";
import { useMemberProfile } from "../config/useApi";

const { width } = Dimensions.get("window");

const PROFILE_CONSTANTS = {
  CIRCLE_WIDTH: 1800,
  CIRCLE_HEIGHT: 1800,
  AVATAR_SIZE: 120,
  AVATAR_OUTER_RING: 130,
  AVATAR_MIDDLE_RING: 125,
  BACK_BUTTON_TOP: 90,
  PROFILE_SECTION_TOP: 840,
  CIRCLE_MARGIN_TOP: -1600,
};

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
};

// Skeleton Component
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

// Profile Skeleton Components
const ProfileSkeleton = () => (
  <View style={styles.profileSection}>
    <View style={styles.avatarContainer}>
      <SkeletonLoader
        width={PROFILE_CONSTANTS.AVATAR_OUTER_RING}
        height={PROFILE_CONSTANTS.AVATAR_OUTER_RING}
        borderRadius={PROFILE_CONSTANTS.AVATAR_OUTER_RING / 2}
      />
    </View>
    <SkeletonLoader width={180} height={24} borderRadius={12} style={{ marginBottom: 8 }} />
    <SkeletonLoader width={120} height={16} borderRadius={20} />
  </View>
);

const InfoSectionSkeleton = ({ title }) => (
  <View style={styles.glassSection}>
    <View style={styles.sectionHeaderInfo}>
      <SkeletonLoader width={44} height={44} borderRadius={22} style={{ marginLeft: 12 }} />
      <SkeletonLoader width={100} height={18} borderRadius={9} />
    </View>
    <SkeletonLoader width="100%" height={16} style={{ marginBottom: 8 }} />
    <SkeletonLoader width="90%" height={16} style={{ marginBottom: 8 }} />
    <SkeletonLoader width="70%" height={16} />
  </View>
);

const ContactSkeleton = () => (
  <View style={styles.glassSection}>
    <View style={styles.sectionHeaderInfo}>
      <SkeletonLoader width={44} height={44} borderRadius={22} style={{ marginLeft: 12 }} />
      <SkeletonLoader width={120} height={18} borderRadius={9} />
    </View>
    <View style={styles.contactGrid}>
      {[1, 2, 3].map((item) => (
        <View key={item} style={styles.modernContactItem}>
          <SkeletonLoader width={44} height={44} borderRadius={22} style={{ marginLeft: 15 }} />
          <View style={styles.contactTextContainer}>
            <SkeletonLoader width={60} height={12} style={{ marginBottom: 4 }} />
            <SkeletonLoader width={120} height={15} />
          </View>
          <SkeletonLoader width={20} height={20} borderRadius={10} style={{ marginRight: 10 }} />
        </View>
      ))}
    </View>
  </View>
);

const QuickAccessSkeleton = () => {
  // در حالت skeleton 2 تا 4 آیتم نمایش داده می‌شود (تصادفی)
  const itemCount = Math.floor(Math.random() * 3) + 2; // 2, 3, یا 4

  return (
    <View style={styles.quickAccessContainer}>
      <View style={styles.quickAccessGrid}>
        {Array.from({ length: itemCount }).map((_, index) => (
          <View key={index} style={[styles.quickAccessItem, { backgroundColor: 'rgba(224, 224, 224, 0.15)' }]}>
            <SkeletonLoader width={24} height={24} borderRadius={12} style={{ marginBottom: 6 }} />
            <SkeletonLoader width={60} height={11} borderRadius={6} />
          </View>
        ))}
      </View>
    </View>
  );
};

const SectionSkeleton = ({ title, cardType = "portfolio" }) => (
  <View style={styles.sectionContainer}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleContainer}>
        <SkeletonLoader width={20} height={20} borderRadius={10} style={{ marginRight: 8 }} />
        <SkeletonLoader width={100} height={18} borderRadius={9} />
      </View>
      <SkeletonLoader width={80} height={14} borderRadius={7} />
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
      {[1, 2, 3].map((item) => (
        <View key={item} style={{ marginRight: 15 }}>
          {cardType === "portfolio" && <PortfolioCardSkeleton />}
          {cardType === "course" && <CourseCardSkeleton />}
          {cardType === "product" && <ProductCardSkeleton />}
          {cardType === "gallery" && <GalleryCardSkeleton />}
        </View>
      ))}
    </ScrollView>
  </View>
);

// Card Skeletons
const PortfolioCardSkeleton = () => (
  <View style={styles.portfolioCard}>
    <SkeletonLoader width="100%" height="100%" borderRadius={0} />
    <View style={[styles.portfolioOverlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
      <View style={styles.portfolioContent}>
        <SkeletonLoader width="80%" height={16} style={{ marginBottom: 5 }} />
        <SkeletonLoader width="60%" height={13} />
      </View>
    </View>
  </View>
);

const CourseCardSkeleton = () => (
  <View style={styles.courseCard}>
    <SkeletonLoader width="100%" height={140} borderRadius={0} />
    <View style={styles.courseContent}>
      <SkeletonLoader width="90%" height={16} style={{ marginBottom: 10 }} />
      <View style={styles.courseInfo}>
        <View style={styles.coursePrice}>
          <SkeletonLoader width={16} height={16} borderRadius={8} style={{ marginRight: 5 }} />
          <SkeletonLoader width={80} height={14} />
        </View>
        <View style={styles.courseStats}>
          <SkeletonLoader width={14} height={14} borderRadius={7} style={{ marginRight: 5 }} />
          <SkeletonLoader width={60} height={12} />
        </View>
      </View>
      <SkeletonLoader width={80} height={24} borderRadius={12} />
    </View>
  </View>
);

const ProductCardSkeleton = () => (
  <View style={styles.productCard}>
    <View style={styles.productImageContainer}>
      <SkeletonLoader width="100%" height="100%" borderRadius={0} />
    </View>
    <View style={styles.productContent}>
      <SkeletonLoader width="80%" height={16} style={{ marginBottom: 8, alignSelf: 'center' }} />
      <SkeletonLoader width="60%" height={14} style={{ alignSelf: 'center' }} />
    </View>
  </View>
);

const GalleryCardSkeleton = () => (
  <View style={styles.galleryCard}>
    <SkeletonLoader width="100%" height="100%" borderRadius={0} />
    <View style={styles.galleryOverlay}>
      <View style={styles.galleryLikes}>
        <SkeletonLoader width={16} height={16} borderRadius={8} style={{ marginRight: 4 }} />
        <SkeletonLoader width={20} height={11} />
      </View>
    </View>
  </View>
);

// Portfolio Card Component
const PortfolioCard = ({ item }) => (
  <TouchableOpacity style={styles.portfolioCard} activeOpacity={0.8}>
    <Image
      source={
        item.ImageFileName
          ? { uri: `${appConfig.mobileApi}Portfolio/GetImage/${item.ImageFileName}` }
          : require("../../assets/sample_clothe.jpg")
      }
      style={styles.portfolioImage}
    />
    <View style={styles.portfolioOverlay}>
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.portfolioGradient}
      >
        <View style={styles.portfolioContent}>
          <AppText style={styles.portfolioTitle} numberOfLines={2}>
            {safeString(item.Title, 'عنوان پروژه')}
          </AppText>
          <AppText style={styles.portfolioCategory}>
            {safeString(item.Category, 'دسته‌بندی')}
          </AppText>
        </View>
      </LinearGradient>
    </View>
  </TouchableOpacity>
);

// Course Card Component
const CourseCard = ({ item }) => (
  <TouchableOpacity style={styles.courseCard} activeOpacity={0.8}>
    <Image
      source={
        item.CourseImageFileName
          ? { uri: `${appConfig.mobileApi}Course/GetCourseImage/${item.CourseImageFileName}` }
          : require("../../assets/sample_clothe.jpg")
      }
      style={styles.courseImage}
    />
    <View style={styles.courseContent}>
      <AppText style={styles.courseTitle} numberOfLines={2}>
        {safeString(item.CourseName, 'نام دوره')}
      </AppText>
      <View style={styles.courseInfo}>
        <View style={styles.coursePrice}>
          <MaterialIcons name="attach-money" size={16} color={modernColors.success} />
          <AppText style={styles.coursePriceText}>
            {item.SpecialSalePrice && item.SpecialSalePrice > 0
              ? formatPrice(item.SpecialSalePrice)
              : formatPrice(item.Price)} تومان
          </AppText>
        </View>
        <View style={styles.courseStats}>
          <MaterialIcons name="location-on" size={14} color={modernColors.medium} />
          <AppText style={styles.courseStatsText}>
            {safeString(item.Location, 'محل برگزاری')}
          </AppText>
        </View>
      </View>
      <View style={[styles.statusBadge, {
        backgroundColor: item.Active ? modernColors.success + '20' : modernColors.error + '20'
      }]}>
        <AppText style={[styles.statusText, {
          color: item.Active ? modernColors.success : modernColors.error
        }]}>{item.ActiveStr}</AppText>
      </View>
    </View>
  </TouchableOpacity>
);

// Product Card Component
const ProductCard = ({ item }) => {
  const price = safeNumber(item.Price);
  const specialPrice = safeNumber(item.SpecialSalePrice);
  const discountPercentage = specialPrice > 0 && price > 0
    ? Math.round(((price - specialPrice) / price) * 100)
    : 0;

  return (
    <TouchableOpacity style={styles.productCard} activeOpacity={0.8}>
      <View style={styles.productImageContainer}>
        <Image
          source={
            item.ProductImageFileName
              ? { uri: `${appConfig.mobileApi}Product/GetProductImage/${item.ProductImageFileName}` }
              : require("../../assets/sample_clothe.jpg")
          }
          style={styles.productImage}
        />
        {discountPercentage > 0 && (
          <View style={styles.discountBadge}>
            <AppText style={styles.discountText}>
              {toPersianDigits(discountPercentage.toString())}% تخفیف
            </AppText>
          </View>
        )}
        {!item.Active && (
          <View style={styles.unavailableBadge}>
            <AppText style={styles.unavailableText}>ناموجود</AppText>
          </View>
        )}
      </View>
      <View style={styles.productContent}>
        <AppText style={styles.productTitle} numberOfLines={2}>
          {safeString(item.ProductName, 'نام محصول')}
        </AppText>
        <View style={styles.priceContainer}>
          {discountPercentage > 0 ? (
            <>
              <AppText style={styles.originalPrice}>{formatPrice(price)}</AppText>
              <AppText style={styles.specialPrice}>{formatPrice(specialPrice)}</AppText>
            </>
          ) : (
            <AppText style={styles.productPrice}>{formatPrice(price)}</AppText>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Gallery Card Component
const GalleryCard = ({ item }) => (
  <TouchableOpacity style={styles.galleryCard} activeOpacity={0.8}>
    <Image
      source={
        item.ImageFileName
          ? { uri: `${appConfig.mobileApi}ImageGallery/GetImage/${item.ImageFileName}` }
          : require("../../assets/sample_clothe.jpg")
      }
      style={styles.galleryImage}
    />
    <View style={styles.galleryOverlay}>
      <View style={styles.galleryLikes}>
        <MaterialIcons name="favorite" size={16} color="#ff4757" />
        <AppText style={styles.galleryLikesText}>
          {toPersianDigits(item.Likes?.toString() || '0')}
        </AppText>
      </View>
    </View>
  </TouchableOpacity>
);

// Contact Item Component
const ContactItem = ({ icon, text, type, onPress, shimmerAnim }) => (
  <TouchableOpacity
    style={styles.modernContactItem}
    activeOpacity={0.7}
    onPress={onPress}
  >
    <Animated.View style={[styles.contactIconContainer, {
      backgroundColor: type === 'email' ? modernColors.info + '20' :
        type === 'phone' ? modernColors.success + '20' :
          modernColors.warning + '20'
    }]}>
      <MaterialIcons
        name={icon}
        size={20}
        color={type === 'email' ? modernColors.info :
          type === 'phone' ? modernColors.success :
            modernColors.warning}
      />
    </Animated.View>

    <View style={styles.contactTextContainer}>
      <AppText style={styles.contactLabel}>
        {type === 'email' ? 'ایمیل' :
          type === 'phone' ? 'تلفن' : 'آدرس'}
      </AppText>
      <AppText style={styles.modernContactText}>{text}</AppText>
    </View>

    <View style={styles.contactArrow}>
      <MaterialIcons name="chevron-left" size={20} color={modernColors.medium} />
    </View>
  </TouchableOpacity>
);

const SectionHeader = ({ title, icon, color, onSeeAll, hasData = true }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionTitleContainer}>
      <MaterialIcons name={icon} size={20} color={color} />
      <AppText style={styles.sectionTitle}>{title}</AppText>
    </View>
    {hasData && (
      <TouchableOpacity onPress={onSeeAll}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialIcons name="chevron-left" size={20} color={modernColors.primary} />
          <AppText style={styles.seeAllText}>نمایش بیشتر</AppText>
        </View>
      </TouchableOpacity>
    )}
  </View>
);

const JustifiedText = ({ children, style }) => {
  if (Platform.OS === 'web') {
    return (
      <AppText style={[style, { textAlign: 'justify', textJustify: 'inter-word' }]}>
        {children}
      </AppText>
    );
  } else {
    return (
      <AppText style={[style, {
        textAlign: 'justify',
        letterSpacing: 0.2,
        lineHeight: style?.lineHeight || 28,
        direction: 'rtl',
      }]}>
        {children}
      </AppText>
    );
  }
};

const ExpandableText = ({ text, maxLines = 3 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMoreButton, setShowMoreButton] = useState(false);
  const [textReady, setTextReady] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    const averageCharsPerLine = 40;
    const estimatedLines = Math.ceil(text.length / averageCharsPerLine);

    if (estimatedLines > maxLines) {
      setShowMoreButton(true);
    }
    setTextReady(true);
  }, [text, maxLines]);

  const getTruncatedText = () => {
    const averageCharsPerLine = 40;
    const maxChars = averageCharsPerLine * maxLines;

    if (text.length <= maxChars) {
      return text;
    }

    let cutPoint = maxChars;
    while (cutPoint > 0 && text[cutPoint] !== ' ' && text[cutPoint] !== '\n') {
      cutPoint--;
    }

    return text.substring(0, cutPoint).trim();
  };

  if (!textReady) {
    return <JustifiedText style={styles.bioText}>{text}</JustifiedText>;
  }

  return (
    <View>
      {!isExpanded && showMoreButton ? (
        <View>
          <JustifiedText style={styles.bioText}>
            {getTruncatedText()}
            <AppText style={styles.ellipsisText}>...</AppText>
          </JustifiedText>

          <TouchableOpacity
            onPress={toggleExpanded}
            style={styles.showMoreButton}
            activeOpacity={0.7}
          >
            <AppText style={styles.showMoreText}>نمایش بیشتر</AppText>
            <MaterialIcons
              name="keyboard-arrow-down"
              size={16}
              color={modernColors.primary}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <JustifiedText style={styles.bioText}>
            {text}
          </JustifiedText>

          {showMoreButton && isExpanded && (
            <TouchableOpacity
              onPress={toggleExpanded}
              style={styles.showLessButton}
              activeOpacity={0.7}
            >
              <AppText style={styles.showLessText}>نمایش کمتر</AppText>
              <MaterialIcons
                name="keyboard-arrow-up"
                size={16}
                color={modernColors.primary}
              />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const ErrorState = ({ error, onRetry }) => (
  <View style={styles.errorContainer}>
    <MaterialIcons name="error-outline" size={48} color={modernColors.error} />
    <AppText style={styles.errorText}>{error}</AppText>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <MaterialIcons name="refresh" size={20} color={modernColors.surface} />
      <AppText style={styles.retryButtonText}>تلاش مجدد</AppText>
    </TouchableOpacity>
  </View>
);

const UserProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userData } = route.params || {};

  // Get member ID from the passed data
  const memberId = userData?.MemberId || userData?.id || null;

  // Fetch detailed member profile using the API
  const { data: memberProfile, loading, error, refetch } = useMemberProfile(memberId);

  // ScrollView and section refs
  const scrollViewRef = useRef(null);
  const portfolioRef = useRef(null);
  const coursesRef = useRef(null);
  const productsRef = useRef(null);
  const galleryRef = useRef(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const avatarGlowAnim = useRef(new Animated.Value(0)).current;

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
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(avatarGlowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(avatarGlowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Use memberProfile data if available, otherwise fallback to initial userData
  const user = memberProfile || userData || {
    MemberId: 0,
    Name: "کاربر ناشناس",
    MemberGroupsStr: "تعریف نشده",
    AboutMe: "اطلاعات بیوگرافی موجود نیست",
    Email: "example@email.com",
    Mobile: "09123456789",
    CityName: "تهران",
    ProvinceName: "ایران",
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const scrollToSection = (sectionRef) => {
    if (sectionRef.current && scrollViewRef.current) {
      sectionRef.current.measureLayout(
        scrollViewRef.current,
        (x, y) => {
          scrollViewRef.current.scrollTo({ y: y - 100, animated: true });
        },
        (error) => console.log('Error measuring layout:', error)
      );
    }
  };

  // محاسبه تعداد بخش‌هایی که داده دارند
  const hasData = {
    portfolio: user.PortfolioViewModelList && user.PortfolioViewModelList.length > 0,
    products: user.ProductViewModelList && user.ProductViewModelList.length > 0,
    courses: user.CourseViewModelList && user.CourseViewModelList.length > 0,
    gallery: user.ImageGalleryViewModelList && user.ImageGalleryViewModelList.length > 0
  };

  // شمارش بخش‌هایی که داده دارند
  const sectionsWithData = Object.values(hasData).filter(Boolean).length;

  // Quick Access فقط زمانی نمایش داده می‌شود که حداقل 2 بخش داده داشته باشند
  const shouldShowQuickAccess = sectionsWithData >= 2;

  const InfoSection = ({ icon, title, children, iconColor = modernColors.primary }) => (
    <View
      style={[
        styles.glassSection,
        {
          opacity: 1, // مقدار ثابت 1 به جای fadeAnim
        },
      ]}
    >
      <View style={styles.sectionHeaderInfo}>
        <LinearGradient
          colors={[iconColor, iconColor + 'CC']}
          style={styles.iconWrapper}
        >
          <MaterialIcons name={icon} size={22} color={modernColors.surface} />
        </LinearGradient>
        <AppText style={styles.sectionTitleInfo}>{title}</AppText>
      </View>
      {children}
      <View style={[styles.featureAccent, { backgroundColor: iconColor + "40" }]} />
    </View>
  );

  const renderPortfolioItem = ({ item }) => <PortfolioCard item={item} />;
  const renderCourseItem = ({ item }) => <CourseCard item={item} />;
  const renderProductItem = ({ item }) => <ProductCard item={item} />;
  const renderGalleryItem = ({ item }) => <GalleryCard item={item} />;

  // Show loading state with skeleton
  if (loading) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.container}>
          <MainBackground />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
          >
            {/* Half Circle Gradient */}
            <View style={styles.topHalfCircle}>
              <LinearGradient
                colors={[modernColors.primary, modernColors.primaryDark, modernColors.accent]}
                style={styles.halfCircleGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </View>

            {/* Back Button */}
            <View style={styles.backButtonContainer}>
              <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                <Ionicons name="arrow-forward" size={24} color={modernColors.surface} />
              </TouchableOpacity>
            </View>

            {/* Profile Skeleton */}
            <ProfileSkeleton />

            {/* About Me Skeleton */}
            <InfoSectionSkeleton title="درباره من" />

            {/* Contact Info Skeleton */}
            <ContactSkeleton />

            {/* Quick Access Skeleton */}
            <QuickAccessSkeleton />

            {/* Portfolio Skeleton */}
            <SectionSkeleton title="نمونه کارها" cardType="portfolio" />

            {/* Products Skeleton */}
            <SectionSkeleton title="محصولات" cardType="product" />

            {/* Courses Skeleton */}
            <SectionSkeleton title="دوره‌ها" cardType="course" />

            {/* Gallery Skeleton */}
            <SectionSkeleton title="گالری تصاویر" cardType="gallery" />

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </View>
      </>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={styles.container}>
        <MainBackground />
        <ErrorState error={error} onRetry={refetch} />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        <MainBackground />

        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {/* Half Circle Gradient at Top */}
          <Animated.View
            style={[
              styles.topHalfCircle,
              {
                opacity: 1,
                transform: [{ translateY: 0 }],
              },
            ]}
          >
            <LinearGradient
              colors={[modernColors.primary, modernColors.primaryDark, modernColors.accent]}
              style={styles.halfCircleGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>

          {/* Back Button */}
          <Animated.View
            style={[
              styles.backButtonContainer,
              {
                opacity: 1,
                transform: [{ translateY: 0 }],
              },
            ]}
          >
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <Ionicons name="arrow-forward" size={24} color={modernColors.surface} />
            </TouchableOpacity>
          </Animated.View>

          {/* Profile Section */}
          <Animated.View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Animated.View style={[
                styles.avatarGlowContainer,
                {
                  shadowOpacity: avatarGlowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.2, 0.6],
                  }),
                }
              ]}>
                <LinearGradient
                  colors={[modernColors.primary, modernColors.accent, modernColors.secondary, modernColors.tertiary]}
                  style={styles.avatarOuterRing}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.avatarMiddleRing}>
                    <View style={styles.avatarInnerContainer}>
                      <LinearGradient
                        colors={[modernColors.primary, modernColors.primaryDark]}
                        style={styles.defaultAvatar}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <MaterialCommunityIcons
                          name={user.Gender ? "face-man" : "face-woman"}
                          size={60}
                          color="white"
                        />
                        <View style={styles.avatarDecorations}>
                          <View style={styles.avatarStar1}>
                            <MaterialIcons name="star" size={12} color="rgba(255, 255, 255, 0.8)" />
                          </View>
                          <View style={styles.avatarStar2}>
                            <MaterialIcons name="auto-awesome" size={10} color="rgba(255, 255, 255, 0.6)" />
                          </View>
                        </View>
                      </LinearGradient>
                    </View>
                  </View>
                </LinearGradient>

                {/* Floating particles */}
                <Animated.View style={[
                  styles.floatingParticle1,
                  {
                    transform: [{
                      rotate: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      })
                    }]
                  }
                ]}>
                  <MaterialIcons name="star" size={8} color={modernColors.warning + 'AA'} />
                </Animated.View>

                <Animated.View style={[
                  styles.floatingParticle2,
                  {
                    transform: [{
                      rotate: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['360deg', '0deg'],
                      })
                    }]
                  }
                ]}>
                  <MaterialIcons name="auto-awesome" size={6} color={modernColors.tertiary + 'BB'} />
                </Animated.View>

                <Animated.View style={[
                  styles.floatingParticle3,
                  {
                    transform: [{
                      rotate: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      })
                    }]
                  }
                ]}>
                  <MaterialIcons name="diamond" size={7} color={modernColors.secondary + 'CC'} />
                </Animated.View>
              </Animated.View>
            </View>

            <AppText style={styles.userName}>{safeString(user.Name, 'کاربر ناشناس')}</AppText>
            <AppText style={styles.userProfession}>{safeString(user.MemberGroupsStr, 'تعریف نشده')}</AppText>
          </Animated.View>

          {!shouldShowQuickAccess && <View style={{ height: 50 }} />}

          {/* About Me Section */}
          <InfoSection icon="person" title="درباره من" iconColor={modernColors.info}>
            <ExpandableText text={safeString(user.AboutMe, 'اطلاعات بیوگرافی موجود نیست')} maxLines={3} />
          </InfoSection>

          {/* Contact Info */}
          <InfoSection icon="contact-phone" title="اطلاعات تماس" iconColor={modernColors.tertiary}>
            <View style={styles.contactGrid}>
              {user.Email && (
                <ContactItem
                  icon="email"
                  text={user.Email}
                  type="email"
                  shimmerAnim={shimmerAnim}
                  onPress={() => console.log('Open Email')}
                />
              )}

              {user.Mobile && (
                <ContactItem
                  icon="phone"
                  text={user.Mobile}
                  type="phone"
                  shimmerAnim={shimmerAnim}
                  onPress={() => console.log('Call Phone')}
                />
              )}

              {(user.CityName || user.ProvinceName) && (
                <ContactItem
                  icon="location-on"
                  text={`${safeString(user.CityName, '')}${user.CityName && user.ProvinceName ? '، ' : ''}${safeString(user.ProvinceName, '')}`}
                  type="location"
                  shimmerAnim={shimmerAnim}
                  onPress={() => console.log('Open Location')}
                />
              )}
            </View>
          </InfoSection>

          {/* Quick Access Menu - فقط در صورت وجود حداقل 2 بخش نمایش داده می‌شود */}
          {shouldShowQuickAccess && (
            <Animated.View
              style={[
                styles.quickAccessContainer,
                {
                  opacity: 1,
                  transform: [{ translateY: 0 }],
                },
              ]}
            >
              <View style={styles.quickAccessGrid}>
                {hasData.products && (
                  <TouchableOpacity
                    style={[styles.quickAccessItem, { backgroundColor: modernColors.accent + '15' }]}
                    onPress={() => scrollToSection(productsRef)}
                  >
                    <MaterialIcons name="shopping-bag" size={24} color={modernColors.accent} />
                    <AppText style={styles.quickAccessText}>محصولات</AppText>
                  </TouchableOpacity>
                )}

                {hasData.courses && (
                  <TouchableOpacity
                    style={[styles.quickAccessItem, { backgroundColor: modernColors.tertiary + '15' }]}
                    onPress={() => scrollToSection(coursesRef)}
                  >
                    <MaterialIcons name="school" size={24} color={modernColors.tertiary} />
                    <AppText style={styles.quickAccessText}>دوره‌ها</AppText>
                  </TouchableOpacity>
                )}

                {hasData.gallery && (
                  <TouchableOpacity
                    style={[styles.quickAccessItem, { backgroundColor: modernColors.error + '15' }]}
                    onPress={() => scrollToSection(galleryRef)}
                  >
                    <MaterialIcons name="photo-library" size={24} color={modernColors.error} />
                    <AppText style={styles.quickAccessText}>گالری</AppText>
                  </TouchableOpacity>
                )}

                {hasData.portfolio && (
                  <TouchableOpacity
                    style={[styles.quickAccessItem, { backgroundColor: modernColors.warning + '15' }]}
                    onPress={() => scrollToSection(portfolioRef)}
                  >
                    <MaterialIcons name="work" size={24} color={modernColors.warning} />
                    <AppText style={styles.quickAccessText}>نمونه کار</AppText>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          )}

          {/* Portfolio Section */}
          {hasData.portfolio && (
            <Animated.View
              ref={portfolioRef}
              style={[
                styles.sectionContainer,
                {
                  opacity: 1,
                  transform: [{ translateY: 0 }],
                },
              ]}
            >
              <SectionHeader
                title="نمونه کارها"
                icon="work"
                color={modernColors.secondary}
                hasData={user.PortfolioViewModelList.length > 0}
                onSeeAll={() => console.log("Portfolio See All")}
              />
              <FlatList
                data={user.PortfolioViewModelList}
                renderItem={renderPortfolioItem}
                keyExtractor={(item) => item.PortfolioId?.toString() || Math.random().toString()}
                horizontal
                inverted={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
                ItemSeparatorComponent={() => <View style={{ width: 15 }} />}
              />
            </Animated.View>
          )}

          {/* Products Section */}
          {hasData.products && (
            <Animated.View
              ref={productsRef}
              style={[
                styles.sectionContainer,
                {
                  opacity: 1,
                  transform: [{ translateY: 0 }],
                },
              ]}
            >
              <SectionHeader
                title="محصولات"
                icon="shopping-bag"
                color={modernColors.accent}
                hasData={user.ProductViewModelList.length > 0}
                onSeeAll={() => console.log("Products See All")}
              />
              <FlatList
                data={user.ProductViewModelList}
                renderItem={renderProductItem}
                keyExtractor={(item) => item.ProductId?.toString() || Math.random().toString()}
                horizontal
                inverted={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
                ItemSeparatorComponent={() => <View style={{ width: 15 }} />}
              />
            </Animated.View>
          )}

          {/* Courses Section */}
          {hasData.courses && (
            <Animated.View
              ref={coursesRef}
              style={[
                styles.sectionContainer,
                {
                  opacity: 1,
                  transform: [{ translateY: 0 }],
                },
              ]}
            >
              <SectionHeader
                title="دوره‌ها"
                icon="school"
                color={modernColors.tertiary}
                hasData={user.CourseViewModelList.length > 0}
                onSeeAll={() => console.log("Courses See All")}
              />
              <FlatList
                data={user.CourseViewModelList}
                renderItem={renderCourseItem}
                keyExtractor={(item) => item.CourseId?.toString() || Math.random().toString()}
                horizontal
                inverted={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
                ItemSeparatorComponent={() => <View style={{ width: 15 }} />}
              />
            </Animated.View>
          )}

          {/* Gallery Section */}
          {hasData.gallery && (
            <Animated.View
              ref={galleryRef}
              style={[
                styles.sectionContainer,
                {
                  opacity: 1,
                  transform: [{ translateY: 0 }],
                },
              ]}
            >
              <SectionHeader
                title="گالری تصاویر"
                icon="photo-library"
                color={modernColors.error}
                hasData={user.ImageGalleryViewModelList.length > 0}
                onSeeAll={() => console.log("Gallery See All")}
              />
              <FlatList
                data={user.ImageGalleryViewModelList}
                renderItem={renderGalleryItem}
                keyExtractor={(item) => item.ImageGalleryId?.toString() || Math.random().toString()}
                horizontal
                inverted={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
                ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
              />
            </Animated.View>
          )}

          {/* Decorative Elements */}
          <View style={styles.decorativeElements}>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.error,
    textAlign: 'center',
    marginVertical: 20,
    lineHeight: 24,
  },
  retryButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: modernColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.surface,
    marginRight: 8,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  topHalfCircle: {
    width: PROFILE_CONSTANTS.CIRCLE_WIDTH,
    height: PROFILE_CONSTANTS.CIRCLE_HEIGHT,
    alignSelf: 'center',
    marginTop: PROFILE_CONSTANTS.CIRCLE_MARGIN_TOP,
    marginBottom: -(PROFILE_CONSTANTS.CIRCLE_HEIGHT * 0.6),
    overflow: 'hidden',
    zIndex: 1,
    borderRadius: PROFILE_CONSTANTS.CIRCLE_WIDTH / 2,
  },
  halfCircleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: PROFILE_CONSTANTS.CIRCLE_WIDTH / 2,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 60,
  },
  backButtonContainer: {
    alignSelf: 'flex-end',
    marginBottom: 10,
    marginTop: PROFILE_CONSTANTS.BACK_BUTTON_TOP,
    zIndex: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileSection: {
    alignItems: "center",
    padding: 25,
    marginBottom: 30,
    marginTop: PROFILE_CONSTANTS.PROFILE_SECTION_TOP,
    zIndex: 2,
    position: 'relative',
  },
  avatarContainer: {
    marginBottom: 20,
    position: 'relative',
    zIndex: 3,
  },
  avatarGlowContainer: {
    position: 'relative',
    shadowColor: modernColors.primary,
  },
  avatarOuterRing: {
    width: PROFILE_CONSTANTS.AVATAR_OUTER_RING,
    height: PROFILE_CONSTANTS.AVATAR_OUTER_RING,
    borderRadius: PROFILE_CONSTANTS.AVATAR_OUTER_RING / 2,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarMiddleRing: {
    width: PROFILE_CONSTANTS.AVATAR_MIDDLE_RING,
    height: PROFILE_CONSTANTS.AVATAR_MIDDLE_RING,
    borderRadius: PROFILE_CONSTANTS.AVATAR_MIDDLE_RING / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInnerContainer: {
    width: PROFILE_CONSTANTS.AVATAR_SIZE,
    height: PROFILE_CONSTANTS.AVATAR_SIZE,
    borderRadius: PROFILE_CONSTANTS.AVATAR_SIZE / 2,
    overflow: 'hidden',
    position: 'relative',
  },
  defaultAvatar: {
    width: PROFILE_CONSTANTS.AVATAR_SIZE,
    height: PROFILE_CONSTANTS.AVATAR_SIZE,
    borderRadius: PROFILE_CONSTANTS.AVATAR_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    position: 'relative',
  },
  avatarDecorations: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  avatarStar1: {
    position: 'absolute',
    top: 12,
    right: 15,
  },
  avatarStar2: {
    position: 'absolute',
    bottom: 15,
    left: 12,
  },
  floatingParticle1: {
    position: 'absolute',
    top: -8,
    right: 15,
  },
  floatingParticle2: {
    position: 'absolute',
    bottom: 8,
    left: -4,
  },
  floatingParticle3: {
    position: 'absolute',
    top: 25,
    left: -12,
  },
  userName: {
    fontSize: 24,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.dark,
    marginBottom: 2,
    textAlign: 'center',
  },
  userProfession: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.medium,
    marginBottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 50,
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderColor: "rgba(255, 255, 255, 0.8)",
    borderWidth: 1,
    textAlign: 'center',
  },
  glassSection: {
    marginBottom: 15,
    backgroundColor: "rgba(248, 250, 252, 0.3)",
    backdropFilter: "blur(15px)",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(203, 213, 225, 0.4)",
    position: "relative",
    overflow: "hidden",
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  sectionHeaderInfo: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 15,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  sectionTitleInfo: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.dark,
  },
  bioText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.dark,
    lineHeight: 28,
    textAlign: "left",
    letterSpacing: 0.3,
    wordSpacing: 2,
    writingDirection: 'ltr',
    ...(Platform.OS === 'ios' && {
      writingDirection: 'rtl',
    }),
    ...(Platform.OS === 'android' && {
      includeFontPadding: false,
      textAlignVertical: 'center',
      writingDirection: 'rtl',
    }),
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
  ellipsisText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.medium,
  },
  showMoreButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 12,
  },
  showMoreText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.primary,
    marginLeft: 4,
  },
  showLessButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 12,
  },
  showLessText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.primary,
    marginLeft: 4,
  },
  contactGrid: {
    gap: 12,
  },
  modernContactItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    position: 'relative',
    overflow: 'hidden',
  },
  contactIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  contactTextContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  contactLabel: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.medium,
    marginBottom: 2,
  },
  modernContactText: {
    fontSize: 15,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.dark,
    textAlign: 'right',
  },
  contactArrow: {
    marginRight: 10,
    opacity: 0.6,
  },
  quickAccessContainer: {
    marginBottom: 25,
    paddingVertical: 10,
  },
  quickAccessGrid: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  quickAccessItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 18,
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  quickAccessText: {
    fontSize: 11,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.dark,
    marginTop: 6,
    textAlign: 'center',
  },
  quickAccessCount: {
    fontSize: 10,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.dark,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
    textAlign: 'center',
    minWidth: 20,
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    marginBottom: 15,
  },
  sectionTitleContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.dark,
    marginRight: 8,
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.primary,
  },
  horizontalList: {
    paddingHorizontal: 5,
  },
  portfolioCard: {
    width: 280,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: modernColors.surface,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  portfolioOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  portfolioGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  portfolioContent: {
    padding: 15,
  },
  portfolioTitle: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.surface,
    marginBottom: 5,
  },
  portfolioCategory: {
    fontSize: 13,
    fontFamily: "Yekan_Bakh_Regular",
    color: 'rgba(255, 255, 255, 0.8)',
  },
  courseCard: {
    width: 300,
    backgroundColor: modernColors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20
  },
  courseImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  courseContent: {
    padding: 15,
  },
  courseTitle: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.dark,
    marginBottom: 10,
  },
  courseInfo: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  coursePrice: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  coursePriceText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.success,
    marginRight: 5,
  },
  courseStats: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  courseStatsText: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.medium,
    marginRight: 5,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Bold",
  },
  productCard: {
    width: 180, // Increased from 160
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  productImageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1, // Makes the image square like in HomeScreen
    backgroundColor: '#f5f5f5',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productContent: {
    padding: 12,
    minHeight: 85, // Minimum height for content consistency
    justifyContent: 'space-between',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 10,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#fff',
  },
  unavailableBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unavailableText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#fff',
  },
  productTitle: {
    fontSize: 13,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
    lineHeight: 16,
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#667eea',
    textAlign: 'center',
  },
  originalPrice: {
    fontSize: 11,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#999',
    textAlign: 'center',
    textDecorationLine: 'line-through',
  },
  specialPrice: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#ff6b6b',
    textAlign: 'center',
  },
  galleryCard: {
    width: 120,
    height: 120,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: modernColors.surface,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
    marginBottom: 20
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  galleryOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  galleryLikes: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  galleryLikesText: {
    fontSize: 11,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.surface,
    marginRight: 4,
  },
  decorativeElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  star1: {
    position: "absolute",
    top: 300,
    left: 30,
  },
  star2: {
    position: "absolute",
    top: 600,
    right: 40,
  },
  star3: {
    position: "absolute",
    bottom: 200,
    left: 60,
  },
  bottomSpacer: {
    height: 50,
  },
});

export default UserProfileScreen;