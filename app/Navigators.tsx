import React from "react";
import { StyleSheet, Text, View, Platform, I18nManager } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import ProfileScreeen from "./screens/ProfileScreeen";
import HomeScreen from "./screens/HomeScreen";
import MagScreen from "./screens/MagScreen";
import EditProfileScreen from "./screens/EditProfileScreen";
import AboutMeScreen from "./screens/AboutMeScreen";
import MyResumeScreen from "./screens/MyResumeScreen";
import MyPostsScreen from "./screens/MyPostsScreen";
import MyCoursesScreen from "./screens/MyCoursesScreen";
import MyTeachingCoursesScreen from "./screens/MyTeachingCoursesScreen";
import CourseDetailsScreen from "./screens/CourseDetailsScreen";
import UserProfileScreen from "./screens/UserProfileScreen";
import SubscriptionScreen from "./screens/SubscriptionScreen";
import AddNewPostScreen from "./screens/AddNewPostScreen";
import PortfolioListScreen from "./screens/PortfolioListScreen";
 
import CareerScreen from "./screens/CareerScreen";
import WelcomeIntroScreen from "./screens/WelcomeIntroScreen";
import WhyFrimodScreen from "./screens/WhyFrimodScreen";
import EventsScreen from "./screens/EventsScreen";



import styles from "./config/styles";
import MagDetailesScreen from "./screens/MagDetailesScreen";
import AddNewCourseScreen from "./screens/AddNewCourseScreen";
import MyGalleryScreen from "./screens/MyGalleryScreen";
import GalleryItemScreen from "./screens/GalleryItemScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import colors from "./config/colors";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AllCoursesScreen from "./screens/AllCoursesScreen";
import AllProductsScreen from "./screens/AllProductsScreen";
import AllMembersScreen from "./screens/AllMemberScreen";
import ProductDetailsScreen from "./screens/ProductDetailsScreen";
import portfolioDetailScreen from "./screens/PortfolioDetailScreen";
import PortfolioDetailScreen from "./screens/PortfolioDetailScreen";
import AllGalleriesScreen from "./screens/AllGalleriesScreen"

export type RootStackParamList = {
  IntroFlow: undefined;
  WelcomeIntro: undefined;
  WhyFrimod: undefined;
  EventsScreen: undefined;
  CareerScreen: undefined;
  MainTabs: undefined;
  Login: undefined;
  Signup: undefined;
  EditProfile: undefined;
  AboutMe: undefined;
  MyResume: undefined;
  MyGallery: undefined;
  MyPosts: undefined;
  MyCourses: undefined;
  AddNewCourse: undefined;
  MagDetailes: undefined;
  MyTeachingCourses: undefined;
  AllCoursesScreen: undefined;
  AllProducts: undefined;
  AllMembers: undefined;
  ProductDetails: undefined;
  AddNewPost: undefined;
  PortfolioDetail: undefined;
  PortfolioList: undefined;
  AllGalleries: undefined;

  GalleryItem: undefined;
  Subscription: undefined;
  CourseDetails: { courseData?: any };
  UserProfile: { userData?: any };
};

export type AppNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();
const IntroStack = createStackNavigator();

const customTransitionConfig = {
  animation: "spring",
  config: {
    stiffness: 1000,
    damping: 500,
    mass: 3,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
};

const screenOptions = {
  gestureEnabled: true,
  gestureDirection: I18nManager.isRTL ? "horizontal-inverted" : "horizontal",
  transitionSpec: {
    open: customTransitionConfig,
    close: customTransitionConfig,
  },
  cardStyleInterpolator: ({ current, next, layouts }) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [
                layouts.screen.width * (I18nManager.isRTL ? -1 : 1),
                0,
              ],
            }),
          },
        ],
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.5],
        }),
      },
    };
  },
};

function IntroFlowNavigator() {
  return (
    <IntroStack.Navigator
      screenOptions={{
        ...screenOptions,
        headerShown: false,
      }}
      initialRouteName="WelcomeIntro"
    >
      <IntroStack.Screen
        name="WelcomeIntro"
        component={WelcomeIntroScreen}
      />
      <IntroStack.Screen
        name="WhyFrimod"
        component={WhyFrimodScreen}
      />
      <IntroStack.Screen
        name="EventsScreen"
        component={EventsScreen}
      />
      <IntroStack.Screen
        name="CareerScreen"
        component={CareerScreen}
      />
    </IntroStack.Navigator>
  );
}

function TabNavigator() {
  const navigation = useNavigation<AppNavigationProp>();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="خانه"
      screenOptions={({ route }) => ({
        tabBarLabelStyle: {
          fontFamily: "Yekan_Bakh_Regular",
          fontSize: 13,
          textAlign: "center",
          marginBottom: 5,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>["name"] =
            "accessibility";
          if (route.name === "خانه") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "پروفایل") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "مجله ی فریمد") {
            iconName = focused ? "book" : "book-outline";
          }
          return <Ionicons name={iconName} color={color} size={size} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          justifyContent: "center",
          alignItems: "center",
        },
        headerStyle: {
          backgroundColor: "#e2bce8",
          height: 110,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontFamily: "Yekan_Bakh_Bold",
          fontSize: 25,
          color: colors.primary,
          marginTop: 10,
        },
        headerTitleAlign: "center",
      })}
    >
      <Tab.Screen
        name="پروفایل"
        component={ProfileScreeen}
        options={{
          gestureEnabled: false,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="خانه"
        component={HomeScreen}
        options={{
          headerLeft: () => (
            <Ionicons
              name="notifications-outline"
              size={24}
              color={colors.primary}
              style={{ marginLeft: 15 }}
            />
          ),
          headerTitle: "فریمد",
        }}
      />
      <Tab.Screen
        name="مجله ی فریمد"
        component={MagScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

// بروزرسانی StackNavigator برای دریافت وضعیت intro
export function StackNavigator({ isIntroCompleted }) {
  const navigation = useNavigation();

  return (
    <Stack.Navigator
      screenOptions={screenOptions}
      // تعیین صفحه اولیه بر اساس وضعیت intro
      initialRouteName={isIntroCompleted ? "Login" : "IntroFlow"}
    >
      {/* صفحات intro فقط در صورت عدم تکمیل نمایش داده می‌شوند */}
      {!isIntroCompleted && (
        <Stack.Screen
          name="IntroFlow"
          component={IntroFlowNavigator}
          options={{ headerShown: false }}
        />
      )}

      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          headerShown: false,
          title: "ویرایش پروفایل",
          headerTitleAlign: "center",
          headerTitleStyle: styles.headerTitleStyle,
          headerStyle: styles.headerStyle,
          headerLeft: () => null,
          headerRight: ({ canGoBack }) =>
            canGoBack ? (
              <Ionicons
                name="arrow-forward"
                size={24}
                color={colors.primary}
                style={{ marginRight: 15 }}
                onPress={() => navigation.goBack()}
              />
            ) : null,
        }}
      />
      <Stack.Screen
        name="AboutMe"
        component={AboutMeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="MyResume"
        component={MyResumeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="MyGallery"
        component={MyGalleryScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AllGalleries"
        component={AllGalleriesScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="MyPosts"
        component={MyPostsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AddNewPost"
        component={AddNewPostScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PortfolioDetail"
        component={PortfolioDetailScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,

        }}
      />
      <Stack.Screen
        name="PortfolioList"
        component={PortfolioListScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,

        }}
      />
      <Stack.Screen
        name="MyCourses"
        component={MyCoursesScreen}
        options={{
          headerTitleAlign: "center",
          headerTitleStyle: styles.headerTitleStyle,
          headerStyle: styles.headerStyle,
          headerLeft: () => null,
          headerRight: ({ canGoBack }) =>
            canGoBack ? (
              <Ionicons
                name="arrow-forward"
                size={24}

                color={colors.primary}
                style={{ marginRight: 15 }}
                onPress={() => navigation.goBack()}
              />
            ) : null,
        }}
      />
      <Stack.Screen
        name="AddNewCourse"
        component={AddNewCourseScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="AllCourses"
        component={AllCoursesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CourseDetails"
        component={CourseDetailsScreen}
        options={{
          gestureEnabled: false,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="MyTeachingCourses"
        component={MyTeachingCoursesScreen}
        options={{
          gestureEnabled: false,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ProductDetails"
        component={ProductDetailsScreen}
        options={{
          gestureEnabled: false,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AllProducts"
        component={AllProductsScreen}
        options={{
          gestureEnabled: false,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AllMembers"
        component={AllMembersScreen}
        options={{
          gestureEnabled: false,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{
          gestureEnabled: false,
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{
          gestureEnabled: false,
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="MagDetailes"
        component={MagDetailesScreen}
        options={({ route }) => ({
          headerShown: false,
        })}
      />
      <Stack.Screen
        name="GalleryItem"
        component={GalleryItemScreen}
        options={({ route }) => ({
          headerShown: false,
        })}
      />
    </Stack.Navigator>
  );
}