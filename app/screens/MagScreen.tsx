import React, { useEffect, useRef, useState } from "react";
import AppText from "../components/Text";
import {
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
  Animated,
  StatusBar,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../config/colors";
import MainBackground from "../components/MainBackground";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import Toast from "../components/Toast";
import appConfig from "../config/config";
import { toPersianDigits } from "../utils/converters";

const { width, height } = Dimensions.get('window');

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
};

const ITEMS_PER_PAGE = 20;

const useBlogPostsWithPagination = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBlogPosts = async (page = 1, pageSize = ITEMS_PER_PAGE) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${appConfig.mobileApi}BlogPost/GetAll?filterActive=true&currentPage=${page}&pageSize=${pageSize}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      setData(result.Data || []);
      setTotal(result.Total || 0);
    } catch (err) {
      setError(err.message);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    total,
    loading,
    error,
    fetchBlogPosts,
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

const BlogPostCardSkeleton = () => {
  return (
    <View style={styles.blogSkeletonContainer}>
      <View style={styles.blogImageSkeleton}>
        <SkeletonLoader width="100%" height="100%" borderRadius={12} />
      </View>

      <View style={styles.blogDetailsSkeleton}>
        <SkeletonLoader width="90%" height={18} style={{ marginBottom: 12, alignSelf: 'flex-end' }} />
        <SkeletonLoader width="70%" height={16} style={{ marginBottom: 8, alignSelf: 'flex-end' }} />

        <View style={styles.blogMetaSkeleton}>
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

const PaginationComponent = ({
  currentPage,
  totalPages,
  onPageChange,
  style = {}
}) => {
  const pageButtonAnim = useRef(new Animated.Value(1)).current;
  const [animatingPage, setAnimatingPage] = useState(null);

  const animatePageChange = (page) => {
    if (page === currentPage) return;

    setAnimatingPage(page);
    Animated.sequence([
      Animated.timing(pageButtonAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pageButtonAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setAnimatingPage(null);
      onPageChange(page);
    });
  };

  const renderPageButton = (page, isActive = false) => {
    const isAnimating = animatingPage === page;

    return (
      <TouchableOpacity
        key={page}
        style={[
          styles.pageButton,
          isActive && styles.activePageButton,
        ]}
        onPress={() => animatePageChange(page)}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.pageButtonContent,
            isActive && styles.activePageButtonContent,
            isAnimating && { transform: [{ scale: pageButtonAnim }] },
          ]}
        >
          <AppText style={[
            styles.pageButtonText,
            isActive && styles.activePageButtonText,
          ]}>
            {page}
          </AppText>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (currentPage > 1) {
      items.push(
        <TouchableOpacity
          key="prev"
          style={styles.navButton}
          onPress={() => animatePageChange(currentPage - 1)}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[modernColors.primary, modernColors.primaryDark]}
            style={styles.navButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialIcons name="keyboard-arrow-right" size={20} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    if (startPage > 1) {
      items.push(renderPageButton(1, currentPage === 1));
      if (startPage > 2) {
        items.push(
          <View key="ellipsis-start" style={styles.ellipsis}>
            <AppText style={styles.ellipsisText}>...</AppText>
          </View>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(renderPageButton(i, i === currentPage));
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <View key="ellipsis-end" style={styles.ellipsis}>
            <AppText style={styles.ellipsisText}>...</AppText>
          </View>
        );
      }
      items.push(renderPageButton(totalPages, currentPage === totalPages));
    }

    if (currentPage < totalPages) {
      items.push(
        <TouchableOpacity
          key="next"
          style={styles.navButton}
          onPress={() => animatePageChange(currentPage + 1)}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[modernColors.primary, modernColors.primaryDark]}
            style={styles.navButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialIcons name="keyboard-arrow-left" size={20} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return items;
  };

  if (totalPages <= 1) return null;

  return (
    <View style={[styles.paginationContainer, style]}>
      <View style={styles.paginationWrapper}>
        {renderPaginationItems()}
      </View>
    </View>
  );
};

const MagScreen = () => {
  const navigation = useNavigation();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const { data: blogPosts, total, loading: blogLoading, error: blogError, fetchBlogPosts } = useBlogPostsWithPagination();

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBlogPosts(currentPage, ITEMS_PER_PAGE);
  }, [currentPage]);

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
    if (blogError) {
      showToast('خطا در دریافت اطلاعات مقالات. لطفاً دوباره تلاش کنید.', 'error');
    }
  }, [blogError]);

  const handleBlogPress = (blogData) => {
    navigation.navigate("MagDetailes", {
      title: blogData.Title,
      blogId: blogData.BlogPostId
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    Animated.timing(slideAnim, {
      toValue: 20,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBlogPosts(currentPage, ITEMS_PER_PAGE);
    setRefreshing(false);
  };

  const createSkeletonData = () => {
    return Array.from({ length: ITEMS_PER_PAGE }, (_, index) => ({ id: `skeleton-${index}` }));
  };

  const renderBlogItem = ({ item, index }) => {
    if (item.id && item.id.startsWith('skeleton')) {
      return (
        <View style={styles.blogItemContainer}>
          <BlogPostCardSkeleton />
        </View>
      );
    }

    return (
      <View style={styles.blogItemContainer}>
        <TouchableOpacity
          onPress={() => handleBlogPress(item)}
          activeOpacity={0.8}
          style={styles.blogCard}
        >
          <View style={styles.blogImageContainer}>
            <View style={styles.blogImagePlaceholder}>
              <MaterialIcons name="article" size={40} color="#ccc" />
            </View>
          </View>

          <View style={styles.blogContent}>
            <AppText style={styles.blogTitle} numberOfLines={3}>
              {toPersianDigits(item.Title)}
            </AppText>

            <View style={styles.blogMeta}>
              <View style={styles.dateContainer}>
                <MaterialIcons name="calendar-month" size={16} color="#666" />
                <AppText style={styles.dateText}>{toPersianDigits(item.ShamsiInsertDateTime)}</AppText>
              </View>

              <View style={styles.likeContainer}>
                <MaterialIcons name="favorite" size={16} color="#ff6b6b" />
                <AppText style={styles.likeText}>{toPersianDigits(item.LikeCount || 0)}</AppText>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (blogLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="article" size={80} color="#9e9e9e" />
        <AppText style={styles.emptyTitle}>هیچ مقاله‌ای موجود نیست</AppText>
        <AppText style={styles.emptySubtitle}>
          در حال حاضر مقاله‌ای برای نمایش وجود ندارد
        </AppText>
      </View>
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
        onPress={() => fetchBlogPosts(currentPage, ITEMS_PER_PAGE)}
      >
        <MaterialIcons name="refresh" size={20} color={colors.white} />
        <AppText style={styles.retryButtonText}>تلاش مجدد</AppText>
      </TouchableOpacity>
    </View>
  );

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
            <AppText style={styles.headerTitle}>مجله ها</AppText>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.sectionTitleContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sparkleContainer}>
            <MaterialIcons
              name="star-half"
              size={16}
              color="#FFD700"
              style={styles.sparkle1}
            />
            <MaterialIcons
              name="star-half"
              size={12}
              color="#FF6B6B"
              style={styles.sparkle2}
            />
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

        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {blogError ? (
            renderErrorComponent()
          ) : (
            <>
              <FlatList
                data={blogLoading ? createSkeletonData() : blogPosts}
                renderItem={renderBlogItem}
                keyExtractor={(item, index) =>
                  item.BlogPostId ? item.BlogPostId.toString() : `skeleton-${index}`
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[modernColors.primary]}
                    tintColor={modernColors.primary}
                  />
                }
                ListEmptyComponent={renderEmptyComponent}
              />

              {!blogLoading && !blogError && totalPages > 1 && (
                <PaginationComponent
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  style={styles.pagination}
                />
              )}
            </>
          )}
        </Animated.View>

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
  sectionTitleContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    marginTop: 10,
    position: "relative",
    paddingHorizontal: 20,
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
    top: 10,
    right: 25,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 20,
    paddingTop: 10,
    alignItems: 'center',
    width: '100%',
  },
  blogItemContainer: {
    width: width - 40,
    alignSelf: 'center',
    marginBottom: 20,
  },
  blogCard: {
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
  },
  blogImageContainer: {
    height: 200,
    width: '100%',
  },
  blogImagePlaceholder: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blogContent: {
    padding: 16,
  },
  blogTitle: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    textAlign: "right",
    lineHeight: 26,
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
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#666',
    marginRight: 6,
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#666',
    marginLeft: 6,
  },
  pagination: {
    marginBottom: 40,
  },
  paginationContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  paginationWrapper: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 1,
    marginBottom: 12,
  },
  pageButton: {
    marginHorizontal: 4,
    marginVertical: 4,
  },
  pageButtonContent: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activePageButtonContent: {
    backgroundColor: modernColors.primary,
    borderColor: modernColors.primary,
    shadowColor: modernColors.primary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  pageButtonText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#666',
  },
  activePageButtonText: {
    color: '#ffffff',
  },
  navButton: {
    marginHorizontal: 6,
    marginVertical: 4,
  },
  navButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: modernColors.primary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  ellipsis: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  ellipsisText: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#999',
  },
  blogSkeletonContainer: {
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
  },
  blogImageSkeleton: {
    height: 200,
    width: '100%',
  },
  blogDetailsSkeleton: {
    padding: 16,
  },
  blogMetaSkeleton: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
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
});

export default MagScreen;