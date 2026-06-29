import React, { memo } from "react";
import { View, TouchableOpacity } from "react-native";
import { styles } from "../../styles/styles";
import { MaterialIcons } from "@expo/vector-icons";
import AppText from "../../../../components/Text";
import colors from "../../../../config/colors";
import { SkeletonLoader } from "../skeleton/SkeletonLoader";

interface RenderSectionHeaderProps {
  label?: string;
  dotColor?: string;
  loading?: boolean;
  hasError?: boolean;
  onViewAll?: () => void;
}

export const RenderSectionHeader = memo(
  ({
    label,
    dotColor,
    loading,
    hasError,
    onViewAll,
  }: RenderSectionHeaderProps) => {
    return (
      <View style={styles.titleBox}>
        <View style={{ flexDirection: "row-reverse", alignItems: "center" }}>
          <View style={{ backgroundColor: dotColor, width: 12, height: 12 }} />
          <AppText style={styles.bodyText}>{label}</AppText>
        </View>
        {!hasError &&
          (loading ? (
            <SkeletonLoader width={80} height={30} borderRadius={15} />
          ) : (
            <TouchableOpacity style={styles.viewAllButton} onPress={onViewAll}>
              <MaterialIcons
                name="chevron-left"
                size={18}
                color={colors.primary}
                style={{ marginLeft: 6 }}
              />
              <AppText style={styles.viewAllText}>مشاهده همه</AppText>
            </TouchableOpacity>
          ))}
      </View>
    );
  },
);
