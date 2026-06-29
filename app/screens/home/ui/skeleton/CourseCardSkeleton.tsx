import React from "react";
import { View } from "react-native";
import { styles } from "../../styles/styles";

import { SkeletonLoader } from "./SkeletonLoader";

export const CourseCardSkeleton = () => {
  return (
    <View style={styles.courseSkeletonContainer}>
      <View style={styles.courseImageSkeleton}>
        <SkeletonLoader width="100%" height="100%" borderRadius={0} />
      </View>
      <View style={styles.courseDetailsSkeleton}>
        <View style={styles.courseHeaderSkeleton}>
          <SkeletonLoader
            width={44}
            height={44}
            borderRadius={12}
            style={{ marginLeft: 12 }}
          />
          <View style={{ flex: 1 }}>
            <SkeletonLoader
              width="90%"
              height={16}
              style={{ marginBottom: 8, alignSelf: "flex-end" }}
            />
            <SkeletonLoader
              width="70%"
              height={16}
              style={{ marginBottom: 8, alignSelf: "flex-end" }}
            />
            <SkeletonLoader
              width="40%"
              height={14}
              style={{ marginBottom: 6, alignSelf: "flex-end" }}
            />
            <SkeletonLoader
              width="50%"
              height={12}
              style={{ alignSelf: "flex-end" }}
            />
          </View>
        </View>
        <View style={styles.locationSectionSkeleton}>
          <View
            style={{
              flexDirection: "row-reverse",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <SkeletonLoader
              width={20}
              height={20}
              borderRadius={10}
              style={{ marginLeft: 8 }}
            />
            <SkeletonLoader width={80} height={13} />
          </View>
        </View>
        <View style={styles.additionalInfoSkeleton}>
          <View
            style={{ flexDirection: "row-reverse", alignItems: "center" }}
          ></View>
          <View
            style={{ flexDirection: "row-reverse", alignItems: "center" }}
          ></View>
        </View>
      </View>
    </View>
  );
};
