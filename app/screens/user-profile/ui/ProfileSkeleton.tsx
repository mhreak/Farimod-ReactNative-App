import React from "react";
import {
  View,
} from "react-native";
import { styles ,modernColors,PROFILE_CONSTANTS } from "../styles/styles";
import { SkeletonLoader } from "./SkeletonLoader";

export const ProfileSkeleton = () => (
  <View style={styles.profileSection}>
    <View style={styles.avatarContainer}>
      <SkeletonLoader
        width={PROFILE_CONSTANTS.AVATAR_OUTER_RING}
        height={PROFILE_CONSTANTS.AVATAR_OUTER_RING}
        borderRadius={PROFILE_CONSTANTS.AVATAR_OUTER_RING / 2}
      />
    </View>
    <SkeletonLoader width={180} height={24} borderRadius={12} style={{ marginBottom: 8 }} />
    <SkeletonLoader width={120} height={16} borderRadius={20} style={{ marginBottom: 15 }} />
    <SkeletonLoader width={80} height={35} borderRadius={20} />
  </View>
);
