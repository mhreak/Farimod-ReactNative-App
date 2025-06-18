import React, { useEffect, useRef } from "react";
import AppText from "../components/Text";
import {
  ScrollView,
  StyleSheet,
  View,
  Image,
  Dimensions,
  Animated,
  StatusBar,
  TouchableOpacity
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../config/colors";
import MainBackground from "../components/MainBackground";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { blue100 } from "react-native-paper/lib/typescript/styles/themes/v2/colors";


const { width, height } = Dimensions.get('window');

// Enhanced modern color palette similar to CareerScreen
const modernColors = {
  ...colors,
  primary: "#667eea",
  primaryDark: "#764ba2",
  primaryLight: "#f0f4ff",
  secondary: "#ff6b6b",
  tertiary: "#4ecdc4",
  accent: "#45b7d1",
  surface: "#ffffff",
  dark: "#2c3e50",
  medium: "#34495e",
  light: "#ecf0f1",
  success: "#2ecc71",
  warning: "#f39c12",
  error: "#e74c3c",
  info: "#3498db",
  gradientStart: "#667eea",
  gradientEnd: "#764ba2",
  schoolIcon: "#2ecc71",
  descIcon: "#f39c12",
  moneyIcon: "#e74c3c",
  placeIcon: "#9b59b6",
  phoneIcon: "#3498db",
  groupIcon: "#e67e22",
  categoryIcon: "#8e44ad",
};

const CourseDetailsScreen = ({ route }) => {
  const navigation = useNavigation();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

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

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rawCourseData = route?.params?.courseData || {
    courseName: "دوره طراحی لباس پیشرفته",
    courseType: "حضوری",
    poster: "../../assets/sample_clothe.jpg",
    description: "این دوره شامل آموزش کامل طراحی و دوخت انواع لباس‌های مدرن و سنتی می‌باشد. در این دوره شما با تکنیک‌های پیشرفته طراحی آشنا خواهید شد.",
    coursePrice: "2,500,000",
    eventLocation: "تهران، خیابان ولیعصر، پلاک 245",
    phoneNumber: "021-88776655",
    coaches: "استاد احمدی، استاد رضایی، استاد محمدی، استاد علوی",
    category: "هنر و صنایع دستی"
  };

  const processCoaches = (coachesData) => {
    if (Array.isArray(coachesData)) {
      return coachesData;
    }
    if (typeof coachesData === 'string') {
      return coachesData.split('، ').map(name => ({
        name: name.trim(),
        image: null
      }));
    }
    return [];
  };

  const courseData = {
    ...rawCourseData,
    coaches: processCoaches(rawCourseData.coaches)
  };

  const getIconColor = (iconType) => {
    const iconColors = {
      school: modernColors.schoolIcon,
      description: modernColors.descIcon,
      'attach-money': modernColors.moneyIcon,
      place: modernColors.placeIcon,
      phone: modernColors.phoneIcon,
      group: modernColors.groupIcon,
      category: modernColors.categoryIcon,
    };
    return iconColors[iconType] || modernColors.primary;
  };

  const DetailItem = ({ label, value, icon }) => (
    <View style={styles.detailItem}>
      <View style={styles.labelContainer}>
        <LinearGradient
          colors={[getIconColor(icon), getIconColor(icon) + 'CC']}
          style={styles.iconWrapper}
        >
          <MaterialIcons
            name={icon}
            size={22}
            color={modernColors.surface}
          />
        </LinearGradient>
        <AppText style={styles.label}>{label}</AppText>
      </View>
      <View style={styles.valueContainer}>
        <AppText style={styles.value}>{value}</AppText>
      </View>
      <View style={[styles.featureAccent, { backgroundColor: getIconColor(icon) + "20" }]} />
    </View>
  );

  const CoachItem = ({ coach, index }) => (
    <View style={[styles.coachContainer, {
      transform: [{ scale: 1 }],
      opacity: 1,
    }]}>
      <View style={styles.coachImageContainer}>
        {coach.image ? (
          <Image
            source={{ uri: coach.image }}
            style={styles.coachImage}
          />
        ) : (
          <LinearGradient
            colors={index % 2 === 0 ? [modernColors.secondary, modernColors.secondary + 'AA'] : [modernColors.tertiary, modernColors.tertiary + 'AA']}
            style={styles.coachDefaultIcon}
          >
            <MaterialIcons
              name="person"
              size={40}
              color={modernColors.surface}
            />
          </LinearGradient>
        )}
        {/* <View style={styles.coachBadge}>
          <MaterialIcons
            name="verified"
            size={20}
            color={"#2080ff"}
          />
        </View> */}
      </View>
      <AppText style={styles.coachName}>{coach.name}</AppText>
      <LinearGradient
        colors={[modernColors.primary + '15', modernColors.primary + '25']}
        style={styles.coachTitleContainer}
      >
        <AppText style={styles.coachTitle}>مربی متخصص</AppText>
      </LinearGradient>
    </View>
  );

  const DetailItemWithCoaches = ({ label, coaches, icon }) => (
    <View style={styles.detailItem}>
      <View style={styles.labelContainer}>
        <LinearGradient
          colors={[getIconColor(icon), getIconColor(icon) + 'CC']}
          style={styles.iconWrapper}
        >
          <MaterialIcons
            name={icon}
            size={22}
            color={modernColors.surface}
          />
        </LinearGradient>
        <AppText style={styles.label}>{label}</AppText>
      </View>
      <View style={styles.coachesValueContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.coachesScrollContent}
        >
          {coaches.map((coach, index) => (
            <CoachItem key={index} coach={coach} index={index} />
          ))}
        </ScrollView>
      </View>
      <View style={[styles.featureAccent, { backgroundColor: getIconColor(icon) + "20" }]} />
    </View>
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={["#EFD6F3", colors.primary, colors.primary, modernColors.primaryDark, '#4A148C', modernColors.tertiary]}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons
              name="arrow-forward"
              size={24}
              style={{ marginRight: 15 }}
              color="#ffffff"
            />
          </TouchableOpacity>
          {/* Enhanced Header */}
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
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.headerIconContainer}
              >
                <MaterialIcons
                  name="school"
                  size={30}
                  color="#fff"
                />
              </LinearGradient>
              <AppText style={styles.headerTitle}>جزئیات دوره آموزشی</AppText>
            </View>
          </Animated.View>

          {/* Course Image Header */}
          <Animated.View
            style={[
              styles.imageHeaderContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Image
              style={styles.headerImage}
              source={require("../../assets/sample_clothe.jpg")}
            />
            <LinearGradient
              colors={['transparent', 'rgba(190, 126, 234, 0.9)', 'rgba(118, 75, 162, 0.95)']}
              style={styles.overlay}
            >
              <View style={styles.titleBackground}>
                <AppText style={styles.courseTitle}>{courseData.courseName}</AppText>
                <View style={styles.courseTypeChip}>
                  <MaterialIcons name="school" size={16} color={modernColors.surface} />
                  <AppText style={styles.courseTypeText}>{courseData.courseType}</AppText>
                </View>
              </View>
            </LinearGradient>
            {/* Floating decorations */}


          </Animated.View>

          {/* Section Title */}
          <Animated.View
            style={[styles.floatingDecoration2, { transform: [{ rotate: spin }] }]}
          >
            {/* <LinearGradient
              colors={['#4ECDC4', '#44A08D']}
              style={styles.decorativeCircleSmall}
            >
              <MaterialIcons name="brush" size={18} color="white" />
            </LinearGradient> */}
          </Animated.View>
          <Animated.View
            style={[
              styles.sectionTitleContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={['#E91E63', '#AD1457']}
              style={styles.sectionIconContainer}
            >
              <MaterialIcons
                name="info"
                size={26}
                color={modernColors.surface}
              />
            </LinearGradient>
            <AppText style={styles.sectionTitle}>مشخصات دوره</AppText>
            <View style={styles.sparkleContainer}>
              <MaterialIcons
                name="star-half"
                size={16}
                color="#FFD700"
                style={styles.sparkle1}
              />
              <MaterialIcons
                name="star-half"
                size={12}
                color="#FF6B6B"
                style={styles.sparkle2}
              />
            </View>
          </Animated.View>
          <Animated.View
            style={[styles.floatingDecoration1, { transform: [{ rotate: spin }] }]}
          >
            {/* <LinearGradient
              colors={['#FF6B6B', '#FF8E53']}
              style={styles.decorativeCircleSmall}
            >
              <MaterialIcons name="palette" size={20} color="white" />
            </LinearGradient> */}
          </Animated.View>

          {/* Individual Cards */}
          <Animated.View
            style={[
              styles.cardsContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* <DetailItem
              label="نوع دوره"
              value={courseData.courseType}
              icon="school"
            /> */}

            <DetailItem
              label="توضیحات"
              value={courseData.description}
              icon="description"
            />

            <DetailItem
              label="هزینه ثبت نام"
              value={`${courseData.coursePrice} تومان`}
              icon="attach-money"
            />

            <DetailItem
              label="محل برگزاری"
              value={courseData.eventLocation}
              icon="place"
            />

            <DetailItem
              label="تلفن تماس"
              value={courseData.phoneNumber}
              icon="phone"
            />

            <DetailItemWithCoaches
              label="مربیان"
              coaches={courseData.coaches}
              icon="group"
            />

            <DetailItem
              label="دسته بندی"
              value={courseData.category}
              icon="category"
            />
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View
            style={[
              styles.buttonsContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: pulseAnim }],
              },
            ]}
          >
            <TouchableOpacity style={styles.primaryButton}>
              <LinearGradient
                colors={['#E91E63', '#AD1457', '#880E4F']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <MaterialIcons
                  name="book"
                  size={22}
                  color="white"
                />
                <AppText style={styles.primaryButtonText}>ثبت نام در دوره</AppText>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                style={styles.secondaryButtonGradient}
              >
                <MaterialIcons
                  name="share"
                  size={20}
                  color="white"
                  style={{ marginLeft: 8 }}
                />
                <AppText style={styles.secondaryButtonText}>اشتراک گذاری دوره</AppText>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Decorative Elements */}
          <View style={styles.decorativeElements}>
            <Animated.View
              style={[
                styles.decorativeIcon1,
                { transform: [{ rotate: spin }] }
              ]}
            >

            </Animated.View>

            <Animated.View
              style={[
                styles.decorativeIcon2,
                { transform: [{ rotate: spin }] }
              ]}
            >

            </Animated.View>

            <View style={styles.floatingElements}>
              <Animated.View style={[styles.star1, { transform: [{ rotate: spin }] }]}>
                <MaterialIcons
                  name="star"
                  size={22}
                  color="rgba(255, 215, 0, 0.4)"
                />
              </Animated.View>
              <Animated.View style={[styles.star2, { transform: [{ rotate: spin }] }]}>
                <MaterialIcons
                  name="auto-awesome"
                  size={18}
                  color="rgba(255, 107, 107, 0.4)"
                />
              </Animated.View>
              <Animated.View style={[styles.star3, { transform: [{ rotate: spin }] }]}>
                <MaterialIcons
                  name="diamond"
                  size={20}
                  color="rgba(78, 205, 196, 0.4)"
                />
              </Animated.View>
            </View>
          </View>

          {/* Bottom Spacer */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
    paddingTop: StatusBar.currentHeight + 35,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: StatusBar.currentHeight + 48,
    right: 0,
    zIndex: 1000,
    // padding: 10,
  },
  titleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  headerIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Yekan_Bakh_Bold",
    color: "white",
    marginHorizontal: 15,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    textAlign: "center",
  },
  imageHeaderContainer: {
    position: 'relative',
    height: 320,
    margin: 20,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: modernColors.primary,
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    padding: 15,
    justifyContent: 'flex-end',
  },
  titleBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 20,
    padding: 20,
    backdropFilter: 'blur(15px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
  },
  courseTitle: {
    fontSize: 28,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.surface,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 12,
    lineHeight: 36,
  },
  courseTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  courseTypeText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.surface,
    marginLeft: 6,
  },
  floatingDecoration1: {
    position: 'absolute',
    bottom: 50,
    right: 75,
  },
  floatingDecoration2: {
    position: 'absolute',
    top: 1150,
    left: 100,
  },
  decorativeCircleSmall: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  sectionTitleContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    marginTop: 10,
    position: "relative",
    paddingHorizontal: 20,
  },
  cardsContainer: {
    paddingHorizontal: 20,
  },
  sectionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
  },
  sparkleContainer: {
    position: "absolute",
    top: -10,
    right: -10,
  },
  sparkle1: {
    position: "absolute",
    top: 0,
    right: 90,
  },
  sparkle2: {
    position: "absolute",
    top: 550,
    right: 25,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#ffffff",
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  detailItem: {
    marginBottom: 14,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    backdropFilter: "blur(12px)",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.4)",
    position: "relative",
    overflow: "hidden",

    marginHorizontal: 5,
  },
  labelContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  label: {
    fontSize: 17,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#ffffff",
    flex: 1,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  valueContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
    marginRight: 56,

  },
  value: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: 'right',
    lineHeight: 26,
    fontFamily: "Yekan_Bakh_Regular",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featureAccent: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
  },
  coachesValueContainer: {
    paddingVertical: 15,
    marginRight: 0,
  },
  coachesScrollContent: {
    paddingHorizontal: 0,
  },
  coachContainer: {
    alignItems: 'center',
    marginHorizontal: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    width: 130,
    backdropFilter: "blur(10px)",
  },
  coachImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 1000,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#ffffff",
    position: 'relative',

  },
  coachImage: {
    width: '100%',
    height: '100%',
  },
  coachDefaultIcon: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coachBadge: {
    position: 'absolute',
    bottom: "6%",
    left: "60%",
    // right: "50%",
    width: 22,
    height: 22,
    borderRadius: 50,
    backgroundColor: modernColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: modernColors.surface,
  },
  coachName: {
    fontSize: 13,
    color: "#ffffff",
    textAlign: 'center',
    fontFamily: "Yekan_Bakh_Bold",
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  coachTitleContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  coachTitle: {
    fontSize: 11,
    color: "#ffffff",
    textAlign: 'center',
    fontFamily: "Yekan_Bakh_Regular",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  buttonsContainer: {
    alignItems: "center",
    marginBottom: 25,
    paddingHorizontal: 20,
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
    marginBottom: 18,
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
    marginRight: 12,
  },
  secondaryButton: {
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  secondaryButtonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 35,
  },
  secondaryButtonText: {
    fontSize: 17,
    fontFamily: "Yekan_Bakh_Regular",
    color: "white",
    textAlign: "center",
  },
  decorativeElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  decorativeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  decorativeIcon1: {
    position: "absolute",
    top: 500, // Moved down by 50% (from 200 to 500)
    right: 15,
  },
  decorativeIcon2: {
    position: "absolute",
    top: 700, // Moved down by 50% (from 400 to 700)
    left: 20,
  },
  floatingElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star1: {
    position: "absolute",
    top: 600, // Moved down by 50% (from 300 to 600)
    left: 60,
  },
  star2: {
    position: "absolute",
    top: 800, // Moved down by 50% (from 500 to 800)
    right: 70,
  },
  star3: {
    position: "absolute",
    bottom: 100, // Moved up from bottom by reducing value (from 200 to 100)
    left: 50,
  },
  bottomSpacer: {
    height: 100,
  },
});
export default CourseDetailsScreen;