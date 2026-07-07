import React from "react";
import {
  View,
} from "react-native";
import { styles ,modernColors,PROFILE_CONSTANTS } from "../styles/styles";
import { SkeletonLoader } from "./SkeletonLoader";

export const GalleryCardSkeleton = () => (
  <View style={styles.galleryCard}>
    <SkeletonLoader width="100%" height="100%" borderRadius={0} />
    <View style={styles.galleryOverlay}>
      <View style={styles.galleryLikes}>
        <SkeletonLoader width={16} height={16} borderRadius={8} style={{ marginRight: 4 }} />
        <SkeletonLoader width={20} height={11} />
      </View>
    </View>
  </View>
);
