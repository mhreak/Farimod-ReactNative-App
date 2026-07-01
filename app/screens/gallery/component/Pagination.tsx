import React,{ useRef }from "react";
import AppText from "../../../components/Text";
import {


  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";

import { toPersianDigits } from "../../../utils/converters";
import { modernColors , styles} from "../styles/styles";

export const PaginationButton = ({ page, isActive, onPress }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.8, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start(() => onPress(page));
  };

  return (
    <TouchableOpacity
      style={[styles.pageButton, isActive && styles.activePageButton]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Animated.View style={[
        styles.pageButtonContent,
        isActive && styles.activePageButtonContent,
        { transform: [{ scale: scaleAnim }] }
      ]}>
        <AppText style={[styles.pageButtonText, isActive && styles.activePageButtonText]}>
          {toPersianDigits(page)}
        </AppText>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const PaginationComponent = ({ currentPage, totalPages, onPageChange, style = {} }: any) => {
  
  if (totalPages <= 1) return null;

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (currentPage > 1) {
      items.push(
        <TouchableOpacity key="prev" style={styles.navButton} onPress={() => onPageChange(currentPage - 1)}>
          <LinearGradient colors={[modernColors.primary, modernColors.primaryDark]} style={styles.navButtonGradient}>
            <MaterialIcons name="keyboard-arrow-right" size={20} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationButton 
          key={i} 
          page={i} 
          isActive={i === currentPage} 
          onPress={onPageChange} 
        />
      );
    }

    if (currentPage < totalPages) {
      items.push(
        <TouchableOpacity key="next" style={styles.navButton} onPress={() => onPageChange(currentPage + 1)}>
          <LinearGradient colors={[modernColors.primary, modernColors.primaryDark]} style={styles.navButtonGradient}>
            <MaterialIcons name="keyboard-arrow-left" size={20} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>
      );
    }
    return items;
  };

  return (
    <View style={[styles.paginationContainer, style]}>
      <View style={styles.paginationWrapper}>{renderPaginationItems()}</View>
    </View>
  );
};
