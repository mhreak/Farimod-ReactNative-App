import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Dimensions } from "react-native";
interface TooltipProps {
  content: string;
  iconSize?: number;
}
const { width } = Dimensions.get('window');

const Tooltip: React.FC<TooltipProps> = ({
  content,
  iconSize = 24,
}) => {
  const [visible, setVisible] = useState(false);

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;
  const translateY = useRef(new Animated.Value(35)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),

        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),

        Animated.spring(scale, {
          toValue: 1,
          tension: 70,
          friction: 8,
          useNativeDriver: true,
        }),

        Animated.spring(translateY, {
          toValue: 0,
          tension: 70,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 170,
          useNativeDriver: true,
        }),

        Animated.timing(contentOpacity, {
          toValue: 0,
          duration: 170,
          useNativeDriver: true,
        }),

        Animated.timing(scale, {
          toValue: 0.92,
          duration: 170,
          useNativeDriver: true,
        }),

        Animated.timing(translateY, {
          toValue: 20,
          duration: 170,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.iconButton}
        onPress={() => setVisible(true)}
      >
        <LinearGradient
          colors={["#10b981", "#059669"]}
          style={styles.gradientButton}
        >
          <Ionicons
            name="information-circle"
            color="#fff"
            size={iconSize}
          />
        </LinearGradient>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        statusBarTranslucent
        animationType="none"
        onRequestClose={() => setVisible(false)}
      >
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: backdropOpacity,
            },
          ]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setVisible(false)}
          />

          <Animated.View
            style={[
              styles.card,
              {
                opacity: contentOpacity,
                transform: [
                  {
                    scale,
                  },
                  {
                    translateY,
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={["#10b981", "#059669"]}
              style={styles.header}
            >
              <View style={styles.headerRow}>
                <Ionicons
                  name="information-circle"
                  color="white"
                  size={32}
                />

                <Text style={styles.title}>
                  راهنما
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setVisible(false)}
              >
                <MaterialIcons
                  name="close"
                  color="white"
                  size={24}
                />
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.body}>
              <Text style={styles.content}>
                {content}
              </Text>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setVisible(false)}
              >
                <LinearGradient
                  colors={["#10b981", "#059669"]}
                  style={styles.button}
                >
                  <MaterialIcons
                    name="check"
                    size={20}
                    color="#fff"
                  />

                  <Text style={styles.buttonText}>
                    متوجه شدم
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
  );
};


const styles = StyleSheet.create({
  iconButton: {
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  gradientButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tooltipContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    maxWidth: width - 40,
    width: '100%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  tooltipHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  tooltipTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'Yekan_Bakh_Bold',
    color: 'white',
    textAlign: 'right',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 24,
  },
  tooltipText: {
    fontSize: 16,
    fontFamily: 'Yekan_Bakh_Regular',
    color: '#374151',
    lineHeight: 28,
    direction: "rtl",
    textAlign: 'justify',
    marginBottom: 24,
  },
  gotItButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  gotItGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  gotItText: {
    fontSize: 16,
    fontFamily: 'Yekan_Bakh_Bold',
    color: 'white',
  },
  decorCircle1: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    top: -30,
    right: -30,
  },
  decorCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    bottom: -20,
    left: -20,
  },
  overlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.45)",
  justifyContent: "center",
  alignItems: "center",
},

card: {
  width: "88%",
  backgroundColor: "#fff",
  borderRadius: 26,
  overflow: "hidden",

  shadowColor: "#000",
  shadowOpacity: 0.25,
  shadowRadius: 20,
  shadowOffset: {
    width: 0,
    height: 8,
  },
  elevation: 18,
},

header: {
  paddingHorizontal: 22,
  paddingVertical: 18,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

headerRow: {
  flexDirection: "row",
  alignItems: "center",
},

title: {
  color: "#fff",
  fontSize: 20,
  fontWeight: "bold",
  marginLeft: 10,
},

body: {
  padding: 24,
},

content: {
  fontSize: 16,
  color: "#555",
  textAlign: "right",
  lineHeight: 28,
},

button: {
  marginTop: 25,
  borderRadius: 16,
  height: 52,
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "row",
},

buttonText: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 16,
  marginLeft: 8,
},



});

export default Tooltip;