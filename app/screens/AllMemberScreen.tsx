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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import Toast from "../components/Toast";
import { safeString } from "../utils/converters";
import appConfig from "../config/config";
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
  memberIcon: "#FF69B4",
};

const ITEMS_PER_PAGE = 15;

const useMembersWithInfiniteLoading = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [memberGroups, setMemberGroups] = useState([]);
  useEffect(() => {
    fetchMemberGroups();
  }, []);
  const fetchMemberGroups = async () => {
    try {
      const response = await fetch(
        `${appConfig.mobileApi}MemberGroup/GetAll?currentPage=1&pageSize=100`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.Data) {
        setMemberGroups(result.Data);
      }
    } catch (error) {
      console.error("Error fetching member groups:", error);
    }
  };
  const fetchMembers = async (newPage = 1, pageSize = ITEMS_PER_PAGE, isLoadMore = false, filterParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      let filterQuery = "";

      // اضافه کردن فیلتر نام
      if (filterParams.filterName) {
        console.log('Adding filterName to query:', filterParams.filterName);
        filterQuery += `&filterName=${encodeURIComponent(filterParams.filterName)}`;
      }

      // 👇 این خط جدید است - اضافه کردن فیلتر گروه
      if (filterParams.filterMemberGroupId && filterParams.filterMemberGroupId !== 'all') {
        console.log('Adding filterMemberGroupId to query:', filterParams.filterMemberGroupId);
        filterQuery += `&filterMemberGroupId=${filterParams.filterMemberGroupId}`;
      }

      const finalUrl = `${appConfig.mobileApi}Member/GetAll?currentPage=${newPage}&pageSize=${pageSize}${filterQuery}`;
      console.log('Final API URL:', finalUrl);

      const response = await fetch(finalUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (isLoadMore) {
        setData(prevData => [...prevData, ...(result.Data || [])]);
      } else {
        setData(result.Data || []);
      }

      setTotal(result.Total || 0);
      setPage(newPage);
      setFilters(filterParams);
      setHasMore((result.Data || []).length === pageSize && (result.Data || []).length > 0);

    } catch (err) {
      setError(err.message);
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
      fetchMembers(page + 1, ITEMS_PER_PAGE, true, filters);
    }
  };

  const refresh = () => {
    setPage(1);
    setHasMore(true);
    fetchMembers(1, ITEMS_PER_PAGE, false, filters);
  };

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

const MemberCardSkeleton = () => {
  return (
    <View style={styles.memberSkeletonContainer}>
      <View style={styles.memberContentSkeleton}>
        <SkeletonLoader width={80} height={80} borderRadius={40} style={{ marginBottom: 12 }} />
        <SkeletonLoader width="70%" height={16} style={{ marginBottom: 8, alignSelf: 'center' }} />
        <SkeletonLoader width="80%" height={14} style={{ alignSelf: 'center' }} />
      </View>
    </View>
  );
};

const Avatar = ({ name, size = 80, onPress, member }) => {
  const scaleValue = new Animated.Value(1);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const gradientColors = [
    ['#fa709a', '#fee140'],
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c'],
    ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'],
    ['#ff9a56', '#ffad56'],
    ['#a8edea', '#fed6e3'],
    ['#fbc2eb', '#a6c1ee'],
  ];

  const getGradientForName = (name) => {
    const index = name ? name.length % gradientColors.length : 0;
    return gradientColors[index];
  };

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  // ✅ Reset states when URL changes
  useEffect(() => {
    if (member?.AvatarImageURL) {
      setImageLoading(true);
      setImageError(false);
    }
  }, [member?.AvatarImageURL]);

  const selectedGradient = getGradientForName(name);
  const hasProfileImage = member?.AvatarImageURL && member.AvatarImageURL.trim() !== '';
  const shouldShowImage = hasProfileImage && !imageError && !imageLoading;

  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            transform: [{ scale: scaleValue }],
          },
        ]}
      >
        {/* ✅ همیشه گرادیانت را نمایش بده */}
        <LinearGradient
          colors={selectedGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.avatarGradient,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: 3,
              borderColor: '#fff',
            },
          ]}
        >
          <MaterialCommunityIcons
            name={member?.Gender ? "face-man" : "face-woman"}
            size={size * 0.6}
            color="white"
          />
        </LinearGradient>

        {/* ✅ اگر عکس باید نمایش داده شود، روی گرادیانت قرار بده */}
        {hasProfileImage && (
          <Image
            source={{ uri: member.AvatarImageURL }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: 3,
              borderColor: '#fff',
              opacity: shouldShowImage ? 1 : 0,
              backgroundColor: 'transparent',
            }}
            resizeMode="cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}

        {member?.ShowBlueTick && (
          <View style={[
            styles.blueTickContainer,
            {
              width: size * 0.28,
              height: size * 0.28,
              borderRadius: (size * 0.28) / 2,
              bottom: size * 0.05,
              right: size * 0.05,
            }
          ]}>
            <MaterialIcons
              name="verified"
              size={size * 0.22}
              color="#1DA1F2"
            />
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const MemberCard = ({ member, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.memberCard}
      onPress={() => onPress(member)}
      activeOpacity={0.8}
    >
      <View style={styles.memberCardOverlay} />

      <View style={styles.memberContent}>
        <Avatar
          name={member.Name}
          size={80}
          member={member}
          onPress={() => onPress(member)}
        />

        <View style={styles.memberInfo}>
          <AppText style={styles.memberName} numberOfLines={1}>
            {safeString(member.Name, 'نام کاربر')}
          </AppText>

          <View style={styles.memberGroupContainer}>
            {member.MemberGroupsStr ? (
              <View style={styles.memberDetailRow}>
                <AppText style={styles.memberDetail} numberOfLines={2} ellipsizeMode="tail">
                  {member.MemberGroupsStr}
                </AppText>
              </View>
            ) : (
              <View style={styles.memberDetailRow}>
                <MaterialIcons name="group" size={16} color="#ccc" />
                <AppText style={styles.memberDetailPlaceholder}>
                  گروه تعریف نشده
                </AppText>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const chunkData = (data, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }
  return chunks;
};

const AllMembersScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const filterGroupId = route.params?.filterGroupId;
  const filterGroupName = route.params?.filterGroupName;


  const {
    data: members,
    total,
    loading: membersLoading,
    error: membersError,
    fetchMembers,
    loadMore,
    refresh,
    hasMore,
    page,
    filters,
    memberGroups,
  } = useMembersWithInfiniteLoading();

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (filterGroupId) {
      const initialFilter = {
        filterMemberGroupId: filterGroupId.toString()
      };
      setAppliedFilters(initialFilter);
      setHasActiveFilters(true);
      fetchMembers(1, ITEMS_PER_PAGE, false, initialFilter);
    } else {
      fetchMembers(1, ITEMS_PER_PAGE);
    }
  }, [filterGroupId]);
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
    if (membersError) {
      showToast('خطا در دریافت اطلاعات اعضا. لطفاً دوباره تلاش کنید.', 'error');
    }
  }, [membersError]);

  const handleMemberPress = (memberData) => {
    navigation.navigate("UserProfile", {
      userData: memberData
    });
  };



  const handleLoadMore = () => {
    if (!membersLoading && hasMore) {
      loadMore();
    }
  };

  const createSkeletonData = () => {
    return Array.from({ length: ITEMS_PER_PAGE }, (_, index) => ({
      id: `skeleton-${index}`,
      isSkeleton: true
    }));
  };

  const renderRowItem = ({ item: rowData, index }) => {
    return (
      <View style={styles.rowContainer}>
        {rowData.map((item, itemIndex) => {
          const globalIndex = index * 2 + itemIndex;

          if (item.id && item.id.startsWith('skeleton')) {
            return (
              <View key={`skeleton-${globalIndex}`} style={styles.memberItemContainer}>
                <MemberCardSkeleton />
              </View>
            );
          }

          return (
            <View key={item.MemberId || `item-${globalIndex}`} style={styles.memberItemContainer}>
              <MemberCard member={item} onPress={handleMemberPress} />
            </View>
          );
        })}

        {rowData.length === 1 && (
          <View style={styles.memberItemContainer} />
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (!membersLoading || members.length === 0) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={modernColors.primary} />
        <AppText style={styles.loadingMoreText}>در حال بارگذاری...</AppText>
      </View>
    );
  };
  const handleApplyFilters = (newFilters) => {
    console.log('Received filters in AllMembersScreen:', newFilters);

    setAppliedFilters(newFilters);

    const hasFilters = Object.keys(newFilters).some(key => {
      const value = newFilters[key];
      return value !== false && value !== '' && value !== 'all' && value !== undefined && value !== null;
    });

    console.log('Has active filters:', hasFilters);
    setHasActiveFilters(hasFilters);

    if (hasFilters) {
      showToast('فیلتر اعمال شد', 'success');
    }

    console.log('Calling fetchMembers with filters:', newFilters);
    fetchMembers(1, ITEMS_PER_PAGE, false, newFilters);
  };

  const clearAllFilters = () => {
    setAppliedFilters({});
    setHasActiveFilters(false);
    fetchMembers(1, ITEMS_PER_PAGE, false, {});
    showToast('فیلتر پاک شد', 'info');
  };

  const prepareFilterOptions = () => {
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
      sections: [
        {
          key: "memberGroupId",
          options: memberGroupOptions,
        },
      ],
    };
  };
  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const renderEmptyComponent = () => {
    if (membersLoading && members.length === 0) return null;

    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="people" size={80} color="#9e9e9e" />
        <AppText style={styles.emptyTitle}>هیچ عضوی موجود نیست</AppText>
        <AppText style={styles.emptySubtitle}>
          در حال حاضر عضوی برای نمایش وجود ندارد
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
        onPress={() => fetchMembers(1, ITEMS_PER_PAGE)}
      >
        <MaterialIcons name="refresh" size={20} color={colors.white} />
        <AppText style={styles.retryButtonText}>تلاش مجدد</AppText>
      </TouchableOpacity>
    </View>
  );

  const renderMembersInfo = () => {
    if (membersLoading && members.length === 0 || membersError || total === 0) return null;

    if (filterGroupName) {
      return (
        <View style={styles.groupFilterChip}>
          <MaterialIcons name="group" size={16} color={modernColors.primary} />
          <AppText style={styles.groupFilterText}>{filterGroupName}</AppText>
        </View>
      );
    }

    return <View></View>;
  };

  // ✅ تغییر در headerTitle برای نمایش نام گروه
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
              <AppText style={styles.headerTitle}>
                اعضای فریمد
              </AppText>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.sectionTitleContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {renderMembersInfo()}
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
        </Animated.View>

        <Animated.View
          style={[styles.floatingDecoration1, { transform: [{ rotate: spin }] }]}
        >
        </Animated.View>
        <Animated.View
          style={[styles.floatingDecoration2, { transform: [{ rotate: spin }] }]}
        >
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
          {membersError ? (
            renderErrorComponent()
          ) : (
            <FlatList
              key="members-list"
              data={chunkData(
                membersLoading && members.length === 0
                  ? createSkeletonData()
                  : members,
                2
              )}
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
            />
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
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApplyFilters={handleApplyFilters}
        filterType="members"
        initialFilters={appliedFilters}
        customFilterOptions={prepareFilterOptions()}
      />
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
  membersInfoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  membersInfoText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#666',
    textAlign: 'center',
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
  groupFilterChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.3)',
  },
  groupFilterText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.primary,
    marginRight: 6,
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
    right: 20,
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
  listContainer: {
    paddingBottom: 20,
    paddingTop: 10,
    paddingHorizontal: 12,
  },
  rowContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  memberItemContainer: {
    width: (width - 64) / 2,
    marginHorizontal: 8,
  },
  memberCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 16,
    minHeight: 180,
    maxHeight: 180,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 1)',
    backdropFilter: 'blur(10px)',
    overflow: 'hidden',
  },
  memberContent: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  avatarGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  blueTickContainer: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  memberInfo: {
    alignItems: 'center',
    marginTop: 12,
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
  },
  memberName: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#253a4e',
    textAlign: 'center',
    marginBottom: 8,
    minHeight: 20,
  },
  memberGroupContainer: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    minHeight: 44,
    maxHeight: 44,
  },
  memberDetailRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 25,
    width: '100%',
    justifyContent: 'center',
    minHeight: 40,
    borderRadius: 50,
    paddingVertical: 2
  },
  memberDetail: {
    fontSize: 11,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#4c5896',
    marginRight: 6,
    textAlign: 'center',
    maxWidth: '80%',
    fontWeight: '500',
    lineHeight: 18,
  },
  memberDetailPlaceholder: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#ccc',
    marginRight: 6,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  memberSkeletonContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 16,
    minHeight: 180,
    maxHeight: 180,
  },
  memberContentSkeleton: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
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

export default AllMembersScreen;