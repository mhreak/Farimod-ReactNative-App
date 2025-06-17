import React from "react";
import { Image, StyleSheet, View } from "react-native";
import colors from "../config/colors";
import AppText from "./Text";
import { MaterialIcons } from "@expo/vector-icons";

const CourseCard = () => {
  return (
    <View style={styles.container}>
      <Image
        style={styles.courseImage}
        source={require("../../assets/sample_clothe2.jpg")}
        resizeMode="cover"
      />
      <View style={styles.courseDetails}>
        <View style={styles.courseHeader}>
          <View
            style={{
              backgroundColor: colors.primaryLight,
              width: 50,
              height: 50,
              borderRadius: 10,
            }}
          ></View>
          <AppText
            style={{
              fontFamily: "iran_sans_bold",
              marginBottom: 10,
              textAlign: "center",
              marginRight: 15,
            }}
          >
            عنوان دوره
          </AppText>
        </View>
        <View style={styles.courseFooter}>
          <View
            style={{
              display: "flex",
              flexDirection: "row-reverse",
              borderTopWidth: 1,
              paddingTop: 12,
              borderTopColor: colors.gray,
            }}
          >
            <MaterialIcons
              name={"place"}
              size={25}
              color={colors.primary}
              style={{ marginLeft: 10, marginRight: 7 }}
            />
            <AppText style={{ fontFamily: "iran_sans_bold" }}>
              آدرس دوره:{" "}
            </AppText>
          </View>
          <AppText style={{ marginRight: 30, marginTop: 8 }}>
            خیابان مشتاق کوچه ۲۶ پلاک ۴۳
          </AppText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 375,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    borderRadius: 5,
    backgroundColor: colors.white, // Required for shadow visibility
    shadowColor: "#797979",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2, // Increased for visibility
    shadowRadius: 6,
    elevation: 4, // Increased for Android
    margin: 8, // Space for shadow to render
  },
  courseDetails: {
    height: 175, // Remaining height
    width: "100%",
    // padding: 10,
    // paddingRight: 20,
  },
  courseImage: {
    height: 200, // Half of container height
    width: "100%",
    // marginLeft: 30,
    // marginRight: 10,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 18,
  },
  courseHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    // marginBottom: 16,
    paddingHorizontal: 16,
  },
  courseFooter: {
    flexDirection: "column",
    padding: 12,
    justifyContent: "center",
  },
});

export default CourseCard;
