
import React from "react";
import {

  View,

} from "react-native";

import {  styles} from "../styles/styles";
import SkeletonLoader from "./SkeletonLoader";


export const BlogPostCardSkeleton = () => {
  return (
    <View style={styles.blogSkeletonContainer}>
      <View style={styles.blogImageSkeleton}>
        <SkeletonLoader style={{ width: '100%', height: '100%', borderTopLeftRadius: 20, borderTopRightRadius: 20 }} />
      </View>

      <View style={styles.blogDetailsSkeleton}>
        <SkeletonLoader style={{ width: '90%', height: 18, marginBottom: 12, alignSelf: 'flex-end', borderRadius: 4 }} />
        <SkeletonLoader style={{ width: '70%', height: 16, marginBottom: 8, alignSelf: 'flex-end', borderRadius: 4 }} />

        <View style={styles.blogMetaSkeleton}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center' }}>
            <SkeletonLoader style={{ width: 16, height: 16, borderRadius: 8, marginLeft: 6 }} />
            <SkeletonLoader style={{ width: 80, height: 14, borderRadius: 4 }} />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <SkeletonLoader style={{ width: 16, height: 16, borderRadius: 8, marginRight: 6 }} />
            <SkeletonLoader style={{ width: 30, height: 14, borderRadius: 4 }} />
          </View>
        </View>
      </View>
    </View>
  );
};
