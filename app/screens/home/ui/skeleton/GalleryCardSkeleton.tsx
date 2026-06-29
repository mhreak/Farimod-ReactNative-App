import React from "react";
import { View } from "react-native";
import { styles } from "../../styles/styles";

import { SkeletonLoader } from "./SkeletonLoader";

export const GalleryCardSkeleton = () => {
  return (
    <View style={styles.galleryCard}>
      <View style={styles.galleryImageContainer}>
        <SkeletonLoader width="100%" height="100%" borderRadius={16} />

        <View style={styles.galleryTitleContainer}>
          <SkeletonLoader
            width="80%"
            height={18}
            borderRadius={9}
            style={{ alignSelf: "center", marginBottom: 8 }}
          />
          <SkeletonLoader
            width="60%"
            height={16}
            borderRadius={8}
            style={{ alignSelf: "center" }}
          />
        </View>
      </View>
    </View>
  );
};
