import React from "react";
import {

  View,

} from "react-native";

import { styles } from "../styles/styles";
import { SkeletonLoader } from "./SkeletonLoader";

export const MemberCardSkeleton = () => {
  return (
    <View style={styles.memberSkeletonContainer}>
      <View style={styles.memberContentSkeleton}>
        <SkeletonLoader width={80} height={80} borderRadius={40} style={{ marginBottom: 12 }} />
        <SkeletonLoader width="70%" height={16} style={{ marginBottom: 8, alignSelf: 'center' }} />
        <SkeletonLoader width="80%" height={14} style={{ alignSelf: 'center' }} />
      </View>
    </View>
  );
};