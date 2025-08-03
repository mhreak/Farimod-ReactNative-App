import React from "react";
import { Image, StyleSheet, View, TouchableOpacity } from "react-native";
import colors from "../config/colors";
import AppText from "./Text";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Course, CourseCardProps } from "../config/type";
import { toPersianDigits, safeNumber, formatPrice, safeStringIncludes, safeString } from "../utils/converters";
import appConfig from "../config/config";

const CourseCard: React.FC<CourseCardProps> = ({ course, onPress }) => {
  if (!course) {
    return null;
  }

  // استفاده از فیلد صحیح API برای قیمت
  const price = safeNumber(course.RegisterAmount); // تغییر از Price به RegisterAmount
  const specialPrice = safeNumber(course.SpecialSalePrice);
  const discountPercentage = specialPrice > 0 && price > 0
    ? Math.round(((price - specialPrice) / price) * 100)
    : 0;

  // Safe course type handling - استفاده از CourseType number
  const courseTypeNumber = safeNumber(course.CourseType);
  const getCourseTypeInfo = (type: number) => {
    switch (type) {
      case 1:
        return { text: 'حضوری', isPresential: true, color: '#4CAF50', icon: 'group' };
      case 2:
        return { text: 'مجازی', isPresential: false, color: '#2196F3', icon: 'computer' };
      case 3:
        return { text: 'حضوری و مجازی', isPresential: true, color: '#FF9800', icon: 'swap-horiz' };
      default:
        return { text: 'نامشخص', isPresential: false, color: '#9E9E9E', icon: 'help-outline' };
    }
  };

  const courseTypeInfo = getCourseTypeInfo(courseTypeNumber);
  const courseType = courseTypeInfo.text;
  const isPresential = courseTypeInfo.isPresential;

  const handlePress = () => {
    if (onPress) {
      onPress(course);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          style={styles.courseImage}
          source={
            course.CourseImageFileName
              ? { uri: `${appConfig.mobileApi}Course/GetCourseImage/${course.CourseImageFileName}` }
              : require("../../assets/sample_clothe2.jpg")
          }
          resizeMode="cover"
        />

        {discountPercentage > 0 && (
          <View style={styles.discountBadge}>
            <AppText style={styles.discountText}>
              {toPersianDigits(discountPercentage.toString())}% تخفیف
            </AppText>
          </View>
        )}

        <View style={[
          styles.typeBadge,
          { backgroundColor: courseTypeInfo.color }
        ]}>
          <MaterialIcons
            name={courseTypeInfo.icon as any}
            size={14}
            color="#fff"
          />
          <AppText style={styles.typeText}>{courseType}</AppText>
        </View>

        {/* Unavailable overlay */}
        {!course.RegisterActive && ( // تغییر از Active به RegisterActive
          <View style={styles.unavailableOverlay}>
            <MaterialIcons name="block" size={30} color="#fff" />
            <AppText style={styles.unavailableText}>ثبت‌نام غیرفعال</AppText>
          </View>
        )}
      </View>

      <View style={styles.courseDetails}>
        <View style={styles.courseHeader}>
          <View style={styles.categoryIcon}>
            <MaterialCommunityIcons
              name="school"
              size={24}
              color={colors.primary}
            />
          </View>
          <View style={styles.headerContent}>
            <AppText style={styles.courseTitle} numberOfLines={2}>
              {safeString(course.CourseName, 'نام دوره نامشخص')}
            </AppText>

            {/* Price Section - نمایش قیمت ثبت‌نام */}
            <View style={styles.priceSection}>
              {discountPercentage > 0 ? (
                <View style={styles.priceContainer}>
                  <AppText style={styles.originalPrice}>
                    {formatPrice(price)}
                  </AppText>
                  <AppText style={styles.specialPrice}>
                    {formatPrice(specialPrice)}
                  </AppText>
                </View>
              ) : (
                <AppText style={styles.coursePrice}>
                  {formatPrice(price)}
                </AppText>
              )}
            </View>


          </View>
        </View>

        <View style={styles.courseInfo}>
          {/* Location Section - استفاده از CourseAddress */}
          <View style={styles.locationSection}>
            <View style={styles.locationHeader}>
              <MaterialIcons
                name="place"
                size={16}
                color={colors.primary}
                style={{ marginLeft: 4 }}
              />
              <AppText style={styles.locationLabel}>محل برگزاری:</AppText>
            </View>
            <AppText style={styles.locationText} numberOfLines={1}>
              {safeString(course.CourseAddress, 'اطلاعات محل برگزاری موجود نیست')}
            </AppText>
          </View>



        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    minHeight: 380, // کاهش ارتفاع کلی
    display: "flex",
    flexDirection: "column",
    borderRadius: 20,
    backgroundColor: colors.white,
    shadowColor: "#797979",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 200,
    width: "100%",
  },
  courseImage: {
    height: "100%",
    width: "100%",
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 2,
  },
  discountText: {
    fontSize: 11,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#fff',
  },
  typeBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 2,
  },
  typeText: {
    fontSize: 10,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#fff',
    marginRight: 4,
  },
  unavailableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  unavailableText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#fff',
    marginTop: 8,
  },
  courseDetails: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    flex: 1,
  },
  courseHeader: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  categoryIcon: {
    backgroundColor: colors.primaryLight,
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  headerContent: {
    flex: 1,
  },
  courseTitle: {
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
    marginBottom: 4,
  },
  categoryText: {
    fontFamily: "Yekan_Bakh_Regular",
    fontSize: 12,
    color: colors.gray,
    textAlign: 'right',
    marginTop: 2,
  },
  courseInfo: {
    flex: 1,
  },
  priceSection: {
    marginTop: 4,
    marginBottom: 6,
    alignItems: 'flex-end',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  coursePrice: {
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 14,
    color: colors.primary,
    textAlign: 'right',
  },
  originalPrice: {
    fontFamily: "Yekan_Bakh_Regular",
    fontSize: 11,
    color: '#999',
    textAlign: 'right',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  specialPrice: {
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 14,
    color: '#ff6b6b',
    textAlign: 'right',
  },
  locationSection: {
    borderTopWidth: 1,
    borderTopColor: colors.light,
    paddingTop: 6,
    marginBottom: 4,
  },
  locationHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 3,
  },
  locationLabel: {
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 15,
    color: '#333',
  },
  locationText: {
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 15,
    color: "#a0a0a0",
    textAlign: 'right',
    paddingRight: 20,
    lineHeight: 14,
  },
  additionalInfo: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    flexWrap: 'wrap',
  },
  infoItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontFamily: "Yekan_Bakh_Regular",
    fontSize: 11,
    color: colors.gray,
    marginRight: 4,
  },
  // استایل‌های جدید برای جلسات
  sessionsSection: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.light,
  },
  sessionsLabel: {
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 12,
    color: '#333',
    marginBottom: 6,
    textAlign: 'right',
  },
  sessionsContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  sessionItem: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  sessionText: {
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 10,
    color: colors.primary,
    textAlign: 'center',
  },
  sessionTime: {
    fontFamily: "Yekan_Bakh_Regular",
    fontSize: 9,
    color: colors.gray,
    textAlign: 'center',
    marginTop: 2,
  },
});

export default CourseCard;