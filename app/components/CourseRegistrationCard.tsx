import React from "react";
import { Image, StyleSheet, View, TouchableOpacity } from "react-native";
import colors from "../config/colors";
import AppText from "./Text";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { toPersianDigits, safeNumber, formatPrice, safeString } from "../utils/converters";

interface CourseRegistrationCardProps {
  registration: any;
  onPress?: (registration: any) => void;
}

const CourseRegistrationCard: React.FC<CourseRegistrationCardProps> = ({ registration, onPress }) => {
  const [imageError, setImageError] = React.useState(false);

  if (!registration) {
    return null;
  }

  const courseName = safeString(registration.CourseName, 'نام دوره نامشخص');
  const courseImage = registration.CourseFeaturedImageURL;
  const instructorName = safeString(registration.CourseMemberName, 'مربی نامشخص');
  const instructorImage = registration.CourseMemberAvatarImageURL;
  const registrationDate = registration.ShamsiRegisterDate;
  const state = safeNumber(registration.State || 0);
  const totalAmount = safeNumber(registration.TotalAmount || 0);
  const courseRegisterAmount = safeNumber(registration.CourseRegisterAmount || 0);
  const discount = safeNumber(registration.Discount || 0);
  const paymentType = safeNumber(registration.PaymentType || 0);
  const paymentTypeStr = safeString(registration.PaymentTypeStr, '');

  const getStatusInfo = (statusCode: number) => {
    switch (statusCode) {
      case 1:
        return { text: 'در انتظار پرداخت', color: '#f39c12', icon: 'schedule' };
      case 2:
        return { text: 'تسویه شده', color: '#2ecc71', icon: 'check-circle' };
      case 3:
        return { text: 'لغو شده', color: '#e74c3c', icon: 'cancel' };
      case 4:
        return { text: 'رد شده', color: '#95a5a6', icon: 'block' };
      default:
        return { text: 'نامشخص', color: '#95a5a6', icon: 'help-outline' };
    }
  };

  const statusInfo = getStatusInfo(state);

  const getPaymentTypeInfo = (type: number) => {
    switch (type) {
      case 1:
        return { text: 'پرداخت آنلاین', color: '#3498db', icon: 'credit-card' };
      case 2:
        return { text: 'پرداخت نقدی', color: '#27ae60', icon: 'money' };
      case 3:
        return { text: 'پرداخت چکی', color: '#8e44ad', icon: 'receipt' };
      default:
        return { text: paymentTypeStr || 'نامشخص', color: '#95a5a6', icon: 'payment' };
    }
  };

  const paymentTypeInfo = getPaymentTypeInfo(paymentType);

  const handlePress = () => {
    if (onPress) {
      onPress(registration);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  React.useEffect(() => {
    setImageError(false);
  }, [courseImage]);

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
            courseImage && !imageError
              ? { uri: courseImage }
              : require("../../assets/new_course.jpg")
          }
          resizeMode="cover"
          onError={handleImageError}
        />

        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
          <MaterialIcons
            name={statusInfo.icon as any}
            size={13}
            color="#fff"
          />
          <AppText style={styles.statusText}>{statusInfo.text}</AppText>
        </View>

        {/* Payment Type Badge */}
        <View style={[
          styles.typeBadge,
          { backgroundColor: paymentTypeInfo.color }
        ]}>
          <MaterialIcons
            name={paymentTypeInfo.icon as any}
            size={12}
            color="#fff"
          />
          <AppText style={styles.typeText}>{paymentTypeInfo.text}</AppText>
        </View>
      </View>

      <View style={styles.courseDetails}>
        <View style={styles.courseHeader}>
          <View style={styles.categoryIcon}>
            <MaterialCommunityIcons
              name="school"
              size={18}
              color={colors.primary}
            />
          </View>
          <View style={styles.headerContent}>
            <AppText style={styles.courseTitle} numberOfLines={2}>
              {courseName}
            </AppText>

            {registrationDate && (
              <View style={styles.dateContainer}>
                <MaterialIcons
                  name="event"
                  size={14}
                  color={"#4d4d4d"}
                  style={{ marginLeft: 4 }}
                />
                <AppText style={styles.dateText}>
                  {toPersianDigits(registrationDate)}
                </AppText>
              </View>
            )}
          </View>
        </View>

        <View style={styles.courseInfo}>
          {/* Instructor Section */}
          <View style={styles.instructorSection}>
            <View style={styles.instructorHeader}>
              <MaterialIcons
                name="person"
                size={14}
                color={colors.primary}
                style={{ marginLeft: 4 }}
              />
              <AppText style={styles.instructorLabel}>مربی:</AppText>
            </View>
            <AppText style={styles.instructorText} numberOfLines={1}>
              {instructorName}
            </AppText>
          </View>

          {/* Payment Section */}
          <View style={styles.paymentSection}>
            <View style={styles.paymentRow}>
              <View style={styles.paymentItem}>
                <MaterialIcons
                  name="attach-money"
                  size={14}
                  color={colors.primary}
                  style={{ marginLeft: 4 }}
                />
                <AppText style={styles.paymentLabel}>مبلغ دوره:</AppText>
              </View>
              <AppText style={styles.paymentAmount}>
                {formatPrice(courseRegisterAmount)}
              </AppText>
            </View>

            {discount > 0 && (
              <View style={styles.paymentRow}>
                <View style={styles.paymentItem}>
                  <MaterialIcons
                    name="local-offer"
                    size={14}
                    color="#e74c3c"
                    style={{ marginLeft: 4 }}
                  />
                  <AppText style={styles.discountLabel}>تخفیف:</AppText>
                </View>
                <AppText style={styles.discountAmount}>
                  {formatPrice(discount)}
                </AppText>
              </View>
            )}

            <View style={styles.paymentRow}>
              <View style={styles.paymentItem}>
                <MaterialIcons
                  name="payment"
                  size={14}
                  color="#2ecc71"
                  style={{ marginLeft: 4 }}
                />
                <AppText style={styles.totalLabel}>مبلغ پرداخت شده:</AppText>
              </View>
              <AppText style={styles.totalAmount}>
                {formatPrice(totalAmount)}
              </AppText>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    minHeight: 340,
    display: "flex",
    flexDirection: "column",
    borderRadius: 16,
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
    height: 160,
    width: "100%",
  },
  courseImage: {
    height: "100%",
    width: "100%",
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 10,
    zIndex: 2,
  },
  statusText: {
    fontSize: 10,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#fff',
    marginRight: 3,
  },
  typeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 10,
    zIndex: 2,
  },
  typeText: {
    fontSize: 9,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#fff',
    marginRight: 3,
  },
  courseDetails: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 8,
    flex: 1,
  },
  courseHeader: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  categoryIcon: {
    backgroundColor: colors.primaryLight,
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 7,
  },
  headerContent: {
    flex: 1,
  },
  courseTitle: {
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 13,
    color: '#2c3e50',
    textAlign: 'right',
    marginBottom: 4,
    lineHeight: 19,
  },
  dateContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 2,
  },
  dateText: {
    fontFamily: "Yekan_Bakh_Regular",
    fontSize: 11,
    color: "#747474",
    textAlign: 'right',
  },
  courseInfo: {
    flex: 1,
  },
  instructorSection: {
    borderTopWidth: 1,
    borderTopColor: colors.light,
    paddingTop: 6,
    marginBottom: 6,
  },
  instructorHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 3,
  },
  instructorLabel: {
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 11,
    color: '#34495e',
  },
  instructorText: {
    fontFamily: "Yekan_Bakh_Regular",
    fontSize: 11,
    color: "#7f8c8d",
    textAlign: 'right',
    paddingRight: 17,
  },
  paymentSection: {
    borderTopWidth: 1,
    borderTopColor: colors.light,
    paddingTop: 6,
  },
  paymentRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  paymentLabel: {
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 11,
    color: '#34495e',
  },
  paymentAmount: {
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 11,
    color: colors.primary,
  },
  discountLabel: {
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 11,
    color: '#34495e',
  },
  discountAmount: {
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 11,
    color: '#e74c3c',
  },
  totalLabel: {
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 11,
    color: '#34495e',
  },
  totalAmount: {
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 12,
    color: '#2ecc71',
  },
});

export default CourseRegistrationCard;