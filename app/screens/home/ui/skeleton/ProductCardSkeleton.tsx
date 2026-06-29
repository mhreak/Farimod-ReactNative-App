import React from "react";
import {styles} from "../../styles/styles"
import {SkeletonLoader} from "./SkeletonLoader";
import { View } from "react-native";

export const ProductCardSkeleton = () => {
  return (
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
};