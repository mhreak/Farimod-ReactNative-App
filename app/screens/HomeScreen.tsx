import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Screen from "../components/Screen";
import colors from "../config/colors";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import PagerView from "react-native-pager-view";
import AppText from "../components/Text";
import { useNavigation } from "@react-navigation/native";
import MainBackground from "../components/MainBackground";
import CourseCard from "../components/CourseCard";
import { toPersianDigits, safeNumber, formatPrice, safeString } from "../utils/converters";
import appConfig from "../config/config";
import { Member, Course, AvatarProps } from "../config/type";
import { useMembers, useProducts, useCourses } from "../config/useApi";
import Toast from "../components/Toast";
import { StatusBar } from "react-native";
import { useHomePageSlideNavigator, ClickableSlide } from '../components/useHomePageSlideNavigator';
import MenuModal from "../components/MenuModal";
import { useAuth } from "../contexts/AuthContext";
import { CommonActions } from "@react-navigation/native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppUpdate } from "../contexts/AppUpdateContext";



const { width: screenWidth } = Dimensions.get('window');

interface HomePageSlide {
  HomePageSlideId: number;
  ClickTrigger: number | null;
  ImageURL: string;
  TargetEntityName: string | null;
  Active: boolean;
  ShowOrder: boolean;
}
interface MemberGroup {
  MemberGroupId: number;
  GroupName: string;
  MemberCount: number;
  Active: boolean;
  ActiveStr: string;
  InsertDate: string;
  ShamsiInsertDate: string;
}
interface Portfolio {
  PortfolioId: number;
  PotfolioId?: number;
  Title: string;
  Description: string;
  ShamsiInsertDate: string;
  Active: boolean;
  LikeCount: number;
  Rating: number | null;
  FeaturedImageURL?: string;
}

interface BlogPost {
  BlogPostId: number;
  BlogPostCategoryId: number;
  MemberId: number;
  Title: string;
  ShamsiInsertDate: string;  // ✅ تغییر از ShamsiInsertDateTime
  Content: string;
  CommentEnabled: boolean;
  LikeCount: number;
  FeaturedImageFileName: string | null;
  FeaturedImageURL: string;
  Rating: number | null;
  Active: boolean;
}

interface ImageGallery {
  ImageGalleryId: number;
  Title: string;
  MemberId: number;
  MemberName: string | null;
  ImageCount: number;
  Active: boolean;
  ActiveStr: string;
  InsertDate: string;
  ShamsiInsertDate: string;
  Rating: number | null;
  LikeCount: number;
  ImageGalleryItemList: any[];
}

interface Product {
  ProductId: number;
  MemberId: number;
  MemberName?: string;
  ProductName: string;
  Price: number;
  SpecialSalePrice: number;
  ProductCategories: string;
  FeaturedImageURL?: string;
  LikeCount: number;
  Rating?: number;
  Active: boolean;
  InsertDate: string;
}

const useHomePageSlides = () => {
  const [data, setData] = useState<HomePageSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${appConfig.mobileApi}HomePageSlide/GetAll`);
      const result = await response.json();

      if (response.ok && result.Data) {
        const activeSlides = result.Data
          .filter((slide: HomePageSlide) => slide.Active)
          .sort((a: HomePageSlide, b: HomePageSlide) => {
            if (a.ShowOrder && !b.ShowOrder) return -1;
            if (!a.ShowOrder && b.ShowOrder) return 1;
            return a.HomePageSlideId - b.HomePageSlideId;
          });

        setData(activeSlides);
      } else {
        setError('خطا در دریافت اطلاعات اسلایدر');
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور');
      console.error('Error fetching home page slides:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  return { data, loading, error, refetch: fetchSlides };
};

const usePortfolios = () => {
  const [data, setData] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${appConfig.mobileApi}Portfolio/GetAllLast`);
      const result = await response.json();

      if (response.ok && result.Data) {
        const activePortfolios = result.Data.filter((portfolio: Portfolio) => portfolio.Active);
        setData(activePortfolios);
      } else {
        setError('خطا در دریافت اطلاعات نمونه کارها');
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور');
      console.error('Error fetching portfolios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  return { data, loading, error, refetch: fetchPortfolios };
};

const useImageGalleries = () => {
  const [data, setData] = useState<ImageGallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGalleries = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${appConfig.mobileApi}ImageGallery/GetAllLast`);
      const result = await response.json();

      if (response.ok && result.Data) {
        const activeGalleries = result.Data.filter((gallery: ImageGallery) => gallery.Active);
        setData(activeGalleries);
      } else {
        setError('خطا در دریافت اطلاعات گالری‌ها');
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور');
      console.error('Error fetching image galleries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  return { data, loading, error, refetch: fetchGalleries };
};

const useBlogPosts = () => {
  const [data, setData] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${appConfig.mobileApi}BlogPost/GetAllLast`);
      const result = await response.json();

      if (response.ok && result.Data) {
        const activeBlogPosts = result.Data.filter((post: BlogPost) => post.Active);
        setData(activeBlogPosts);
      } else {
        setError('خطا در دریافت اطلاعات مقالات');
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور');
      console.error('Error fetching blog posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  return { data, loading, error, refetch: fetchBlogPosts };
};
const useMemberGroups = () => {
  const [data, setData] = useState<MemberGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMemberGroups = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${appConfig.mobileApi}MemberGroup/GetAll?currentPage=1&pageSize=100`);
      const result = await response.json();

      if (response.ok && result.Data) {
        // ✅ فقط گروه‌های فعال با MemberCount > 0
        const activeGroups = result.Data.filter(
          (group: MemberGroup) => group.Active && group.MemberCount > 0
        );
        setData(activeGroups);
      } else {
        setError('خطا در دریافت اطلاعات گروه‌های اصلی');
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور');
      console.error('Error fetching member groups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberGroups();
  }, []);

  return { data, loading, error, refetch: fetchMemberGroups };
};

const SkeletonLoader = ({ width, height, borderRadius = 8, style = {} }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const shimmerValue = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const startPulseAnimation = () => {
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
      ]).start(() => startPulseAnimation());
    };

    const startShimmerAnimation = () => {
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.delay(500),
      ]).start(() => {
        shimmerValue.setValue(-1);
        startShimmerAnimation();
      });
    };

    startPulseAnimation();
    startShimmerAnimation();
  }, [animatedValue, shimmerValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e0e0e0', '#f0f0f0'],
  });

  const shimmerTranslateX = shimmerValue.interpolate({
    inputRange: [-1, 1],
    outputRange: [-300, 300],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor,
          borderRadius,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmerOverlay,
          {
            transform: [{ translateX: shimmerTranslateX }],
          },
        ]}
      />
    </Animated.View>
  );
};

const PortfolioCard = ({ item, onPress }: { item: Portfolio; onPress?: (portfolio: Portfolio) => void }) => {
  const [imageError, setImageError] = useState(false);

  const handlePress = () => {
    const portfolioId = item.PortfolioId || item.PotfolioId;
    console.log('Portfolio pressed:', portfolioId, item.Title);
    if (onPress) {
      onPress(item);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <TouchableOpacity
      style={styles.portfolioCard}
      activeOpacity={0.8}
      onPress={handlePress}
    >
      <View style={styles.portfolioImageContainer}>
        {item.FeaturedImageURL && !imageError ? (
          <Image
            source={{ uri: item.FeaturedImageURL }}
            style={styles.portfolioImage}
            onError={handleImageError}
          />
        ) : (
          <View style={styles.portfolioImagePlaceholder}>
            <Image
              source={require("../../assets/portfolio_icon.jpg")}
              style={styles.portfolioDefaultImage}
            />
          </View>
        )}

        <View style={styles.likeBadge}>
          <MaterialIcons name="favorite" size={14} color="#ffffff" />
          <AppText style={styles.likeText}>
            {toPersianDigits((item.LikeCount || 0).toString())}
          </AppText>
        </View>
      </View>

      <View style={styles.portfolioContent}>
        <View>
          <AppText style={styles.portfolioTitle} numberOfLines={2}>
            {safeString(item.Title, 'نمونه کار بدون نام')}
          </AppText>

          <AppText style={styles.portfolioDescription} numberOfLines={2}>
            {safeString(item.Description, 'بدون توضیحات')}
          </AppText>
        </View>

        <View style={styles.portfolioMeta}>
          <View style={styles.dateContainer}>
            <MaterialIcons name="calendar-month" size={14} color="#666" />
            <AppText style={styles.dateText}>
              {toPersianDigits(
                item.ShamsiInsertDate

              )}
            </AppText>
          </View>

          {item.Rating && (
            <View style={styles.ratingContainer}>
              <MaterialIcons name="star" size={14} color="#FFD700" />
              <AppText style={styles.ratingText}>
                {toPersianDigits(item.Rating.toFixed(1))}
              </AppText>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const BlogPostCard = ({ item, onPress }: { item: BlogPost; onPress?: (post: BlogPost) => void }) => {
  const [imageError, setImageError] = useState(false);  // ✅ اضافه کردن state برای خطای تصویر

  const handlePress = () => {
    console.log('Blog post pressed:', item.BlogPostId, item.Title);
    if (onPress) {
      onPress(item);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <TouchableOpacity
      style={styles.blogPostCard}
      activeOpacity={0.8}
      onPress={handlePress}
    >
      <View style={styles.blogPostImageContainer}>
        {item.FeaturedImageURL && !imageError ? (  // ✅ تغییر
          <Image
            source={{ uri: item.FeaturedImageURL }}  // ✅ تغییر - استفاده مستقیم از URL
            style={styles.blogPostImage}
            onError={handleImageError}  // ✅ اضافه کردن
          />
        ) : (
          <View style={styles.blogPostImagePlaceholder}>
            <Image
              style={styles.postImage}
              source={require("../../assets/blogPost_icon.jpg")}
            />
          </View>
        )}
      </View>

      <View style={styles.blogPostContent}>
        <AppText style={styles.blogPostTitle} numberOfLines={3}>
          {safeString(item.Title, 'مقاله بدون نام')}
        </AppText>

        <View style={styles.blogPostMeta}>
          <View style={styles.blogPostDateContainer}>
            <MaterialIcons name="calendar-month" size={16} color="#666" />
            <AppText style={styles.blogPostDateText}>
              {toPersianDigits(item.ShamsiInsertDate)}  {/* ✅ تغییر از ShamsiInsertDateTime */}
            </AppText>
          </View>

          <View style={styles.blogPostLikeContainer}>
            <MaterialIcons name="favorite" size={16} color="#ff6b6b" />
            <AppText style={styles.blogPostLikeText}>
              {toPersianDigits(item.LikeCount.toString())}
            </AppText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
const GalleryCard = ({ item, onPress }: { item: ImageGallery; onPress?: (gallery: ImageGallery) => void }) => {
  const [imageError, setImageError] = useState(false);

  const handlePress = () => {
    console.log('Gallery pressed:', item.ImageGalleryId, item.Title);
    if (onPress) {
      onPress(item);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  useEffect(() => {
    setImageError(false);
  }, [item.FeaturedImageURL]);

  // ✅ حذف staticImages

  return (
    <TouchableOpacity
      style={styles.galleryCard}
      activeOpacity={0.8}
      onPress={handlePress}
    >
      <View style={styles.galleryImageContainer}>
        {item.FeaturedImageURL && !imageError ? (
          <Image
            source={{ uri: item.FeaturedImageURL }}
            style={styles.galleryImage}
            onError={handleImageError}
          />
        ) : (
          // ✅ نمایش placeholder به جای static images
          <View style={[styles.galleryImagePlaceholder, { backgroundColor: '#e0e0e0' }]}>
            <MaterialIcons name="photo-library" size={48} color="#9e9e9e" />
          </View>
        )}

        <LinearGradient
          colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.8)"]}
          style={styles.galleryGradient}
        />

        <View style={styles.likeCountBadge}>
          <MaterialIcons name="favorite" size={12} color="#ff6b6b" />
          <AppText style={styles.likeCountText}>
            {toPersianDigits(item.LikeCount.toString())}
          </AppText>
        </View>

        <View style={styles.galleryTitleContainer}>
          <AppText style={styles.galleryTitle} numberOfLines={2}>
            {safeString(item.Title, 'گالری بدون نام')}
          </AppText>
        </View>
      </View>
    </TouchableOpacity>
  );
};
const ProductCard = ({ item, onPress }: { item: Product; onPress?: (product: Product) => void }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [imageKey, setImageKey] = useState(0);
  const maxRetries = 3;

  const price = safeNumber(item.Price);
  const specialPrice = safeNumber(item.SpecialSalePrice);
  const discountPercentage = specialPrice > 0 && price > 0
    ? Math.round(((price - specialPrice) / price) * 100)
    : 0;

  const handleImageError = () => {
    if (retryCount < maxRetries) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setImageKey(prev => prev + 1);
      }, 1000 * (retryCount + 1));
    } else {
      setImageError(true);
    }
  };

  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
    setRetryCount(0);
    setImageKey(0);
  }, [item.FeaturedImageURL]);

  return (
    <TouchableOpacity style={styles.productCard} activeOpacity={0.8} onPress={() => onPress?.(item)}>
      <View style={styles.productImageContainer}>
        {/* تصویر دیفالت همیشه نمایش داده میشه */}
        <Image
          source={require("../../assets/Product_icon.jpg")}
          style={styles.productImage}
        />

        {/* تصویر اصلی روی دیفالت قرار میگیره و بعد از لود نمایش داده میشه */}
        {item.FeaturedImageURL && !imageError && (
          <Image
            key={imageKey}
            source={{ uri: `${item.FeaturedImageURL}?retry=${imageKey}` }}
            style={[styles.productImage, { position: 'absolute', opacity: imageLoaded ? 1 : 0 }]}
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
          />
        )}

        {discountPercentage > 0 && (
          <View style={styles.discountBadge}>
            <AppText style={styles.discountText}>{toPersianDigits(discountPercentage.toString())}% تخفیف</AppText>
          </View>
        )}
        {!item.Active && (
          <View style={styles.unavailableBadge}>
            <AppText style={styles.unavailableText}>غیرفعال</AppText>
          </View>
        )}
      </View>
      <View style={styles.productContent}>
        <AppText style={styles.productTitle} numberOfLines={2}>{safeString(item.ProductName, 'نام محصول')}</AppText>
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

const Avatar = ({ name, size = 150, onPress, showOnline = false, member }: AvatarProps) => {
  const [imageError, setImageError] = useState(false);
  const scaleValue = useRef(new Animated.Value(1)).current; // ✅

  const gradientColors = [
    ['#fa709a', '#fee140'],
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c'],
    ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'],
  ];

  const getGradientForName = (name: string) => {
    const index = name ? name.length % gradientColors.length : 0;
    return gradientColors[index];
  };

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  useEffect(() => {
    setImageError(false);
  }, [member?.AvatarImageURL]);

  const selectedGradient = getGradientForName(name);
  const hasProfileImage = member?.AvatarImageURL && member.AvatarImageURL.trim() !== '' && !imageError;

  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      <Animated.View
        style={[
          styles.avatarContainer,
          {
            width: size,
            height: size,
            transform: [{ scale: scaleValue }],
          },
        ]}
      >
        {hasProfileImage ? (
          <View style={[
            styles.avatarImageContainer,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}>
            <Image
              source={{ uri: member.AvatarImageURL }}
              style={[
                styles.avatarImage,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                },
              ]}
              resizeMode="cover"
              onError={handleImageError}
            />
          </View>
        ) : (
          <LinearGradient
            colors={selectedGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.avatarGradient,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={member?.Gender ? "face-man" : "face-woman"}
              size={size * 0.7}
              color="white"
            />
          </LinearGradient>
        )}

        {member?.ShowBlueTick && (
          <View style={[
            styles.blueTickContainer,
            {
              width: size * 0.28,
              height: size * 0.28,
              borderRadius: (size * 0.28) / 2,
              bottom: size * 0.20,
              right: size * 0.05,
            }
          ]}>
            <MaterialIcons
              name="verified"
              size={size * 0.22}
              color="#1DA1F2"
            />
          </View>
        )}

        {name && (
          <AppText style={[styles.nameText, { fontSize: size * 0.13 }]} numberOfLines={1}>
            {safeString(name, 'کاربر')}
          </AppText>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};
const MemberGroupCard = ({
  item,
  onPress
}: {
  item: MemberGroup;
  onPress?: (group: MemberGroup) => void
}) => {
  const scaleValue = new Animated.Value(1);

  // ✅ گرادیانت‌های زیباتر و متنوع‌تر
  const gradientColors = [
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c'],
    ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'],
    ['#fa709a', '#fee140'],
    ['#30cfd0', '#330867'],
    ['#a8edea', '#fed6e3'],
    ['#ff9a9e', '#fecfef'],
    ['#ffecd2', '#fcb69f'],
    ['#ff6e7f', '#bfe9ff'],
    ['#8EC5FC', '#E0C3FC'],
    ['#fbc2eb', '#a6c1ee'],
    ['#fdcbf1', '#e6dee9'],
    ['#a1c4fd', '#c2e9fb'],
    ['#d299c2', '#fef9d7'],
    ['#FEE140', '#FA709A'],
    ['#FDBB2D', '#22C1C3'],
    ['#ee9ca7', '#ffdde1'],
    ['#89f7fe', '#66a6ff'],
    ['#cd9cf2', '#f6f3ff'],
  ];

  // ✅ ایکون‌های مربوط به لباس و خیاطی
  const fashionIcons = [
    "tshirt-crew",
    "hanger",
    
    "ruler",
    "draw",
    "palette",
    "scissors-cutting",
    "content-cut",
    "tag",
    "shopping",
    "badge-account",
    "brush",
 
    "dots-grid",

  ];

  const getGradientForGroup = (id: number) => {
    const index = id % gradientColors.length;
    return gradientColors[index];
  };

  const getIconForGroup = (id: number) => {
    const index = id % fashionIcons.length;
    return fashionIcons[index];
  };

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (onPress) {
      onPress(item);
    }
  };

  const selectedGradient = getGradientForGroup(item.MemberGroupId);
  const selectedIcon = getIconForGroup(item.MemberGroupId);

  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      disabled={!onPress}
      style={styles.memberGroupCardWrapper}
    >
      <Animated.View
        style={[
          styles.memberGroupCard,
          {
            transform: [{ scale: scaleValue }],
          },
        ]}
      >
        <LinearGradient
          colors={selectedGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.memberGroupGradient}
        >
          <View style={styles.memberGroupContent}>
            {/* ✅ ایکون در بالای کارت */}
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={selectedIcon}
                size={28}
                color="rgba(0, 0, 0, 0.95)"
              />
            </View>

            {/* ✅ عنوان در پایین کارت */}
            <AppText style={styles.memberGroupTitle} numberOfLines={2}>
              {safeString(item.GroupName, 'گروه بدون نام')}
            </AppText>
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};
const MemberGroupCardSkeleton = () => {
  return (
    <View style={styles.memberGroupCardWrapper}>
      <View style={styles.memberGroupCard}>
        <SkeletonLoader width="100%" height="100%" borderRadius={20} />
      </View>
    </View>
  );
};


const PortfolioCardSkeleton = () => {
  return (
    <View style={styles.portfolioCard}>
      <View style={styles.portfolioImageContainer}>
        <SkeletonLoader width="100%" height="100%" borderRadius={0} />
      </View>

      <View style={styles.portfolioContent}>
        <SkeletonLoader width="90%" height={16} style={{ marginBottom: 8, alignSelf: 'flex-end' }} />
        <SkeletonLoader width="70%" height={14} style={{ marginBottom: 8, alignSelf: 'flex-end' }} />

        <View style={styles.portfolioMetaSkeleton}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center' }}>
            <SkeletonLoader width={14} height={14} borderRadius={7} style={{ marginLeft: 4 }} />
            <SkeletonLoader width={60} height={12} />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <SkeletonLoader width={14} height={14} borderRadius={7} style={{ marginRight: 4 }} />
            <SkeletonLoader width={25} height={12} />
          </View>
        </View>
      </View>
    </View>
  );
};

const BlogPostCardSkeleton = () => {
  return (
    <View style={styles.blogPostCard}>
      <View style={styles.blogPostImageContainer}>
        <SkeletonLoader width="100%" height="100%" borderRadius={0} />
      </View>

      <View style={styles.blogPostContent}>
        <SkeletonLoader width="90%" height={18} style={{ marginBottom: 12, alignSelf: 'flex-end' }} />
        <SkeletonLoader width="70%" height={16} style={{ marginBottom: 8, alignSelf: 'flex-end' }} />

        <View style={styles.blogPostMetaSkeleton}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center' }}>
            <SkeletonLoader width={16} height={16} borderRadius={8} style={{ marginLeft: 6 }} />
            <SkeletonLoader width={80} height={14} />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <SkeletonLoader width={16} height={16} borderRadius={8} style={{ marginRight: 6 }} />
            <SkeletonLoader width={30} height={14} />
          </View>
        </View>
      </View>
    </View>
  );
};

const GalleryCardSkeleton = () => {
  return (
    <View style={styles.galleryCard}>
      <View style={styles.galleryImageContainer}>
        <SkeletonLoader width="100%" height="100%" borderRadius={16} />

        <View style={styles.galleryTitleContainer}>
          <SkeletonLoader
            width="80%"
            height={18}
            borderRadius={9}
            style={{ alignSelf: 'center', marginBottom: 8 }}
          />
          <SkeletonLoader
            width="60%"
            height={16}
            borderRadius={8}
            style={{ alignSelf: 'center' }}
          />
        </View>
      </View>
    </View>
  );
};

const HeaderSliderSkeleton = () => {
  return (
    <PagerView
      style={[{ minHeight: 200, marginBottom: 20 }, { transform: [{ scaleX: -1 }] }]}
      initialPage={0}
      layoutDirection={"ltr"}
      pageMargin={20}
    >
      {Array.from({ length: 3 }, (_, index) => (
        <View key={`slide-skeleton-${index}`} style={styles.slideSkeletonContainer}>
          <SkeletonLoader width="100%" height={200} borderRadius={20} />
        </View>
      ))}
    </PagerView>
  );
};







const ProductCardSkeleton = () => {
  return (
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
};

const CourseCardSkeleton = () => {
  return (
    <View style={styles.courseSkeletonContainer}>
      <View style={styles.courseImageSkeleton}>
        <SkeletonLoader width="100%" height="100%" borderRadius={0} />
      </View>
      <View style={styles.courseDetailsSkeleton}>
        <View style={styles.courseHeaderSkeleton}>
          <SkeletonLoader width={44} height={44} borderRadius={12} style={{ marginLeft: 12 }} />
          <View style={{ flex: 1 }}>
            <SkeletonLoader width="90%" height={16} style={{ marginBottom: 8, alignSelf: 'flex-end' }} />
            <SkeletonLoader width="70%" height={16} style={{ marginBottom: 8, alignSelf: 'flex-end' }} />
            <SkeletonLoader width="40%" height={14} style={{ marginBottom: 6, alignSelf: 'flex-end' }} />
            <SkeletonLoader width="50%" height={12} style={{ alignSelf: 'flex-end' }} />
          </View>
        </View>
        <View style={styles.locationSectionSkeleton}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 6 }}>
            <SkeletonLoader width={20} height={20} borderRadius={10} style={{ marginLeft: 8 }} />
            <SkeletonLoader width={80} height={13} />
          </View>
        </View>
        <View style={styles.additionalInfoSkeleton}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center' }}>
          </View>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center' }}>
          </View>
        </View>
      </View>
    </View>
  );
};

const AvatarSkeleton = ({ size = 100 }) => {
  return (
    <View style={styles.avatarContainer}>
      <SkeletonLoader
        width={size}
        height={size}
        borderRadius={size / 2}
        style={{ marginBottom: 8 }}
      />
      <SkeletonLoader width={80} height={12} />
    </View>
  );
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const { logout } = useAuth();
  const { setHomeScreenStatus } = useAppUpdate();

  const [selectedScreen, setSelectedScreen] = useState("Home");

  const { data: slides, loading: slidesLoading, error: slidesError, refetch: refetchSlides } = useHomePageSlides();
  const { data: members, loading: membersLoading, error: membersError, refetch: refetchMembers } = useMembers();
  const { data: products, loading: productsLoading, error: productsError, refetch: refetchProducts } = useProducts();
  const { data: courses, loading: coursesLoading, error: coursesError, refetch: refetchCourses } = useCourses();
  const { data: galleries, loading: galleriesLoading, error: galleriesError, refetch: refetchGalleries } = useImageGalleries();
  const { data: blogPosts, loading: blogPostsLoading, error: blogPostsError, refetch: refetchBlogPosts } = useBlogPosts();
  const { data: portfolios, loading: portfoliosLoading, error: portfoliosError, refetch: refetchPortfolios } = usePortfolios();
  const [currentPortfolioPage, setCurrentPortfolioPage] = useState(0);
  const portfolioPagerRef = useRef<PagerView>(null);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  const [currentPage, setCurrentPage] = useState(0);
  const [currentPage2, setCurrentPage2] = useState(0);
  const [currentProductPage, setCurrentProductPage] = useState(0);
  const [currentMemberPage, setCurrentMemberPage] = useState(0);
  const [currentCoursePage, setCurrentCoursePage] = useState(0);
  const [currentGalleryPage, setCurrentGalleryPage] = useState(0);
  const [currentBlogPostPage, setCurrentBlogPostPage] = useState(0);
  const blogPostPagerRef = useRef<PagerView>(null);
  const pagerRef = useRef<PagerView>(null);
  const pagerRef2 = useRef<PagerView>(null);
  const productPagerRef = useRef<PagerView>(null);
  const memberPagerRef = useRef<PagerView>(null);
  const coursePagerRef = useRef<PagerView>(null);
  const galleryPagerRef = useRef<PagerView>(null);
  const { handleSlideClick, isSlideClickable, getSlideTypeLabel } = useHomePageSlideNavigator();
  const [showMenuModal, setShowMenuModal] = useState(false);
  const {
    data: memberGroups,
    loading: memberGroupsLoading,
    error: memberGroupsError,
    refetch: refetchMemberGroups
  } = useMemberGroups();
  const [currentMemberGroupPage, setCurrentMemberGroupPage] = useState(0);
  const memberGroupPagerRef = useRef<PagerView>(null);

  // ✅ در قسمت useEffect ها (بعد از useEffect مقالات):
  const totalMemberGroupPages = Math.ceil(memberGroups.length / 3);
  useEffect(() => {
    Promise.all([
      refetchSlides(),
      refetchCourses(),
      refetchMemberGroups(),
    ]).then(() => {
      setTimeout(() => {
        refetchProducts();  
        refetchMembers();
        refetchGalleries();
        refetchBlogPosts();
        refetchPortfolios();
      }, 2000);
    });
  }, []);
  useEffect(() => {
    if (totalMemberGroupPages > 1) {
      const interval = setInterval(() => {
        if (currentMemberGroupPage < totalMemberGroupPages - 1) {
          memberGroupPagerRef.current?.setPage(currentMemberGroupPage + 1);
          setCurrentMemberGroupPage(currentMemberGroupPage + 1);
        } else {
          memberGroupPagerRef.current?.setPage(0);
          setCurrentMemberGroupPage(0);
        }
      }, autoScrollInterval + 1500);

      return () => clearInterval(interval);
    }
  }, [currentMemberGroupPage, totalMemberGroupPages]);

  useEffect(() => {
    if (memberGroupsError) {
      showToast('خطا در دریافت اطلاعات گروه‌های اصلی. لطفاً دوباره تلاش کنید.', 'error');
    }
  }, [memberGroupsError]);
  const autoScrollInterval = 5000;

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  useEffect(() => {
    if (slidesError) {
      showToast('خطا در دریافت اطلاعات اسلایدر. لطفاً دوباره تلاش کنید.', 'error');
    }
  }, [slidesError]);

  useEffect(() => {
    if (portfoliosError) {
      showToast('خطا در دریافت اطلاعات نمونه کارها. لطفاً دوباره تلاش کنید.', 'error');
    }
  }, [portfoliosError]);

  useEffect(() => {
    if (membersError) {
      showToast('خطا در دریافت اطلاعات اعضا. لطفاً دوباره تلاش کنید.', 'error');
    }
  }, [membersError]);

  useEffect(() => {
    if (productsError) {
      showToast('خطا در دریافت اطلاعات محصولات. لطفاً دوباره تلاش کنید.', 'error');
    }
  }, [productsError]);

  useEffect(() => {
    if (coursesError) {
      showToast('خطا در دریافت اطلاعات دوره‌ها. لطفاً دوباره تلاش کنید.', 'error');
    }
  }, [coursesError]);

  useEffect(() => {
    if (galleriesError) {
      showToast('خطا در دریافت اطلاعات گالری‌ها. لطفاً دوباره تلاش کنید.', 'error');
    }
  }, [galleriesError]);

  useEffect(() => {
    if (blogPostsError) {
      showToast('خطا در دریافت اطلاعات مقالات. لطفاً دوباره تلاش کنید.', 'error');
    }
  }, [blogPostsError]);
  useEffect(() => {
    setHomeScreenStatus(true);
    return () => {
      setHomeScreenStatus(false);
    };
  }, [setHomeScreenStatus]);


  const totalMemberPages = Math.ceil(members.length / 3);
  const totalProductPages = Math.ceil(products.length / 2);
  const totalCoursePages = Math.ceil(courses.length / 2); // تغییر از courses.length به courses.length / 2
  const totalSlidePages = slides.length || 0;
  const totalGalleryPages = Math.ceil(galleries.length / 2);
  const totalBlogPostPages = Math.max(1, blogPosts.length);
  const totalPortfolioPages = Math.ceil(portfolios.length / 2);

  useEffect(() => {
    if (totalSlidePages > 1) {
      const interval = setInterval(() => {
        if (currentPage2 < totalSlidePages - 1) {
          pagerRef2.current?.setPage(currentPage2 + 1);
          setCurrentPage2(currentPage2 + 1);
        } else {
          pagerRef2.current?.setPage(0);
          setCurrentPage2(0);
        }
      }, autoScrollInterval);

      return () => clearInterval(interval);
    }
  }, [currentPage2, totalSlidePages]);

  useEffect(() => {
    if (totalCoursePages > 1) {
      const interval = setInterval(() => {
        if (currentCoursePage < totalCoursePages - 1) {
          coursePagerRef.current?.setPage(currentCoursePage + 1);
          setCurrentCoursePage(currentCoursePage + 1);
        } else {
          coursePagerRef.current?.setPage(0);
          setCurrentCoursePage(0);
        }
      }, autoScrollInterval);

      return () => clearInterval(interval);
    }
  }, [currentCoursePage, totalCoursePages]);

  useEffect(() => {
    if (totalProductPages > 1) {
      const interval = setInterval(() => {
        if (currentProductPage < totalProductPages - 1) {
          productPagerRef.current?.setPage(currentProductPage + 1);
          setCurrentProductPage(currentProductPage + 1);
        } else {
          productPagerRef.current?.setPage(0);
          setCurrentProductPage(0);
        }
      }, autoScrollInterval + 1000);

      return () => clearInterval(interval);
    }
  }, [currentProductPage, totalProductPages]);

  useEffect(() => {
    if (totalMemberPages > 1) {
      const interval = setInterval(() => {
        if (currentMemberPage < totalMemberPages - 1) {
          memberPagerRef.current?.setPage(currentMemberPage + 1);
          setCurrentMemberPage(currentMemberPage + 1);
        } else {
          memberPagerRef.current?.setPage(0);
          setCurrentMemberPage(0);
        }
      }, autoScrollInterval + 2000);

      return () => clearInterval(interval);
    }
  }, [currentMemberPage, totalMemberPages]);

  useEffect(() => {
    if (totalPortfolioPages > 1) {
      const interval = setInterval(() => {
        if (currentPortfolioPage < totalPortfolioPages - 1) {
          portfolioPagerRef.current?.setPage(currentPortfolioPage + 1);
          setCurrentPortfolioPage(currentPortfolioPage + 1);
        } else {
          portfolioPagerRef.current?.setPage(0);
          setCurrentPortfolioPage(0);
        }
      }, autoScrollInterval + 5000);

      return () => clearInterval(interval);
    }
  }, [currentPortfolioPage, totalPortfolioPages]);

  useEffect(() => {
    if (totalGalleryPages > 1) {
      const interval = setInterval(() => {
        if (currentGalleryPage < totalGalleryPages - 1) {
          galleryPagerRef.current?.setPage(currentGalleryPage + 1);
          setCurrentGalleryPage(currentGalleryPage + 1);
        } else {
          galleryPagerRef.current?.setPage(0);
          setCurrentGalleryPage(0);
        }
      }, autoScrollInterval + 3000);

      return () => clearInterval(interval);
    }
  }, [currentGalleryPage, totalGalleryPages]);

  useEffect(() => {
    if (totalBlogPostPages > 1) {
      const interval = setInterval(() => {
        if (currentBlogPostPage < totalBlogPostPages - 1) {
          blogPostPagerRef.current?.setPage(currentBlogPostPage + 1);
          setCurrentBlogPostPage(currentBlogPostPage + 1);
        } else {
          blogPostPagerRef.current?.setPage(0);
          setCurrentBlogPostPage(0);
        }
      }, autoScrollInterval + 4000);

      return () => clearInterval(interval);
    }
  }, [currentBlogPostPage, totalBlogPostPages]);

  const createPortfolioSkeletonPages = () => {
    return Array.from({ length: 2 }, (_, pageIndex) => (
      <View key={`portfolio-skeleton-page-${pageIndex}`} style={{ transform: [{ scaleX: -1 }] }}>
        <View style={styles.portfolioGrid}>
          {Array.from({ length: 2 }, (_, cardIndex) => (
            <View key={`portfolio-skeleton-${pageIndex}-${cardIndex}`} style={styles.portfolioWrapper}>
              <PortfolioCardSkeleton />
            </View>
          ))}
        </View>
      </View>
    ));
  };
  const createMemberGroupSkeletonPages = () => {
    return Array.from({ length: 2 }, (_, pageIndex) => (
      <View key={`membergroup-skeleton-page-${pageIndex}`} style={{ transform: [{ scaleX: -1 }] }}>
        <View style={styles.memberGroupContainer}>
          {Array.from({ length: 3 }, (_, cardIndex) => (
            <MemberGroupCardSkeleton key={`membergroup-skeleton-${pageIndex}-${cardIndex}`} />
          ))}
        </View>
      </View>
    ));
  };

  const createMemberGroupPages = () => {
    if (memberGroups.length === 0) {
      return [
        <View key="no-membergroups" style={{ transform: [{ scaleX: -1 }] }}>
          <View style={styles.noMemberGroupContainer}>
            <MaterialIcons name="group" size={48} color="#9e9e9e" />
            <AppText style={styles.noMemberGroupText}>هیچ گروهی موجود نیست</AppText>
          </View>
        </View>
      ];
    }

    const pages = [];
    const reversedGroups = [...memberGroups].reverse();

    for (let i = 0; i < reversedGroups.length; i += 3) {
      const pageGroups = reversedGroups.slice(i, i + 3);
      pages.push(
        <View key={`membergroup-page-${i}`} style={{ transform: [{ scaleX: -1 }] }}>
          <View style={styles.memberGroupContainer}>
            {pageGroups.map((group) => (
              <MemberGroupCard
                key={`membergroup-${group.MemberGroupId}`}
                item={group}
                onPress={handleMemberGroupPress}
              />
            ))}
          </View>
        </View>
      );
    }
    return pages;
  };
  const handleMemberGroupPress = (groupData: MemberGroup) => {
    console.log('Navigating to AllMembers with group filter:', groupData.MemberGroupId);
    try {
      navigation.navigate("AllMembers" as never, {
        filterGroupId: groupData.MemberGroupId,
        filterGroupName: groupData.GroupName
      } as never);
    } catch (error) {
      console.error('Navigation error (MemberGroup):', error);
      showToast('خطا در باز کردن گروه', 'error');
    }
  };

  const handleViewAllMemberGroups = () => {
    requestAnimationFrame(() => {
      try {
        navigation.navigate("AllMemberGroups" as never);
      } catch (error) {
        console.error('Navigation error (MemberGroups):', error);
        showToast('خطا در باز کردن لیست گروه‌ها', 'error');
      }
    });
  };
  const handleLogout = async () => {
    try {
      await logout();
      showToast('با موفقیت خارج شدید', 'success');
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Login" }],
        })
      );
    } catch (error) {
      console.error('Logout error:', error);
      showToast('خطا در خروج از حساب کاربری', 'error');
    }
  };

  const handleMenuNavigation = (screen) => {
    if (screen === 'LOGOUT') {
      handleLogout();
    } else {
      navigation.navigate(screen as never);
    }
  };

  const createPortfolioPages = () => {
    if (portfolios.length === 0) {
      return [
        <View key="no-portfolios" style={{ transform: [{ scaleX: -1 }] }}>
          <View style={styles.noPortfolioContainer}>
            <MaterialIcons name="brush" size={48} color="#9e9e9e" />
            <AppText style={styles.noPortfolioText}>هیچ نمونه کاری موجود نیست</AppText>
          </View>
        </View>
      ];
    }

    const pages = [];
    const reversedPortfolios = [...portfolios].reverse();

    for (let i = 0; i < reversedPortfolios.length; i += 2) {
      const pagePortfolios = reversedPortfolios.slice(i, i + 2);
      pages.push(
        <View key={`portfolio-page-${i}`} style={{ transform: [{ scaleX: -1 }] }}>
          <View style={styles.portfolioGrid}>
            {pagePortfolios.map((portfolio, index) => {
              const portfolioId = portfolio.PortfolioId || portfolio.PotfolioId;
              return (
                <View key={`portfolio-${portfolioId}-page${Math.floor(i / 2)}-pos${index}`} style={styles.portfolioWrapper}>
                  <PortfolioCard
                    item={portfolio}
                    onPress={handlePortfolioPress}
                  />
                </View>
              );
            })}
          </View>
        </View>
      );
    }
    return pages;
  };

  const createBlogPostSkeletonPages = () => {
    return Array.from({ length: 3 }, (_, index) => (
      <View key={`blogpost-skeleton-${index}`} style={{ transform: [{ scaleX: -1 }] }}>
        <BlogPostCardSkeleton />
      </View>
    ));
  };

  const createBlogPostPages = () => {
    if (blogPosts.length === 0) {
      return [
        <View key="no-blogposts" style={{ transform: [{ scaleX: -1 }] }}>
          <View style={styles.noBlogPostContainer}>
            <MaterialIcons name="article" size={48} color="#9e9e9e" />
            <AppText style={styles.noBlogPostText}>هیچ مقاله‌ای موجود نیست</AppText>
          </View>
        </View>
      ];
    }

    const reversedBlogPosts = [...blogPosts].reverse();

    return reversedBlogPosts.map((post, index) => (
      <View key={`blogpost-page-${post.BlogPostId}`} style={{ transform: [{ scaleX: -1 }] }}>
        <TouchableOpacity
          onPress={() => handleBlogPostPress(post)}
          activeOpacity={0.8}
        >
          <BlogPostCard item={post} onPress={handleBlogPostPress} />
        </TouchableOpacity>
      </View>
    ));
  };

  const createGallerySkeletonPages = () => {
    return Array.from({ length: 2 }, (_, pageIndex) => (
      <View key={`gallery-skeleton-page-${pageIndex}`} style={{ transform: [{ scaleX: -1 }] }}>
        <View style={styles.galleryGrid}>
          {Array.from({ length: 2 }, (_, cardIndex) => (
            <View key={`gallery-skeleton-${pageIndex}-${cardIndex}`} style={styles.galleryWrapper}>
              <GalleryCardSkeleton />
            </View>
          ))}
        </View>
      </View>
    ));
  };

  const createGalleryPages = () => {
    if (galleries.length === 0) {
      return [
        <View key="no-galleries" style={{ transform: [{ scaleX: -1 }] }}>
          <View style={styles.noGalleryContainer}>
            <MaterialIcons name="photo-library" size={48} color="#9e9e9e" />
            <AppText style={styles.noGalleryText}>هیچ گالری‌ای موجود نیست</AppText>
          </View>
        </View>
      ];
    }

    const pages = [];
    const reversedGalleries = [...galleries].reverse();

    for (let i = 0; i < reversedGalleries.length; i += 2) {
      const pageGalleries = reversedGalleries.slice(i, i + 2);
      pages.push(
        <View key={`gallery-page-${i}`} style={{ transform: [{ scaleX: -1 }] }}>
          <View style={styles.galleryGrid}>
            {pageGalleries.map((gallery) => (
              <View key={`gallery-${gallery.ImageGalleryId}`} style={styles.galleryWrapper}>
                <GalleryCard
                  item={gallery}
                  onPress={handleGalleryPress}
                />
              </View>
            ))}
          </View>
        </View>
      );
    }
    return pages;
  };

  const createCourseSkeletonPages = () => {
    return Array.from({ length: 2 }, (_, pageIndex) => (
      <View key={`course-skeleton-page-${pageIndex}`} style={{ transform: [{ scaleX: -1 }] }}>
        <View style={styles.courseGrid}>
          {Array.from({ length: 2 }, (_, cardIndex) => (
            <View key={`course-skeleton-${pageIndex}-${cardIndex}`} style={styles.courseWrapper}>
              <CourseCardSkeleton />
            </View>
          ))}
        </View>
      </View>
    ));
  };

  const createProductSkeletonPages = () => {
    return Array.from({ length: 2 }, (_, pageIndex) => (
      <View key={`product-skeleton-page-${pageIndex}`} style={{ transform: [{ scaleX: -1 }] }}>
        <View style={styles.productGrid}>
          {Array.from({ length: 2 }, (_, cardIndex) => (
            <View key={`product-skeleton-${pageIndex}-${cardIndex}`} style={styles.productWrapper}>
              <ProductCardSkeleton />
            </View>
          ))}
        </View>
      </View>
    ));
  };

  const createMemberSkeletonPages = () => {
    return Array.from({ length: 2 }, (_, pageIndex) => (
      <View key={`member-skeleton-page-${pageIndex}`} style={{ transform: [{ scaleX: -1 }] }}>
        <View style={styles.peopleContainer}>
          {Array.from({ length: 3 }, (_, avatarIndex) => (
            <AvatarSkeleton key={`avatar-skeleton-${pageIndex}-${avatarIndex}`} size={100} />
          ))}
        </View>
      </View>
    ));
  };

  const createMemberPages = () => {
    const pages = [];
    for (let i = 0; i < members.length; i += 3) {
      const pageMembers = members.slice(i, i + 3);
      pages.push(
        <View key={`member-page-${i}`} style={{ transform: [{ scaleX: -1 }] }}>
          <View style={styles.peopleContainer}>
            {pageMembers.map((member) => (
              <Avatar
                key={`member-${member.MemberId}`}
                name={member.Name}
                size={100}
                showOnline={true}
                member={member}
                onPress={() => handleMemberPress(member)}
              />
            ))}
          </View>
        </View>
      );
    }
    return pages;
  };

  const createProductPages = () => {
    const pages = [];
    const reversedProducts = [...products].reverse();

    for (let i = 0; i < reversedProducts.length; i += 2) {
      const pageProducts = reversedProducts.slice(i, i + 2);
      pages.push(
        <View key={`product-page-${i}`} style={{ transform: [{ scaleX: -1 }] }}>
          <View style={styles.productGrid}>
            {pageProducts.map((product) => (
              <View key={`product-${product.ProductId}`} style={styles.productWrapper}>
                <ProductCard
                  item={product}
                  onPress={handleProductPress}
                />
              </View>
            ))}
          </View>
        </View>
      );
    }
    return pages;
  };

  const createCoursePages = () => {
    if (courses.length === 0) {
      return [
        <View key="no-courses" style={{ transform: [{ scaleX: -1 }] }}>
          <View style={styles.noCourseContainer}>
            <MaterialIcons name="school" size={48} color="#9e9e9e" />
            <AppText style={styles.noCourseText}>هیچ دوره‌ای موجود نیست</AppText>
          </View>
        </View>
      ];
    }

    const pages = [];
    const reversedCourses = [...courses].reverse();

    // تقسیم کورس‌ها به صفحات 2تایی
    for (let i = 0; i < reversedCourses.length; i += 2) {
      const pageCourses = reversedCourses.slice(i, i + 2);
      pages.push(
        <View key={`course-page-${i}`} style={{ transform: [{ scaleX: -1 }] }}>
          <View style={styles.courseGrid}>
            {pageCourses.map((course, index) => (
              <View key={`course-${course.CourseId}-${index}`} style={styles.courseWrapper}>
                <CourseCard course={course} onPress={handleCoursePress} />
              </View>
            ))}
            {/* اگر فقط یک کورس باشد، یک فضای خالی اضافه می‌کنیم */}
            {pageCourses.length === 1 && (
              <View style={styles.courseWrapper} />
            )}
          </View>
        </View>
      );
    }
    return pages;
  };

  const handlePrevSlide = () => {
    const newPage = currentPage2 > 0 ? currentPage2 - 1 : totalSlidePages - 1;
    pagerRef2.current?.setPage(newPage);
  };

  const handleNextSlide = () => {
    const newPage = currentPage2 < totalSlidePages - 1 ? currentPage2 + 1 : 0;
    pagerRef2.current?.setPage(newPage);
  };

  const createSlidePages = () => {
    if (slides.length === 0) {
      return [];
    }

    return slides.map((slide) => (
      <View key={slide.HomePageSlideId} style={{ transform: [{ scaleX: -1 }] }}>
        <ClickableSlide
          slideData={slide}
          showToast={showToast}
          activeOpacity={isSlideClickable(slide) ? 0.8 : 1}
          onSlidePress={(slideData) => {
            console.log('Slide pressed:', {
              id: slideData.HomePageSlideId,
              type: getSlideTypeLabel(slideData.ClickTrigger),
              clickTrigger: slideData.ClickTrigger
            });
          }}
        >
          <Image
            style={styles.headerBox}
            source={{ uri: slide.ImageURL }}  // ✅ حذف defaultSource
            resizeMode="cover"
          />
        </ClickableSlide>
      </View>
    ));
  };



  const handlePortfolioPress = (portfolioData: Portfolio) => {
    console.log('Navigating to Portfolio with:', portfolioData);
    const portfolioId = portfolioData.PortfolioId || portfolioData.PotfolioId;

    if (!portfolioId || portfolioId === 0) {
      console.error('Invalid portfolio ID:', portfolioId);
      showToast('خطا: شناسه نمونه کار نامعتبر است', 'error');
      return;
    }

    console.log('Final portfolioId:', portfolioId);

    requestAnimationFrame(() => {
      try {
        navigation.navigate("PortfolioDetail" as never, {
          title: portfolioData.Title,
          portfolioId: portfolioId
        } as never);
      } catch (error) {
        console.error('Navigation error (Portfolio):', error);
        showToast('خطا در باز کردن نمونه کار', 'error');
      }
    });
  };

  const handleViewAllPortfolios = () => {
    requestAnimationFrame(() => {
      navigation.navigate("AllPortfolio" as never);
    });
  };

  const handleCoursePress = (courseData: Course) => {
    console.log('Navigating to CourseDetails with:', courseData.CourseId);
    requestAnimationFrame(() => {
      try {
        navigation.navigate("CourseDetails" as never, { courseData } as never);
      } catch (error) {
        console.error('Navigation error (Course):', error);
        showToast('خطا در باز کردن جزئیات دوره', 'error');
      }
    });
  };

  const handleProductPress = (productData: Product) => {
    console.log('Navigating to ProductDetails with:', productData.ProductId);
    requestAnimationFrame(() => {
      try {
        navigation.navigate("ProductDetails" as never, {
          productData: productData,
          productId: productData.ProductId
        } as never);
      } catch (error) {
        console.error('Navigation error (Product):', error);
        showToast('خطا در باز کردن جزئیات محصول', 'error');
      }
    });
  };

  const handleMemberPress = (memberData: Member) => {
    console.log('Navigating to UserProfile with:', memberData.MemberId);
    requestAnimationFrame(() => {
      try {
        navigation.navigate("UserProfile" as never, { userData: memberData } as never);
      } catch (error) {
        console.error('Navigation error (Member):', error);
        showToast('خطا در باز کردن پروفایل کاربر', 'error');
      }
    });
  };

  const handleBlogPostPress = (postData: BlogPost) => {
    console.log('Navigating to BlogPost with:', postData.BlogPostId);
    requestAnimationFrame(() => {
      try {
        navigation.navigate("MagDetailes" as never, {
          title: postData.Title,
          blogId: postData.BlogPostId
        } as never);
      } catch (error) {
        console.error('Navigation error (BlogPost):', error);
        showToast('خطا در باز کردن مقاله', 'error');
      }
    });
  };

  const handleViewAllBlogPosts = () => {
    requestAnimationFrame(() => {
      navigation.navigate("وبلاگ" as never);
    });
  };

  const handleGalleryPress = (galleryData: ImageGallery) => {
    console.log('Navigating to GalleryDetails with:', galleryData.ImageGalleryId);
    requestAnimationFrame(() => {
      try {
        navigation.navigate("GalleryItem" as never, {
          title: galleryData.Title,
          galleryId: galleryData.ImageGalleryId,
          galleryData: galleryData
        } as never);
      } catch (error) {
        console.error('Navigation error (Gallery):', error);
        showToast('خطا در باز کردن گالری', 'error');
      }
    });
  };

  const handleViewAllCourses = () => {
    requestAnimationFrame(() => {
      navigation.navigate("AllCourses" as never);
    });
  };

  const handleViewAllProducts = () => {
    requestAnimationFrame(() => {
      navigation.navigate("AllProducts" as never);
    });
  };

  const handleViewAllMembers = () => {
    requestAnimationFrame(() => {
      navigation.navigate("AllMembers" as never);
    });
  };

  const handleViewAllGalleries = () => {
    requestAnimationFrame(() => {
      navigation.navigate("AllGalleries" as never);
    });
  };

  return (
    <View style={styles.container}>
      <MainBackground />

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
      <TouchableOpacity
        style={styles.frameButton}
        onPress={() => {
          console.log('Frame logo pressed');
        }}
      >
        <View style={styles.frameButtonContainer}>
          <Image
            source={require("../../assets/main-icon.png")}
            style={styles.frameImage}
          />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.notificationButton}
        onPress={() => setShowMenuModal(true)}
      >
        <View style={styles.notificationButtonContainer}>
          <MaterialIcons
            name="menu"
            size={24}
            color="#6366f1"
          />
        </View>
      </TouchableOpacity>

      <View style={styles.headerContainer}>
        <View style={styles.titleWrapper}>
          <AppText style={styles.headerTitle}>فریمد</AppText>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {slidesLoading ? (
          <HeaderSliderSkeleton />
        ) : slidesError ? (
          <View style={styles.errorSliderContainer}>
            <MaterialIcons name="error" size={48} color="#9e9e9e" />
            <AppText style={styles.errorSliderText}>خطا در دریافت اسلایدر</AppText>
            <TouchableOpacity style={styles.retryButton} onPress={refetchSlides}>
              <MaterialIcons name="refresh" size={20} color={colors.white} />
              <AppText style={styles.retryButtonText}>تلاش مجدد</AppText>
            </TouchableOpacity>
          </View>
        ) : (
              <View style={styles.sliderContainer}>
                <PagerView
                  ref={pagerRef2}
                  style={[{ minHeight: 200 }, { transform: [{ scaleX: -1 }] }]}
                  initialPage={0}
                  layoutDirection={"ltr"}
                  pageMargin={20}
                  onPageSelected={(e) => setCurrentPage2(e.nativeEvent.position)}
                  overScrollMode="never"
                >
                  {createSlidePages()}
                </PagerView>

                {totalSlidePages > 1 && (
                  <>
                    <TouchableOpacity
                      style={styles.sliderArrowRight}
                      onPress={handlePrevSlide}
                      activeOpacity={0.7}
                    >
                      <View style={styles.arrowIconContainer}>
                        <MaterialIcons name="chevron-right" size={28} color="#fff" />
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.sliderArrowLeft}
                      onPress={handleNextSlide}
                      activeOpacity={0.7}
                    >
                      <View style={styles.arrowIconContainer}>
                        <MaterialIcons name="chevron-left" size={28} color="#fff" />
                      </View>
                    </TouchableOpacity>
                  </>
                )}
              </View>
                  
        )}
        <View style={styles.titleBox}>
          <View style={{ flexDirection: "row-reverse", alignItems: "center" }}>
            <View style={{ backgroundColor: '#00BCD4', width: 12, height: 12}} />
            <AppText style={styles.bodyText}>گروه‌های اصلی</AppText>
          </View>

          {!memberGroupsError && (
            <>
              {memberGroupsLoading ? (
                <SkeletonLoader width={80} height={30} borderRadius={15} />
              ) : (
                <TouchableOpacity
                    hitSlop={{ top: 30, bottom: 30, left: 30, right: 30 }} 
                    style={[styles.viewAllButton, { zIndex: 20 }]}
                  onPress={handleViewAllMemberGroups}
                >
                  <MaterialIcons
                    name="chevron-left"
                    size={18}
                    color={colors.primary}
                    style={{ marginLeft: 6 }}
                  />
                  <AppText style={styles.viewAllText}>مشاهده همه</AppText>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
        {memberGroupsError && (
          <View style={styles.errorIconContainer}>
            <MaterialIcons name="error" size={48} color="#9e9e9e" />
            <AppText style={styles.errorIconText}>خطا در دریافت اطلاعات گروه‌ها</AppText>
            <TouchableOpacity style={styles.retryButton} onPress={refetchMemberGroups}>
              <MaterialIcons name="refresh" size={20} color={colors.white} />
              <AppText style={styles.retryButtonText}>تلاش مجدد</AppText>
            </TouchableOpacity>
          </View>
        )}

        {!memberGroupsError && (
          <PagerView
            ref={memberGroupPagerRef}
            style={[{ minHeight:180 , marginTop:-30}, { transform: [{ scaleX: -1 }] }]}
            initialPage={0}
            layoutDirection={"ltr"} 
            pageMargin={20}
            onPageSelected={(e) => setCurrentMemberGroupPage(e.nativeEvent.position)}
          >
            {memberGroupsLoading ? createMemberGroupSkeletonPages() : createMemberGroupPages()}
          </PagerView>
        )}
        <View style={styles.titleBox}>
          <View style={{ flexDirection: "row-reverse", alignItems: "center" }}>
            <View
              style={{ backgroundColor: '#FFD700', width: 12, height: 12 }}
            />
            <AppText style={styles.bodyText}>جدیدترین دوره ها</AppText>
          </View>

          {!coursesError && (
            <>
              {coursesLoading ? (
                <SkeletonLoader width={80} height={30} borderRadius={15} />
              ) : (
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={handleViewAllCourses}
                >
                  <MaterialIcons
                    name="chevron-left"
                    size={18}
                    color={colors.primary}
                    style={{ marginLeft: 6 }}
                  />
                  <AppText style={styles.viewAllText}>مشاهده همه</AppText>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {coursesError && (
          <View style={styles.errorIconContainer}>
            <MaterialIcons
              name="error"
              size={48}
              color="#9e9e9e"
            />
            <AppText style={styles.errorIconText}>خطا در دریافت اطلاعات دوره‌ها</AppText>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={refetchCourses}
            >
              <MaterialIcons name="refresh" size={20} color={colors.white} />
              <AppText style={styles.retryButtonText}>تلاش مجدد</AppText>
            </TouchableOpacity>
          </View>
        )}

        {!coursesError && (
          <PagerView
            ref={coursePagerRef}
            initialPage={0}
            layoutDirection={"rtl"}
            pageMargin={20}
            style={[
              styles.pagerView,
              { transform: [{ scaleX: -1 }] },
              { minHeight: 450, marginBottom: 20 },
            ]}
            onPageSelected={(e) => setCurrentCoursePage(e.nativeEvent.position)}
          >
            {coursesLoading ? createCourseSkeletonPages() : createCoursePages()}
          </PagerView>
        )}

        <View style={styles.titleBox}>
          <View style={{ flexDirection: "row-reverse", alignItems: "center", }}>
            <View
              style={{ backgroundColor: colors.primary, width: 12, height: 12 }}
            />
            <AppText style={styles.bodyText}>جدیدترین محصولات</AppText>
          </View>

          {!productsError && (
            <>
              {productsLoading ? (
                <SkeletonLoader width={80} height={30} borderRadius={15} />
              ) : (
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={handleViewAllProducts}
                >
                  <MaterialIcons
                    name="chevron-left"
                    size={18}
                    color={colors.primary}
                    style={{ marginLeft: 6 }}
                  />
                  <AppText style={styles.viewAllText}>مشاهده همه</AppText>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {productsError && (
          <View style={styles.errorIconContainer}>
            <MaterialIcons
              name="error"
              size={48}
              color="#9e9e9e"
            />
            <AppText style={styles.errorIconText}>خطا در دریافت اطلاعات محصولات</AppText>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={refetchProducts}
            >
              <MaterialIcons name="refresh" size={20} color={colors.white} />
              <AppText style={styles.retryButtonText}>تلاش مجدد</AppText>
            </TouchableOpacity>
          </View>
        )}

        {!productsError && (
          <PagerView
            ref={productPagerRef}
            initialPage={0}
            layoutDirection={"rtl"}
            pageMargin={20}
            style={[
              { transform: [{ scaleX: -1 }] },
              { minHeight: 280, marginBottom: 20 },
            ]}
            onPageSelected={(e) => setCurrentProductPage(e.nativeEvent.position)}
          >
            {productsLoading ? createProductSkeletonPages() : (products.length > 0 ? createProductPages() : [])}
          </PagerView>
        )}

        <View style={styles.titleBox}>
          <View style={{ flexDirection: "row-reverse", alignItems: "center" }}>
            <View
              style={{ backgroundColor: '#FF5722', width: 12, height: 12 }}
            />
            <AppText style={styles.bodyText}>جدیدترین مقالات</AppText>
          </View>

          {!blogPostsError && (
            <>
              {blogPostsLoading ? (
                <SkeletonLoader width={80} height={30} borderRadius={15} />
              ) : (
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={handleViewAllBlogPosts}
                >
                  <MaterialIcons
                    name="chevron-left"
                    size={18}
                    color={colors.primary}
                    style={{ marginLeft: 6 }}
                  />
                  <AppText style={styles.viewAllText}>مشاهده همه</AppText>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {blogPostsError && (
          <View style={styles.errorIconContainer}>
            <MaterialIcons
              name="error"
              size={48}
              color="#9e9e9e"
            />
            <AppText style={styles.errorIconText}>خطا در دریافت اطلاعات مقالات</AppText>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={refetchBlogPosts}
            >
              <MaterialIcons name="refresh" size={20} color={colors.white} />
              <AppText style={styles.retryButtonText}>تلاش مجدد</AppText>
            </TouchableOpacity>
          </View>
        )}

        {!blogPostsError && (
          <PagerView
            ref={blogPostPagerRef}
            initialPage={0}
            layoutDirection={"rtl"}
            pageMargin={20}
            style={[
              { transform: [{ scaleX: -1 }] },
              { minHeight: 330, marginBottom: 20 },
            ]}
            onPageSelected={(e) => setCurrentBlogPostPage(e.nativeEvent.position)}
          >
            {blogPostsLoading ? createBlogPostSkeletonPages() : (blogPosts.length > 0 ? createBlogPostPages() : [])}
          </PagerView>
        )}

        <View style={styles.titleBox}>
          <View style={{ flexDirection: "row-reverse", alignItems: "center" }}>
            <View
              style={{ backgroundColor: '#9370DB', width: 12, height: 12 }}
            />
            <AppText style={styles.bodyText}>جدیدترین نمونه کارها</AppText>
          </View>

          {!portfoliosError && (
            <>
              {portfoliosLoading ? (
                <SkeletonLoader width={80} height={30} borderRadius={15} />
              ) : (
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={handleViewAllPortfolios}
                >
                  <MaterialIcons
                    name="chevron-left"
                    size={18}
                    color={colors.primary}
                    style={{ marginLeft: 6 }}
                  />
                  <AppText style={styles.viewAllText}>مشاهده همه</AppText>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {portfoliosError && (
          <View style={styles.errorIconContainer}>
            <MaterialIcons
              name="error"
              size={48}
              color="#9e9e9e"
            />
            <AppText style={styles.errorIconText}>خطا در دریافت اطلاعات نمونه کارها</AppText>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={refetchPortfolios}
            >
              <MaterialIcons name="refresh" size={20} color={colors.white} />
              <AppText style={styles.retryButtonText}>تلاش مجدد</AppText>
            </TouchableOpacity>
          </View>
        )}

        {!portfoliosError && (
          <PagerView
            ref={portfolioPagerRef}
            initialPage={0}
            layoutDirection={"rtl"}
            pageMargin={20}
            style={[
              { transform: [{ scaleX: -1 }] },
              { minHeight: 300, marginBottom: 20 },
            ]}
            onPageSelected={(e) => setCurrentPortfolioPage(e.nativeEvent.position)}
          >
            {portfoliosLoading ? createPortfolioSkeletonPages() : (portfolios.length > 0 ? createPortfolioPages() : [])}
          </PagerView>
        )}

        <View style={styles.titleBox}>
          <View style={{ flexDirection: "row-reverse", alignItems: "center" }}>
            <View
              style={{ backgroundColor: '#9C27B0', width: 12, height: 12 }}
            />
            <AppText style={styles.bodyText}>جدیدترین گالری‌ها</AppText>
          </View>

          {!galleriesError && (
            <>
              {galleriesLoading ? (
                <SkeletonLoader width={80} height={30} borderRadius={15} />
              ) : (
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={handleViewAllGalleries}
                >
                  <MaterialIcons
                    name="chevron-left"
                    size={18}
                    color={colors.primary}
                    style={{ marginLeft: 6 }}
                  />
                  <AppText style={styles.viewAllText}>مشاهده همه</AppText>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {galleriesError && (
          <View style={styles.errorIconContainer}>
            <MaterialIcons
              name="error"
              size={48}
              color="#9e9e9e"
            />
            <AppText style={styles.errorIconText}>خطا در دریافت اطلاعات گالری‌ها</AppText>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={refetchGalleries}
            >
              <MaterialIcons name="refresh" size={20} color={colors.white} />
              <AppText style={styles.retryButtonText}>تلاش مجدد</AppText>
            </TouchableOpacity>
          </View>
        )}

        {!galleriesError && (
          <PagerView
            ref={galleryPagerRef}
            initialPage={0}
            layoutDirection={"rtl"}
            pageMargin={20}
            style={[
              { transform: [{ scaleX: -1 }] },
              { minHeight: 200, marginBottom: 10 },
            ]}
            onPageSelected={(e) => setCurrentGalleryPage(e.nativeEvent.position)}
          >
            {galleriesLoading ? createGallerySkeletonPages() : (galleries.length > 0 ? createGalleryPages() : [])}
          </PagerView>
        )}

        <View style={styles.titleBox}>
          <View style={{ flexDirection: "row-reverse", alignItems: "center" }}>
            <View
              style={{ backgroundColor: '#FF69B4', width: 12, height: 12 }}
            />
            <AppText style={styles.bodyText}>اعضای جدید</AppText>
          </View>

          {!membersError && (
            <>
              {membersLoading ? (
                <SkeletonLoader width={60} height={20} borderRadius={10} />
              ) : (
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={handleViewAllMembers}
                >
                  <MaterialIcons
                    name="chevron-left"
                    size={18}
                    color={colors.primary}
                    style={{ marginRight: 6 }}
                  />
                  <AppText style={styles.viewAllText}>مشاهده همه</AppText>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {membersError && (
          <View style={styles.errorIconContainer}>
            <MaterialIcons
              name="error"
              size={48}
              color="#9e9e9e"
            />
            <AppText style={styles.errorIconText}>خطا در دریافت اطلاعات اعضا</AppText>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={refetchMembers}
            >
              <MaterialIcons name="refresh" size={20} color={colors.white} />
              <AppText style={styles.retryButtonText}>تلاش مجدد</AppText>
            </TouchableOpacity>
          </View>
        )}

        {!membersError && (
          <PagerView
            ref={memberPagerRef}
            style={[{ minHeight: 170 }, { transform: [{ scaleX: -1 }] }]}
            initialPage={0}
            layoutDirection={"rtl"}
            pageMargin={20}
            onPageSelected={(e) => setCurrentMemberPage(e.nativeEvent.position)}
          >
            {membersLoading ? createMemberSkeletonPages() : (members.length > 0 ? createMemberPages() : [])}
          </PagerView>
        )}
      </ScrollView>
      <MenuModal
        visible={showMenuModal}
        onClose={() => setShowMenuModal(false)}
        onNavigate={handleMenuNavigation}
        showToast={showToast}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 50,
    paddingTop: StatusBar.currentHeight + 35,
    paddingHorizontal: 20,
  },
  frameButton: {
    position: 'absolute',
    top: StatusBar.currentHeight + 45,
    right: 20,
    zIndex: 1000,
  },
  postImage: {
    height: "100%",
    width: "100%",
  },
  frameButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ffffff',
    marginTop: -12
  },
  frameImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    padding: 10
  },
  notificationButton: {
    position: 'absolute',
    top: StatusBar.currentHeight + 45,
    left: 20,
    zIndex: 1000,
  },
  notificationButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: -100
  },
  bodyText: {
    fontSize: 20,
    marginRight: 10,

    fontFamily: "Yekan_Bakh_Bold",
  },
  headerBox: {
    height:200,
    width: "100%",
    borderRadius: 20,
  },
  titleBox: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
    marginTop: 15,
  },
  pagerView: {
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 200
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.primary,
    textAlign: 'center',
  },
  slideSkeletonContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
  },
  peopleContainer: {
    height: 170,
    display: "flex",
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
    paddingHorizontal: 10,
    direction:"rtl"
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    marginVertical: 8,
  },
  avatarGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  sliderContainer: {
    position: 'relative',
    minHeight: 200,
    marginBottom: 20,
  },
  sliderArrowLeft: {
    position: 'absolute',
    left: 15,
    top: '50%',
    marginTop: -20,
    zIndex: 999,
  },
  sliderArrowRight: {
    position: 'absolute',
    right: 15,
    top: '50%',
    marginTop: -20,
    zIndex: 999,
  },
  arrowIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  nameText: {
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Yekan_Bakh_Bold',
    color: '#333',
    maxWidth: 120,
    fontWeight: '600',
  },
  productGrid: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    width: '100%',
  },
  productWrapper: {
    width: '48%',
  },
  productCard: {
    width: '100%',
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
    marginBottom: 10,
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
  memberGroupContainer: {
    minHeight: 180,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
    direction:"rtl"
  },
  memberGroupCardWrapper: {
    marginHorizontal: 8,
    marginVertical: 10,
  },
  memberGroupCard: {
    width: 100,        // ✅ تغییر - عرض بیشتر
    height: 100,       // ✅ تغییر - مربعی
    borderRadius: 24,  // ✅ تغییر - گوشه‌های گردتر
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,       // ✅ تغییر - سایه عمیق‌تر
    },
    shadowOpacity: 0.25,  // ✅ تغییر
    shadowRadius: 10,     // ✅ تغییر
    elevation: 10,        // ✅ تغییر
  },
  memberGroupGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,      // ✅ تغییر
    borderWidth: 3,
    borderColor: '#fff',
    borderRadius: 24,
},
  memberGroupContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  memberGroupTitle: {
    fontSize: 12,      // ✅ تغییر - اندازه کوچک‌تر
    fontFamily: "Yekan_Bakh_Bold",
    color: '#000000',
    textAlign: 'center',
    lineHeight: 18,    // ✅ تغییر

    paddingHorizontal: 4,  // ✅ اضافه کردن
    marginBottom: 10,  
  },
  iconContainer: {
    marginTop: 0,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },


  noMemberGroupContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
    width: '100%',
    marginVertical: 20,
  },
  noMemberGroupText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#9e9e9e',
    marginTop: 12,
    textAlign: 'center',
  },
  galleryGrid: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    width: '100%',
  },
  galleryWrapper: {
    width: '48%',
  },
  galleryCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 10,
  },
  galleryImageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    overflow: 'hidden',
    direction:"rtl"
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  galleryGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "70%",
    borderRadius: 16,
  },
  likeCountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  likeCountText: {
    fontSize: 10,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#333',
    marginRight: 3,
  },
  galleryTitleContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    paddingBottom: 20,
  },
  galleryTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
  noGalleryContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 250,
    width: '100%',
    marginVertical: 20,
  },
  noGalleryText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#9e9e9e',
    marginTop: 12,
    textAlign: 'center',
  },
  errorIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    width: '100%',
    marginVertical: 20,
  },
  errorIconText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#9e9e9e',
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  retryButtonText: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.white,
    marginRight: 8,
  },
  galleryImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },  errorSliderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
  },
  errorSliderText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#9e9e9e',
    marginTop: 12,
    textAlign: 'center',
  },
  noCourseContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    width: '100%',
    marginVertical: 20,
  },
  noCourseText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#9e9e9e',
    marginTop: 12,
    textAlign: 'center',
  },
  courseSkeletonContainer: {
    minHeight: 390,
    flexDirection: "column",
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: "#797979",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 8,
    overflow: 'hidden',
    gap: 8
  },
  courseImageSkeleton: {
    position: 'relative',
    height: 250,
    width: "100%",
  },
  courseDetailsSkeleton: {
    paddingHorizontal: 12, // تناسب با کارت اصلی
    paddingTop: 12,
    paddingBottom: 10,
    flex: 1,
  },
  courseHeaderSkeleton: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  locationSectionSkeleton: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
    marginBottom: 8,
  },
  additionalInfoSkeleton: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  blogPostCard: {
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
    marginBottom: 10,
  },
  blogPostImageContainer: {
    height: 200,
    width: '100%',
  },
  blogPostImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  blogPostImagePlaceholder: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blogPostContent: {
    padding: 16,
  },
  blogPostTitle: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    textAlign: "right",
    lineHeight: 26,
    marginBottom: 12,
  },
  blogPostMeta: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  blogPostDateContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  blogPostDateText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#666',
    marginRight: 6,
  },
  blogPostLikeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  blogPostLikeText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#666',
    marginLeft: 6,
  },
  blogPostMetaSkeleton: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  noBlogPostContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    width: '100%',
    marginVertical: 20,
  },
  noBlogPostText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#9e9e9e',
    marginTop: 12,
    textAlign: 'center',
  },
  portfolioGrid: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    width: '100%',
  },
  portfolioWrapper: {
    width: '48%',
  },
  portfolioCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 270,
    marginBottom: 10,
  },
  portfolioImageContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
  },
  portfolioImagePlaceholder: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
  },
  portfolioDefaultImage: {
    width: '100%',
    height: '100%',
  },
  likeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(233, 30, 99, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 15,
  },
  likeText: {
    fontSize: 11,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#ffffff',
    marginRight: 3,
  },
  portfolioContent: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  portfolioTitle: {
    fontSize: 15,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    textAlign: "right",
    lineHeight: 22,
    marginBottom: 6,
  },
  portfolioDescription: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#666",
    textAlign: "right",
    lineHeight: 18,
    marginBottom: 10,
  },
  portfolioMeta: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 11,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#666',
    marginRight: 4,
  },
  avatarImageContainer: {
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden',
  },
  avatarImage: {

    
  },
  blueTickContainer: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    marginTop: -15,
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 11,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#666',
    marginLeft: 3,
  },
  portfolioMetaSkeleton: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  noPortfolioContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 250,
    width: '100%',
    marginVertical: 20,
  },
  noPortfolioText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#9e9e9e',
    marginTop: 12,
    textAlign: 'center',
  },
  slideTypeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  slideTypeText: {
    fontSize: 10,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#ffffff',
    textAlign: 'center',
  },
  courseGrid: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    width: '100%',
    minHeight: 420,
  },
  courseWrapper: {
    width: (screenWidth - 70) / 2,  // ✅ تغییر مهم - محاسبه دقیق عرض
    marginHorizontal: 5,  // ✅ اضافه کردن
    minHeight: 410,
  },
});

export default HomeScreen;