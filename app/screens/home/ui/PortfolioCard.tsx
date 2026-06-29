import React, { useState } from "react";
import {

  View,
  Image,
  TouchableOpacity,
} from "react-native";
import { styles } from "../styles/styles";
import { MaterialIcons } from "@expo/vector-icons";
import AppText from "../../../components/Text";
import {
  toPersianDigits,
  safeString,
} from "../../../utils/converters";
import { useCallback } from "react";
import {
  Portfolio,
} from "../../../types/home/home.types";

export const PortfolioCard = React.memo(
  ({
    item,
    onPress,
  }: {
    item: Portfolio;
    onPress?: (portfolio: Portfolio) => void;
  }) => {
    const [imageError, setImageError] = useState(false);

    const handlePress = useCallback(() => {
      const portfolioId = item.PortfolioId ?? item.PotfolioId;
      console.log("Portfolio pressed:", portfolioId, item.Title);
      if (onPress) {
        onPress(item);
      }
    }, [item, onPress]);

    const handleImageError = useCallback(() => {
      setImageError(true);
    }, []);

    const imageSource =
      !imageError && item.FeaturedImageURL
        ? { uri: item.FeaturedImageURL }
        : require("../../../../assets/portfolio_icon.jpg");

    return (
      <TouchableOpacity
        style={styles.portfolioCard}
        activeOpacity={0.8}
        onPress={handlePress}
      >
        <View style={styles.portfolioImageContainer}>
          <Image
            source={imageSource}
            style={
              item.FeaturedImageURL && !imageError
                ? styles.portfolioImage
                : styles.portfolioDefaultImage
            }
            onError={handleImageError}
          />

          <View style={styles.likeBadge}>
            <MaterialIcons name="favorite" size={14} color="#ffffff" />
            <AppText style={styles.likeText}>
              {toPersianDigits((item.LikeCount || 0).toString())}
            </AppText>
          </View>
        </View>

        <View style={styles.portfolioContent}>
          <View>
            <AppText style={styles.portfolioTitle} numberOfLines={2}>
              {safeString(item.Title, "نمونه کار بدون نام")}
            </AppText>

            <AppText style={styles.portfolioDescription} numberOfLines={2}>
              {safeString(item.Description, "بدون توضیحات")}
            </AppText>
          </View>

          <View style={styles.portfolioMeta}>
            <View style={styles.dateContainer}>
              <MaterialIcons name="calendar-month" size={14} color="#666" />
              <AppText style={styles.dateText}>
                {toPersianDigits(item.ShamsiInsertDate)}
              </AppText>
            </View>

            {item.Rating && (
              <View style={styles.ratingContainer}>
                <MaterialIcons name="star" size={14} color="#FFD700" />
                <AppText style={styles.ratingText}>
                  {toPersianDigits(item.Rating.toFixed(1))}
                </AppText>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.item.PortfolioId === nextProps.item.PortfolioId &&
      prevProps.item.PotfolioId === nextProps.item.PotfolioId &&
      prevProps.item.LikeCount === nextProps.item.LikeCount &&
      prevProps.item.Title === nextProps.item.Title &&
      prevProps.item.Description === nextProps.item.Description
    );
  },
);
