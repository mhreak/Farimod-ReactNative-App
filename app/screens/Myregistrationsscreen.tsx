import React, { useEffect, useRef, useState, useCallback } from "react";
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
  ActivityIndicator,
} from "react-native";
import colors from "../config/colors";
import MainBackground from "../components/MainBackground";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import CourseRegistrationCard from "../components/CourseRegistrationCard";
import Toast from "../components/Toast";
import appConfig from "../config/config";
import { useAuth } from '../contexts/AuthContext';
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

const useRegistrationsWithPagination = (memberId) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRegistrations = async (newPage = 1, pageSize = ITEMS_PER_PAGE) => {
    if (!memberId) {
      setError('شناسه کاربر موجود نیست');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${appConfig.mobileApi}CourseRegistration/GetRegisteredCoursesOfMember?memberId=${memberId}&currentPage=${newPage}&pageSize=${pageSize}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (newPage === 1) {
        setData(result.Data || []);
      } else {
        setData(prevData => [...prevData, ...(result.Data || [])]);
      }

      setTotal(result.Total || 0);
      setPage(newPage);

      setHasMore((result.Data || []).length === pageSize && (result.Data || []).length > 0);
    } catch (err) {
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
      fetchRegistrations(page + 1);
    }
  };

  return {
    data,
    total,
    loading,
    error,
    fetchRegistrations,
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

const RegistrationCardSkeleton = () => {
  return (
    <View style={styles.registrationSkeletonContainer}>
      {/* Image Section */}
      <View style={styles.skeletonImageSection}>
        <SkeletonLoader width="100%" height="100%" borderRadius={0} />
      </View>

      {/* Course Details Section */}
      <View style={styles.skeletonDetailsSection}>
        {/* Header with icon and content */}
        <View style={styles.skeletonHeader}>
          <SkeletonLoader width={28} height={28} borderRadius={8} style={{ marginLeft: 6 }} />
          <View style={{ flex: 1 }}>
            {/* Title */}
            <SkeletonLoader width="90%" height={12} style={{ marginBottom: 4, alignSelf: 'flex-end' }} />
            <SkeletonLoader width="60%" height={12} style={{ marginBottom: 4, alignSelf: 'flex-end' }} />
            {/* Date */}
            <SkeletonLoader width="40%" height={9} style={{ alignSelf: 'flex-end' }} />
          </View>
        </View>

        {/* Instructor Section */}
        <View style={styles.skeletonInfoSection}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 3 }}>
            <SkeletonLoader width={13} height={13} borderRadius={7} style={{ marginLeft: 4 }} />
            <SkeletonLoader width={50} height={10} />
          </View>
          <SkeletonLoader width="70%" height={10} style={{ alignSelf: 'flex-end' }} />
        </View>

        {/* Payment Section */}
        <View style={styles.skeletonPaymentSection}>
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.skeletonPaymentRow}>
              <SkeletonLoader width={13} height={13} borderRadius={7} style={{ marginLeft: 4 }} />
              <SkeletonLoader width={60} height={10} style={{ marginLeft: 4 }} />
              <SkeletonLoader width="35%" height={10} style={{ marginRight: 'auto' }} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const CourseRegistrationScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const {
    data: registrations,
    total,
    loading: registrationsLoading,
    error: registrationsError,
    fetchRegistrations,
    loadMore,
    hasMore
  } = useRegistrationsWithPagination(user?.MemberId);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (user?.MemberId) {
        fetchRegistrations(1, ITEMS_PER_PAGE);
      }
    }, [user?.MemberId])
  );

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
    if (registrationsError) {
      showToast('خطا در دریافت اطلاعات ثبت‌نام‌ها. لطفاً دوباره تلاش کنید.', 'error');
    }
  }, [registrationsError]);

  const handleRegistrationPress = (registrationData) => {
    // می‌توانید به صفحه جزئیات ثبت‌نام یا دوره هدایت کنید
    navigation.navigate("CourseDetails", {
      courseId: registrationData.CourseId
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRegistrations(1, ITEMS_PER_PAGE);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!registrationsLoading && hasMore) {
      loadMore();
    }
  };

  const createSkeletonData = () => {
    return Array.from({ length: 6 }, (_, index) => ({ id: `skeleton-${index}` }));
  };

  const renderRegistrationItem = ({ item, index }) => {
    if (item.id && item.id.startsWith('skeleton')) {
      return (
        <View style={styles.registrationItemContainer}>
          <RegistrationCardSkeleton />
        </View>
      );
    }

    return (
      <View style={styles.registrationItemContainer}>
        <CourseRegistrationCard
          registration={item}
          onPress={() => handleRegistrationPress(item)}
        />
      </View>
    );
  };

  const renderFooter = () => {
    if (!registrationsLoading) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={modernColors.primary} />
        <AppText style={styles.loadingMoreText}>در حال بارگذاری...</AppText>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (registrationsLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="receipt-long" size={80} color="#9e9e9e" />
        <AppText style={styles.emptyTitle}>ثبت‌نامی یافت نشد</AppText>
        <AppText style={styles.emptySubtitle}>
          شما هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید
        </AppText>
        <TouchableOpacity
          style={styles.browseCourseButton}
          onPress={() => navigation.navigate("CoursesList")}
        >
          <MaterialIcons name="search" size={20} color={colors.white} />
          <AppText style={styles.browseCourseButtonText}>مشاهده دوره‌ها</AppText>
        </TouchableOpacity>
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
        onPress={() => fetchRegistrations(1, ITEMS_PER_PAGE)}
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
              color="white"
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
            <AppText style={styles.headerTitle}>دوره های ثبت نام شده</AppText>

          </View>
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
          {registrationsError ? (
            renderErrorComponent()
          ) : (
            <FlatList
              data={registrationsLoading && registrations.length === 0 ? createSkeletonData() : registrations}
              renderItem={renderRegistrationItem}
              keyExtractor={(item, index) =>
                item.CourseRegistrationId ? item.CourseRegistrationId.toString() : `skeleton-${index}`
              }
              numColumns={2}
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
              columnWrapperStyle={styles.row}
            />
          )}
        </Animated.View>

        {/* Decorative Elements */}
        <View style={styles.decorativeElements}>
          <View style={styles.floatingElements}>
            <Animated.View style={[styles.star1, { transform: [{ rotate: spin }] }]}>
              <MaterialIcons
                name="receipt"
                size={22}
                color="rgba(139, 92, 246, 0.3)"
              />
            </Animated.View>
            <Animated.View style={[styles.star2, { transform: [{ rotate: spin }] }]}>
              <MaterialIcons
                name="check-circle"
                size={18}
                color="rgba(99, 102, 241, 0.3)"
              />
            </Animated.View>
            <Animated.View style={[styles.star3, { transform: [{ rotate: spin }] }]}>
              <MaterialIcons
                name="credit-card"
                size={20}
                color="rgba(6, 182, 212, 0.3)"
              />
            </Animated.View>
            <Animated.View style={[styles.star4, { transform: [{ rotate: spin }] }]}>
              <MaterialIcons
                name="star"
                size={24}
                color="rgba(139, 92, 246, 0.2)"
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
    marginBottom: 20,
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
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -12,
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    marginHorizontal: 8,
    textAlign: "center",
  },
  totalCount: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#666",
    textAlign: "center",
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',

  },
  listContainer: {
    paddingBottom: 20,
    paddingTop: 10,
    paddingHorizontal: 15,
    
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    
  },
  registrationItemContainer: {
    width: (width - 70) / 2,
    marginBottom: 15,
    marginHorizontal: 5,
    
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
  // Skeleton Styles
  registrationSkeletonContainer: {
    width: "100%",
    minHeight: 340,
    flexDirection: "column",
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.white,
    shadowColor: "#797979",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  skeletonImageSection: {
    height: 160,
    width: "100%",
  },
  skeletonDetailsSection: {
    flex: 1,
    padding: 10,
  },
  skeletonHeader: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  skeletonInfoSection: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 6,
    marginBottom: 6,
  },
  skeletonPaymentSection: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 6,
  },
  skeletonPaymentRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 4,
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
  browseCourseButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 24,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  browseCourseButtonText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.white,
    marginRight: 8,
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
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 24,
    shadowColor: '#6366f1',
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
    left: 60,
  },
  star2: {
    position: "absolute",
    top: 500,
    right: 70,
  },
  star3: {
    position: "absolute",
    top: 700,
    left: 50,
  },
  star4: {
    position: "absolute",
    top: 900,
    right: 90,
  },
});

export default CourseRegistrationScreen;