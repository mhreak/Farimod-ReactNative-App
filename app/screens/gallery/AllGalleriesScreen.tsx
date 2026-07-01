import React, { useEffect, useRef, useState } from "react";
import AppText from "../../components/Text";
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  StatusBar,
  Animated,
  Dimensions,
  RefreshControl,
  Text,
} from "react-native";
import colors from "../../config/colors";
import { useNavigation,useRoute } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MainBackground from "../../components/MainBackground";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "../../components/Toast";
import appConfig from "../../config/config";
import { toPersianDigits } from "../../utils/converters";
import { modernColors , styles} from "./styles/styles";
import { GalleryCardSkeleton } from "./ui/GalleryCardSkeleton";
import { PaginationComponent } from "./component/Pagination";
import useToast from "../../hooks/useToast";


const ITEMS_PER_PAGE = 20;

const useGalleriesWithPagination = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGalleries = async (page = 1, pageSize = ITEMS_PER_PAGE) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${appConfig.mobileApi}ImageGallery/GetAll?currentPage=${page}&pageSize=${pageSize}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      setData(result.Items || []);
      setTotal(result.TotalCount || 0);
      setTotalPages(result.TotalPages || 0);
    } catch (err) {
      setError(err.message);
      setData([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    total,
    totalPages,
    loading,
    error,
    fetchGalleries,
  };
};

const AllGalleriesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
    const {showToast , toastMessage , setToastVisible , toastType , toastVisible}=useToast()

  const { filteredMemberId, filteredMemberName, filterType }:any = route.params || {};

  // بروزرسانی custom hook
  const useGalleriesWithPagination = () => {
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchGalleries = async (page = 1, pageSize = ITEMS_PER_PAGE, filters = {}) => {
      try {
        setLoading(true);
        setError(null);

        let queryParams = `currentPage=${page}&pageSize=${pageSize}`;

        if (filters.filterMemberId) {
          queryParams += `&filterMemberId=${filters.filterMemberId}`;
        }

        const response = await fetch(
          `${appConfig.mobileApi}ImageGallery/GetAll?${queryParams}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result.Items || []);
        setTotal(result.TotalCount || 0);
        setTotalPages(result.TotalPages || 0);
      } catch (err) {
        setError(err.message);
        setData([]);
        setTotal(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    return { data, total, totalPages, loading, error, fetchGalleries };
  };

  useEffect(() => {
    const initialFilters = {};

    if (filteredMemberId && filterType === 'member') {
      initialFilters.filterMemberId = filteredMemberId;
      showToast(`نمایش گالری ${filteredMemberName}`, 'info');
    }

    fetchGalleries(currentPage, ITEMS_PER_PAGE, initialFilters);
  }, [currentPage, filteredMemberId]);



  const slideAnim = useRef(new Animated.Value(50)).current;

  const {
    data: galleries,
    total,
    totalPages,
    loading: galleriesLoading,
    error: galleriesError,
    fetchGalleries
  } = useGalleriesWithPagination();

  const [currentPage, setCurrentPage] = useState(1);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchGalleries(currentPage, ITEMS_PER_PAGE);
  }, [currentPage]);




  useEffect(() => {
    if (galleriesError) {
      showToast('خطا در دریافت اطلاعات گالری‌ها. لطفاً دوباره تلاش کنید.', 'error');
    }
  }, [galleriesError]);

  const handleGalleryPress = (galleryData:any) => {
    (navigation as any).navigate("GalleryItem", {
      title: galleryData.Title,
      galleryId: galleryData.ImageGalleryId
    });
  };

  const handlePageChange = (page:any) => {
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
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGalleries(currentPage, ITEMS_PER_PAGE);
    setRefreshing(false);
  };

  const createSkeletonData = () => {
    const skeletonCount = ITEMS_PER_PAGE;
    // اطمینان از زوج بودن تعداد skeleton ها
    const evenCount = skeletonCount % 2 === 0 ? skeletonCount : skeletonCount + 1;
    return Array.from({ length: evenCount }, (_, index) => ({
      id: `skeleton-${index}`,
      ImageGalleryId: `skeleton-${index}`
    }));
  };

  // اضافه کردن GalleryItem component قبل از AllGalleriesScreen:
  const GalleryItem = ({ item, onPress }:any) => {
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
      setImageError(false);
    }, [item.FeaturedImageURL]);

    const handleImageError = () => {
      setImageError(true);
    };

    return (
      <TouchableOpacity
        style={styles.gridItem}
        onPress={() => onPress(item)}
      >
        <View style={styles.imageContainer}>
          {item.FeaturedImageURL && !imageError ? (
            <Image
              style={styles.image}
              source={{ uri: item.FeaturedImageURL }}
              onError={handleImageError}
            />
          ) : (
            <Image
              style={styles.image}
              source={require("../../../assets/sample_clothe2.jpg")}
            />
          )}

          {/* Top overlay icons */}
          <View style={styles.topOverlay}>
            <View style={styles.likeButton}>
              <MaterialIcons name="favorite" size={18} color="#ff6b6b" />
              <AppText style={styles.likeCount}>
                {toPersianDigits(item.LikeCount || 0)}
              </AppText>
            </View>

            {item.Rating && (
              <View style={styles.ratingButton}>
                <MaterialIcons name="star" size={18} color="#FFD700" />
                <AppText style={styles.ratingValue}>
                  {toPersianDigits(item.Rating)}
                </AppText>
              </View>
            )}
          </View>

          <LinearGradient
            colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.8)"]}
            style={styles.background}
          />

          <View style={styles.textContainer}>
            <Text
              style={styles.galleryTitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.Title}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // تغییر renderItem به:
  const renderItem = ({ item }) => {
    // چک برای undefined
    if (!item) {
      return null;
    }

    if (item.id && item.id.startsWith('skeleton')) {
      return <GalleryCardSkeleton />;
    }

    if (item?.isEmpty) {
      return <View style={[styles.gridItem, { backgroundColor: 'transparent' }]} />;
    }

    return <GalleryItem item={item} onPress={handleGalleryPress} />;
  };



  const renderEmptyComponent = () => {
    if (galleriesLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="photo-library" size={80} color="#9e9e9e" />
        <AppText style={styles.emptyTitle}>هیچ گالری‌ای موجود نیست</AppText>
        <AppText style={styles.emptySubtitle}>
          در حال حاضر گالری‌ای برای نمایش وجود ندارد
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
        onPress={() => fetchGalleries(currentPage, ITEMS_PER_PAGE)}
      >
        <MaterialIcons name="refresh" size={20} color={colors.white} />
        <AppText style={styles.retryButtonText}>تلاش مجدد</AppText>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={{ flex: 1 }}>
        <MainBackground />

        <Toast
          visible={toastVisible}
          message={toastMessage}
          type={toastType as any}
          onHide={() => setToastVisible(false)}
        />


        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.backButtonContainer}>
            <MaterialIcons
              name="arrow-forward"
              size={26}
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
           

            <View style={styles.titleWrapper}>
              <AppText style={styles.headerTitle}>گالری‌ها</AppText>
              <View style={styles.sparkleContainer}>
                {/* <Animated.View style={[{ transform: [{ rotate: spin }] }]}>
                  <MaterialIcons
                    name="star-half"
                    size={16}
                    color="#FFD700"
                    style={styles.sparkle1}
                  />
                </Animated.View>
                <Animated.View style={[{ transform: [{ rotate: spin }] }]}>
                  <MaterialIcons
                    name="diamond"
                    size={12}
                    color="#FF6B6B"
                    style={styles.sparkle2}
                  />
                </Animated.View> */}
              </View>
            </View>
          </View>

  
        </View>

        <View
          style={[
            styles.galleryContent,
      
          ]}
        >
          {galleriesError ? (
            renderErrorComponent()
          ) : (
            <>
                <FlatList
                  data={galleriesLoading ? createSkeletonData() : (galleries.length % 2 === 1 ? [...galleries, { isEmpty: true, id: 'empty-placeholder' }] : galleries)}
                  numColumns={2}
                  renderItem={renderItem}
                  keyExtractor={(item, index) => {
                    if (!item) return `item-${index}`;
                    return item.ImageGalleryId?.toString() || item.id || `item-${index}`;
                  }}
                  contentContainerStyle={styles.list}
                  showsVerticalScrollIndicator={false}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      colors={[modernColors.primary]}
                      tintColor={modernColors.primary}
                    />
                  }
                  ListEmptyComponent={renderEmptyComponent}
                  style={styles.flatListContainer}
                />

              {!galleriesLoading && !galleriesError && totalPages > 1 && (
                <PaginationComponent
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  style={styles.pagination}
                />
              )}
            </>
          )}
        </View>

      </View>
    </>
  );
};



export default AllGalleriesScreen;