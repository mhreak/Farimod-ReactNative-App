import React, { useEffect, useRef, useState } from "react";
import AppText from "../components/Text";
import {
  ScrollView,
  StyleSheet,
  View,
  Image,
  Dimensions,
  Animated,
  StatusBar,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../config/colors";
import MainBackground from "../components/MainBackground";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import Toast from "../components/Toast";
import { formatPersianDate, formatPrice, toPersianDigits } from "../utils/converters";
import MultiOptionRatingComponent, { StarDisplay } from "../components/RatingComponent";
import appConfig from "../config/config";
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

// const user?.MemberId = 1;

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
  descIcon: "#f39c12",
  moneyIcon: "#e74c3c",
  placeIcon: "#9b59b6",
  phoneIcon: "#3498db",
  groupIcon: "#e67e22",
  categoryIcon: "#8e44ad",
  fashionGold: "#ffd700",
  likeIcon: "#e91e63",
};

const transformContentReviewToRatingOptions = (contentReviewList) => {
  if (!contentReviewList || contentReviewList.length === 0) {
    return [
      {
        id: 'quality',
        title: 'کیفیت آموزش',
        subtitle: 'کیفیت کلی و دقت در ارائه مطالب',
        contentReviewItemId: 'quality'
      },
      {
        id: 'content',
        title: 'محتوای دوره',
        subtitle: 'جامعیت و کاربردی بودن مطالب',
        contentReviewItemId: 'content'
      },
      {
        id: 'instructor',
        title: 'مربی',
        subtitle: 'تسلط و نحوه تدریس مربی',
        contentReviewItemId: 'instructor'
      },
      {
        id: 'organization',
        title: 'تشکیلات',
        subtitle: 'زمان‌بندی و سازماندهی',
        contentReviewItemId: 'organization'
      }
    ];
  }

  return contentReviewList
    .filter(item => item.Active)
    .sort((a, b) => a.ShowOrder - b.ShowOrder)
    .map(item => ({
      id: `review_${item.ContentReviewItemId}`,
      title: item.Text,
      subtitle: '',
      contentReviewItemId: item.ContentReviewItemId,
      showOrder: item.ShowOrder,
      averageRating: item.CalculatedAverageRating || 0
    }));
};

// Skeleton Component for loading states
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

// Course Details Skeleton
const CourseDetailsSkeleton = () => {
  return (
    <View style={styles.container}>
      <MainBackground />

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton}>
        <View style={styles.backButtonContainer}>
          <MaterialIcons name="arrow-forward" size={24} color="#6366f1" />
        </View>
      </TouchableOpacity>

      {/* Header Skeleton */}
      <View style={styles.headerContainer}>
        <SkeletonLoader width={200} height={26} borderRadius={13} />
      </View>

      {/* Image Header Skeleton */}
      <View style={styles.imageHeaderContainer}>
        <SkeletonLoader width="100%" height="100%" borderRadius={30} />
      </View>

      {/* Section Title Skeleton */}
      <View style={styles.sectionTitleContainer}>
        <SkeletonLoader width={50} height={50} borderRadius={25} style={{ marginLeft: 15 }} />
        <SkeletonLoader width={150} height={24} borderRadius={12} />
      </View>

      {/* Detail Items Skeleton */}
      <View style={styles.cardsContainer}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <View key={item} style={styles.detailItemSkeleton}>
            <View style={styles.skeletonRowContainer}>
              <SkeletonLoader width={44} height={44} borderRadius={22} style={{ marginLeft: 12 }} />
              <SkeletonLoader width="70%" height={17} borderRadius={8} />
            </View>
            <View style={styles.skeletonContentContainer}>
              <SkeletonLoader width="90%" height={16} borderRadius={8} style={{ marginBottom: 8 }} />
              <SkeletonLoader width="60%" height={16} borderRadius={8} />
            </View>
          </View>
        ))}
      </View>

      {/* Buttons Skeleton */}
      <View style={styles.buttonsContainer}>
        <SkeletonLoader width="92%" height={56} borderRadius={30} style={{ marginBottom: 18 }} />
        <SkeletonLoader width="70%" height={48} borderRadius={25} />
      </View>
    </View>
  );
};

// Custom hook for course details API
const useCourseDetails = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCourseDetails = async (courseId) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching course details for ID:', courseId);

      const response = await fetch(
        `${appConfig.mobileApi}Course/Get?courseId=${courseId}`
      );

      console.log('API Response Status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API Response Data:', result);

      // Transform the data to include necessary fields
      const transformedData = {
        ...result.Course,
        IsMemberLiked: result.IsMemberLiked || false,
        ContentReviewItemList: result.ContentReviewItemList || [],
        LikeCount: result.Course?.LikeCount || 0,
        AverageRating: result.Course?.Rating || 0,
        RatingCount: 0,
        UserRating: 0,
        UserDetailedRatings: {},
        DetailedRatingsAverages: {}
      };

      console.log('Transformed Course Data:', transformedData);
      setData(transformedData);
    } catch (err) {
      console.error('Course Details API Error:', err);
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    fetchCourseDetails,
    setData,
  };
};

// Helper function to format course type
const formatCourseType = (courseType) => {
  const types = {
    1: "حضوری",
    2: "مجازی",
    3: "حضوری و مجازی"
  };
  return types[courseType] || "نامشخص";
};

// Helper function to get course schedule
const getCourseSchedule = (courseData) => {
  const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const persianDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];

  const schedule = [];

  days.forEach((day, index) => {
    const hasSession = courseData[`Has${day}Session`];
    const startTime = courseData[`${day}_StartTime`];
    const finishTime = courseData[`${day}_FinishTime`];

    if (hasSession && startTime && finishTime) {
      schedule.push(`${persianDays[index]}: ${toPersianDigits(finishTime)} - ${toPersianDigits(startTime)}`);
    }
  });

  return schedule.length > 0 ? schedule.join('\n') : "برنامه زمانی مشخص نشده";
};



const CourseDetailsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Toast states
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  // Get course ID from navigation params FIRST
  const courseId = route?.params?.courseData?.CourseId || route?.params?.courseId;

  // Use custom hook for API
  const { data: courseData, loading, error, fetchCourseDetails, setData } = useCourseDetails();

  // Like states
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const likeAnim = useRef(new Animated.Value(1)).current;
  const heartAnim = useRef(new Animated.Value(0)).current;

  // Rating states
  const [userDetailedRatings, setUserDetailedRatings] = useState({});
  const [dynamicRatingOptions, setDynamicRatingOptions] = useState([]);

  // Course action states
  const [showActionModal, setShowActionModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const modalSlideAnim = useRef(new Animated.Value(0)).current;
  const modalBackdropAnim = useRef(new Animated.Value(0)).current;
  const deleteModalSlideAnim = useRef(new Animated.Value(0)).current;
  const deleteModalBackdropAnim = useRef(new Animated.Value(0)).current;

  const isOwnCourse = courseData?.MemberId === user?.MemberId; 
  // ALL useEffect HOOKS
  useEffect(() => {
    if (courseId) {
      fetchCourseDetails(courseId);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseData) {
      console.log('Course Data received:', courseData);
      setLikeCount(courseData.LikeCount || 0);
      setIsLiked(courseData.IsMemberLiked || false);

      const ratingOptions = transformContentReviewToRatingOptions(courseData.ContentReviewItemList);
      setDynamicRatingOptions(ratingOptions);
    }
  }, [courseData]);

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
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Show error toast when API call fails
  useEffect(() => {
    if (error) {
      showToast('خطا در دریافت اطلاعات دوره. لطفاً دوباره تلاش کنید.', 'error');
    }
  }, [error]);

  // ALL FUNCTION DEFINITIONS
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

  const handleEditCourse = () => {
    navigation.navigate("AddNewCourse", {
      isEdit: true,
      courseData: courseData
    });
  };

  const handleShowActions = () => {
    console.log('handleShowActions called');
    setShowActionModal(true);

    // Add proper animations like MagDetailesScreen
    Animated.parallel([
      Animated.timing(modalBackdropAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(modalSlideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCloseModal = () => {
    Animated.parallel([
      Animated.timing(modalBackdropAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(modalSlideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowActionModal(false);
    });
  };

  const handleDeleteCourse = () => {
    handleCloseModal();
    setTimeout(() => {
      setShowDeleteConfirmModal(true);
      Animated.parallel([
        Animated.timing(deleteModalBackdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(deleteModalSlideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, 300);
  };

  const handleCloseDeleteModal = () => {
    Animated.parallel([
      Animated.timing(deleteModalBackdropAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(deleteModalSlideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowDeleteConfirmModal(false);
    });
  };

  const confirmDeleteCourse = async () => {
    handleCloseDeleteModal();

    try {
      setIsDeleting(true);

      const response = await fetch(`${appConfig.mobileApi}Course/Delete?courseId=${courseData.CourseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast('دوره با موفقیت حذف شد', 'success');
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.Message || 'خطا در حذف دوره');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      showToast(error.message || 'خطا در حذف دوره', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Like functionality
  const handleLike = async () => {
    if (isLiking || !courseData) return;

    setIsLiking(true);

    const newIsLiked = !isLiked;
    const countChange = newIsLiked ? 1 : -1;
    const newLikeCount = likeCount + countChange;

    setIsLiked(newIsLiked);
    setLikeCount(newLikeCount);

    // Like animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(likeAnim, {
          toValue: 0.6,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(heartAnim, {
          toValue: 0.3,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(likeAnim, {
          toValue: 1.3,
          tension: 200,
          friction: 4,
          useNativeDriver: true,
        }),
        Animated.timing(heartAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(likeAnim, {
        toValue: 1,
        tension: 200,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    if (newIsLiked) {
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(heartAnim, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(heartAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
      }, 200);
    } else {
      Animated.timing(heartAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }

    try {
      const currentCourseId = courseId || courseData.CourseId;
      const response = await fetch(
        `${appConfig.mobileApi}Course/Like?id=${currentCourseId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Like API Response:', result);

    } catch (error) {
      console.error('Like API Error:', error);
      setIsLiked(isLiked);
      setLikeCount(likeCount);
    } finally {
      setIsLiking(false);
    }
  };

  // NOW CONDITIONAL RENDERING CAN HAPPEN AFTER ALL HOOKS
  // Show loading skeleton while data is being fetched
  if (loading) {
    return <CourseDetailsSkeleton />;
  }

  // Show error state
  if (error && !courseData) {
    return (
      <View style={styles.container}>
        <MainBackground />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.backButtonContainer}>
            <MaterialIcons name="arrow-forward" size={24} color="#6366f1" />
          </View>
        </TouchableOpacity>

        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={80} color="#9e9e9e" />
          <AppText style={styles.errorTitle}>خطا در دریافت اطلاعات</AppText>
          <AppText style={styles.errorSubtitle}>
            لطفاً اتصال اینترنت خود را بررسی کنید
          </AppText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchCourseDetails(courseId)}
          >
            <MaterialIcons name="refresh" size={20} color={colors.white} />
            <AppText style={styles.retryButtonText}>تلاش مجدد</AppText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // If no course data, show error
  if (!courseData) {
    return (
      <View style={styles.container}>
        <MainBackground />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.backButtonContainer}>
            <MaterialIcons name="arrow-forward" size={24} color="#6366f1" />
          </View>
        </TouchableOpacity>
        <View style={styles.errorContainer}>
          <MaterialIcons name="info" size={80} color="#9e9e9e" />
          <AppText style={styles.errorTitle}>دوره یافت نشد</AppText>
          <AppText style={styles.errorSubtitle}>
            اطلاعات دوره مورد نظر موجود نیست
          </AppText>
        </View>
      </View>
    );
  }

  const getIconColor = (iconType) => {
    const iconColors = {
      school: modernColors.schoolIcon,
      description: modernColors.descIcon,
      'attach-money': modernColors.moneyIcon,
      place: modernColors.placeIcon,
      phone: modernColors.phoneIcon,
      group: modernColors.groupIcon,
      category: modernColors.categoryIcon,
      schedule: modernColors.info,
      calendar: modernColors.warning,
    };
    return iconColors[iconType] || modernColors.primary;
  };

  // Smart Detail Item Component
  const SmartDetailItem = ({ label, value, icon, maxLength = 30 }) => {
    if (!value || value === "نامشخص" || value === "تاریخ مشخص نشده") {
      return null;
    }

    const isLongText = value.length > maxLength;

    if (isLongText) {
      return (
        <View style={styles.detailItem}>
          <View style={styles.labelContainer}>
            <LinearGradient
              colors={[getIconColor(icon), getIconColor(icon) + 'CC']}
              style={styles.iconWrapper}
            >
              <MaterialIcons
                name={icon}
                size={22}
                color={modernColors.surface}
              />
            </LinearGradient>
            <AppText style={styles.label}>{label}</AppText>
          </View>

          <View style={styles.contentContainer}>
            <AppText style={styles.descriptionValue}>{value}</AppText>
          </View>
          <View style={[styles.featureAccent, { backgroundColor: getIconColor(icon) + "60" }]} />
        </View>
      );
    } else {
      return (
        <View style={styles.detailItem}>
          <View style={styles.rowContainer}>
            <View style={styles.labelContainer}>
              <LinearGradient
                colors={[getIconColor(icon), getIconColor(icon) + 'CC']}
                style={styles.iconWrapper}
              >
                <MaterialIcons
                  name={icon}
                  size={22}
                  color={modernColors.surface}
                />
              </LinearGradient>
              <AppText style={styles.label}>{label}</AppText>
            </View>
            <View style={styles.valueContainer}>
              <AppText style={styles.value}>{value}</AppText>
            </View>
          </View>
          <View style={[styles.featureAccent, { backgroundColor: getIconColor(icon) + "60" }]} />
        </View>
      );
    }
  };

  // Coaches processing - only show if actual coaches exist
  const processCoaches = () => {
    // Check for Course_Member_List first (as per your JSON structure)
    if (courseData.Course_Member_List && courseData.Course_Member_List.length > 0) {
      return courseData.Course_Member_List.map(member => ({
        name: member.MemberName || member.Name || "مربی",
        image: member.ProfileImageUrl || null
      }));
    }

    // Fallback to Course_Member_ViewModel_List if it exists
    if (courseData.Course_Member_ViewModel_List && courseData.Course_Member_ViewModel_List.length > 0) {
      return courseData.Course_Member_ViewModel_List.map(member => ({
        name: member.MemberName || "مربی",
        image: null
      }));
    }

    // Return empty array if no coaches found
    return [];
  };

  const coaches = processCoaches();
  const hasCoaches = coaches.length > 0;

  const CoachItem = ({ coach, index }) => (
    <View style={styles.coachContainer}>
      <View style={styles.coachImageContainer}>
        {coach.image ? (
          <Image source={{ uri: coach.image }} style={styles.coachImage} />
        ) : (
          <LinearGradient
            colors={index % 2 === 0 ? [modernColors.secondary, modernColors.secondary + 'AA'] : [modernColors.tertiary, modernColors.tertiary + 'AA']}
            style={styles.coachDefaultIcon}
          >
            <MaterialIcons name="person" size={40} color={modernColors.surface} />
          </LinearGradient>
        )}
      </View>
      <AppText style={styles.coachName}>{coach.name}</AppText>
      <LinearGradient
        colors={[modernColors.primary + '15', modernColors.primary + '25']}
        style={styles.coachTitleContainer}
      >
        <AppText style={styles.coachTitle}>مربی متخصص</AppText>
      </LinearGradient>
    </View>
  );

  const DetailItemWithCoaches = ({ label, coaches, icon }) => (
    <View style={styles.detailItem}>
      <View style={styles.labelContainer}>
        <LinearGradient
          colors={[getIconColor(icon), getIconColor(icon) + 'CC']}
          style={styles.iconWrapper}
        >
          <MaterialIcons name={icon} size={22} color={modernColors.surface} />
        </LinearGradient>
        <AppText style={styles.label}>{label}</AppText>
      </View>

      <View style={styles.coachesContentContainer}>
        <FlatList
          data={coaches}
          renderItem={({ item, index }) => <CoachItem coach={item} index={index} />}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          inverted={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.coachesScrollContent}
          ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
        />
      </View>
      <View style={[styles.featureAccent, { backgroundColor: getIconColor(icon) + "60" }]} />
    </View>
  );

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

        {/* Floating Heart Animation */}
        <Animated.View
          style={[
            styles.floatingHeart,
            {
              opacity: heartAnim,
              transform: [
                {
                  translateY: heartAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -150],
                  }),
                },
                {
                  scale: heartAnim.interpolate({
                    inputRange: [0, 0.3, 0.7, 1],
                    outputRange: [0.5, 1.8, 1.5, 0.3],
                  }),
                },
                {
                  rotate: heartAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '15deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <MaterialIcons name="favorite" size={50} color={modernColors.likeIcon} />
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <View style={styles.backButtonContainer}>
              <MaterialIcons name="arrow-forward" size={24} color="#6366f1" />
            </View>
          </TouchableOpacity>

          {/* Menu Button - فقط برای صاحب دوره */}
          {isOwnCourse && !loading && (
            <TouchableOpacity
              style={styles.menuButton}
              onPress={handleShowActions}
              disabled={isDeleting}
              activeOpacity={0.7}
            >
              <View style={styles.menuButtonContainer}>
                <MaterialIcons name="more-vert" size={24} color="#6366f1" />
              </View>
            </TouchableOpacity>
          )}

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
              <AppText style={styles.headerTitle}>جزئیات دوره آموزشی</AppText>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.imageHeaderContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Image
              style={styles.headerImage}
              source={require("../../assets/new_course.jpg")}
            />
            <LinearGradient
              colors={['transparent', 'rgba(190, 126, 234, 0.9)', 'rgba(118, 75, 162, 0.95)']}
              style={styles.overlay}
            >
              <View style={styles.titleBackground}>
                <AppText style={styles.courseTitle}>
                  {toPersianDigits(courseData.CourseName || "نام دوره مشخص نشده")}
                </AppText>
                <View style={styles.courseTypeChip}>
                  <MaterialIcons name="school" size={16} color={modernColors.surface} />
                  <AppText style={styles.courseTypeText}>
                    {formatCourseType(courseData.CourseType)}
                  </AppText>
                </View>
              </View>
            </LinearGradient>

            {/* Like Badge on Image */}
            <View
              style={[
                styles.topLikeBadge,
                {
                  backgroundColor: isLiked ? 'rgba(233, 30, 99, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                }
              ]}
            >
              <TouchableOpacity
                style={styles.topLikeContent}
                onPress={handleLike}
                disabled={isLiking}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={isLiked ? "favorite" : "favorite-border"}
                  size={18}
                  color={isLiked ? "#ffffff" : "#e91e63"}
                />
                <AppText style={[
                  styles.topLikeCount,
                  { color: isLiked ? "#ffffff" : "#e91e63" }
                ]}>
                  {toPersianDigits(likeCount.toString())}
                </AppText>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View
            style={[styles.floatingDecoration2, { transform: [{ rotate: spin }] }]}
          />

          <Animated.View
            style={[
              styles.sectionTitleContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={['#E91E63', '#AD1457']}
              style={styles.sectionIconContainer}
            >
              <MaterialIcons name="info" size={26} color={modernColors.surface} />
            </LinearGradient>
            <AppText style={styles.sectionTitle}>مشخصات دوره</AppText>
            <View style={styles.sparkleContainer}>
              <MaterialIcons name="star-half" size={16} color="#FFD700" style={styles.sparkle1} />
              <MaterialIcons name="star-half" size={12} color="#FF6B6B" style={styles.sparkle2} />
            </View>
          </Animated.View>

          <Animated.View
            style={[styles.floatingDecoration1, { transform: [{ rotate: spin }] }]}
          />

          <Animated.View
            style={[
              styles.cardsContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <SmartDetailItem
              label="درباره این دوره"
              value={courseData.Description}
              icon="description"
              maxLength={50}
            />

            <SmartDetailItem
              label="آدرس"
              value={courseData.CourseAddress}
              icon="place"
              maxLength={25}
            />

            {/* فقط در صورت وجود مربی نمایش داده شود */}
            {hasCoaches && (
              <DetailItemWithCoaches
                label="مربیان"
                coaches={coaches}
                icon="group"
              />
            )}

            <SmartDetailItem
              label="هزینه ثبت نام"
              value={courseData.RegisterAmount ? formatPrice(courseData.RegisterAmount) : null}
              icon="attach-money"
            />

            {/* اطلاعات تکمیلی */}
            <View style={styles.detailItem}>
              <View style={styles.labelContainer}>
                <LinearGradient
                  colors={[getIconColor('info'), getIconColor('info') + 'CC']}
                  style={styles.iconWrapper}
                >
                  <MaterialIcons name="info" size={22} color={modernColors.surface} />
                </LinearGradient>
                <AppText style={styles.label}>اطلاعات تکمیلی</AppText>
              </View>

              <View style={styles.courseInfoSection}>
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <MaterialIcons name="event" size={20} color={modernColors.primary} />
                    <View style={styles.infoContent}>
                      <AppText style={styles.infoLabel}>مدت دوره</AppText>
                      <AppText style={styles.infoValue}>
                        {courseData.ShamsiStartDate && courseData.ShamsiFinishDate
                          ? `${toPersianDigits(courseData.ShamsiStartDate)} تا ${toPersianDigits(courseData.ShamsiFinishDate)}`
                          : "نامشخص"
                        }
                      </AppText>
                    </View>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <MaterialIcons name="how-to-reg" size={20} color={modernColors.success} />
                    <View style={styles.infoContent}>
                      <AppText style={styles.infoLabel}>وضعیت ثبت‌نام</AppText>
                      <AppText style={[styles.infoValue, { color: courseData.RegisterActive ? modernColors.success : modernColors.error }]}>
                        {courseData.RegisterActive ? "فعال" : "غیرفعال"}
                      </AppText>
                    </View>
                  </View>
                </View>

                {courseData.RegisterActive && courseData.ShamsiRegisterStartDate && courseData.ShamsiRegisterFinishDate && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <MaterialIcons name="schedule" size={20} color={modernColors.warning} />
                      <View style={styles.infoContent}>
                        <AppText style={styles.infoLabel}>مهلت ثبت‌نام</AppText>
                        <AppText style={styles.infoValue}>
                          {`${toPersianDigits(courseData.ShamsiRegisterStartDate)} تا ${toPersianDigits(courseData.ShamsiRegisterFinishDate)}`}
                        </AppText>
                      </View>
                    </View>
                  </View>
                )}

                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <MaterialIcons name="schedule" size={20} color={modernColors.info} />
                    <View style={styles.infoContent}>
                      <AppText style={styles.infoLabel}>برنامه زمانی</AppText>
                      <AppText style={styles.infoValue}>
                        {getCourseSchedule(courseData)}
                      </AppText>
                    </View>
                  </View>
                </View>
              </View>

              <View style={[styles.featureAccent, { backgroundColor: getIconColor('info') + "60" }]} />
            </View>

            {/* Rating Section با کامپوننت جدید */}
            <View style={styles.detailItem}>
              <View style={styles.labelContainer}>
                <LinearGradient
                  colors={[modernColors.fashionGold, modernColors.fashionGold + 'CC']}
                  style={styles.iconWrapper}
                >
                  <MaterialIcons name="star" size={22} color={modernColors.surface} />
                </LinearGradient>
                <AppText style={styles.label}>امتیاز دوره</AppText>
              </View>

              <View style={styles.ratingSection}>
                <MultiOptionRatingComponent
                  contentId={courseData.CourseId}
                  averageRating={courseData.AverageRating || 0}
                  ratingCount={courseData.RatingCount || 0}
                  initialRating={courseData.UserRating || 0}
                  initialDetailedRatings={userDetailedRatings}
                  maxStars={5}
                  size={24}
                  starColor={modernColors.fashionGold}
                  enableMultipleOptions={true}
                  ratingOptions={dynamicRatingOptions}
                  modalTitle="امتیازدهی دوره آموزشی"
                  submitButtonText="ثبت امتیاز"
                  cancelButtonText="لغو"
                  showRatingCount={true}
                  showRatingText={true}
                  animated={true}
                  allowHalfStars={false}
                  onRatingSubmitted={(result) => {
                    console.log('Rating submitted successfully:', result);

                    if (result.ratings) {
                      setUserDetailedRatings(result.ratings);
                      const averageRating = result.averageRating;

                      setData(prevData => ({
                        ...prevData,
                        UserRating: averageRating,
                        UserDetailedRatings: result.ratings
                      }));

                      showToast(`امتیاز شما در ${Object.keys(result.ratings).length} بخش با موفقیت ثبت شد`, 'success');
                    } else {
                      setData(prevData => ({
                        ...prevData,
                        UserRating: result.rating
                      }));

                      showToast(`امتیاز ${toPersianDigits(result.rating.toString())} ستاره ثبت شد`, 'success');
                    }
                  }}
                  onRatingError={(errorMessage) => {
                    console.error('Rating submission failed:', errorMessage);
                    showToast(errorMessage || 'خطا در ثبت امتیاز', 'error');
                  }}
                  onRatingChange={(rating, detailedRatings) => {
                    if (detailedRatings) {
                      setUserDetailedRatings(detailedRatings);
                    }
                  }}
                  style={styles.ratingComponent}
                />

                {/* نمایش امتیازات تفصیلی کاربر */}
                {dynamicRatingOptions.length > 0 && Object.keys(userDetailedRatings).length > 0 && (
                  <View style={styles.userDetailedRatingsContainer}>
                    <AppText style={styles.userDetailedRatingsTitle}>امتیازات شما:</AppText>
                    {dynamicRatingOptions
                      .filter(option => userDetailedRatings[option.id])
                      .map((option) => (
                        <View key={option.id} style={styles.userRatingRow}>
                          <View style={styles.userRatingRowContent}>
                            <View style={styles.userRatingRowText}>
                              <AppText style={styles.userRatingRowTitle}>{option.title}</AppText>
                            </View>
                            <View style={styles.userRatingRowStars}>
                              <StarDisplay
                                rating={userDetailedRatings[option.id]}
                                maxStars={5}
                                size={16}
                                color={modernColors.fashionGold}
                                emptyColor="#e0e0e0"
                                showHalfStars={false}
                                animated={false}
                              />
                              <AppText style={styles.userRatingScore}>
                                {toPersianDigits(userDetailedRatings[option.id].toString())}
                              </AppText>
                            </View>
                          </View>
                        </View>
                      ))}
                  </View>
                )}

                {/* نمایش میانگین امتیاز در هر بخش */}
                {dynamicRatingOptions.length > 0 &&
                  dynamicRatingOptions.some(option => option.averageRating != null && option.averageRating !== 0) && (
                    <View style={styles.detailedRatingsContainer}>
                      <AppText style={styles.detailedRatingsTitle}>میانگین امتیاز سایر کاربران:</AppText>
                      {dynamicRatingOptions
                        .filter(option => option.averageRating != null && option.averageRating !== 0)
                        .map((option) => (
                          <View key={option.id} style={styles.detailedRatingRow}>
                            <View style={styles.ratingRowContent}>
                              <View style={styles.ratingRowText}>
                                <AppText style={styles.ratingRowTitle}>{option.title}</AppText>
                              </View>

                              <View style={styles.ratingRowStars}>
                                <StarDisplay
                                  rating={option.averageRating}
                                  maxStars={5}
                                  size={16}
                                  color={modernColors.fashionGold}
                                  emptyColor="#e0e0e0"
                                  showHalfStars={true}
                                  animated={false}
                                />
                                <AppText style={styles.averageRatingScore}>
                                  {toPersianDigits(option.averageRating.toFixed(1))}
                                </AppText>
                              </View>
                            </View>
                          </View>
                        ))}
                    </View>
                  )}
              </View>
              <View style={[styles.featureAccent, { backgroundColor: modernColors.fashionGold + "60" }]} />
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.buttonsContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: pulseAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.primaryButton}
              disabled={!courseData.RegisterActive}
            >
              <LinearGradient
                colors={courseData.RegisterActive ?
                  ['#E91E63', '#AD1457', '#880E4F'] :
                  ['#9e9e9e', '#757575', '#616161']
                }
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <MaterialIcons name="book" size={22} color="white" />
                <AppText style={styles.primaryButtonText}>
                  {courseData.RegisterActive ? "ثبت نام در دوره" : "ثبت نام غیرفعال"}
                </AppText>
              </LinearGradient>
            </TouchableOpacity>
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

          <View style={styles.bottomSpacer} />
        </ScrollView>

        <Modal
          visible={showActionModal}
          transparent={true}
          animationType="none"
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalContainer}>
            <Animated.View
              style={[
                styles.modalBackdrop,
                {
                  opacity: modalBackdropAnim,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.backdropTouchable}
                onPress={handleCloseModal}
                activeOpacity={1}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.modalContent,
                {
                  transform: [
                    {
                      translateY: modalSlideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [300, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.modalHandle} />

              <View style={styles.modalHeader}>
                <AppText style={styles.modalTitle}>عملیات دوره</AppText>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalActionItem}
                  onPress={() => {
                    handleCloseModal();
                    setTimeout(() => {
                      handleEditCourse();
                    }, 300);
                  }}
                >
                  <View style={styles.modalActionContent}>
                    <View style={[styles.modalActionIcon, { backgroundColor: modernColors.info }]}>
                      <MaterialIcons name="edit" size={22} color="#ffffff" />
                    </View>
                    <View style={styles.modalActionText}>
                      <AppText style={styles.modalActionTitle}>ویرایش دوره</AppText>
                      <AppText style={styles.modalActionSubtitle}>ویرایش مشخصات و تنظیمات دوره</AppText>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalActionItem}
                  onPress={handleDeleteCourse}
                  disabled={isDeleting}
                >
                  <View style={styles.modalActionContent}>
                    <View style={[styles.modalActionIcon, { backgroundColor: modernColors.error }]}>
                      <MaterialIcons name="delete" size={22} color="#ffffff" />
                    </View>
                    <View style={styles.modalActionText}>
                      <AppText style={styles.modalActionTitle}>حذف دوره</AppText>
                      <AppText style={styles.modalActionSubtitle}>حذف کامل دوره از سیستم</AppText>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={handleCloseModal}
              >
                <AppText style={styles.modalCancelText}>لغو</AppText>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>

        <Modal
          visible={showDeleteConfirmModal}
          transparent={true}
          animationType="none"
          onRequestClose={handleCloseDeleteModal}
        >
          <View style={styles.modalContainer}>
            <Animated.View
              style={[
                styles.modalBackdrop,
                {
                  opacity: deleteModalBackdropAnim,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.backdropTouchable}
                onPress={handleCloseDeleteModal}
                activeOpacity={1}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.deleteModalContent,
                {
                  transform: [
                    {
                      translateY: deleteModalSlideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [300, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.modalHandle} />

              <View style={styles.deleteModalHeader}>
                <View style={styles.deleteWarningIcon}>
                  <MaterialIcons name="warning" size={32} color="#ffffff" />
                </View>
                <AppText style={styles.deleteModalTitle}>تأیید حذف</AppText>
                <AppText style={styles.deleteModalMessage}>
                  آیا از حذف این دوره اطمینان دارید؟{'\n'}
                  این عمل قابل بازگشت نیست و تمام اطلاعات دوره حذف خواهد شد.
                </AppText>
              </View>

              <View style={styles.deleteModalActions}>
                <View style={styles.deleteButtonsRow}>
                  <TouchableOpacity
                    style={styles.deleteModalCancelButton}
                    onPress={handleCloseDeleteModal}
                    disabled={isDeleting}
                  >
                    <AppText style={styles.deleteModalCancelText}>لغو</AppText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.confirmDeleteButton}
                    onPress={confirmDeleteCourse}
                    disabled={isDeleting}
                  >
                    <LinearGradient
                      colors={[modernColors.error, '#c0392b']}
                      style={styles.confirmDeleteGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      {isDeleting ? (
                        <MaterialIcons name="hourglass-empty" size={20} color="#ffffff" />
                      ) : (
                        <MaterialIcons name="delete-forever" size={20} color="#ffffff" />
                      )}
                      <AppText style={styles.confirmDeleteText}>
                        {isDeleting ? 'در حال حذف...' : 'بله، حذف کن'}
                      </AppText>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
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
  menuButton: {
    position: 'absolute',
    top: StatusBar.currentHeight + 45,
    left: 20,
    zIndex: 1000,
  },
  menuButtonContainer: {
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
  floatingHeart: {
    position: 'absolute',
    top: height * 0.4,
    left: width * 0.5 - 25,
    zIndex: 1000,
    pointerEvents: 'none',
  },
 imageHeaderContainer: {
  position: 'relative',
  height: 480, // تغییر از 320 به 480 برای شکل عمودی
  marginVertical: 20,
  marginHorizontal: 20, // حفظ حاشیه از دو طرف
  borderRadius: 30,
  overflow: 'hidden',
  shadowColor: modernColors.primary,
  shadowOffset: {
    width: 0,
    height: 15,
  },
  shadowOpacity: 0.4,
  shadowRadius: 20,
  elevation: 20,
},
  headerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    resizeMode: 'cover', // اضافه کردن این خاصیت برای بهتر نمایش دادن تصویر
  },

  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%', // کاهش از 60% به 50% برای فضای بیشتر تصویر
    padding: 15,
    justifyContent: 'flex-end',
  },
  titleBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 20,
    padding: 20,
    backdropFilter: 'blur(15px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
  },
  courseTitle: {
    fontSize: 28,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.surface,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 12,
    lineHeight: 36,
  },
  courseTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  courseTypeText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.surface,
    marginLeft: 6,
  },
  topLikeBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  topLikeContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  topLikeCount: {
    fontSize: 15,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#ffffff',
    marginRight: 6,
  },
  floatingDecoration1: {
    position: 'absolute',
    bottom: 50,
    right: 75,
  },
  floatingDecoration2: {
    position: 'absolute',
    top: 1150,
    left: 100,
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
  cardsContainer: {
    paddingHorizontal: 20,
  },
  sectionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
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
    top: 550,
    right: 25,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
  },
  detailItem: {
    marginBottom: 14,
    backgroundColor: "rgba(248, 250, 252, 0.3)",
    backdropFilter: "blur(15px)",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(203, 213, 225, 0.4)",
    position: "relative",
    overflow: "hidden",
    marginHorizontal: 5,
  },
  // Skeleton styles
  detailItemSkeleton: {
    marginBottom: 14,
    backgroundColor: "rgba(248, 250, 252, 0.3)",
    backdropFilter: "blur(15px)",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(203, 213, 225, 0.4)",
    position: "relative",
    overflow: "hidden",
    marginHorizontal: 5,
  },
  skeletonRowContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 15,
  },
  skeletonContentContainer: {
    paddingHorizontal: 15,
  },
  // Row container for label and value in same line
  rowContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  valueContainer: {
    flex: 1,
    paddingLeft: 15,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  label: {
    fontSize: 17,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
  },
  value: {
    fontSize: 16,
    color: "#374151",
    textAlign: 'left',
    lineHeight: 26,
    fontFamily: "Yekan_Bakh_Regular",
  },
  contentContainer: {
    paddingHorizontal: 15,
    marginTop: 15,
  },
  descriptionValue: {
    fontSize: 16,
    color: "#374151",
    textAlign: 'right',
    lineHeight: 26,
    fontFamily: "Yekan_Bakh_Regular",
  },
  featureAccent: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 6,
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  ratingSection: {
    marginTop: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  ratingComponent: {
    alignItems: 'flex-end',
  },
  // امتیازات تفصیلی کاربر
  userDetailedRatingsContainer: {
    marginTop: 20,
    backgroundColor: '#e8f5e8',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  userDetailedRatingsTitle: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    textAlign: 'right',
    marginBottom: 15,
  },
  userRatingRow: {
    marginBottom: 10,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e8f5e8',
  },
  userRatingRowContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userRatingRowText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  userRatingRowTitle: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  userRatingRowStars: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginLeft: 15,
    gap: 8,
  },
  userRatingScore: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.success,
  },
  // میانگین امتیازات سایر کاربران
  detailedRatingsContainer: {
    marginTop: 15,
    backgroundColor: 'rgba(255, 248, 225, 0.5)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  detailedRatingsTitle: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    textAlign: 'right',
    marginBottom: 10,
  },
  detailedRatingRow: {
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.1)',
  },
  ratingRowContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingRowText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  ratingRowTitle: {
    fontSize: 13,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
  },
  ratingRowStars: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginLeft: 10,
    gap: 8,
  },
  averageRatingScore: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#666",
  },
  coachesContentContainer: {
    paddingVertical: 15,
    marginRight: 0,
    alignItems: 'flex-end',
  },
  coachesScrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  coachContainer: {
    alignItems: 'center',
    marginHorizontal: 0,
    backgroundColor: "rgba(248, 250, 252, 0.35)",
    borderRadius: 25,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(203, 213, 225, 0.4)",
    width: (width - 60) / 2.5,
    backdropFilter: "blur(10px)",
    minHeight: 160,
  },
  coachImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 1000,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#ffffff",
    position: 'relative',
  },
  coachImage: {
    width: '100%',
    height: '100%',
  },
  coachDefaultIcon: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coachName: {
    fontSize: 13,
    color: "#2c3e50",
    textAlign: 'center',
    fontFamily: "Yekan_Bakh_Bold",
    marginBottom: 4,
  },
  coachTitleContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  coachTitle: {
    fontSize: 11,
    color: "#374151",
    textAlign: 'center',
    fontFamily: "Yekan_Bakh_Regular",
  },
  // Course Info Section Styles
  courseInfoSection: {
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.3)',
  },
  infoContent: {
    flex: 1,
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#374151",
    marginBottom: 4,
    textAlign: 'right',
  },
  infoValue: {
    fontSize: 13,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#6b7280",
    textAlign: 'right',
    lineHeight: 20,
  },
  buttonsContainer: {
    alignItems: "center",
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  primaryButton: {
    width: "92%",
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 20,
    marginBottom: 18,
    marginTop: 15,
  },
  buttonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 35,
  },
  primaryButtonText: {
    fontSize: 19,
    fontFamily: "Yekan_Bakh_Bold",
    color: "white",
    marginLeft: 12,
  },
  secondaryButton: {
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 2,
  },
  secondaryButtonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 35,
  },
  secondaryButtonText: {
    fontSize: 17,
    fontFamily: "Yekan_Bakh_Regular",
    textAlign: "center",
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
    top: 600,
    left: 60,
  },
  star2: {
    position: "absolute",
    top: 800,
    right: 70,
  },
  star3: {
    position: "absolute",
    bottom: 100,
    left: 50,
  },
  bottomSpacer: {
    height: 30,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouchable: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 15,
    paddingBottom: 35,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
  },
  modalActions: {
    marginBottom: 20,
  },
  modalActionItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderRadius: 15,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  modalActionContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  modalActionIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  modalActionText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  modalActionTitle: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    marginBottom: 2,
  },
  modalActionSubtitle: {
    fontSize: 13,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#6c757d",
  },
  modalCancelButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  modalCancelText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#6c757d',
  },

  // Delete Modal Styles - Updated to match MagDetailesScreen
  deleteModalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 15,
    paddingBottom: 35,
    paddingHorizontal: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  deleteModalHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  deleteWarningIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: modernColors.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: modernColors.error,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    marginBottom: 15,
  },
  deleteModalMessage: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#6c757d",
    textAlign: 'center',
    lineHeight: 24,
  },
  deleteModalActions: {
    marginTop: 10,
  },
  deleteButtonsRow: {
    flexDirection: 'row-reverse',
    gap: 15,
  },
  confirmDeleteButton: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: modernColors.error,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmDeleteGradient: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 10,
  },
  confirmDeleteText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#ffffff',
  },
  deleteModalCancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  deleteModalCancelText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#6c757d',
  },
});

export default CourseDetailsScreen;