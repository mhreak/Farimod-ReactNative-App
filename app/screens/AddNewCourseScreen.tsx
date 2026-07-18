import React, { useEffect, useRef, useState, useMemo } from "react";
import AppText from "../components/Text";
import { Formik } from "formik";
import { ScrollView, StyleSheet, View, Image, TouchableOpacity, Animated, Platform } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import * as Yup from "yup";
import jalaali from 'jalaali-js';
import axios from 'axios';
import AppTextInput from "../components/TextInput";
import colors from "../config/colors";
import AppButton from "../components/Button";
import AppPicker from "../components/Picker";
import AppDatePicker from "../components/AppDatePicker";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";
import Screen from "../components/Screen";
import { MaterialIcons } from "@expo/vector-icons";
import { AppNavigationProp } from "../navigation/types";
import CustomTimePicker from "../components/CustomTimePicker";
import ImageUpload from "../components/ImageUpload";
import appConfig from "../config/config";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import Tooltip from '../components/Tooltip';
import { Text } from "react-native";
import { getFontFamily } from "../components/TextInput";
import axiosRetry from 'axios-retry';

axiosRetry(axios, { 
  retries: 2,
  retryDelay: (retryCount) => {
    console.log(`⏳ تلاش مجدد شماره ${retryCount}...`);
    return retryCount * 2000; 
  },
  retryCondition: (error) => {
    return (
      !error.response || 
      error.code === 'ECONNABORTED' || 
      error.response?.status >= 500
    );
  },
});

const AddNewCourseScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { toastVisible, setToastVisible, toastMessage, toastType, showToast } = useToast();
  const { user } = useAuth();
  const route = useRoute();
  const courseId = route.params?.courseId || route.params?.courseData?.CourseId;
const [inputHeight, setInputHeight] = useState(120);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [members, setMembers] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<any>(null);
  const [isImageChanged, setIsImageChanged] = useState(false);
  const [isImageRemoved, setIsImageRemoved] = useState(false);
  const [selectedInstructorItems, setSelectedInstructorItems] = useState<any[]>([]);

  const [courseData, setCourseData] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const iconFadeAnim = useRef(new Animated.Value(0)).current;
  const iconSlideAnim = useRef(new Animated.Value(-30)).current;
  const formFadeAnim = useRef(new Animated.Value(0)).current;
  const formSlideAnim = useRef(new Animated.Value(30)).current;
  const backButtonAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const initialValues = useMemo(() => ({
    courseName: courseData?.CourseName || "",
    courseType: courseData?.CourseType || null,
    Description:courseData?.Description || null,
    cityId: courseData?.CityId || null,
    cityName: courseData?.CityName || "",
    provinceId: courseData?.ProvinceId || null,
    provinceName: courseData?.ProvinceName || "",
    courseAddress: courseData?.CourseAddress || "",
    startDate: courseData?.StartDate ? new Date(courseData.StartDate) : null,
    finishDate: courseData?.FinishDate ? new Date(courseData.FinishDate) : null,
    registerStartDate: courseData?.RegisterStartDate ? new Date(courseData.RegisterStartDate) : null,
    registerFinishDate: courseData?.RegisterFinishDate ? new Date(courseData.RegisterFinishDate) : null,
    registerAmount: courseData?.RegisterAmount || null,
    allowDiscountCode: courseData?.AllowDiscountCode ?? null,
    registerActive: courseData?.RegisterActive ?? null,
    active: courseData?.Active ?? true,
    hasSaturdaySession: courseData?.HasSaturdaySession || false,
    saturdayStartTime: courseData?.Saturday_StartTime || "",
    saturdayFinishTime: courseData?.Saturday_FinishTime || "",
    hasSundaySession: courseData?.HasSundaySession || false,
    sundayStartTime: courseData?.Sunday_StartTime || "",
    sundayFinishTime: courseData?.Sunday_FinishTime || "",
    hasMondaySession: courseData?.HasMondaySession || false,
    mondayStartTime: courseData?.Monday_StartTime || "",
    mondayFinishTime: courseData?.Monday_FinishTime || "",
    hasTuesdaySession: courseData?.HasTuesdaySession || false,
    tuesdayStartTime: courseData?.Tuesday_StartTime || "",
    tuesdayFinishTime: courseData?.Tuesday_FinishTime || "",
    hasWednesdaySession: courseData?.HasWednesdaySession || false,
    wednesdayStartTime: courseData?.Wednesday_StartTime || "",
    wednesdayFinishTime: courseData?.Wednesday_FinishTime || "",
    hasThursdaySession: courseData?.HasThursdaySession || false,
    thursdayStartTime: courseData?.Thursday_StartTime || "",
    thursdayFinishTime: courseData?.Thursday_FinishTime || "",
    hasFridaySession: courseData?.HasFridaySession || false,
    fridayStartTime: courseData?.Friday_StartTime || "",
    fridayFinishTime: courseData?.Friday_FinishTime || "",
    otherInstructors: [],
  }), [courseData]);

  const [searchMember,setSearchMember]=useState<string>("")
  useEffect(() => {
    fetchProvinces();
  }, []);
  

  useEffect(()=>{
    fetchMembers();

  },[searchMember])

  const fetchProvinces = async () => {
    setLoadingProvinces(true);
    try {
      const response = await fetch(`${appConfig.mobileApi}Province/GetAllActive?pageSize=10000`);

      if (response.ok) {
        const data = await response.json();
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

  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      const response = await fetch(`${appConfig.mobileApi}Member/GetAll?currentPage=1&pageSize=200&filterName=${searchMember}`);

      if (response.ok) {
        const data = await response.json();
        const memberOptions = (data.Data || data.Items || data || [])
          .filter((member) => member?.MemberId && member.MemberId !== user?.MemberId)
          .map((member) => ({
            value: member.MemberId,
            label: member.MemberName || member.Name || `${member.FirstName || ''} ${member.LastName || ''}`.trim() || `مربی ${member.MemberId}`,
          }));
        setMembers(memberOptions);
      } else {
        showToast('خطا در دریافت لیست مربیان', 'error');
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      showToast('خطا در دریافت لیست مربیان', 'error');
    } finally {
      setLoadingMembers(false);
    }
  };
  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    setLoadingCourse(true);
    try {
      const response = await fetch(`${appConfig.mobileApi}Course/Get?courseId=${courseId}`);

      if (response.ok) {
        const result = await response.json(); 
        const data = result.Course; 
        setCourseData(data);

        if (data.ProvinceId) {
          await fetchCities(data.ProvinceId);
        }

        if (data.FeaturedImageURL) {
          setFeaturedImage({
            id: `course-image-${courseId || Date.now()}`,
            uri: data.FeaturedImageURL,
            name: data.FeaturedImageFileName || 'course_image.jpg',
            fileName: data.FeaturedImageFileName || 'course_image.jpg',
            type: data.FeaturedImageType || 'image/jpeg',
          });
        } else {
          setFeaturedImage(null);
        }

        const existingMembers = Array.isArray(data.Course_Member_List)
          ? data.Course_Member_List
          : Array.isArray(data.Course_Member_ViewModel_List)
            ? data.Course_Member_ViewModel_List
            : [];

        const preselectedInstructors = existingMembers
          .filter((member) => member?.MemberId && member.MemberId !== user?.MemberId)
          .map((member) => ({
            value: member.MemberId,
            label: member.MemberName || member.Name || member.FullName || `مربی ${member.MemberId}`,
          }));

        setSelectedInstructorItems(preselectedInstructors);
      } else {
        showToast('خطا در بارگذاری اطلاعات دوره', 'error');
        // navigation.navigate("App", { screen: "MainTabs", params: { screen: "خانه" } }); // ✅ کامنت کنید برای دیباگ
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      showToast('خطا در بارگذاری اطلاعات دوره', 'error');
      // navigation.navigate("App", { screen: "MainTabs", params: { screen: "خانه" } }); // ✅ کامنت کنید برای دیباگ
    } finally {
      setLoadingCourse(false);
    }
  };
  useEffect(() => {
    Animated.sequence([
      Animated.timing(backButtonAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
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


  const showValidationErrors = (errors) => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const firstError = errors[errorKeys[0]];
      showToast(firstError, 'error');
    }
  };

  const getMemberDisplayName = (member) => {
    if (!member) return '';

    return (
      member.MemberName ||
      member.Name ||
      member.FullName ||
      member.DisplayName ||
      `${member.FirstName || ''} ${member.LastName || ''}`.trim() ||
      member.UserName ||
      `مربی ${member.MemberId || member.Id || ''}`.trim()
    );
  };

  const submitCourse = async (values, { setErrors }) => {
    setIsSubmitting(true);
    try {
      const validationErrors = {};
      if (!values.courseName?.trim()) validationErrors.courseName = "نام دوره الزامی است";
      if (!values.courseType) validationErrors.courseType = "نوع دوره الزامی است";

      if (values.courseType !== 2) {
        if (!values.cityId) validationErrors.cityId = "شهر الزامی است";
        if (!values.provinceId) validationErrors.provinceId = "استان الزامی است";
      }

      if (!values.courseAddress?.trim()) validationErrors.courseAddress = "آدرس دوره الزامی است";
      if (!values.startDate) validationErrors.startDate = "تاریخ شروع الزامی است";
      if (!values.finishDate) validationErrors.finishDate = "تاریخ پایان الزامی است";
      if (!values.registerStartDate) validationErrors.registerStartDate = "تاریخ شروع ثبت نام الزامی است";
      if (!values.registerFinishDate) validationErrors.registerFinishDate = "تاریخ پایان ثبت نام الزامی است";
      if (values.registerAmount === null || values.registerAmount === undefined) {
        validationErrors.registerAmount = "مبلغ ثبت نام الزامی است";
      } else if (values.registerAmount < 0) {
        validationErrors.registerAmount = "مبلغ نمی تواند منفی باشد";
      }
      if (values.active === null || values.active === undefined) { // ✅ اضافه شود
        validationErrors.active = "وضعیت دوره الزامی است";
      }

      // Check weekly schedule
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

      if (Object.keys(validationErrors).length > 0) {
        showValidationErrors(validationErrors);
        setErrors(validationErrors);
        setIsSubmitting(false);
        return;
      }

      // ✅ ساخت FormData
      const formData = new FormData();

      // Helper functions
      const toEnglishTime = (time) => {
        if (!time) return '';
        return time.toString().replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
      };

      const toEnglishNumber = (num) => {
        if (num === null || num === undefined) return '0';
        return num.toString().replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
      };


      const formatPersianDate = (dateString) => {
        if (!dateString) return '';

        const toEnglishDigits = (str) => {
          if (!str) return str;
          return str.toString().replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
        };

        // اگر تاریخ از قبل به فرمت رشته شمسی است
        if (typeof dateString === 'string' && dateString.includes('/')) {
          const parts = dateString.split('/');
          const year = toEnglishDigits(parts[0]);
          const month = toEnglishDigits(parts[1]).padStart(2, '0');
          const day = toEnglishDigits(parts[2]).padStart(2, '0');
          return `${year}-${month}-${day}`;
        }

        let year, month, day;

        // ✅ استفاده از UTC چون تاریخ‌ها به صورت UTC ذخیره می‌شوند
        if (dateString instanceof Date) {
          year = dateString.getUTCFullYear();
          month = dateString.getUTCMonth() + 1;
          day = dateString.getUTCDate();
        } else if (typeof dateString === 'string' && (dateString.includes('-') || dateString.includes('T'))) {
          const date = new Date(dateString);
          year = date.getUTCFullYear();
          month = date.getUTCMonth() + 1;
          day = date.getUTCDate();
        } else {
          return dateString;
        }


        // تبدیل میلادی به شمسی با jalaali
        const jDate = jalaali.toJalaali(year, month, day);
        const persianYear = jDate.jy.toString();
        const persianMonth = jDate.jm.toString().padStart(2, '0');
        const persianDay = jDate.jd.toString().padStart(2, '0');

        const result = `${persianYear}-${persianMonth}-${persianDay}`;

        return result;
      };


      const startDate = formatPersianDate(values.startDate);
      const finishDate = formatPersianDate(values.finishDate);
      const registerStartDate = formatPersianDate(values.registerStartDate);
      const registerFinishDate = formatPersianDate(values.registerFinishDate);
      const registerAmount = toEnglishNumber(values.registerAmount);



      // ✅ Basic fields - استفاده از courseId واقعی یا 0 برای Add
      formData.append('CourseId', courseId?.toString() || '0');
      formData.append('CourseName', values.courseName || '');
      formData.append('MemberId', user?.MemberId?.toString() || '0');
      formData.append('MemberName', user?.FullName || user?.Name || '');
      formData.append('CourseType', values.courseType?.toString() || '1');
      formData.append('CourseTypeStr', values.courseType === 1 ? 'حضوری' : values.courseType === 2 ? 'مجازی' : 'حضوری و مجازی');

      // ✅ برای دوره مجازی، شهر و استان null می‌فرستیم
      if (values.courseType === 2) {
        // برای دوره مجازی، رشته "null" می‌فرستیم
        formData.append('CityId', '');
        formData.append('CityName', '');
        formData.append('ProvinceId', '');
        formData.append('ProvinceName', '');
      } else {
        // برای دوره حضوری، مقادیر واقعی را می‌فرستیم
        formData.append('CityId', values.cityId?.toString() || '0');
        formData.append('CityName', values.cityName || '');
        formData.append('ProvinceId', values.provinceId?.toString() || '0');
        formData.append('ProvinceName', values.provinceName || '');
      }

      formData.append('CourseAddress', values.courseAddress || '');
      formData.append('Description', values.Description);
      formData.append('Rating', '0');
      formData.append('Active', values.active === true ? 'true' : 'false');
      weekDays.forEach(day => {
        const dayCapitalized = day.key.charAt(0).toUpperCase() + day.key.slice(1);
        const hasSessionKey = `has${dayCapitalized}Session`;
        const startTimeKey = `${day.key}StartTime`;
        const finishTimeKey = `${day.key}FinishTime`;

        formData.append(`Has${dayCapitalized}Session`, values[hasSessionKey] ? 'true' : 'false');
        formData.append(`${dayCapitalized}_StartTime`, toEnglishTime(values[startTimeKey]) || '');
        formData.append(`${dayCapitalized}_FinishTime`, toEnglishTime(values[finishTimeKey]) || '');
      });

      // Dates
      formData.append('StartDate', startDate || '');
      formData.append('ShamsiStartDate', startDate || '');
      formData.append('FinishDate', finishDate || '');
      formData.append('ShamsiFinishDate', finishDate || '');
      formData.append('RegisterStartDate', registerStartDate || '');
      formData.append('ShamsiRegisterStartDate', registerStartDate || '');
      formData.append('RegisterFinishDate', registerFinishDate || '');
      formData.append('ShamsiRegisterFinishDate', registerFinishDate || '');

      // Amount and settings
      formData.append('RegisterAmount', registerAmount || '0');
      formData.append('AllowDiscountCode', values.allowDiscountCode === true ? 'true' : 'false');
      formData.append('RegisterActive', values.registerActive !== false ? 'true' : 'false');
      formData.append('RegisterActiveStr', values.registerActive !== false ? 'فعال' : 'غیرفعال');
      formData.append('InsertDate', new Date().toISOString());
      formData.append('LikeCount', '0');

      const hasNewImage = Boolean(
        featuredImage?.uri &&
        typeof featuredImage.uri === 'string'
      );
   
      
      

      if (hasNewImage) {
        const imageName = featuredImage.fileName || featuredImage.name || `course_poster_${Date.now()}.jpg`;
        formData.append('FeaturedImageFileName', imageName);
        formData.append('FeaturedImageURL', '');
      } else if (courseId && courseData) {
        formData.append('FeaturedImageURL', courseData.FeaturedImageURL || '');
        formData.append('FeaturedImageFileName', courseData.FeaturedImageFileName || '');
      } else {
        formData.append('FeaturedImageURL', '');
        formData.append('FeaturedImageFileName', '');
      }

      const selectedInstructorValues = (values.otherInstructors?.length
        ? values.otherInstructors
        : selectedInstructorItems || [])
        .filter((item) => item?.value)
        .map((item) => ({
          value: item.value,
          label: getMemberDisplayName(item),
        }));

      const selectedInstructors = selectedInstructorValues;

      const courseMemberIdList = [user?.MemberId, ...selectedInstructors.map((item) => item.value)]
        .filter(Boolean);

      const courseMemberListPayload = [
        {
          CourseId: courseId || 0,
          MemberId: user?.MemberId || 0,
          CourseName: values.courseName || '',
          MemberName: getMemberDisplayName(user),
          Title: 'مربی اصلی',
          InsertDate: new Date().toISOString()
        },
        ...selectedInstructors.map((item) => ({
          CourseId: courseId || 0,
          MemberId: item.value,
          CourseName: values.courseName || '',
          MemberName: item.label,
          Title: 'مربی فرعی',
          InsertDate: new Date().toISOString()
        }))
      ];

      if (courseMemberIdList.length === 0) {
        formData.append('Course_MemberId_List', '0');
      } else {
        courseMemberIdList.forEach((memberId) => {
          formData.append('Course_MemberId_List', memberId.toString());
        });
      }

      if (courseMemberListPayload.length === 0) {
        formData.append('Course_Member_List', '[]');
      } else {
        courseMemberListPayload.forEach((memberItem) => {
          formData.append('Course_Member_List', JSON.stringify(memberItem));
        });
      }



      if (hasNewImage) {
        let imageUri = featuredImage.uri;

        if (Platform.OS === 'android' && !imageUri.startsWith('file://')) {
          imageUri = `file://${imageUri}`;
        }

        const imageName = featuredImage.fileName || featuredImage.name || `course_poster_${Date.now()}.jpg`;
        let imageType = featuredImage.type || featuredImage.mimeType || 'image/jpeg';

        if (imageType === 'image') {
          imageType = 'image/jpeg';
        }

        const fileToUpload = {
          uri: imageUri,
          name: imageName,
          type: imageType,
        };

        formData.append('featuredImageFile', fileToUpload);

 
      }


      // ✅ تشخیص Add یا Edit و استفاده از endpoint و method مناسب
      const endpoint = courseId
        ? `${appConfig.mobileApi}Course/Edit`
        : `${appConfig.mobileApi}Course/Add`;

      const method = courseId ? 'put' : 'post';


      // ✅ ارسال با Axios
      try {

        const response = await axios[method](
          endpoint,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Accept': 'application/json',
            },
            timeout: 120000,
            onUploadProgress: (progressEvent) => {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            },
          }
        );

        showToast(`دوره با موفقیت ${courseId ? 'ویرایش' : 'ثبت'} شد`, 'success');

       navigation.navigate("App", { screen: "MyTeachingCourses"})

      } catch (axiosError) {


        let errorMessage = `خطا در ${courseId ? 'ویرایش' : 'ثبت'} دوره`;

        if (axiosError.response) {
          const data = axiosError.response.data;
          console.error('📋 Full Response Data:', JSON.stringify(data, null, 2));

          errorMessage = data?.message ||
            data?.Message ||
            data?.error ||
            data?.Error ||
            (typeof data === 'string' ? data : null) ||
            `خطا ${axiosError.response.status}`;
        } else if (axiosError.request) {
          console.error('📋 Request:', axiosError.request);
          errorMessage = 'خطا در اتصال به سرور,اتصال خود را به اینترنت بررسی کنید';
        } else {
          errorMessage = axiosError.message;
        }

        throw new Error(errorMessage);
      }

    } catch (error) {
      console.error(`❌ Error ${courseId ? 'editing' : 'submitting'} course:`, error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
      });

      const errorMessage = error.message || `خطا در ${courseId ? 'ویرایش' : 'ثبت'} دوره`;
      showToast(errorMessage, 'error');
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
    if (!values || !setFieldValue) {
      return null;
    }
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
              <TouchableOpacity
                style={[
                  improvedStyles.dayHeader,
                  hasSession && improvedStyles.dayHeaderActive
                ]}
                onPress={() => {
                  setFieldValue(hasSessionKey, !hasSession);
                  if (!hasSession) {
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
          <Toast
            visible={toastVisible}
            message={toastMessage}
            type={toastType}
            onHide={() => setToastVisible(false)}
          />
          

          <View style={improvedStyles.headerButtons}>
            <View style={improvedStyles.headerLeft}>
              <Tooltip content="دوره آموزشی جدید خود را ایجاد کنید. اطلاعات کامل دوره شامل عنوان، توضیحات، قیمت، مدت زمان، برنامه زمانی، آدرس محل برگزاری و مربیان را وارد کنید. می‌توانید تصویر شاخص برای دوره آپلود کنید." />
            </View>

            <View
              style={[
                styles.backButton,
              ]}
            >
              <TouchableOpacity onPress={() => navigation.navigate("App", { screen: "MyTeachingCourses"})}>
                <View style={styles.backButtonGlass}>
                  <MaterialIcons name="arrow-forward" size={24} color="white" />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}  keyboardShouldPersistTaps="handled">

            
            <Animated.View
              style={[
                styles.iconContainer,
              ]}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark || colors.primary]}
                style={styles.iconCircle}
              >
                <View style={styles.iconInnerCircle}>
                  <MaterialIcons name="school" color={colors.white} size={50} />
                </View>
                <View style={styles.iconRing} />
              </LinearGradient>
            </Animated.View>

            <View
              style={[
                styles.formBox,

              ]}
            >

              
              <View style={styles.glassOverlay} pointerEvents="none"/>

              <View style={styles.contentContainer}>
                
                <AppText style={styles.titleText}>
                  {courseId ? 'ویرایش دوره' : 'افزودن دوره جدید'}
                </AppText>


                <Formik
                  initialValues={initialValues}
                  enableReinitialize={true}  // حالا مشکلی ندارد
                  onSubmit={submitCourse}
                >
                  {({ handleChange, handleSubmit, errors, values, setFieldValue }) => (
                    <>
                      <View>
                        
                        <AppTextInput
                          label="نام دوره"
                          autoCapitalize="none"
                          autoCorrect={false}
                          icon="menu-book"

                          keyboardType="default"
                          placeholder="نام دوره"
                          onChangeText={handleChange("courseName")}
                          value={values.courseName}
                        />

                          <AppTextInput
                          style={{ 
                            height: Math.max(120, inputHeight), 
                            paddingTop: 10, 
                            paddingBottom: 10 
                          }}
                          label="توضیحات دوره"
                          autoCapitalize="none"
                          autoCorrect={false}
                          icon="description"
                          multiline
                          scrollEnabled={true}
                          keyboardType="default"
                          placeholder="توضیحات دوره"
                          value={values.Description}
                          
                          onChangeText={handleChange("Description")} 

                          onChange={(event) => {
                            const nativeHeight = event.nativeEvent?.contentSize?.height;
                            setInputHeight(nativeHeight);
                          }}
                        />

                        <View style={styles.inputSpacing}>
                             <Text style={[styles.inputLabel]}>نوع دوره</Text>
                          <AppPicker
                          
                            items={courseTypeOptions}
                            onSelectItem={(item) => setFieldValue("courseType", item?.value)}
                            selectedItem={values.courseType ? courseTypeOptions.find(item => item.value === values.courseType) : null}
                            icon="computer"

                            placeholder="نوع دوره"
                          />
                        </View>
                  {
                    values.courseType!=2 &&
                    <>
                          <View style={styles.inputSpacing}>
                              <Text style={[styles.inputLabel]}> استان</Text>

                          <AppPicker
                            items={provinces}
                            onSelectItem={(item) => {
                              setFieldValue("provinceId", item?.value);
                              setFieldValue("provinceName", item?.label);
                              setFieldValue("cityId", null);
                              setFieldValue("cityName", "");
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
                        </View>

                        <View style={styles.inputSpacing}>
                            <Text style={[styles.inputLabel]}>شهر</Text>
                          <AppPicker
                            items={cities}
                            onSelectItem={(item) => {
                              setFieldValue("cityId", item?.value);
                              setFieldValue("cityName", item?.label);
                            }}
                            selectedItem={values.cityId ? cities.find(item => item.value === values.cityId) : null}
                            icon="location-city"
                            placeholder={loadingCities ? "در حال بارگذاری شهرها..." : values.provinceId ? "شهر" : "ابتدا استان را انتخاب کنید"}
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
                        </View>
                    </>

                  }

                  
                        <View style={styles.inputSpacing}>
                                                      <Text style={[styles.inputLabel]}>سایر مربیان</Text>

                          <AppPicker
                          searchText={searchMember}
                            onSearch={setSearchMember}
                            inputPlaceHolder="جست و جوی مربیان"
                            hasSearch={true}
                            items={members}
                            multiSelect={true}
                            selectedItems={selectedInstructorItems}
                            onMultiSelectChange={(items) => {
                              setSelectedInstructorItems(items);
                              setFieldValue('otherInstructors', items);
                            }}
                            icon="group"
                            placeholder={loadingMembers ? "در حال بارگذاری مربیان..." : "سایر مربیان (اختیاری)"}
                          />
                        </View>

                        <AppTextInput
                        label="آدرس دوره"
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

                        <WeeklySchedule values={values} setFieldValue={setFieldValue} />

                        <AppTextInput
                          label="مبلغ ثبت نام (تومان)"
                          autoCapitalize="none"
                          autoCorrect={false}
                          icon="attach-money"
                          keyboardType="numeric"
                          placeholder="مبلغ ثبت نام (تومان)"
                          onChangeText={(text) => {
                            const rawString = text.replace(/[^0-9]/g, "");
                            setFieldValue("registerAmount", rawString === "" ? "" : Number(rawString));
                          }}
                          value={
                            values.registerAmount !== "" && values.registerAmount !== null && values.registerAmount !== undefined
                              ? values.registerAmount
                                  .toString()
                                  .replace(/[^0-9]/g, "")
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                              : ""
                          }
                        />


                        <View style={styles.inputSpacing}>
                      <Text style={[styles.inputLabel]}>وضعیت ثبت نام</Text>

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
                        </View>
                        <View style={styles.inputSpacing}>
                          <Text style={[styles.inputLabel]}>وضعیت دوره</Text>
                          <AppPicker
                            items={[
                              { value: true, label: "فعال" },
                              { value: false, label: "غیرفعال" }
                            ]}
                            onSelectItem={(item) => setFieldValue("active", item?.value)}
                            selectedItem={values.active !== null && values.active !== undefined ?
                              { value: values.active, label: values.active ? "فعال" : "غیرفعال" } :
                              null}
                            icon="power-settings-new"
                            placeholder="وضعیت دوره"
                          />
                        </View>

                        <View style={styles.inputSpacing}>
                           <Text style={[styles.inputLabel]}>کد تخفیف</Text>
                          <AppPicker
                            items={[
                              { value: true, label: "دارد" },
                              { value: false, label: "ندارد" }
                            ]}
                            onSelectItem={(item) => setFieldValue("allowDiscountCode", item?.value)}
                            selectedItem={values.allowDiscountCode !== null && values.allowDiscountCode !== undefined ?
                              { value: values.allowDiscountCode, label: values.allowDiscountCode ? "مجاز" : "غیرمجاز" } :
                              null}
                            icon="local-offer"
                            placeholder="کد تخفیف"
                          />
                        </View>


                        <View >
                            <Text style={[styles.inputLabel]}>تاریخ شروع دوره</Text>


                            <AppDatePicker
                            
                              icon="event"
                              placeholder="تاریخ شروع دوره"
                              value={values.startDate}
                              onDateChange={(date) => setFieldValue("startDate", date)}
                              mode="date"
                              minimumDate={new Date()}
                            />
                        </View> 


                      <View>
                            <Text style={[styles.inputLabel]}>تاریخ پایان دوره</Text>


                              <AppDatePicker
                                icon="event-available"
                                placeholder="تاریخ پایان دوره"
                                value={values.finishDate}
                                onDateChange={(date) => setFieldValue("finishDate", date)}
                                mode="date"
                                minimumDate={values.startDate || new Date()}
                              />
                        </View> 


                        <View>
                            <Text style={[styles.inputLabel]}>تاریخ شروع ثبت نام</Text>


                        <AppDatePicker
                          icon="how-to-reg"
                          placeholder="تاریخ شروع ثبت نام"
                          value={values.registerStartDate}
                          onDateChange={(date) => setFieldValue("registerStartDate", date)}
                          mode="date"
                          minimumDate={new Date()}
                        />

                        </View> 

                             <View>
                            <Text style={[styles.inputLabel]}>تاریخ پایان ثبت نام</Text>


                        <AppDatePicker
                          icon="assignment-turned-in"
                          placeholder="تاریخ پایان ثبت نام"
                          value={values.registerFinishDate}
                          onDateChange={(date) => setFieldValue("registerFinishDate", date)}
                          mode="date"
                          minimumDate={values.registerStartDate || new Date()}
                          maximumDate={values.startDate}
                        />
                        </View> 


                      


                        <ImageUpload
                          onImageChange={(image) => {setFeaturedImage(image);    setIsImageChanged(true);

                          setIsImageRemoved(false);}}
                          initialImage={featuredImage}
                          isMultiple={false}
                          placeholder="پوستر دوره"
                          allowFreeAspectRatio={true}
                          allowEditing={false}
                          allowVideos={false}
                          allowImages={true}
                          onShowToast={showToast}
                          loading={isSubmitting}
                        />
                        <AppButton
                          title={isSubmitting ? "در حال ذخیره..." : courseId ? "ذخیره تغییرات" : "ثبت دوره"}
                          onPress={handleSubmit}
                          color={colors.success}
                          disabled={isSubmitting || loadingCourse}
                        />
                      </View>
                    </>
                  )}
                </Formik>
              </View>
            </View>
          </ScrollView>
        </Screen>
      </LinearGradient>
    </View>
  );
};

const improvedStyles = StyleSheet.create({
  headerButtons: {
    position: 'absolute',
    // top: 30,
    left: 15,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerLeft: {
    top: 18,
  },

  backButton: {
    zIndex: 10,
  },

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



  backButtonGlass: {
    backgroundColor: '#9E22AD',
    borderRadius: 25,
    top: 50,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 206, 232, 0.5)',
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

      inputLabel: {
    fontSize: 15,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
    color: colors.dark,
    marginBottom: 8,
    textAlign: "right",
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
  inputSpacing: {
    marginBottom: 15,
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
});

export default AddNewCourseScreen;