import React, { useState, useRef, useMemo } from "react";
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Modal,
  Animated,
  ScrollView,
  TouchableOpacity,
  Platform,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import Text from "./Text";
import defaultStyles from "../config/styles";
import AppButton from "./Button";
import colors from "../config/colors";
import AppText from "./Text";
import { toPersianDigits } from "../utils/converters";

interface IProps {
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  items: { value: string | number; label: string; price?: number; icon?: string }[];
  numberOfColumns?: number;
  onSelectItem: (item: { value: string | number; label: string; price?: number; icon?: string }) => void;
  PickerItemComponent?: React.ReactNode;
  placeholder: string;
  selectedItem?: any;
  selectedItems?: any[]; 
  width?: string;
  error?: string;
  disabled?: boolean;
  onPress?: () => void;
  theme?: 'default' | 'subscription';
  multiSelect?: boolean; 
  onMultiSelectChange?: (items: any[]) => void; 
}

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

const subscriptionColors = {
  primary: "#2ecc71",
  primaryDark: "#27ae60",
  iconBackground: "rgba(46, 204, 113, 0.1)",
  selectedIconBackground: "rgba(255, 255, 255, 0.2)",
};

const AppPicker: React.FC<IProps> = ({
  icon,
  items,
  numberOfColumns = 1,
  onSelectItem,
  PickerItemComponent,
  placeholder,
  selectedItem,
  selectedItems = [],
  width = "100%",
  error,
  disabled = false,
  onPress,
  theme = 'default',
  multiSelect = false,
  onMultiSelectChange,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempSelectedItem, setTempSelectedItem] = useState(selectedItem);
  const [tempSelectedItems, setTempSelectedItems] = useState<any[]>(selectedItems);
  const { height: screenHeight } = useWindowDimensions();

  const modalSlideAnim = useRef(new Animated.Value(300)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;

  const modalHeight = useMemo(() => {
    const baseHeight = Math.min(screenHeight * 0.9, 760);
    const contentHeight = items.length > 10 ? Math.min(screenHeight * 0.96, 820) : baseHeight;
    return Math.max(320, Math.min(contentHeight, 820));
  }, [screenHeight, items.length]);

  const SAFE_AREA_BOTTOM = Platform.select({
    ios: screenHeight > 736 ? 24 : 8,
    android: 8,
    default: 8,
  });

  const getThemeColors = () => {
    if (theme === 'subscription') {
      return {
        primary: subscriptionColors.primary,
        primaryDark: subscriptionColors.primaryDark,
        iconBackground: subscriptionColors.iconBackground,
        selectedIconBackground: subscriptionColors.selectedIconBackground,
      };
    }
    return {
      primary: modernColors.primary,
      primaryDark: modernColors.primaryDark,
      iconBackground: `rgba(102, 126, 234, 0.1)`,
      selectedIconBackground: 'rgba(255, 255, 255, 0.2)',
    };
  };

  const themeColors = getThemeColors();

  const openModal = () => {
    if (disabled) return;

    if (onPress) {
      onPress();
      return;
    }

    setModalVisible(true);
    setTempSelectedItem(selectedItem);
    setTempSelectedItems([...selectedItems]);

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
  };

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
      setModalVisible(false);
    });
  };

  const handleConfirm = () => {
    if (multiSelect) {
      if (onMultiSelectChange) {
        onMultiSelectChange(tempSelectedItems);
      }
    } else {
      if (tempSelectedItem) {
        onSelectItem(tempSelectedItem);
      }
    }
    closeModal();
  };

  const handleItemSelect = (item: { value: string | number; label: string; price?: number; icon?: string }) => {
    if (multiSelect) {
      const isSelected = tempSelectedItems.some(selected => selected.value === item.value);
      if (isSelected) {
        setTempSelectedItems(tempSelectedItems.filter(selected => selected.value !== item.value));
      } else {
        setTempSelectedItems([...tempSelectedItems, item]);
      }
    } else {
      setTempSelectedItem(item);
    }
  };

  const clearSelection = () => {
    if (multiSelect) {
      setTempSelectedItems([]);
    } else {
      setTempSelectedItem(null);
    }
  };

  const isItemSelected = (item: any) => {
    if (multiSelect) {
      return tempSelectedItems.some(selected => selected.value === item.value);
    } else {
      return tempSelectedItem && tempSelectedItem.value === item.value;
    }
  };

  const getDisplayText = () => {
    if (multiSelect) {
      if (selectedItems.length === 0) {
        return placeholder;
      } else if (selectedItems.length === 1) {
        return selectedItems[0].label;
      } else {
        const labels = selectedItems.map(item => item.label).join('، ');
        if (labels.length > 40) { 
          return `${selectedItems.length} مورد انتخاب شده`;
        }
        return labels;
      }
    } else {
      return selectedItem?.label || placeholder;
    }
  };

  const isSelected = () => {
    if (multiSelect) {
      return selectedItems.length > 0;
    } else {
      return selectedItem && selectedItem.label;
    }
  };

  return (
    <>
      <View >
        <TouchableWithoutFeedback onPress={openModal}>
          <View style={[
            styles.container,
            { width: width as any },
            disabled && styles.disabledContainer
          ]}>
            {icon && (
              <MaterialIcons
                name={icon}
                size={20}
                color={disabled ? colors.light : "#6e6e6e"}
                style={styles.icon}
              />
            )}

            <Text style={[
              isSelected() ? styles.text : styles.placeholder,
              disabled && (isSelected() ? styles.disabledText : styles.disabledPlaceholder)
            ]}>
              {getDisplayText()}
            </Text>

            <MaterialIcons
              name="arrow-drop-down"
              size={20}
              color={disabled ? colors.light : "#2c3e50"}
            />
          </View>
        </TouchableWithoutFeedback>
        {error && <AppText style={styles.errorText}>{error}</AppText>}
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
        statusBarTranslucent={Platform.OS === 'android'}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                height: modalHeight,
                transform: [{ translateY: modalSlideAnim }],
                opacity: modalOpacityAnim,
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
              <View style={styles.headerRow}>
                <View style={styles.headerTitleContainer}>
                  <MaterialIcons name={icon} size={24} color={themeColors.primary} />
                  <AppText style={styles.modalTitle}>
                    {placeholder}

                  </AppText>
                </View>

                {/* دکمه پاک کردن همه انتخاب‌ها */}
                {multiSelect && tempSelectedItems.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearAllButton}
                    onPress={clearSelection}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="clear-all" size={18} color={modernColors.medium} />
                    <AppText style={styles.clearAllButtonText}>پاک کردن همه</AppText>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.itemsContainer}>
              <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
              >
                {items.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.selectionOption,
                      isItemSelected(item) && [
                        styles.selectedOption,
                        { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
                      ],
                    ]}
                    onPress={() => handleItemSelect(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionContent}>
                      <View style={styles.optionLeft}>
                        {item.icon && (
                          <View style={[
                            styles.optionIconContainer,
                            { backgroundColor: themeColors.iconBackground },
                            isItemSelected(item) && {
                              backgroundColor: themeColors.selectedIconBackground
                            }
                          ]}>
                            <MaterialIcons
                              name={item.icon as any}
                              size={20}
                              color={isItemSelected(item) ? "#ffffff" : themeColors.primary}
                            />
                          </View>
                        )}
                        <View style={styles.optionTextContainer}>
                          <AppText style={[
                            styles.selectionOptionText,
                            isItemSelected(item) && styles.selectedOptionText,
                          ]}>
                            {item.label}
                          </AppText>
                          {item.price !== undefined && (
                            <AppText style={[
                              styles.priceText,
                              isItemSelected(item) && styles.selectedPriceText,
                            ]}>
                              {toPersianDigits(item.price.toString())} تومان
                            </AppText>
                          )}
                        </View>
                      </View>

                      {isItemSelected(item) && (
                        <View style={styles.checkmarkContainer}>
                          <MaterialIcons name="check" size={18} color="#ffffff" />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={[styles.actionButtons, { paddingBottom: Platform.OS === 'ios' ? 18 + SAFE_AREA_BOTTOM : 18 }]}>
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
                onPress={handleConfirm}
                activeOpacity={0.8}
                disabled={multiSelect ? tempSelectedItems.length === 0 : !tempSelectedItem}
              >
                <LinearGradient
                  colors={
                    (multiSelect ? tempSelectedItems.length > 0 : tempSelectedItem)
                      ? [themeColors.primary, themeColors.primaryDark]
                      : ['#9ca3af', '#6b7280']
                  }
                  style={styles.applyButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialIcons name="check" size={20} color="#ffffff" />
                  <AppText style={styles.applyButtonText}>
                    {multiSelect ? 'تأیید انتخاب‌ها' : 'تأیید انتخاب'}
                  </AppText>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={[styles.modalSafeArea, { height: SAFE_AREA_BOTTOM }]} />
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: defaultStyles.colors.white,
    borderRadius: 16,
    flexDirection: "row-reverse",
    padding: 15,
    borderColor: "#6e6e6e",
    borderWidth: 0.5,
    shadowColor: 'rgba(44, 62, 80, 0.3)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledContainer: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  icon: {
    marginLeft: 10,
    marginVertical: "auto",
    marginRight: -3,
  },
  placeholder: {
    color: "#6e6e6e",
    flex: 1,
    fontSize: 16,
    textAlign: 'right',
    fontFamily: "Yekan_Bakh_Bold",
  },
  disabledPlaceholder: {
    color: colors.light,
  },
  text: {
    flex: 1,
    fontSize: 15,
    color: colors.dark,
    fontFamily: "Yekan_Bakh_Regular",
    textAlign: 'right',
  },
  disabledText: {
    color: colors.light,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 5,
    textAlign: "right",
    marginRight: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    width: '100%',
    maxHeight: '95%',
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
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Yekan_Bakh_ExtraBold",
    color: "#1F2937",
    marginRight: 8,
  },
  selectedCount: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.primary,
  },
  clearAllButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  clearAllButtonText: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.medium,
    marginRight: 4,
  },
  itemsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    minHeight: 0,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 8,
    paddingBottom: 12,
  },
  selectionOption: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    marginVertical: 6,
  },
  selectedOption: {
    backgroundColor: modernColors.primary,
    borderColor: modernColors.primary,
  },
  optionContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLeft: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `rgba(102, 126, 234, 0.1)`,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  selectedIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  optionTextContainer: {
    flex: 1,
  },
  selectionOptionText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.dark,
    marginBottom: 4,
  },
  selectedOptionText: {
    color: '#ffffff',
  },
  priceText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#9ca3af',
  },
  selectedPriceText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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

export default AppPicker;