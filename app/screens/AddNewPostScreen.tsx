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
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";
import Screen from "../components/Screen";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import appConfig from "../config/config";
import ImageUpload from "../components/ImageUpload";

const MEMBER_ID = 1; // فعلا ثابت

const AddNewPostScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { toastVisible, setToastVisible, toastMessage, toastType, showToast } = useToast();

  // بررسی حالت ویرایش
  const isEditMode = route.params?.isEdit || false;
  const editPostData = route.params?.blogData || null;

  // State for managing form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [postImages, setPostImages] = useState([]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const iconFadeAnim = useRef(new Animated.Value(0)).current;
  const iconSlideAnim = useRef(new Animated.Value(-30)).current;
  const formFadeAnim = useRef(new Animated.Value(0)).current;
  const formSlideAnim = useRef(new Animated.Value(30)).current;
  const backButtonAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // بارگذاری دسته‌بندی‌ها
    fetchCategories();

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

  // تابع بارگذاری دسته‌بندی‌ها
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch(`${appConfig.mobileApi}BlogPostCategory`);

      if (response.ok) {
        const result = await response.json();
        // فقط دسته‌بندی‌های فعال را نمایش دهیم
        const activeCategories = result.filter(category => category.Active);
        const categoryOptions = activeCategories.map(category => ({
          value: category.BlogPostCategoryId,
          label: category.Name
        }));
        setCategories(categoryOptions);
      } else {
        console.warn('Failed to fetch categories, using fallback');
        // در صورت خطا، دسته‌بندی‌های پیش‌فرض را استفاده کنیم
        setCategories([
          { value: 1, label: "معرفی کتاب" },
          { value: 2, label: "معرفی کسب و کار" },
        ]);
      }
    } catch (error) {
      console.warn('Error fetching categories:', error);
      // در صورت خطا، دسته‌بندی‌های پیش‌فرض را استفاده کنیم بدون نمایش Toast
      setCategories([
        { value: 1, label: "معرفی کتاب" },
        { value: 2, label: "معرفی کسب و کار" },
      ]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const validationSchema = Yup.object().shape({
    title: Yup.string().required("عنوان پست الزامی است"),
    content: Yup.string().required("محتوای پست الزامی است"),
    blogPostCategoryId: Yup.number().required("دسته‌بندی الزامی است"),
  });

  // تابع برای نمایش اولین ارور در Toast
  const showValidationErrors = (errors) => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const firstError = errors[errorKeys[0]];
      showToast(firstError, 'error');
    }
  };

  const submitPost = async (values, { setErrors, resetForm }) => {
    setIsSubmitting(true);

    try {
      // اعتبارسنجی دستی برای فیلدهای اضافی
      const validationErrors = {};

      if (!values.title?.trim()) {
        validationErrors.title = "عنوان پست الزامی است";
      }
      if (!values.content?.trim()) {
        validationErrors.content = "محتوای پست الزامی است";
      }
      if (!values.blogPostCategoryId) {
        validationErrors.blogPostCategoryId = "دسته‌بندی الزامی است";
      }

      // اگر ارور وجود داره، در Toast نمایش بده
      if (Object.keys(validationErrors).length > 0) {
        showValidationErrors(validationErrors);
        setErrors(validationErrors);
        setIsSubmitting(false);
        return;
      }

      // ایجاد FormData برای ارسال داده‌ها
      const formData = new FormData();

      // اضافه کردن فیلدهای پست
      formData.append('BlogPostId', isEditMode ? editPostData.BlogPostId.toString() : '0');
      formData.append('BlogPostCategoryId', values.blogPostCategoryId.toString());
      formData.append('MemberId', MEMBER_ID.toString());
      formData.append('Title', values.title.trim());
      formData.append('ShamsiInsertDateTime', ''); // خالی می‌فرستیم
      formData.append('Content', values.content.trim());
      formData.append('CommentEnabled', values.commentEnabled !== undefined ? values.commentEnabled.toString() : 'true');
      formData.append('Active', values.active !== undefined ? values.active.toString() : 'true');
      formData.append('LikeCount', isEditMode ? (editPostData.LikeCount || 0).toString() : '0');

      // فیلدهای خالی برای عکس
      formData.append('FeaturedImageFileName', '');
      formData.append('FeaturedImageURL', '');
      formData.append('Rating', '');

      // اضافه کردن عکس اگر انتخاب شده باشد
      if (postImages && postImages.length > 0) {
        const image = postImages[0]; // فقط اولین عکس را استفاده می‌کنیم

        console.log('Selected image:', image); // برای debug

        // بررسی وجود uri
        if (image.uri) {
          // تشخیص نوع فایل از URI
          const fileExtension = image.uri.split('.').pop()?.toLowerCase() || 'jpg';
          const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';

          // ایجاد object فایل برای React Native
          const imageFile = {
            uri: image.uri,
            type: mimeType,
            name: image.name || `featured-image-${Date.now()}.${fileExtension}`,
          };

          // حذف append اولیه و اضافه کردن فایل واقعی
          formData.append('featurdImageFile', imageFile as any);
          console.log('Image appended to FormData:', imageFile); // برای debug
        }
      } else {
        // اگر عکسی انتخاب نشده، فیلد خالی ارسال کن
        console.log('No image selected'); // برای debug
      }

      // نمایش محتویات FormData برای debug
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const url = isEditMode
        ? `${appConfig.mobileApi}BlogPost/Edit`
        : `${appConfig.mobileApi}BlogPost/Add`;

      const method = isEditMode ? 'PUT' : 'POST';

      // حذف Content-Type header تا browser خودش تنظیمش کنه
      const response = await fetch(url, {
        method: method,
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        showToast(
          isEditMode ? 'پست با موفقیت ویرایش شد' : 'پست با موفقیت ثبت شد',
          'success'
        );

        if (!isEditMode) {
          resetForm();
          setPostImages([]); // پاک کردن عکس‌ها
        }

        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.Message || `خطا در ${isEditMode ? 'ویرایش' : 'ثبت'} پست`);
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      showToast(error.message || `خطا در ${isEditMode ? 'ویرایش' : 'ثبت'} پست`, 'error');
    } finally {
      setIsSubmitting(false);
    }
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
                  <MaterialIcons name={isEditMode ? "edit" : "article"} color={colors.white} size={50} />
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
                <AppText style={styles.titleText}>
                  {isEditMode ? 'ویرایش پست' : 'افزودن پست جدید'}
                </AppText>

                <Formik
                  initialValues={{
                    title: isEditMode ? editPostData?.Title || "" : "",
                    content: isEditMode ? editPostData?.Content || "" : "",
                    blogPostCategoryId: isEditMode ? editPostData?.BlogPostCategoryId || null : null,
                    commentEnabled: isEditMode ? editPostData?.CommentEnabled !== undefined ? editPostData.CommentEnabled : true : true,
                    active: isEditMode ? editPostData?.Active !== undefined ? editPostData.Active : true : true,
                    images: [],
                  }}
                  onSubmit={submitPost}
                  validate={(values) => {
                    // حذف validation schema برای جلوگیری از نمایش ارورها زیر اینپوت‌ها
                    return {};
                  }}
                  enableReinitialize={true} // اجازه ریست کردن فرم با مقادیر جدید
                >
                  {({ handleChange, handleSubmit, errors, values, setFieldValue, resetForm }) => (
                    <>
                      <View>
                        {/* عنوان پست */}
                        <AppTextInput
                          autoCapitalize="none"
                          autoCorrect={false}
                          icon="title"
                          keyboardType="default"
                          placeholder="عنوان پست"
                          onChangeText={handleChange("title")}
                          value={values.title}
                        />

                        {/* دسته‌بندی */}
                        <AppPicker
                          items={categories}
                          onSelectItem={(item) => setFieldValue("blogPostCategoryId", item?.value)}
                          selectedItem={values.blogPostCategoryId ? categories.find(item => item.value === values.blogPostCategoryId) : null}
                          icon="category"
                          placeholder={loadingCategories ? "در حال بارگذاری..." : "دسته‌بندی پست"}
                          disabled={loadingCategories}
                        />

                        {/* محتوای پست */}
                        <AppTextInput
                          autoCapitalize="none"
                          autoCorrect={false}
                          icon="description"
                          keyboardType="default"
                          placeholder="محتوای پست"
                          onChangeText={handleChange("content")}
                          value={values.content}
                          multiline={true}
                          numberOfLines={8}
                          textAlignVertical="top"
                          style={styles.contentInput}
                        />



                      </View>


                      <AppPicker
                        items={[
                          { value: true, label: "فعال" },
                          { value: false, label: "غیرفعال" }
                        ]}
                        onSelectItem={(item) => setFieldValue("commentEnabled", item?.value)}
                        selectedItem={values.commentEnabled !== null && values.commentEnabled !== undefined ?
                          { value: values.commentEnabled, label: values.commentEnabled ? "فعال" : "غیرفعال" } :
                          null}
                        icon="comment"
                        placeholder="وضعیت کامنت"
                        style={styles.halfWidthPicker}
                      />

                      <AppPicker
                        items={[
                          { value: true, label: "منتشر شده" },
                          { value: false, label: "پیش‌نویس" }
                        ]}
                        onSelectItem={(item) => setFieldValue("active", item?.value)}
                        selectedItem={values.active !== null && values.active !== undefined ?
                          { value: values.active, label: values.active ? "منتشر شده" : "پیش‌نویس" } :
                          null}
                        icon="visibility"
                        placeholder="وضعیت انتشار"
                        style={styles.halfWidthPicker}
                      />

                      <ImageUpload
                        onImageChange={(image) => {
                          console.log('Image changed:', image);
                          setPostImages(image ? [image] : []);
                          setFieldValue("images", image ? [image] : []);
                        }}
                        multiple={false}
                        imageQuality={0.8}
                        allowCamera={true}
                        allowGallery={true}
                        error={errors.images as string}
                        maxImages={1}
                        placeholder="انتخاب عکس شاخص"
                        style={styles.imageUploadContainer}
                        initialImage={isEditMode && editPostData?.FeaturedImageURL ? {
                          id: 'existing',
                          uri: editPostData.FeaturedImageURL,
                          name: editPostData.FeaturedImageFileName || 'existing-image.jpg'
                        } : null}
                      />
                      <View style={styles.buttonContainer}>
                        <AppButton
                          title={isSubmitting ? (isEditMode ? "در حال ویرایش..." : "در حال ثبت...") : (isEditMode ? "ویرایش پست" : "ثبت پست")}
                          onPress={handleSubmit}
                          color={isEditMode ? colors.info : colors.success}
                          disabled={isSubmitting}
                          style={styles.submitButton}
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
  contentInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  imageUploadSection: {
    marginTop: 25,
    marginBottom: 15,
  },
  imageUploadContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 206, 232, 0.2)',
  },
  settingsContainer: {
    marginTop: 25,
    marginBottom: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 206, 232, 0.2)',
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.primary,
    marginRight: 8,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  halfWidthPicker: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: 20,
    gap: 15,
  },
  submitButton: {
    marginBottom: 0,
  },
  resetButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 206, 232, 0.3)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resetButtonText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: colors.medium,
    marginRight: 8,
  },
});

export default AddNewPostScreen;