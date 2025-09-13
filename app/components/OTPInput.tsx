import React, { useState, useRef } from 'react';
import { View, TextInput, StyleSheet, Dimensions, Platform } from 'react-native';
import colors from '../config/colors';

// دریافت ابعاد صفحه نمایش
const { width: screenWidth } = Dimensions.get('window');

// توابع تبدیل اعداد
const toEnglishDigits = (str) => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  let result = str;
  for (let i = 0; i < persianNumbers.length; i++) {
    result = result.replace(new RegExp(persianNumbers[i], 'g'), englishNumbers[i]);
  }
  return result;
};

const toPersianDigits = (str) => {
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

  let result = str;
  for (let i = 0; i < englishNumbers.length; i++) {
    result = result.replace(new RegExp(englishNumbers[i], 'g'), persianNumbers[i]);
  }
  return result;
};

const OTPInput = ({ onCodeChange, code, length = 5 }) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputsRef = useRef([]);

  // محاسبه responsive با ضریب امنیت بیشتر
  const getResponsiveDimensions = () => {
    // حاشیه‌های container
    const containerPadding = 20;
    const safeMargin = 30; // حاشیه امنیت

    // عرض قابل استفاده
    const availableWidth = screenWidth - (2 * containerPadding) - safeMargin;

    // تعیین اندازه بر اساس سایز صفحه
    let baseInputSize, gap;

    if (screenWidth < 350) {
      // گوشی‌های خیلی کوچک
      baseInputSize = 40;
      gap = 3;
    } else if (screenWidth < 400) {
      // گوشی‌های کوچک
      baseInputSize = 45;
      gap = 4;
    } else if (screenWidth < 450) {
      // گوشی‌های متوسط
      baseInputSize = 50;
      gap = 5;
    } else {
      // گوشی‌های بزرگ
      baseInputSize = 55;
      gap = 6;
    }

    // محاسبه فضای مورد نیاز
    const totalGapWidth = (length - 1) * gap;
    const totalInputWidth = length * baseInputSize;
    const totalNeededWidth = totalInputWidth + totalGapWidth;

    // اگر فضای مورد نیاز بیشتر از فضای موجود است
    if (totalNeededWidth > availableWidth) {
      // کاهش سایز اینپوت
      baseInputSize = Math.floor((availableWidth - totalGapWidth) / length);
      // کاهش gap اگر هنوز جا نمی‌شه
      if (baseInputSize < 30) {
        gap = Math.max(1, Math.floor((availableWidth - (length * 30)) / (length - 1)));
        baseInputSize = Math.floor((availableWidth - ((length - 1) * gap)) / length);
      }
    }

    return {
      inputSize: Math.max(baseInputSize, 30), // حداقل سایز
      gap: Math.max(gap, 1), // حداقل فاصله
      fontSize: Math.floor(baseInputSize * 0.35), // کاهش سایز فونت
      containerPadding
    };
  };

  const { inputSize, gap, fontSize, containerPadding } = getResponsiveDimensions();

  const handleTextChange = (text, index) => {
    // تبدیل اعداد فارسی به انگلیسی برای پردازش
    const englishText = toEnglishDigits(text);

    // فقط اعداد مجاز هستند
    const sanitizedText = englishText.replace(/[^0-9]/g, '');

    if (sanitizedText.length <= 1) {
      const newCode = code.split('');
      while (newCode.length < length) {
        newCode.push('');
      }
      newCode[index] = sanitizedText;
      const updatedCode = newCode.join('');
      onCodeChange(updatedCode);

      // انتقال به فیلد بعدی
      if (sanitizedText && index < length - 1) {
        inputsRef.current[index + 1]?.focus();
        setFocusedIndex(index + 1);
      }
    }
  };

  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === 'Backspace') {
      if (!code[index] && index > 0) {
        // اگر فیلد خالی است، به فیلد قبلی برو و آن را پاک کن
        const newCode = code.split('');
        newCode[index - 1] = '';
        onCodeChange(newCode.join(''));
        inputsRef.current[index - 1]?.focus();
        setFocusedIndex(index - 1);
      } else {
        // فیلد فعلی را پاک کن
        const newCode = code.split('');
        newCode[index] = '';
        onCodeChange(newCode.join(''));
      }
    }
  };

  const handleFocus = (index) => {
    setFocusedIndex(index);
  };

  const handleBlur = () => {
    setFocusedIndex(-1);
  };

  return (
    <View style={[styles.container, { paddingHorizontal: containerPadding }]}>
      <View style={styles.inputsWrapper}>
        {Array.from({ length }).map((_, index) => (
          <TextInput
            key={index}
            ref={(el) => (inputsRef.current[index] = el)}
            style={[
              styles.input,
              {
                width: inputSize,
                height: inputSize,
                fontSize: fontSize,
                lineHeight: Platform.OS === 'android' ? fontSize * 1.2 : fontSize, // تنظیم بهتر lineHeight
                marginRight: index < length - 1 ? gap : 0,
              },
              focusedIndex === index && styles.focusedInput,
              code[index] && styles.filledInput,
            ]}
            value={code[index] ? toPersianDigits(code[index]) : ''}
            onChangeText={(text) => handleTextChange(text, index)}
            onKeyPress={(event) => handleKeyPress(event, index)}
            onFocus={() => handleFocus(index)}
            onBlur={handleBlur}
            keyboardType="numeric"
            maxLength={1}
            textAlign="center"
            selectTextOnFocus
            blurOnSubmit={false}
            // بهبود دسترسی
            accessibilityLabel={`فیلد کد تأیید ${toPersianDigits((index + 1).toString())}`}
            accessibilityHint="یک رقم وارد کنید"
            // جلوگیری از پیشنهاد متن
            autoComplete="off"
            autoCorrect={false}
            spellCheck={false}
            // بهبود تجربه کاربری
            returnKeyType={index === length - 1 ? 'done' : 'next'}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  input: {
    borderWidth: 2,
    borderColor: 'rgba(255, 206, 232, 0.5)',
    borderRadius: 15,
    fontFamily: 'Yekan_Bakh_Bold',
    color: colors.primary,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    textAlignVertical: 'center',
    includeFontPadding: false,
    paddingTop: 0, // اضافه شده
    paddingBottom: 0, // اضافه شده
    paddingHorizontal: 0, // اضافه شده
    shadowColor: 'rgba(255, 206, 232, 0.4)',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 3,
  },
  focusedInput: {
    borderColor: colors.primary,
    borderWidth: 3,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    transform: [{ scale: 1.05 }],
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
  filledInput: {
    backgroundColor: 'rgba(255, 206, 232, 0.25)',
    borderColor: colors.primary,
    borderWidth: 2,
  },
});

export default OTPInput;