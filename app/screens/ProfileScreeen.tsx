import React, { useEffect, useRef } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
  Animated,
  StatusBar,
  TouchableOpacity
} from "react-native";
import colors from "../config/colors";
import AppText from "../components/Text";
import ProfileListItem from "../components/ProfileListItem";
import { toPersianDigits } from "../utils/converters";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import MainBackground from "../components/MainBackground";
import AppButton from "../components/Button";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import AddNewCourseScreen from "./AddNewCourseScreen";
import { AppNavigationProp, RootStackParamList } from "../Navigators";

const { width, height } = Dimensions.get('window');

// Enhanced modern color palette (same as AboutMe)
const modernColors = {
  ...colors,
  primary: "#6366f1",
  primaryDark: "#4f46e5",
  primaryLight: "#e0e7ff",
  secondary: "#8b5cf6",
  tertiary: "#06b6d4",
  accent: "#10b981",
  surface: "#ffffff",
  dark: "#2c3e50",
  medium: "#34495e",
  light: "#ecf0f1",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#06b6d4",
  gradientStart: "#6366f1",
  gradientEnd: "#8b5cf6",
};

interface IProfileItem {
  id: number;
  title: string;
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  screenName: keyof RootStackParamList;
  color: string;
}

const profileItems: IProfileItem[] = [
  {
    id: 1,
    title: "درباره ی من",
    icon: "info",
    screenName: "AboutMe",
    color: "#8b5cf6",
  },
  {
    id: 2,
    title: "فایل ها و مدارک",
    icon: "my-library-books",
    screenName: "MyResume",
    color: "#10b981",
  },
  {
    id: 3,
    title: "گالری من",
    icon: "image",
    screenName: "MyGallery",
    color: "#f59e0b",
  },
  {
    id: 4,
    title: "پست های منتشر شده",
    icon: "article",
    screenName: "MyPosts",
    color: "#06b6d4",
  },
  {
    id: 5,
    title: "دوره های ثبت نام شده",
    icon: "fact-check",
    screenName: "MyCourses",
    color: "#ef4444",
  },
  {
    id: 6,
    title: "برگزاری دوره",
    icon: "laptop-chromebook",
    screenName: "MyTeachingCourses",
    color: "#15908E",
  },
  {
    id: 7,
    title: "اشتراک ها",
    icon: "star",
    screenName: "Subscription",
    color: "#ffd700",
  },
  {
    id: 8,
    title: "نمونه کار ها",
    icon: "collections-bookmark",
    screenName: "PortfolioList",
    color: "#4ecdc4",
  },
];

const ProfileCard = ({ item, onPress }) => (
  <TouchableOpacity
    style={[styles.profileCard, { borderColor: item.color }]}
    onPress={() => onPress(item.screenName)}
    activeOpacity={0.8}
  >
    <View style={[styles.glassCard, { backgroundColor: `${item.color}15` }]}>
      <View style={styles.iconContainer}>
        <MaterialIcons
          name={item.icon}
          size={36}
          color={item.color}
        />
      </View>
      <AppText style={styles.cardTitle}>{item.title}</AppText>
    </View>
  </TouchableOpacity>
);

const ProfileScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();

  // Disable swipe back gesture for this screen specifically
  React.useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      gestureEnabled: false,
    });

    return () => {
      navigation.getParent()?.setOptions({
        gestureEnabled: true,
      });
    };
  }, [navigation]);

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

  const handleCardPress = (screenName) => {
    navigation.navigate(screenName);
  };

  const renderProfileCard = ({ item }) => (
    <ProfileCard item={item} onPress={handleCardPress} />
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        <MainBackground />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {/* Header with back and edit buttons */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <View style={styles.backButtonContainer}>
              <MaterialIcons
                name="arrow-forward"
                size={24}
                color="white"
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <View style={styles.editButtonContainer}>
              <MaterialIcons
                name="edit"
                size={24}
                color="white"
              />
            </View>
          </TouchableOpacity>

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
              <AppText style={styles.headerTitle}>پروفایل</AppText>
            </View>
          </Animated.View>

          {/* Profile Header */}
          <Animated.View
            style={[
              styles.profileHeaderContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.profileImageContainer}>
              <LinearGradient
                colors={['#8b5cf6', '#6366f1', '#06b6d4']}
                style={styles.profileImageGradient}
              >
                <MaterialCommunityIcons name="face-man" size={85} color="white" />
              </LinearGradient>
            </View>

            <View style={styles.profileInfo}>
              <AppText style={styles.userNameText}>نام و نام خانوادگی</AppText>
              <View style={styles.mobileChip}>
                <MaterialIcons name="phone" size={16} color={modernColors.primary} />
                <AppText style={styles.userNameMobileText}>
                  {toPersianDigits("09131234567")}
                </AppText>
              </View>
            </View>
          </Animated.View>

          {/* Section Title */}
          <Animated.View
            style={[
              styles.sectionTitleContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.sparkleContainer}>
              <MaterialIcons
                name="star"
                size={16}
                color="#FFD700"
                style={styles.sparkle1}
              />
              <MaterialIcons
                name="auto-awesome"
                size={12}
                color="#FF69B4"
                style={styles.sparkle2}
              />
            </View>
          </Animated.View>

          {/* Profile Options - Horizontal FlatList with RTL */}
          <Animated.View
            style={[
              styles.cardsContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <FlatList
              data={profileItems}
              renderItem={renderProfileCard}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              inverted={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContainer}
              decelerationRate="fast"
              snapToInterval={width * 0.75 + 15}
              snapToAlignment="center"
              ItemSeparatorComponent={() => <View style={{ width: 15 }} />}
              centerContent={true}
            />
          </Animated.View>

          {/* Add New Course Button */}
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
              onPress={() => navigation.navigate("AddNewCourse")}
            >
              <LinearGradient
                colors={['#8b5cf6', '#6366f1', '#4f46e5']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <MaterialIcons
                  name="add-circle"
                  size={22}
                  color="white"
                />
                <AppText style={styles.primaryButtonText}>ثبت دوره ی جدید</AppText>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Decorative Elements - Same as AboutMe */}
          <View style={styles.decorativeElements}>
            <View style={styles.floatingElements}>
              <Animated.View style={[styles.star1, { transform: [{ rotate: spin }] }]}>
                <MaterialIcons
                  name="auto-awesome"
                  size={22}
                  color="rgba(139, 92, 246, 0.3)"
                />
              </Animated.View>
              <Animated.View style={[styles.star2, { transform: [{ rotate: spin }] }]}>
                <MaterialIcons
                  name="dashboard"
                  size={18}
                  color="rgba(99, 102, 241, 0.3)"
                />
              </Animated.View>
              <Animated.View style={[styles.star3, { transform: [{ rotate: spin }] }]}>
                <MaterialIcons
                  name="school"
                  size={20}
                  color="rgba(6, 182, 212, 0.3)"
                />
              </Animated.View>
              <Animated.View style={[styles.star4, { transform: [{ rotate: spin }] }]}>
                <MaterialIcons
                  name="star"
                  size={24}
                  color="rgba(139, 92, 246, 0.2)"
                />
              </Animated.View>
            </View>
          </View>

          {/* Bottom Spacer */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // Same as AboutMe
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  // Header styles (similar to CourseDetailsScreen)
  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
    paddingTop: StatusBar.currentHeight + 35,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: StatusBar.currentHeight + 45,
    right: 20,
    zIndex: 1000,
  },
  backButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',

    marginTop: -12
  },
  editButton: {
    position: 'absolute',
    top: StatusBar.currentHeight + 45,
    left: 20,
    zIndex: 1000,
  },
  editButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 50,
    backgroundColor:'#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
 
    marginTop: -12
  },
  titleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Yekan_Bakh_ExtraBold",
    color: "#2c3e50",
    marginHorizontal: 15,
    textAlign: "center",
  },
  profileHeaderContainer: {
    alignItems: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 4,
    borderColor: "#ffffff",

  },
  profileImageGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
  },
  userNameText: {
    fontSize: 32,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    marginBottom: 12,
    textAlign: "center",
  },
  mobileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userNameMobileText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.primary,
    marginLeft: 8,
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
  sparkleContainer: {
    position: "relative",
  },
  sparkle1: {
    position: "absolute",
    top: -10,
    right: 90,
  },
  sparkle2: {
    position: "absolute",
    top: 5,
    right: 25,
  },
  cardsContainer: {
    marginBottom: 30,
  },
  horizontalScrollContainer: {
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Glass Card Styles
  profileCard: {
    width: width * 0.75,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 2,
  },
  glassCard: {
    backdropFilter: 'blur(20px)',
    padding: 25,
    minHeight: 160,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 1)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    textAlign: 'center',
    textShadowColor: "rgba(255, 255, 255, 0.9)",
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
    shadowColor: "#8b5cf6",
    marginTop: 35,
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
  // Decorative Elements (Same as AboutMe)
  decorativeElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
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
    top: 300,
    left: 60,
  },
  star2: {
    position: "absolute",
    top: 500,
    right: 70,
  },
  star3: {
    position: "absolute",
    top: 700,
    left: 50,
  },
  star4: {
    position: "absolute",
    top: 900,
    right: 90,
  },
  bottomSpacer: {
    height: 50,
  },
});

export default ProfileScreen;