

import React from "react";
import {
  View,
  TouchableOpacity,
} from "react-native";
import MainBackground from "../../../components/MainBackground";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { modernColors , styles } from "../styles/styles";
import { SkeletonLoader } from "./SkeletonLoader";

export const ProductDetailsSkeleton = () => {
  return (
    <View style={styles.container}>
      <MainBackground />

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton}>
        <View style={styles.backButtonContainer}>
          <MaterialIcons name="arrow-forward" size={24} color="#6366f1" />
        </View>
      </TouchableOpacity>

      {/* Header Skeleton */}
      <View style={styles.headerContainer}>
        <SkeletonLoader width={200} height={26} borderRadius={13} />
      </View>

      {/* Image Header Skeleton */}
      <View style={styles.imageHeaderContainer}>
        <SkeletonLoader width="100%" height="100%" borderRadius={30} />
      </View>

      {/* Product Info Skeleton */}
      <View style={styles.productInfoContainer}>
        <View style={styles.priceSection}>
          <SkeletonLoader width={120} height={20} borderRadius={10} style={{ marginBottom: 8 }} />
          <SkeletonLoader width={100} height={16} borderRadius={8} />
        </View>
        <View style={styles.likeSectionContainer}>
          <SkeletonLoader width={28} height={28} borderRadius={14} style={{ marginBottom: 4 }} />
          <SkeletonLoader width={20} height={14} borderRadius={7} />
        </View>
      </View>

      {/* Section Title Skeleton */}
      <View style={styles.sectionTitleContainer}>
        <SkeletonLoader width={50} height={50} borderRadius={25} style={{ marginLeft: 15 }} />
        <SkeletonLoader width={150} height={24} borderRadius={12} />
      </View>

      {/* Detail Items Skeleton */}
      <View style={styles.cardsContainer}>
        {[1, 2, 3, 4, 5].map((item) => (
          <View key={item} style={styles.detailItemSkeleton}>
            <View style={styles.skeletonRowContainer}>
              <SkeletonLoader width={44} height={44} borderRadius={22} style={{ marginLeft: 12 }} />
              <SkeletonLoader width="70%" height={17} borderRadius={8} />
            </View>
          </View>
        ))}
      </View>

      {/* Buttons Skeleton */}
      <View style={styles.buttonsContainer}>
        <SkeletonLoader width="92%" height={56} borderRadius={30} style={{ marginBottom: 18 }} />
        <SkeletonLoader width="70%" height={48} borderRadius={25} />
      </View>
    </View>
  );
};