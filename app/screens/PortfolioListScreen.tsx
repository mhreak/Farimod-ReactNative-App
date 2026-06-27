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
  ActivityIndicator,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../config/colors";
import MainBackground from "../components/MainBackground";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import Toast from "../components/Toast";
import appConfig from "../config/config";
import { toPersianDigits } from "../utils/converters";
import { AppNavigationProp, RootStackParamList } from "../Navigators";
import { useAuth } from "../contexts/AuthContext";

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
  fashionPink: "#ff69b4",
  fashionGold: "#ffd700",
};

const ITEMS_PER_PAGE = 20;

const usePortfoliosWithInfiniteLoading = (memberId) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPortfolios = async (newPage = 1, pageSize = ITEMS_PER_PAGE) => {
    try {
      setLoading(true);
      setError(null);

      // ✅ اضافه کردن log برای دیباگ
      console.log('Fetching portfolios for memberId:', memberId);

      // ✅ استفاده از filterMemberId در query
      const url = memberId
        ? `${appConfig.mobileApi}Portfolio/GetAll?filterMemberId=${memberId}&currentPage=${newPage}&pageSize=${pageSize}`
        : `${appConfig.mobileApi}Portfolio/GetAll?currentPage=${newPage}&pageSize=${pageSize}`;

      console.log('Fetching URL:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      console.log('Portfolio response:', result);

      if (newPage === 1) {
        setData(result.Data || []);
      } else {
        setData(prevData => [...prevData, ...(result.Data || [])]);
      }

      setTotal(result.Total || 0);
      setPage(newPage);

      setHasMore((result.Data || []).length === pageSize && (result.Data || []).length > 0);
    } catch (err) {
      console.error('Error fetching portfolios:', err);
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
      fetchPortfolios(page + 1, ITEMS_PER_PAGE);
    }
  };

  return {
    data,
    total,
    loading,
    error,
    fetchPortfolios,
    loadMore,
    hasMore,
    page,
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

const PortfolioImageComponent = ({ item }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const hasValidImage = item.FeaturedImageURL &&
    !item.FeaturedImageURL.endsWith('/') &&
    item.FeaturedImageURL.trim() !== '';

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
      <View style={styles.portfolioImageContainer}>
        <View style={styles.portfolioImagePlaceholder}>
          <Image
            style={styles.portfolioDefaultImage}
            source={require("../../assets/portfolio_icon.jpg")}
            resizeMode="cover"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.portfolioImageContainer}>
      <Image
        source={{ uri: item.FeaturedImageURL }}
        style={styles.portfolioImage}
        onError={handleImageError}
        onLoad={handleImageLoad}
        resizeMode="cover"
      />
    </View>
  );
};

const PortfolioCardSkeleton = () => {
  return (
    <View style={styles.portfolioSkeletonContainer}>
      <View style={styles.portfolioImageSkeleton}>
        <SkeletonLoader width="100%" height="100%" borderRadius={12} />
      </View>

      <View style={styles.portfolioDetailsSkeleton}>
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

const PortfolioListScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { user } = useAuth(); // دریافت اطلاعات کاربر

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const {
    data: portfolios,
    total,
    loading: portfolioLoading,
    error: portfolioError,
    fetchPortfolios,
    loadMore,
    hasMore
  } = usePortfoliosWithInfiniteLoading(user?.MemberId); // ارسال userId به hook

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const [refreshing, setRefreshing] = useState(false);

  // انتقال handleAddPost به داخل کامپوننت
  const handleAddPost = () => {
    navigation.navigate("AddPortfolio");
  };

  useEffect(() => {
    fetchPortfolios(1, ITEMS_PER_PAGE);
  }, [user?.MemberId]); // fetch مجدد هنگام تغییر userId

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
    if (portfolioError) {
      showToast('خطا در دریافت اطلاعات نمونه کارها. لطفاً دوباره تلاش کنید.', 'error');
    }
  }, [portfolioError]);

  const handlePortfolioPress = (portfolioData) => {
    try {
      // بررسی انواع مختلف ID های موجود در پورتفولیو
      const portfolioId = portfolioData.PotfolioId || portfolioData.PortfolioId || portfolioData.index || 1;

      if (!portfolioId || portfolioId === 0) {
        console.error('Invalid portfolio ID:', portfolioId);
        showToast('خطا: شناسه نمونه کار نامعتبر است', 'error');
        return;
      }

      console.log('Navigating to portfolio with ID:', portfolioId, 'Original data:', portfolioData);

      navigation.navigate("PortfolioDetail", {
        title: portfolioData.Title || 'نمونه کار',
        portfolioId: portfolioId
      });
    } catch (error) {
      console.error('Navigation error (Portfolio):', error);
      showToast('خطا در باز کردن نمونه کار', 'error');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPortfolios(1, ITEMS_PER_PAGE);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!portfolioLoading && hasMore) {
      loadMore();
    }
  };

  const createSkeletonData = () => {
    return Array.from({ length: ITEMS_PER_PAGE }, (_, index) => ({
      id: `skeleton-${index}`,
      isSkeleton: true
    }));
  };

  const renderPortfolioItem = ({ item, index }) => {
    if (item.id && item.id.startsWith('skeleton')) {
      return (
        <View style={styles.portfolioItemContainer}>
          <PortfolioCardSkeleton />
        </View>
      );
    }

    return (
      <View style={styles.portfolioItemContainer}>
        <TouchableOpacity
          onPress={() => handlePortfolioPress(item)}
          activeOpacity={0.8}
          style={styles.portfolioCard}
        >
          <PortfolioImageComponent item={item} />

          <View style={[styles.statusBadge, { backgroundColor: item.Active ? modernColors.success : modernColors.warning }]}>
            <AppText style={styles.statusText}>
              {item.Active ? 'منتشر شده' : 'پیش نویس'}
            </AppText>
          </View>
          <View style={styles.likeBadge}>
            <MaterialIcons name="favorite" size={14} color="#ffffff" />
            <AppText style={styles.likeText}>{toPersianDigits((item.LikeCount || 0).toString())}</AppText>
          </View>

          <View style={styles.portfolioContent}>
            <View>
              <AppText style={styles.portfolioTitle} numberOfLines={2}>
                {toPersianDigits(item.Title)}
              </AppText>

              <AppText style={styles.portfolioDescription} numberOfLines={2}>
                {toPersianDigits(item.Description || 'بدون توضیحات')}
              </AppText>
            </View>

            <View style={styles.portfolioMeta}>
              <View style={styles.dateContainer}>
                <MaterialIcons name="calendar-month" size={14} color="#666" />

                <AppText style={styles.dateText}>
                  {toPersianDigits(item.ShamsiInsertDate || '')}
                </AppText>

              </View>

              {item.Rating && (
                <View style={styles.ratingContainer}>
                  <MaterialIcons name="star" size={14} color={modernColors.fashionGold} />
                  <AppText style={styles.ratingText}>
                    {toPersianDigits(item.Rating.toFixed(1))}
                  </AppText>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
    if (!portfolioLoading || portfolios.length === 0) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={modernColors.primary} />
        <AppText style={styles.loadingMoreText}>در حال بارگذاری...</AppText>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (portfolioLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="brush" size={80} color="#9e9e9e" />
        <AppText style={styles.emptyTitle}>هیچ نمونه کاری موجود نیست</AppText>
        <AppText style={styles.emptySubtitle}>
          در حال حاضر نمونه کاری برای نمایش وجود ندارد
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
        onPress={() => fetchPortfolios(1, ITEMS_PER_PAGE)}
      >
        <MaterialIcons name="refresh" size={20} color={colors.white} />
        <AppText style={styles.retryButtonText}>تلاش مجدد</AppText>
      </TouchableOpacity>
    </View>
  );

  // بررسی اینکه کاربر لاگین کرده است یا نه
  if (!user) {
    return (
      <View style={styles.container}>
        <MainBackground />
        <View style={styles.errorContainer}>
          <MaterialIcons name="login" size={80} color="#9e9e9e" />
          <AppText style={styles.errorTitle}>لطفا وارد حساب کاربری خود شوید</AppText>
          <AppText style={styles.errorSubtitle}>
            برای مشاهده نمونه کارها باید وارد حساب کاربری شوید
          </AppText>
        </View>
      </View>
    );
  }

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
            <AppText style={styles.headerTitle}>نمونه کارهای من</AppText>
          </View>
        </Animated.View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddPost}
        >
          <LinearGradient
            colors={[modernColors.success, '#27ae60']}
            style={styles.addButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialIcons name="add" size={24} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>

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
              color={modernColors.fashionGold}
              style={styles.sparkle1}
            />
            <MaterialIcons
              name="auto-awesome"
              size={12}
              color={modernColors.fashionPink}
              style={styles.sparkle2}
            />
          </View>
        </Animated.View>

        <Animated.View
          style={[styles.floatingDecoration1, { transform: [{ rotate: spin }] }]}
        >
          <MaterialIcons name="brush" size={30} color="rgba(255, 105, 180, 0.3)" />
        </Animated.View>
        <Animated.View
          style={[styles.floatingDecoration2, { transform: [{ rotate: spin }] }]}
        >
          <MaterialIcons name="palette" size={25} color="rgba(255, 215, 0, 0.3)" />
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
          {portfolioError ? (
            renderErrorComponent()
          ) : (
            <>
              <FlatList
                key="two-columns-flatlist"
                data={portfolioLoading && portfolios.length === 0 ? createSkeletonData() : portfolios}
                renderItem={renderPortfolioItem}
                keyExtractor={(item, index) => {
                  if (item.isSkeleton) {
                    return item.id;
                  }
                  // استفاده از ID های مختلف که ممکن است موجود باشد
                  const id = item.PotfolioId || item.PortfolioId || `portfolio-${index}`;
                  return id.toString();
                }}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
                columnWrapperStyle={styles.row}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[modernColors.primary]}
                    tintColor={modernColors.primary}
                  />
                }
                ListEmptyComponent={!portfolioLoading ? renderEmptyComponent : null}
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
                name="auto-awesome"
                size={22}
                color="rgba(147, 112, 219, 0.4)"
              />
            </Animated.View>
            <Animated.View style={[styles.star2, { transform: [{ rotate: spin }] }]}>
              <MaterialIcons
                name="diamond"
                size={18}
                color="rgba(255, 105, 180, 0.4)"
              />
            </Animated.View>
            <Animated.View style={[styles.star3, { transform: [{ rotate: spin }] }]}>
              <MaterialIcons
                name="star"
                size={20}
                color="rgba(255, 215, 0, 0.4)"
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
  addButton: {
    position: 'absolute',
    top: StatusBar.currentHeight + 45,
    left: 20,
    zIndex: 1000,
  },
  addButtonGradient: {
    width: 50,
    height: 50,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: modernColors.success,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    marginTop: -12
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
    paddingHorizontal: 10,
    width: '100%',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10
  },
  portfolioItemContainer: {
    width: (width - 40) / 2,
    paddingHorizontal: 5,
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
    flex: 1,
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
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#ffffff',
  },
  likeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(233, 30, 99, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 15,
    gap: 3,
  },
  likeText: {
    fontSize: 11,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#ffffff',
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
  portfolioSkeletonContainer: {
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
    height: 280,
    flex: 1,
  },
  portfolioImageSkeleton: {
    height: 140,
    width: '100%',
  },
  portfolioDetailsSkeleton: {
    padding: 12,
  },
  portfolioMetaSkeleton: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
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

export default PortfolioListScreen;