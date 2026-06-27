import React, { useEffect, useRef, useState } from "react";
import AppText from "../components/Text";
import {
  StyleSheet,
  View,
  Dimensions,
  Animated,
  StatusBar,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../config/colors";
import MainBackground from "../components/MainBackground";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import Toast from "../components/Toast";
import FilterModal from "../components/FilterModal";
import { toPersianDigits, safeNumber, formatPrice, safeString } from "../utils/converters";
import appConfig from "../config/config";

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


const useProductsWithPagination = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = async (page = 1, pageSize = ITEMS_PER_PAGE, filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      let queryParams = `filterActive=true&currentPage=${page}&pageSize=${pageSize}`;

      if (filters.filterProductName) {
        queryParams += `&filterProductName=${encodeURIComponent(filters.filterProductName)}`;
      }
      if (filters.filterProductCategoryId) {
        queryParams += `&filterProductCategoryId=${filters.filterProductCategoryId}`;
      }
      if (filters.filterMemberId) {
        queryParams += `&filterMemberId=${filters.filterMemberId}`;
      }

      const response = await fetch(
        `${appConfig.mobileApi}Product/GetAll?${queryParams}`
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

  return { data, total, loading, error, fetchProducts };
};

const useCategoryOptions = () => {
  const [categoryOptions, setCategoryOptions] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${appConfig.mobileApi}ProductCategory/GetAll?filterActive=true&currentPage=1&pageSize=100`
        );
        const result = await response.json();
        const options = (result.Data || []).map(cat => ({
          label: cat.Name,
          value: cat.ProductCategoryId,
        }));
        setCategoryOptions(options);
      } catch (e) {
        console.log('خطا در دریافت دسته‌بندی‌ها:', e);
      }
    };
    fetchCategories();
  }, []);

  return categoryOptions;
};


const SkeletonLoader = ({ style }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(animatedValue, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  return <Animated.View style={[{ backgroundColor: '#e1e5e9', opacity }, style]} />;
};

const ProductCardSkeleton = () => (
  <View style={styles.productCard}>
    <View style={styles.productImageContainer}>
      <SkeletonLoader style={styles.productImage} />
    </View>
    <View style={styles.productContent}>
      <View style={styles.skeletonTextContainer}>
        <SkeletonLoader style={styles.skeletonTitle} />
        <SkeletonLoader style={styles.skeletonTitleSecond} />
      </View>
      <View style={styles.skeletonPriceContainer}>
        <SkeletonLoader style={styles.skeletonPrice} />
      </View>
    </View>
  </View>
);


const ProductCard = ({ item, onPress }) => {
  const [imageError, setImageError] = useState(false);

  const price = safeNumber(item.Price);
  const specialPrice = safeNumber(item.SpecialSalePrice);
  const discountPercentage =
    specialPrice > 0 && price > 0
      ? Math.round(((price - specialPrice) / price) * 100)
      : 0;

  const getImageSource = () => {
    if (imageError) return require("../../assets/Product_icon.jpg");
    if (item.FeaturedImageURL) return { uri: item.FeaturedImageURL };
    if (item.FeaturedImageFileName)
      return { uri: `${appConfig.mobileApi}Product/GetProductImage/${item.FeaturedImageFileName}` };
    if (item.ProductImageFileName)
      return { uri: `${appConfig.mobileApi}Product/GetProductImage/${item.ProductImageFileName}` };
    return require("../../assets/Product_icon.jpg");
  };

  return (
    <TouchableOpacity style={styles.productCard} activeOpacity={0.8} onPress={() => onPress(item)}>
      <View style={styles.productImageContainer}>
        <Image
          source={getImageSource()}
          style={styles.productImage}
          resizeMode="cover"
          onError={() => {
            console.log('خطا در بارگذاری تصویر محصول:', item.ProductName);
            setImageError(true);
          }}
          onLoad={() => { if (imageError) setImageError(false); }}
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
            <AppText style={styles.unavailableText}>غیرفعال</AppText>
          </View>
        )}
      </View>

      <View style={styles.productContent}>
        <AppText style={styles.productTitle} numberOfLines={2}>
          {safeString(item.ProductName, 'نام محصول')}
        </AppText>

        <View style={styles.priceSection}>
          {discountPercentage > 0 ? (
            <View style={styles.priceContainer}>
              <AppText style={styles.originalPrice}>{formatPrice(price)}</AppText>
              <AppText style={styles.specialPrice}>{formatPrice(specialPrice)}</AppText>
            </View>
          ) : (
            <AppText style={styles.productPrice}>{formatPrice(price)}</AppText>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Pagination ───────────────────────────────────────────────────────────────

const PaginationComponent = ({ currentPage, totalPages, onPageChange, style = {} }) => {
  const pageButtonAnim = useRef(new Animated.Value(1)).current;
  const [animatingPage, setAnimatingPage] = useState(null);

  const animatePageChange = (page) => {
    if (page === currentPage) return;
    setAnimatingPage(page);
    Animated.sequence([
      Animated.timing(pageButtonAnim, { toValue: 0.8, duration: 100, useNativeDriver: true }),
      Animated.timing(pageButtonAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
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
        style={[styles.pageButton, isActive && styles.activePageButton]}
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
          <AppText style={[styles.pageButtonText, isActive && styles.activePageButtonText]}>
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
        <TouchableOpacity key="prev" style={styles.navButton} onPress={() => animatePageChange(currentPage - 1)} activeOpacity={0.7}>
          <LinearGradient colors={[modernColors.primary, modernColors.primaryDark]} style={styles.navButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <MaterialIcons name="keyboard-arrow-right" size={20} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    if (startPage > 1) {
      items.push(renderPageButton(1, currentPage === 1));
      if (startPage > 2) {
        items.push(<View key="ellipsis-start" style={styles.ellipsis}><AppText style={styles.ellipsisText}>...</AppText></View>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(renderPageButton(i, i === currentPage));
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<View key="ellipsis-end" style={styles.ellipsis}><AppText style={styles.ellipsisText}>...</AppText></View>);
      }
      items.push(renderPageButton(totalPages, currentPage === totalPages));
    }

    if (currentPage < totalPages) {
      items.push(
        <TouchableOpacity key="next" style={styles.navButton} onPress={() => animatePageChange(currentPage + 1)} activeOpacity={0.7}>
          <LinearGradient colors={[modernColors.primary, modernColors.primaryDark]} style={styles.navButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
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

// ─── Main Screen ──────────────────────────────────────────────────────────────

const AllProductsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const { data: products, total, loading: productsLoading, error: productsError, fetchProducts } =
    useProductsWithPagination();

  const categoryOptions = useCategoryOptions();

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const [refreshing, setRefreshing] = useState(false);
  const { filteredMemberId, filteredMemberName, filterType } = route.params || {};

  const productFilterOptions = {
    title: 'فیلتر محصولات',
    icon: 'filter-list',
    sections: [
      {
        key: 'categoryId',
        options: categoryOptions,
      },
    ],
  };

  // ─── Helpers ───────────────────────────────────────────────────

  const showToast = (message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const handleProductPress = (productData) => {
    navigation.navigate("ProductDetails", { productData });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    Animated.timing(slideAnim, { toValue: 20, duration: 200, useNativeDriver: true }).start(() => {
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts(currentPage, ITEMS_PER_PAGE, appliedFilters);
    setRefreshing(false);
  };

  const handleApplyFilters = (filters) => {
    setAppliedFilters(filters);
    setCurrentPage(1);

    const hasFilters = Object.keys(filters).some(key => {
      const value = filters[key];
      return value !== false && value !== '' && value !== 'all' && value !== undefined && value !== null;
    });

    setHasActiveFilters(hasFilters);

    if (hasFilters) {
      showToast('فیلترها اعمال شد', 'success');
    }
  };

  const clearAllFilters = () => {
    setAppliedFilters({});
    setHasActiveFilters(false);
    setCurrentPage(1);
    showToast('فیلترها پاک شد', 'info');
  };

  const createSkeletonData = () =>
    Array.from({ length: ITEMS_PER_PAGE }, (_, index) => ({ id: `skeleton-${index}`, isSkeleton: true }));

  // ─── Render Helpers ────────────────────────────────────────────

  const renderProductItem = ({ item }) => {
    if (item.isSkeleton) {
      return <View style={styles.productItemContainer}><ProductCardSkeleton /></View>;
    }
    return <View style={styles.productItemContainer}><ProductCard item={item} onPress={handleProductPress} /></View>;
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="shopping-bag" size={80} color="#9e9e9e" />
      <AppText style={styles.emptyTitle}>هیچ محصولی موجود نیست</AppText>
      <AppText style={styles.emptySubtitle}>در حال حاضر محصولی برای نمایش وجود ندارد</AppText>
    </View>
  );

  const renderErrorComponent = () => (
    <View style={styles.errorContainer}>
      <MaterialIcons name="error" size={80} color="#9e9e9e" />
      <AppText style={styles.errorTitle}>خطا در دریافت اطلاعات</AppText>
      <AppText style={styles.errorSubtitle}>لطفاً اتصال اینترنت خود را بررسی کنید</AppText>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => fetchProducts(currentPage, ITEMS_PER_PAGE, appliedFilters)}
      >
        <MaterialIcons name="refresh" size={20} color={colors.white} />
        <AppText style={styles.retryButtonText}>تلاش مجدد</AppText>
      </TouchableOpacity>
    </View>
  );

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const displayData = productsLoading && products.length === 0 ? createSkeletonData() : products;

  // ─── Effects ───────────────────────────────────────────────────

  useEffect(() => {
    const initialFilters = {};
    if (filteredMemberId && filterType === 'member') {
      initialFilters.filterMemberId = filteredMemberId;
      setAppliedFilters(initialFilters);
      setHasActiveFilters(true);
      showToast(`نمایش محصولات ${filteredMemberName}`, 'info');
    }
    fetchProducts(currentPage, ITEMS_PER_PAGE, initialFilters);
  }, [filteredMemberId]);

  useEffect(() => {
    fetchProducts(currentPage, ITEMS_PER_PAGE, appliedFilters);
  }, [currentPage, appliedFilters]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 8000, useNativeDriver: true })
    ).start();
  }, []);

  useEffect(() => {
    if (productsError) {
      showToast('خطا در دریافت اطلاعات محصولات. لطفاً دوباره تلاش کنید.', 'error');
    }
  }, [productsError]);

  // ─── Render ────────────────────────────────────────────────────

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
          filterType="products"
          initialFilters={appliedFilters}
          customFilterOptions={productFilterOptions}
        />

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("App", { screen: "MainTabs", params: { screen: "خانه" } })}>
          <View style={styles.backButtonContainer}>
            <MaterialIcons name="arrow-forward" size={24} color="#6366f1" />
          </View>
        </TouchableOpacity>

        {/* Header */}
        <Animated.View
          style={[styles.headerContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
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
              <AppText style={styles.headerTitle}>
                {filteredMemberId && filteredMemberName ? `محصولات ${filteredMemberName}` : 'محصولات'}
              </AppText>
            </View>

            {hasActiveFilters && (
              <TouchableOpacity style={styles.clearFiltersButton} onPress={clearAllFilters}>
                <MaterialIcons name="clear" size={20} color="#ff6b6b" />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Sparkle decoration */}
        <Animated.View
          style={[styles.sectionTitleContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.sparkleContainer}>
            <MaterialIcons name="star-half" size={16} color="#FFD700" style={styles.sparkle1} />
            <MaterialIcons name="star-half" size={12} color="#FF6B6B" style={styles.sparkle2} />
          </View>
        </Animated.View>

        <Animated.View style={[styles.floatingDecoration1, { transform: [{ rotate: spin }] }]} />
        <Animated.View style={[styles.floatingDecoration2, { transform: [{ rotate: spin }] }]} />

        {/* Content */}
        <Animated.View
          style={[styles.contentContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          {productsError ? (
            renderErrorComponent()
          ) : (
            <>
              <FlatList
                key="products-grid"
                data={displayData}
                renderItem={renderProductItem}
                keyExtractor={(item, index) =>
                  item.isSkeleton
                    ? item.id
                    : item.ProductId
                      ? item.ProductId.toString()
                      : `product-${index}`
                }
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
                ListEmptyComponent={!productsLoading ? renderEmptyComponent : null}
                ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
              />

              {!productsLoading && !productsError && totalPages > 1 && (
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

        {/* Decorative floating elements */}
        <View style={styles.decorativeElements}>
          <View style={styles.floatingElements}>
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
        </View>
      </View>
    </>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    marginTop: -12,
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
    shadowOffset: { width: 0, height: 2 },
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  titleWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Yekan_Bakh_ExtraBold",
    color: "#2c3e50",
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
    top: 25,
    right: 25,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 20,
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  row: {
    justifyContent: 'center',
    paddingHorizontal: 0,
    marginBottom: 8,
    width: '100%',
  },
  productItemContainer: {
    width: (width - 50) / 2,
    marginBottom: 10,
    marginHorizontal: 6,
  },
  productCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 0,
    elevation: 0,
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
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 2,
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
    zIndex: 3,
  },
  unavailableText: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#fff',
  },
  productContent: {
    padding: 12,
    height: 85,
    justifyContent: 'space-between',
  },
  productTitle: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#333',
    textAlign: 'center',
    lineHeight: 18,
    flex: 1,
    minHeight: 32,
  },
  priceSection: {
    alignItems: 'center',
  },
  priceContainer: {
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.primary,
    textAlign: 'center',
  },
  originalPrice: {
    fontSize: 11,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#999',
    textAlign: 'center',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  specialPrice: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#ff6b6b',
    textAlign: 'center',
  },
  // Skeleton
  skeletonTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  skeletonTitle: {
    height: 14,
    width: '80%',
    borderRadius: 7,
    marginBottom: 6,
  },
  skeletonTitleSecond: {
    height: 12,
    width: '60%',
    borderRadius: 6,
  },
  skeletonPriceContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  skeletonPrice: {
    height: 16,
    width: 80,
    borderRadius: 8,
  },
  // Empty / Error
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
  // Floating decorations
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
  // Pagination
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
    shadowOffset: { width: 0, height: 1 },
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
  activePageButton: {},
  activePageButtonContent: {
    backgroundColor: modernColors.primary,
    borderColor: modernColors.primary,
    shadowColor: modernColors.primary,
    shadowOffset: { width: 0, height: 3 },
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
    shadowOffset: { width: 0, height: 3 },
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
});

export default AllProductsScreen;