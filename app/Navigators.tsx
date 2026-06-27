import React, { useEffect } from "react";
import { I18nManager, BackHandler } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoginScreen from "./screens/LoginScreen";
import OTPScreen from "./screens/OTPScreen";
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
import MyProductScreen from "./screens/MyProductScreen";
import AllPortfolioScreen from "./screens/AllPortfolioScreen";
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
import { Ionicons } from "@expo/vector-icons";
import colors from "./config/colors";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AllCoursesScreen from "./screens/AllCoursesScreen";
import AllProductsScreen from "./screens/AllProductsScreen";
import AllMembersScreen from "./screens/AllMemberScreen";
import ProductDetailsScreen from "./screens/ProductDetailsScreen";
import PortfolioDetailScreen from "./screens/PortfolioDetailScreen";
import AllGalleriesScreen from "./screens/AllGalleriesScreen";
import AddPortfolioScreen from "./screens/AddPortfolioScreen";
import { useAuth } from "./contexts/AuthContext";
import AddProductScreen from "./screens/AddNewProduct";
import AddGalleryScreen from "./screens/AddGalleryScreen";
import ManageGalleryItemsScreen from "./screens/ManageGalleryItemsScreen";
import EditContactInfoScreen from "./screens/EditContactInfoScreen";
import CourseStudentsScreen from "./screens/CourseStudentsScreen";
import MyRegistrationsScreen from "./screens/Myregistrationsscreen";
import CourseRegistrationScreen from "./screens/CourseRegistrationScreen";
import SubscriptionPurchaseScreen from "./screens/SubscriptionPurchaseScreen";
import AllMemberGroupsScreen from "./screens/AllMemberGroupsScreen";

export type RootStackParamList = {
  IntroFlow: undefined;
  App: { screen?: string; params?: any } | undefined;
  Auth: undefined;
  WelcomeIntro: undefined;
  WhyFrimod: undefined;
  EventsScreen: undefined;
  CareerScreen: undefined;
  MainTabs: { screen?: string; params?: any } | undefined;
  Login: undefined;
  OTP: { mobileNumber: string };
  Signup: undefined;
  EditProfile: undefined;
  AboutMe: undefined;
  EditContactInfo: undefined;
  MyResume: undefined;
  MyGallery: undefined;
  AddGallery: undefined;
  MyPosts: undefined;
  MyCourses: undefined;
  ManageGalleryItems: undefined;
  AddNewCourse: undefined;
  MagDetailes: { title?: string; blogId?: number };
  MyTeachingCourses: undefined;
  CourseStudents: undefined;
  MyRegistrations: undefined;
  CourseRegistration: undefined;
  SubscriptionPurchase: undefined;
  AllMemberGroups: undefined;
  AllCourses: { filteredMemberId?: number; filteredMemberName?: string; filterType?: string };
  AllProducts: { filteredMemberId?: number; filteredMemberName?: string; filterType?: string };
  AllMembers: undefined;
  ProductDetails: undefined;
  AddNewPost: undefined;
  PortfolioDetail: { title?: string; portfolioId?: number };
  PortfolioList: undefined;
  AllGalleries: { filteredMemberId?: number; filteredMemberName?: string; filterType?: string };
  AddPortfolio: undefined;
  MyProduct: undefined;
  AddProductScreen: undefined;
  AllPortfolio: { filteredMemberId?: number; filteredMemberName?: string; filterType?: string };
  MagScreen: { filteredMemberId?: number; filteredMemberName?: string; filterType?: string };
  GalleryItem: { title?: string; galleryId?: number };
  Subscription: undefined;
  CourseDetails: { courseData?: any; courseId?: number };
  UserProfile: { userData?: any };
};

export type AppNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();
const IntroStack = createStackNavigator();
const AuthStack = createStackNavigator();
const AppStack = createStackNavigator();

const customTransitionConfig = {
  animation: "timing",
  config: {
    duration: 200,
    useNativeDriver: true,
  },
};

const screenOptions = {
  gestureEnabled: true,
  gestureDirection: (I18nManager.isRTL
    ? "horizontal-inverted"
    : "horizontal") as "horizontal-inverted" | "horizontal",
  transitionSpec: {
    open: customTransitionConfig,
    close: customTransitionConfig,
  },
  cardStyleInterpolator: ({ current, layouts }: any) => ({
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
  }),
  headerShown: false,
};

function IntroFlowNavigator() {
  return (
    <IntroStack.Navigator
      screenOptions={{ ...screenOptions, headerShown: false }}
      initialRouteName="WelcomeIntro"
    >
      <IntroStack.Screen name="WelcomeIntro" component={WelcomeIntroScreen} />
      <IntroStack.Screen name="WhyFrimod" component={WhyFrimodScreen} />
      <IntroStack.Screen name="EventsScreen" component={EventsScreen} />
      <IntroStack.Screen name="CareerScreen" component={CareerScreen} />
    </IntroStack.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{ ...screenOptions, headerShown: false }}
      initialRouteName="Login"
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen
        name="OTP"
        component={OTPScreen}
        options={{ gestureEnabled: true }}
      />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

function TabNavigator() {
  const insets = useSafeAreaInsets();



  return (
    <Tab.Navigator
      initialRouteName="خانه"
      backBehavior="history" 
      screenOptions={({ route }) => ({
        lazy: true,
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
          } else if (route.name === "وبلاگ") {
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
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="خانه"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="وبلاگ"
        component={MagScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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
  }, []);

  const handleHeaderBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const headerBackButton = (canGoBack: boolean | undefined) =>
    canGoBack ? (
      <Ionicons
        name="arrow-forward"
        size={24}
        color={colors.primary}
        style={{ marginRight: 15 }}
        onPress={handleHeaderBack}
      />
    ) : null;

  return (
    <AppStack.Navigator
      screenOptions={screenOptions}
      initialRouteName="MainTabs"
    >
      <AppStack.Screen name="MainTabs" component={TabNavigator} />

      <AppStack.Screen
        name="AddPortfolio"
        component={AddPortfolioScreen}
        options={{ gestureEnabled: false }}
      />
      <AppStack.Screen name="AddGallery" component={AddGalleryScreen} />
      <AppStack.Screen name="AllMemberGroups" component={AllMemberGroupsScreen} />
      <AppStack.Screen name="SubscriptionPurchase" component={SubscriptionPurchaseScreen} />
      <AppStack.Screen
        name="AddProduct"
        component={AddProductScreen}
        options={{ gestureEnabled: false }}
      />
      <AppStack.Screen
        name="CourseStudents"
        component={CourseStudentsScreen}
        options={{ gestureEnabled: false }}
      />
      <AppStack.Screen
        name="CourseRegistration"
        component={CourseRegistrationScreen}
        options={{ gestureEnabled: false }}
      />
      <AppStack.Screen name="MyProduct" component={MyProductScreen} />
      <AppStack.Screen name="AllPortfolio" component={AllPortfolioScreen} />

      <AppStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          headerShown: true,
          title: "ویرایش پروفایل",
          headerTitleAlign: "center",
          headerTitleStyle: styles.headerTitleStyle,
          headerStyle: styles.headerStyle,
          headerLeft: () => null,
          headerRight: ({ canGoBack }) => headerBackButton(canGoBack),
        }}
      />

      <AppStack.Screen name="AboutMe" component={AboutMeScreen} />
      <AppStack.Screen name="EditContactInfo" component={EditContactInfoScreen} />
      <AppStack.Screen name="ManageGalleryItems" component={ManageGalleryItemsScreen} />
      <AppStack.Screen name="MyResume" component={MyResumeScreen} />
      <AppStack.Screen name="MyGallery" component={MyGalleryScreen} />
      <AppStack.Screen name="AllGalleries" component={AllGalleriesScreen} />
      <AppStack.Screen name="MyPosts" component={MyPostsScreen} />
      <AppStack.Screen
        name="AddNewPost"
        component={AddNewPostScreen}
        options={{ gestureEnabled: false }}
      />
      <AppStack.Screen
        name="PortfolioDetail"
        component={PortfolioDetailScreen}
        options={{ gestureEnabled: false }}
      />
      <AppStack.Screen
        name="PortfolioList"
        component={PortfolioListScreen}
        options={{ gestureEnabled: false }}
      />

      <AppStack.Screen
        name="MyCourses"
        component={MyCoursesScreen}
        options={{
          headerShown: true,
          headerTitleAlign: "center",
          headerTitleStyle: styles.headerTitleStyle,
          headerStyle: styles.headerStyle,
          headerLeft: () => null,
          headerRight: ({ canGoBack }) => headerBackButton(canGoBack),
        }}
      />

      <AppStack.Screen
        name="AddNewCourse"
        component={AddNewCourseScreen}
        options={{ gestureEnabled: false }}
      />
      <AppStack.Screen name="AllCourses" component={AllCoursesScreen} />
      <AppStack.Screen
        name="CourseDetails"
        component={CourseDetailsScreen}
        options={{ gestureEnabled: false }}
      />
      <AppStack.Screen
        name="MyRegistrations"
        component={MyRegistrationsScreen}
        options={{ gestureEnabled: false }}
      />
      <AppStack.Screen
        name="MyTeachingCourses"
        component={MyTeachingCoursesScreen}
        options={{ gestureEnabled: false }}
      />
      <AppStack.Screen
        name="ProductDetails"
        component={ProductDetailsScreen}
        options={{ gestureEnabled: false }}
      />
      <AppStack.Screen
        name="AllProducts"
        component={AllProductsScreen}
        options={{ gestureEnabled: false }}
      />
      <AppStack.Screen
        name="AllMembers"
        component={AllMembersScreen}
        options={{ gestureEnabled: false }}
      />
      <AppStack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{ gestureEnabled: false }}
      />
      <AppStack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{ gestureEnabled: false }}
      />
      <AppStack.Screen name="MagDetailes" component={MagDetailesScreen} />
      <AppStack.Screen name="GalleryItem" component={GalleryItemScreen} />
    </AppStack.Navigator>
  );
}

export function StackNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{ ...screenOptions, headerShown: false }}
    >
      {isAuthenticated ? (
        <Stack.Screen name="App" component={AppNavigator} />
      ) : (
        <>
          <Stack.Screen name="IntroFlow" component={IntroFlowNavigator} />
          <Stack.Screen name="Auth" component={AuthNavigator} />
        </>
      )}
    </Stack.Navigator>
  );
}