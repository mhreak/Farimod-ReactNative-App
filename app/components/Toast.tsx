import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "../config/colors";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss?: () => void;
}

const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = "error",
  duration = 3000,
  onDismiss,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      // Fade in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onDismiss) onDismiss();
    });
  };

  if (!visible) return null;

  const getIconAndColor = (): {
    icon: React.ComponentProps<typeof MaterialIcons>["name"];
    color: string;
  } => {
    switch (type) {
      case "success":
        return { icon: "check-circle", color: colors.success };
      case "warning":
        return { icon: "warning", color: colors.warning || "#FFC107" };
      case "info":
        return { icon: "info", color: colors.info || "#2196F3" };
      case "error":
      default:
        return { icon: "error", color: colors.danger };
    }
  };

  const { icon, color } = getIconAndColor();

  return (
    <TouchableWithoutFeedback onPress={hideToast}>
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY }],
            backgroundColor: color,
          },
        ]}
      >
        <MaterialIcons name={icon} size={24} color="white" />
        <Text style={styles.message}>{message}</Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50, // Adjust based on your layout
    left: 20,
    right: 20,
    backgroundColor: colors.danger,
    borderRadius: 8,
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    zIndex: 9999,
  },
  message: {
    color: "white",
    fontSize: 15,
    marginRight: 12,
    fontFamily: "Yekan_Bakh_Regular",
    flex: 1,
    textAlign: "right",
  },
});

export default Toast;
