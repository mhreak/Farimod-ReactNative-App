import React, { useEffect, useRef, useState } from "react";
import AppText from "../../components/Text";
import {

  View,
  Animated,
  StatusBar,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import colors from "../../config/colors";
import MainBackground from "../../components/MainBackground";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import Toast from "../../components/Toast";
import appConfig from "../../config/config";
import { toPersianDigits } from "../../utils/converters";
import FilterModal from "../../components/FilterModal";
import { modernColors,styles } from "./styles/styles";
import { PortfolioImageComponent } from "./component/PortfolioImageComponent";
import { PortfolioCardSkeleton } from "./ui/PortfolioCardSkeleton";

const ITEMS_PER_PAGE = 20;

const usePortfoliosWithInfiniteLoading = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  const fetchPortfolios = async (newPage = 1, pageSize = ITEMS_PER_PAGE, filterParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      let filterQuery = "";

      // فقط فیلتر بر اساس نام
      if (filterParams.filterTitle) {
        console.log('Adding filterTitle to query:', filterParams.filterTitle);
        filterQuery += `filterTitle=${encodeURIComponent(filterParams.filterTitle)}&`;
      }
      if (filterParams.filterMemberId) {
        filterQuery += `filterMemberId=${filterParams.filterMemberId}&`;
      }
      const finalUrl = `${appConfig.mobileApi}Portfolio/GetAll?${filterQuery}currentPage=${newPage}&pageSize=${pageSize}`;
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

      // تشخیص اینکه آیا صفحات بیشتری وجود دارد یا نه
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
      fetchPortfolios(page + 1, ITEMS_PER_PAGE, filters);
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
    filters,
  };
};

const AllPortfolioScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

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
    hasMore,
    filters
  } = usePortfoliosWithInfiniteLoading();

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPortfolios(1, ITEMS_PER_PAGE);
  }, []);
  const { filteredMemberId, filteredMemberName, filterType } = route.params || {};

  useEffect(() => {
    // اگر از پروفایل کاربر آمده، فیلتر کاربر را اعمال کن
    if (filteredMemberId && filterType === 'member') {
      const memberFilter = {
        filterMemberId: filteredMemberId
      };
      setAppliedFilters(memberFilter);
      setHasActiveFilters(true);
      fetchPortfolios(1, ITEMS_PER_PAGE, memberFilter);

      showToast(`نمایش نمونه کارهای ${filteredMemberName}`, 'info');
    } else {
      fetchPortfolios(1, ITEMS_PER_PAGE);
    }
  }, [filteredMemberId]);


  // useEffect(() => {
  //   Animated.parallel([
  //     Animated.timing(fadeAnim, {
  //       toValue: 1,
  //       duration: 1000,
  //       useNativeDriver: true,
  //     }),
  //     Animated.timing(slideAnim, {
  //       toValue: 0,
  //       duration: 800,
  //       useNativeDriver: true,
  //     }),
  //   ]).start();

  //   Animated.loop(
  //     Animated.timing(rotateAnim, {
  //       toValue: 1,
  //       duration: 8000,
  //       useNativeDriver: true,
  //     })
  //   ).start();
  // }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const showToast = (message:any, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  useEffect(() => {
    if (portfolioError) {
      showToast('خطا در دریافت اطلاعات نمونه کارها. لطفاً دوباره تلاش کنید.', 'error');
    }
  }, [portfolioError]);

  const handlePortfolioPress = (portfolioData:any) => {
    try {
      // بررسی انواع مختلف ID های موجود در پورتفولیو
      const portfolioId = portfolioData.PotfolioId || portfolioData.PortfolioId || portfolioData.index || 1;

      if (!portfolioId || portfolioId === 0) {
        console.error('Invalid portfolio ID:', portfolioId);
        showToast('خطا: شناسه نمونه کار نامعتبر است', 'error');
        return;
      }

      console.log('Navigating to portfolio with ID:', portfolioId, 'Original data:', portfolioData);

      (navigation as any).navigate("PortfolioDetail", {
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
    await fetchPortfolios(1, ITEMS_PER_PAGE, appliedFilters);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!portfolioLoading && hasMore) {
      loadMore();
    }
  };

  const handleApplyFilters = (newFilters:any) => {
    console.log('Received filters in AllPortfolioScreen:', newFilters);

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

    console.log('Calling fetchPortfolios with filters:', newFilters);
    fetchPortfolios(1, ITEMS_PER_PAGE, newFilters);
  };

  const clearAllFilters = () => {
    setAppliedFilters({});
    setHasActiveFilters(false);
    fetchPortfolios(1, ITEMS_PER_PAGE, {});
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
      title: 'فیلتر نمونه کارها',
      icon: 'brush',
      sections: [
        {
          title: 'جستجو بر اساس نام',
          type: 'text',
          key: 'title',
          icon: 'search',
          placeholder: 'نام نمونه کار را وارد کنید...',
        }
      ],
    };
  };

  const renderPortfolioItem = ({ item, index }:any) => {
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
    if (!portfolioLoading) return null;

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
        onPress={() => fetchPortfolios(1, ITEMS_PER_PAGE, appliedFilters)}
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
          type={toastType as any}
          onHide={() => setToastVisible(false)}
        />

        <FilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          onApplyFilters={handleApplyFilters}
          filterType="portfolio"
          initialFilters={appliedFilters}
          customFilterOptions={prepareFilterOptions() as any}
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

        <View
          style={[
            styles.headerContainer,
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
              <AppText style={styles.headerTitle}>همه نمونه کارها</AppText>
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
        </View>



        <View
          style={[
            styles.contentContainer,
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
        </View>

      </View>
    </>
  );
};

export default AllPortfolioScreen;