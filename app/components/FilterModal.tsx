import React, { useRef, useEffect, useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Pressable,
  ScrollView,
  Dimensions,
  Switch,
  Platform,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AppText from './Text';

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

// Draggable Range Slider Component
const DraggableRangeSlider = ({
  minValue = 0,
  maxValue = 10000000,
  initialLowValue = 0,
  initialHighValue = 10000000,
  onValueChange,
  step = 100000
}) => {
  const [lowValue, setLowValue] = useState(initialLowValue);
  const [highValue, setHighValue] = useState(initialHighValue);

  const sliderWidth = width - 80;
  const thumbSize = 24;
  const trackHeight = 6;

  const lowThumbX = useRef(new Animated.Value(0)).current;
  const highThumbX = useRef(new Animated.Value(sliderWidth - thumbSize)).current;

  // Convert value to position
  const valueToPosition = (value) => {
    return ((value - minValue) / (maxValue - minValue)) * (sliderWidth - thumbSize);
  };

  // Convert position to value
  const positionToValue = (position) => {
    const value = (position / (sliderWidth - thumbSize)) * (maxValue - minValue) + minValue;
    return Math.round(value / step) * step;
  };

  // Format price for display
  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(price % 1000000 === 0 ? 0 : 1)} میلیون`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 0)} هزار`;
    }
    return price.toString();
  };

  // Update positions when values change
  useEffect(() => {
    const lowPos = valueToPosition(lowValue);
    const highPos = valueToPosition(highValue);

    Animated.timing(lowThumbX, {
      toValue: lowPos,
      duration: 100,
      useNativeDriver: false,
    }).start();

    Animated.timing(highThumbX, {
      toValue: highPos,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [lowValue, highValue]);

  // Pan responder for low thumb
  const lowThumbPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      lowThumbX.setOffset(lowThumbX._value);
      lowThumbX.setValue(0);
    },
    onPanResponderMove: (_, gestureState) => {
      const currentPos = lowThumbX._offset + gestureState.dx;
      const newPosition = Math.max(0, Math.min(currentPos, sliderWidth - thumbSize));
      const newValue = positionToValue(newPosition);

      if (newValue < highValue) {
        lowThumbX.setValue(gestureState.dx);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      const currentPos = lowThumbX._offset + gestureState.dx;
      const finalPosition = Math.max(0, Math.min(currentPos, sliderWidth - thumbSize));
      const finalValue = positionToValue(finalPosition);

      lowThumbX.flattenOffset();

      if (finalValue < highValue) {
        setLowValue(finalValue);
        onValueChange && onValueChange({ low: finalValue, high: highValue });
      } else {
        // Reset to previous position if invalid
        Animated.timing(lowThumbX, {
          toValue: valueToPosition(lowValue),
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    },
  });

  // Pan responder for high thumb
  const highThumbPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      highThumbX.setOffset(highThumbX._value);
      highThumbX.setValue(0);
    },
    onPanResponderMove: (_, gestureState) => {
      const currentPos = highThumbX._offset + gestureState.dx;
      const newPosition = Math.max(0, Math.min(currentPos, sliderWidth - thumbSize));
      const newValue = positionToValue(newPosition);

      if (newValue > lowValue) {
        highThumbX.setValue(gestureState.dx);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      const currentPos = highThumbX._offset + gestureState.dx;
      const finalPosition = Math.max(0, Math.min(currentPos, sliderWidth - thumbSize));
      const finalValue = positionToValue(finalPosition);

      highThumbX.flattenOffset();

      if (finalValue > lowValue) {
        setHighValue(finalValue);
        onValueChange && onValueChange({ low: lowValue, high: finalValue });
      } else {
        // Reset to previous position if invalid
        Animated.timing(highThumbX, {
          toValue: valueToPosition(highValue),
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    },
  });

  return (
    <View style={rangeStyles.container}>
      {/* Slider Track */}
      <View style={rangeStyles.sliderContainer}>
        <View style={rangeStyles.sliderTrack}>
          {/* Background track */}
          <View style={rangeStyles.trackBackground} />

          {/* Active track */}
          <Animated.View
            style={[
              rangeStyles.trackActive,
              {
                left: lowThumbX,
                width: Animated.subtract(highThumbX, lowThumbX),
              }
            ]}
          />

          {/* Low thumb */}
          <Animated.View
            style={[rangeStyles.thumb, { left: lowThumbX }]}
            {...lowThumbPanResponder.panHandlers}
          >
            <View style={rangeStyles.thumbInner} />
          </Animated.View>

          {/* High thumb */}
          <Animated.View
            style={[rangeStyles.thumb, { left: highThumbX }]}
            {...highThumbPanResponder.panHandlers}
          >
            <View style={rangeStyles.thumbInner} />
          </Animated.View>
        </View>
      </View>

      {/* Current Values Display - Moved below track */}
      <View style={rangeStyles.valuesDisplay}>
        <View style={rangeStyles.valueBox}>
          <AppText style={rangeStyles.valueLabel}>حداقل</AppText>
          <AppText style={rangeStyles.valueText}>{formatPrice(lowValue)} تومان</AppText>
        </View>
        <View style={rangeStyles.valueBox}>
          <AppText style={rangeStyles.valueLabel}>حداکثر</AppText>
          <AppText style={rangeStyles.valueText}>{formatPrice(highValue)} تومان</AppText>
        </View>
      </View>
    </View>
  );
};

const FilterModal = ({
  visible,
  onClose,
  onApplyFilters,
  filterType,
  initialFilters = {}
}) => {
  const modalSlideAnim = useRef(new Animated.Value(300)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;
  const [filters, setFilters] = useState(initialFilters);

  const SAFE_AREA_BOTTOM = Platform.select({
    ios: height > 736 ? 34 : 0,
    android: 0,
    default: 0,
  });

  useEffect(() => {
    if (visible) {
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
        })
      ]).start();
    } else {
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
        })
      ]).start();
    }
  }, [visible]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({});
  };

  const applyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const getIconColor = (iconName) => {
    const iconColors = {
      'check-circle': '#2ecc71',     // سبز
      'local-offer': '#e74c3c',      // قرمز
      'attach-money': '#f39c12',     // نارنجی
      'sort': '#9b59b6',             // بنفش
      'how-to-reg': '#3498db',       // آبی
      'category': '#e67e22',         // نارنجی تیره
      'trending-up': '#16a085',      // سبز آبی
      'schedule': '#34495e',         // خاکستری تیره
      'person': '#e91e63',           // صورتی
      'verified-user': '#27ae60',    // سبز تیره
      'event': '#8e44ad',            // بنفش تیره
      'image': '#2980b9',            // آبی تیره
      'photo-library': '#f1c40f',    // زرد
    };
    return iconColors[iconName] || modernColors.primary;
  };
  const getFilterOptions = () => {
    switch (filterType) {
      case 'products':
        return {
          title: 'فیلتر محصولات',
          icon: 'shopping-bag',
          sections: [
            {
              title: 'تخفیف',
              type: 'toggle',
              key: 'hasDiscount',
              label: 'فقط محصولات دارای تخفیف',
              icon: 'local-offer',
            },
            {
              title: 'محدوده قیمت',
              type: 'range',
              key: 'priceRange',
              icon: 'attach-money',
              minValue: 0,
              maxValue: 10000000,
              step: 100000,
            },
            {
              title: 'مرتب‌سازی',
              type: 'selection',
              key: 'sortBy',
              icon: 'sort',
              options: [
                { label: 'جدیدترین', value: 'newest' },
                { label: 'قدیمی‌ترین', value: 'oldest' },
                { label: 'ارزان‌ترین', value: 'price_low' },
                { label: 'گران‌ترین', value: 'price_high' },
                { label: 'پرفروش‌ترین', value: 'popular' },
              ],
            },
          ],
        };

      case 'courses':
        return {
          title: 'فیلتر دوره‌ها',
          icon: 'school',
          sections: [
            {
              title: 'وضعیت ثبت‌نام',
              type: 'toggle',
              key: 'registerActive',
              label: 'فقط دوره‌های قابل ثبت‌نام',
              icon: 'how-to-reg',
            },
            {
              title: 'نوع دوره',
              type: 'selection',
              key: 'courseType',
              icon: 'category',
              options: [
                { label: 'همه', value: 'all' },
                { label: 'حضوری', value: 'in_person' },
                { label: 'آنلاین', value: 'online' },
                { label: 'ترکیبی', value: 'hybrid' },
              ],
            },
            {
              title: 'مرتب‌سازی',
              type: 'selection',
              key: 'sortBy',
              icon: 'sort',
              options: [
                { label: 'جدیدترین', value: 'newest' },
                { label: 'قدیمی‌ترین', value: 'oldest' },
                { label: 'محبوب‌ترین', value: 'popular' },
              ],
            },
          ],
        };

      case 'members':
        return {
          title: 'فیلتر اعضا',
          icon: 'people',
          sections: [
            {
              title: 'جنسیت',
              type: 'selection',
              key: 'gender',
              icon: 'person',
              options: [
                { label: 'همه', value: 'all' },
                { label: 'مرد', value: 'male' },
                { label: 'زن', value: 'female' },
              ],
            },
            {
              title: 'وضعیت عضویت',
              type: 'toggle',
              key: 'activeOnly',
              label: 'فقط اعضای فعال',
              icon: 'verified-user',
            },
            {
              title: 'مرتب‌سازی',
              type: 'selection',
              key: 'sortBy',
              icon: 'sort',
              options: [
                { label: 'جدیدترین عضو', value: 'newest' },
                { label: 'قدیمی‌ترین عضو', value: 'oldest' },
                { label: 'الفبایی', value: 'name_asc' },
              ],
            },
          ],
        };

      case 'gallery':
        return {
          title: 'فیلتر گالری',
          icon: 'photo-library',
          sections: [
            {
              title: 'نوع فایل',
              type: 'selection',
              key: 'fileType',
              icon: 'image',
              options: [
                { label: 'همه', value: 'all' },
                { label: 'تصاویر', value: 'images' },
                { label: 'ویدیوها', value: 'videos' },
              ],
            },
            {
              title: 'مرتب‌سازی',
              type: 'selection',
              key: 'sortBy',
              icon: 'sort',
              options: [
                { label: 'جدیدترین', value: 'newest' },
                { label: 'قدیمی‌ترین', value: 'oldest' },
                { label: 'نام فایل', value: 'name' },
              ],
            },
          ],
        };

      default:
        return { title: 'فیلتر', icon: 'filter-list', sections: [] };
    }
  };

  const renderToggleFilter = (section) => (
    <View key={section.key} style={styles.filterSection}>
      <View style={styles.filterSectionHeader}>
        <MaterialIcons name={section.icon} size={20} color={getIconColor(section.icon)} />
        <AppText style={styles.filterSectionTitle}>{section.title}</AppText>
      </View>
      <View style={styles.toggleContainer}>
        <AppText style={styles.toggleLabel}>{section.label}</AppText>
        <Switch
          value={filters[section.key] || false}
          onValueChange={(value) => updateFilter(section.key, value)}
          trackColor={{ false: '#e0e0e0', true: modernColors.primary }}
          thumbColor={filters[section.key] ? '#ffffff' : '#f4f3f4'}
          ios_backgroundColor="#e0e0e0"
        />
      </View>
    </View>
  );

  const renderRangeFilter = (section) => (
    <View key={section.key} style={styles.filterSection}>
      <View style={styles.filterSectionHeader}>
        <MaterialIcons name={section.icon} size={20} color={getIconColor(section.icon)} />
        <AppText style={styles.filterSectionTitle}>{section.title}</AppText>
      </View>
      <View style={styles.rangeContainer}>
        <DraggableRangeSlider
          minValue={section.minValue}
          maxValue={section.maxValue}
          step={section.step}
          initialLowValue={filters[`${section.key}_min`] || section.minValue}
          initialHighValue={filters[`${section.key}_max`] || section.maxValue}
          onValueChange={(values) => {
            updateFilter(`${section.key}_min`, values.low);
            updateFilter(`${section.key}_max`, values.high);
          }}
        />
      </View>
    </View>
  );

  const renderSelectionFilter = (section) => (
    <View key={section.key} style={styles.filterSection}>
      <View style={styles.filterSectionHeader}>
        <MaterialIcons name={section.icon} size={20} color={getIconColor(section.icon)} />
        <AppText style={styles.filterSectionTitle}>{section.title}</AppText>
      </View>
      <View style={styles.selectionContainer}>
        {section.options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.selectionOption,
              filters[section.key] === option.value && styles.selectedOption,
            ]}
            onPress={() => updateFilter(section.key, option.value)}
            activeOpacity={0.7}
          >
            <AppText style={[
              styles.selectionOptionText,
              filters[section.key] === option.value && styles.selectedOptionText,
            ]}>
              {option.label}
            </AppText>
            {filters[section.key] === option.value && (
              <MaterialIcons name="check" size={18} color="#ffffff" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const filterOptions = getFilterOptions();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
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
            <View style={styles.headerTitleContainer}>
              <MaterialIcons name={filterOptions.icon} size={24} color={modernColors.primary} />
              <AppText style={styles.modalTitle}>{filterOptions.title}</AppText>
            </View>
          </View>

          <ScrollView
            style={styles.filterContent}
            showsVerticalScrollIndicator={false}
          >
            {filterOptions.sections.map((section) => {
              if (section.type === 'toggle') {
                return renderToggleFilter(section);
              } else if (section.type === 'selection') {
                return renderSelectionFilter(section);
              } else if (section.type === 'range') {
                return renderRangeFilter(section);
              }
              return null;
            })}
          </ScrollView>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetFilters}
              activeOpacity={0.8}
            >
              <MaterialIcons name="refresh" size={20} color={modernColors.medium} />
              <AppText style={styles.resetButtonText}>بازنشانی</AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={applyFilters}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[modernColors.primary, modernColors.primaryDark]}
                style={styles.applyButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialIcons name="check" size={20} color="#ffffff" />
                <AppText style={styles.applyButtonText}>اعمال فیلتر</AppText>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={[styles.modalSafeArea, { height: SAFE_AREA_BOTTOM }]} />
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const rangeStyles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  valuesDisplay: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  valueBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.3)',
    minWidth: 120,
  },
  valueLabel: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.medium,
    marginBottom: 4,
  },
  valueText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.primary,
    textAlign: 'center',
  },
  sliderContainer: {
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  sliderTrack: {
    height: 40,
    position: 'relative',
    justifyContent: 'center',
  },
  trackBackground: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
  },
  trackActive: {
    position: 'absolute',
    height: 6,
    backgroundColor: modernColors.primary,
    borderRadius: 3,
    top: 17, // Center vertically
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    top: 8, // Center vertically
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderColor: modernColors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  rangeLabel: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#666',
  },
});

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
    height: '80%',
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
  filterContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  filterSection: {
    marginBottom: 25,
  },
  filterSectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.dark,
    marginRight: 8,
  },
  toggleContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  toggleLabel: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.medium,
    flex: 1,
  },
  rangeContainer: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectionContainer: {
    gap: 8,
  },
  selectionOption: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedOption: {
    backgroundColor: modernColors.primary,
    borderColor: modernColors.primary,
  },
  selectionOptionText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.medium,
    flex: 1,
  },
  selectedOptionText: {
    color: '#ffffff',
    fontFamily: "Yekan_Bakh_Bold",
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