import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Screen from "../components/Screen";
import colors from "../config/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import PagerView from "react-native-pager-view";
import AppText from "../components/Text";
import Avatar from "../components/Avatar";
import { useNavigation } from "@react-navigation/native";
import MainBackground from "../components/MainBackground";
import CourseCard from "../components/CourseCard";

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


  const [currentPage, setCurrentPage] = useState(0);
  const [currentPage2, setCurrentPage2] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const pagerRef2 = useRef<PagerView>(null);

  const totalPages = 5; // Number of CourseCard pages
  const autoScrollInterval = 3000; // فاصله زمانی جابه‌جایی خودکار (۳ ثانیه)

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentPage2 < 3 - 1) {
        pagerRef2.current?.setPage(currentPage2 + 1);
        setCurrentPage2(currentPage2 + 1);
      } else {
        pagerRef2.current?.setPage(0); // بازگشت به صفحه اول
        setCurrentPage2(0);
      }
    }, autoScrollInterval);

    return () => clearInterval(interval); // پاک‌سازی هنگام unmount
  }, [currentPage2]);

  // جابه‌جایی خودکار با setInterval
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentPage < totalPages - 1) {
        pagerRef.current?.setPage(currentPage + 1);
        setCurrentPage(currentPage + 1);
      } else {
        pagerRef.current?.setPage(0); // بازگشت به صفحه اول
        setCurrentPage(0);
      }
    }, autoScrollInterval);

    return () => clearInterval(interval); // پاک‌سازی هنگام unmount
  }, [currentPage, totalPages]);

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      pagerRef.current?.setPage(currentPage + 1);
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      pagerRef.current?.setPage(currentPage - 1);
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <View style={styles.container}>
      <MainBackground />
      <ScrollView showsVerticalScrollIndicator={false}>
        <PagerView
          ref={pagerRef2}
          style={[{ minHeight: 200 }, { transform: [{ scaleX: -1 }] }]}
          initialPage={0}
          layoutDirection={"rtl"}
          pageMargin={20}
          onPageSelected={(e) => setCurrentPage2(e.nativeEvent.position)}
        >
          <Image
            style={styles.headerBox}
            source={require("../../assets/sample_clothe.jpg")}
          />
          <Image
            style={styles.headerBox}
            source={require("../../assets/sample_clothe2.jpg")}
          />
          <Image
            style={styles.headerBox}
            source={require("../../assets/sample_clothe.jpg")}
          />
        </PagerView>
        <View style={styles.titleBox}>
          <View style={{ flexDirection: "row-reverse", alignItems: "center" }}>
            <View
              style={{ backgroundColor: colors.warning, width: 12, height: 12 }}
            />
            <AppText style={styles.bodyText}>جدید ترین دوره ها</AppText>
          </View>
          <View style={{ flexDirection: "row-reverse" }}>
            <TouchableOpacity
              style={[
                styles.navButton,
                currentPage === 0 && styles.disabledButton,
              ]}
              onPress={handlePrev}
              disabled={currentPage === 0}
            >
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={currentPage === 0 ? colors.gray : colors.white}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.navButton,
                currentPage === totalPages - 1 && styles.disabledButton,
              ]}
              onPress={handleNext}
              disabled={currentPage === totalPages - 1}
            >
              <MaterialIcons
                name="chevron-left"
                size={24}
                color={
                  currentPage === totalPages - 1 ? colors.gray : colors.white
                }
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.pagerContainer}>
          {/* <PagerView
            ref={pagerRef}
            style={[styles.pagerView, { minHeight: 320 }]}
            initialPage={0}
            layoutDirection="rtl"
            pageMargin={20}
            onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
          >
            <View key="1" style={styles.pageContainer}>
              <CourseCard />
            </View>
            <View key="2" style={styles.pageContainer}>
              <CourseCard />
            </View>
            <View key="3" style={styles.pageContainer}>
              <CourseCard />
            </View>
          </PagerView> */}
        </View>
        <PagerView
          ref={pagerRef}
          initialPage={0}
          layoutDirection={"rtl"}
          pageMargin={20}
          style={[
            styles.pagerView,
            { transform: [{ scaleX: -1 }] },
            { minHeight: 400 },
          ]}
          onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
        >
          <View key="1" style={{ transform: [{ scaleX: -1 }] }}>
            <CourseCard />
          </View>
          <View key="2" style={{ transform: [{ scaleX: -1 }] }}>
            <CourseCard />
          </View>
          <View key="3" style={{ transform: [{ scaleX: -1 }] }}>
            <CourseCard />
          </View>
          <View
            style={[styles.pagerViewItem, { backgroundColor: "blue" }]}
          ></View>
          <View
            style={[styles.pagerViewItem, { backgroundColor: "yellow" }]}
          ></View>
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
        <View style={styles.titleBox}>
          <View style={{ flexDirection: "row-reverse", alignItems: "center" }}>
            <View
              style={{ backgroundColor: colors.info, width: 12, height: 12 }}
            />
            <AppText style={styles.bodyText}>جدید ترین افراد</AppText>
          </View>
        </View>
        {/* <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Avatar name="فرد ۱"></Avatar>
          <Avatar name="فرد ۲"></Avatar>
          <Avatar name="فرد ۳"></Avatar>
          <Avatar name="فرد ۱"></Avatar>
          <Avatar name="فرد ۲"></Avatar>
          <Avatar name="فرد ۳"></Avatar>
        </ScrollView> */}
        <PagerView
          style={[{ minHeight: 170 }, { transform: [{ scaleX: -1 }] }]}
          initialPage={0}
          layoutDirection={"rtl"}
          pageMargin={20}
        >
          <View key="1" style={{ transform: [{ scaleX: -1 }] }}>
            <View style={styles.peopleContainer}>
              <Avatar name="فرد ۱"></Avatar>
              <Avatar name="فرد ۲"></Avatar>
              <Avatar name="فرد ۳"></Avatar>
            </View>
          </View>
          <View key="2" style={{ transform: [{ scaleX: -1 }] }}>
            <View style={styles.peopleContainer}>
              <Avatar name="فرد ۱"></Avatar>
              <Avatar name="فرد ۲"></Avatar>
              <Avatar name="فرد ۳"></Avatar>
            </View>
          </View>
        </PagerView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
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
    fontSize: 20,
    marginRight: 10,
    fontFamily: "iran_sans_black",
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
    height: 170,
    display: "flex",
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  titleBox: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    // marginVertical: 18,
    marginTop: 22,
  },
  pagerView: {
    // Remove fixed height to make it responsive to content
    // marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  pagerContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  pageContainer: {
    flex: 1,
    minHeight: 320, // Match CourseCard height (300) + margin
    justifyContent: "flex-start",
    alignItems: "center",
  },
  navButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 5,
  },
  disabledButton: {
    backgroundColor: colors.light,
    opacity: 0.6,
  },
});

export default HomeScreen;