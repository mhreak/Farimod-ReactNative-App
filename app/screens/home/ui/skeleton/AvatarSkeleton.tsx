import React from "react";
import { View } from "react-native";
import { styles } from "../../styles/styles";

import { SkeletonLoader } from "./SkeletonLoader";
export const AvatarSkeleton = ({ size = 100 }) => {
  return (
    <View style={styles.avatarContainer}>
      <SkeletonLoader
        width={size}
        height={size}
        borderRadius={size / 2}
        style={{ marginBottom: 8 }}
      />
      <SkeletonLoader width={80} height={12} />
    </View>
  );
};
