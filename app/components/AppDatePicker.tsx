import React, { useState, useRef } from "react";
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
  width?: string;
  error?: string;
  disabled?: boolean;
  onPress?: () => void;
  modalVisible?: boolean;
  onModalClose?: () => void;
}

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

const AppPicker: React.FC<IProps> = ({
  icon,
  items,
  numberOfColumns = 1,
  onSelectItem,
  PickerItemComponent,
  placeholder,
  selectedItem,
  width = "100%",
  error,
  disabled = false,
  onPress,
  modalVisible: externalModalVisible,
  onModalClose,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempSelectedItem, setTempSelectedItem] = useState(selectedItem);

  const modalSlideAnim = useRef(new Animated.Value(300)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (externalModalVisible !== undefined) {
      if (externalModalVisible && !modalVisible) {
        openModalInternal();
      } else if (!externalModalVisible && modalVisible) {
        closeModalInternal();
      }
    }
  }, [externalModalVisible]);

  const openModalInternal = () => {
    setModalVisible(true);
    setTempSelectedItem(selectedItem);

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

  const closeModalInternal = () => {
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
      if (onModalClose) {
        onModalClose();
      }
    });
  };

  const SAFE_AREA_BOTTOM = Platform.select({
    ios: height > 736 ? 34 : 0,
    android: 0,
    default: 0,
  });

  const openModal = () => {
    if (disabled) return;

    if (onPress) {
      onPress();
      return;
    }

    openModalInternal();
  };

  const closeModal = () => {
    closeModalInternal();
  };

  const handleConfirm = () => {
    if (tempSelectedItem) {
      onSelectItem(tempSelectedItem);
    }
    closeModal();
  };

  const handleItemSelect = (item: { value: string | number; label: string; price?: number; icon?: string }) => {
    setTempSelectedItem(item);
  };

  const clearSelection = () => {
    setTempSelectedItem(null);
  };

  return (
    <>
      <View style={{ 
        marginBottom: 16, 
        position: 'absolute',
        opacity: 0,
        pointerEvents: 'none'
      }}>
        <View style={[
          styles.container,
          { width: width as any },
          disabled && styles.disabledContainer
        ]}>
          {icon && (
            <MaterialIcons
              name={icon}
              size={20}
              color={disabled ? colors.light : "#10B981"}
              style={styles.icon}
            />
          )}
          {selectedItem && selectedItem.label ? (
            <Text style={[
              styles.text,
              disabled && styles.disabledText
            ]}>
              {selectedItem.label}
            </Text>
          ) : (
            <Text style={[
              styles.placeholder,
              disabled && styles.disabledPlaceholder
            ]}>
              {placeholder}
            </Text>
          )}

          <MaterialIcons
            name="arrow-drop-down"
            size={20}
            color={disabled ? colors.light : "#10B981"}
          />
        </View>
        {error && <AppText style={styles.errorText}>{error}</AppText>}
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
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
                  <MaterialIcons name={icon} size={24} color={modernColors.primary} />
                  <AppText style={styles.modalTitle}>{placeholder}</AppText>
                </View>
              </View>
            </View>

            <View style={styles.itemsContainer}>
              <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {items.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.selectionOption,
                      tempSelectedItem && tempSelectedItem.value === item.value && styles.selectedOption,
                    ]}
                    onPress={() => handleItemSelect(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionContent}>
                      <View style={styles.optionLeft}>
                        {item.icon && (
                          <View style={[
                            styles.optionIconContainer,
                            tempSelectedItem && tempSelectedItem.value === item.value && styles.selectedIconContainer
                          ]}>
                            <MaterialIcons 
                              name={item.icon as any} 
                              size={20} 
                              color={tempSelectedItem && tempSelectedItem.value === item.value ? "#ffffff" : "#10B981"} 
                            />
                          </View>
                        )}
                        <View style={styles.optionTextContainer}>
                          <AppText style={[
                            styles.selectionOptionText,
                            tempSelectedItem && tempSelectedItem.value === item.value && styles.selectedOptionText,
                          ]}>
                            {item.label}
                          </AppText>
                          {item.price !== undefined && (
                            <AppText style={[
                              styles.priceText,
                              tempSelectedItem && tempSelectedItem.value === item.value && styles.selectedPriceText,
                            ]}>
                              {toPersianDigits(item.price.toString())} تومان
                            </AppText>
                          )}
                        </View>
                      </View>

                      {tempSelectedItem && tempSelectedItem.value === item.value && (
                        <MaterialIcons name="check" size={18} color="#ffffff" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

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
                onPress={handleConfirm}
                activeOpacity={0.8}
                disabled={!tempSelectedItem}
              >
                <LinearGradient
                  colors={tempSelectedItem ? ["#10B981", "#059669"] : ['#9ca3af', '#6b7280']}
                  style={styles.applyButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialIcons name="check" size={20} color="#ffffff" />
                  <AppText style={styles.applyButtonText}>تأیید انتخاب</AppText>
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
    borderColor: "#10B981",
    borderWidth: 2,
    shadowColor: 'rgba(16, 185, 129, 0.3)',
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
    color: "#10B981",
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
  clearButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  clearButtonContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.medium,
    marginRight: 4,
  },
  itemsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 8,
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
    backgroundColor: "#10B981",
    borderColor: "#10B981",
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
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
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