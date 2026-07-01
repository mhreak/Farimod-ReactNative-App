import React from "react";
import {

  View,
} from "react-native";
import { SkeletonLoader } from "./SkeletonLoader";

import {  styles} from "../styles/styles";

export const GalleryCardSkeleton = () => {
  return (
    <View style={styles.gridItem}>
      <View style={styles.skeletonImageContainer}>
        <SkeletonLoader width="100%" height="100%" borderRadius={20} />

        {/* Top overlay skeletons */}
        <View style={styles.skeletonTopOverlay}>
          <View style={styles.skeletonLikeButton}>
            <SkeletonLoader width={16} height={16} borderRadius={8} />
            <SkeletonLoader width={20} height={12} style={{ marginRight: 4 }} />
          </View>
          <View style={styles.skeletonRatingButton}>
            <SkeletonLoader width={16} height={16} borderRadius={8} />
            <SkeletonLoader width={25} height={12} style={{ marginRight: 4 }} />
          </View>
        </View>

        <View style={styles.skeletonTextContainer}>
          <SkeletonLoader width="70%" height={16} style={{ alignSelf: 'center' }} />
        </View>
      </View>
    </View>
  );
};