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
  Linking,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../config/colors";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useIntro } from '../contexts/IntroContext';

const { width, height } = Dimensions.get("window");

const EventsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { completeIntro } = useIntro();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleContinue = () => {
    navigation.navigate("CareerScreen");
  };

  const handleGetStarted = async () => {
    try {
      // علامت‌گذاری intro به عنوان کامل شده
      await completeIntro();

      // هدایت به صفحه authentication
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        })
      );
    } catch (error) {
      console.error('Error completing intro:', error);
    }
  };
  const handleRegister = async () => {
    try {
      await completeIntro();

      // هدایت به Auth stack و سپس به Signup screen
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{
            name: 'Auth',
            params: { screen: 'Signup' }
          }],
        })
      );
    } catch (error) {
      console.error('Error completing intro:', error);
    }
  };

  const handleOpenTutorial = async () => {
    const tutorialUrl = 'https://farimod.ir/app-use'; // لینک آموزش - می‌تونی تغییرش بدی

    try {
      const supported = await Linking.canOpenURL(tutorialUrl);
      if (supported) {
        await Linking.openURL(tutorialUrl);
      } else {
        Alert.alert('خطا', 'امکان باز کردن لینک وجود ندارد');
      }
    } catch (error) {
      console.error('Error opening tutorial:', error);
      Alert.alert('خطا', 'مشکلی در باز کردن لینک پیش آمد');
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={["#FF6B9D", "#FFB5D1", "#FFF8FC", "#FFE0EC", "#FF6B9D"]}
        locations={[0, 0.3, 0.6, 0.8, 1]}
        style={styles.background}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContainer, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <Animated.View
              style={[
                styles.headerContainer,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim }
                  ],
                },
              ]}
            >
              <View style={styles.titleWrapper}>
                <MaterialCommunityIcons
                  name="star-circle"
                  size={32}
                  color="white"
                />
                <Text style={styles.headerTitle}>رویدادها و دوره‌ها</Text>
                <MaterialCommunityIcons
                  name="star-circle"
                  size={32}
                  color="white"
                />
              </View>
              <Text style={styles.headerSubtitle}>
                دنیای مد و فشن را کشف کنید
              </Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.mainCard,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim }
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={["rgba(255, 255, 255, 0.98)", "rgba(255, 255, 255, 0.9)"]}
                style={styles.cardGradient}
              >
                <View style={styles.mainIconContainer}>
                  <LinearGradient
                    colors={[colors.primary, colors.secondary]}
                    style={styles.mainIconCircle}
                  >
                    <MaterialCommunityIcons
                      name="calendar-heart"
                      size={42}
                      color="white"
                    />
                  </LinearGradient>
                  <View style={styles.iconGlow} />
                </View>

                <Text style={styles.mainDescription}>
                  اینجا از جدیدترین ایونت‌ها، رویدادها، دوره‌ها و ورکشاپ‌های مد و لباس، طراحی پارچه و کتاب‌های مفید فشن مطلع می‌شوید
                </Text>

                <View style={styles.eventsContainer}>
                  <EventItem
                    icon="calendar-clock"
                    title="ایونت‌ها و رویدادها"
                    description="آخرین اخبار فشن شوها و نمایشگاه‌ها"
                    color={colors.primary}
                  />

                  <EventItem
                    icon="school"
                    title="دوره‌ها و ورکشاپ‌ها"
                    description="آموزش‌های تخصصی طراحی و دوخت"
                    color={colors.secondary}
                  />

                  <EventItem
                    icon="palette"
                    title="طراحی پارچه"
                    description="دوره‌های طراحی و چاپ پارچه"
                    color={colors.danger}
                  />

                  <EventItem
                    icon="book-open-variant"
                    title="کتاب‌های مد و فشن"
                    description="جدیدترین منابع علمی و آموزشی"
                    color={colors.primaryDark}
                  />

                  <EventItem
                    icon="trending-up"
                    title="ترندهای مد"
                    description="آخرین ترندهای جهانی مد و لباس"
                    color={colors.info || colors.secondary}
                  />

                  <EventItem
                    icon="certificate"
                    title="گواهینامه‌ها"
                    description="مدارک معتبر بین‌المللی"
                    color={colors.success || colors.secondary}
                  />
                </View>

                <View style={styles.decorativeElements}>
                  <View style={styles.floatingIcon}>
                    <MaterialCommunityIcons name="star-four-points" size={16} color={colors.primary} />
                  </View>
                  <View style={[styles.floatingIcon, styles.floatingIcon2]}>
                    <MaterialCommunityIcons name="star" size={14} color={colors.secondary} />
                  </View>
                  <View style={[styles.floatingIcon, styles.floatingIcon3]}>
                    <MaterialCommunityIcons name="heart" size={12} color={colors.danger} />
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>


            <Animated.View
              style={[
                styles.buttonsContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: pulseAnim }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleRegister}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#E91E63', '#AD1457']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <MaterialCommunityIcons
                    name="rocket-launch"
                    size={22}
                    color="white"
                  />
                  <Text style={styles.primaryButtonText}>ثبت نام در فریمد</Text>
                </LinearGradient>
              </TouchableOpacity>


              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleGetStarted}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                  style={styles.secondaryButtonGradient}
                >
                  <MaterialCommunityIcons
                    name="login"
                    size={20}
                    color={colors.primary}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.secondaryButtonText}>ورود به حساب کاربری</Text>
                </LinearGradient>
              </TouchableOpacity>
              <Animated.View
                style={[
                  styles.tutorialSection,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleOpenTutorial}
                  style={styles.tutorialButton}
                >
                  <MaterialCommunityIcons
                    name="play-circle-outline"
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={styles.tutorialButtonText}>
                    آموزش استفاده از فریمد
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-left"
                    size={16}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>

          </View>
        </ScrollView>
      </LinearGradient>
    </>
  );
};

const EventItem = ({ icon, title, description, color }) => (
  <View style={styles.eventItem}>
    <View style={styles.eventContent}>
      <Text style={styles.eventTitle}>{title}</Text>
      <Text style={styles.eventDescription}>{description}</Text>
    </View>
    <View style={[styles.eventIconContainer, { backgroundColor: color + "15" }]}>
      <MaterialCommunityIcons name={icon} size={26} color={color} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight + 50,
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 35,
  },
  titleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 30,
    fontFamily: "Yekan_Bakh_Bold",
    color: "white",
    marginHorizontal: 15,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  mainCard: {
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 25,
    marginBottom: 35,
    marginHorizontal: 5,
  },
  cardGradient: {
    padding: 30,
    position: "relative",
  },
  mainIconContainer: {
    alignItems: "center",
    marginBottom: 25,
    position: "relative",
  },
  mainIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
  },
  iconGlow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    opacity: 0.1,
    top: -15,
  },
  mainDescription: {
    fontSize: 17,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#2c2c2c",
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  eventsContainer: {
    marginTop: 10,
  },
  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9edf5",
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  eventIconContainer: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 18,
  },
  eventContent: {
    flex: 1,
    alignItems: "flex-end",
  },
  eventTitle: {
    fontSize: 17,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#1a1a1a",
    marginBottom: 6,
    textAlign: "right",
  },
  eventDescription: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#555",
    lineHeight: 22,
    textAlign: "right",
  },
  decorativeElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
  },
  floatingIcon: {
    position: "absolute",
    top: 30,
    right: 80,
  },
  floatingIcon2: {
    top: 120,
    left: 30,
  },
  floatingIcon3: {
    top: 90,
    bottom: 180,
    right: 50,
  },
  tutorialSection: {
    marginTop: 20,
    marginBottom: 25,
    alignItems: 'center',
  },
  tutorialButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  tutorialButtonText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: colors.primary,
  },
  buttonsContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  primaryButton: {
    width: "92%",
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 20,
  },
  buttonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 35,
  },
  primaryButtonText: {
    fontSize: 19,
    fontFamily: "Yekan_Bakh_Bold",
    color: "white",
    marginLeft: 12,
  },
  secondaryButton: {
    width: "70%",
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.6)",
    marginTop: 18,
  },
  secondaryButtonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 25,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontFamily: "Yekan_Bakh_Regular",
    color: colors.primary,
    textAlign: "center",
  },
});

export default EventsScreen;