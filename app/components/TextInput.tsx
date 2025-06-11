import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  Text,
  Platform,
  I18nManager,
  Keyboard,
  KeyboardEvent,
  EmitterSubscription,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import colors from "../config/colors";

// تابع انتخاب فونت مناسب
const getFontFamily = (baseFont: string, weight: string): string => {
  if (Platform.OS === "android") {
    switch (weight) {
      case "700":
      case "bold":
        return "Yekan_Bakh_Bold";
      case "500":
      case "600":
      case "semi-bold":
        return "Yekan_Bakh_Bold";
      default:
        return "Yekan_Bakh_Regular";
    }
  }
  return baseFont;
};

/**
 * تبدیل اعداد انگلیسی به فارسی
 * این تابع تمام اعداد انگلیسی در رشته ورودی را به معادل فارسی آن‌ها تبدیل می‌کند
 * اعداد فارسی موجود در رشته بدون تغییر باقی می‌مانند
 */
const toPersianDigits = (input: string | number | null | undefined): string => {
  if (input === null || input === undefined) return "";

  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  const englishDigits = "0123456789";

  return input.toString().replace(/[0-9]/g, (match) => {
    return persianDigits[englishDigits.indexOf(match)];
  });
};

/**
 * تبدیل اعداد فارسی به انگلیسی
 * این تابع تمام اعداد فارسی در رشته ورودی را به معادل انگلیسی آن‌ها تبدیل می‌کند
 * اعداد انگلیسی موجود در رشته بدون تغییر باقی می‌مانند
 */
const toEnglishDigits = (input: string | null | undefined): string => {
  if (input === null || input === undefined) return "";

  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  const englishDigits = "0123456789";

  return input.toString().replace(/[۰-۹]/g, (match) => {
    return englishDigits[persianDigits.indexOf(match)];
  });
};

interface AppTextInputProps extends TextInputProps {
  icon?: React.ComponentProps<typeof MaterialIcons>["name"];
  width?: string | number;
  height?: string | number;
  label?: string;
  inputId?: string;
  onChangeInput?: (id: string, value: string) => void;
  value?: string;
  style?: any;
  containerStyle?: any;
  inputContainerStyle?: any;
  labelStyle?: any;
  isLargeInput?: boolean;
  error?: string; // Add error prop
  [key: string]: any; // Allow other props (e.g., multiline, numberOfLines)
}

const AppTextInput: React.FC<AppTextInputProps> = ({
  icon,
  width = "100%",
  height,
  label,
  inputId = "",
  onChangeInput,
  value,
  placeholder = "",
  style,
  containerStyle,
  inputContainerStyle,
  labelStyle,
  isLargeInput = false,
  onChangeText,
  error,
  ...otherProps
}) => {
  const [inputRef, setInputRef] = useState<TextInput | null>(null);
  // حالت داخلی برای نگهداری نسخه فارسی متن نمایشی
  const [displayText, setDisplayText] = useState<string>(
    value ? toPersianDigits(value) : ""
  );

  // استفاده از حالت داخلی برای نمایش متن فارسی
  // و به‌روزرسانی آن هنگامی که value از بیرون تغییر می‌کند
  useEffect(() => {
    if (value !== undefined) {
      setDisplayText(toPersianDigits(value));
    }
  }, [value]);

  // تبدیل پلیس‌هولدر به فارسی
  const displayPlaceholder = placeholder ? toPersianDigits(placeholder) : "";

  // تابع برای مدیریت تغییر متن
  const handleTextChange = (text: string) => {
    // ورودی کاربر می‌تواند شامل ترکیبی از اعداد فارسی و انگلیسی باشد

    // ابتدا متن را به صورت انگلیسی برای ذخیره‌سازی آماده می‌کنیم
    const englishText = toEnglishDigits(text);

    // سپس متن انگلیسی را به فارسی تبدیل می‌کنیم برای نمایش در TextInput
    const persianText = toPersianDigits(englishText);

    // به‌روزرسانی حالت داخلی برای نمایش متن فارسی
    setDisplayText(persianText);

    // انتقال مقدار اصلی (انگلیسی) به callback
    if (onChangeInput && inputId) {
      onChangeInput(inputId, englishText);
    }

    if (onChangeText) {
      onChangeText(englishText);
    }
  };

  // تابع برای فعال کردن اینپوت با کلیک
  const handleContainerPress = () => {
    if (inputRef) {
      inputRef.focus();
    }
  };

  return (
    <View
      style={[
        styles.inputContainer,
        width ? { width } : undefined,
        containerStyle,
      ]}
    >
      {label && <Text style={[styles.inputLabel, labelStyle]}>{label}</Text>}
      {isLargeInput ? (
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleContainerPress}
          style={[
            styles.textInputContainer,
            inputContainerStyle,
            { height, alignItems: "flex-start" },
          ]}
        >
          {icon && (
            <MaterialIcons
              name={icon as any}
              size={20}
              color={colors.medium}
              style={[styles.icon, { marginTop: 12 }]}
            />
          )}
          <TextInput
            ref={(ref) => setInputRef(ref)}
            style={[styles.textInput, { textAlignVertical: "top" }, style]}
            placeholder={displayPlaceholder}
            placeholderTextColor={colors.darkGray}
            value={displayText}
            onChangeText={handleTextChange}
            multiline={true}
            // تنظیمات مختص راست به چپ
            textAlign="right"
            writingDirection="rtl"
            // تنظیمات سیستمی
            autoCapitalize="none"
            keyboardType="default"
            spellCheck={false}
            autoCorrect={false}
            // ویژگی‌های اضافی برای بهبود نمایش فارسی
            allowFontScaling={false}
            {...otherProps}
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleContainerPress}
          style={[styles.textInputContainer, inputContainerStyle]}
        >
          {icon && (
            <MaterialIcons
              name={icon as any}
              size={20}
              color={colors.medium}
              style={styles.icon}
            />
          )}
          <TextInput
            ref={(ref) => setInputRef(ref)}
            style={[styles.textInput, style, height ? { height } : undefined]}
            placeholder={displayPlaceholder}
            placeholderTextColor={colors.darkGray}
            value={displayText}
            onChangeText={handleTextChange}
            // تنظیمات مختص راست به چپ
            textAlign="right"
            writingDirection="rtl"
            // تنظیمات سیستمی
            autoCapitalize="none"
            keyboardType="default"
            spellCheck={false}
            autoCorrect={false}
            // ویژگی‌های اضافی برای بهبود نمایش فارسی
            allowFontScaling={false}
            {...otherProps}
          />
        </TouchableOpacity>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
      {/* Render error */}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 15,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
    color: colors.dark,
    marginBottom: 8,
    textAlign: "right",
  },
  textInputContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 30,
    backgroundColor: colors.white,
  },
  icon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    padding: 15,
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
    fontSize: 15,
    color: colors.dark,
    textAlign: "right",
    writingDirection: "rtl",
  },
  errorText: {
    /* Added error text style */ color: colors.danger,
    fontSize: 12,
    marginTop: 5,
    textAlign: "right",
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
  },
});

export default AppTextInput;
