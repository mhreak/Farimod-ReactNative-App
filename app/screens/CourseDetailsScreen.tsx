import React from "react";
import AppText from "../components/Text";
import { ScrollView, StyleSheet, View, Image } from "react-native";
import colors from "../config/colors";
import MainBackground from "../components/MainBackground";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const CourseDetailsScreen = ({ route }) => {
  // You can get course data from route params or props
  const rawCourseData = route?.params?.courseData || {
    courseName: "دوره طراحی لباس پیشرفته",
    courseType: "حضوری",
    poster: "../../assets/sample_clothe.jpg",
    description: "این دوره شامل آموزش کامل طراحی و دوخت انواع لباس‌های مدرن و سنتی می‌باشد. در این دوره شما با تکنیک‌های پیشرفته طراحی آشنا خواهید شد.",
    coursePrice: "2,500,000",
    eventLocation: "تهران، خیابان ولیعصر، پلاک 245",
    phoneNumber: "021-88776655",
    coaches: "استاد احمدی، استاد رضایی",
    category: "هنر و صنایع دستی"
  };

  // Process coaches data - convert string to array of objects
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

  const DetailItem = ({ label, value, icon }) => (
    <View style={styles.detailItem}>
      <View style={styles.labelContainer}>
        <MaterialIcons
          name={icon}
          size={20}
          color={colors.primary}
          style={styles.icon}
        />
        <AppText style={styles.label}>{label}</AppText>
      </View>
      <View style={styles.valueContainer}>
        <AppText style={styles.value}>{value}</AppText>
      </View>
    </View>
  );

  const CoachItem = ({ coach }) => (
    <View style={styles.coachContainer}>
      <View style={styles.coachImageContainer}>
        {coach.image ? (
          <Image
            source={{ uri: coach.image }}
            style={styles.coachImage}
          />
        ) : (
          <View style={styles.coachDefaultIcon}>
            <MaterialIcons
              name="person"
              size={30}
              color={colors.white}
            />
          </View>
        )}
      </View>
      <AppText style={styles.coachName}>{coach.name}</AppText>
      <AppText style={styles.coachTitle}>مربی</AppText>
    </View>
  );

  const DetailItemWithCoaches = ({ label, coaches, icon }) => (
    <View style={styles.detailItem}>
      <View style={styles.labelContainer}>
        <MaterialIcons
          name={icon}
          size={20}
          color={colors.primary}
          style={styles.icon}
        />
        <AppText style={styles.label}>{label}</AppText>
      </View>
      <View style={styles.coachesValueContainer}>
        {coaches.map((coach, index) => (
          <CoachItem key={index} coach={coach} />
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <MainBackground />

      {/* Header Image */}
      <View style={styles.headerContainer}>
        <Image
          style={styles.headerImage}
          source={require("../../assets/sample_clothe.jpg")}
        />
        <View style={styles.overlay}>
          <AppText style={styles.courseTitle}>{courseData.courseName}</AppText>
        </View>
      </View>

      {/* Course Details */}
      <View style={styles.detailsContainer}>
        <AppText style={styles.sectionTitle}>جزئیات دوره</AppText>

        <DetailItem
          label="نوع دوره"
          value={courseData.courseType}
          icon="school"
        />

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
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 45,
    backgroundColor: colors.light,
  },
  headerContainer: {
    position: 'relative',
    height: 250,
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  courseTitle: {
    fontSize: 24,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.white,
    textAlign: 'center',
  },
  detailsContainer: {
    backgroundColor: colors.white,
    borderRadius: 20,
    margin: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  detailItem: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
    paddingBottom: 10,
  },
  labelContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 5,
  },
  icon: {
    marginLeft: 10,
  },
  label: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.medium,
  },
  valueContainer: {
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    padding: 12,
  },
  value: {
    fontSize: 16,
    color: colors.dark,
    textAlign: 'right',
    lineHeight: 24,
  },
  // New styles for coaches
  coachesValueContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  coachContainer: {
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  coachImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  coachImage: {
    width: '100%',
    height: '100%',
  },
  coachDefaultIcon: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coachName: {
    fontSize: 14,
    color: colors.dark,
    textAlign: 'center',
    fontFamily: "Yekan_Bakh_Bold",
    marginTop: 4,
  },
  coachTitle: {
    fontSize: 12,
    color: colors.medium,
    textAlign: 'center',
    fontFamily: "Yekan_Bakh_Regular",
    marginTop: -5,
  },
});

export default CourseDetailsScreen;