import React from "react";
import {
  View,
} from "react-native";
import { styles ,modernColors,PROFILE_CONSTANTS } from "../styles/styles";
import { SkeletonLoader } from "./SkeletonLoader";

export const InfoSectionSkeleton = ({ title }:any) => (
  <View style={styles.glassSection}>
    <View style={styles.sectionHeaderInfo}>
      <SkeletonLoader width={44} height={44} borderRadius={22} style={{ marginLeft: 12 }} />
      <SkeletonLoader width={100} height={18} borderRadius={9} />
    </View>
    <SkeletonLoader width="100%" height={16} style={{ marginBottom: 8 }} />
    <SkeletonLoader width="90%" height={16} style={{ marginBottom: 8 }} />
    <SkeletonLoader width="70%" height={16} />
  </View>
);