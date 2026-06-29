import { SkeletonLoader } from "./SkeletonLoader";
import React from "react";
import { View } from "react-native";
import {styles} from "../../styles/styles";

export const MemberGroupCardSkeleton = React.memo(() => {
  return (
    <View style={styles.groupCard}>
      <SkeletonLoader width="100%" height="100%" borderRadius={24} />
    </View>
  );
});