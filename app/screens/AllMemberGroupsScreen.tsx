

import React, { useEffect, useState, useMemo, useCallback } from "react";
import AppText from "../components/Text";
import {
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../config/colors";
import MainBackground from "../components/MainBackground";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Toast from "../components/Toast";
import { safeString, toPersianDigits } from "../utils/converters";
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

interface MemberGroup {
  MemberGroupId: number;
  GroupName: string;
  MemberCount: number;
  Active: boolean;
  ActiveStr: string;
  InsertDate: string;
  ShamsiInsertDate: string;
}

const useMemberGroupsWithInfiniteLoading = () => {
  const [data, setData] = useState<MemberGroup[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMemberGroups = async (newPage = 1, pageSize = ITEMS_PER_PAGE, isLoadMore = false) => {
    try {
      setLoading(true);
      setError(null);

      const finalUrl = `${appConfig.mobileApi}MemberGroup/GetAll?currentPage=${newPage}&pageSize=${pageSize}`;
      console.log('Fetching member groups:', finalUrl);

      const response = await fetch(finalUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // فیلتر کردن گروه‌های فعال با MemberCount > 0
      const activeGroups = (result.Data || []).filter(
        (group: MemberGroup) => group.Active && group.MemberCount >= 0
      );

      if (isLoadMore) {
        setData(prevData => [...prevData, ...activeGroups]);
      } else {
        setData(activeGroups);
      }

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
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchMemberGroups(page + 1, ITEMS_PER_PAGE, true);
    }
  };

  const refresh = () => {
    setPage(1);
    setHasMore(true);
    fetchMemberGroups(1, ITEMS_PER_PAGE, false);
  };

  return {
    data,
    total,
    loading,
    error,
    fetchMemberGroups,
    loadMore,
    refresh,
    hasMore,
    page,
  };
};

const SkeletonLoader = ({ width, height, borderRadius = 8, style = {} }: { width: number | string; height: number | string; borderRadius?: number; style?: any }) => {
  return (
    <View
      style={[
        {
          width,
          height,
          backgroundColor: '#e0e0e0',
          borderRadius,
        },
        style,
      ]}
    />
  );
};

const MemberGroupCardSkeleton = React.memo(() => {
  return (
    <View style={styles.groupCard}>
      <SkeletonLoader width="100%" height="100%" borderRadius={24} />
    </View>
  );
});

const gradientColors = [
  ['#667eea', '#764ba2'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
  ['#43e97b', '#38f9d7'],
  ['#fa709a', '#fee140'],
  ['#30cfd0', '#330867'],
  ['#a8edea', '#fed6e3'],
  ['#ff9a9e', '#fecfef'],
  ['#ffecd2', '#fcb69f'],
  ['#ff6e7f', '#bfe9ff'],
  ['#8EC5FC', '#E0C3FC'],
  ['#fbc2eb', '#a6c1ee'],
  ['#fdcbf1', '#e6dee9'],
  ['#a1c4fd', '#c2e9fb'],
  ['#d299c2', '#fef9d7'],
  ['#FEE140', '#FA709A'],
  ['#FDBB2D', '#22C1C3'],
  ['#ee9ca7', '#ffdde1'],
  ['#89f7fe', '#66a6ff'],
  ['#cd9cf2', '#f6f3ff'],
];

const fashionIcons = [
  "tshirt-crew",
  "hanger",
  "ruler",
  "draw",
  "palette",
  "scissors-cutting",
  "content-cut",
  "tag",
  "shopping",
  "badge-account",
  "brush",
];

const getGradientForGroup = (id: number) => {
  const index = id % gradientColors.length;
  return gradientColors[index];
};

const getIconForGroup = (id: number) => {
  const index = id % fashionIcons.length;
  return fashionIcons[index];
};

const MemberGroupCard = React.memo(({
  item,
  onPress,
  selectedGradient,
  selectedIcon
}: {
  item: MemberGroup;
  onPress?: (group: MemberGroup) => void;
  selectedGradient: string[];
  selectedIcon: string;
}) => {
  const handlePress = useCallback(() => {
    if (onPress) {
      onPress(item);
    }
  }, [onPress, item]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={!onPress}
      style={styles.groupCardWrapper}
    >
      <View style={styles.groupCard}>
        <LinearGradient
          colors={selectedGradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.groupGradient}
        >
          <View style={styles.groupContent}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={selectedIcon as any}
                size={38}
                color="rgba(0, 0, 0, 0.95)"
              />
            </View>

            <AppText style={styles.groupTitle} numberOfLines={2}>
              {safeString(item.GroupName, 'گروه بدون نام')}
            </AppText>


          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
});

const chunkData = (data: any[], chunkSize: number) => {
  const chunks = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }
  return chunks;
};

const AllMemberGroupsScreen = () => {
  const navigation = useNavigation();

  const {
    data: groups,
    total,
    loading: groupsLoading,
    error: groupsError,
    fetchMemberGroups,
    loadMore,
    refresh,
    hasMore,
    page,
  } = useMemberGroupsWithInfiniteLoading();

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [refreshing, setRefreshing] = useState(false);

  // Memoize chunked data
  const chunkedData = useMemo(() => {
    if (groupsLoading && groups.length === 0) {
      return chunkData(
        Array.from({ length: 9 }, (_, index) => ({
          id: `skeleton-${index}`,
          isSkeleton: true
        })),
        3
      );
    }
    return chunkData(groups, 3);
  }, [groups, groupsLoading]);

  // Memoize group styling data
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
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  useEffect(() => {
    if (groupsError) {
      showToast('خطا در دریافت اطلاعات گروه‌ها. لطفاً دوباره تلاش کنید.', 'error');
    }
  }, [groupsError]);

  const handleGroupPress = (groupData: MemberGroup) => {
    console.log('Navigating to AllMembers with group filter:', groupData.MemberGroupId);
    try {
      navigation.navigate("AllMembers" as never, {
        filterGroupId: groupData.MemberGroupId,
        filterGroupName: groupData.GroupName
      } as never);
    } catch (error) {
      console.error('Navigation error (MemberGroup):', error);
      showToast('خطا در باز کردن گروه', 'error');
    }
  };

  const handleLoadMore = useCallback(() => {
    if (!groupsLoading && hasMore) {
      loadMore();
    }
  }, [groupsLoading, hasMore, loadMore]);

  const createSkeletonData = () => {
    return Array.from({ length: 9 }, (_, index) => ({
      id: `skeleton-${index}`,
      isSkeleton: true
    }));
  };

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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refresh();
    setTimeout(() => setRefreshing(false), 500);
  }, [refresh]);

  const renderEmptyComponent = useCallback(() => {
    if (groupsLoading && groups.length === 0) return null;

    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="group" size={80} color="#9e9e9e" />
        <AppText style={styles.emptyTitle}>هیچ گروهی موجود نیست</AppText>
        <AppText style={styles.emptySubtitle}>
          در حال حاضر گروهی برای نمایش وجود ندارد
        </AppText>
      </View>
    );
  }, [groupsLoading, groups.length]);

  const renderErrorComponent = useCallback(() => (
    <View style={styles.errorContainer}>
      <MaterialIcons name="error" size={80} color="#9e9e9e" />
      <AppText style={styles.errorTitle}>خطا در دریافت اطلاعات</AppText>
      <AppText style={styles.errorSubtitle}>
        لطفاً اتصال اینترنت خود را بررسی کنید
      </AppText>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => fetchMemberGroups(1, ITEMS_PER_PAGE)}
      >
        <MaterialIcons name="refresh" size={20} color={colors.white} />
        <AppText style={styles.retryButtonText}>تلاش مجدد</AppText>
      </TouchableOpacity>
    </View>
  ), [fetchMemberGroups]);

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

        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <View style={styles.titleWrapper}>
              <AppText style={styles.headerTitle}>گروه‌های اصلی</AppText>
            </View>
          </View>
        </View>

        <View style={styles.sectionTitleContainer}>
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
              color="#FF69B4"
              style={styles.sparkle2}
            />
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
              keyExtractor={(item, index) => `row-${index}`}
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
              onEndReachedThreshold={0.3}
              numColumns={1}
              removeClippedSubviews
              maxToRenderPerBatch={10}
              updateCellsBatchingPeriod={50}
            />
          )}
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
    paddingTop: (StatusBar.currentHeight || 0) + 35,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: (StatusBar.currentHeight || 0) + 45,
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
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "relative",
  },
  listContainer: {
    paddingBottom: 20,
    paddingTop: 10,
    paddingHorizontal: 12,
  },
  rowContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  groupItemContainer: {
    width: (width - 64) / 3,
    marginHorizontal: 6,
  },
  groupCardWrapper: {
    marginVertical: 8,
  },
  groupCard: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderWidth: 3,
    borderColor: '#fff',
    borderRadius: 24,
  },
  groupContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    marginTop:0,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  groupTitle: {
    fontSize: 11,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#000000',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 4,
    flex: 1,
    justifyContent: 'center',
  },
  memberCountBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 4,
  },
  memberCountText: {
    fontSize: 9,
    fontFamily: "Yekan_Bakh_Bold",
    color: 'rgba(0, 0, 0, 0.8)',
    marginRight: 3,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.white,
    marginRight: 8,
  },
});

export default AllMemberGroupsScreen;