import React, { useState } from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { styles } from "../styles/styles";
import { MaterialIcons } from "@expo/vector-icons";
import AppText from "../../../components/Text";
import { toPersianDigits, safeString } from "../../../utils/converters";
import { useCallback } from "react";
import { BlogPost } from "../../../types/home/home.types";

export const BlogPostCard = React.memo(
  ({
    item,
    onPress,
  }: {
    item: BlogPost;
    onPress?: (post: BlogPost) => void;
  }) => {
    const [imageError, setImageError] = useState(false);

    const handlePress = useCallback(() => {
      console.log("Blog post pressed:", item.BlogPostId, item.Title);
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
        : require("../../../../assets/blogPost_icon.jpg");

    return (
      <TouchableOpacity
        style={styles.blogPostCard}
        activeOpacity={0.8}
        onPress={handlePress}
      >
        <View style={styles.blogPostImageContainer}>
          <Image
            source={imageSource}
            style={
              item.FeaturedImageURL && !imageError
                ? styles.blogPostImage
                : styles.postImage
            }
            onError={handleImageError}
          />
        </View>

        <View style={styles.blogPostContent}>
          <AppText style={styles.blogPostTitle} numberOfLines={3}>
            {safeString(item.Title, "مقاله بدون نام")}
          </AppText>

          <View style={styles.blogPostMeta}>
            <View style={styles.blogPostDateContainer}>
              <MaterialIcons name="calendar-month" size={16} color="#666" />
              <AppText style={styles.blogPostDateText}>
                {toPersianDigits(item.ShamsiInsertDate)}
              </AppText>
            </View>

            <View style={styles.blogPostLikeContainer}>
              <MaterialIcons name="favorite" size={16} color="#ff6b6b" />
              <AppText style={styles.blogPostLikeText}>
                {toPersianDigits((item.LikeCount || 0).toString())}
              </AppText>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.item.BlogPostId === nextProps.item.BlogPostId &&
      prevProps.item.LikeCount === nextProps.item.LikeCount &&
      prevProps.item.Title === nextProps.item.Title &&
      prevProps.item.ShamsiInsertDate === nextProps.item.ShamsiInsertDate &&
      prevProps.item.FeaturedImageURL === nextProps.item.FeaturedImageURL
    );
  },
);
