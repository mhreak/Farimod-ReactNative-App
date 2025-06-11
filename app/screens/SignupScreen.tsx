import React, { useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Screen from "../components/Screen";
import AppButton from "../components/Button";
import { Formik } from "formik";
import AppTextInput from "../components/TextInput";
import colors from "../config/colors";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AppText from "../components/Text";
import * as Yup from "yup";

const SignupScreen = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    selectedBadges: [],
  });

  const validationSchema = Yup.object().shape({
    mobileNumber: Yup.string().required("شماره موبایل وارد نشده است"),
  });

  // نمونه badge ها
  const availableBadges = [
    { id: 1, title: "طراحی گرافیک", icon: "palette" },
    { id: 2, title: "برنامه نویسی", icon: "code-tags" },
    { id: 3, title: "عکاسی", icon: "camera" },
    { id: 4, title: "نویسندگی", icon: "pencil" },
    { id: 5, title: "موسیقی", icon: "music" },
    { id: 6, title: "ورزش", icon: "basketball" },
    { id: 7, title: "آشپزی", icon: "chef-hat" },
    { id: 8, title: "سفر", icon: "airplane" },
    { id: 9, title: "مطالعه", icon: "book-open" },
    { id: 10, title: "بازی", icon: "gamepad-variant" },
  ];

  const handleStep1Submit = (values) => {
    setFormData((prev) => ({
      ...prev,
      firstName: values.firstName,
      lastName: values.lastName,
      mobileNumber: values.mobileNumber,
    }));
    setCurrentStep(2);
  };

  const toggleBadge = (badgeId: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedBadges: prev.selectedBadges.includes(badgeId)
        ? prev.selectedBadges.filter((id) => id !== badgeId)
        : [...prev.selectedBadges, badgeId],
    }));
  };

  const handleFinalSubmit = () => {
    console.log("Final form data:", formData);
    // اینجا می‌تونید داده‌ها رو به سرور ارسال کنید
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={styles.stepContainer}>
        <View
          style={[styles.stepCircle, currentStep >= 1 && styles.activeStep]}
        >
          <AppText
            style={[
              styles.stepNumber,
              currentStep >= 1 && styles.activeStepText,
            ]}
          >
            ۱
          </AppText>
        </View>
        <Text style={styles.stepLabel}>اطلاعات شخصی</Text>
      </View>

      <View
        style={[styles.stepLine, currentStep >= 2 && styles.activeStepLine]}
      />

      <View style={styles.stepContainer}>
        <View
          style={[styles.stepCircle, currentStep >= 2 && styles.activeStep]}
        >
          <Text
            style={[
              styles.stepNumber,
              currentStep >= 2 && styles.activeStepText,
            ]}
          >
            ۲
          </Text>
        </View>
        <Text style={styles.stepLabel}>علایق</Text>
      </View>
    </View>
  );

  const renderStep1 = () => (
    <Formik
      validationSchema={validationSchema}
      initialValues={{
        firstName: formData.firstName,
        lastName: formData.lastName,
        mobileNumber: formData.mobileNumber,
      }}
      onSubmit={handleStep1Submit}
    >
      {({ handleChange, handleSubmit, values, errors }) => (
        <View>
          <AppTextInput
            autoCapitalize="words"
            autoCorrect={false}
            icon="person"
            name="firstName"
            placeholder="نام"
            value={values.firstName}
            onChangeText={handleChange("firstName")}
          />

          <AppTextInput
            autoCapitalize="words"
            autoCorrect={false}
            icon="person"
            name="lastName"
            placeholder="نام خانوادگی"
            value={values.lastName}
            onChangeText={handleChange("lastName")}
          />

          <AppTextInput
            autoCapitalize="none"
            autoCorrect={false}
            icon="phone-android"
            keyboardType="phone-pad"
            name="mobileNumber"
            placeholder="شماره موبایل"
            value={values.mobileNumber}
            onChangeText={handleChange("mobileNumber")}
            error={errors.mobileNumber}
          />

          <AppButton
            style={styles.nextButton}
            title="مرحله بعد"
            onPress={handleSubmit}
          />
        </View>
      )}
    </Formik>
  );

  const renderStep2 = () => (
    <View>
      <AppText style={styles.sectionTitle}>علایق خود را انتخاب کنید:</AppText>

      <ScrollView
        style={styles.badgesContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.badgesGrid}>
          {availableBadges.map((badge) => {
            const isSelected = formData.selectedBadges.includes(badge.id);
            return (
              <TouchableOpacity
                key={badge.id}
                style={[styles.badge, isSelected && styles.selectedBadge]}
                onPress={() => toggleBadge(badge.id)}
              >
                <Icon
                  name={badge.icon}
                  size={20}
                  color={isSelected ? colors.white : colors.medium}
                />
                <AppText
                  style={[
                    styles.badgeText,
                    isSelected && styles.selectedBadgeText,
                  ]}
                >
                  {badge.title}
                </AppText>
                {isSelected && (
                  <TouchableOpacity
                    style={styles.removeIcon}
                    onPress={() => toggleBadge(badge.id)}
                  >
                    <Icon name="close" size={16} color={colors.white} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <AppButton
          style={[styles.backButton, { marginLeft: 10, width: "50%" }]}
          title="مرحله قبل"
          color="secondary"
          onPress={() => setCurrentStep(1)}
        />

        <AppButton
          style={[styles.submitButton, { width: "50%" }]}
          title="ثبت نام"
          onPress={handleFinalSubmit}
        />
      </View>
    </View>
  );

  return (
    <ImageBackground
      source={require("../../assets/backgrounds/fashion_pattern_1000px.jpg")}
      style={styles.background}
      resizeMode="repeat"
    >
      <Screen style={styles.container}>
        <View style={styles.loginBox}>
          <AppText style={styles.logingText}>ثبت نام</AppText>

          {renderStepIndicator()}

          {currentStep === 1 ? renderStep1() : renderStep2()}
        </View>
      </Screen>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    width: "100%",
    flex: 1,
  },
  container: {
    padding: 10,
    justifyContent: "center",
    fontFamily: "Yekan_Bakh_Regular",
  },
  loginBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: 20,
    padding: 20,
    maxHeight: "90%",
  },
  logingText: {
    fontSize: 40,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Yekan_Bakh_Bold",
  },

  // Step Indicator Styles
  stepIndicator: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  stepContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.light,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.medium,
  },
  activeStep: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepNumber: {
    fontSize: 16,
    color: colors.medium,
    fontFamily: "Yekan_Bakh_Bold",
  },
  activeStepText: {
    color: colors.white,
  },
  stepLabel: {
    marginTop: 8,
    fontSize: 12,
    color: colors.medium,
    fontFamily: "Yekan_Bakh_Regular",
  },
  stepLine: {
    width: 50,
    height: 2,
    backgroundColor: colors.light,
    marginHorizontal: 10,
    marginTop: -20,
  },
  activeStepLine: {
    backgroundColor: colors.primary,
  },

  // Step 2 Styles
  sectionTitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    color: colors.dark,
    fontFamily: "Yekan_Bakh_Bold",
  },
  badgesContainer: {
    maxHeight: 300,
    marginBottom: 20,
    paddingVertical: 10,
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  badge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: colors.light,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 10,
    minWidth: "45%",
    position: "relative",
    borderWidth: 1,
    borderColor: colors.medium,
  },
  selectedBadge: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  badgeText: {
    marginRight: 8,
    fontSize: 14,
    color: colors.dark,
    fontFamily: "Yekan_Bakh_Regular",
  },
  selectedBadgeText: {
    color: colors.white,
  },
  removeIcon: {
    position: "absolute",
    top: -5,
    left: 5,
    backgroundColor: colors.danger,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  // Button Styles
  nextButton: {
    marginTop: 20,
  },
  buttonContainer: {
    flexDirection: "row-reverse",
    marginTop: 20,
  },
  backButton: {
    backgroundColor: colors.medium,
  },
  submitButton: {},
});

export default SignupScreen;
