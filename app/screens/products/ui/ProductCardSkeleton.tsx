

import React from "react";
import {
  View,
} from "react-native";
import {styles} from "../styles/styles" 
import { SkeletonLoader } from "./SkeletonLoader";

export const ProductCardSkeleton = () => (
  <View style={styles.productCard}>
    <View style={styles.productImageContainer}>
      <SkeletonLoader style={styles.productImage} />
    </View>
    <View style={styles.productContent}>
      <View style={styles.skeletonTextContainer}>
        <SkeletonLoader style={styles.skeletonTitle} />
        <SkeletonLoader style={styles.skeletonTitleSecond} />
      </View>
      <View style={styles.skeletonPriceContainer}>
        <SkeletonLoader style={styles.skeletonPrice} />
      </View>
    </View>
  </View>
);