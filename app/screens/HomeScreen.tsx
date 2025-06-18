import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Screen from "../components/Screen";
import colors from "../config/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import PagerView from "react-native-pager-view";
import AppText from "../components/Text";
import Avatar from "../components/Avatar";
import { useNavigation } from "@react-navigation/native";
import MainBackground from "../components/MainBackground";

const navBarItems = [
  { icon: "person", title: "پروفایل", screenName: "Profile" },
  { icon: "home", title: "خانه", screenName: "Home" },
  { icon: "settings", title: "تنظیمات", screenName: "Settings" },
];

// Sample course data
const sampleCourses = [
  {
    id: 1,
    courseName: "دوره طراحی لباس پیشرفته",
    courseType: "حضوری",
    poster: "../../assets/sample_clothe.jpg",
    description: "این دوره شامل آموزش کامل طراحی و دوخت انواع لباس‌های مدرن و سنتی می‌باشد. در این دوره شما با تکنیک‌های پیشرفته طراحی آشنا خواهید شد.",
    coursePrice: "2,500,000",
    eventLocation: "تهران، خیابان ولیعصر، پلاک 245",
    phoneNumber: "021-88776655",
    coaches: "استاد احمدی، استاد رضایی",
    category: "هنر و صنایع دستی"
  },
  {
    id: 2,
    courseName: "دوره طراحی داخلی مدرن",
    courseType: "مجازی",
    poster: "../../assets/sample_clothe2.jpg",
    description: "آموزش اصول طراحی داخلی، استفاده از رنگ‌ها، فضا و نور در دکوراسیون منزل و محل کار.",
    coursePrice: "1,800,000",
    eventLocation: "آنلاین",
    phoneNumber: "021-77889900",
    coaches: "استاد محمدی",
    category: "طراحی و معماری"
  },
  {
    id: 3,
    courseName: "دوره عکاسی حرفه‌ای",
    courseType: "حضوری و مجازی",
    poster: "../../assets/sample_clothe.jpg",
    description: "یادگیری تکنیک‌های پیشرفته عکاسی، تنظیمات دوربین و ویرایش عکس.",
    coursePrice: "3,200,000",
    eventLocation: "تهران، میدان انقلاب",
    phoneNumber: "021-66554433",
    coaches: "استاد علوی، استاد کریمی",
    category: "هنر و رسانه"
  }
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const [selectedScreen, setSelectedScreen] = useState("Home");

  const handleCoursePress = (courseData) => {
    navigation.navigate("CourseDetails", { courseData });
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <MainBackground />
        <AppText style={styles.headerText}>عنوان</AppText>
        {/* <View style={styles.headerBox}>
        </View> */}
        <Image
          style={styles.headerBox}
          source={require("../../assets/sample_clothe.jpg")}
        />
        <AppText style={styles.bodyText}>جدید ترین دوره ها</AppText>
        <PagerView
          style={{ height: 150 }}
          initialPage={0}
          layoutDirection={"rtl"}
          pageMargin={20}
        >
          {sampleCourses.map((course, index) => (
            <TouchableOpacity
              key={course.id}
              style={[styles.pagerViewItem]}
              onPress={() => handleCoursePress(course)}
              activeOpacity={0.8}
            >
              <Image
                style={styles.courseImage}
                source={require("../../assets/sample_clothe2.jpg")}
              />
              <View style={styles.courseDetails}>
                <AppText
                  style={{
                    fontFamily: "Yekan_Bakh_Bold",
                    marginBottom: 10,
                    textAlign: "center",
                  }}
                >
                  {course.courseName}
                </AppText>
                <View style={{ display: "flex", flexDirection: "row-reverse" }}>
                  <MaterialIcons
                    name={"place"}
                    size={25}
                    color={colors.primary}
                    style={{ marginLeft: 10, marginRight: 7 }}
                  />
                  <AppText numberOfLines={2}>
                    {course.eventLocation}
                  </AppText>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </PagerView>
        <AppText style={styles.bodyText}>جدید ترین افراد</AppText>
        <PagerView
          style={{ height: 150 }}
          initialPage={0}
          layoutDirection={"rtl"}
          pageMargin={20}
        >
          <View style={styles.peopleContainer}>
            <Avatar name="فرد ۱"></Avatar>
            <Avatar name="فرد ۲"></Avatar>
            <Avatar name="فرد ۳"></Avatar>
          </View>
          <View style={styles.peopleContainer}>
            <Avatar name="فرد ۱"></Avatar>
            <Avatar name="فرد ۲"></Avatar>
            <Avatar name="فرد ۳"></Avatar>
          </View>
        </PagerView>
        {/* <View style={styles.navigationBar}>
        {navBarItems.map((item, index) => (
          <View style={selectedScreen === item.screenName && styles.navIcon}>
            <MaterialIcons
              key={index}
              name={item.icon}
              size={40}
              color={colors.primary}
              onPress={() => navigation.navigate(item.screenName)}
            />
          </View>
        ))}
      </View> */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 0,
    flex: 1,
  },
  courseDetails: {
    height: "100%",
    width: "60%",
    padding: 10,
    paddingRight: 20,
  },
  courseImage: {
    backgroundColor: "red",
    height: "90%",
    width: "40%",
    marginLeft: 30,
    marginRight: 10,
    borderRadius: 20,
  },
  bodyText: {
    marginVertical: 20,
    fontSize: 25,
  },
  headerText: {
    fontSize: 25,
    marginBottom: 10,
    fontFamily: "Yekan_Bakh_Bold",
  },
  headerBox: {
    height: 200,
    width: "100%",
    // backgroundColor: "orange",
    borderRadius: 20,
  },
  navIconSelect: {
    borderWidth: 1,
    borderRadius: "100%",
    padding: 8,
    borderColor: colors.primaryLight,
    backgroundColor: colors.primaryLight,
  },
  navigationBar: {
    padding: 20,
    margin: 20,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    height: "auto",
    position: "absolute",
    bottom: 20,
    right: 0,
    left: 0,
    display: "flex",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  pagerViewItem: {
    width: "100%",
    height: 150,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.medium,
  },
  peopleContainer: {
    height: 150,
    display: "flex",
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
});

export default HomeScreen;