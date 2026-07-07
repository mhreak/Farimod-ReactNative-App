import React from "react";
import {
  View,
} from "react-native";
import { styles ,modernColors,PROFILE_CONSTANTS } from "../styles/styles";
import { SkeletonLoader } from "./SkeletonLoader";

export const QuickAccessSkeleton = () => {
  const itemCount = Math.floor(Math.random() * 3) + 2;

  return (
    <View style={styles.quickAccessContainer}>
      <View style={styles.quickAccessGrid}>
        {Array.from({ length: itemCount }).map((_, index) => (
          <View key={index} style={[styles.quickAccessItem, { backgroundColor: 'rgba(224, 224, 224, 0.15)' }]}>
            <SkeletonLoader width={24} height={24} borderRadius={12} style={{ marginBottom: 6 }} />
            <SkeletonLoader width={60} height={11} borderRadius={6} />
          </View>
        ))}
      </View>
    </View>
  );
};
