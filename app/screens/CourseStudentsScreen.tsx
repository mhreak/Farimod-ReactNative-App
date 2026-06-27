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
  ActivityIndicator,
  Modal,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../config/colors";
import MainBackground from "../components/MainBackground";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Toast from "../components/Toast";
import { formatPrice, toPersianDigits } from "../utils/converters";
import appConfig from "../config/config";
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

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
  successDark: "#27ae60",
  successLight: "#a8e6cf",
  warning: "#f39c12",
  error: "#e74c3c",
  errorDark: "#c0392b",
  info: "#3498db",
  gradientStart: "#667eea",
  gradientEnd: "#764ba2",
  greenGradientStart: "#013d38",
  greenGradientEnd: "#38ef7e",
};

const ITEMS_PER_PAGE = 20;

const useCourseStudents = (courseId) => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStudents = async (newPage = 1, pageSize = ITEMS_PER_PAGE, isLoadMore = false) => {
    if (!user?.MemberId || !courseId) {
      setError('اطلاعات کاربر یا دوره موجود نیست');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${appConfig.mobileApi}CourseRegistration/GetRegistrationsOfCoursesOfMember?memberId=${user.MemberId}&courseId=${courseId}&currentPage=${newPage}&pageSize=${pageSize}`
      );

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
      fetchStudents(page + 1, ITEMS_PER_PAGE, true);
    }
  };

  const refresh = () => {
    setPage(1);
    setHasMore(true);
    fetchStudents(1, ITEMS_PER_PAGE, false);
  };

  const deleteStudent = async (courseRegistrationId) => {
    if (!user?.MemberId) return;

    try {
      const response = await fetch(
        `${appConfig.mobileApi}CourseRegistration/DeleteCourseRegistration?memberId=${user.MemberId}&courseRegistrationId=${courseRegistrationId}`,
        {
          method: 'PUT',
        }
      );

      if (!response.ok) {
        throw new Error('خطا در حذف دانشجو');
      }

      refresh();
      return true;
    } catch (err) {
      throw err;
    }
  };

  return {
    data,
    total,
    loading,
    error,
    fetchStudents,
    loadMore,
    refresh,
    hasMore,
    page,
    deleteStudent,
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

const StudentCardSkeleton = () => {
  return (
    <View style={styles.verticalCardSkeleton}>
      <SkeletonLoader width={70} height={70} borderRadius={35} style={{ alignSelf: 'center', marginBottom: 12 }} />
      <SkeletonLoader width="80%" height={16} borderRadius={8} style={{ alignSelf: 'center', marginBottom: 8 }} />
      <SkeletonLoader width="60%" height={14} borderRadius={7} style={{ alignSelf: 'center', marginBottom: 12 }} />
      <SkeletonLoader width="100%" height={1} style={{ marginBottom: 12 }} />
      <SkeletonLoader width="90%" height={14} borderRadius={7} style={{ alignSelf: 'center', marginBottom: 6 }} />
      <SkeletonLoader width="70%" height={14} borderRadius={7} style={{ alignSelf: 'center' }} />
    </View>
  );
};

const getStateColor = (state) => {
  switch (state) {
    case 1:
      return modernColors.warning;
    case 2:
      return modernColors.success;
    default:
      return modernColors.medium;
  }
};

const getStateIcon = (state) => {
  switch (state) {
    case 1:
      return 'pending';
    case 2:
      return 'check-circle';
    default:
      return 'info';
  }
};

const Avatar = ({ member, size = 60 }) => {
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

  const selectedGradient = getGradientForName(member?.MemberName);
  const hasAvatar = member?.MemberAvatarImageURL && member.MemberAvatarImageURL.trim() !== '' && !imageError;

  if (hasAvatar) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 3,
          borderColor: '#fff',
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Image
          source={{ uri: member.MemberAvatarImageURL }}
          style={{
            width: '100%',
            height: '100%',
          }}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={selectedGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 3,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: selectedGradient[0],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <MaterialCommunityIcons
        name="face-man"
        size={size * 0.6}
        color="white"
      />
    </LinearGradient>
  );
};

const StudentCard = ({ item, index, onPress }) => {
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress(item)}
    >
      <Animated.View
        style={[
          styles.verticalCard,
          {
            opacity: cardAnim,
            transform: [
              {
                scale: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
              {
                translateY: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['#ffffff', '#f8f9fa']}
          style={styles.cardGradient}
        >
          <Avatar member={item} size={70} />

          <AppText style={styles.cardName} numberOfLines={2}>
            {item.MemberName}
          </AppText>

          <AppText style={styles.cardMobile} numberOfLines={1}>
            {toPersianDigits(item.MemberMobile || '')}
          </AppText>

          <View style={styles.cardDivider} />



          <View style={styles.cardAmountContainer}>
            <AppText style={styles.cardAmount}>
              {toPersianDigits(formatPrice(item.TotalAmount))}
            </AppText>

          </View>

          <View style={[styles.cardStatusBadge, { backgroundColor: getStateColor(item.State) }]}>
            <MaterialIcons name={getStateIcon(item.State)} size={14} color="#fff" />
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const StudentDrawer = ({ visible, student, onClose, onDelete }) => {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [showFront, setShowFront] = useState(true);

  useEffect(() => {
    if (visible) {
      setShowFront(true);
      flipAnim.setValue(0);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 9,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleFlip = () => {
    Animated.timing(flipAnim, {
      toValue: showFront ? 180 : 0,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      setShowFront(!showFront);
    });
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 90, 180],
    outputRange: [1, 0, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 90, 180],
    outputRange: [0, 0, 1],
  });

  if (!student) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.drawerContainer}>
        <TouchableOpacity
          style={styles.drawerBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          style={[
            styles.drawerContent,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.drawerHandle} />

          <View style={styles.drawerHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={modernColors.dark} />
            </TouchableOpacity>
            <AppText style={styles.drawerTitle}>جزئیات دانشجو</AppText>
            <TouchableOpacity onPress={handleFlip} style={styles.flipButton}>
              <MaterialIcons name="flip" size={24} color={modernColors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.flipContainer}>
            <Animated.View
              style={[
                styles.flipCard,
                {
                  transform: [{ rotateY: frontInterpolate }],
                  opacity: frontOpacity,
                },
                showFront && styles.flipCardActive,
              ]}
            >
              <LinearGradient
                colors={[modernColors.gradientStart, modernColors.gradientEnd]}
                style={styles.frontGradient}
              >
                <Avatar member={student} size={90} />
                <AppText style={styles.studentDrawerName}>{student.MemberName}</AppText>
                <AppText style={styles.studentDrawerMobile}>{toPersianDigits(student.MemberMobile || '')}</AppText>

                <View style={styles.registerInfo}>
                  <MaterialIcons name="calendar-today" size={18} color="rgba(255,255,255,0.9)" />
                  <AppText style={styles.registerInfoText}>
                    تاریخ ثبت‌نام: {toPersianDigits(student.ShamsiRegisterDate || '')}
                  </AppText>
                </View>

                <View style={[styles.drawerStatusBadge, { backgroundColor: `${getStateColor(student.State)}30` }]}>
                  <MaterialIcons name={getStateIcon(student.State)} size={20} color={getStateColor(student.State)} />
                  <AppText style={[styles.drawerStatusText, { color: getStateColor(student.State) }]}>
                    {student.StateStr}
                  </AppText>
                </View>
              </LinearGradient>
            </Animated.View>

            <Animated.View
              style={[
                styles.flipCard,
                styles.flipCardBack,
                {
                  transform: [{ rotateY: backInterpolate }],
                  opacity: backOpacity,
                },
                !showFront && styles.flipCardActive,
              ]}
            >
              <LinearGradient
                colors={[modernColors.greenGradientStart, modernColors.greenGradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.backContent}
              >
                <AppText style={styles.backTitle}>اطلاعات پرداخت</AppText>

                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <MaterialIcons name="payment" size={20} color="#ffffff" />
                  </View>
                  <View style={styles.detailContent}>
                    <AppText style={styles.detailLabel}>نوع پرداخت</AppText>
                    <AppText style={styles.detailValue}>{student.PaymentTypeStr}</AppText>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <MaterialIcons name="attach-money" size={20} color="#ffffff" />
                  </View>
                  <View style={styles.detailContent}>
                    <AppText style={styles.detailLabel}>مبلغ دوره</AppText>
                    <AppText style={styles.detailValue}>
                      {toPersianDigits(formatPrice(student.CourseRegisterAmount))}
                    </AppText>
                  </View>
                </View>

                {student.Discount > 0 && (
                  <View style={styles.detailRow}>
                    <View style={[styles.detailIcon]}>
                      <MaterialIcons name="local-offer" size={20} color="#ffffff" />
                    </View>
                    <View style={styles.detailContent}>
                      <AppText style={styles.detailLabel}>تخفیف</AppText>
                      <AppText style={[styles.detailValue]}>
                        {toPersianDigits(formatPrice(student.Discount))}
                      </AppText>
                    </View>
                  </View>
                )}

                <View style={styles.totalContainer}>
                  <AppText style={styles.totalLabel}>مبلغ نهایی</AppText>
                  <AppText style={styles.totalAmount}>
                    {toPersianDigits(formatPrice(student.TotalAmount))}
                  </AppText>
                </View>
              </LinearGradient>
            </Animated.View>
          </View>

          <TouchableOpacity
            style={styles.drawerDeleteButton}
            onPress={() => onDelete(student)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#ff6b6b', '#ee5a6f']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.drawerDeleteGradient}
            >
              <MaterialIcons name="delete-forever" size={24} color="#fff" />
              <AppText style={styles.drawerDeleteText}>حذف دانشجو از دوره</AppText>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const CourseStudentsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { courseId, courseName } = route?.params || {};

  const {
    data,
    total,
    loading,
    error,
    fetchStudents,
    loadMore,
    refresh,
    hasMore,
    deleteStudent,
  } = useCourseStudents(courseId);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const showToast = (message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  useEffect(() => {
    if (!courseId) {
      showToast('اطلاعات دوره یافت نشد', 'error');
      setTimeout(() => {
        navigation.navigate("App", { screen: "MainTabs", params: { screen: "خانه" } });
      }, 2000);
      return;
    }

    fetchStudents();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [courseId]);

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleCardPress = (item) => {
    setSelectedStudent(item);
    setDrawerVisible(true);
  };

  const handleDeletePress = (item) => {
    setDrawerVisible(false);
    setTimeout(() => {
      setSelectedStudent(item);
      setDeleteModalVisible(true);
    }, 300);
  };

  const handleConfirmDelete = async () => {
    if (!selectedStudent) return;

    try {
      setIsDeleting(true);
      await deleteStudent(selectedStudent.CourseRegistrationId);
      setDeleteModalVisible(false);
      showToast('دانشجو با موفقیت حذف شد', 'success');
    } catch (error) {
      showToast(error.message || 'خطا در حذف دانشجو', 'error');
    } finally {
      setIsDeleting(false);
      setSelectedStudent(null);
    }
  };

  if (!courseId) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <MainBackground />
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={modernColors.primary} />
          <AppText style={styles.emptyTitle}>در حال بازگشت...</AppText>
        </View>
        <Toast
          visible={toastVisible}
          message={toastMessage}
          type={toastType}
          onHide={() => setToastVisible(false)}
        />
      </View>
    );
  }

  const renderStudentCard = ({ item, index }) => (
    <StudentCard item={item} index={index} onPress={handleCardPress} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="people-outline" size={80} color={modernColors.light} />
      <AppText style={styles.emptyTitle}>هنوز هیچ دانشجویی ثبت‌نام نکرده</AppText>
      <AppText style={styles.emptySubtitle}>
        وقتی دانشجویان در این دوره ثبت‌نام کنند، اینجا نمایش داده می‌شوند
      </AppText>
    </View>
  );

  const renderFooter = () => {
    if (!loading || !hasMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={modernColors.primary} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <MainBackground />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("App", { screen: "MainTabs", params: { screen: "خانه" } })}
        activeOpacity={0.8}
      >
        <View style={styles.backButtonContainer}>
          <MaterialIcons name="arrow-forward" size={24} color={modernColors.primary} />
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
        <View style={styles.headerCard}>
          <AppText style={styles.headerTitle}>دانشجویان دوره</AppText>

        </View>
      </Animated.View>

      {loading && data.length === 0 ? (
        <FlatList
          data={[1, 2, 3, 4]}
          numColumns={2}
          renderItem={() => <StudentCardSkeleton />}
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
        />
      ) : (
        <FlatList
          data={data}
          numColumns={2}
          renderItem={renderStudentCard}
          keyExtractor={(item) => item.CourseRegistrationId.toString()}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={modernColors.primary}
              colors={[modernColors.primary]}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
        />
      )}

      <StudentDrawer
        visible={drawerVisible}
        student={selectedStudent}
        onClose={() => setDrawerVisible(false)}
        onDelete={handleDeletePress}
      />

      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !isDeleting && setDeleteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => !isDeleting && setDeleteModalVisible(false)}
          />

          <View style={styles.deleteModalContent}>
            <View style={styles.modalHandle} />

            <View style={styles.deleteModalHeader}>
              <View style={styles.deleteWarningIcon}>
                <MaterialIcons name="warning" size={40} color="#fff" />
              </View>
              <AppText style={styles.deleteModalTitle}>حذف دانشجو</AppText>
              <AppText style={styles.deleteModalMessage}>
                آیا از حذف این دانشجو از دوره اطمینان دارید؟{'\n'}این عملیات قابل بازگشت نیست.
              </AppText>
            </View>

            <View style={styles.deleteModalActions}>
              <View style={styles.deleteButtonsRow}>
                <TouchableOpacity
                  style={styles.confirmDeleteButton}
                  onPress={handleConfirmDelete}
                  disabled={isDeleting}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#ff6b6b', '#ee5a6f']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.confirmDeleteGradient}
                  >
                    {isDeleting ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <MaterialIcons name="delete-forever" size={22} color="#fff" />
                        <AppText style={styles.confirmDeleteText}>بله، حذف شود</AppText>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteModalCancelButton}
                  onPress={() => !isDeleting && setDeleteModalVisible(false)}
                  disabled={isDeleting}
                  activeOpacity={0.8}
                >
                  <AppText style={styles.deleteModalCancelText}>انصراف</AppText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  backButton: {
    position: "absolute",
    top: StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 45,
    right: 20,
    zIndex: 10,
  },
  backButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#667eea",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContainer: {
    marginTop: StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 45,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  headerCard: {
    padding: 10,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.dark,
    marginBottom: 6,
    textAlign: 'center',
  },
  courseNameText: {
    fontSize: 15,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.medium,
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.medium,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    direction:"rtl"
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  verticalCard: {
    width: CARD_WIDTH,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cardGradient: {
    padding: 16,
    alignItems: 'center',
  },
  cardName: {
    fontSize: 15,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.dark,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 4,
    minHeight: 40,
  },
  cardMobile: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.medium,
    textAlign: 'center',
    marginBottom: 12,
  },
  cardDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#e9ecef',
    marginBottom: 12,
  },
  cardDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  cardDate: {
    fontSize: 11,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.medium,
  },
  cardAmountContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'baseline',
    gap: 4,
  },
  cardAmount: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.primary,
  },
  cardAmountLabel: {
    fontSize: 11,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.medium,
  },
  cardStatusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  verticalCardSkeleton: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.dark,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.medium,
    textAlign: 'center',
    lineHeight: 24,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  drawerContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  drawerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 15,
    paddingBottom: 35,
    paddingHorizontal: 25,
    maxHeight: height * 0.85,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 15,
  },
  drawerHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  drawerHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerTitle: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.dark,
  },
  flipButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipContainer: {
    height: 380,
    marginBottom: 20,
    position: 'relative',
  },
  flipCard: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
  },
  flipCardBack: {
    transform: [{ rotateY: '180deg' }],
  },
  flipCardActive: {
    zIndex: 1,
  },
  frontGradient: {
    flex: 1,
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentDrawerName: {
    fontSize: 22,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#fff',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  studentDrawerMobile: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
  },
  registerInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
  },
  registerInfoText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: 'rgba(255, 255, 255, 0.95)',
  },
  drawerStatusBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
  },
  drawerStatusText: {
    fontSize: 15,
    fontFamily: "Yekan_Bakh_Bold",
  },
  backContent: {
    flex: 1,
    borderRadius: 25,
    padding: 25,
  },
  backTitle: {
    fontSize: 20,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 25,
  },
  detailRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Regular",
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#ffffff',
  },
  totalContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 15,
    padding: 20,
    marginTop: 15,
    marginBottom:15,
    
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#ffffff',
    marginBottom: -2,
  },
  totalAmount: {
    fontSize: 24,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#ffffff',
  },
  drawerDeleteButton: {
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#ff6b6b',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  drawerDeleteGradient: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  drawerDeleteText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#ffffff',
  },
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
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  deleteModalHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  deleteWarningIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#ff6b6b',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  deleteModalTitle: {
    fontSize: 22,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    marginBottom: 15,
  },
  deleteModalMessage: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#6c757d",
    textAlign: 'center',
    lineHeight: 26,
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
    shadowColor: '#ff6b6b',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
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
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  deleteModalCancelText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#6c757d',
  },
});

export default CourseStudentsScreen;