import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Animated,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Platform,
  Switch,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import AppText from "./Text";
import AppTextInput from "./TextInput";
import AppPicker from "./Picker";
import colors from "../config/colors";

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
  filterType = "products",
  initialFilters = {},
  customFilterOptions = null,
}) => {
  const [filters, setFilters] = useState({
    categoryId: initialFilters.filterProductCategoryId || 'all',
    filterName: initialFilters.filterName || '',
    filterTitle: initialFilters.filterTitle || '',
    memberGroupId: initialFilters.filterMemberGroupId || 'all',
  });

  const [localSearchText, setLocalSearchText] = useState(
    initialFilters.filterName || initialFilters.filterTitle || ''
  );
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedMemberGroup, setSelectedMemberGroup] = useState(null);

  const modalSlideAnim = useRef(new Animated.Value(300)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;

  const SAFE_AREA_BOTTOM = Platform.select({
    ios: height > 736 ? 34 : 0,
    android: 0,
    default: 0,
  });

  useEffect(() => {
    if (visible) {
      if (filterType === 'products') {
        setFilters({
          categoryId: initialFilters.filterProductCategoryId || 'all',
          filterProductName: initialFilters.filterProductName || '',
        });
        setLocalSearchText(initialFilters.filterProductName || '');

        if (initialFilters.filterProductCategoryId && customFilterOptions?.sections) {
          const categorySection = customFilterOptions.sections.find(s => s.key === 'categoryId');
          const selectedCat = categorySection?.options?.find(
            opt => opt.value.toString() === initialFilters.filterProductCategoryId.toString()
          );
          setSelectedCategory(selectedCat || null);
        } else {
          setSelectedCategory(null);
        }

      } else if (filterType === 'blog') {
        setFilters({
          categoryId: initialFilters.filterCategoryId || 'all',
          filterTitle: initialFilters.filterTitle || '',
        });
        setLocalSearchText(initialFilters.filterTitle || '');

        if (initialFilters.filterCategoryId && customFilterOptions?.sections) {
          const categorySection = customFilterOptions.sections.find(s => s.key === 'categoryId');
          const selectedCat = categorySection?.options?.find(
            opt => opt.value.toString() === initialFilters.filterCategoryId.toString()
          );
          setSelectedCategory(selectedCat || null);
        } else {
          setSelectedCategory(null);
        }

      } else if (filterType === 'portfolio') {
        setFilters({ filterTitle: initialFilters.filterTitle || '' });
        setLocalSearchText(initialFilters.filterTitle || '');

      } else if (filterType === 'members') {
        setFilters({
          filterName: initialFilters.filterName || '',
          memberGroupId: initialFilters.filterMemberGroupId || 'all',
        });
        setLocalSearchText(initialFilters.filterName || '');

        if (initialFilters.filterMemberGroupId && customFilterOptions?.sections) {
          const memberGroupSection = customFilterOptions.sections.find(s => s.key === 'memberGroupId');
          const selectedGroup = memberGroupSection?.options?.find(
            opt => opt.value.toString() === initialFilters.filterMemberGroupId.toString()
          );
          setSelectedMemberGroup(selectedGroup || null);
        } else {
          setSelectedMemberGroup(null);
        }
      }

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

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setFilters(prev => ({ ...prev, categoryId: category.value }));
  };

  const handleMemberGroupSelect = (group) => {
    setSelectedMemberGroup(group);
    setFilters(prev => ({ ...prev, memberGroupId: group.value }));
  };

  const handleSearchTextChange = (text) => {
    setLocalSearchText(text);
    setFilters(prev => ({
      ...prev,
      filterTitle: text,
      filterName: text,
    }));
  };

  const handleApplyFilters = () => {
    let finalFilters = {};

    if (filterType === 'products') {
      if (localSearchText && localSearchText.trim()) {
        finalFilters.filterProductName = localSearchText.trim();
      }
      if (filters.categoryId && filters.categoryId !== 'all') {
        finalFilters.filterProductCategoryId = filters.categoryId;
      }

    } else if (filterType === 'blog') {
      if (filters.categoryId && filters.categoryId !== 'all') {
        finalFilters.filterCategoryId = filters.categoryId;
      }
      if (localSearchText && localSearchText.trim()) {
        finalFilters.filterTitle = localSearchText.trim();
      }

    } else if (filterType === 'portfolio') {
      if (localSearchText && localSearchText.trim()) {
        finalFilters.filterTitle = localSearchText.trim();
      }

    } else if (filterType === 'members') {
      if (filters.memberGroupId && filters.memberGroupId !== 'all') {
        finalFilters.filterMemberGroupId = filters.memberGroupId;
      }
      if (localSearchText && localSearchText.trim()) {
        finalFilters.filterName = localSearchText.trim();
      }
    }

    onApplyFilters(finalFilters);
    closeModal();
  };

  const resetFilters = () => {
    if (filterType === 'blog') {
      setLocalSearchText('');
      setSelectedCategory(null);
      setFilters({ categoryId: 'all', filterTitle: '' });

    } else if (filterType === 'portfolio') {
      setLocalSearchText('');
      setFilters({ filterTitle: '' });

    } else if (filterType === 'members') {
      setLocalSearchText('');
      setSelectedMemberGroup(null);
      setFilters({ filterName: '', memberGroupId: 'all' });

    } else {
      setLocalSearchText('');
      setSelectedCategory(null);
      setFilters({ categoryId: 'all', filterProductName: '' });
    }
  };


  const renderProductFilters = () => {
    const categorySection = customFilterOptions?.sections?.find(s => s.key === 'categoryId');
    const categoryOptions = categorySection?.options || [];

    return (
      <>
        <View style={styles.filterSection}>
          <View style={styles.filterSectionHeader}>
            <MaterialIcons name="search" size={20} color={modernColors.primary} />
            <AppText style={styles.filterSectionTitle}>جستجو در محصولات</AppText>
          </View>
          <AppTextInput
            icon="search"
            placeholder="نام محصول را وارد کنید..."
            value={localSearchText}
            onChangeText={handleSearchTextChange}
            containerStyle={styles.inputContainer}
          />
        </View>

        {categoryOptions.length > 0 && (
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
        )}
      </>
    );
  };

  const renderBlogFilters = () => {
    if (!customFilterOptions) return null;
    const categorySection = customFilterOptions.sections?.find(s => s.key === 'categoryId');
    const categoryOptions = categorySection?.options || [];

    return (
      <>
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

  const renderPortfolioFilters = () => (
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
  );

  const renderMembersFilters = () => {
    const memberGroupSection = customFilterOptions?.sections?.find(s => s.key === 'memberGroupId');
    const memberGroupOptions = memberGroupSection?.options || [];

    return (
      <>
        <View style={styles.filterSection}>
          <View style={styles.filterSectionHeader}>
            <MaterialIcons name="search" size={20} color={modernColors.primary} />
            <AppText style={styles.filterSectionTitle}>جستجوی نام عضو</AppText>
          </View>
          <AppTextInput
            icon="search"
            placeholder="نام عضو را وارد کنید..."
            value={localSearchText}
            onChangeText={handleSearchTextChange}
            containerStyle={styles.inputContainer}
          />
        </View>

        {memberGroupOptions.length > 0 && (
          <View style={styles.filterSection}>
            <View style={styles.filterSectionHeader}>
              <MaterialIcons name="group" size={20} color={modernColors.primary} />
              <AppText style={styles.filterSectionTitle}>گروه عضویت</AppText>
            </View>
            <AppPicker
              icon="group"
              placeholder="انتخاب گروه"
              items={memberGroupOptions}
              selectedItem={selectedMemberGroup}
              onSelectItem={handleMemberGroupSelect}
              width="100%"
            />
          </View>
        )}
      </>
    );
  };

  const renderFilters = () => {
    switch (filterType) {
      case 'products': return renderProductFilters();
      case 'blog': return renderBlogFilters();
      case 'portfolio': return renderPortfolioFilters();
      case 'members': return renderMembersFilters();
      default: return renderProductFilters();
    }
  };

  const getModalTitle = () => {
    if (customFilterOptions?.title) return customFilterOptions.title;
    switch (filterType) {
      case 'blog': return 'فیلتر مقالات';
      case 'portfolio': return 'فیلتر نمونه کارها';
      case 'members': return 'جستجوی اعضا';
      default: return 'فیلتر محصولات';
    }
  };

  const getModalIcon = () => {
    if (customFilterOptions?.icon) return customFilterOptions.icon;
    switch (filterType) {
      case 'blog': return 'article';
      case 'portfolio': return 'brush';
      case 'members': return 'people';
      default: return 'filter-list';
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
            },
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHandle} />
            <View style={styles.headerRow}>
              <View style={styles.headerTitleContainer}>
                <MaterialIcons name={getModalIcon()} size={24} color={modernColors.primary} />
                <AppText style={styles.modalTitle}>{getModalTitle()}</AppText>
              </View>
              <TouchableOpacity
                style={styles.headerResetButton}
                onPress={resetFilters}
                activeOpacity={0.7}
              >
                <MaterialIcons name="refresh" size={20} color={modernColors.medium} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Filters */}
          <ScrollView style={styles.filtersContainer} keyboardShouldPersistTaps="handled">
            {renderFilters()}
          </ScrollView>

          {/* Action Buttons */}
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
    marginBottom: 24,
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
    marginBottom: 0,
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