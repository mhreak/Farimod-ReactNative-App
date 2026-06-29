import React from "react";
import { View } from "react-native";
import { styles } from "../../styles/styles";

import { SkeletonLoader } from "./SkeletonLoader";

export const PortfolioCardSkeleton = () => {
  return (
    <View style={styles.portfolioCard}>
      <View style={styles.portfolioImageContainer}>
        <SkeletonLoader width="100%" height="100%" borderRadius={0} />
      </View>

      <View style={styles.portfolioContent}>
        <SkeletonLoader
          width="90%"
          height={16}
          style={{ marginBottom: 8, alignSelf: "flex-end" }}
        />
        <SkeletonLoader
          width="70%"
          height={14}
          style={{ marginBottom: 8, alignSelf: "flex-end" }}
        />

        <View style={styles.portfolioMetaSkeleton}>
          <View style={{ flexDirection: "row-reverse", alignItems: "center" }}>
            <SkeletonLoader
              width={14}
              height={14}
              borderRadius={7}
              style={{ marginLeft: 4 }}
            />
            <SkeletonLoader width={60} height={12} />
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <SkeletonLoader
              width={14}
              height={14}
              borderRadius={7}
              style={{ marginRight: 4 }}
            />
            <SkeletonLoader width={25} height={12} />
          </View>
        </View>
      </View>
    </View>
  );
};
