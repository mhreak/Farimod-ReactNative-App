import React, { useState, useRef } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import colors from '../config/colors';

const OTPInput = ({ onCodeChange, code, length = 5 }) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputsRef = useRef([]);

  const handleTextChange = (text, index) => {
    const sanitizedText = text.replace(/[^0-9]/g, '');

    if (sanitizedText.length <= 1) {
      const newCode = code.split('');
      while (newCode.length < length) {
        newCode.push('');
      }
      newCode[index] = sanitizedText;
      const updatedCode = newCode.join('');
      onCodeChange(updatedCode);

      // وقتی کاربر عدد زد، برو خانه بعدی
      if (sanitizedText && index < length - 1) {
        inputsRef.current[index + 1]?.focus();
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

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => (
        <View key={index} style={styles.inputContainer}>
          <TextInput
            ref={(el) => (inputsRef.current[index] = el)}
            style={[
              styles.input,
              focusedIndex === index && styles.focusedInput,
              code[index] && styles.filledInput,
            ]}
            value={code[index] || ''}
            onChangeText={(text) => handleTextChange(text, index)}
            onKeyPress={(event) => handleKeyPress(event, index)}
            onFocus={() => handleFocus(index)}
            keyboardType="numeric"
            maxLength={1}
            textAlign="center"
            selectTextOnFocus
            blurOnSubmit={false}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginHorizontal: 5,
  },
  input: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: 'rgba(255, 206, 232, 0.5)',
    borderRadius: 12,
    fontSize: 24,
    fontFamily: 'Yekan_Bakh_Bold',
    color: colors.primary,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',

  },
  focusedInput: {
    borderColor: colors.primary,
    borderWidth: 3,
    backgroundColor: 'rgba(255, 255, 255, 1)',

  },
  filledInput: {
    backgroundColor: 'rgba(255, 206, 232, 0.2)',
    borderColor: colors.primary,
  },
});

export default OTPInput;
