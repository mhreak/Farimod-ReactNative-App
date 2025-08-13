import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Modal,
  Animated,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Platform,
  Pressable,
  Switch,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import AppText from "./Text";
import AppTextInput from "./TextInput";
import AppPicker from "./Picker";
import colors from "../config/colors";
import { toPersianDigits } from "../utils/converters";

const { width, height } = Dimensions.get('window');

const modernColors = {
  primary: "#667eea",
  primaryDark: "#764ba2",
  secondary: "#ff6b6b",
  tertiary: "#4ecdc4",
  accent: "#45b7d1",
  surface: "#ffffff",
  dark: "#2c3e50",
  medium: "#34495e",
  light: "#ecf0f1",
  success: "#2ecc71",
  warning: "#f39c12",
  error: "#e74c3c",
  info: "#3498db",
};

const FilterModal = ({
  visible,
  onClose,
  onApplyFilters,
  filterType = "products", // Can be 'products', 'blog', or 'portfolio'
  initialFilters = {},
  customFilterOptions = null, // Used for blog and portfolio filter options
}) => {
  const [filters, setFilters] = useState({
    activeOnly: initialFilters.activeOnly || false,
    hasDiscount: initialFilters.hasDiscount || false,
    priceRange: initialFilters.priceRange || 'all',
    sortBy: initialFilters.sortBy || 'newest',
    categoryId: initialFilters.filterCategoryId || 'all', // For blog filter
    filterTitle: initialFilters.filterTitle || '', // For blog and portfolio filter
  });

  const [localSearchText, setLocalSearchText] = useState(initialFilters.filterTitle || '');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const modalSlideAnim = useRef(new Animated.Value(300)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;

  const SAFE_AREA_BOTTOM = Platform.select({
    ios: height > 736 ? 34 : 0,
    android: 0,
    default: 0,
  });

  // Reset filters when modal becomes visible or filter type changes
  useEffect(() => {
    if (visible) {
      // Reset to initial filters or defaults based on filter type
      if (filterType === 'products') {
        setFilters({
          activeOnly: initialFilters.activeOnly || false,
          hasDiscount: initialFilters.hasDiscount || false,
          priceRange: initialFilters.priceRange || 'all',
          sortBy: initialFilters.sortBy || 'newest',
        });
      } else if (filterType === 'blog') {
        setFilters({
          categoryId: initialFilters.filterCategoryId || 'all',
        });
        setLocalSearchText(initialFilters.filterTitle || '');

        // Set selected category based on initial filters
        if (initialFilters.filterCategoryId && customFilterOptions?.sections) {
          const categorySection = customFilterOptions.sections.find(s => s.key === 'categoryId');
          if (categorySection?.options) {
            const selectedCat = categorySection.options.find(opt => opt.value.toString() === initialFilters.filterCategoryId.toString());
            setSelectedCategory(selectedCat || null);
          }
        } else {
          setSelectedCategory(null);
        }
      } else if (filterType === 'portfolio') {
        // Portfolio filter only has title search
        setFilters({
          filterTitle: initialFilters.filterTitle || '',
        });
        setLocalSearchText(initialFilters.filterTitle || '');
      }

      // Animate modal opening
      Animated.parallel([
        Animated.timing(modalSlideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, filterType, initialFilters, customFilterOptions]);

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(modalSlideAnim, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleToggleFilter = (key) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [key]: !prevFilters[key]
    }));
  };

  const handleSelectOption = (key, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [key]: value
    }));
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setFilters(prevFilters => ({
      ...prevFilters,
      categoryId: category.value
    }));
  };

  const handleSearchTextChange = (text) => {
    setLocalSearchText(text);
    setFilters(prevFilters => ({
      ...prevFilters,
      filterTitle: text
    }));
  };

  const handleApplyFilters = () => {
    // Prepare filters based on filter type
    let finalFilters = {};

    if (filterType === 'products') {
      finalFilters = { ...filters };
    } else if (filterType === 'blog') {
      console.log('Current filters state:', filters);
      console.log('Local search text:', localSearchText);
      console.log('Selected category:', selectedCategory);

      // Add category filter if selected and not 'all'
      if (filters.categoryId && filters.categoryId !== 'all') {
        finalFilters.filterCategoryId = filters.categoryId;
      }

      // Add search text filter if exists
      if (localSearchText && localSearchText.trim()) {
        finalFilters.filterTitle = localSearchText.trim();
      }
    } else if (filterType === 'portfolio') {
      console.log('Current portfolio filters state:', filters);
      console.log('Local search text:', localSearchText);

      // Add search text filter if exists
      if (localSearchText && localSearchText.trim()) {
        finalFilters.filterTitle = localSearchText.trim();
      }
    }

    console.log('Final filters to apply:', finalFilters);
    onApplyFilters(finalFilters);
    closeModal();
  };

  const resetFilters = () => {
    if (filterType === 'blog') {
      setLocalSearchText('');
      setSelectedCategory(null);
      setFilters({
        categoryId: 'all',
        filterTitle: '',
      });
    } else if (filterType === 'portfolio') {
      setLocalSearchText('');
      setFilters({
        filterTitle: '',
      });
    } else {
      setFilters({
        activeOnly: false,
        hasDiscount: false,
        priceRange: 'all',
        sortBy: 'newest',
      });
    }
  };

  // Render product filters
  const renderProductFilters = () => {
    return (
      <>
        <View style={styles.filterSection}>
          <View style={styles.filterSectionHeader}>
            <MaterialIcons name="check-circle" size={20} color={modernColors.primary} />
            <AppText style={styles.filterSectionTitle}>وضعیت محصول</AppText>
          </View>

          <View style={styles.switchContainer}>
            <View style={styles.switchItem}>
              <AppText style={styles.switchLabel}>فقط محصولات موجود</AppText>
              <Switch
                trackColor={{ false: '#e2e8f0', true: 'rgba(102, 126, 234, 0.5)' }}
                thumbColor={filters.activeOnly ? modernColors.primary : '#f4f3f4'}
                ios_backgroundColor="#e2e8f0"
                onValueChange={() => handleToggleFilter('activeOnly')}
                value={filters.activeOnly}
              />
            </View>

            <View style={styles.switchItem}>
              <AppText style={styles.switchLabel}>فقط تخفیف‌دارها</AppText>
              <Switch
                trackColor={{ false: '#e2e8f0', true: 'rgba(102, 126, 234, 0.5)' }}
                thumbColor={filters.hasDiscount ? modernColors.primary : '#f4f3f4'}
                ios_backgroundColor="#e2e8f0"
                onValueChange={() => handleToggleFilter('hasDiscount')}
                value={filters.hasDiscount}
              />
            </View>
          </View>
        </View>

        <View style={styles.filterSection}>
          <View style={styles.filterSectionHeader}>
            <MaterialIcons name="money" size={20} color={modernColors.primary} />
            <AppText style={styles.filterSectionTitle}>محدوده قیمت</AppText>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[
                styles.filterOption,
                filters.priceRange === 'all' && styles.selectedFilterOption,
              ]}
              onPress={() => handleSelectOption('priceRange', 'all')}
              activeOpacity={0.7}
            >
              <AppText
                style={[
                  styles.filterOptionText,
                  filters.priceRange === 'all' && styles.selectedFilterOptionText,
                ]}
              >
                همه
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                filters.priceRange === 'low' && styles.selectedFilterOption,
              ]}
              onPress={() => handleSelectOption('priceRange', 'low')}
              activeOpacity={0.7}
            >
              <AppText
                style={[
                  styles.filterOptionText,
                  filters.priceRange === 'low' && styles.selectedFilterOptionText,
                ]}
              >
                ارزان
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                filters.priceRange === 'medium' && styles.selectedFilterOption,
              ]}
              onPress={() => handleSelectOption('priceRange', 'medium')}
              activeOpacity={0.7}
            >
              <AppText
                style={[
                  styles.filterOptionText,
                  filters.priceRange === 'medium' && styles.selectedFilterOptionText,
                ]}
              >
                متوسط
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                filters.priceRange === 'high' && styles.selectedFilterOption,
              ]}
              onPress={() => handleSelectOption('priceRange', 'high')}
              activeOpacity={0.7}
            >
              <AppText
                style={[
                  styles.filterOptionText,
                  filters.priceRange === 'high' && styles.selectedFilterOptionText,
                ]}
              >
                گران
              </AppText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.filterSection}>
          <View style={styles.filterSectionHeader}>
            <MaterialIcons name="sort" size={20} color={modernColors.primary} />
            <AppText style={styles.filterSectionTitle}>مرتب‌سازی</AppText>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[
                styles.filterOption,
                filters.sortBy === 'newest' && styles.selectedFilterOption,
              ]}
              onPress={() => handleSelectOption('sortBy', 'newest')}
              activeOpacity={0.7}
            >
              <AppText
                style={[
                  styles.filterOptionText,
                  filters.sortBy === 'newest' && styles.selectedFilterOptionText,
                ]}
              >
                جدیدترین
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                filters.sortBy === 'cheapest' && styles.selectedFilterOption,
              ]}
              onPress={() => handleSelectOption('sortBy', 'cheapest')}
              activeOpacity={0.7}
            >
              <AppText
                style={[
                  styles.filterOptionText,
                  filters.sortBy === 'cheapest' && styles.selectedFilterOptionText,
                ]}
              >
                ارزان‌ترین
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                filters.sortBy === 'expensive' && styles.selectedFilterOption,
              ]}
              onPress={() => handleSelectOption('sortBy', 'expensive')}
              activeOpacity={0.7}
            >
              <AppText
                style={[
                  styles.filterOptionText,
                  filters.sortBy === 'expensive' && styles.selectedFilterOptionText,
                ]}
              >
                گران‌ترین
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                filters.sortBy === 'popular' && styles.selectedFilterOption,
              ]}
              onPress={() => handleSelectOption('sortBy', 'popular')}
              activeOpacity={0.7}
            >
              <AppText
                style={[
                  styles.filterOptionText,
                  filters.sortBy === 'popular' && styles.selectedFilterOptionText,
                ]}
              >
                محبوب‌ترین
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  };

  // Render blog filters using AppTextInput and AppPicker
  const renderBlogFilters = () => {
    if (!customFilterOptions) return null;

    // Prepare category options for AppPicker
    const categorySection = customFilterOptions.sections?.find(s => s.key === 'categoryId');
    const categoryOptions = categorySection?.options || [];

    return (
      <>
        {/* Search input for blog posts using AppTextInput */}
        <View style={styles.filterSection}>
          <View style={styles.filterSectionHeader}>
            <MaterialIcons name="search" size={20} color={modernColors.primary} />
            <AppText style={styles.filterSectionTitle}>جستجو در مقالات</AppText>
          </View>

          <AppTextInput
            icon="search"
            placeholder="عنوان مقاله را وارد کنید..."
            value={localSearchText}
            onChangeText={handleSearchTextChange}
            containerStyle={styles.inputContainer}
          />
        </View>

        {/* Category selection using AppPicker */}
        <View style={styles.filterSection}>
          <View style={styles.filterSectionHeader}>
            <MaterialIcons name="category" size={20} color={modernColors.primary} />
            <AppText style={styles.filterSectionTitle}>دسته‌بندی</AppText>
          </View>

          <AppPicker
            icon="category"
            placeholder="انتخاب دسته‌بندی"
            items={categoryOptions}
            selectedItem={selectedCategory}
            onSelectItem={handleCategorySelect}
            width="100%"
          />
        </View>
      </>
    );
  };

  // Render portfolio filters (only search)
  const renderPortfolioFilters = () => {
    return (
      <>
        {/* Search input for portfolio posts using AppTextInput */}
        <View style={styles.filterSection}>
          <View style={styles.filterSectionHeader}>
            <MaterialIcons name="search" size={20} color={modernColors.primary} />
            <AppText style={styles.filterSectionTitle}>جستجو در نمونه کارها</AppText>
          </View>

          <AppTextInput
            icon="search"
            placeholder="عنوان نمونه کار را وارد کنید..."
            value={localSearchText}
            onChangeText={handleSearchTextChange}
            containerStyle={styles.inputContainer}
          />
        </View>
      </>
    );
  };

  const renderFilters = () => {
    switch (filterType) {
      case 'products':
        return renderProductFilters();
      case 'blog':
        return renderBlogFilters();
      case 'portfolio':
        return renderPortfolioFilters();
      default:
        return renderProductFilters();
    }
  };

  const getModalTitle = () => {
    if (customFilterOptions?.title) {
      return customFilterOptions.title;
    }

    switch (filterType) {
      case 'blog':
        return 'فیلتر مقالات';
      case 'portfolio':
        return 'فیلتر نمونه کارها';
      case 'products':
      default:
        return 'فیلتر محصولات';
    }
  };

  const getModalIcon = () => {
    if (customFilterOptions?.icon) {
      return customFilterOptions.icon;
    }

    switch (filterType) {
      case 'blog':
        return 'article';
      case 'portfolio':
        return 'brush';
      case 'products':
      default:
        return 'filter-list';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={closeModal}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{ translateY: modalSlideAnim }],
              opacity: modalOpacityAnim,
            }
          ]}
        >
          <View style={styles.modalHeader}>
            <View style={styles.modalHandle} />
            <View style={styles.headerRow}>
              <View style={styles.headerTitleContainer}>
                <MaterialIcons
                  name={getModalIcon()}
                  size={24}
                  color={modernColors.primary}
                />
                <AppText style={styles.modalTitle}>
                  {getModalTitle()}
                </AppText>
              </View>

              {/* Reset button */}
              <TouchableOpacity
                style={styles.headerResetButton}
                onPress={resetFilters}
                activeOpacity={0.7}
              >
                <MaterialIcons name="refresh" size={20} color={modernColors.medium} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.filtersContainer}>
            {renderFilters()}
          </ScrollView>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={closeModal}
              activeOpacity={0.8}
            >
              <MaterialIcons name="close" size={20} color={modernColors.medium} />
              <AppText style={styles.resetButtonText}>انصراف</AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApplyFilters}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[modernColors.primary, modernColors.primaryDark]}
                style={styles.applyButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialIcons name="check" size={20} color="#ffffff" />
                <AppText style={styles.applyButtonText}>اعمال فیلترها</AppText>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={[styles.modalSafeArea, { height: SAFE_AREA_BOTTOM }]} />
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: '70%',
  },
  modalSafeArea: {
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    marginBottom: 15,
  },
  headerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerTitleContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Yekan_Bakh_ExtraBold",
    color: "#1F2937",
    marginRight: 8,
  },
  headerResetButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filtersContainer: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    marginRight: 8,
  },
  inputContainer: {
    marginBottom: 0, // Remove default margin from AppTextInput
  },
  switchContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  switchItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#2c3e50',
  },
  optionsContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
  },
  filterOption: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedFilterOption: {
    backgroundColor: modernColors.primary,
    borderColor: modernColors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#2c3e50',
  },
  selectedFilterOptionText: {
    color: '#ffffff',
  },
  actionButtons: {
    flexDirection: 'row-reverse',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resetButtonText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.medium,
    marginRight: 6,
  },
  applyButton: {
    flex: 2,
  },
  applyButtonGradient: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  applyButtonText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#ffffff',
    marginRight: 6,
  },
});

export default FilterModal;