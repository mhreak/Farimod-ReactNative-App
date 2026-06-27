import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AppText from "./Text";
import SimpleDatePicker from "./SimpleDatePicker";
import colors from "../config/colors";


const gregorianToPersian = (gregorianDate) => {
  if (!gregorianDate) return null;

  const gDate = new Date(gregorianDate);

  let gy = gDate.getUTCFullYear();
  let gm = gDate.getUTCMonth() + 1;
  let gd = gDate.getUTCDate();

  console.log('🔄 gregorianToPersian - ورودی:', gregorianDate);
  console.log('🔄 gregorianToPersian - UTC Components:', { gy, gm, gd });

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

  console.log('🔄 gregorianToPersian - نتیجه شمسی:', [jy, jm, jd]);
  return [jy, jm, jd];
};

const persianToGregorian = (jy, jm, jd) => {
  console.log('🔄 ورودی persianToGregorian:', { jy, jm, jd });

  let gy, gm, gd;

  let jy2 = (jy > 979) ? 1600 : 621;
  jy -= (jy > 979) ? 979 : 0;

  let days = (365 * jy) + (Math.floor(jy / 33) * 8) + Math.floor(((jy % 33) + 3) / 4) + 78 + jd;

  if (jm < 7) {
    days += (jm - 1) * 31;
  } else {
    days += (jm - 7) * 30 + 186;
  }

  gy = 400 * Math.floor(days / 146097);
  days %= 146097;

  let flag = true;
  if (days >= 36525) {
    days--;
    gy += 100 * Math.floor(days / 36524);
    days %= 36524;
    if (days >= 365) days++;
    else flag = false;
  }

  if (flag) {
    gy += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days >= 366) {
      flag = false;
      days--;
      gy += Math.floor(days / 365);
      days = days % 365;
    }
  }

  gy += jy2;

  const sal_a = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  gm = 0;
  while (gm < 13 && days > sal_a[gm]) {
    days -= sal_a[gm];
    gm++;
  }

  gd = days;

  console.log('🔄 خروجی میلادی:', { gy, gm, gd });

  const gregorianDate = new Date(Date.UTC(gy, gm - 1, gd, 12, 0, 0, 0));

  gregorianDate._fromPersianPicker = true;

  console.log('🔄 Date Object ساخته شده:', gregorianDate.toISOString());

  return gregorianDate;
};

const toFarsiDigits = (str) => {
  if (!str) return "";
  return str.toString().replace(/[0-9]/g, function (w) {
    const persian = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return persian[w];
  });
};

const formatPersianDate = (persianDate) => {
  if (!persianDate || persianDate.length !== 3) return "";

  const [year, month, day] = persianDate;

  const formattedDay = day < 10 ? `0${day}` : `${day}`;
  const formattedMonth = month < 10 ? `0${month}` : `${month}`;

  return `${toFarsiDigits(year)}/${toFarsiDigits(formattedMonth)}/${toFarsiDigits(formattedDay)}`;
};

interface AppDatePickerProps {
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  placeholder: string;
  value: Date | null;
  onDateChange: (date: Date) => void;
  mode?: "date" | "time";
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
  error?: string;
}

const AppDatePicker: React.FC<AppDatePickerProps> = ({
  icon,
  placeholder,
  value,
  onDateChange,
  mode = "date",
  minimumDate,
  maximumDate,
  disabled = false,
  error,
}) => {
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [selectedPersianDate, setSelectedPersianDate] = useState(null);

  const persianDate = value
    ? (value._fromPersianPicker && selectedPersianDate
      ? selectedPersianDate
      : gregorianToPersian(value))
    : null;

  const displayText = persianDate ? formatPersianDate(persianDate) : "";

  const handleConfirm = (newPersianDate) => {
    console.log('📅 تاریخ شمسی انتخاب شده:', newPersianDate);

    setSelectedPersianDate(newPersianDate);

    const [year, month, day] = newPersianDate;
    const gregorianDate = persianToGregorian(year, month, day);

    console.log('📅 تاریخ میلادی تبدیل شده:', gregorianDate);
    onDateChange(gregorianDate);
    setPickerVisible(false);
  };

  const handlePress = () => {
    if (!disabled) {
      setPickerVisible(true);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
        style={styles.touchableWrapper}
      >
        <View
          style={[
            styles.container,
            disabled && styles.disabledContainer,
          ]}
        >
          {icon && (
            <MaterialIcons
              name={icon}
              size={20}
              color={disabled ? colors.light : "#666666"}
              style={styles.icon}
            />
          )}
          {displayText ? (
            <AppText
              style={[
                styles.text,
                disabled && styles.disabledText,
              ]}
            >
              {displayText}
            </AppText>
          ) : (
            <AppText
              style={[
                styles.placeholder,
                disabled && styles.disabledPlaceholder,
              ]}
            >
              {placeholder}
            </AppText>
          )}

          <MaterialIcons
            name="calendar-today"
            size={20}
            color={disabled ? colors.light : "#666666"}
          />
        </View>
        {error && <AppText style={styles.errorText}>{error}</AppText>}
      </TouchableOpacity>

      <SimpleDatePicker
        isVisible={isPickerVisible}
        onClose={() => setPickerVisible(false)}
        onConfirm={handleConfirm}
        initialDate={persianDate}
      />
    </>
  );
};

const styles = StyleSheet.create({
  touchableWrapper: {
    marginBottom: 16,
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    flexDirection: "row-reverse",
    padding: 15,
    borderColor: "#ccc",
    borderWidth: 1,
    shadowColor: "rgba(16, 185, 129, 0.3)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  disabledContainer: {
    backgroundColor: "#f5f5f5",
    opacity: 0.6,
  },
  icon: {
    marginLeft: 10,
    marginRight: -3,
  },
  placeholder: {
    color: "#666666",
    flex: 1,
    fontSize: 16,
    textAlign: "right",
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
    textAlign: "right",
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
});

export default AppDatePicker;