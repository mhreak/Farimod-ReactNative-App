import React, { useState, useCallback } from "react";
import AppText from "../../components/Text";
import {
  FlatList,
  Image,
  TouchableOpacity,
  View,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import colors from "../../config/colors";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MainBackground from "../../components/MainBackground";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../contexts/AuthContext";
import { styles } from "./styles/styles";
import { IGalleryItem  , ApiResponse  } from "./types/my-gallert.types";



const MyGalleryScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();


  const [galleries, setGalleries] = useState<IGalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const API_BASE_URL = "http://my.farimod.ir/api/MobileApp";
  const PAGE_SIZE = 20;



  useFocusEffect(
    useCallback(() => {
      fetchGalleries(1, true);
    }, [user])
  );



  const fetchGalleries = async (page: number = 1, resetList: boolean = false) => {
    try {
      if (resetList) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const memberId = user?.MemberId || 0;

      if (!memberId) {
        setIsLoading(false);
        setIsLoadingMore(false);
        return;
      }

      const url = `${API_BASE_URL}/ImageGallery/GetAll?filterMemberId=${memberId}&currentPage=${page}&pageSize=${PAGE_SIZE}`;


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


      if (resetList) {
        setGalleries(data.Items);
      } else {
        setGalleries((prev) => [...prev, ...data.Items]);
      }

      setCurrentPage(data.CurrentPage);
      setTotalPages(data.TotalPages);
    } catch (error) {
      Alert.alert("خطا", "خطا در دریافت گالری‌ها. لطفاً دوباره تلاش کنید");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      setIsRefreshing(false);
    }
  };

  const loadMore = () => {
    if (!isLoadingMore && currentPage < totalPages) {
      fetchGalleries(currentPage + 1, false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchGalleries(1, true);
  };

  const renderItem = ({ item }: { item: IGalleryItem }) => {
    return (
      <TouchableOpacity
        style={styles.gridItem}
        onPress={() =>
        (navigation as any).navigate("ManageGalleryItems" as never, {
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
              defaultSource={require("../../../assets/sample_clothe2.jpg")}
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
          onPress={() => (navigation as any).navigate("App", { screen: "MainTabs", params: { screen: "پروفایل" } })}
        >
          <View style={styles.backButtonContainer}>
            <MaterialIcons name="arrow-forward" size={26} color="#6366f1" />
          </View>
        </TouchableOpacity>

        <View
          style={[
            styles.headerContainer,
          ]}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.addIconHeader}
              onPress={() =>
              (navigation as any).navigate("AddGallery" as never, {
                  memberId: user?.MemberId,
                  memberName: user?.FullName || user?.MemberName,
                } as never)
              }
            >
              <View
         
                style={[styles.addIconGradient,{backgroundColor:'#4CAF50'}]}
              >
                <MaterialIcons name="add" size={26} color="white" />
              </View>
            </TouchableOpacity>

            <View style={styles.titleWrapper}>
              <AppText style={styles.headerTitle}>گالری های من</AppText>

            </View>
          </View>
        </View>

        <View
          style={[
            styles.galleryContent,

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
        </View>
      </View>
    </>
  );
};



export default MyGalleryScreen;