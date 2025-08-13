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
  Image,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../config/colors";
import MainBackground from "../components/MainBackground";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import Toast from "../components/Toast";
import appConfig from "../config/config";
import { toPersianDigits } from "../utils/converters";
import FilterModal from "../components/FilterModal";

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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  const fetchBlogPosts = async (newPage = 1, pageSize = ITEMS_PER_PAGE, filterParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      let filterQuery = "filterActive=true";

      if (filterParams.filterTitle) {
        console.log('Adding filterTitle to query:', filterParams.filterTitle);
        filterQuery += `&filterTitle=${encodeURIComponent(filterParams.filterTitle)}`;
      }

      if (filterParams.filterCategoryId) {
        console.log('Adding filterCategoryId to query:', filterParams.filterCategoryId);
        filterQuery += `&filterCategoryId=${filterParams.filterCategoryId}`;
      }
      // اضافه کردن فیلتر کاربر
      if (filterParams.filterMemberId) {
        filterQuery += `&filterMemberId=${filterParams.filterMemberId}`;
      } 
      const finalUrl = `${appConfig.mobileApi}BlogPost/GetAll?${filterQuery}&currentPage=${newPage}&pageSize=${pageSize}`;
      console.log('Final API URL:', finalUrl);

      const response = await fetch(finalUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API Response:', result);

      if (newPage === 1) {
        setData(result.Data || []);
      } else {
        setData(prevData => [...prevData, ...(result.Data || [])]);
      }

      setTotal(result.Total || 0);
      setPage(newPage);
      setFilters(filterParams);

      setHasMore((result.Data || []).length === pageSize && (result.Data || []).length > 0);
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message);
      if (newPage === 1) {
        setData([]);
      }
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchBlogPosts(page + 1, ITEMS_PER_PAGE, filters);
    }
  };

  return {
    data,
    total,
    loading,
    error,
    fetchBlogPosts,
    loadMore,
    hasMore,
    page,
    filters,
  };
};

const useBlogCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${appConfig.mobileApi}BlogPostCategory?filterActive=true&currentPage=0&pageSize=20`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setCategories(result.Data || []);
    } catch (err) {
      setError(err.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    error,
    fetchCategories,
  };
};

const SkeletonLoader = ({ style }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          backgroundColor: '#e1e5e9',
          opacity,
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
        <SkeletonLoader style={{ width: '100%', height: '100%', borderTopLeftRadius: 20, borderTopRightRadius: 20 }} />
      </View>

      <View style={styles.blogDetailsSkeleton}>
        <SkeletonLoader style={{ width: '90%', height: 18, marginBottom: 12, alignSelf: 'flex-end', borderRadius: 4 }} />
        <SkeletonLoader style={{ width: '70%', height: 16, marginBottom: 8, alignSelf: 'flex-end', borderRadius: 4 }} />

        <View style={styles.blogMetaSkeleton}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center' }}>
            <SkeletonLoader style={{ width: 16, height: 16, borderRadius: 8, marginLeft: 6 }} />
            <SkeletonLoader style={{ width: 80, height: 14, borderRadius: 4 }} />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <SkeletonLoader style={{ width: 16, height: 16, borderRadius: 8, marginRight: 6 }} />
            <SkeletonLoader style={{ width: 30, height: 14, borderRadius: 4 }} />
          </View>
        </View>
      </View>
    </View>
  );
};

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
      {/* {imageLoading && (
        <View style={[styles.blogImagePlaceholder, { position: 'absolute', zIndex: 1 }]}>
          <MaterialIcons name="article" size={40} color="#ccc" />
        </View>
      )} */}
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

const MagScreen = () => {

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();
  const route = useRoute();

  // دریافت پارامترهای فیلتر از route
  const { filteredMemberId, filteredMemberName, filterType } = route.params || {};

  // در useEffect اولیه:
  useEffect(() => {
    // اگر از پروفایل کاربر آمده، فیلتر کاربر را اعمال کن
    if (filteredMemberId && filterType === 'member') {
      const memberFilter = {
        filterMemberId: filteredMemberId
      };
      setAppliedFilters(memberFilter);
      setHasActiveFilters(true);
      fetchBlogPosts(1, ITEMS_PER_PAGE, memberFilter);

      // نمایش پیام فیلتر
      showToast(`نمایش مقالات ${filteredMemberName}`, 'info');
    } else {
      fetchBlogPosts(1, ITEMS_PER_PAGE);
    }
    fetchCategories();
  }, [filteredMemberId]);

  // بروزرسانی header title
  const getHeaderTitle = () => {
    if (filteredMemberId && filteredMemberName) {
      return `مقالات`;
    }
    return 'مجله ها';
  };
  const {
    data: blogPosts,
    total,
    loading: blogLoading,
    error: blogError,
    fetchBlogPosts,
    loadMore,
    hasMore,
    filters
  } = useBlogPostsWithPagination();

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    fetchCategories
  } = useBlogCategories();

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBlogPosts(1, ITEMS_PER_PAGE);
    fetchCategories();
  }, []);

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
    if (categoriesError) {
      showToast('خطا در دریافت دسته‌بندی‌ها. لطفاً دوباره تلاش کنید.', 'error');
    }
  }, [blogError, categoriesError]);

  const handleBlogPress = (blogData) => {
    navigation.navigate("MagDetailes", {
      title: blogData.Title,
      blogId: blogData.BlogPostId
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBlogPosts(1, ITEMS_PER_PAGE, appliedFilters);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!blogLoading && hasMore) {
      loadMore();
    }
  };

  const handleApplyFilters = (newFilters) => {
    console.log('Received filters in MagScreen:', newFilters);

    setAppliedFilters(newFilters);

    const hasFilters = Object.keys(newFilters).some(key => {
      const value = newFilters[key];
      return value !== false && value !== '' && value !== 'all' && value !== undefined && value !== null;
    });

    console.log('Has active filters:', hasFilters);
    setHasActiveFilters(hasFilters);

    if (hasFilters) {
      showToast('فیلترها اعمال شد', 'success');
    }

    console.log('Calling fetchBlogPosts with filters:', newFilters);
    fetchBlogPosts(1, ITEMS_PER_PAGE, newFilters);
  };

  const clearAllFilters = () => {
    setAppliedFilters({});
    setHasActiveFilters(false);
    fetchBlogPosts(1, ITEMS_PER_PAGE, {});
    showToast('فیلترها پاک شد', 'info');
  };

  const createSkeletonData = () => {
    return Array.from({ length: ITEMS_PER_PAGE }, (_, index) => ({
      id: `skeleton-${index}`,
      isSkeleton: true
    }));
  };

  const prepareFilterOptions = () => {
    return {
      title: 'فیلتر مقالات',
      icon: 'article',
      sections: [
        {
          title: 'دسته‌بندی',
          type: 'selection',
          key: 'categoryId',
          icon: 'category',
          options: [
            { label: 'همه', value: 'all' },
            ...(categories || []).map(category => ({
              label: category.Name,
              value: category.BlogPostCategoryId.toString()
            }))
          ],
        }
      ],
    };
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
          <BlogImageComponent item={item} />

          <View style={styles.blogContent}>
            <AppText style={styles.blogTitle} numberOfLines={3}>
              {toPersianDigits(item.Title)}
            </AppText>

            <View style={styles.blogMeta}>
              <View style={styles.dateContainer}>
                <MaterialIcons name="calendar-month" size={16} color="#666" />
                <AppText style={styles.dateText}>{toPersianDigits(item.ShamsiInsertDate)}</AppText>
              </View>

              <View style={styles.likeContainer}>
                <MaterialIcons name="favorite" size={16} color="#ff6b6b" />
                <AppText style={styles.likeText}>{toPersianDigits(item.LikeCount || 0)}</AppText>
              </View>
            </View>

            {item.BlogPostCategoryName && (
              <View style={styles.categoryContainer}>
                <MaterialIcons name="folder" size={16} color={modernColors.tertiary} />
                <AppText style={styles.categoryText}>{item.BlogPostCategoryName}</AppText>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
    if (!blogLoading) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={modernColors.primary} />
        <AppText style={styles.loadingMoreText}>در حال بارگذاری...</AppText>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (blogLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="article" size={48} color="#9e9e9e" />

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
        onPress={() => fetchBlogPosts(1, ITEMS_PER_PAGE, appliedFilters)}
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

        <FilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          onApplyFilters={handleApplyFilters}
          filterType="blog"
          initialFilters={appliedFilters}
          customFilterOptions={prepareFilterOptions()}
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
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setFilterModalVisible(true)}
            >
              <View style={[styles.filterIconContainer, hasActiveFilters && styles.activeFilterIcon]}>
                <MaterialIcons
                  name="filter-list"
                  size={24}
                  color={hasActiveFilters ? "#ffffff" : "#6366f1"}
                />
                {hasActiveFilters && <View style={styles.filterBadge} />}
              </View>
            </TouchableOpacity>
            <View style={styles.titleWrapper}>
              <AppText style={styles.headerTitle}>{getHeaderTitle()}</AppText>
            </View>

            {hasActiveFilters && (
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={clearAllFilters}
              >
                <MaterialIcons name="clear" size={20} color="#ff6b6b" />
              </TouchableOpacity>
            )}
          </View>


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
                data={blogLoading && blogPosts.length === 0 ? createSkeletonData() : blogPosts}
                renderItem={renderBlogItem}
                keyExtractor={(item, index) =>
                  item.isSkeleton
                    ? item.id
                    : (item.BlogPostId ? item.BlogPostId.toString() : `blog-${index}`)
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
                ListEmptyComponent={!blogLoading ? renderEmptyComponent : null}
                ListFooterComponent={renderFooter}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.3}
              />
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
    marginBottom: 20
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "relative",
  },
  filterButton: {
    position: "absolute",
    left: 0,
  },
  filterIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
    position: 'relative',
  },
  activeFilterIcon: {
    backgroundColor: modernColors.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff6b6b',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  clearFiltersButton: {
    position: "absolute",
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
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
  },
  activeFiltersContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  activeFilterChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  activeFilterText: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#6366f1',
    marginRight: 4,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 20,
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
    height: 200,
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
    marginBottom: 8,
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
  categoryContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 8,
  },
  categoryText: {
    fontSize: 13,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.tertiary,
    marginRight: 6,
  },
  loadingFooter: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  loadingMoreText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#666',
  },
  endListMessage: {
    padding: 20,
    alignItems: 'center',
  },
  endListText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
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
    postImage: {
    height: "100%",
    width: "100%",
  },
});

export default MagScreen;