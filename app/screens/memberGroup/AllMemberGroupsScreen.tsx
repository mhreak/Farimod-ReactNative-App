import React, { useEffect, useState, useMemo, useCallback } from "react";
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
import { useNavigation } from "@react-navigation/native";
import Toast from "../../components/Toast";
import appConfig from "../../config/config";
import { styles, modernColors, gradientColors, fashionIcons } from "./styles/styles";
import { MemberGroupType } from "../../types/memberGroup/memberGroup.types";
import { MemberGroupCard } from "../home/ui/MemberGroupCard";
import { MemberGroupCardSkeleton } from "./ui/skeleton/MemberGroupCardSkeleton";
import useToast from "../../hooks/useToast";

const ITEMS_PER_PAGE = 20;
const ROW_HEIGHT = 120; 

const SKELETON_DATA = Array.from({ length: 9 }, (_, index) => ({
  id: `skeleton-${index}`,
  isSkeleton: true
}));

const chunkData = (data: any[], chunkSize: number) => {
  const chunks = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }
  return chunks;
};

const getGradientForGroup = (id: number) => gradientColors[id % gradientColors.length];
const getIconForGroup = (id: number) => fashionIcons[id % fashionIcons.length];

// Custom Hook
const useMemberGroupsWithInfiniteLoading = () => {
  const [data, setData] = useState<MemberGroupType[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMemberGroups = useCallback(async (newPage = 1, pageSize = ITEMS_PER_PAGE, isLoadMore = false) => {
    try {
      setLoading(true);
      setError(null);

      const finalUrl = `${appConfig.mobileApi}MemberGroup/GetAll?currentPage=${newPage}&pageSize=${pageSize}`;
      const response = await fetch(finalUrl);

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      const activeGroups = (result.Data || []).filter(
        (group: MemberGroupType) => group.Active && group.MemberCount >= 0
      );

      setData(prevData => isLoadMore ? [...prevData, ...activeGroups] : activeGroups);
      setTotal(result.Total || 0);
      setPage(newPage);
      setHasMore(activeGroups.length === pageSize && activeGroups.length > 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای نامشخص');
      if (!isLoadMore) {
        setData([]);
        setTotal(0);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchMemberGroups(page + 1, ITEMS_PER_PAGE, true);
    }
  }, [loading, hasMore, page, fetchMemberGroups]);

  const refresh = useCallback(async () => {
    setPage(1);
    setHasMore(true);
    await fetchMemberGroups(1, ITEMS_PER_PAGE, false);
  }, [fetchMemberGroups]);

  return { data, total, loading, error, fetchMemberGroups, loadMore, refresh, hasMore, page };
};

const AllMemberGroupsScreen = () => {
  const navigation = useNavigation();
  const {
    data: groups,
    loading: groupsLoading,
    error: groupsError,
    fetchMemberGroups,
    loadMore,
    refresh,
    hasMore,
  } = useMemberGroupsWithInfiniteLoading();
  const {toastVisible,setToastVisible,showToast,toastType,toastMessage}=useToast()

  const [refreshing, setRefreshing] = useState(false);

  const chunkedData = useMemo(() => {
    if (groupsLoading && groups.length === 0) {
      return chunkData(SKELETON_DATA, 3);
    }
    return chunkData(groups, 3);
  }, [groups, groupsLoading]);

  const groupStylingMap = useMemo(() => {
    const map: Record<number, { gradient: string[]; icon: string }> = {};
    groups.forEach(group => {
      map[group.MemberGroupId] = {
        gradient: getGradientForGroup(group.MemberGroupId),
        icon: getIconForGroup(group.MemberGroupId)
      };
    });
    return map;
  }, [groups]);

  useEffect(() => {
    fetchMemberGroups(1, ITEMS_PER_PAGE);
  }, [fetchMemberGroups]);


  const handleHideToast = useCallback(() => setToastVisible(false), []);

  useEffect(() => {
    if (groupsError) {
      showToast('خطا در دریافت اطلاعات گروه‌ها. لطفاً دوباره تلاش کنید.', 'error');
    }
  }, [groupsError, showToast]);

  const handleGroupPress = useCallback((groupData: MemberGroupType) => {
    try {
      (navigation as any).navigate("AllMembers", {
        filterGroupId: groupData.MemberGroupId,
        filterGroupName: groupData.GroupName
      });
    } catch (error) {
      showToast('خطا در باز کردن گروه', 'error');
    }
  }, [navigation, showToast]);

  const handleBackPress = useCallback(() => {
    (navigation as any).navigate("App", { screen: "MainTabs", params: { screen: "خانه" } });
  }, [navigation]);

  const handleLoadMore = useCallback(() => {
    if (!groupsLoading && hasMore) {
      loadMore();
    }
  }, [groupsLoading, hasMore, loadMore]);

  const renderRowItem = useCallback(({ item: rowData, index }: { item: any; index: number }) => {
    return (
      <View style={styles.rowContainer}>
        {rowData.map((item: any, itemIndex: number) => {
          const globalIndex = index * 3 + itemIndex;

          if (item.id && item.id.startsWith('skeleton')) {
            return (
              <View key={`skeleton-${globalIndex}`} style={styles.groupItemContainer}>
                <MemberGroupCardSkeleton />
              </View>
            );
          }

          const styling = groupStylingMap[item.MemberGroupId] || {
            gradient: getGradientForGroup(item.MemberGroupId),
            icon: getIconForGroup(item.MemberGroupId)
          };

          return (
            <View key={item.MemberGroupId || `item-${globalIndex}`} style={styles.groupItemContainer}>
              <MemberGroupCard
                item={item}
                onPress={handleGroupPress}
                selectedGradient={styling.gradient}
                selectedIcon={styling.icon}
              />
            </View>
          );
        })}

        {rowData.length < 3 && Array.from({ length: 3 - rowData.length }).map((_, idx) => (
          <View key={`empty-${index}-${idx}`} style={styles.groupItemContainer} />
        ))}
      </View>
    );
  }, [groupStylingMap, handleGroupPress]);

  const renderFooter = useCallback(() => {
    if (!groupsLoading || groups.length === 0) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={modernColors.primary} />
        <AppText style={styles.loadingMoreText}>در حال بارگذاری...</AppText>
      </View>
    );
  }, [groupsLoading, groups.length]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const renderEmptyComponent = useCallback(() => {
    if (groupsLoading && groups.length === 0) return null;
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="group" size={80} color="#9e9e9e" />
        <AppText style={styles.emptyTitle}>هیچ گروهی موجود نیست</AppText>
        <AppText style={styles.emptySubtitle}>در حال حاضر گروهی برای نمایش وجود ندارد</AppText>
      </View>
    );
  }, [groupsLoading, groups.length]);

  const handleRetry = useCallback(() => {
    fetchMemberGroups(1, ITEMS_PER_PAGE);
  }, [fetchMemberGroups]);

  const renderErrorComponent = useCallback(() => (
    <View style={styles.errorContainer}>
      <MaterialIcons name="error" size={80} color="#9e9e9e" />
      <AppText style={styles.errorTitle}>خطا در دریافت اطلاعات</AppText>
      <AppText style={styles.errorSubtitle}>لطفاً اتصال اینترنت خود را بررسی کنید</AppText>
      <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
        <MaterialIcons name="refresh" size={20} color={colors.white} />
        <AppText style={styles.retryButtonText}>تلاش مجدد</AppText>
      </TouchableOpacity>
    </View>
  ), [handleRetry]);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: ROW_HEIGHT,
    offset: ROW_HEIGHT * index,
    index,
  }), []);

  const keyExtractor = useCallback((_: any, index: number) => `row-${index}`, []);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        <MainBackground />

        <Toast
          visible={toastVisible}
          message={toastMessage}
          type={toastType}
          onHide={handleHideToast}
        />

        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <View style={styles.backButtonContainer}>
            <MaterialIcons name="arrow-forward" size={24} color="#6366f1" />
          </View>
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <View style={styles.titleWrapper}>
              <AppText style={styles.headerTitle}>گروه‌های اصلی</AppText>
            </View>
          </View>
        </View>

        <View style={styles.sectionTitleContainer}>
          <View style={styles.sparkleContainer}>
            <MaterialIcons name="star-half" size={16} color="#FFD700" style={styles.sparkle1} />
            <MaterialIcons name="star-half" size={12} color="#FF69B4" style={styles.sparkle2} />
          </View>
        </View>

        <View style={styles.contentContainer}>
          {groupsError ? (
            renderErrorComponent()
          ) : (
            <FlatList
              key="groups-list"
              data={chunkedData}
              renderItem={renderRowItem}
              keyExtractor={keyExtractor}
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
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.4} 
              getItemLayout={getItemLayout}
              removeClippedSubviews={true}
              maxToRenderPerBatch={6} 
              updateCellsBatchingPeriod={40}
              windowSize={7}
            />
          )}
        </View>
      </View>
    </>
  );
};

export default AllMemberGroupsScreen;