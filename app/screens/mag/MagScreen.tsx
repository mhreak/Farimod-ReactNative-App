import React, { useEffect, useRef, useState } from "react";
import AppText from "../../components/Text";
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
import colors from "../../config/colors";
import MainBackground from "../../components/MainBackground";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import Toast from "../../components/Toast";
import appConfig from "../../config/config";
import { toPersianDigits } from "../../utils/converters";
import FilterModal from "../../components/FilterModal";
import { modernColors , styles} from "./styles/styles";
import { useBlogPostsWithPagination } from "./hooks/useBlogPostsWithPagination";
import { useBlogCategories } from "./hooks/useBlogCategories";
import BlogImageComponent from "./component/BlogImageComponent";
import { BlogPostCardSkeleton } from "./ui/BlogPostCardSkeleton";
import useToast from "../../hooks/useToast";
import { useCallback } from "react";
import { useMemo } from "react";

const ITEMS_PER_PAGE = 20;

const MagScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {showToast , toastMessage , setToastVisible , toastType , toastVisible} =useToast()
  const { filteredMemberId, filteredMemberName, filterType }:any = route.params || {};

useEffect(() => {
  if (filteredMemberId && filterType === "member") {
    const memberFilter = { filterMemberId: filteredMemberId };

    setAppliedFilters(memberFilter);
    setHasActiveFilters(true);

    fetchBlogPosts(1, ITEMS_PER_PAGE, memberFilter);

    showToast(`نمایش مقالات ${filteredMemberName}`, "info");
  } else {
    fetchBlogPosts(1, ITEMS_PER_PAGE);
  }

  fetchCategories();
}, [filteredMemberId]);

  const getHeaderTitle = () => {
    if (filteredMemberId && filteredMemberName) {
      return `مقالات`;
    }
    return 'وبلاگ و مقالات مد';
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


  const [refreshing, setRefreshing] = useState(false);

  // useEffect(() => {
  //   fetchBlogPosts(1, ITEMS_PER_PAGE);
  //   fetchCategories();
  // }, []);





  useEffect(() => {
    if (blogError) {
      showToast('خطا در دریافت اطلاعات مقالات. لطفاً دوباره تلاش کنید.', 'error');
    }
    if (categoriesError) {
      showToast('خطا در دریافت دسته‌بندی‌ها. لطفاً دوباره تلاش کنید.', 'error');
    }
  }, [blogError, categoriesError]);

    const handleBlogPress = useCallback((blogData:any) => {
      (navigation as any).navigate("MagDetailes", {
        title: blogData.Title,
        blogId: blogData.BlogPostId,
      });
    }, [navigation]);


  const onRefresh = useCallback(async () => {
  setRefreshing(true);
  await fetchBlogPosts(1, ITEMS_PER_PAGE, appliedFilters);
  setRefreshing(false);
}, [fetchBlogPosts, appliedFilters]);

  const handleLoadMore = useCallback(() => {
    if (!blogLoading && hasMore) {
      loadMore();
    }
  }, [blogLoading, hasMore, loadMore]);

  const handleApplyFilters = (newFilters) => {

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



const filterOptions = useMemo(() => {
  return {
    title: "فیلتر مقالات",
    icon: "article",
    sections: [
      {
        title: "دسته‌بندی",
        type: "selection",
        key: "categoryId",
        icon: "category",
        options: [
          { label: "همه", value: "all" },
          ...(categories || []).map((category) => ({
            label: category.Name,
            value: category.BlogPostCategoryId.toString(),
          })),
        ],
      },
    ],
  };
}, [categories]);


  const renderBlogItem = ({ item, index }:any) => {
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

  const skeletonData = useMemo(() => {
      return Array.from({ length: ITEMS_PER_PAGE }, (_, index) => ({
        id: `skeleton-${index}`,
        isSkeleton: true,
      }));
    }, []);


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
          customFilterOptions={filterOptions}
        />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>(navigation as any).navigate("App", { screen: "MainTabs", params: { screen: "خانه" } })}
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


        </View>

        <View
          style={[
            styles.contentContainer,
          ]}
        >
          {blogError ? (
            renderErrorComponent()
          ) : (
            <>
              <FlatList
                data={blogLoading && blogPosts.length === 0 ? skeletonData : blogPosts}
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
        </View>

 
      </View>
    </>
  );
};



export default MagScreen;