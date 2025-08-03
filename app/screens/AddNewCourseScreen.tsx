import React, { useEffect, useRef, useState } from "react";
import AppText from "../components/Text";
import { Formik } from "formik";
import { ScrollView, StyleSheet, View, Image, TouchableOpacity, Animated } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import * as Yup from "yup";
import AppTextInput from "../components/TextInput";
import colors from "../config/colors";
import AppButton from "../components/Button";
import AppPicker from "../components/Picker";
import AppDatePicker from "../components/AppDatePicker";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";
import Screen from "../components/Screen";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { AppNavigationProp } from "../Navigators";
import CustomTimePicker from "../components/CustomTimePicker";
import appConfig from "../config/config";

const AppCheckBox = ({ checked, onPress, label, icon }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 5
    }}
  >
    <MaterialIcons
      name={checked ? "check-box" : "check-box-outline-blank"}
      size={24}
      color={checked ? colors.primary : colors.medium}
    />
    <MaterialIcons
      name={icon}
      size={20}
      color={colors.medium}
      style={{ marginLeft: 8, marginRight: 8 }}
    />
    <AppText style={{
      color: checked ? colors.primary : colors.medium,
      fontFamily: checked ? "Yekan_Bakh_Bold" : "Yekan_Bakh_Regular"
    }}>
      {label}
    </AppText>
  </TouchableOpacity>
);

const AddNewCourseScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { toastVisible, setToastVisible, toastMessage, toastType, showToast } = useToast();

  // State for managing form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for provinces and cities
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const iconFadeAnim = useRef(new Animated.Value(0)).current;
  const iconSlideAnim = useRef(new Animated.Value(-30)).current;
  const formFadeAnim = useRef(new Animated.Value(0)).current;
  const formSlideAnim = useRef(new Animated.Value(30)).current;
  const backButtonAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Fetch provinces on component mount
  useEffect(() => {
    fetchProvinces();
  }, []);

  // Fetch provinces function
  const fetchProvinces = async () => {
    setLoadingProvinces(true);
    try {
      const response = await fetch(`${appConfig.mobileApi}Province/GetAllActive?pageSize=10000`);

      if (response.ok) {
        const data = await response.json();
        // تبدیل استان‌ها به فرمت مناسب برای AppPicker
        const provinceOptions = data.Items.map(province => ({
          value: province.ProvinceId,
          label: province.ProvinceName,
          cityCount: province.CityCount
        }));
        setProvinces(provinceOptions);
      } else {
        showToast('خطا در دریافت لیست استان‌ها', 'error');
      }
    } catch (error) {
      console.error('Error fetching provinces:', error);
      showToast('خطا در دریافت لیست استان‌ها', 'error');
    } finally {
      setLoadingProvinces(false);
    }
  };

  // Fetch cities when province is selected
  const fetchCities = async (provinceId) => {
    if (!provinceId) {
      setCities([]);
      return;
    }

    setLoadingCities(true);
    try {
      const response = await fetch(`${appConfig.mobileApi}City/GetAllActiveByProvinceId?provinceId=${provinceId}&page=1&pageSize=2000000`);

      if (response.ok) {
        const data = await response.json();
        // تبدیل شهرها به فرمت مناسب برای AppPicker
        const cityOptions = data.Items ? data.Items.map(city => ({
          value: city.CityId,
          label: city.CityName
        })) : [];
        setCities(cityOptions);
      } else {
        showToast('خطا در دریافت لیست شهرها', 'error');
        setCities([]);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      showToast('خطا در دریافت لیست شهرها', 'error');
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  useEffect(() => {
    // Sequential animations for better effect
    Animated.sequence([
      // Back button appears first
      Animated.timing(backButtonAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Icon appears
      Animated.parallel([
        Animated.timing(iconFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(iconSlideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // Form appears
      Animated.parallel([
        Animated.timing(formFadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(formSlideAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Continuous pulse animation for icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const validationSchema = Yup.object().shape({
    courseName: Yup.string().required("نام دوره الزامی است"),
    courseType: Yup.number().required("نوع دوره الزامی است"),
    cityId: Yup.number().required("شهر الزامی است"),
    provinceId: Yup.number().required("استان الزامی است"),
    courseAddress: Yup.string().required("آدرس دوره الزامی است"),
    startDate: Yup.date().required("تاریخ شروع الزامی است"),
    finishDate: Yup.date().required("تاریخ پایان الزامی است"),
    registerStartDate: Yup.date().required("تاریخ شروع ثبت نام الزامی است"),
    registerFinishDate: Yup.date().required("تاریخ پایان ثبت نام الزامی است"),
    registerAmount: Yup.number().required("مبلغ ثبت نام الزامی است").min(0, "مبلغ نمی تواند منفی باشد"),
  });

  // تابع برای نمایش اولین ارور در Toast
  const showValidationErrors = (errors) => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const firstError = errors[errorKeys[0]];
      showToast(firstError, 'error');
    }
  };

  const submitCourse = async (values, { setErrors }) => {
    setIsSubmitting(true);

    try {
      // اعتبارسنجی دستی برای فیلدهای اضافی
      const validationErrors = {};

      if (!values.courseName?.trim()) {
        validationErrors.courseName = "نام دوره الزامی است";
      }
      if (!values.courseType) {
        validationErrors.courseType = "نوع دوره الزامی است";
      }
      if (!values.cityId) {
        validationErrors.cityId = "شهر الزامی است";
      }
      if (!values.provinceId) {
        validationErrors.provinceId = "استان الزامی است";
      }
      if (!values.courseAddress?.trim()) {
        validationErrors.courseAddress = "آدرس دوره الزامی است";
      }
      if (!values.startDate) {
        validationErrors.startDate = "تاریخ شروع الزامی است";
      }
      if (!values.finishDate) {
        validationErrors.finishDate = "تاریخ پایان الزامی است";
      }
      if (!values.registerStartDate) {
        validationErrors.registerStartDate = "تاریخ شروع ثبت نام الزامی است";
      }
      if (!values.registerFinishDate) {
        validationErrors.registerFinishDate = "تاریخ پایان ثبت نام الزامی است";
      }
      if (values.registerAmount === null || values.registerAmount === undefined) {
        validationErrors.registerAmount = "مبلغ ثبت نام الزامی است";
      } else if (values.registerAmount < 0) {
        validationErrors.registerAmount = "مبلغ نمی تواند منفی باشد";
      }

      // اعتبارسنجی ساعات برای روزهای انتخاب شده
      const weekDays = [
        { key: 'saturday', label: 'شنبه' },
        { key: 'sunday', label: 'یکشنبه' },
        { key: 'monday', label: 'دوشنبه' },
        { key: 'tuesday', label: 'سه‌شنبه' },
        { key: 'wednesday', label: 'چهارشنبه' },
        { key: 'thursday', label: 'پنج‌شنبه' },
        { key: 'friday', label: 'جمعه' },
      ];

      weekDays.forEach(day => {
        if (values[`has${day.key.charAt(0).toUpperCase() + day.key.slice(1)}Session`]) {
          if (!values[`${day.key}StartTime`]) {
            validationErrors[`${day.key}StartTime`] = `ساعت شروع ${day.label} الزامی است`;
          }
          if (!values[`${day.key}FinishTime`]) {
            validationErrors[`${day.key}FinishTime`] = `ساعت پایان ${day.label} الزامی است`;
          }
        }
      });

      // اگر ارور وجود داره، در Toast نمایش بده
      if (Object.keys(validationErrors).length > 0) {
        showValidationErrors(validationErrors);
        setErrors(validationErrors);
        setIsSubmitting(false);
        return;
      }

      const courseData = {
        CourseId: 0,
        CourseName: values.courseName,
        MemberId: values.memberId,
        MemberName: values.memberName || "",
        CourseType: values.courseType,
        CityId: values.cityId,
        CityName: values.cityName || "",
        ProvinceId: values.provinceId,
        ProvinceName: values.provinceName || "",
        CourseAddress: values.courseAddress,
        HasSaturdaySession: values.hasSaturdaySession || false,
        Saturday_StartTime: values.saturdayStartTime || "",
        Saturday_FinishTime: values.saturdayFinishTime || "",
        HasSundaySession: values.hasSundaySession || false,
        Sunday_StartTime: values.sundayStartTime || "",
        Sunday_FinishTime: values.sundayFinishTime || "",
        HasMondaySession: values.hasMondaySession || false,
        Monday_StartTime: values.mondayStartTime || "",
        Monday_FinishTime: values.mondayFinishTime || "",
        HasTuesdaySession: values.hasTuesdaySession || false,
        Tuesday_StartTime: values.tuesdayStartTime || "",
        Tuesday_FinishTime: values.tuesdayFinishTime || "",
        HasWednesdaySession: values.hasWednesdaySession || false,
        Wednesday_StartTime: values.wednesdayStartTime || "",
        Wednesday_FinishTime: values.wednesdayFinishTime || "",
        HasThursdaySession: values.hasThursdaySession || false,
        Thursday_StartTime: values.thursdayStartTime || "",
        Thursday_FinishTime: values.thursdayFinishTime || "",
        HasFridaySession: values.hasFridaySession || false,
        Friday_StartTime: values.fridayStartTime || "",
        Friday_FinishTime: values.fridayFinishTime || "",
        StartDate: values.startDate,
        FinishDate: values.finishDate,
        RegisterStartDate: values.registerStartDate,
        RegisterFinishDate: values.registerFinishDate,
        RegisterAmount: values.registerAmount,
        AllowDiscountCode: values.allowDiscountCode || false,
        RegisterActive: values.registerActive !== undefined ? values.registerActive : true,
        InsertDate: new Date().toISOString(),
        LikeCount: 0
      };

      const response = await fetch('${appConfig.mobileApi}Course/Add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });

      if (response.ok) {
        const result = await response.json();
        showToast('دوره با موفقیت ثبت شد', 'success');
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      } else {
        throw new Error('خطا در ثبت دوره');
      }
    } catch (error) {
      console.error('Error submitting course:', error);
      showToast('خطا در ثبت دوره', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const courseTypeOptions = [
    { value: 1, label: "حضوری" },
    { value: 2, label: "مجازی" },
    { value: 3, label: "حضوری و مجازی" },
  ];

  const WeeklySchedule = ({ values, setFieldValue }) => {
    const weekDays = [
      { key: 'saturday', label: 'شنبه', icon: 'today' },
      { key: 'sunday', label: 'یکشنبه', icon: 'today' },
      { key: 'monday', label: 'دوشنبه', icon: 'today' },
      { key: 'tuesday', label: 'سه‌شنبه', icon: 'today' },
      { key: 'wednesday', label: 'چهارشنبه', icon: 'today' },
      { key: 'thursday', label: 'پنج‌شنبه', icon: 'today' },
      { key: 'friday', label: 'جمعه', icon: 'today' },
    ];

    return (
      <View style={improvedStyles.scheduleContainer}>
        <View style={improvedStyles.sectionHeader}>
          <MaterialIcons name="schedule" size={24} color={colors.primary} />
          <AppText style={improvedStyles.sectionTitle}>برنامه هفتگی کلاس‌ها</AppText>
        </View>
        <AppText style={improvedStyles.noteText}>
          روزهای برگزاری کلاس و ساعات مربوطه را انتخاب کنید
        </AppText>

        {weekDays.map((day) => {
          const hasSessionKey = `has${day.key.charAt(0).toUpperCase() + day.key.slice(1)}Session`;
          const startTimeKey = `${day.key}StartTime`;
          const finishTimeKey = `${day.key}FinishTime`;
          const hasSession = values[hasSessionKey];

          return (
            <View key={day.key} style={improvedStyles.dayCard}>
              {/* Header روز */}
              <TouchableOpacity
                style={[
                  improvedStyles.dayHeader,
                  hasSession && improvedStyles.dayHeaderActive
                ]}
                onPress={() => {
                  setFieldValue(hasSessionKey, !hasSession);
                  if (!hasSession) {
                    // اگر روز غیرفعال می‌شود، ساعات را پاک کن
                    setFieldValue(startTimeKey, "");
                    setFieldValue(finishTimeKey, "");
                  }
                }}
              >
                <View style={improvedStyles.dayHeaderContent}>
                  <View style={improvedStyles.dayInfo}>
                    <MaterialIcons
                      name={day.icon}
                      size={20}
                      color={hasSession ? colors.white : colors.medium}
                      style={improvedStyles.dayIcon}
                    />
                    <AppText style={[
                      improvedStyles.dayLabel,
                      hasSession && improvedStyles.dayLabelActive
                    ]}>
                      {day.label}
                    </AppText>
                  </View>

                  <View style={[
                    improvedStyles.checkbox,
                    hasSession && improvedStyles.checkboxActive
                  ]}>
                    {hasSession && (
                      <MaterialIcons
                        name="check"
                        size={16}
                        color={colors.white}
                      />
                    )}
                  </View>
                </View>
              </TouchableOpacity>

              {/* ساعات کلاس */}
              {hasSession && (
                <View style={improvedStyles.timeSection}>
                  <View style={improvedStyles.timeInputsContainer}>

                    <View style={improvedStyles.timeInputWrapper}>
                      <AppText style={improvedStyles.timeLabel}>پایان</AppText>
                      <CustomTimePicker
                        icon="schedule"
                        placeholder="00:00"
                        value={values[finishTimeKey]}
                        onTimeChange={(time) => setFieldValue(finishTimeKey, time)}
                        style={improvedStyles.timeInput}
                      />
                    </View>
                    <View style={improvedStyles.timeSeparator}>
                      <MaterialIcons
                        name="arrow-back"
                        size={20}
                        color={colors.medium}
                      />
                    </View>
                    <View style={improvedStyles.timeInputWrapper}>
                      <AppText style={improvedStyles.timeLabel}>شروع</AppText>
                      <CustomTimePicker
                        icon="schedule"
                        placeholder="00:00"
                        value={values[startTimeKey]}
                        onTimeChange={(time) => setFieldValue(startTimeKey, time)}
                        style={improvedStyles.timeInput}
                      />
                    </View>

                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.backgroundContainer}>
      <View style={styles.backgroundWrapper}>
        <Image
          source={require('../../assets/backgrounds/background-1.jpg')}
          style={styles.backgroundImage}
        />
      </View>

      <LinearGradient
        colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,1)']}
        style={styles.gradientOverlay}
      >
        <Screen style={styles.container}>
          {/* Toast خارج از ScrollView */}
          <Toast
            visible={toastVisible}
            message={toastMessage}
            type={toastType}
            onHide={() => setToastVisible(false)}
          />

          <Animated.View
            style={[
              styles.backButton,
              {
                opacity: backButtonAnim,
                transform: [{ scale: backButtonAnim }],
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
            >
              <View style={styles.backButtonGlass}>
                <MaterialIcons
                  name="arrow-forward"
                  size={24}
                  color="white"
                />
              </View>
            </TouchableOpacity>
          </Animated.View>

          <ScrollView showsVerticalScrollIndicator={false}>

            <Animated.View
              style={[
                styles.iconContainer,
                {
                  opacity: iconFadeAnim,
                  transform: [
                    { translateY: iconSlideAnim },
                    { scale: pulseAnim },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark || colors.primary]}
                style={styles.iconCircle}
              >
                <View style={styles.iconInnerCircle}>
                  <MaterialIcons name="school" color={colors.white} size={50} />
                </View>
                {/* Decorative ring */}
                <View style={styles.iconRing} />
              </LinearGradient>
            </Animated.View>

            <Animated.View
              style={[
                styles.formBox,
                {
                  opacity: formFadeAnim,
                  transform: [{ translateY: formSlideAnim }],
                },
              ]}
            >
              {/* Glassmorphism overlay */}
              <View style={styles.glassOverlay} />

              {/* Content */}
              <View style={styles.contentContainer}>
                <AppText style={styles.titleText}>افزودن دوره جدید</AppText>

                <Formik
                  initialValues={{
                    courseName: "",
                    courseType: null,
                    memberId: null,
                    memberName: "",
                    cityId: null,
                    cityName: "",
                    provinceId: null,
                    provinceName: "",
                    courseAddress: "",
                    startDate: null,
                    finishDate: null,
                    registerStartDate: null,
                    registerFinishDate: null,
                    registerAmount: null,
                    allowDiscountCode: null,
                    registerActive: null,
                    // Weekly sessions
                    hasSaturdaySession: false,
                    saturdayStartTime: "",
                    saturdayFinishTime: "",
                    hasSundaySession: false,
                    sundayStartTime: "",
                    sundayFinishTime: "",
                    hasMondaySession: false,
                    mondayStartTime: "",
                    mondayFinishTime: "",
                    hasTuesdaySession: false,
                    tuesdayStartTime: "",
                    tuesdayFinishTime: "",
                    hasWednesdaySession: false,
                    wednesdayStartTime: "",
                    wednesdayFinishTime: "",
                    hasThursdaySession: false,
                    thursdayStartTime: "",
                    thursdayFinishTime: "",
                    hasFridaySession: false,
                    fridayStartTime: "",
                    fridayFinishTime: "",
                  }}
                  onSubmit={submitCourse}
                  validate={(values) => {
                    // حذف validation schema برای جلوگیری از نمایش ارورها زیر اینپوت‌ها
                    return {};
                  }}
                >
                  {({ handleChange, handleSubmit, errors, values, setFieldValue }) => (
                    <>
                      <View>
                        {/* Basic Course Information */}
                        <AppTextInput
                          autoCapitalize="none"
                          autoCorrect={false}
                          icon="menu-book"
                          keyboardType="default"
                          placeholder="نام دوره"
                          onChangeText={handleChange("courseName")}
                          value={values.courseName}
                        />

                        <AppPicker
                          items={courseTypeOptions}
                          onSelectItem={(item) => setFieldValue("courseType", item?.value)}
                          selectedItem={values.courseType ? courseTypeOptions.find(item => item.value === values.courseType) : null}
                          icon="computer"
                          placeholder="نوع دوره"
                        />

                        <AppTextInput
                          autoCapitalize="none"
                          autoCorrect={false}
                          icon="person-outline"
                          keyboardType="default"
                          placeholder="نام عضو"
                          onChangeText={handleChange("memberName")}
                          value={values.memberName}
                        />

                        {/* Province Picker */}
                        <AppPicker
                          items={provinces}
                          onSelectItem={(item) => {
                            setFieldValue("provinceId", item?.value);
                            setFieldValue("provinceName", item?.label);
                            // Reset city when province changes
                            setFieldValue("cityId", null);
                            setFieldValue("cityName", "");
                            // Fetch cities for selected province
                            if (item?.value) {
                              fetchCities(item.value);
                            } else {
                              setCities([]);
                            }
                          }}
                          selectedItem={values.provinceId ? provinces.find(item => item.value === values.provinceId) : null}
                          icon="map"
                          placeholder={loadingProvinces ? "در حال بارگذاری..." : "استان"}

                        />

                        {/* City Picker */}
                        <AppPicker
                          items={cities}
                          onSelectItem={(item) => {
                            setFieldValue("cityId", item?.value);
                            setFieldValue("cityName", item?.label);
                          }}
                          selectedItem={values.cityId ? cities.find(item => item.value === values.cityId) : null}
                          icon="location-city"
                          placeholder="شهرستان"
                          onPress={!values.provinceId || loadingCities || cities.length === 0 ? () => {
                            if (!values.provinceId) {
                              showToast('ابتدا استان را انتخاب کنید', 'error');
                            } else if (loadingCities) {
                              showToast('در حال بارگذاری...', 'info');
                            } else if (cities.length === 0) {
                              showToast('شهری یافت نشد', 'error');
                            }
                          } : undefined}
                        />

                        <AppTextInput
                          autoCapitalize="none"
                          autoCorrect={false}
                          icon="location-on"
                          keyboardType="default"
                          placeholder="آدرس دوره"
                          onChangeText={handleChange("courseAddress")}
                          value={values.courseAddress}
                          multiline={true}
                          numberOfLines={3}
                        />

                        {/* Weekly Schedule Section */}
                        <WeeklySchedule values={values} setFieldValue={setFieldValue} />

                        {/* Registration Information */}
                        <AppTextInput
                          autoCapitalize="none"
                          autoCorrect={false}
                          icon="attach-money"
                          keyboardType="numeric"
                          placeholder="مبلغ ثبت نام"
                          onChangeText={(text) => setFieldValue("registerAmount", text ? parseInt(text) : null)}
                          value={values.registerAmount?.toString() || ""}
                        />

                        <AppPicker
                          items={[
                            { value: true, label: "فعال" },
                            { value: false, label: "غیرفعال" }
                          ]}
                          onSelectItem={(item) => setFieldValue("registerActive", item?.value)}
                          selectedItem={values.registerActive !== null && values.registerActive !== undefined ?
                            { value: values.registerActive, label: values.registerActive ? "فعال" : "غیرفعال" } :
                            null}
                          icon="check-circle"
                          placeholder="وضعیت ثبت نام"
                        />

                        <AppPicker
                          items={[
                            { value: true, label: "مجاز" },
                            { value: false, label: "غیرمجاز" }
                          ]}
                          onSelectItem={(item) => setFieldValue("allowDiscountCode", item?.value)}
                          selectedItem={values.allowDiscountCode !== null && values.allowDiscountCode !== undefined ?
                            { value: values.allowDiscountCode, label: values.allowDiscountCode ? "مجاز" : "غیرمجاز" } :
                            null}
                          icon="local-offer"
                          placeholder="کد تخفیف"
                        />

                        <AppDatePicker
                          icon="event"
                          placeholder="تاریخ شروع دوره"
                          value={values.startDate}
                          onDateChange={(date) => setFieldValue("startDate", date)}
                          mode="date"
                          minimumDate={new Date()}
                        />

                        <AppDatePicker
                          icon="event-available"
                          placeholder="تاریخ پایان دوره"
                          value={values.finishDate}
                          onDateChange={(date) => setFieldValue("finishDate", date)}
                          mode="date"
                          minimumDate={values.startDate || new Date()}
                        />

                        <AppDatePicker
                          icon="how-to-reg"
                          placeholder="تاریخ شروع ثبت نام"
                          value={values.registerStartDate}
                          onDateChange={(date) => setFieldValue("registerStartDate", date)}
                          mode="date"
                          minimumDate={new Date()}
                        />

                        <AppDatePicker
                          icon="assignment-turned-in"
                          placeholder="تاریخ پایان ثبت نام"
                          value={values.registerFinishDate}
                          onDateChange={(date) => setFieldValue("registerFinishDate", date)}
                          mode="date"
                          minimumDate={values.registerStartDate || new Date()}
                          maximumDate={values.startDate}
                        />

                        <AppButton
                          title={isSubmitting ? "در حال ثبت..." : "ثبت دوره"}
                          onPress={handleSubmit}
                          color={colors.success}
                          disabled={isSubmitting}
                        />
                      </View>
                    </>
                  )}
                </Formik>
              </View>
            </Animated.View>
          </ScrollView>
        </Screen>
      </LinearGradient>
    </View>
  );
};

const improvedStyles = StyleSheet.create({
  scheduleContainer: {
    marginTop: 25,
    marginBottom: 25,
  },

  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 5,
  },

  sectionTitle: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.primary,
    marginRight: 8,
  },

  noteText: {
    fontSize: 13,
    color: colors.medium,
    textAlign: 'right',
    marginBottom: 20,
    paddingHorizontal: 5,
    lineHeight: 20,
  },

  dayCard: {
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 206, 232, 0.2)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  dayHeader: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 206, 232, 0.1)',
  },

  dayHeaderActive: {
    backgroundColor: colors.primary,
  },

  dayHeaderContent: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dayInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },

  dayIcon: {
    marginLeft: 8,
  },

  dayLabel: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: colors.dark,
  },

  dayLabelActive: {
    color: colors.white,
    fontFamily: "Yekan_Bakh_Bold",
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.medium,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkboxActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: colors.white,
  },

  timeSection: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },

  timeInputsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  timeInputWrapper: {
    flex: 1,
    alignItems: 'center',
  },

  timeLabel: {
    fontSize: 12,
    color: colors.medium,
    marginBottom: 8,
    fontFamily: "Yekan_Bakh_Regular",
  },

  timeInput: {
    width: '100%',
  },

  timeSeparator: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
});

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
  },
  backgroundWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'repeat',
  },
  gradientOverlay: {
    flex: 1,
  },
  container: {
    padding: 10,
    backgroundColor: 'transparent',
  },
  backButton: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 10,
  },
  backButtonGlass: {
    backgroundColor: '#9E22AD',
    borderRadius: 25,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 206, 232, 0.5)',
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: -110,
    marginTop: 50,
    zIndex: 1000,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: 'rgba(255, 206, 232, 0.2)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  iconInnerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 206, 232, 0.15)',
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: 'rgba(255, 206, 232, 0.4)',
    zIndex: 99,
  },
  iconRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 206, 232, 0.3)',
    borderStyle: 'dashed',
  },
  formBox: {
    borderRadius: 25,
    padding: 25,
    margin: 5,
    marginTop: 65,
    marginBottom: 80,
    position: 'relative',
    overflow: 'hidden',
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 206, 232, 0.7)',
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 206, 232, 1)',
    shadowColor: 'rgba(255, 255, 255, 1)',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 1,
  },
  contentContainer: {
    position: 'relative',
    zIndex: 1,
  },
  titleText: {
    fontSize: 30,
    marginTop: 35,
    textAlign: "center",
    marginBottom: 30,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.primary,
    textShadowColor: 'rgba(255, 206, 232, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.primary,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'right',
  },
  noteText: {
    fontSize: 14,
    color: colors.medium,
    textAlign: 'right',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  // Weekly Schedule styles
  scheduleContainer: {
    marginTop: 25,
    marginBottom: 25,
  },
  dayContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 206, 232, 0.2)',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeInputsContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 206, 232, 0.2)',
  },
  timeInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  timeInput: {
    flex: 1,
  },
});

export default AddNewCourseScreen;