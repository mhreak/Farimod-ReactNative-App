import React, { useRef, useCallback } from "react";
import AppText from "../../../components/Text";
import {
  View,
  Animated,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { modernColors, styles } from "../styles/styles";

const PageButton = React.memo(({ page, isActive, onPress }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (isActive) return;

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onPress(page);
    });
  };

  return (
    <TouchableOpacity
      style={[styles.pageButton, isActive && styles.activePageButton]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.pageButtonContent,
          isActive && styles.activePageButtonContent,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <AppText style={[styles.pageButtonText, isActive && styles.activePageButtonText]}>
          {page}
        </AppText>
      </Animated.View>
    </TouchableOpacity>
  );
});

export const PaginationComponent = ({
  currentPage,
  totalPages,
  onPageChange,
  style = {}
}: any) => {

  const handlePageChange = useCallback((page: number) => {
    if (page !== currentPage) {
      onPageChange(page);
    }
  }, [currentPage, onPageChange]);

  if (totalPages <= 1) return null;

  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const items = [];

  // Previous button
  if (currentPage > 1) {
    items.push(
      <TouchableOpacity
        key="prev"
        style={styles.navButton}
        onPress={() => handlePageChange(currentPage - 1)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={[modernColors.primary, modernColors.primaryDark]}
          style={styles.navButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialIcons name="keyboard-arrow-right" size={20} color="#ffffff" />
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // First page + ellipsis
  if (startPage > 1) {
    items.push(
      <PageButton
        key={1}
        page={1}
        isActive={currentPage === 1}
        onPress={handlePageChange}
      />
    );
    if (startPage > 2) {
      items.push(
        <View key="ellipsis-start" style={styles.ellipsis}>
          <AppText style={styles.ellipsisText}>...</AppText>
        </View>
      );
    }
  }

  // Page numbers
  for (let i = startPage; i <= endPage; i++) {
    items.push(
      <PageButton
        key={i}
        page={i}
        isActive={i === currentPage}
        onPress={handlePageChange}
      />
    );
  }

  // Last page + ellipsis
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      items.push(
        <View key="ellipsis-end" style={styles.ellipsis}>
          <AppText style={styles.ellipsisText}>...</AppText>
        </View>
      );
    }
    items.push(
      <PageButton
        key={totalPages}
        page={totalPages}
        isActive={currentPage === totalPages}
        onPress={handlePageChange}
      />
    );
  }

  // Next button
  if (currentPage < totalPages) {
    items.push(
      <TouchableOpacity
        key="next"
        style={styles.navButton}
        onPress={() => handlePageChange(currentPage + 1)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={[modernColors.primary, modernColors.primaryDark]}
          style={styles.navButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialIcons name="keyboard-arrow-left" size={20} color="#ffffff" />
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.paginationContainer, style]}>
      <View style={styles.paginationWrapper}>
        {items}
      </View>
    </View>
  );
};