import React from "react";
import { View } from "react-native";
import { styles } from "../../styles/styles";

import { SkeletonLoader } from "./SkeletonLoader";

export const BlogPostCardSkeleton = () => {
  return (
    <View style={styles.blogPostCard}>
      <View style={styles.blogPostImageContainer}>
        <SkeletonLoader width="100%" height="100%" borderRadius={0} />
      </View>

      <View style={styles.blogPostContent}>
        <SkeletonLoader
          width="90%"
          height={18}
          style={{ marginBottom: 12, alignSelf: "flex-end" }}
        />
        <SkeletonLoader
          width="70%"
          height={16}
          style={{ marginBottom: 8, alignSelf: "flex-end" }}
        />

        <View style={styles.blogPostMetaSkeleton}>
          <View style={{ flexDirection: "row-reverse", alignItems: "center" }}>
            <SkeletonLoader
              width={16}
              height={16}
              borderRadius={8}
              style={{ marginLeft: 6 }}
            />
            <SkeletonLoader width={80} height={14} />
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <SkeletonLoader
              width={16}
              height={16}
              borderRadius={8}
              style={{ marginRight: 6 }}
            />
            <SkeletonLoader width={30} height={14} />
          </View>
        </View>
      </View>
    </View>
  );
};
