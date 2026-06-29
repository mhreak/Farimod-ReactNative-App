import React from "react";
import {
  View,
} from "react-native";
import { SkeletonLoader } from "./SkeletonLoader";
import {styles} from "../styles/styles";

export const CourseCardSkeleton = () => {
  return (
    <View style={styles.courseSkeletonContainer}>
      <View style={styles.courseImageSkeleton}>
        <SkeletonLoader width="100%" height="100%" borderRadius={0} />
      </View>

      <View style={styles.courseDetailsSkeleton}>
        <View style={styles.courseHeaderSkeleton}>
          <SkeletonLoader width={32} height={32} borderRadius={8} style={{ marginLeft: 8 }} />
          <View style={{ flex: 1 }}>
            <SkeletonLoader width="90%" height={13} style={{ marginBottom: 4, alignSelf: 'flex-end' }} />
            <SkeletonLoader width="70%" height={13} style={{ marginBottom: 4, alignSelf: 'flex-end' }} />
            <SkeletonLoader width="40%" height={12} style={{ marginBottom: 3, alignSelf: 'flex-end' }} />
          </View>
        </View>

        <View style={styles.locationSectionSkeleton}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 3 }}>
            <SkeletonLoader width={14} height={14} borderRadius={7} style={{ marginLeft: 4 }} />
            <SkeletonLoader width={60} height={11} />
          </View>
          <SkeletonLoader width="85%" height={11} style={{ alignSelf: 'flex-end', marginBottom: 2 }} />
          <SkeletonLoader width="60%" height={11} style={{ alignSelf: 'flex-end' }} />
        </View>
      </View>
    </View>
  );
};
