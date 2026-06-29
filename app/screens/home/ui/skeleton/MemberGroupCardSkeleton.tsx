import React from "react";
import { View } from "react-native";
import { styles } from "../../styles/styles";

import { SkeletonLoader } from "./SkeletonLoader";

export const MemberGroupCardSkeleton = () => {
  return (
    <View style={styles.memberGroupCardWrapper}>
      <View style={styles.memberGroupCard}>
        <SkeletonLoader width="100%" height="100%" borderRadius={20} />
      </View>
    </View>
  );
};
