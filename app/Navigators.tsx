import React from "react";
import { StyleSheet, Text, View, Platform, I18nManager } from "react-native";
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

export type RootStackParamList = {
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
  GalleryItem: undefined;
};

export type AppNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

// Custom transition configuration for RTL
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

// Custom screen options for RTL animation
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

function TabNavigator() {
  const navigation = useNavigation<AppNavigationProp>();
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
          height: 60,
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
          headerRight: () => (
            <MaterialIcons
              name="edit"
              size={24}
              color={colors.primary}
              style={{ marginRight: 15 }}
              onPress={() => navigation.navigate("EditProfile")}
            />
          ),
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
        options={{
          headerRight: () => (
            <Ionicons
              name="search-outline"
              size={24}
              color={colors.primary}
              style={{ marginRight: 15 }}
            />
          ),
          title: "مجله",
          headerTitle: "مجله ی فریمد",
        }}
      />
    </Tab.Navigator>
  );
}

export function StackNavigator() {
  const navigation = useNavigation();
  return (
    <Stack.Navigator screenOptions={screenOptions} initialRouteName="Login">
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
        name="MyResume"
        component={MyResumeScreen}
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
        name="MyGallery"
        component={MyGalleryScreen}
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
        name="MyPosts"
        component={MyPostsScreen}
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
          title: "ثبت دوره ی جدید",
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
        name="MagDetailes"
        component={MagDetailesScreen}
        options={({ route }) => ({
          headerTitleAlign: "center",
          headerTitleStyle: styles.headerTitleStyle,
          headerStyle: styles.headerStyle,
          title: "مجله ی فریمد",
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
        })}
      />
      <Stack.Screen
        name="GalleryItem"
        component={GalleryItemScreen}
        options={({ route }) => ({
          headerTitleAlign: "center",
          headerTitleStyle: styles.headerTitleStyle,
          headerStyle: styles.headerStyle,
          title: route.params?.title,
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
        })}
      />
    </Stack.Navigator>
  );
}
