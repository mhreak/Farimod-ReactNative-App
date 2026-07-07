import React from "react";
import {
  View,
} from "react-native";
import { styles ,modernColors,PROFILE_CONSTANTS } from "../styles/styles";
import { SkeletonLoader } from "./SkeletonLoader";

export const ContactSkeleton = () => (
  <View style={styles.glassSection}>
    <View style={styles.sectionHeaderInfo}>
      <SkeletonLoader width={44} height={44} borderRadius={22} style={{ marginLeft: 12 }} />
      <SkeletonLoader width={120} height={18} borderRadius={9} />
    </View>
    <View style={styles.contactGrid}>
      {[1, 2, 3].map((item) => (
        <View key={item} style={styles.modernContactItem}>
          <SkeletonLoader width={44} height={44} borderRadius={22} style={{ marginLeft: 15 }} />
          <View style={styles.contactTextContainer}>
            <SkeletonLoader width={60} height={12} style={{ marginBottom: 4 }} />
            <SkeletonLoader width={120} height={15} />
          </View>
          <SkeletonLoader width={20} height={20} borderRadius={10} style={{ marginRight: 10 }} />
        </View>
      ))}
    </View>
  </View>
);
