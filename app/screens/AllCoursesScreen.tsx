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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../config/colors";
import MainBackground from "../components/MainBackground";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import CourseCard from "../components/CourseCard";
import Toast from "../components/Toast";
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
  schoolIcon: "#2ecc71",
};

const ITEMS_PER_PAGE = 20;

const useCoursesWithPagination = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCourses = async (page = 1, pageSize = ITEMS_PER_PAGE) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${appConfig.mobileApi}Course/GetAll?filterRegisterActive=true&currentPage=${page}&pageSize=${pageSize}`
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

  return {
    data,
    total,
    loading,
    error,
    fetchCourses,
  };
};

// Skeleton Component
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

// Course Skeleton
const CourseCardSkeleton = () => {
  return (
    <View style={styles.courseSkeletonContainer}>
      {/* Image Section */}
      <View style={styles.courseImageSkeleton}>
        <SkeletonLoader width="100%" height="100%" borderRadius={0} />
      </View>

      {/* Course Details Section */}
      <View style={styles.courseDetailsSkeleton}>
        {/* Header with icon and content */}
        <View style={styles.courseHeaderSkeleton}>
          <SkeletonLoader width={44} height={44} borderRadius={12} style={{ marginLeft: 12 }} />
          <View style={{ flex: 1 }}>
            {/* Title */}
            <SkeletonLoader width="90%" height={16} style={{ marginBottom: 8, alignSelf: 'flex-end' }} />
            <SkeletonLoader width="70%" height={16} style={{ marginBottom: 8, alignSelf: 'flex-end' }} />
            {/* Price */}
            <SkeletonLoader width="40%" height={14} style={{ marginBottom: 6, alignSelf: 'flex-end' }} />
            {/* Category */}
            <SkeletonLoader width="50%" height={12} style={{ alignSelf: 'flex-end' }} />
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.locationSectionSkeleton}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 6 }}>
            <SkeletonLoader width={20} height={20} borderRadius={10} style={{ marginLeft: 8 }} />
            <SkeletonLoader width={80} height={13} />
          </View>
          <SkeletonLoader width="85%" height={13} style={{ alignSelf: 'flex-end', marginBottom: 4 }} />
          <SkeletonLoader width="60%" height={13} style={{ alignSelf: 'flex-end' }} />
        </View>

        {/* Additional Info */}
        <View style={styles.additionalInfoSkeleton}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center' }}>
            <SkeletonLoader width={16} height={16} borderRadius={8} style={{ marginLeft: 4 }} />
            <SkeletonLoader width={40} height={11} />
          </View>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center' }}>
            <SkeletonLoader width={16} height={16} borderRadius={8} style={{ marginLeft: 4 }} />
            <SkeletonLoader width={50} height={11} />
          </View>
        </View>
      </View>
    </View>
  );
};

// Beautiful Pagination Component
const PaginationComponent = ({
  currentPage,
  totalPages,
  onPageChange,
  style = {}
}) => {
  const pageButtonAnim = useRef(new Animated.Value(1)).current;
  const [animatingPage, setAnimatingPage] = useState(null);

  const animatePageChange = (page) => {
    if (page === currentPage) return;

    setAnimatingPage(page);
    Animated.sequence([
      Animated.timing(pageButtonAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pageButtonAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
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
        style={[
          styles.pageButton,
          isActive && styles.activePageButton,
        ]}
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
          <AppText style={[
            styles.pageButtonText,
            isActive && styles.activePageButtonText,
          ]}>
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

    // Previous button
    if (currentPage > 1) {
      items.push(
        <TouchableOpacity
          key="prev"
          style={styles.navButton}
          onPress={() => animatePageChange(currentPage - 1)}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[modernColors.primary, modernColors.primaryDark]}
            style={styles.navButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialIcons name="keyboard-arrow-right" size={20} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    // First page + ellipsis
    if (startPage > 1) {
      items.push(renderPageButton(1, currentPage === 1));
      if (startPage > 2) {
        items.push(
          <View key="ellipsis-start" style={styles.ellipsis}>
            <AppText style={styles.ellipsisText}>...</AppText>
          </View>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(renderPageButton(i, i === currentPage));
    }

    // Last page + ellipsis
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <View key="ellipsis-end" style={styles.ellipsis}>
            <AppText style={styles.ellipsisText}>...</AppText>
          </View>
        );
      }
      items.push(renderPageButton(totalPages, currentPage === totalPages));
    }

    // Next button
    if (currentPage < totalPages) {
      items.push(
        <TouchableOpacity
          key="next"
          style={styles.navButton}
          onPress={() => animatePageChange(currentPage + 1)}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[modernColors.primary, modernColors.primaryDark]}
            style={styles.navButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
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

const AllCoursesScreen = () => {
  const navigation = useNavigation();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Use custom hook for API with pagination
  const { data: courses, total, loading: coursesLoading, error: coursesError, fetchCourses } = useCoursesWithPagination();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // Toast states
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  // Refreshing state
  const [refreshing, setRefreshing] = useState(false);

  // Initial load and page changes
  useEffect(() => {
    fetchCourses(currentPage, ITEMS_PER_PAGE);
  }, [currentPage]);

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

  // Toast helper function
  const showToast = (message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // Show error toasts when API calls fail
  useEffect(() => {
    if (coursesError) {
      showToast('خطا در دریافت اطلاعات دوره‌ها. لطفاً دوباره تلاش کنید.', 'error');
    }
  }, [coursesError]);

  const handleCoursePress = (courseData) => {
    navigation.navigate("CourseDetails", {

      courseId: courseData.CourseId
    });
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Add smooth scroll to top effect
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
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCourses(currentPage, ITEMS_PER_PAGE);
    setRefreshing(false);
  };

  // Create skeleton data for loading state
  const createSkeletonData = () => {
    return Array.from({ length: ITEMS_PER_PAGE }, (_, index) => ({ id: `skeleton-${index}` }));
  };

  const renderCourseItem = ({ item, index }) => {
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
          onPress={() => handleCoursePress(item)}
          activeOpacity={0.8}
        >
          <CourseCard course={item} onPress={handleCoursePress} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (coursesLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="school" size={80} color="#9e9e9e" />
        <AppText style={styles.emptyTitle}>هیچ دوره‌ای موجود نیست</AppText>
        <AppText style={styles.emptySubtitle}>
          در حال حاضر دوره‌ای برای نمایش وجود ندارد
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
        onPress={() => fetchCourses(currentPage, ITEMS_PER_PAGE)}
      >
        <MaterialIcons name="refresh" size={20} color={colors.white} />
        <AppText style={styles.retryButtonText}>تلاش مجدد</AppText>
      </TouchableOpacity>
    </View>
  );

  // Show total courses info
  const renderCoursesInfo = () => {
    if (coursesLoading || coursesError || total === 0) return null;

    return (
      <View>

      </View>
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        <MainBackground />

        {/* Toast Component */}
        <Toast
          visible={toastVisible}
          message={toastMessage}
          type={toastType}
          onHide={() => setToastVisible(false)}
        />

        {/* Back Button */}
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

        {/* Header */}
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
            <AppText style={styles.headerTitle}>دوره‌های آموزشی</AppText>
          </View>
        </Animated.View>

        {/* Courses Info */}
        <Animated.View
          style={[
            styles.sectionTitleContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {renderCoursesInfo()}
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
              color="#FF6B6B"
              style={styles.sparkle2}
            />
          </View>
        </Animated.View>

        {/* Decorative Elements */}
        <Animated.View
          style={[styles.floatingDecoration1, { transform: [{ rotate: spin }] }]}
        >
        </Animated.View>
        <Animated.View
          style={[styles.floatingDecoration2, { transform: [{ rotate: spin }] }]}
        >
        </Animated.View>

        {/* Content */}
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
                data={coursesLoading ? createSkeletonData() : courses}
                renderItem={renderCourseItem}
                keyExtractor={(item, index) =>
                  item.CourseId ? item.CourseId.toString() : `skeleton-${index}`
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
                ListEmptyComponent={renderEmptyComponent}
              />

              {/* Pagination */}
              {!coursesLoading && !coursesError && totalPages > 1 && (
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

        {/* Decorative Elements */}
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
  coursesInfoContainer: {
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
  coursesInfoText: {
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
  listContainer: {
    paddingBottom: 20,
    paddingTop: 10,
    alignItems: 'center',
    width: '100%',
  },
  courseItemContainer: {
    width: width - 40,
    alignSelf: 'center',
    marginBottom: 20,
  },
  pagination: {
    marginBottom: 40,
  },
  // Pagination Styles
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
    shadowOffset: {
      width: 0,
      height: 1,
    },
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
  activePageButton: {
    // Active page button styles handled by gradient
  },
  activePageButtonContent: {
    backgroundColor: modernColors.primary,
    borderColor: modernColors.primary,
    shadowColor: modernColors.primary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
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
    shadowOffset: {
      width: 0,
      height: 3,
    },
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
  pageInfoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  pageInfo: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#666',
    textAlign: 'center',
  },
  // Skeleton styles
  courseSkeletonContainer: {
    width: "100%",
    minHeight: 380,
    maxHeight: 450,
    flexDirection: "column",
    borderRadius: 20,
    overflow: 'hidden',
  },
  courseImageSkeleton: {
    position: 'relative',
    height: 200,
    width: "100%",
  },
  courseDetailsSkeleton: {
    flex: 1,
    padding: 16,
  },
  courseHeaderSkeleton: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  locationSectionSkeleton: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
    marginBottom: 8,
  },
  additionalInfoSkeleton: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  // Empty state styles
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
  // Error state styles
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
  // Decorative elements
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

export default AllCoursesScreen;