import React from "react";
import {
  View,
} from "react-native";
import { styles ,modernColors,PROFILE_CONSTANTS } from "../styles/styles";
import { SkeletonLoader } from "./SkeletonLoader";

export const PortfolioCardSkeleton = () => (
  <View style={styles.portfolioCard}>
    <SkeletonLoader width="100%" height="100%" borderRadius={0} />
    <View style={[styles.portfolioOverlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
      <View style={styles.portfolioContent}>
        <SkeletonLoader width="80%" height={16} style={{ marginBottom: 5 }} />
        <SkeletonLoader width="60%" height={13} />
      </View>
    </View>
  </View>
);