import React, { useEffect } from "react";
import { BackHandler } from "react-native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { screenOptions } from "./config";
import { AppNavigationProp } from "./types";
import colors from "../config/colors";
import styles from "../config/styles";


import HomeScreen from "../screens/home/HomeScreen";
import ProfileScreeen from "../screens/profile/ProfileScreeen";
import MagScreen from "../screens/mag/MagScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import AboutMeScreen from "../screens/AboutMeScreen";
import MyResumeScreen from "../screens/MyResumeScreen";
import MyPostsScreen from "../screens/MyPostsScreen";
import MyCoursesScreen from "../screens/MyCoursesScreen";
import MyTeachingCoursesScreen from "../screens/MyTeachingCoursesScreen";
import CourseDetailsScreen from "../screens/CourseDetailsScreen";
import UserProfileScreen from "../screens/UserProfileScreen";
import SubscriptionScreen from "../screens/SubscriptionScreen";
import AddNewPostScreen from "../screens/AddNewPostScreen";
import PortfolioListScreen from "../screens/PortfolioListScreen";
import MyProductScreen from "../screens/MyProductScreen";
import AllPortfolioScreen from "../screens/portfolio/AllPortfolioScreen";
import MagDetailesScreen from "../screens/MagDetailesScreen";
import AddNewCourseScreen from "../screens/AddNewCourseScreen";
import MyGalleryScreen from "../screens/MyGalleryScreen";
import GalleryItemScreen from "../screens/GalleryItemScreen";
import AllCoursesScreen from "../screens/courses/AllCoursesScreen";
import AllProductsScreen from "../screens/products/AllProductsScreen";
import AllMembersScreen from "../screens/member/AllMemberScreen";
import ProductDetailsScreen from "../screens/ProductDetailsScreen";
import PortfolioDetailScreen from "../screens/PortfolioDetailScreen";
import AllGalleriesScreen from "../screens/gallery/AllGalleriesScreen";
import AddPortfolioScreen from "../screens/AddPortfolioScreen";
import AddProductScreen from "../screens/AddNewProduct";
import AddGalleryScreen from "../screens/AddGalleryScreen";
import ManageGalleryItemsScreen from "../screens/ManageGalleryItemsScreen";
import EditContactInfoScreen from "../screens/EditContactInfoScreen";
import CourseStudentsScreen from "../screens/CourseStudentsScreen";
import MyRegistrationsScreen  from "../screens/Myregistrationsscreen";
import CourseRegistrationScreen from "../screens/CourseRegistrationScreen";
import SubscriptionPurchaseScreen from "../screens/SubscriptionPurchaseScreen";
import AllMemberGroupsScreen from "../screens/memberGroup/AllMemberGroupsScreen";

const Tab = createBottomTabNavigator();
const AppStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();


function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} />

      <HomeStack.Screen name="AllMembers" component={AllMembersScreen} />
      <HomeStack.Screen name="AllProducts" component={AllProductsScreen} />
      <HomeStack.Screen name="AllCourses" component={AllCoursesScreen} />
      <HomeStack.Screen name="AllMemberGroups" component={AllMemberGroupsScreen} />

      <HomeStack.Screen name="ProductDetails" component={ProductDetailsScreen} />
      <HomeStack.Screen name="CourseDetails" component={CourseDetailsScreen} />
      <HomeStack.Screen name="UserProfile" component={UserProfileScreen} />
    </HomeStack.Navigator>
  );
}


function TabNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      initialRouteName="خانه"
      backBehavior="history"
      screenOptions={({ route }) => ({
        lazy: true, // این قابلیت برای تب‌بار می‌مونه تا تب‌ها فقط با کلیک لود بشن
        tabBarLabelStyle: { fontFamily: "Yekan_Bakh_Regular", fontSize: 13, textAlign: "center", marginBottom: 5 },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { height: 60 + insets.bottom, paddingBottom: insets.bottom, justifyContent: "center", alignItems: "center" },
        headerStyle: { backgroundColor: "#e2bce8" },
        headerTitleStyle: { fontFamily: "Yekan_Bakh_Bold", fontSize: 25, color: colors.primary },
        headerTitleAlign: "center",
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>["name"] = "accessibility";
          if (route.name === "خانه") iconName = focused ? "home" : "home-outline";
          else if (route.name === "پروفایل") iconName = focused ? "person" : "person-outline";
          else if (route.name === "وبلاگ") iconName = focused ? "book" : "book-outline";
          return <Ionicons name={iconName} color={color} size={size} />;
        }
      })}
    >
      <Tab.Screen name="پروفایل" component={ProfileScreeen} options={{ headerShown: false }} />
      <Tab.Screen
        name="خانه"
        component={HomeStackNavigator}
        options={{ headerShown: false }}
      />

      <Tab.Screen name="وبلاگ" component={MagScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const navigation = useNavigation<AppNavigationProp>();

  useEffect(() => {
    const handleBackPress = () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    return () => sub.remove();
  }, [navigation]);

  const headerBackButton = (canGoBack: boolean | undefined) =>
    canGoBack ? (
      <Ionicons
        name="arrow-forward"
        size={24}
        color={colors.primary}
        style={{ marginRight: 15 }}
        onPress={() => navigation.canGoBack() && navigation.goBack()}
      />
    ) : null;

  return (
    <AppStack.Navigator screenOptions={screenOptions} initialRouteName="MainTabs">
      <AppStack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
      <AppStack.Screen name="AddPortfolio" component={AddPortfolioScreen} options={{ gestureEnabled: false }} />
      <AppStack.Screen name="AddGallery" component={AddGalleryScreen} />
      <AppStack.Screen name="AllMemberGroups" component={AllMemberGroupsScreen} />
      <AppStack.Screen name="SubscriptionPurchase" component={SubscriptionPurchaseScreen} />
      <AppStack.Screen name="AddProduct" component={AddProductScreen} options={{ gestureEnabled: false }} />
      <AppStack.Screen name="CourseStudents" component={CourseStudentsScreen} options={{ gestureEnabled: false }} />
      <AppStack.Screen name="CourseRegistration" component={CourseRegistrationScreen} options={{ gestureEnabled: false }} />
      <AppStack.Screen name="MyProduct" component={MyProductScreen} />
      <AppStack.Screen name="AllPortfolio" component={AllPortfolioScreen} />
      <AppStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={({ navigation }) => ({
          headerShown: true,
          title: "ویرایش پروفایل",
          headerTitleAlign: "center",
          headerTitleStyle: styles.headerTitleStyle,
          headerStyle: styles.headerStyle,
          headerLeft: () => null,
          headerRight: () => headerBackButton(navigation.canGoBack()),
        })}
      />
      <AppStack.Screen name="AboutMe" component={AboutMeScreen} />
      <AppStack.Screen name="EditContactInfo" component={EditContactInfoScreen} />
      <AppStack.Screen name="ManageGalleryItems" component={ManageGalleryItemsScreen} />
      <AppStack.Screen name="MyResume" component={MyResumeScreen} />
      <AppStack.Screen name="MyGallery" component={MyGalleryScreen} />
      <AppStack.Screen name="AllGalleries" component={AllGalleriesScreen} />
      <AppStack.Screen name="MyPosts" component={MyPostsScreen} />
      <AppStack.Screen name="AddNewPost" component={AddNewPostScreen} options={{ gestureEnabled: false }} />
      <AppStack.Screen name="PortfolioDetail" component={PortfolioDetailScreen} options={{ gestureEnabled: false }} />
      <AppStack.Screen name="PortfolioList" component={PortfolioListScreen} options={{ gestureEnabled: false }} />
      <AppStack.Screen
        name="MyCourses"
        component={MyCoursesScreen}
        options={({ navigation }) => ({
          headerShown: true,
          headerTitleAlign: "center",
          headerTitleStyle: styles.headerTitleStyle,
          headerStyle: styles.headerStyle,
          headerLeft: () => null,
          headerRight: () => headerBackButton(navigation.canGoBack()),
        })}
      />
      <AppStack.Screen name="AddNewCourse" component={AddNewCourseScreen} options={{ gestureEnabled: false }} />
      <AppStack.Screen name="AllCourses" component={AllCoursesScreen} />
      <AppStack.Screen name="CourseDetails" component={CourseDetailsScreen} options={{ gestureEnabled: false }} />
      <AppStack.Screen name="MyRegistrations" component={MyRegistrationsScreen} options={{ gestureEnabled: false }} />
      <AppStack.Screen name="MyTeachingCourses" component={MyTeachingCoursesScreen} options={{ gestureEnabled: false }} />
      <AppStack.Screen name="ProductDetails" component={ProductDetailsScreen} options={{ gestureEnabled: false }} />
      <AppStack.Screen name="AllProducts" component={AllProductsScreen} options={{ gestureEnabled: false }} />
      <AppStack.Screen name="AllMembers" component={AllMembersScreen} options={{ gestureEnabled: false }} />
      <AppStack.Screen name="Subscription" component={SubscriptionScreen} options={{ gestureEnabled: false }} />
      <AppStack.Screen name="UserProfile" component={UserProfileScreen} options={{ gestureEnabled: false }} />
      <AppStack.Screen name="MagDetailes" component={MagDetailesScreen} />
      <AppStack.Screen name="GalleryItem" component={GalleryItemScreen} />
    </AppStack.Navigator>
  );
}