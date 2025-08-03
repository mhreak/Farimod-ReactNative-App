
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../../config/colors";
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 


const { width, height } = Dimensions.get("window");

const WhyFrimodScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    navigation.navigate("CareerScreen");
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={["#667eea", "#c58bff", "#c3b3e7", "#b2afd8"]}
        style={styles.background}
      >
        <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingBottom: insets.bottom + 20 }]}
        >
          <View style={styles.container}>
            <Animated.View
              style={[
                styles.headerContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.titleWrapper}>
                <MaterialCommunityIcons
                  name="star-four-points"
                  size={30}
                  color="white"
                />
                <Text style={styles.headerTitle}>چرا فریمد؟</Text>
                <MaterialCommunityIcons
                  name="star-four-points"
                  size={30}
                  color="white"
                />
              </View>
            </Animated.View>

            <Animated.View
              style={[
                styles.mainCard,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={["rgba(255, 255, 255, 0.95)", "rgba(255, 255, 255, 0.85)"]}
                style={styles.cardGradient}
              >
                <View style={styles.mainIconContainer}>
                  <LinearGradient
                    colors={["#667eea", "#764ba2"]}
                    style={styles.mainIconCircle}
                  >
                    <MaterialCommunityIcons
                      name="account-group"
                      size={40}
                      color="white"
                    />
                  </LinearGradient>
                </View>

                <View style={styles.descriptionContainer}>
                  <Text style={styles.mainDescription}>
                    فریمد اولین پلتفرم معرفی طراحان پارچه و لباس کشور، اساتید و مدرسان حوزه فشن، موسسات و آکادمی‌های آموزشی طراحی لباس و دوخت، برندها و مزون‌ها و اژانس‌های مدلینگ، فروشگاه‌های پارچه و لباس‌فروشی‌ها و خرازی‌ها و فروشندگان ابزارهای طراحی لباس است.
                  </Text>
                </View>

                <View style={styles.featuresContainer}>
                  <FeatureItem
                    icon="account-tie"
                    title="طراحان حرفه‌ای"
                    description="معرفی بهترین طراحان پارچه و لباس"
                  />

                  <FeatureItem
                    icon="school"
                    title="اساتید و مدرسان"
                    description="دسترسی به اساتید برتر حوزه فشن"
                  />

                  <FeatureItem
                    icon="domain"
                    title="آکادمی مد و لباس"
                    description="آموزشگاه‌های تخصصی طراحی و دوخت"
                  />

                  <FeatureItem
                    icon="store"
                    title="برندها و مزون‌ها"
                    description="شبکه‌ای از معتبرترین برندها"
                  />

                  <FeatureItem
                    icon="camera-enhance"
                    title="اژانس‌های مدلینگ"
                    description="ارتباط با اژانس‌های حرفه‌ای"
                  />

                  <FeatureItem
                    icon="shopping"
                    title="فروشگاه‌ها"
                    description="دسترسی به فروشگاه‌های تخصصی"
                  />

                  <FeatureItem
                    icon="brush"
                    title="ابزارها و تجهیزات"
                    description="فروشندگان ابزارهای طراحی"
                  />
                </View>
              </LinearGradient>
            </Animated.View>

            <Animated.View
              style={[
                styles.buttonContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                <LinearGradient
                  colors={["#917be0", "#8f88e7"]}
                  locations={[0, 1]}
                  style={styles.buttonGradient}
                  start={{ x: 1, y: 1 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.buttonText}>ادامه</Text>
                  <MaterialCommunityIcons
                    name="arrow-left"
                    size={20}
                    color="white"
                  />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </LinearGradient>
    </>
  );
};

const FeatureItem = ({ icon, title, description }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIconContainer}>
      <MaterialCommunityIcons name={icon} size={24} color="#667eea" />
    </View>
    <View style={styles.featureTextContainer}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight + 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  titleWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: "Yekan_Bakh_Bold",
    color: "white",
    marginHorizontal: 15,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  mainCard: {
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 20,
    marginBottom: 30,
  },
  cardGradient: {
    padding: 25,
  },
  mainIconContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  mainIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  descriptionContainer: {
    alignItems: "center",
    width: "100%",
  },
  mainDescription: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#333",
    textAlign: "center",

    lineHeight: 26,
    marginBottom: 25,
    width: 300,
  },
  featuresContainer: {
    marginTop: 10,
  },
  featureItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    paddingVertical: 15,
    paddingHorizontal: 13,
    borderRadius: 15,
    marginBottom: 12,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(102, 126, 234, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 13,
  },
  featureTextContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#333",
    marginBottom: 4,
    textAlign: "right",
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#666",
    lineHeight: 20,
    textAlign: "right",
  },
  buttonContainer: {
    alignItems: "center",
  },
  continueButton: {
    width: "80%",
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#917be0",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 30,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: "white",
    marginLeft: 10,
  },
});
export default WhyFrimodScreen;