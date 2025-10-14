import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Pressable,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AppText from "./Text";

const { width, height } = Dimensions.get("window");

const toFarsiDigits = (str) => {
  if (!str) return "";
  return str.toString().replace(/[0-9]/g, function (w) {
    const persian = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return persian[w];
  });
};

const persianMonths = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

// تابع تبدیل تاریخ میلادی به شمسی (الگوریتم دقیق کامل)
const gregorianToPersian = (gregorianDate) => {
  const gDate = new Date(gregorianDate);
  let gy = gDate.getFullYear();
  let gm = gDate.getMonth() + 1;
  let gd = gDate.getDate();

  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  
  let jy;
  if (gy > 1600) {
    jy = 979;
    gy -= 1600;
  } else {
    jy = 0;
    gy -= 621;
  }

  const gy2 = (gm > 2) ? (gy + 1) : gy;
  let days = (365 * gy) + (Math.floor((gy2 + 3) / 4)) - (Math.floor((gy2 + 99) / 100)) +
             (Math.floor((gy2 + 399) / 400)) - 80 + gd + g_d_m[gm - 1];

  jy += 33 * Math.floor(days / 12053);
  days %= 12053;

  jy += 4 * Math.floor(days / 1461);
  days %= 1461;

  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  let jm, jd;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }

  return [jy, jm, jd];
};

// دریافت تاریخ امروز به شمسی
const getTodayPersian = () => {
  return gregorianToPersian(new Date());
};



const SimpleDatePicker = ({ isVisible, onClose, onConfirm, initialDate }) => {
  const today = getTodayPersian();

  const [selectedYear, setSelectedYear] = useState(
    initialDate ? initialDate[0] : today[0]
  );
  const [selectedMonth, setSelectedMonth] = useState(
    initialDate ? initialDate[1] : today[1]
  );
  const [selectedDay, setSelectedDay] = useState(
    initialDate ? initialDate[2] : today[2]
  );

  const [tempSelectedYear, setTempSelectedYear] = useState(selectedYear);
  const [tempSelectedMonth, setTempSelectedMonth] = useState(selectedMonth);
  const [tempSelectedDay, setTempSelectedDay] = useState(selectedDay);

  const modalSlideAnim = useRef(new Animated.Value(height)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;

  const [isLayoutReady, setIsLayoutReady] = useState(false);

  // ایجاد محدوده سال‌ها: 10 سال قبل تا 10 سال بعد از امروز
  const currentYear = today[0];
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  const months = Array.from({ length: 12 }, (_, i) => ({
    number: i + 1,
    name: persianMonths[i],
  }));

  // تعداد روزهای هر ماه در تقویم شمسی
  const getDaysInMonth = (month, year) => {
    if (month <= 6) return 31;
    if (month <= 11) return 30;
    const isLeap = ((year - 1) % 33) % 4 === 0;
    return isLeap ? 30 : 29;
  };

  const days = Array.from(
    { length: getDaysInMonth(tempSelectedMonth, tempSelectedYear) },
    (_, i) => i + 1
  );

  // مراجع برای ScrollView ها
  const yearScrollRef = useRef(null);
  const monthScrollRef = useRef(null);
  const dayScrollRef = useRef(null);

  const ITEM_HEIGHT = 50;
  const CONTAINER_HEIGHT = 200;
  const CENTER_OFFSET = (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2;

  const SAFE_AREA_BOTTOM = Platform.select({
    ios: height > 736 ? 34 : 0,
    android: 0,
    default: 0,
  });

  useEffect(() => {
    if (isVisible) {
      setIsLayoutReady(false);
      setTempSelectedYear(selectedYear);
      setTempSelectedMonth(selectedMonth);
      setTempSelectedDay(selectedDay);

      Animated.parallel([
        Animated.spring(modalSlideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(modalOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalSlideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacityAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const scrollToIndex = useCallback((scrollRef, index) => {
    if (scrollRef.current && index >= 0) {
      const yPosition = index * ITEM_HEIGHT;
      scrollRef.current.scrollTo({
        y: yPosition,
        animated: true,
      });
    }
  }, []);

  const performInitialScroll = useCallback(() => {
    if (!isLayoutReady) return;

    const yearIndex = years.findIndex((year) => year === tempSelectedYear);
    if (yearIndex !== -1) {
      scrollToIndex(yearScrollRef, yearIndex);
    }

    const monthIndex = tempSelectedMonth - 1;
    scrollToIndex(monthScrollRef, monthIndex);

    const dayIndex = tempSelectedDay - 1;
    scrollToIndex(dayScrollRef, dayIndex);
  }, [
    isLayoutReady,
    tempSelectedYear,
    tempSelectedMonth,
    tempSelectedDay,
    years,
    scrollToIndex,
  ]);

  useEffect(() => {
    if (isVisible && isLayoutReady) {
      const timer = setTimeout(performInitialScroll, 100);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isLayoutReady, performInitialScroll]);

  useEffect(() => {
    const maxDays = getDaysInMonth(tempSelectedMonth, tempSelectedYear);
    if (tempSelectedDay > maxDays) {
      setTempSelectedDay(maxDays);
    }
  }, [tempSelectedMonth, tempSelectedYear]);

  const handleLayoutReady = useCallback(() => {
    if (!isLayoutReady) {
      setIsLayoutReady(true);
    }
  }, [isLayoutReady]);

  const handleConfirm = () => {
    setSelectedYear(tempSelectedYear);
    setSelectedMonth(tempSelectedMonth);
    setSelectedDay(tempSelectedDay);
    onConfirm([tempSelectedYear, tempSelectedMonth, tempSelectedDay]);
    onClose();
  };

  const handleYearChange = (year) => {
    setTempSelectedYear(year);
    const maxDays = getDaysInMonth(tempSelectedMonth, year);
    if (tempSelectedDay > maxDays) {
      setTempSelectedDay(maxDays);
    }
  };

  const handleMonthChange = (month) => {
    setTempSelectedMonth(month);
    const maxDays = getDaysInMonth(month, tempSelectedYear);
    if (tempSelectedDay > maxDays) {
      setTempSelectedDay(maxDays);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.modalWrapper,
            {
              transform: [{ translateY: modalSlideAnim }],
              opacity: modalOpacityAnim,
            },
          ]}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={styles.modalContent}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
              <View style={styles.headerRow}>
                <View style={styles.headerTitleContainer}>
                  <MaterialIcons
                    name="calendar-today"
                    size={24}
                    color="#8B5CF6"
                  />
                  <AppText style={styles.modalTitle}>انتخاب تاریخ</AppText>
                </View>
              </View>
              <AppText style={styles.todayText}>
                امروز: {toFarsiDigits(today[2])} {persianMonths[today[1] - 1]}{" "}
                {toFarsiDigits(today[0])}
              </AppText>
            </View>

            {/* Date Selectors */}
            <View style={styles.dateSelectorsContainer}>
              <View style={styles.dateSelectors} onLayout={handleLayoutReady}>
                {/* روز */}
                <View style={styles.pickerColumn}>
                  <AppText style={styles.pickerLabel}>روز</AppText>
                  <ScrollView
                    ref={dayScrollRef}
                    style={styles.pickerScroll}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContainer}
                  >
                    {days.map((day) => (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.pickerItem,
                          tempSelectedDay === day && styles.selectedItemBox,
                        ]}
                        onPress={() => setTempSelectedDay(day)}
                        activeOpacity={0.7}
                      >
                        <AppText
                          style={[
                            styles.pickerItemText,
                            tempSelectedDay === day && styles.selectedItemText,
                          ]}
                        >
                          {toFarsiDigits(day)}
                        </AppText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* ماه */}
                <View style={styles.pickerColumn}>
                  <AppText style={styles.pickerLabel}>ماه</AppText>
                  <ScrollView
                    ref={monthScrollRef}
                    style={styles.pickerScroll}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContainer}
                  >
                    {months.map((month) => (
                      <TouchableOpacity
                        key={month.number}
                        style={[
                          styles.pickerItem,
                          tempSelectedMonth === month.number &&
                            styles.selectedItemBox,
                        ]}
                        onPress={() => handleMonthChange(month.number)}
                        activeOpacity={0.7}
                      >
                        <AppText
                          style={[
                            styles.pickerItemText,
                            tempSelectedMonth === month.number &&
                              styles.selectedItemText,
                          ]}
                        >
                          {month.name}
                        </AppText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* سال */}
                <View style={styles.pickerColumn}>
                  <AppText style={styles.pickerLabel}>سال</AppText>
                  <ScrollView
                    ref={yearScrollRef}
                    style={styles.pickerScroll}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContainer}
                  >
                    {years.map((year) => (
                      <TouchableOpacity
                        key={year}
                        style={[
                          styles.pickerItem,
                          tempSelectedYear === year && styles.selectedItemBox,
                        ]}
                        onPress={() => handleYearChange(year)}
                        activeOpacity={0.7}
                      >
                        <AppText
                          style={[
                            styles.pickerItemText,
                            tempSelectedYear === year &&
                              styles.selectedItemText,
                          ]}
                        >
                          {toFarsiDigits(year)}
                        </AppText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <MaterialIcons name="close" size={20} color="#6b7280" />
                <AppText style={styles.resetButtonText}>انصراف</AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleConfirm}
                activeOpacity={0.8}
              >
                <LinearGradient
          
                  colors={["#667eea","#764ba2"]}
                  style={styles.applyButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialIcons name="check" size={20} color="#ffffff" />
                  <AppText style={styles.applyButtonText}>تأیید انتخاب</AppText>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View
              style={[styles.modalSafeArea, { height: SAFE_AREA_BOTTOM }]}
            />
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modalWrapper: {
    width: "100%",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: height * 0.75,
  },
  modalSafeArea: {
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    alignItems: "center",
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
    marginBottom: 15,
  },
  headerRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 8,
  },
  headerTitleContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Yekan_Bakh_ExtraBold",
    color: "#1F2937",
    marginRight: 8,
  },
  todayText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#6B7280",
    textAlign: "center",
  },
  dateSelectorsContainer: {
    position: "relative",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  dateSelectors: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    height: 200,
  },
  pickerColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  pickerLabel: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#8B5CF6",
    textAlign: "center",
    marginBottom: 10,
  },
  pickerScroll: {
    flex: 1,
  },
  scrollContainer: {
    paddingVertical: 75,
  },
  pickerItem: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    marginVertical: 0,
  },
  selectedItemBox: {
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    // borderWidth: 2,
    // // borderColor: "#8B5CF6",
    borderRadius: 12,
  },
  pickerItemText: {
    fontSize: 15,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#9ca3af",
  },
  selectedItemText: {
    color: "#8B5CF6",
    fontFamily: "Yekan_Bakh_ExtraBold",
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: "row-reverse",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#FFFFFF",
  },
  resetButton: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  resetButtonText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#6b7280",
    marginRight: 6,
  },
  applyButton: {
    flex: 2,
  },
  applyButtonGradient: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  applyButtonText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#ffffff",
    marginRight: 6,
  },
});

export default SimpleDatePicker;
