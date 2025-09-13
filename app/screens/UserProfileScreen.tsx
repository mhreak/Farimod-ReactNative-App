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
import { VideoView } from 'expo-video';
import { useVideoPlayer } from 'expo-video';

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

const LikeButton = ({ memberId, initialLikeCount = 0, initialIsLiked = false }) => {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLiking, setIsLiking] = useState(false);

  const likeAnim = useRef(new Animated.Value(1)).current;
  const heartAnim = useRef(new Animated.Value(0)).current;

  const handleLike = async () => {
    if (isLiking || !memberId) return;

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
      const response = await fetch(
        `${appConfig.mobileApi}Member/Like?id=${memberId}`,
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

      if (result.LikeCount !== undefined) {
        setLikeCount(result.LikeCount);
      }

    } catch (error) {
      console.error('Like API Error:', error);
      setIsLiked(isLiked);
      setLikeCount(likeCount);
      console.log('خطا در ثبت لایک');
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <View style={styles.likeSection}>
      <TouchableOpacity
        style={styles.likeButton}
        onPress={handleLike}
        disabled={isLiking}
        activeOpacity={0.7}
      >
        <View style={styles.likeButtonInner}>
          <View>
            <MaterialIcons
              name={isLiked ? "favorite" : "favorite-border"}
              size={20}
              color={isLiked ? modernColors.secondary : modernColors.medium}
            />
          </View>
          <AppText style={[
            styles.likeText,
            { color: isLiked ? modernColors.secondary : modernColors.medium }
          ]}>
            {toPersianDigits(likeCount.toString())}
          </AppText>
        </View>
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.floatingHeart,
          {
            opacity: heartAnim,
            transform: [
              {
                translateY: heartAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -100],
                }),
              },
              {
                scale: heartAnim.interpolate({
                  inputRange: [0, 0.3, 0.7, 1],
                  outputRange: [0.5, 1.5, 1.2, 0.3],
                }),
              },
            ],
          },
        ]}
      >
        <MaterialIcons name="favorite" size={30} color={modernColors.secondary} />
      </Animated.View>
    </View>
  );
};

const VideoSection = ({ userData, animatedValues }) => {
  const [videoError, setVideoError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [playerReady, setPlayerReady] = useState(false);

  if (!userData.IntroductionVideoFileName && !userData.IntroductionVideoURL) {
    return null;
  }

  const videoSource = userData.IntroductionVideoURL ||
    (userData.VideoURL ? userData.VideoURL : null);

  if (!videoSource || videoError) {
    return (
      <Animated.View
        style={[
          styles.videoSection,
          {
            opacity: animatedValues.fadeAnim,
            transform: [{ translateY: animatedValues.slideAnim }],
          },
        ]}
      >
        <View style={styles.videoPlaceholder}>
          <MaterialIcons name="play-circle-outline" size={60} color={modernColors.medium} />
          <AppText style={styles.videoPlaceholderText}>ویدیو موجود نیست</AppText>
        </View>
      </Animated.View>
    );
  }

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = false;
  });

  return (
    <Animated.View
      style={[
        styles.videoSection,
        {
          opacity: animatedValues.fadeAnim,
          transform: [{ translateY: animatedValues.slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={[modernColors.primary + '10', modernColors.accent + '10']}
        style={styles.videoWrapper}
      >
        <View style={styles.videoShadow}>
          {videoLoading && (
            <View style={styles.videoLoadingContainer}>
              <ActivityIndicator
                size="large"
                color={modernColors.primary}
                style={styles.videoLoadingIndicator}
              />
              <AppText style={styles.videoLoadingText}>در حال بارگذاری ویدیو...</AppText>
            </View>
          )}

          <VideoView
            player={player}
            style={[
              styles.videoPlayer,
              {
                opacity: videoLoading ? 0 : 1,
                zIndex: videoLoading ? 1 : 5
              }
            ]}
            contentFit="cover"
            nativeControls
            onError={(e) => {
              console.log('Video error:', e);
              setVideoError(true);
              setVideoLoading(false);
            }}
            onLoadStart={() => {
              console.log('Video load started');
              setVideoLoading(true);
              setPlayerReady(false);
            }}
            onLoad={(data) => {
              console.log('Video loaded - basic info available:', data);
            }}
            onReadyForDisplay={() => {
              console.log('Video ready for display - can start playing');
              setVideoLoading(false);
              setPlayerReady(true);
            }}
            onPlaybackStatusUpdate={(status) => {
              if (status && status.isLoaded && !videoError && !playerReady) {
                console.log('Playback status - ready:', status);
                setVideoLoading(false);
                setPlayerReady(true);
              }
            }}
          />
        </View>
      </LinearGradient>
    </Animated.View>
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
    <SkeletonLoader width={120} height={16} borderRadius={20} style={{ marginBottom: 15 }} />
    <SkeletonLoader width={80} height={35} borderRadius={20} />
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
  const itemCount = Math.floor(Math.random() * 3) + 2;

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
          {cardType === "blog" && <BlogPostCardSkeleton />}
        </View>
      ))}
    </ScrollView>
  </View>
);

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

const BlogPostCardSkeleton = () => (
  <View style={styles.blogCard}>
    <View style={styles.blogImageContainer}>
      <SkeletonLoader width="100%" height="100%" borderRadius={0} />
    </View>
    <View style={styles.blogContent}>
      <SkeletonLoader width="90%" height={16} style={{ marginBottom: 12 }} />
      <View style={styles.blogMeta}>
        <View style={styles.dateContainer}>
          <SkeletonLoader width={16} height={16} borderRadius={8} style={{ marginLeft: 6 }} />
          <SkeletonLoader width={80} height={14} />
        </View>
        <View style={styles.likeContainer}>
          <SkeletonLoader width={16} height={16} borderRadius={8} style={{ marginRight: 6 }} />
          <SkeletonLoader width={30} height={14} />
        </View>
      </View>
    </View>
  </View>
);

const PortfolioCard = ({ item, onPress }) => (
  <TouchableOpacity style={styles.portfolioCard} activeOpacity={0.8} onPress={() => onPress(item)}>
    <Image
      source={
        item.ImageFileName
          ? { uri: `${appConfig.mobileApi}Portfolio/GetImage/${item.ImageFileName}` }
          : item.FeaturedImageURL
            ? { uri: item.FeaturedImageURL }
            : require("../../assets/portfolio_icon.jpg")
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
        </View>
      </LinearGradient>
    </View>
  </TouchableOpacity>
);

const CourseCard = ({ item, onPress }) => (
  <TouchableOpacity style={styles.courseCard} activeOpacity={0.8} onPress={() => onPress(item)}>
    <Image
      source={
        item.CourseImageFileName
          ? { uri: `${appConfig.mobileApi}Course/GetCourseImage/${item.CourseImageFileName}` }
          : item.FeaturedImageURL
            ? { uri: item.FeaturedImageURL }
            : require("../../assets/new_course.jpg")
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
);

const ProductCard = ({ item, onPress }) => {
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
                : require("../../assets/Product_icon.jpg")
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

const GalleryCard = ({ item, onPress }) => (
  <TouchableOpacity style={styles.galleryCard} activeOpacity={0.8} onPress={() => onPress(item)}>
    <Image
      source={
        item.ImageFileName
          ? { uri: `${appConfig.mobileApi}ImageGallery/GetImage/${item.ImageFileName}` }
          : item.FeaturedImageURL
            ? { uri: item.FeaturedImageURL }
            : require("../../assets/main-icon.png")
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

const BlogImageComponent = ({ item }) => {
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
          source={require("../../assets/blogPost_icon.jpg")}
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
};

const BlogPostCard = ({ item, onPress }) => (
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
);

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

  const memberId = userData?.MemberId || null;

  const { data: memberProfile, loading, error, refetch } = useMemberProfile(memberId);

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
        navigation.navigate('MainTabs', {
          screen: 'مجله ی فریمد',
          params: {
            filteredMemberId: memberId,
            filteredMemberName: memberName || user.Name || 'کاربر',
            filterType: 'member'
          }
        });
      } else {
        navigation.navigate(screenName, {
          filteredMemberId: memberId,
          filteredMemberName: memberName || user.Name || 'کاربر',
          filterType: 'member'
        });
      }
    } else {
      console.log(`Navigation failed: screenName=${screenName}, memberId=${memberId}`);
    }
  };

  const handlePortfolioPress = (portfolioData) => {
    try {
      const portfolioId = portfolioData.PortfolioId || portfolioData.PotfolioId;

      if (!portfolioId || portfolioId === 0) {
        console.error('Invalid portfolio ID:', portfolioId);
        return;
      }

      navigation.navigate("PortfolioDetail", {
        title: portfolioData.Title,
        portfolioId: portfolioId
      });
    } catch (error) {
      console.error('Navigation error (Portfolio):', error);
    }
  };

  const handleCoursePress = (courseData) => {
    try {
      navigation.navigate("CourseDetails", {
        courseData,
        courseId: courseData.CourseId
      });
    } catch (error) {
      console.error('Navigation error (Course):', error);
    }
  };

  const handleProductPress = (productData) => {
    try {
      navigation.navigate("ProductDetails", {
        productData: productData,
        productId: productData.ProductId
      });
    } catch (error) {
      console.error('Navigation error (Product):', error);
    }
  };

  const handleGalleryPress = (galleryData) => {
    try {
      navigation.navigate("GalleryItem", {
        title: galleryData.Title,
        galleryId: galleryData.ImageGalleryId
      });
    } catch (error) {
      console.error('Navigation error (Gallery):', error);
    }
  };

  const handleBlogPress = (blogData) => {
    navigation.navigate("MagDetailes", {
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

  const user = memberProfile || userData || {
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
    portfolio: user.PortfolioViewModelList && user.PortfolioViewModelList.length > 0,
    products: user.ProductViewModelList && user.ProductViewModelList.length > 0,
    courses: user.CourseViewModelList && user.CourseViewModelList.length > 0,
    gallery: user.ImageGalleryViewModelList && user.ImageGalleryViewModelList.length > 0,
    blogPosts: user.BlogPostViewModelList && user.BlogPostViewModelList.length > 0
  };

  const sectionsWithData = Object.values(hasData).filter(Boolean).length;
  const shouldShowQuickAccess = sectionsWithData >= 2;

  const InfoSection = ({ icon, title, children, iconColor = modernColors.primary }) => (
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

  const renderPortfolioItem = ({ item }) => <PortfolioCard item={item} onPress={handlePortfolioPress} />;
  const renderCourseItem = ({ item }) => <CourseCard item={item} onPress={handleCoursePress} />;
  const renderProductItem = ({ item }) => <ProductCard item={item} onPress={handleProductPress} />;
  const renderGalleryItem = ({ item }) => <GalleryCard item={item} onPress={handleGalleryPress} />;
  const renderBlogPostItem = ({ item }) => <BlogPostCard item={item} onPress={handleBlogPress} />;
  { console.log('ShowAboutMeText:', user.ShowAboutMeText) }
  { console.log('ShowContactInfo:', user.ShowContactInfo) }
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

            <View style={styles.backButtonContainer}>
              <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                <Ionicons name="arrow-forward" size={24} color={modernColors.surface} />
              </TouchableOpacity>
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
                      {user.AvatarImageURL && user.AvatarImageURL.trim() !== '' ? (
                        <Image
                          source={{ uri: user.AvatarImageURL }}
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
                      )}
                    </View>
                  </View>
                </LinearGradient>

                {user?.ShowBlueTick && (
                  <View style={styles.blueTickContainer}>
                    <MaterialIcons
                      name="verified"
                      size={26}
                      color="#1DA1F2"
                    />
                  </View>
                )}

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

            <LikeButton
              memberId={user.MemberId}
              initialLikeCount={user.LikeCount || 0}
              initialIsLiked={user.IsMemberLiked || false}
            />
          </Animated.View>

          <VideoSection userData={user} animatedValues={animatedValues} />

          {!shouldShowQuickAccess && <View style={{ height: 50 }} />}

          {user.ShowAboutMeText === true && (
            <InfoSection icon="person" title="درباره من" iconColor={modernColors.info}>
              <ExpandableText text={safeString(user.AboutMe, 'اطلاعات بیوگرافی موجود نیست')} maxLines={3} />
            </InfoSection>
          )}

          {user.ShowContactInfo === true && (
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
          )}

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
            </Animated.View>
          )}

          {hasData.blogPosts && (
            <Animated.View
              ref={blogPostsRef}
              style={[
                styles.sectionContainer,
                {
                  opacity: 1,
                  transform: [{ translateY: 0 }],
                },
              ]}
            >
              <SectionHeader
                title="مقالات"
                icon="article"
                color={modernColors.info}
                hasData={user.BlogPostViewModelList.length > 0}
                onSeeAll={() => handleNavigateToFilteredContent('blog', user.MemberId, user.Name)}
              />
              <FlatList
                data={user.BlogPostViewModelList}
                renderItem={renderBlogPostItem}
                keyExtractor={(item) => item.BlogPostId?.toString() || Math.random().toString()}
                horizontal
                inverted={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
                ItemSeparatorComponent={() => <View style={{ width: 15 }} />}
              />
            </Animated.View>
          )}

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
                onSeeAll={() => handleNavigateToFilteredContent('portfolio', user.MemberId, user.Name)}
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
                onSeeAll={() => handleNavigateToFilteredContent('products', user.MemberId, user.Name)}
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
                onSeeAll={() => handleNavigateToFilteredContent('courses', user.MemberId, user.Name)}
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
            </Animated.View>
          )}

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
                onSeeAll={() => handleNavigateToFilteredContent('gallery', user.MemberId, user.Name)}
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
    marginTop: PROFILE_CONSTANTS.PROFILE_SECTION_TOP + 100,
    marginBottom: PROFILE_CONSTANTS.PROFILE_SECTION_TOP - 1670,
    zIndex: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255,0.51)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: "center",
    padding: 25,
    marginBottom: 40,
    marginTop: PROFILE_CONSTANTS.PROFILE_SECTION_TOP,
    zIndex: 2,
    position: 'relative',
    minHeight: 300,
  },
  avatarContainer: {
    marginBottom: 25,
    position: 'relative',
    zIndex: 3,
    alignItems: 'center',
    justifyContent: 'center',
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
  avatarImage: {
    width: PROFILE_CONSTANTS.AVATAR_SIZE,
    height: PROFILE_CONSTANTS.AVATAR_SIZE,
    borderRadius: PROFILE_CONSTANTS.AVATAR_SIZE / 2,
  },
  defaultAvatar: {
    width: PROFILE_CONSTANTS.AVATAR_SIZE,
    height: PROFILE_CONSTANTS.AVATAR_SIZE,
    borderRadius: PROFILE_CONSTANTS.AVATAR_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    position: 'relative',
  },
  blueTickContainer: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
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
    marginBottom: 8,
    textAlign: 'center',
    zIndex: 10,
    position: 'relative',
  },
  userProfession: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.medium,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 50,
    textAlign: 'center',
    zIndex: 9,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  likeSection: {
    position: 'relative',
    alignItems: 'center',
    marginTop: 15,
    zIndex: 8,
    paddingVertical: 10,
  },
  likeButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  likeButtonInner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  likeText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    marginRight: 8,
  },
  floatingHeart: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    pointerEvents: 'none',
  },
  videoSection: {
    marginHorizontal: 0,
    marginBottom: 60,
    marginTop: 20,
    zIndex: 1,
    position: 'relative',
  },
  videoWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    padding: 4,
  },
  videoShadow: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
  },
  videoPlayer: {
    width: '100%',
    height: 220,
  },
  videoLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 16,
  },
  videoLoadingIndicator: {
    marginBottom: 15,
  },
  videoLoadingText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#ffffff',
    textAlign: 'center',
  },
  videoPlaceholder: {
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  videoPlaceholderText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.medium,
    marginTop: 10,
    textAlign: 'center',
  },
  glassSection: {
    marginBottom: 20,
    backgroundColor: "rgba(248, 250, 252, 0.5)",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(203, 213, 225, 0.4)",
    position: "relative",
    overflow: "hidden",

    zIndex: 1,
    minHeight: 80,
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
    marginBottom: 10,
    paddingVertical: 5,
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
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 8,
    minHeight: 70,
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
    marginBottom: 30,
    marginTop: 15,
    paddingVertical: 15,
    zIndex: 1,
    position: 'relative',
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
    maxWidth: (width - 60) / 4,
  },
  quickAccessText: {
    fontSize: 11,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.dark,
    marginTop: 6,
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    marginBottom: 20,
    marginTop: 10,
    minHeight: 40,
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
  productCard: {
    width: 180,
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
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productContent: {
    padding: 12,
    minHeight: 85,
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
  blogCard: {
    width: 280,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
    marginBottom: 20,
  },
  blogImageContainer: {
    height: 160,
    width: '100%',
    position: 'relative',
  },
  blogImage: {
    width: '100%',
    height: '100%',
  },
  blogImagePlaceholder: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    height: 160,
  },
  blogContent: {
    padding: 16,
  },
  blogTitle: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    textAlign: "right",
    lineHeight: 24,
    marginBottom: 12,
  },
  blogMeta: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#666',
    marginRight: 6,
  },
  likeContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  likeText: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#666',
    marginRight: 8,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    width: width - 40,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.medium,
    marginTop: 10,
    textAlign: 'center',
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
  postImage: {
    height: "100%",
    width: "100%",
  },
});

export default UserProfileScreen;