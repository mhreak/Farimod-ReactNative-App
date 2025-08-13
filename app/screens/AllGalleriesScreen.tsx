import React, { useEffect, useRef, useState } from "react";
import AppText from "../components/Text";
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  StatusBar,
  Animated,
  Dimensions,
  RefreshControl,
  Text,
} from "react-native";
import colors from "../config/colors";
import { useNavigation,useRoute } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MainBackground from "../components/MainBackground";
import { LinearGradient } from "expo-linear-gradient";
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
};

const ITEMS_PER_PAGE = 20;

const useGalleriesWithPagination = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGalleries = async (page = 1, pageSize = ITEMS_PER_PAGE) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${appConfig.mobileApi}ImageGallery/GetAll?currentPage=${page}&pageSize=${pageSize}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      setData(result.Items || []);
      setTotal(result.TotalCount || 0);
      setTotalPages(result.TotalPages || 0);
    } catch (err) {
      setError(err.message);
      setData([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    total,
    totalPages,
    loading,
    error,
    fetchGalleries,
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

const GalleryCardSkeleton = () => {
  return (
    <View style={styles.gridItem}>
      <View style={styles.skeletonImageContainer}>
        <SkeletonLoader width="100%" height="100%" borderRadius={20} />

        {/* Top overlay skeletons */}
        <View style={styles.skeletonTopOverlay}>
          <View style={styles.skeletonLikeButton}>
            <SkeletonLoader width={16} height={16} borderRadius={8} />
            <SkeletonLoader width={20} height={12} style={{ marginRight: 4 }} />
          </View>
          <View style={styles.skeletonRatingButton}>
            <SkeletonLoader width={16} height={16} borderRadius={8} />
            <SkeletonLoader width={25} height={12} style={{ marginRight: 4 }} />
          </View>
        </View>

        <View style={styles.skeletonTextContainer}>
          <SkeletonLoader width="70%" height={16} style={{ alignSelf: 'center' }} />
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
            {toPersianDigits(page)}
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

const AllGalleriesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { filteredMemberId, filteredMemberName, filterType } = route.params || {};

  // بروزرسانی custom hook
  const useGalleriesWithPagination = () => {
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchGalleries = async (page = 1, pageSize = ITEMS_PER_PAGE, filters = {}) => {
      try {
        setLoading(true);
        setError(null);

        let queryParams = `currentPage=${page}&pageSize=${pageSize}`;

        if (filters.filterMemberId) {
          queryParams += `&filterMemberId=${filters.filterMemberId}`;
        }

        const response = await fetch(
          `${appConfig.mobileApi}ImageGallery/GetAll?${queryParams}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result.Items || []);
        setTotal(result.TotalCount || 0);
        setTotalPages(result.TotalPages || 0);
      } catch (err) {
        setError(err.message);
        setData([]);
        setTotal(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    return { data, total, totalPages, loading, error, fetchGalleries };
  };

  useEffect(() => {
    const initialFilters = {};

    if (filteredMemberId && filterType === 'member') {
      initialFilters.filterMemberId = filteredMemberId;
      showToast(`نمایش گالری ${filteredMemberName}`, 'info');
    }

    fetchGalleries(currentPage, ITEMS_PER_PAGE, initialFilters);
  }, [currentPage, filteredMemberId]);

  const getHeaderTitle = () => {
    if (filteredMemberId && filteredMemberName) {
      return `گالری ${filteredMemberName}`;
    }
    return 'همه گالری‌ها';
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const {
    data: galleries,
    total,
    totalPages,
    loading: galleriesLoading,
    error: galleriesError,
    fetchGalleries
  } = useGalleriesWithPagination();

  const [currentPage, setCurrentPage] = useState(1);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchGalleries(currentPage, ITEMS_PER_PAGE);
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
    if (galleriesError) {
      showToast('خطا در دریافت اطلاعات گالری‌ها. لطفاً دوباره تلاش کنید.', 'error');
    }
  }, [galleriesError]);

  const handleGalleryPress = (galleryData) => {
    navigation.navigate("GalleryItem", {
      title: galleryData.Title,
      galleryId: galleryData.ImageGalleryId
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
    await fetchGalleries(currentPage, ITEMS_PER_PAGE);
    setRefreshing(false);
  };

  const createSkeletonData = () => {
    const skeletonCount = ITEMS_PER_PAGE;
    // اطمینان از زوج بودن تعداد skeleton ها
    const evenCount = skeletonCount % 2 === 0 ? skeletonCount : skeletonCount + 1;
    return Array.from({ length: evenCount }, (_, index) => ({
      id: `skeleton-${index}`,
      ImageGalleryId: `skeleton-${index}`
    }));
  };

  const renderItem = (item) => {
    if (item.id && item.id.startsWith('skeleton')) {
      return <GalleryCardSkeleton />;
    }

    return (
      <TouchableOpacity
        style={styles.gridItem}
        onPress={() => handleGalleryPress(item)}
      >
        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            source={require("../../assets/sample_clothe2.jpg")}
          />

          {/* Top overlay icons */}
          <View style={styles.topOverlay}>
            <View style={styles.likeButton}>
              <MaterialIcons name="favorite" size={18} color="#ff6b6b" />
              <AppText style={styles.likeCount}>
                {toPersianDigits(item.LikeCount || 0)}
              </AppText>
            </View>

            {item.Rating && (
              <View style={styles.ratingButton}>
                <MaterialIcons name="star" size={18} color="#FFD700" />
                <AppText style={styles.ratingValue}>
                  {toPersianDigits(item.Rating)}
                </AppText>
              </View>
            )}
          </View>

          <LinearGradient
            colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.8)"]}
            style={styles.background}
          />

          <View style={styles.textContainer}>
            <Text
              style={styles.galleryTitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.Title}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => {
    if (galleriesLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="photo-library" size={80} color="#9e9e9e" />
        <AppText style={styles.emptyTitle}>هیچ گالری‌ای موجود نیست</AppText>
        <AppText style={styles.emptySubtitle}>
          در حال حاضر گالری‌ای برای نمایش وجود ندارد
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
        onPress={() => fetchGalleries(currentPage, ITEMS_PER_PAGE)}
      >
        <MaterialIcons name="refresh" size={20} color={colors.white} />
        <AppText style={styles.retryButtonText}>تلاش مجدد</AppText>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={{ flex: 1 }}>
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
              size={26}
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
           

            <View style={styles.titleWrapper}>
              <AppText style={styles.headerTitle}>همه گالری‌ها</AppText>
              <View style={styles.sparkleContainer}>
                <Animated.View style={[{ transform: [{ rotate: spin }] }]}>
                  <MaterialIcons
                    name="star-half"
                    size={16}
                    color="#FFD700"
                    style={styles.sparkle1}
                  />
                </Animated.View>
                <Animated.View style={[{ transform: [{ rotate: spin }] }]}>
                  <MaterialIcons
                    name="diamond"
                    size={12}
                    color="#FF6B6B"
                    style={styles.sparkle2}
                  />
                </Animated.View>
              </View>
            </View>
          </View>

  
        </Animated.View>

        <Animated.View
          style={[
            styles.galleryContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {galleriesError ? (
            renderErrorComponent()
          ) : (
            <>
              <FlatList
                data={galleriesLoading ? createSkeletonData() : (galleries.length % 2 === 1 ? [...galleries, { isEmpty: true }] : galleries)}
                numColumns={2}
                renderItem={({ item }) => {
                  if (item?.isEmpty) {
                    return <View style={[styles.gridItem, { backgroundColor: 'transparent' }]} />;
                  }
                  return renderItem(item);
                }}
                keyExtractor={(item) => item.ImageGalleryId?.toString() || item.id || 'empty'}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[modernColors.primary]}
                    tintColor={modernColors.primary}
                  />
                }
                ListEmptyComponent={renderEmptyComponent}
                style={styles.flatListContainer}
              />

              {!galleriesLoading && !galleriesError && totalPages > 1 && (
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
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
    paddingTop: StatusBar.currentHeight + 35,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "relative",
  },
  addIconHeader: {
    position: "absolute",
    left: 0,
    borderRadius: 25,
    overflow: "hidden",
    marginTop: 8,
  },
  addIconGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: 'absolute',
    top: StatusBar.currentHeight + 45,
    right: 20,
    zIndex: 1000,
  },
  backButtonContainer: {
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
    marginTop: -17
  },
  titleWrapper: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Yekan_Bakh_ExtraBold",
    color: "#2c3e50",
    marginHorizontal: 15,
    textAlign: "center",
  },
  sparkleContainer: {
    position: "absolute",
    top: 100,
    left: 10,
  },
  sparkle1: {
    position: "absolute",
    top: 0,
    left: 90,
  },
  sparkle2: {
    position: "absolute",
    top: 25,
    left: 25,
  },
  statsContainer: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
  },
  statsText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Medium",
    color: "#666",
    textAlign: "center",
  },
  galleryContent: {
    flex: 1,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "70%",
    borderRadius: 20,
  },
  list: {
    padding: 15,
    paddingBottom: 20,
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  flatListContainer: {
    // RTL support using transform
    transform: [{ scaleX: -1 }],
  },
  gridItem: {
    width: (width - 60) / 2, // Fixed width instead of flex: 1
    margin: 8,
    height: 200,
    borderRadius: 20,
    // Reverse the transform to show content normally
    transform: [{ scaleX: -1 }],
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  textContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    paddingBottom: 20,
  },
  galleryTitle: {
    color: "#FFFFFF",
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 16,

    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
    maxWidth: '100%',
    includeFontPadding: false, // برای Android
    textAlignVertical: 'center', // برای Android
  },
  topOverlay: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    zIndex: 2,
  },
  likeButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  likeCount: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#ff6b6b",
    marginRight: 4,
  },
  ratingButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  ratingValue: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#FFD700",
    marginRight: 4,
  },
  skeletonImageContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  skeletonTextContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    paddingBottom: 20,
  },
  skeletonTopOverlay: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    zIndex: 2,
  },
  skeletonLikeButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
  },
  skeletonRatingButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
  },
  pagination: {
    marginBottom: 20,
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

export default AllGalleriesScreen;