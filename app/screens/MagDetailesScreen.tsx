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
  Image
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import RenderHTML from "react-native-render-html/src/RenderHTML";
import colors from "../config/colors";
import MainBackground from "../components/MainBackground";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Toast from "../components/Toast";
import appConfig from "../config/config";
import { toPersianDigits } from "../utils/converters";
import MultiOptionRatingComponent, { StarDisplay } from "../components/RatingComponent";
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

// const user?.MemberId = 1;

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
  schoolIcon: "#2ecc71",
  fashionGold: "#ffd700",
};

const htmlTagsStyles = {
  p: {
    marginBottom: 10,
    textAlign: "right" as const,
    direction: "rtl" as const,
    writingDirection: "rtl" as const,
  },
  div: {
    marginBottom: 10,
    textAlign: "right" as const,
    direction: "rtl" as const,
    writingDirection: "rtl" as const,
  },
  ul: {
    marginBottom: 10,
    paddingRight: 20,
    textAlign: "right" as const,
    direction: "rtl" as const,
    writingDirection: "rtl" as const,
  },
  ol: {
    marginBottom: 10,
    paddingRight: 20,
    textAlign: "right" as const,
    direction: "rtl" as const,
    writingDirection: "rtl" as const,
  },
  li: {
    marginBottom: 6,
    textAlign: "right" as const,
    direction: "rtl" as const,
    writingDirection: "rtl" as const,
  },
  strong: {
    fontFamily: "Yekan_Bakh_Bold",
  },
  em: {
    fontStyle: "italic",
  },
  a: {
    color: "#1976d2",
    textDecorationLine: "underline",
  },
  img: {
    resizeMode: "contain",
    marginVertical: 12,
    borderRadius: 12,
  },
} as const;

const transformContentReviewToRatingOptions = (contentReviewList) => {
  if (!contentReviewList || contentReviewList.length === 0) {
    return [
      {
        id: 'content',
        title: 'کیفیت محتوا',
        subtitle: 'کیفیت و مفید بودن محتوای مقاله',
        contentReviewItemId: 'content'
      },
      {
        id: 'writing',
        title: 'نگارش',
        subtitle: 'کیفیت نوشتار و روان بودن متن',
        contentReviewItemId: 'writing'
      },
      {
        id: 'usefulness',
        title: 'کاربردی بودن',
        subtitle: 'میزان مفید و قابل استفاده بودن',
        contentReviewItemId: 'usefulness'
      },
      {
        id: 'comprehensiveness',
        title: 'جامعیت',
        subtitle: 'پوشش کامل موضوع',
        contentReviewItemId: 'comprehensiveness'
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

const useBlogPostDetail = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBlogPost = async (blogPostId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${appConfig.mobileApi}BlogPost/Get?blogPostId=${blogPostId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      const transformedData = {
        ...result.BlogPost,
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
    fetchBlogPost,
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

const BlogDetailSkeleton = () => {
  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.imageSkeletonContainer}>
        <SkeletonLoader width="100%" height="100%" borderRadius={0} />
      </View>

      <View style={styles.contentSkeletonContainer}>
        <SkeletonLoader width="90%" height={24} style={{ marginBottom: 20, alignSelf: 'flex-end' }} />
        <SkeletonLoader width="70%" height={24} style={{ marginBottom: 20, alignSelf: 'flex-end' }} />

        <SkeletonLoader width="95%" height={18} style={{ marginBottom: 12, alignSelf: 'flex-end' }} />
        <SkeletonLoader width="85%" height={18} style={{ marginBottom: 12, alignSelf: 'flex-end' }} />
        <SkeletonLoader width="92%" height={18} style={{ marginBottom: 12, alignSelf: 'flex-end' }} />
        <SkeletonLoader width="88%" height={18} style={{ marginBottom: 12, alignSelf: 'flex-end' }} />
        <SkeletonLoader width="90%" height={18} style={{ marginBottom: 12, alignSelf: 'flex-end' }} />
        <SkeletonLoader width="75%" height={18} style={{ marginBottom: 20, alignSelf: 'flex-end' }} />

        <View style={styles.dateSkeletonContainer}>
          <SkeletonLoader width={17} height={17} borderRadius={8} style={{ marginLeft: 10 }} />
          <SkeletonLoader width={80} height={15} />
        </View>
      </View>
    </View>
  );
};

const MagDetailesScreen = ({ route }) => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const { title, blogId } = route.params;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const { data: blogPost, loading, error, fetchBlogPost, setData } = useBlogPostDetail();

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const [refreshing, setRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

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
  const [imageError, setImageError] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);

  const imageViewerScaleAnim = useRef(new Animated.Value(0)).current;
  const imageViewerOpacityAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      if (blogId) {
        fetchBlogPost(blogId);
      }
    }, [blogId])
  );

  useEffect(() => {
    if (blogPost) {
      setLikeCount(blogPost.LikeCount || 0);
      setIsLiked(blogPost.IsMemberLiked || false);

      const ratingOptions = transformContentReviewToRatingOptions(blogPost.ContentReviewItemList);
      setDynamicRatingOptions(ratingOptions);
    }
  }, [blogPost]);

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
    if (error) {
      showToast('خطا در دریافت اطلاعات مقاله. لطفاً دوباره تلاش کنید.', 'error');
    }
  }, [error]);

  useEffect(() => {
    if (imageViewerVisible) {
      imageViewerScaleAnim.setValue(0.8);
      imageViewerOpacityAnim.setValue(0);

      Animated.parallel([
        Animated.spring(imageViewerScaleAnim, {
          toValue: 1,
          tension: 150,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(imageViewerOpacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(imageViewerScaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(imageViewerOpacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [imageViewerVisible]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const showToast = (message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const hasValidImage = () => {
    if (!blogPost) return false;
    if (!blogPost.FeaturedImageFileName) return false;
    if (!blogPost.FeaturedImageURL) return false;
    if (imageError) return false;
    if (blogPost.FeaturedImageURL.endsWith('/')) return false;
    return true;
  };

  const handleImagePress = () => {
    if (hasValidImage()) {
      setImageViewerVisible(true);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (blogId) {
      await fetchBlogPost(blogId);
    }
    setRefreshing(false);
  };

  const isOwnPost = blogPost && blogPost.MemberId === user?.MemberId;

  const handleEditPost = () => {
    navigation.navigate("AddNewPost", {
      isEdit: true,
      blogData: blogPost
    });
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

  const handleDeletePost = () => {
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

  const handleCloseImageViewer = () => {
    setImageViewerVisible(false);
  };

  const handleLike = async () => {
    if (isLiking || !blogPost || !user?.MemberId) return;

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
        `${appConfig.mobileApi}BlogPost/Like?id=${blogPost.BlogPostId}&memberId=${user.MemberId}`,
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

  const confirmDeletePost = async () => {
    handleCloseDeleteModal();

    try {
      setIsDeleting(true);

      const response = await fetch(`${appConfig.mobileApi}BlogPost/Delete?blogPostId=${blogPost.BlogPostId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast('پست با موفقیت حذف شد', 'success');
        setTimeout(() => {
          navigation.navigate("App", { screen: "MainTabs", params: { screen: "خانه" } });
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.Message || 'خطا در حذف پست');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      showToast(error.message || 'خطا در حذف پست', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderContentItems = () => {
    const rawContent = blogPost?.Content || '';
    const trimmedContent = rawContent.trim();

    if (!trimmedContent) {
      return null;
    }

    const hasHtmlMarkup = /<[^>]+>/i.test(trimmedContent);

    if (hasHtmlMarkup) {
      return (
        <View style={styles.htmlContentContainer}>
          <RenderHTML
            source={{ html: trimmedContent }}
            contentWidth={width - 50}
            baseStyle={styles.htmlBase}
            tagsStyles={htmlTagsStyles}
            defaultTextProps={{
              selectable: true,
            }}
          />
        </View>
      );
    }

    return (
      <AppText style={styles.bodyText}>
        {toPersianDigits(trimmedContent)}
      </AppText>
    );
  };

  const renderErrorComponent = () => (
    <View style={styles.errorContainer}>
      <MaterialIcons name="error" size={80} color="#9e9e9e" />
      <AppText style={styles.errorTitle}>خطا در دریافت اطلاعات</AppText>
      <AppText style={styles.errorSubtitle}>
        لطفاً اتصال اینترنت خود را بررسی کنید
      </AppText>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => blogId && fetchBlogPost(blogId)}
      >
        <MaterialIcons name="refresh" size={20} color={colors.white} />
        <AppText style={styles.retryButtonText}>تلاش مجدد</AppText>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return <BlogDetailSkeleton />;
    }

    if (error) {
      return renderErrorComponent();
    }

    if (!blogPost) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="article" size={80} color="#9e9e9e" />
          <AppText style={styles.emptyTitle}>مقاله یافت نشد</AppText>
          <AppText style={styles.emptySubtitle}>
            مقاله مورد نظر موجود نیست
          </AppText>
        </View>
      );
    }

    return (
      <View style={styles.contentWrapper}>
        <View style={styles.imageContainer}>
          <TouchableOpacity
            onPress={handleImagePress}
            activeOpacity={0.9}
            disabled={!hasValidImage()}
          >
            {hasValidImage() ? (
              <Image
                source={{ uri: blogPost.FeaturedImageURL }}
                style={styles.postImage}
                resizeMode="cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <Image
                source={require("../../assets/blogPost_icon.jpg")}
                style={styles.postImage}
                resizeMode="cover"
              />
            )}
          </TouchableOpacity>

          {hasValidImage() && (
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)']}
              style={styles.imageGradient}
            />
          )}

          {isOwnPost && (
            <View style={[styles.statusBadge, { backgroundColor: blogPost.Active ? modernColors.success : modernColors.warning }]}>
              <AppText style={styles.statusText}>
                {blogPost.Active ? 'منتشر شده' : 'پیش‌نویس'}
              </AppText>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.topLikeBadge,
              { backgroundColor: isLiked ? 'rgba(233, 30, 99, 0.8)' : 'rgba(255, 255, 255, 0.8)' }
            ]}
            onPress={handleLike}
            disabled={isLiking}
            activeOpacity={0.7}
          >
            <View style={[styles.topLikeContent]}>
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
            {toPersianDigits(blogPost.Title)}
          </AppText>

          {renderContentItems()}
          {blogPost.MemberName && (
            <View style={styles.authorContainer}>
              <View style={styles.authorCardBorder}>
                <View style={styles.authorIconContainer}>
                  <MaterialIcons name="person" size={18} color="#816bff" />
                </View>
                <AppText style={styles.authorText}>
                  {toPersianDigits(blogPost.MemberName)}
                </AppText>
              </View>
            </View>
          )}
          {blogPost.BlogPostCategoriesStr && blogPost.BlogPostCategoriesStr.trim() !== '' && (
            <View style={styles.categoriesContainer}>
              <View style={styles.categoriesList}>
                {blogPost.BlogPostCategoriesStr.split('،').map((category, index) => (
                  <View key={index} style={styles.categoryTag}>
                    <AppText style={styles.categoryText}>
                      {toPersianDigits(category.trim())}
                    </AppText>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.ratingSection}>
            <MultiOptionRatingComponent
              contentId={blogPost.BlogPostId}
              averageRating={blogPost.Rating || 0}
              ratingCount={blogPost.RatingCount || 0}
              initialRating={blogPost.UserRating || 0}
              initialDetailedRatings={userDetailedRatings}
              maxStars={5}
              size={24}
              starColor={modernColors.fashionGold}
              enableMultipleOptions={true}
              ratingOptions={dynamicRatingOptions}
              modalTitle="امتیازدهی مقاله"
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
                <AppText style={styles.detailedRatingsTitle}>میانگین امتیازات:</AppText>
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

          <View style={styles.metaContainer}>
            <View style={styles.leftSection}>
              <View style={styles.dateContainer}>
                <MaterialIcons name="calendar-month" size={17} color="#666" />
                <AppText style={styles.dateText}>
                  {toPersianDigits(blogPost.ShamsiInsertDate)}
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
          <MaterialIcons name="favorite" size={50} color={modernColors.secondary} />
        </Animated.View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("App", { screen: "MainTabs", params: { screen: "خانه" } })}
        >
          <View style={styles.backButtonContainer}>
            <MaterialIcons
              name="arrow-forward"
              size={24}
              color="#6366f1"
            />
          </View>
        </TouchableOpacity>

        {isOwnPost && !loading && (
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
            <AppText style={styles.headerTitle}></AppText>
          </View>
        </Animated.View>

        <Animated.View
          style={[styles.floatingDecoration1, { transform: [{ rotate: spin }] }]}
        >
        </Animated.View>
        <Animated.View
          style={[styles.floatingDecoration2, { transform: [{ rotate: spin }] }]}
        >
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
                name="star"
                size={22}
                color="rgba(255, 215, 0, 0.4)"
              />
            </Animated.View>
            <Animated.View style={[styles.star2, { transform: [{ rotate: spin }] }]}>
              <MaterialIcons
                name="auto-awesome"
                size={18}
                color="rgba(255, 107, 107, 0.4)"
              />
            </Animated.View>
            <Animated.View style={[styles.star3, { transform: [{ rotate: spin }] }]}>
              <MaterialIcons
                name="diamond"
                size={20}
                color="rgba(78, 205, 196, 0.4)"
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
                <AppText style={styles.modalTitle}>عملیات پست</AppText>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalActionItem}
                  onPress={() => {
                    handleCloseModal();
                    setTimeout(() => {
                      handleEditPost();
                    }, 300);
                  }}
                >
                  <View style={styles.modalActionContent}>
                    <View style={[styles.modalActionIcon, { backgroundColor: modernColors.info }]}>
                      <MaterialIcons name="edit" size={22} color="#ffffff" />
                    </View>
                    <View style={styles.modalActionText}>
                      <AppText style={styles.modalActionTitle}>ویرایش پست</AppText>
                      <AppText style={styles.modalActionSubtitle}>ویرایش عنوان و محتوای پست</AppText>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalActionItem}
                  onPress={handleDeletePost}
                  disabled={isDeleting}
                >
                  <View style={styles.modalActionContent}>
                    <View style={[styles.modalActionIcon, { backgroundColor: modernColors.error }]}>
                      <MaterialIcons name="delete" size={22} color="#ffffff" />
                    </View>
                    <View style={styles.modalActionText}>
                      <AppText style={styles.modalActionTitle}>حذف پست</AppText>
                      <AppText style={styles.modalActionSubtitle}>حذف کامل پست از سیستم</AppText>
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
                  آیا از حذف این پست اطمینان دارید؟{'\n'}
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
                    onPress={confirmDeletePost}
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
          visible={imageViewerVisible}
          transparent={true}
          animationType="none"
          onRequestClose={handleCloseImageViewer}
          statusBarTranslucent={true}
        >
          <View style={styles.imageViewerContainer}>
            <Animated.View
              style={[
                styles.imageViewerBackdrop,
                {
                  opacity: imageViewerOpacityAnim,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.imageViewerBackdropTouchable}
                onPress={handleCloseImageViewer}
                activeOpacity={1}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.imageViewerContent,
                {
                  opacity: imageViewerOpacityAnim,
                  transform: [{ scale: imageViewerScaleAnim }],
                },
              ]}
            >
              {blogPost && blogPost.FeaturedImageFileName && blogPost.FeaturedImageURL && !imageError && (
                <>
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: blogPost.FeaturedImageURL }}
                      style={styles.fullScreenImage}
                      resizeMode="contain"
                    />
                  </View>

                  <View style={styles.imageViewerHeader}>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={handleCloseImageViewer}
                      activeOpacity={0.7}
                    >
                      <View style={styles.closeButtonContainer}>
                        <MaterialIcons name="close" size={24} color="#ffffff" />
                      </View>
                    </TouchableOpacity>

                    <View style={styles.imageViewerInfo}>
                      <AppText style={styles.imageViewerTitle} numberOfLines={2}>
                        {toPersianDigits(blogPost.Title)}
                      </AppText>
                      <AppText style={styles.imageViewerSubtitle}>
                        تصویر شاخص مقاله
                      </AppText>
                    </View>
                  </View>

                  <View style={styles.imageViewerFooter}>
                    <View style={styles.imageActions}>
                      {isOwnPost && (
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => {
                            handleCloseImageViewer();
                            setTimeout(() => {
                              handleEditPost();
                            }, 300);
                          }}
                          activeOpacity={0.7}
                        >
                          <LinearGradient
                            colors={[modernColors.primary, modernColors.primaryDark]}
                            style={styles.actionButtonGradient}
                          >
                            <MaterialIcons name="edit" size={20} color="white" />
                          </LinearGradient>
                          <AppText style={styles.actionButtonText}>ویرایش</AppText>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </>
              )}
            </Animated.View>
          </View>
        </Modal>
      </View>
    </>
  );
};

// ... بقیه کدهای بالا بدون تغییر باقی می‌مانند

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  postImage: {
    width: '100%',
    height: '100%',
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
    height: 250,
    width: '100%',
    position: 'relative',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  placeholderText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
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
    fontSize: 22,
    fontFamily: "Yekan_Bakh_ExtraBold",
    color: "#2c3e50",
    marginBottom: 20,
    textAlign: "right",
    lineHeight: 32,
    direction: "ltr",
    writingDirection: "rtl", // جهت قرارگیری کلمات انگلیسی در تایتل اصلاح شد
  },
  bodyText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#34495e",
    textAlign: "right",
    alignSelf: 'stretch',
    lineHeight: 28,
    marginBottom: 30,
    textAlignVertical: "top",
    direction: "ltr",
    writingDirection: "ltr",
  },
  htmlContentContainer: {
    marginBottom: 24,
    alignSelf: 'stretch',
  },
  htmlBase: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#34495e",
    lineHeight: 28,
    textAlign: "right",
    direction: "rtl",
    writingDirection: "rtl",
  },
  categoriesContainer: {
    marginBottom: 25,
    padding: 0,
  },
  categoriesList: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  categoryText: {
    fontSize: 13,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#1976d2',
    textAlign: 'center',
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
  ratingRowStars: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginLeft: 15,
    gap: 8,
  },
  averageRatingScore: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#666",
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
  commentStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentStatusText: {
    fontSize: 13,
    fontFamily: "Yekan_Bakh_Regular",
    marginRight: 8,
  },
  skeletonContainer: {
    flex: 1,
  },
  imageSkeletonContainer: {
    height: 250,
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
  dateSkeletonContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
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
  floatingHeart: {
    position: 'absolute',
    top: height * 0.4,
    left: width * 0.5 - 25,
    zIndex: 1000,
    pointerEvents: 'none',
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
  authorContainer: {
    marginBottom: 25,
    borderRadius: 16,
    overflow: 'hidden',
  },
  authorGradient: {
    padding: 16,
  },
  authorContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  authorIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  authorText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: 'black',
  },
  authorCardBorder: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#f3eefc',
    padding: 16,
    borderRadius: 12,
    borderRightWidth: 4,
    borderRightColor: '#866bff',
  },
});

export default MagDetailesScreen;