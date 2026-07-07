import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  TextInput,
  TextInput as RNTextInput,
  Platform,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { styles, modernColors } from "../styles/styles";

type EditableTextInputProps = {
  value: string;
  onChangeText?: (text: string) => void;
  onSave: (text: string) => void;
  onCancel: () => void;
  loading?: boolean;
  placeholder?: string;
};

export const EditableTextInput = React.memo(
  ({
    value,
    onChangeText,
    onSave,
    onCancel,
    loading = false,
    placeholder = "متن درباره خود را وارد کنید...",
  }: EditableTextInputProps) => {
    const inputRef = useRef<RNTextInput>(null);
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    useEffect(() => {
      const timeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      return () => clearTimeout(timeout);
    }, []);

    const handleChangeText = useCallback(
      (text: string) => {
        setLocalValue(text);
        onChangeText?.(text);
      },
      [onChangeText]
    );

    const handleSave = useCallback(() => {
      const trimmedValue = localValue.trim();
      onSave(trimmedValue);
    }, [localValue, onSave]);

    const handleCancel = useCallback(() => {
      setLocalValue(value);
      onCancel();
    }, [value, onCancel]);

    return (
      <>
        <TextInput
          ref={inputRef}
          style={styles.inlineTextInput}
          value={localValue}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(0,0,0,0.5)"
          multiline
          textAlign="right"
          textAlignVertical="top"
          blurOnSubmit={false}
          editable={!loading}
          scrollEnabled
          underlineColorAndroid="transparent"
          autoCorrect={false}
          autoCapitalize="none"
          keyboardAppearance="default"
          returnKeyType={Platform.OS === "android" ? "default" : "done"}
        />

        <View style={styles.editButtonsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton, loading && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name="check"
              size={18}
              color={modernColors.surface}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton, loading && { opacity: 0.6 }]}
            onPress={handleCancel}
            disabled={loading}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name="close"
              size={18}
              color={modernColors.surface}
            />
          </TouchableOpacity>
        </View>
      </>
    );
  }
);
