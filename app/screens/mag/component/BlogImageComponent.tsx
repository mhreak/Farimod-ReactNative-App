import React, { memo, useState, useMemo, useCallback } from "react";
import { View, Image } from "react-native";
import { styles } from "../styles/styles";

const BlogImageComponent = ({ item }: any) => {
  const [imageError, setImageError] = useState(false);

  const imageUrl = item?.FeaturedImageURL;

  const hasValidImage = useMemo(() => {
    return (
      item?.FeaturedImageFileName &&
      imageUrl &&
      !imageUrl.endsWith("/")
    );
  }, [item?.FeaturedImageFileName, imageUrl]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  if (!hasValidImage || imageError) {
    return (
      <View style={styles.blogImagePlaceholder}>
        <Image
          style={styles.postImage}
          source={require("../../../../assets/blogPost_icon.jpg")}
        />
      </View>
    );
  }

  return (
    <View style={styles.blogImageContainer}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.blogImage}
        resizeMode="cover"
        onError={handleImageError}
      />
    </View>
  );
};

export default memo(
  BlogImageComponent,
  (prev, next) =>
    prev.item?.FeaturedImageURL === next.item?.FeaturedImageURL
);
