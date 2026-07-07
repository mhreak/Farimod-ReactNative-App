import React from "react";
import {
  View,
} from "react-native";
import { styles  } from "../styles/styles";
import { SkeletonLoader } from "./SkeletonLoader";

export const CourseCardSkeleton = () => (
  <View style={styles.courseCard}>
    <SkeletonLoader width="100%" height={140} borderRadius={0} />
    <View style={styles.courseContent}>
      <SkeletonLoader width="90%" height={16} style={{ marginBottom: 10 }} />
      <View style={styles.courseInfo}>
        <View style={styles.coursePrice}>
          <SkeletonLoader width={16} height={16} borderRadius={8} style={{ marginRight: 5 }} />
          <SkeletonLoader width={80} height={14} />
        </View>
        <View style={styles.courseStats}>
          <SkeletonLoader width={14} height={14} borderRadius={7} style={{ marginRight: 5 }} />
          <SkeletonLoader width={60} height={12} />
        </View>
      </View>
      <SkeletonLoader width={80} height={24} borderRadius={12} />
    </View>
  </View>
);