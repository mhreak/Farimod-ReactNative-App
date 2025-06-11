import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, Image } from "react-native";
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

const HomeScreen = () => {
  const navigation = useNavigation();
  const [selectedScreen, setSelectedScreen] = useState("Home");
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
          <View style={[styles.pagerViewItem]}>
            {/* <View style={styles.courseImage}></View> */}
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
                عنوان دوره
              </AppText>
              <View style={{ display: "flex", flexDirection: "row-reverse" }}>
                <MaterialIcons
                  name={"place"}
                  size={25}
                  color={colors.primary}
                  style={{ marginLeft: 10, marginRight: 7 }}
                />
                <AppText>آدرس دوره خیابان مشتاق کوچه ۲۶ پلاک ۴۳</AppText>
              </View>
            </View>
          </View>
          <View
            style={[styles.pagerViewItem, { backgroundColor: "blue" }]}
          ></View>
          <View
            style={[styles.pagerViewItem, { backgroundColor: "yellow" }]}
          ></View>
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
