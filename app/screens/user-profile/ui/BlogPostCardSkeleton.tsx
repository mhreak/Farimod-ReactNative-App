import React from "react";
import {
  View,
} from "react-native";
import { styles ,modernColors,PROFILE_CONSTANTS } from "../styles/styles";
import { SkeletonLoader } from "./SkeletonLoader";

export const BlogPostCardSkeleton = () => (
  <View style={styles.blogCard}>
    <View style={styles.blogImageContainer}>
      <SkeletonLoader width="100%" height="100%" borderRadius={0} />
    </View>
    <View style={styles.blogContent}>
      <SkeletonLoader width="90%" height={16} style={{ marginBottom: 12 }} />
      <View style={styles.blogMeta}>
        <View style={styles.dateContainer}>
          <SkeletonLoader width={16} height={16} borderRadius={8} style={{ marginLeft: 6 }} />
          <SkeletonLoader width={80} height={14} />
        </View>
        <View style={styles.likeContainer}>
          <SkeletonLoader width={16} height={16} borderRadius={8} style={{ marginRight: 6 }} />
          <SkeletonLoader width={30} height={14} />
        </View>
      </View>
    </View>
  </View>
);