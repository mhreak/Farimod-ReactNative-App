import React, { useState, useRef } from 'react';
import { View, TextInput, StyleSheet, Dimensions, Platform } from 'react-native';
import colors from '../config/colors';

const { width: screenWidth } = Dimensions.get('window');

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

  const getResponsiveDimensions = () => {
    const containerPadding = 20;
    const safeMargin = 30; 

    const availableWidth = screenWidth - (2 * containerPadding) - safeMargin;

    let baseInputSize, gap;

    if (screenWidth < 350) {
      baseInputSize = 40;
      gap = 3;
    } else if (screenWidth < 400) {
      baseInputSize = 45;
      gap = 4;
    } else if (screenWidth < 450) {
      baseInputSize = 50;
      gap = 5;
    } else {
      baseInputSize = 55;
      gap = 6;
    }

    const totalGapWidth = (length - 1) * gap;
    const totalInputWidth = length * baseInputSize;
    const totalNeededWidth = totalInputWidth + totalGapWidth;

    if (totalNeededWidth > availableWidth) {
      baseInputSize = Math.floor((availableWidth - totalGapWidth) / length);
      if (baseInputSize < 30) {
        gap = Math.max(1, Math.floor((availableWidth - (length * 30)) / (length - 1)));
        baseInputSize = Math.floor((availableWidth - ((length - 1) * gap)) / length);
      }
    }

    return {
      inputSize: Math.max(baseInputSize, 30), 
      gap: Math.max(gap, 1), 
      fontSize: Math.floor(baseInputSize * 0.35), 
      containerPadding
    };
  };

  const { inputSize, gap, fontSize, containerPadding } = getResponsiveDimensions();

  const handleTextChange = (text, index) => {
    const englishText = toEnglishDigits(text);

    const sanitizedText = englishText.replace(/[^0-9]/g, '');

    if (sanitizedText.length <= 1) {
      const newCode = code.split('');
      while (newCode.length < length) {
        newCode.push('');
      }
      newCode[index] = sanitizedText;
      const updatedCode = newCode.join('');
      onCodeChange(updatedCode);

      if (sanitizedText && index < length - 1) {
        inputsRef.current[index + 1]?.focus();
        setFocusedIndex(index + 1);
      }
    }
  };

  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === 'Backspace') {
      if (!code[index] && index > 0) {
        const newCode = code.split('');
        newCode[index - 1] = '';
        onCodeChange(newCode.join(''));
        inputsRef.current[index - 1]?.focus();
        setFocusedIndex(index - 1);
      } else {
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
                lineHeight: Platform.OS === 'android' ? fontSize * 1.2 : fontSize, 
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
            accessibilityLabel={`فیلد کد تأیید ${toPersianDigits((index + 1).toString())}`}
            accessibilityHint="یک رقم وارد کنید"
            autoComplete="off"
            autoCorrect={false}
            spellCheck={false}
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
    paddingTop: 0, 
    paddingBottom: 0, 
    paddingHorizontal: 0, 
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