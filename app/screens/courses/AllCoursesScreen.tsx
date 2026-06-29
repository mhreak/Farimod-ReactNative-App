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
import CourseCard from "../../components/CourseCard";
import Toast from "../../components/Toast";
import appConfig from "../../config/config";
import { modernColors, styles } from "./styles/styles";
import { Course } from "../../config/type";
import { CourseCardSkeleton } from "./ui/CourseCardSkeleton";
import { PaginationComponent } from "./component/PaginationComponent";

const ITEMS_PER_PAGE = 20;
const ROW_HEIGHT = 220; 

const SKELETON_DATA = Array.from({ length: ITEMS_PER_PAGE }, (_, index) => ({ id: `skeleton-${index}` }));

const useCoursesWithPagination = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(async (page = 1, pageSize = ITEMS_PER_PAGE, filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      let queryParams = `filterActive=true&currentPage=${page}&pageSize=${pageSize}`;
      if (filters.filterMemberId) {
        queryParams += `&filterMemberId=${filters.filterMemberId}`;
      }

      const response = await fetch(`${appConfig.mobileApi}Course/GetAll?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result.Data || []);
      setTotal(result.Total || 0);
    } catch (err: any) {
      setError(err.message);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, total, loading, error, fetchCourses };
};

const CourseListItem = React.memo(({ item, index, onCoursePress }: any) => {
  if (item.id && item.id.startsWith('skeleton')) {
    return (
      <View style={styles.courseItemContainer}>
        <CourseCardSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.courseItemContainer}>
      <TouchableOpacity
        onPress={() => onCoursePress(item)}
        activeOpacity={0.8}
      >
        <CourseCard course={item} onPress={onCoursePress} />
      </TouchableOpacity>
    </View>
  );
});

const AllCoursesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { filteredMemberId, filteredMemberName, filterType } = route.params || {};

  const [activeFilters, setActiveFilters] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const { data: courses, total, loading: coursesLoading, error: coursesError, fetchCourses } = useCoursesWithPagination();

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');
  const [refreshing, setRefreshing] = useState(false);

  const handleCoursePress = useCallback((courseData: Course) => {
    (navigation as any).navigate("CourseDetails", {
      courseId: courseData.CourseId
    });
  }, [navigation]);

  const showToast = useCallback((message: string, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  }, []);

  const handleHideToast = useCallback(() => setToastVisible(false), []);

  useEffect(() => {
    const initialFilters: any = {};
    if (filteredMemberId && filterType === 'member') {
      initialFilters.filterMemberId = filteredMemberId;
      showToast(`نمایش دوره‌های ${filteredMemberName}`, 'info');
    }
    setActiveFilters(initialFilters);
    setIsInitialized(true);
  }, [filteredMemberId, filterType, showToast]);

  useEffect(() => {
    if (isInitialized) {
      fetchCourses(currentPage, ITEMS_PER_PAGE, activeFilters).finally(() => {
        setInitialLoading(false);
      });
    }
  }, [currentPage, activeFilters, isInitialized, fetchCourses]);

  // اجرای انیمیشن‌های ورود و چرخش المنت‌های دکوری
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

  useEffect(() => {
    if (coursesError) {
      showToast('خطا در دریافت اطلاعات دوره‌ها. لطفاً دوباره تلاش کنید.', 'error');
    }
  }, [coursesError, showToast]);

  const getHeaderTitle = () => {
    if (filteredMemberId && filteredMemberName) {
      return `دوره‌های ${filteredMemberName}`;
    }
    return 'دوره‌های آموزشی';
  };

  const handlePageChange = useCallback((page: any) => {
    setCurrentPage(page);
    Animated.timing(slideAnim, {
      toValue: 20,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  }, [slideAnim]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCourses(currentPage, ITEMS_PER_PAGE, activeFilters);
    setRefreshing(false);
  }, [currentPage, activeFilters, fetchCourses]);

  // ۳. بهینه‌سازی: رندرر سطر با رفرنس ثابت
  const renderCourseItem = useCallback(({ item, index }: any) => (
    <CourseListItem item={item} index={index} onCoursePress={handleCoursePress} />
  ), [handleCoursePress]);

  const renderEmptyComponent = useCallback(() => {
    if (coursesLoading || initialLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="school" size={80} color="#9e9e9e" />
        <AppText style={styles.emptyTitle}>هیچ دوره‌ای موجود نیست</AppText>
        <AppText style={styles.emptySubtitle}>در حال حاضر دوره‌ای برای نمایش وجود ندارد</AppText>
      </View>
    );
  }, [coursesLoading, initialLoading]);

  const handleRetry = useCallback(() => {
    fetchCourses(currentPage, ITEMS_PER_PAGE, activeFilters);
  }, [currentPage, activeFilters, fetchCourses]);

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

  const handleBackPress = useCallback(() => {
    (navigation as any).navigate("App", { screen: "MainTabs", params: { screen: "خانه" } });
  }, [navigation]);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: ROW_HEIGHT,
    offset: ROW_HEIGHT * index,
    index,
  }), []);

  const keyExtractor = useCallback((item: any, index: number) => 
    item.CourseId ? item.CourseId.toString() : `skeleton-${index}`, 
  []);

  const listData = useMemo(() => 
    (coursesLoading || initialLoading) ? SKELETON_DATA : courses,
    [courses, coursesLoading, initialLoading]
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
          onHide={handleHideToast}
        />

        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <View style={styles.backButtonContainer}>
            <MaterialIcons name="arrow-forward" size={24} color="#6366f1" />
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
            <AppText style={styles.headerTitle}>{getHeaderTitle()}</AppText>
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
          <View style={styles.sparkleContainer}>
            <MaterialIcons name="star-half" size={16} color="#FFD700" style={styles.sparkle1} />
            <MaterialIcons name="star-half" size={12} color="#FF6B6B" style={styles.sparkle2} />
          </View>
        </Animated.View>

        <Animated.View style={[styles.floatingDecoration1, { transform: [{ rotate: spin }] }]} />
        <Animated.View style={[styles.floatingDecoration2, { transform: [{ rotate: spin }] }]} />

        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {coursesError ? (
            renderErrorComponent()
          ) : (
            <>
              <FlatList
                data={listData}
                renderItem={renderCourseItem}
                keyExtractor={keyExtractor}
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
                columnWrapperStyle={styles.row}
                getItemLayout={getItemLayout}
                removeClippedSubviews={true}
                maxToRenderPerBatch={8}
                windowSize={5}
              />

              {!coursesLoading && !coursesError && !initialLoading && totalPages > 1 && (
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

export default AllCoursesScreen;