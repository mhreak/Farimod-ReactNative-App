import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import AppText from "../../components/Text";
import {
  View,
  Animated,
  StatusBar,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import colors from "../../config/colors";
import MainBackground from "../../components/MainBackground";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import Toast from "../../components/Toast";
import FilterModal from "../../components/FilterModal";
import { styles, modernColors } from "./styles/styles";
import { useProductsWithPagination } from "./hooks/useProductsWithPagination";
import { useCategoryOptions } from "./hooks/useCategoryOptions";
import { ProductCardSkeleton } from "./ui/ProductCardSkeleton";
import { ProductCard } from "./ui/ProductCard";
import { PaginationComponent } from "./component/PaginationComponent";

const ITEMS_PER_PAGE = 20;

// این کامپوننت ثابت است، خارج از رندر تعریف می‌شود تا حافظه مصرف نکند
const ItemSeparator = () => <View style={{ height: 4 }} />;

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

  // استفاده از useMemo برای جلوگیری از ساخت مجدد آبجکت فیلتر
  const productFilterOptions = useMemo(() => ({
    title: 'فیلتر محصولات',
    icon: 'filter-list',
    sections: [
      {
        key: 'categoryId',
        options: categoryOptions,
      },
    ],
  }), [categoryOptions]);

  // ─── Helpers (Optimized with useCallback) ─────────────────────

  const showToast = useCallback((message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  }, []);

  const handleProductPress = useCallback((productData) => {
    navigation.navigate("ProductDetails", { productData });
  }, [navigation]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    Animated.timing(slideAnim, { toValue: 20, duration: 200, useNativeDriver: true }).start(() => {
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    });
  }, [slideAnim]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProducts(currentPage, ITEMS_PER_PAGE, appliedFilters);
    setRefreshing(false);
  }, [fetchProducts, currentPage, appliedFilters]);

  const handleApplyFilters = useCallback((filters) => {
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
  }, [showToast]);

  const clearAllFilters = useCallback(() => {
    setAppliedFilters({});
    setHasActiveFilters(false);
    setCurrentPage(1);
    showToast('فیلترها پاک شد', 'info');
  }, [showToast]);

  const skeletonData = useMemo(() => 
    Array.from({ length: ITEMS_PER_PAGE }, (_, index) => ({ id: `skeleton-${index}`, isSkeleton: true })), 
  []);

  const displayData = productsLoading && products.length === 0 ? skeletonData : products;

  // ─── Render Helpers (Optimized with useCallback) ───────────────

  const renderProductItem = useCallback(({ item }) => {
    if (item.isSkeleton) {
      return <View style={styles.productItemContainer}><ProductCardSkeleton /></View>;
    }
    return <View style={styles.productItemContainer}><ProductCard item={item} onPress={handleProductPress} /></View>;
  }, [handleProductPress]);

  const renderEmptyComponent = useCallback(() => {
    if (productsLoading) return null; 
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="shopping-bag" size={80} color="#9e9e9e" />
        <AppText style={styles.emptyTitle}>هیچ محصولی موجود نیست</AppText>
        <AppText style={styles.emptySubtitle}>در حال حاضر محصولی برای نمایش وجود ندارد</AppText>
      </View>
    );
  }, [productsLoading]);

  const renderErrorComponent = useCallback(() => (
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
  ), [fetchProducts, currentPage, appliedFilters]);

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  // ─── Effects (Fixed Loops & Double Fetching) ───────────────────

  useEffect(() => {
    if (filteredMemberId && filterType === 'member') {
      setAppliedFilters({ filterMemberId: filteredMemberId });
      setHasActiveFilters(true);
      showToast(`نمایش محصولات ${filteredMemberName}`, 'info');
    }
  }, [filteredMemberId, filterType, filteredMemberName, showToast]);

  useEffect(() => {
    fetchProducts(currentPage, ITEMS_PER_PAGE, appliedFilters);
  }, [currentPage, appliedFilters, fetchProducts]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 8000, useNativeDriver: true })
    ).start();
  }, [fadeAnim, slideAnim, rotateAnim]);

  useEffect(() => {
    if (productsError) {
      showToast('خطا در دریافت اطلاعات محصولات. لطفاً دوباره تلاش کنید.', 'error');
    }
  }, [productsError, showToast]);

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
        <Animated.View style={[styles.headerContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
              <View style={[styles.filterIconContainer, hasActiveFilters && styles.activeFilterIcon]}>
                <MaterialIcons name="filter-list" size={24} color={hasActiveFilters ? "#ffffff" : "#6366f1"} />
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
        <Animated.View style={[styles.sectionTitleContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.sparkleContainer}>
            <MaterialIcons name="star-half" size={16} color="#FFD700" style={styles.sparkle1} />
            <MaterialIcons name="star-half" size={12} color="#FF6B6B" style={styles.sparkle2} />
          </View>
        </Animated.View>

        <Animated.View style={[styles.floatingDecoration1, { transform: [{ rotate: spin }] }]} />
        <Animated.View style={[styles.floatingDecoration2, { transform: [{ rotate: spin }] }]} />

        {/* Content */}
        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
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
                ListEmptyComponent={renderEmptyComponent}
                ItemSeparatorComponent={ItemSeparator}
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
        {/* <View style={styles.decorativeElements}>
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
        </View> */}
      </View>
    </>
  );
};

export default AllProductsScreen;