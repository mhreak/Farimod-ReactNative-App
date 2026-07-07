
 import React from "react";

import {
  View,
} from "react-native";
import { styles } from "../styles/styles";


 export const SkeletonCard = () => (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonIcon} />
        <View style={styles.skeletonTextContainer}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonSubtitle} />
        </View>
      </View>
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonButton} />
        <View style={styles.skeletonEmptyState} />
      </View>
    </View>
  );
