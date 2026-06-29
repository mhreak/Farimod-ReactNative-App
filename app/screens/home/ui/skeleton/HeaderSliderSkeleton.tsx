import React from "react";
import { styles } from "../../styles/styles";
import { SkeletonLoader } from "./SkeletonLoader";
import PagerView from "react-native-pager-view";
import { View } from "react-native";

export const HeaderSliderSkeleton = () => {
  return (
    <PagerView
      style={[
        { minHeight: 200, marginBottom: 20 },
        { transform: [{ scaleX: -1 }] },
      ]}
      initialPage={0}
      layoutDirection={"ltr"}
      pageMargin={20}
    >
      {Array.from({ length: 3 }, (_, index) => (
        <View
          key={`slide-skeleton-${index}`}
          style={styles.slideSkeletonContainer}
        >
          <SkeletonLoader width="100%" height={200} borderRadius={20} />
        </View>
      ))}
    </PagerView>
  );
};
