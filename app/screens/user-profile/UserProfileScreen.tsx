import React, { useEffect, useRef, useState ,memo, useCallback} from "react";
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
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Linking } from 'react-native';
import Toast from "../../components/Toast";
import Ionicons from "@expo/vector-icons/Ionicons";
import colors from "../../config/colors";
import AppText from "../../components/Text";
import MainBackground from "../../components/MainBackground";
import { toPersianDigits, safeNumber, formatPrice, safeString } from "../../utils/converters";
import appConfig from "../../config/config";
import { useMemberProfile } from "../../config/useApi";
import { VideoView } from 'expo-video';
import { useVideoPlayer } from 'expo-video';
import { useAuth } from "../../contexts/AuthContext";
import { styles ,modernColors,PROFILE_CONSTANTS } from "./styles/styles";
import { LikeButton } from "./ui/LikeButton";
import { VideoSection } from "./ui/VideoSection";
import { ProfileSkeleton } from "./ui/ProfileSkeleton";
import { InfoSectionSkeleton } from "./ui/InfoSectionSkeleton";
import { ContactSkeleton } from "./ui/ContactSkeleton";
import { QuickAccessSkeleton } from "./ui/QuickAccessSkeleton";
import { SectionSkeleton } from "./ui/SectionSkeleton";
import { SkeletonLoader } from "./ui/SkeletonLoader";
import { PortfolioCard } from "./ui/PortfolioCard";


const CourseCard =memo( ({ item, onPress }:any) => (
  <TouchableOpacity style={styles.courseCard} activeOpacity={0.8} onPress={() => onPress(item)}>
    <Image
      source={
        item.CourseImageFileName
          ? { uri: `${appConfig.mobileApi}Course/GetCourseImage/${item.CourseImageFileName}` }
          : item.FeaturedImageURL
            ? { uri: item.FeaturedImageURL }
            : require("../../../assets/new_course.jpg")
      }
      style={styles.courseImage}
    />
    <View style={styles.courseContent}>
      <AppText style={styles.courseTitle} numberOfLines={2}>
        {safeString(item.CourseName, 'نام دوره')}
      </AppText>
      <View style={styles.courseInfo}>
        <View style={styles.coursePrice}>

          <AppText style={styles.coursePriceText}>
            {item.SpecialSalePrice && item.SpecialSalePrice > 0
              ? formatPrice(item.SpecialSalePrice)
              : item.Price && item.Price > 0
                ? formatPrice(item.Price)
                : item.RegisterAmount && item.RegisterAmount > 0
                  ? formatPrice(item.RegisterAmount)
                  : 'رایگان'}
          </AppText>
        </View>
      </View>
    </View>
  </TouchableOpacity>
));

const ProductCard = memo(({ item, onPress }:any) => {
  const price = safeNumber(item.Price);
  const specialPrice = safeNumber(item.SpecialSalePrice);
  const discountPercentage = specialPrice > 0 && price > 0
    ? Math.round(((price - specialPrice) / price) * 100)
    : 0;

  return (
    <TouchableOpacity style={styles.productCard} activeOpacity={0.8} onPress={() => onPress(item)}>
      <View style={styles.productImageContainer}>
        <Image
          source={
            item.ProductImageFileName
              ? { uri: `${appConfig.mobileApi}Product/GetProductImage/${item.ProductImageFileName}` }
              : item.FeaturedImageURL
                ? { uri: item.FeaturedImageURL }
                : require("../../../assets/Product_icon.jpg")
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
});

const GalleryCard = memo(({ item, onPress }:any) => (
  <TouchableOpacity style={styles.galleryCard} activeOpacity={0.8} onPress={() => onPress(item)}>
    <Image
      source={
        item.ImageFileName
          ? { uri: `${appConfig.mobileApi}ImageGallery/GetImage/${item.ImageFileName}` }
          : item.FeaturedImageURL
            ? { uri: item.FeaturedImageURL }
            : require("../../../assets/main-icon.png")
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
));

const BlogImageComponent = memo(({ item }:any) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const hasValidImage = item.FeaturedImageFileName &&
    item.FeaturedImageURL &&
    !item.FeaturedImageURL.endsWith('/');

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  if (!hasValidImage || imageError) {
    return (
      <View style={styles.blogImagePlaceholder}>
        <Image
          style={styles.postImage}
          source={require("../../../assets/blogPost_icon.jpg")}
        />
      </View>
    );
  }

  return (
    <View style={styles.blogImageContainer}>
      {imageLoading && (
        <View style={[styles.blogImagePlaceholder, { position: 'absolute', zIndex: 1 }]}>
          <MaterialIcons name="article" size={40} color="#ccc" />
        </View>
      )}
      <Image
        source={{ uri: item.FeaturedImageURL }}
        style={styles.blogImage}
        onError={handleImageError}
        onLoad={handleImageLoad}
        resizeMode="cover"
      />
    </View>
  );
});

const BlogPostCard = memo(({ item, onPress }:any) => (
  <TouchableOpacity style={styles.blogCard} activeOpacity={0.8} onPress={() => onPress(item)}>
    <BlogImageComponent item={item} />
    <View style={styles.blogContent}>
      <AppText style={styles.blogTitle} numberOfLines={2}>
        {safeString(item.Title, 'عنوان مقاله')}
      </AppText>
      <View style={styles.blogMeta}>
        <View style={styles.dateContainer}>
          <MaterialIcons name="calendar-month" size={16} color="#666" />
          <AppText style={styles.dateText}>
            {toPersianDigits(item.ShamsiInsertDate || '')}
          </AppText>
        </View>
        <View style={styles.likeContainer}>
          <MaterialIcons name="favorite" size={16} color="#ff6b6b" />
          <AppText style={styles.likeText}>
            {toPersianDigits((item.LikeCount || 0).toString())}
          </AppText>
        </View>
      </View>
    </View>
  </TouchableOpacity>
));

const ContactItem = memo(({ icon, text, type, onPress, shimmerAnim }:any) => {
  const getIconColor = () => {
    switch (type) {
      case 'email': return modernColors.info;
      case 'phone': return modernColors.success;
      case 'whatsapp': return '#25D366';
      case 'instagram': return '#E4405F';
      case 'location': return modernColors.warning;
      default: return modernColors.medium;
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'email': return 'ایمیل';
      case 'phone': return 'تلفن';
      case 'whatsapp': return 'واتساپ';
      case 'telegram': return 'تلگرام';
      case 'mobile': return 'موبایل';
      case 'instagram': return 'اینستاگرام';
      case 'location': return 'آدرس';
      case 'website': return 'وبسایت';
      default: return '';
    }
  };

  const iconColor = getIconColor();

  return (
    <TouchableOpacity
      style={styles.modernContactItem}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Animated.View style={[styles.contactIconContainer, {
        backgroundColor: iconColor + '20'
      }]}>
        <MaterialIcons
          name={icon}
          size={20}
          color={iconColor}
        />
      </Animated.View>

      <View style={styles.contactTextContainer}>
        <AppText style={styles.contactLabel}>
          {getLabel()}
        </AppText>
        <AppText style={styles.modernContactText}>{text}</AppText>
      </View>

      <View style={styles.contactArrow}>
        <MaterialIcons name="chevron-left" size={20} color={modernColors.medium} />
      </View>
    </TouchableOpacity>
  );
});


const SectionHeader = ({ title, icon, color, onSeeAll, hasData = true }:any) => (
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

const JustifiedText = ({ children, style }:any) => {
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

const ExpandableText = ({ text, maxLines = 3 }:any) => {
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
    return (
      <View style={{ minHeight: 80, position: 'relative', zIndex: 1 }}>
        <JustifiedText style={styles.bioText}>{text}</JustifiedText>
      </View>
    );
  }

  return (
    <View style={{ position: 'relative', zIndex: 1 }}>
      {!isExpanded && showMoreButton ? (
        <View>
          <JustifiedText style={[styles.bioText, { marginBottom: 15 }]}>
            {getTruncatedText()}
            <AppText style={styles.ellipsisText}>...</AppText>
          </JustifiedText>

          <TouchableOpacity
            onPress={toggleExpanded}
            style={[styles.showMoreButton, { marginBottom: 10 }]}
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
          <JustifiedText style={[styles.bioText, { marginBottom: 15 }]}>
            {text}
          </JustifiedText>

          {showMoreButton && isExpanded && (
            <TouchableOpacity
              onPress={toggleExpanded}
              style={[styles.showLessButton, { marginBottom: 10 }]}
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

const ErrorState = ({ error, onRetry }:any) => (
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
  const { user } = useAuth(); 

  const memberId = userData?.MemberId || null;
  const currentMemberId = user?.MemberId // ✅ ID کاربر فعلی

  // ✅ ارسال currentMemberId به API
  const { data: memberProfile, loading, error, refetch } = useMemberProfile(memberId, currentMemberId);

  const handleContactPress = async (type, value) => {
    try {
      switch (type) {
        case 'phone':
          const cleanNumber = value.replace(/\s+/g, '');
          await Linking.openURL(`tel:${cleanNumber}`);
          break;
        case 'email':
          const Email = `mailto:${value}`;
          const canOpenEmail = await Linking.canOpenURL(Email);
          if (canOpenEmail) {
            await Linking.openURL(Email);
          } else {
            Alert.alert('ایمیل', `آدرس ایمیل: ${value}`, [{ text: 'باشه' }]);
          }
          break;

        case 'whatsapp':
          const WhatsappAccountMobileNumber = value.replace(/\D/g, '');
          const fullNumber = WhatsappAccountMobileNumber.startsWith('98') ? WhatsappAccountMobileNumber : `98${WhatsappAccountMobileNumber}`;
          const whatsappUrl = `whatsapp://send?phone=${fullNumber}`;

          const canOpenWhatsapp = await Linking.canOpenURL(whatsappUrl);
          if (canOpenWhatsapp) {
            await Linking.openURL(whatsappUrl);
          } else {
            Alert.alert('خطا', 'واتساپ نصب نیست');
          }
          break;

        case 'telegram':
          const TelegramAccountId = value.replace('@', '').trim();
          const telegramUrl = `tg://resolve?domain=${TelegramAccountId}`;

          try {
            const canOpenTelegram = await Linking.canOpenURL(telegramUrl);
            if (canOpenTelegram) {
              await Linking.openURL(telegramUrl);
            } else {
              await Linking.openURL(`https://t.me/${TelegramAccountId}`);
            }
          } catch (err) {
            await Linking.openURL(`https://t.me/${TelegramAccountId}`);
          }
          break;

        case 'instagram':
          const InstagramAccountId = value.replace('@', '').trim();
          const instagramUrl = `instagram://user?username=${InstagramAccountId}`;

          try {
            const canOpenInstagram = await Linking.canOpenURL(instagramUrl);
            if (canOpenInstagram) {
              await Linking.openURL(instagramUrl);
            } else {
              await Linking.openURL(`https://instagram.com/${InstagramAccountId}`);
            }
          } catch (err) {
            await Linking.openURL(`https://instagram.com/${InstagramAccountId}`);
          }
          break;

        case 'website':
          let websiteUrl = value.trim();
          if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
            websiteUrl = `https://${websiteUrl}`;
          }
          await Linking.openURL(websiteUrl);
          break;

        case 'location':
          const locationUrl = Platform.select({
            ios: `maps://app?q=${encodeURIComponent(value)}`,
            android: `geo:0,0?q=${encodeURIComponent(value)}`,
          });

          const canOpenMap = await Linking.canOpenURL(locationUrl);
          if (canOpenMap) {
            await Linking.openURL(locationUrl);
          } else {
            await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`);
          }
          break;

        default:
          console.log('Unknown contact type:', type);
      }
    } catch (error) {
      console.error('Error opening link:', error);
      Alert.alert('خطا', 'خطا در باز کردن لینک');
    }
  };
  useEffect(() => {
    const apiUrl = `${appConfig.mobileApi}Member/Get?currentMemberId=${currentMemberId}&memberId=${memberId}`;
  }, [memberId, currentMemberId]);

  const handleNavigateToFilteredContent = (contentType, memberId, memberName) => {
    const navigationMap = {
      blog: 'MagScreen',
      portfolio: 'AllPortfolio',
      products: 'AllProducts',
      courses: 'AllCourses',
      gallery: 'AllGalleries'
    };

    const screenName = navigationMap[contentType];
    if (screenName && memberId) {
      console.log(`Navigating to ${screenName} with memberId: ${memberId}`);

      if (screenName === 'MagScreen') {
      (navigation as any).navigate('App', {
          screen: 'MainTabs',
          params: {
            screen: 'وبلاگ',
            params: {
              filteredMemberId: memberId,
              filteredMemberName: memberName || profileUser.Name || 'کاربر',
              filterType: 'member'
            }
          }
        });
      } else {
        (navigation as any).navigate(screenName, {
          filteredMemberId: memberId,
          filteredMemberName: memberName || profileUser.Name || 'کاربر',
          filterType: 'member'
        });
      }
    } else {
      console.log(`Navigation failed: screenName=${screenName}, memberId=${memberId}`);
    }
  };

  const handlePortfolioPress = (portfolioData:any) => {
    try {
      const portfolioId = portfolioData.PortfolioId || portfolioData.PotfolioId;

      if (!portfolioId || portfolioId === 0) {
        console.error('Invalid portfolio ID:', portfolioId);
        return;
      }

      (navigation as any).navigate("PortfolioDetail", {
        title: portfolioData.Title,
        portfolioId: portfolioId
      });
    } catch (error) {
      console.error('Navigation error (Portfolio):', error);
    }
  };

  const handleCoursePress = useCallback((courseData:any) => {
    try {
      (navigation as any).navigate("CourseDetails", {
        courseData,
        courseId: courseData.CourseId
      });
    } catch (error) {
      console.error('Navigation error (Course):', error);
    }
  },[]);

  const handleProductPress = (productData:any) => {
    try {
      (navigation as any).navigate("ProductDetails", {
        productData: productData,
        productId: productData.ProductId
      });
    } catch (error) {
      console.error('Navigation error (Product):', error);
    }
  };

  const handleGalleryPress = (galleryData) => {
    try {
      (navigation as any).navigate("GalleryItem", {
        title: galleryData.Title,
        galleryId: galleryData.ImageGalleryId
      });
    } catch (error) {
      console.error('Navigation error (Gallery):', error);
    }
  };

  const handleBlogPress = (blogData) => {
    (navigation as any).navigate("MagDetailes", {
      title: blogData.Title,
      blogId: blogData.BlogPostId
    });
  };

  const scrollViewRef = useRef(null);
  const portfolioRef = useRef(null);
  const coursesRef = useRef(null);
  const productsRef = useRef(null);
  const galleryRef = useRef(null);
  const blogPostsRef = useRef(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const avatarGlowAnim = useRef(new Animated.Value(0)).current;

  const animatedValues = {
    fadeAnim,
    slideAnim,
    pulseAnim,
    rotateAnim,
    shimmerAnim,
    avatarGlowAnim
  };


  const profileUser = memberProfile || userData || {
    MemberId: 0,
    Name: "کاربر ناشناس",
    MemberGroupsStr: "تعریف نشده",
    AboutMe: "اطلاعات بیوگرافی موجود نیست",
    Email: "example@email.com",
    Mobile: "09123456789",
    CityName: "تهران",
    ProvinceName: "ایران",
    ShowAboutMeText: true,
    ShowContactInfo: true,
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

  const hasData = {
    portfolio: profileUser.PortfolioViewModelList && profileUser.PortfolioViewModelList.length > 0,
    products: profileUser.ProductViewModelList && profileUser.ProductViewModelList.length > 0,
    courses: profileUser.CourseViewModelList && profileUser.CourseViewModelList.length > 0,
    gallery: profileUser.ImageGalleryViewModelList && profileUser.ImageGalleryViewModelList.length > 0,
    blogPosts: profileUser.BlogPostViewModelList && profileUser.BlogPostViewModelList.length > 0
  };

  const sectionsWithData = Object.values(hasData).filter(Boolean).length;
  const shouldShowQuickAccess = sectionsWithData >= 2;

  const InfoSection = ({ icon, title, children, iconColor = modernColors.primary }:any) => (
    <View
      style={[
        styles.glassSection,
        {
          opacity: 1,
          marginVertical: 10,
        },
      ]}
    >
      <View style={[styles.sectionHeaderInfo, { marginBottom: 20 }]}>
        <LinearGradient
          colors={[iconColor, iconColor + 'CC']}
          style={styles.iconWrapper}
        >
          <MaterialIcons name={icon} size={22} color={modernColors.surface} />
        </LinearGradient>
        <AppText style={styles.sectionTitleInfo}>{title}</AppText>
      </View>
      <View style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </View>
      <View style={[styles.featureAccent, { backgroundColor: iconColor + "40" }]} />
    </View>
  );

  const renderPortfolioItem = ({ item }:any) => <PortfolioCard item={item} onPress={handlePortfolioPress} />;
  const renderCourseItem = useCallback(({ item }:any) => <CourseCard item={item} onPress={handleCoursePress} />,[]);
  const renderProductItem = ({ item }:any) => <ProductCard item={item} onPress={handleProductPress} />;
  const renderGalleryItem = ({ item }:any) => <GalleryCard item={item} onPress={handleGalleryPress} />;
  const renderBlogPostItem = ({ item }:any) => <BlogPostCard item={item} onPress={handleBlogPress} />;

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
            <View style={styles.topHalfCircle}>
              <LinearGradient
                colors={[modernColors.primary, modernColors.primaryDark, modernColors.accent]}
                style={styles.halfCircleGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </View>


            <ProfileSkeleton />
            <View style={styles.videoSection}>
              <SkeletonLoader width="100%" height={200} borderRadius={20} />
            </View>
            <InfoSectionSkeleton title="درباره من" />
            <ContactSkeleton />
            <QuickAccessSkeleton />
            <SectionSkeleton title="نمونه کارها" cardType="portfolio" />
            <SectionSkeleton title="محصولات" cardType="product" />
            <SectionSkeleton title="دوره‌ها" cardType="course" />
            <SectionSkeleton title="گالری تصاویر" cardType="gallery" />
            <SectionSkeleton title="مقالات" cardType="blog" />

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </View>
      </>
    );
  }

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
          <View
            style={[
              styles.topHalfCircle,
            ]}
          >
            <LinearGradient
              colors={[modernColors.primary, modernColors.primaryDark, modernColors.accent]}
              style={styles.halfCircleGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </View>

          <View
            style={[
              styles.backButtonContainer,
            ]}
          >
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <Ionicons name="arrow-forward" size={24} color={modernColors.surface} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <View style={[
                styles.avatarGlowContainer,
              ]}>
                <LinearGradient
                  colors={[modernColors.primary, modernColors.accent, modernColors.secondary, modernColors.tertiary]}
                  style={styles.avatarOuterRing}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.avatarMiddleRing}>
                    <View style={styles.avatarInnerContainer}>
                      {profileUser.AvatarImageURL && profileUser.AvatarImageURL.trim() !== '' ? (
                        <Image
                          source={{ uri: profileUser.AvatarImageURL }}
                          style={styles.avatarImage}
                        />
                      ) : (
                        <LinearGradient
                          colors={[modernColors.primary, modernColors.primaryDark]}
                          style={styles.defaultAvatar}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <MaterialCommunityIcons
                            name={profileUser.Gender ? "face-man" : "face-woman"}
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
                      )}
                    </View>
                  </View>
                </LinearGradient>

                {profileUser?.ShowBlueTick && (
                  <View style={styles.blueTickContainer}>
                    <MaterialIcons
                      name="verified"
                      size={26}
                      color="#1DA1F2"
                    />
                  </View>
                )}


              </View>
            </View>

            <AppText style={styles.userName}>{safeString(profileUser.Name, 'کاربر ناشناس')}</AppText>
            <AppText style={styles.userProfession}>{safeString(profileUser.MemberGroupsStr, 'تعریف نشده')}</AppText>

            <LikeButton
              memberId={profileUser.MemberId}
              initialLikeCount={profileUser.LikeCount || 0}
              initialIsLiked={profileUser.IsCurrentMemberLikedThisMember || false}
              // onLikeSuccess={refetch} 
            />
          </View>


  {
    (userData?.IntroductionVideoFileName || userData?.IntroductionVideoURL) &&
              <VideoSection userData={profileUser} animatedValues={animatedValues} />

  }

          {!shouldShowQuickAccess && <View style={{ height: 50 }} />}

          {profileUser.ShowAboutMeText === true && (
            <InfoSection icon="person" title="درباره من" iconColor={modernColors.info}>
              <ExpandableText text={safeString(profileUser.AboutMe, 'اطلاعات بیوگرافی موجود نیست')} maxLines={3} />
            </InfoSection>
          )}

          {profileUser.ShowContactInfo === true && (
            <InfoSection icon="contact-phone" title="اطلاعات تماس" iconColor={modernColors.tertiary}>
              <View style={styles.contactGrid}>
                {profileUser.Email && (
                  <ContactItem
                    icon="email"
                    text={profileUser.Email}
                    type="email"
                    shimmerAnim={shimmerAnim}
                    onPress={() => handleContactPress('email', profileUser.Email)}
                  />
                )}

                {profileUser.Mobile && (
                  <ContactItem
                    icon="phone"
                    text={profileUser.Mobile}
                    type="phone"
                    shimmerAnim={shimmerAnim}
                    onPress={() => handleContactPress('phone', profileUser.Mobile)}
                  />
                )}

                {profileUser.Phone1 && (
                  <ContactItem
                    icon="phone"
                    text={profileUser.Phone1}
                    type="phone"
                    shimmerAnim={shimmerAnim}
                    onPress={() => handleContactPress('phone', profileUser.Phone1)}
                  />
                )}

                {profileUser.Phone2 && (
                  <ContactItem
                    icon="phone"
                    text={profileUser.Phone2}
                    type="phone"
                    shimmerAnim={shimmerAnim}
                    onPress={() => handleContactPress('phone', profileUser.Phone2)}
                  />
                )}

                {profileUser.WhatsappAccountMobileNumber && (
                  <ContactItem
                    icon="chat"
                    text={profileUser.WhatsappAccountMobileNumber}
                    type="whatsapp"
                    shimmerAnim={shimmerAnim}
                    onPress={() => handleContactPress('whatsapp', profileUser.WhatsappAccountMobileNumber)}
                  />
                )}

                {profileUser.TelegramAccountId && (
                  <ContactItem
                    icon="send"
                    text={profileUser.TelegramAccountId}
                    type="telegram"
                    shimmerAnim={shimmerAnim}
                    onPress={() => handleContactPress('telegram', profileUser.TelegramAccountId)}
                  />
                )}

                {profileUser.InstagramAccountId && (
                  <ContactItem
                    icon="photo-camera"
                    text={profileUser.InstagramAccountId}
                    type="instagram"
                    shimmerAnim={shimmerAnim}
                    onPress={() => handleContactPress('instagram', profileUser.InstagramAccountId)}
                  />
                )}

                {profileUser.WebsiteAddress && (
                  <ContactItem
                    icon="language"
                    text={profileUser.WebsiteAddress}
                    type="website"
                    shimmerAnim={shimmerAnim}
                    onPress={() => handleContactPress('website', profileUser.WebsiteAddress)}
                  />
                )}

                {(profileUser.CityName || profileUser.ProvinceName) && (
                  <ContactItem
                    icon="location-on"
                    text={`${safeString(profileUser.CityName, '')}${profileUser.CityName && profileUser.ProvinceName ? '، ' : ''}${safeString(profileUser.ProvinceName, '')}`}
                    type="location"
                    shimmerAnim={shimmerAnim}
                    onPress={() => handleContactPress('location', `${profileUser.CityName}, ${profileUser.ProvinceName}`)}
                  />
                )}
              </View>
            </InfoSection>
          )}

          {shouldShowQuickAccess && (
            <View
              style={[
                styles.quickAccessContainer,
              ]}
            >
              <View style={styles.quickAccessGrid}>
                {hasData.portfolio && (
                  <TouchableOpacity
                    style={[styles.quickAccessItem, { backgroundColor: modernColors.warning + '15' }]}
                    onPress={() => scrollToSection(portfolioRef)}
                  >
                    <MaterialIcons name="work" size={24} color={modernColors.warning} />
                    <AppText style={styles.quickAccessText}>نمونه کار</AppText>
                  </TouchableOpacity>
                )}

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
              </View>
            </View>
          )}

          {hasData.blogPosts && (
            <View
              ref={blogPostsRef}
              style={[
                styles.sectionContainer
              ]}
            >
              <SectionHeader
                title="مقالات"
                icon="article"
                color={modernColors.info}
                hasData={profileUser.BlogPostViewModelList.length > 0}
                onSeeAll={() => handleNavigateToFilteredContent('blog', profileUser.MemberId, profileUser.Name)}
              />
              <FlatList
                data={profileUser.BlogPostViewModelList}
                renderItem={renderBlogPostItem}
                keyExtractor={(item) => item.BlogPostId?.toString() || Math.random().toString()}
                horizontal
                inverted={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
                ItemSeparatorComponent={() => <View style={{ width: 15 }} />}
              />
            </View>
          )}

          {hasData.portfolio && (
            <View
              ref={portfolioRef}
              style={[
                styles.sectionContainer,
              ]}
            >
              <SectionHeader
                title="نمونه کارها"
                icon="work"
                color={modernColors.secondary}
                hasData={profileUser.PortfolioViewModelList.length > 0}
                onSeeAll={() => handleNavigateToFilteredContent('portfolio', profileUser.MemberId, profileUser.Name)}
              />
              <FlatList
                data={profileUser.PortfolioViewModelList}
                renderItem={renderPortfolioItem}
                keyExtractor={(item) => item.PortfolioId?.toString() || Math.random().toString()}
                horizontal
                inverted={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
                ItemSeparatorComponent={() => <View style={{ width: 15 }} />}
              />
            </View>
          )}

          {hasData.products && (
            <View
              ref={productsRef}
              style={[
                styles.sectionContainer,
              ]}
            >
              <SectionHeader
                title="محصولات"
                icon="shopping-bag"
                color={modernColors.accent}
                hasData={profileUser.ProductViewModelList.length > 0}
                onSeeAll={() => handleNavigateToFilteredContent('products', profileUser.MemberId, profileUser.Name)}
              />
              <FlatList
                data={profileUser.ProductViewModelList}
                renderItem={renderProductItem}
                keyExtractor={(item) => item.ProductId?.toString() || Math.random().toString()}
                horizontal
                inverted={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
                ItemSeparatorComponent={() => <View style={{ width: 15 }} />}
              />
            </View>
          )}

          {hasData.courses && (
            <View
              ref={coursesRef}
              style={[
                styles.sectionContainer,
              ]}
            >
              <SectionHeader
                title="دوره‌ها"
                icon="school"
                color={modernColors.tertiary}
                hasData={profileUser.CourseViewModelList.length > 0}
                onSeeAll={() => handleNavigateToFilteredContent('courses', profileUser.MemberId, profileUser.Name)}
              />
              <FlatList
                data={profileUser.CourseViewModelList}
                renderItem={renderCourseItem}
                keyExtractor={(item) => item.CourseId?.toString() || Math.random().toString()}
                horizontal
                inverted={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
                ItemSeparatorComponent={() => <View style={{ width: 15 }} />}
                getItemLayout={(data, index) => ({
                  length: 300,
                  offset: 315 * index,
                  index,
                })}
                initialNumToRender={3}
                maxToRenderPerBatch={2}
                windowSize={5}
                removeClippedSubviews={true}
                bounces={true}
                decelerationRate="fast"
                snapToInterval={315}
                snapToAlignment="start"
                ListEmptyComponent={() => (
                  <View style={styles.emptyStateContainer}>
                    <MaterialIcons name="school" size={40} color={modernColors.medium} />
                    <AppText style={styles.emptyStateText}>دوره‌ای موجود نیست</AppText>
                  </View>
                )}
                ListHeaderComponent={() => <View style={{ width: 5 }} />}
                ListFooterComponent={() => <View style={{ width: 5 }} />}
                scrollEventThrottle={16}
                onMomentumScrollEnd={(event) => {
                  console.log('Course scroll ended');
                }}
              />
            </View>
          )}

          {hasData.gallery && (
            <View
              ref={galleryRef}
              style={[
                styles.sectionContainer,
              ]}
            >
              <SectionHeader
                title="گالری تصاویر"
                icon="photo-library"
                color={modernColors.error}
                hasData={profileUser.ImageGalleryViewModelList.length > 0}
                onSeeAll={() => handleNavigateToFilteredContent('gallery', profileUser.MemberId, profileUser.Name)}
              />
              <FlatList
                data={profileUser.ImageGalleryViewModelList}
                renderItem={renderGalleryItem}
                keyExtractor={(item) => item.ImageGalleryId?.toString() || Math.random().toString()}
                horizontal
                inverted={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
                ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
              />
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </>
  );
};



export default UserProfileScreen;