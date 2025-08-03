import React, { useEffect, useRef, useState } from "react";
import AppText from "../components/Text";
import { StyleSheet, View, TouchableOpacity, Animated, Modal, Dimensions, FlatList } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import AppTextInput from "../components/TextInput";
import colors from "../config/colors";
import { toPersianDigits } from "../utils/converters";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const { height: screenHeight } = Dimensions.get('window');

// Individual Time Wheel Component
const TimeWheel = ({ data, selectedValue, onValueChange, itemHeight = 50 }) => {
  const flatListRef = useRef(null);

  // Find initial index
  const getInitialIndex = () => {
    const index = data.findIndex(item => item === selectedValue);
    return index >= 0 ? index : 0;
  };

  useEffect(() => {
    if (flatListRef.current && selectedValue !== null) {
      const index = getInitialIndex();
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index,
          animated: false,
          viewPosition: 0.5,
        });
      }, 100);
    }
  }, []);

  const onMomentumScrollEnd = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const centerIndex = Math.round(scrollY / itemHeight) - 1; // +2 for padding offset

    if (centerIndex >= 0 && centerIndex < data.length) {
      onValueChange(data[centerIndex]);
    }
  };

  const onScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const centerIndex = Math.round(scrollY / itemHeight) - 1; // +2 for padding offset

    if (centerIndex >= 0 && centerIndex < data.length) {
      onValueChange(data[centerIndex]);
    }
  };

  const renderItem = ({ item, index }) => {
    const isSelected = item === selectedValue;

    return (
      <View style={[styles.wheelItem, { height: itemHeight }]}>
        <AppText style={[
          styles.wheelItemText,
          isSelected && styles.wheelItemTextSelected
        ]}>
          {toPersianDigits(item.toString().padStart(2, '0'))}
        </AppText>
      </View>
    );
  };

  const getItemLayout = (data, index) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index,
  });

  return (
    <View style={styles.wheelContainer}>
      {/* Top gradient overlay */}
      <LinearGradient
        colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0)']}
        style={styles.gradientTop}
        pointerEvents="none"
      />

      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        snapToAlignment="center"
        decelerationRate="fast"
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={getItemLayout}
        contentContainerStyle={{
          paddingTop: itemHeight * 2,
          paddingBottom: itemHeight * 2,
        }}
        style={styles.flatList}
        initialScrollIndex={getInitialIndex()}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: false,
              viewPosition: 0.5,
            });
          }, 500);
        }}
      />

      {/* Center Selection Indicator */}
      <View style={styles.centerSelection} pointerEvents="none">
        <View style={styles.selectionBox} />
      </View>
      {/* Bottom gradient overlay */}
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.9)']}
        style={styles.gradientBottom}
        pointerEvents="none"
      />
    </View>
  );
};

// Main Custom Time Picker Component
const CustomTimePicker = ({ value, onTimeChange, placeholder, icon, style }) => {
  const [showPicker, setShowPicker] = useState(false);
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Generate hour and minute arrays
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  // Parse current time or set default
  const parseTime = (timeString) => {
    if (timeString && timeString.includes(':')) {
      // تبدیل اعداد فارسی به انگلیسی قبل از پارس کردن
      const englishTime = timeString.replace(/[۰-۹]/g, (match) => {
        return String.fromCharCode(
          match.charCodeAt(0) - "۰".charCodeAt(0) + "0".charCodeAt(0)
        );
      });
      const [h, m] = englishTime.split(':');
      return {
        hour: parseInt(h, 10),
        minute: parseInt(m, 10)
      };
    }
    const now = new Date();
    return {
      hour: now.getHours(),
      minute: now.getMinutes()
    };
  };

  const currentTime = parseTime(value);
  const [selectedHour, setSelectedHour] = useState(currentTime.hour);
  const [selectedMinute, setSelectedMinute] = useState(currentTime.minute);

  // Animation functions
  const showDrawer = () => {
    setShowPicker(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideDrawer = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowPicker(false);
    });
  };

  const handleConfirm = () => {
    // ارسال زمان با اعداد فارسی
    const timeString = `${toPersianDigits(selectedHour.toString().padStart(2, '0'))}:${toPersianDigits(selectedMinute.toString().padStart(2, '0'))}`;
    onTimeChange(timeString);
    hideDrawer();
  };

  const handleCancel = () => {
    // Reset to original values
    const originalTime = parseTime(value);
    setSelectedHour(originalTime.hour);
    setSelectedMinute(originalTime.minute);
    hideDrawer();
  };

  const handlePress = () => {
    // Update current selection when opening
    const currentTime = parseTime(value);
    setSelectedHour(currentTime.hour);
    setSelectedMinute(currentTime.minute);
    showDrawer();
  };

  // Reset animation values when component unmounts
  useEffect(() => {
    return () => {
      slideAnim.setValue(screenHeight);
      opacityAnim.setValue(0);
    };
  }, []);

  return (
    <View style={style}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        <View pointerEvents="none">
          <AppTextInput
            value={value || ""}
            placeholder={placeholder}
            icon={icon}
            editable={false}
            style={{ color: value ? colors.dark : colors.medium }}
          />
        </View>
      </TouchableOpacity>

      {/* Custom Time Picker Bottom Drawer */}
      <Modal
        visible={showPicker}
        transparent={true}
        animationType="none"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalContainer}>
          {/* Backdrop */}
          <Animated.View
            style={[
              styles.backdrop,
              { opacity: opacityAnim }
            ]}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              onPress={handleCancel}
              activeOpacity={1}
            />
          </Animated.View>

          {/* Bottom Drawer */}
          <Animated.View
            style={[
              styles.drawer,
              {
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,1)']}
              style={styles.drawerContent}
            >
              {/* Handle */}
              <View style={styles.handle} />

              {/* Header */}
              <View style={styles.drawerHeader}>
                <View style={styles.headerTitleContainer}>
                  <MaterialIcons name="access-time" size={24} color={colors.primary} />
                  <AppText style={styles.drawerTitle}>انتخاب زمان</AppText>
                </View>
                <AppText style={styles.currentTimeText}>
                  {toPersianDigits(selectedHour.toString().padStart(2, '0'))}:{toPersianDigits(selectedMinute.toString().padStart(2, '0'))}
                </AppText>
              </View>

              {/* Custom Time Picker */}
              <View style={styles.timePickerContainer}>
                <View style={styles.timePickerRow}>
                  {/* Hour Picker */}
                  <View style={styles.timeColumn}>
                    <AppText style={styles.columnLabel}>ساعت</AppText>
                    <TimeWheel
                      data={hours}
                      selectedValue={selectedHour}
                      onValueChange={setSelectedHour}
                      itemHeight={50}
                    />
                  </View>

                  {/* Separator */}
                  <View style={styles.timeSeparator}>
                    <AppText style={styles.separatorText}>:</AppText>
                  </View>

                  {/* Minute Picker */}
                  <View style={styles.timeColumn}>
                    <AppText style={styles.columnLabel}>دقیقه</AppText>
                    <TimeWheel
                      data={minutes}
                      selectedValue={selectedMinute}
                      onValueChange={setSelectedMinute}
                      itemHeight={50}
                    />
                  </View>
                </View>
              </View>

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleCancel}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="close" size={20} color={colors.medium} />
                  <AppText style={styles.resetButtonText}>لغو</AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={handleConfirm}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.applyButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <MaterialIcons name="check" size={20} color="#ffffff" />
                    <AppText style={styles.applyButtonText}>تأیید</AppText>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // Bottom Drawer styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    maxHeight: screenHeight * 0.65,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  drawerContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.medium,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 15,
    opacity: 0.3,
  },
  drawerHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitleContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 8,
  },
  drawerTitle: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.primary,
    marginRight: 8,
  },
  currentTimeText: {
    fontSize: 24,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.primary,
    letterSpacing: 2,
  },
  // Custom Time Picker styles
  timePickerContainer: {
    marginBottom: 30,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  timeColumn: {
    flex: 1,
    alignItems: 'center',
  },
  columnLabel: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.primary,
    marginBottom: 10,
  },
  timeSeparator: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separatorText: {
    fontSize: 28,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.primary,
  },
  wheelContainer: {
    height: 150,
    position: 'relative',
    overflow: 'hidden',
  },
  flatList: {
    flex: 1,
  },
  wheelItem: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelItemText: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Regular",
    color: colors.medium,
    opacity: 0.6,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  wheelItemTextSelected: {
    fontSize: 24,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.primary,
    opacity: 1,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  centerSelection: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  selectionBox: {
    width: '100%',
    height: 30,
    borderRadius: 3,
    // backgroundColor: 'rgba(158, 34, 173, 0.15)',
    borderBottomWidth: 2,
    borderColor: colors.primary,
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    zIndex: 2,
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    zIndex: 2,
  },
  // Button styles
  buttonContainer: {
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
    color: colors.medium,
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

export default CustomTimePicker;