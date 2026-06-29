import React, { useState } from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { styles } from "../styles/styles";
import { MaterialIcons } from "@expo/vector-icons";
import AppText from "../../../components/Text";
import { toPersianDigits, safeString } from "../../../utils/converters";
import { useCallback } from "react";
import { ImageGallery } from "../../../types/home/home.types";
import { LinearGradient } from "expo-linear-gradient";

export const GalleryCard = React.memo(
  ({
    item,
    onPress,
  }: {
    item: ImageGallery;
    onPress?: (gallery: ImageGallery) => void;
  }) => {
    const [imageError, setImageError] = useState(false);
    const [lastUrl, setLastUrl] = useState(item.FeaturedImageURL);

    if (item.FeaturedImageURL !== lastUrl) {
      setLastUrl(item.FeaturedImageURL);
      setImageError(false);
    }

    const handlePress = useCallback(() => {
      console.log("Gallery pressed:", item.ImageGalleryId, item.Title);
      if (onPress) {
        onPress(item);
      }
    }, [item, onPress]);

    const handleImageError = useCallback(() => {
      setImageError(true);
    }, []);

    const hasValidImage = item.FeaturedImageURL && !imageError;

    return (
      <TouchableOpacity
        style={styles.galleryCard}
        activeOpacity={0.8}
        onPress={handlePress}
      >
        <View style={styles.galleryImageContainer}>
          {hasValidImage ? (
            <Image
              source={{ uri: item.FeaturedImageURL }}
              style={styles.galleryImage}
              onError={handleImageError}
            />
          ) : (
            <View
              style={[
                styles.galleryImagePlaceholder,
                { backgroundColor: "#e0e0e0" },
              ]}
            >
              <MaterialIcons name="photo-library" size={48} color="#9e9e9e" />
            </View>
          )}

          <LinearGradient
            colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.8)"]}
            style={styles.galleryGradient}
          />

          <View style={styles.likeCountBadge}>
            <MaterialIcons name="favorite" size={12} color="#ff6b6b" />
            <AppText style={styles.likeCountText}>
              {toPersianDigits((item.LikeCount || 0).toString())}
            </AppText>
          </View>

          <View style={styles.galleryTitleContainer}>
            <AppText style={styles.galleryTitle} numberOfLines={2}>
              {safeString(item.Title, "گالری بدون نام")}
            </AppText>
          </View>
        </View>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.item.ImageGalleryId === nextProps.item.ImageGalleryId &&
      prevProps.item.LikeCount === nextProps.item.LikeCount &&
      prevProps.item.Title === nextProps.item.Title &&
      prevProps.item.FeaturedImageURL === nextProps.item.FeaturedImageURL
    );
  },
);
