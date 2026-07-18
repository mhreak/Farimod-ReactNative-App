import React, { useEffect, useRef, useCallback } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  Text,
  Platform,
  Pressable,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import colors from "../config/colors";

export const getFontFamily = (baseFont: string, weight: string): string => {
  if (Platform.OS === "android") {
    switch (weight) {
      case "700":
      case "bold":
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

const PERSIAN = "۰۱۲۳۴۵۶۷۸۹";
const ENGLISH = "0123456789";

const toPersianDigits = (input: string | number | null | undefined): string => {
  if (input === null || input === undefined) return "";
  return input.toString().replace(/[0-9]/g, (m) => PERSIAN[+m]);
};

const toEnglishDigits = (input: string | null | undefined): string => {
  if (input === null || input === undefined) return "";
  return input.toString().replace(/[۰-۹]/g, (m) => ENGLISH[PERSIAN.indexOf(m)]);
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
  error?: string;
  [key: string]: any;
}

const AppTextInput: React.FC<AppTextInputProps> = ({
  icon,
  width = "100%",
  height,
  label,
  inputId = "",
  onChangeInput,
  value = "",
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
  const inputRef = useRef<TextInput>(null);

  const lastValueRef = useRef<string>("");

  useEffect(() => {
    const persianValue = toPersianDigits(value);
    if (value !== undefined && toEnglishDigits(lastValueRef.current) !== toEnglishDigits(value)) {
      lastValueRef.current = persianValue;
      inputRef.current?.setNativeProps({ text: persianValue });
    }
  }, [value]);

  const handleTextChange = useCallback(
    (text: string) => {
      const englishText = toEnglishDigits(text);
      const persianText = toPersianDigits(text);

      lastValueRef.current = persianText;

      if (onChangeInput && inputId) {
        onChangeInput(inputId, englishText);
      }
      if (onChangeText) {
        onChangeText(englishText);
      }
    },
    [onChangeInput, inputId, onChangeText]
  );

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const displayPlaceholder = placeholder ? toPersianDigits(placeholder) : "";

  return (
    <View style={[styles.inputContainer, width ? { width } : undefined, containerStyle]}>
      {label && <Text style={[styles.inputLabel, labelStyle]}>{label}</Text>}

      <Pressable
        onPress={focusInput}
        style={[
          styles.textInputContainer,
          inputContainerStyle,
          isLargeInput ? { height, alignItems: "flex-start" } : undefined,
        ]}
      >
        {icon && (
          <MaterialIcons
            name={icon as any}
            size={20}
            color={colors.medium}
            style={[styles.icon, isLargeInput ? { marginTop: 12 } : undefined]}
          />
        )}
        <TextInput
          ref={inputRef}
          defaultValue={toPersianDigits(value)}
          onChangeText={handleTextChange}
          placeholder={displayPlaceholder}
          placeholderTextColor={colors.darkGray}
          textAlign="right"
          writingDirection="rtl"
          autoCapitalize="none"
          spellCheck={false}
          autoCorrect={false}
          allowFontScaling={false}
          style={[
            styles.textInput,
            style,
            isLargeInput ? { textAlignVertical: "top" } : undefined,
            height && !isLargeInput ? { height } : undefined,
          ]}
          multiline={isLargeInput}
          {...otherProps}
        />
      </Pressable>

      {error && <Text style={styles.errorText}>{error}</Text>}
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
    borderRadius: 16,
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
    color: colors.danger,
    fontSize: 12,
    marginTop: 5,
    textAlign: "right",
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
  },
});

export default AppTextInput;