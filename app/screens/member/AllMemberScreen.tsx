import React, { useEffect, useRef, useState, useCallback, memo, useMemo } from "react";
import AppText from "../../components/Text";
import {
  View,
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
import FilterModal from "../../components/FilterModal";
import { modernColors, styles } from "./styles/styles";
import { MemberCardSkeleton } from "./ui/MemberCardSkeleton";
import { MemberCard } from "./ui/MemberCard";
import useToast from "../../hooks/useToast";

const ITEMS_PER_PAGE = 15;
const SKELETON_ITEM_COUNT = 6;

// --- Custom Hook for Data Fetching ---
const useMembersData = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({});
  const [memberGroups, setMemberGroups] = useState([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  const isLoadingRef = useRef(false);

  useEffect(() => {
    const fetchMemberGroups = async () => {
      try {
        const response = await fetch(`${appConfig.mobileApi}MemberGroup/GetAll?currentPage=1&pageSize=100`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        if (result.Data) setMemberGroups(result.Data);
      } catch (err) {
        console.error("Error fetching member groups:", err);
      }
    };
    fetchMemberGroups();
  }, []);

  const fetchMembers = useCallback(
    async (
      newPage = 1,
      pageSize = ITEMS_PER_PAGE,
      isLoadMore = false,
      filterParams = {}
    ) => {
      if (isLoadingRef.current) return;
      
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);

      let filterQuery = "";
      if (filterParams.filterName) {
        filterQuery += `&filterName=${encodeURIComponent(filterParams.filterName)}`;
      }
      if (filterParams.filterMemberGroupId && filterParams.filterMemberGroupId !== 'all') {
        filterQuery += `&filterMemberGroupId=${filterParams.filterMemberGroupId}`;
      }

      const finalUrl = `${appConfig.mobileApi}Member/GetAll?currentPage=${newPage}&pageSize=${pageSize}${filterQuery}`;

      try {
        const response = await fetch(finalUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();

        const newMembers = result.Data || [];
        setData(prevData => (isLoadMore ? [...prevData, ...newMembers] : newMembers));
        setTotal(result.Total || 0);
        setPage(newPage);
        setFilters(filterParams);
        
        setHasMore(newMembers.length >= pageSize);
        
        if (!isLoadMore) setInitialLoadComplete(true);

      } catch (err: any) {
        setError(err.message);
        if (!isLoadMore) {
          setData([]);
          setTotal(0);
          setHasMore(true);
          setInitialLoadComplete(true);
        }
      } finally {
        isLoadingRef.current = false;
        setLoading(false);
      }
    },
    []
  );

  const loadMore = useCallback(() => {
    if (!isLoadingRef.current && hasMore) {
      fetchMembers(page + 1, ITEMS_PER_PAGE, true, filters);
    }
  }, [hasMore, page, fetchMembers, filters]);

  const refresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    setInitialLoadComplete(false);
    fetchMembers(1, ITEMS_PER_PAGE, false, filters);
  }, [fetchMembers, filters]);

  return {
    data,
    total,
    loading,
    error,
    fetchMembers,
    loadMore,
    refresh,
    hasMore,
    page,
    filters,
    memberGroups,
    initialLoadComplete,
  };
};

const MemoizedMemberCard = memo(MemberCard);
const MemoizedMemberCardSkeleton = memo(MemberCardSkeleton);

const RowItem = memo(({ rowData, index, itemIndex, onPress, isSkeletonRow }: any) => {
  if (isSkeletonRow) {
    return (
      <View style={styles.memberItemContainer}>
        <MemoizedMemberCardSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.memberItemContainer}>
      <MemoizedMemberCard member={rowData} onPress={onPress} />
    </View>
  );
});

const AllMembersScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const { showToast, toastMessage, setToastVisible, toastType, toastVisible } = useToast();

  const {
    data: members,
    loading: membersLoading,
    error: membersError,
    fetchMembers,
    loadMore,
    refresh,
    hasMore,
    filters,
    memberGroups,
    initialLoadComplete,
  } = useMembersData();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const initialFilter: any = {};
    if (route.params?.filterGroupId) {
      initialFilter.filterMemberGroupId = route.params.filterGroupId.toString();
      setAppliedFilters(initialFilter);
      setHasActiveFilters(true);
    }
    fetchMembers(1, ITEMS_PER_PAGE, false, initialFilter);
  }, [route.params?.filterGroupId, fetchMembers]);

  useEffect(() => {
    if (membersError) {
      showToast('خطا در دریافت اطلاعات اعضا. لطفاً دوباره تلاش کنید.', 'error');
    }
  }, [membersError, showToast]);

  const handleMemberPress = useCallback((memberData: any) => {
    (navigation as any).navigate("UserProfile", { userData: memberData });
  }, [navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const filterOptions = useMemo(() => {
    const memberGroupOptions = [
      { label: "همه گروه‌ها", value: "all" },
      ...memberGroups
        .filter(group => group.Active)
        .map(group => ({
          label: `${group.GroupName} `,
          value: group.MemberGroupId.toString(),
        })),
    ];
    return {
      title: 'جستجو و فیلتر اعضا',
      icon: 'people',
      sections: [{ key: "memberGroupId", options: memberGroupOptions }],
    };
  }, [memberGroups]);

  const handleApplyFilters = useCallback((newFilters: any) => {
    setAppliedFilters(newFilters);
    const hasFilters = Object.values(newFilters).some(val => val !== false && val !== '' && val !== 'all' && val !== undefined && val !== null);
    setHasActiveFilters(hasFilters);

    if (hasFilters) showToast('فیلتر اعمال شد', 'success');
    else showToast('فیلتر پاک شد', 'info');

    fetchMembers(1, ITEMS_PER_PAGE, false, newFilters);
  }, [fetchMembers, showToast]);

  const dataForList = useMemo(() => {
    if (membersLoading && !initialLoadComplete) {
      return Array.from({ length: SKELETON_ITEM_COUNT }, (_, i) => ({ id: `skeleton-${i}` }));
    }
    if (membersError && members.length === 0) return [];
    return members;
  }, [membersLoading, initialLoadComplete, membersError, members]);

  const processedData = useMemo(() => {
    const chunked = [];
    for (let i = 0; i < dataForList.length; i += 2) {
      chunked.push(dataForList.slice(i, i + 2));
    }
    return chunked;
  }, [dataForList]);

  const renderItem = useCallback(({ item: rowData, index }: any) => {
    const isSkeletonRow = rowData.some((item:any) => item.id?.startsWith('skeleton'));
    return (
      <View style={styles.rowContainer}>
        {rowData.map((item:any, itemIndex: number) => (
          <RowItem
            key={item.MemberId ? `member-${item.MemberId}` : `skeleton-${index}-${itemIndex}`}
            rowData={item}
            index={index}
            itemIndex={itemIndex}
            onPress={handleMemberPress}
            isSkeletonRow={isSkeletonRow}
          />
        ))}
        {rowData.length === 1 && <View style={styles.memberItemContainer} />}
      </View>
    );
  }, [handleMemberPress]);

  const renderFooter = useCallback(() => {
    if (membersLoading && initialLoadComplete && hasMore) {
      return (
        <View style={styles.loadingFooter}>
          <ActivityIndicator size="small" color={modernColors.primary} />
          <AppText style={styles.loadingMoreText}>در حال بارگذاری...</AppText>
        </View>
      );
    }
    return null; 
  }, [membersLoading, initialLoadComplete, hasMore]);

  const renderEmptyComponent = useCallback(() => {
    if (!initialLoadComplete && membersLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="people" size={80} color="#9e9e9e" />
        <AppText style={styles.emptyTitle}>هیچ عضوی موجود نیست</AppText>
        <AppText style={styles.emptySubtitle}>
          {membersError ? "خطا در بارگذاری اطلاعات." : "در حال حاضر عضوی برای نمایش وجود ندارد"}
        </AppText>
        {membersError && (
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchMembers(1, ITEMS_PER_PAGE, false, filters)}>
            <MaterialIcons name="refresh" size={20} color={colors.white} />
            <AppText style={styles.retryButtonText}>تلاش مجدد</AppText>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [membersLoading, membersError, initialLoadComplete, fetchMembers, filters]);

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

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <View style={styles.backButtonContainer}>
            <MaterialIcons name="arrow-forward" size={24} color="#6366f1" />
          </View>
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setFilterModalVisible(true)}
            >
              <View style={[styles.filterIconContainer, hasActiveFilters && styles.activeFilterIcon]}>
                <MaterialIcons
                  name="search"
                  size={24}
                  color={hasActiveFilters ? "#ffffff" : "#6366f1"}
                />
                {hasActiveFilters && <View style={styles.filterBadge} />}
              </View>
            </TouchableOpacity>
            <View style={styles.titleWrapper}>
              <AppText style={styles.headerTitle}>اعضای فریمد</AppText>
            </View>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <FlatList
            key="members-list"
            data={processedData}
            renderItem={renderItem}
            // کلید مطمئن برای جلوگیری از پرش
            keyExtractor={(item, index) => {
               if (item[0]?.id?.startsWith('skeleton')) return `row-skeleton-${index}`;
               return `row-${item.map(m => m.MemberId).join('-')}`;
            }}
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
            ListFooterComponent={renderFooter}
            onEndReached={loadMore} 
            onEndReachedThreshold={0.5}
            initialNumToRender={SKELETON_ITEM_COUNT / 2}
            maxToRenderPerBatch={8}
            windowSize={11}
            removeClippedSubviews={true}
          />
        </View>
      </View>

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApplyFilters={handleApplyFilters}
        filterType="members"
        initialFilters={appliedFilters}
        customFilterOptions={filterOptions}
      />
    </>
  );
};

export default AllMembersScreen;