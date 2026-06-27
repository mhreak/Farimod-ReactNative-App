import React, { useEffect, useRef, useState, useCallback } from "react";
import AppText from "../components/Text";
import * as ImagePicker from "expo-image-picker";
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  StatusBar,
  Animated,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import colors from "../config/colors";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MainBackground from "../components/MainBackground";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../contexts/AuthContext";

interface ImageGalleryItem {
  ImageGalleryItemId: number;
  ImageGalleryId: number;
  Title: string;
  ImageFileName: string;
  ImageURL: string;
  ShowOrder: number;
  Active: boolean;
  ActiveStr: string;
  InsertDate: string;
  ShamsiInsertDate: string;
}

interface IGalleryItem {
  ImageGalleryId: number;
  Title: string;
  MemberId: number;
  MemberName: string;
  ImageCount: number;
  Rating: number | null;
  LikeCount: number;
  FeaturedImageURL: string | null;
  Active: boolean;
  ActiveStr: string;
  InsertDate: string;
  ShamsiInsertDate: string;
  ImageGalleryItemList: ImageGalleryItem[];
}

interface ApiResponse {
  Items: IGalleryItem[];
  CurrentPage: number;
  TotalPages: number;
  PageSize: number;
  TotalCount: number;
  HasPrevious: boolean;
  HasNext: boolean;
}

const MyGalleryScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const [galleries, setGalleries] = useState<IGalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const API_BASE_URL = "http://my.farimod.ir/api/MobileApp";
  const PAGE_SIZE = 20;

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

  // بارگذاری داده‌ها هنگام ورود به صفحه
  useFocusEffect(
    useCallback(() => {
      fetchGalleries(1, true);
    }, [user])
  );

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // دریافت گالری‌ها از API
  const fetchGalleries = async (page: number = 1, resetList: boolean = false) => {
    try {
      if (resetList) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const memberId = user?.MemberId || 0;

      if (!memberId) {
        console.log("No member ID found");
        setIsLoading(false);
        setIsLoadingMore(false);
        return;
      }

      const url = `${API_BASE_URL}/ImageGallery/GetAll?filterMemberId=${memberId}&currentPage=${page}&pageSize=${PAGE_SIZE}`;

      console.log("Fetching galleries from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "*/*",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      console.log("Galleries fetched successfully:", data.Items.length);

      if (resetList) {
        setGalleries(data.Items);
      } else {
        setGalleries((prev) => [...prev, ...data.Items]);
      }

      setCurrentPage(data.CurrentPage);
      setTotalPages(data.TotalPages);
    } catch (error) {
      console.error("Error fetching galleries:", error);
      Alert.alert("خطا", "خطا در دریافت گالری‌ها. لطفاً دوباره تلاش کنید");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      setIsRefreshing(false);
    }
  };

  // بارگذاری صفحه بعدی
  const loadMore = () => {
    if (!isLoadingMore && currentPage < totalPages) {
      fetchGalleries(currentPage + 1, false);
    }
  };

  // رفرش کردن لیست
  const onRefresh = () => {
    setIsRefreshing(true);
    fetchGalleries(1, true);
  };

  const renderItem = ({ item }: { item: IGalleryItem }) => {
    return (
      <TouchableOpacity
        style={styles.gridItem}
        onPress={() =>
          navigation.navigate("ManageGalleryItems" as never, {
            galleryId: item.ImageGalleryId,
            galleryTitle: item.Title,
          } as never)
        }
      >
        <View style={styles.imageContainer}>
          {item.FeaturedImageURL ? (
            <Image
              style={styles.image}
              source={{ uri: item.FeaturedImageURL }}
              defaultSource={require("../../assets/sample_clothe2.jpg")}
            />
          ) : (
            <View style={[styles.image, styles.placeholderImage]}>
              <MaterialIcons name="image" size={60} color="#ccc" />
            </View>
          )}
          <LinearGradient
            colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.8)"]}
            style={styles.background}
          />
          <View style={styles.textContainer}>
            <AppText style={styles.galleryTitle}>{item.Title}</AppText>
            <View style={styles.galleryInfo}>
              <View style={styles.infoItem}>
                <MaterialIcons name="image" size={14} color="#FFF" />
                <AppText style={styles.infoText}>{item.ImageCount}</AppText>
              </View>
              <View style={styles.infoItem}>
                <MaterialIcons name="favorite" size={14} color="#FF6B6B" />
                <AppText style={styles.infoText}>{item.LikeCount}</AppText>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="photo-library" size={80} color="#ccc" />
        <AppText style={styles.emptyText}>هنوز گالری ای ندارید</AppText>
        <AppText style={styles.emptySubText}>
          برای افزودن گالری جدید روی دکمه + بزنید
        </AppText>
      </View>
    );
  };

  if (isLoading && galleries.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <MainBackground />
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText style={styles.loadingText}>در حال بارگذاری...</AppText>
      </View>
    );
  }

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <View style={{ flex: 1 }}>
        <MainBackground />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("App", { screen: "MainTabs", params: { screen: "خانه" } })}
        >
          <View style={styles.backButtonContainer}>
            <MaterialIcons name="arrow-forward" size={26} color="#6366f1" />
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
              style={styles.addIconHeader}
              onPress={() =>
                navigation.navigate("AddGallery" as never, {
                  memberId: user?.MemberId,
                  memberName: user?.FullName || user?.MemberName,
                } as never)
              }
            >
              <LinearGradient
                colors={["#4CAF50", "#45A049"]}
                style={styles.addIconGradient}
              >
                <MaterialIcons name="add" size={26} color="white" />
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.titleWrapper}>
              <AppText style={styles.headerTitle}>گالری های من</AppText>
              <View style={styles.sparkleContainer}>
                <Animated.View style={[{ transform: [{ rotate: spin }] }]}>
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
                </Animated.View>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.galleryContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <FlatList
            data={galleries}
            numColumns={2}
            renderItem={renderItem}
            keyExtractor={(item) => item.ImageGalleryId.toString()}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmptyComponent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          />
        </Animated.View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.medium,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
    paddingTop: StatusBar.currentHeight + 35,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "relative",
  },
  addIconHeader: {
    position: "absolute",
    left: 0,
    borderRadius: 25,
    overflow: "hidden",
    marginTop: 8,
  },
  addIconGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: StatusBar.currentHeight + 45,
    right: 20,
    zIndex: 1000,
  },
  backButtonContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    marginTop: -17,
  },
  titleWrapper: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Yekan_Bakh_ExtraBold",
    color: "#2c3e50",
    marginHorizontal: 15,
    textAlign: "center",
  },
  sparkleContainer: {
    position: "absolute",
    top: 100,
    left: 10,
  },
  sparkle1: {
    position: "absolute",
    top: 0,
    left: 90,
  },
  sparkle2: {
    position: "absolute",
    top: 25,
    left: 25,
  },
  galleryContent: {
    flex: 1,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "70%",
    borderRadius: 20,
  },
  list: {
    padding: 15,
    flexGrow: 1,
  },
  gridItem: {
    flex: 1,
    margin: 8,
    height: 200,
    borderRadius: 20,
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderImage: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    paddingBottom: 20,
  },
  galleryTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  galleryInfo: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
});

export default MyGalleryScreen;