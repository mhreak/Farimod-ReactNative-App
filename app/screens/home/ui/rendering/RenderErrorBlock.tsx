import React, { memo } from "react";
import { View, TouchableOpacity } from "react-native";
import { styles } from "../../styles/styles";
import { MaterialIcons } from "@expo/vector-icons";
import AppText from "../../../../components/Text";
import colors from "../../../../config/colors";

interface RenderErrorBlockProps {
  message: string;
  onRetry: () => void;
}

export const RenderErrorBlock = memo(
  ({ message, onRetry }: RenderErrorBlockProps) => {
    return (
      <View style={styles.errorIconContainer}>
        <MaterialIcons name="error" size={48} color="#9e9e9e" />
        <AppText style={styles.errorIconText}>{message}</AppText>
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <MaterialIcons name="refresh" size={20} color={colors.white} />
          <AppText style={styles.retryButtonText}>تلاش مجدد</AppText>
        </TouchableOpacity>
      </View>
    );
  },
);
