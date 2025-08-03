import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../config/colors';


const { width } = Dimensions.get('window');

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onHide: () => void;
}

const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onHide,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
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
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: colors.success,
          icon: 'check-circle',
          color: '#fff',
        };
      case 'error':
        return {
          backgroundColor: colors.danger,
          icon: 'error',
          color: '#fff',
        };
      case 'warning':
        return {
          backgroundColor: colors.warning,
          icon: 'warning',
          color: '#fff',
        };
      default:
        return {
          backgroundColor: colors.info,
          icon: 'info',
          color: '#fff',
        };
    }
  };

  const config = getToastConfig();

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: config.backgroundColor,
        },
      ]}
    >
      <MaterialIcons
        name={config.icon}
        size={24}
        color={config.color}
        style={styles.icon}
      />
      <Text style={[styles.message, { color: config.color }]} numberOfLines={2}>
        {message}
      </Text>
      <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
        <MaterialIcons name="close" size={20} color={config.color} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  icon: {
    marginLeft: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    textAlign: 'right',
  },
  closeButton: {
    marginRight: 8,
    padding: 4,
  },
});

export default Toast;