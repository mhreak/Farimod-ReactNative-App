import React from "react";
import {
  View,
} from "react-native";
import { styles ,modernColors,PROFILE_CONSTANTS } from "../styles/styles";
import { SkeletonLoader } from "./SkeletonLoader";

export const ProductCardSkeleton = () => (
  <View style={styles.productCard}>
    <View style={styles.productImageContainer}>
      <SkeletonLoader width="100%" height="100%" borderRadius={0} />
    </View>
    <View style={styles.productContent}>
      <SkeletonLoader width="80%" height={16} style={{ marginBottom: 8, alignSelf: 'center' }} />
      <SkeletonLoader width="60%" height={14} style={{ alignSelf: 'center' }} />
    </View>
  </View>
);