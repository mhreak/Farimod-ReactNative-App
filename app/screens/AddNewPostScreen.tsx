import React, { useEffect, useRef, useState } from "react";
import AppText from "../components/Text";
import { Formik } from "formik";
import { ScrollView, StyleSheet, View, Image, TouchableOpacity, Animated, Text, Platform } from "react-native";
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
import { useAuth } from '../contexts/AuthContext';

const AddNewPostScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const { toastVisible, setToastVisible, toastMessage, toastType, showToast } = useToast();
  const isEditMode = route.params?.isEdit || false;
  const editPostData = route.params?.blogData || null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [postImages, setPostImages] = useState([]); // state اصلی برای نگهداری تصاویر

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const iconFadeAnim = useRef(new Animated.Value(0)).current;
  const iconSlideAnim = useRef(new Animated.Value(-30)).current;
  const formFadeAnim = useRef(new Animated.Value(0)).current;
  const formSlideAnim = useRef(new Animated.Value(30)).current;
  const backButtonAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // دیباگ تصاویر
  useEffect(() => {
    console.log('📸 postImages state changed:', postImages);
  }, [postImages]);

  useEffect(() => {
    fetchCategories();
    // Animations...
    Animated.sequence([
      Animated.timing(backButtonAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(iconFadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(iconSlideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(formFadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(formSlideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (isEditMode && editPostData) {
      console.log('Edit Post Data:', editPostData);
      console.log('BlogPostCategoriesStr:', editPostData.BlogPostCategoriesStr);
    }
  }, [isEditMode, editPostData, categories]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch(`${appConfig.mobileApi}BlogPostCategory`);

      if (response.ok) {
        const result = await response.json();
        const categoriesArray = Array.isArray(result) ? result : [];

        if (categoriesArray.length > 0) {
          const activeCategories = categoriesArray.filter(category =>
            category && category.Active === true
          );

          const categoryOptions = activeCategories.map(category => ({
            value: category.BlogPostCategoryId,
            label: category.Name || `دسته ${category.BlogPostCategoryId}`
          }));

          setCategories(categoryOptions);
        } else {
          setCategories([
            { value: 1, label: "معرفی کتاب" },
            { value: 2, label: "معرفی کسب و کار" },
          ]);
        }
      } else {
        setCategories([
          { value: 1, label: "معرفی کتاب" },
          { value: 2, label: "معرفی کسب و کار" },
        ]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([
        { value: 1, label: "معرفی کتاب" },
        { value: 2, label: "معرفی کسب و کار" },
      ]);
    } finally {
      setLoadingCategories(false);
    }
  };

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
      const validationErrors = {};

      if (!values.title?.trim()) {
        validationErrors.title = "عنوان پست الزامی است";
      }

      if (!values.content?.trim()) {
        validationErrors.content = "محتوای پست الزامی است";
      }

      if (!values.blogPostCategoryIds ||
        !Array.isArray(values.blogPostCategoryIds) ||
        values.blogPostCategoryIds.length === 0) {
        validationErrors.blogPostCategoryIds = "حداقل یک دسته‌بندی الزامی است";
      }

      if (Object.keys(validationErrors).length > 0) {
        console.log('Validation errors:', validationErrors);
        showValidationErrors(validationErrors);
        setErrors(validationErrors);
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();

      formData.append('BlogPostId', isEditMode ? editPostData.BlogPostId.toString() : '0');
      formData.append('MemberId', user?.MemberId.toString());
      formData.append('Title', values.title.trim());
      formData.append('Content', values.content.trim());
      formData.append('CommentEnabled', values.commentEnabled.toString());
      formData.append('Active', values.active.toString());
      formData.append('LikeCount', isEditMode ? (editPostData.LikeCount || 0).toString() : '0');
      formData.append('Rating', '0');

      values.blogPostCategoryIds.forEach((id) => {
        formData.append('cateogoryIdList', id.toString());
      });

      const categoryNames = values.blogPostCategoryIds.map(id => {
        const category = categories.find(cat => cat.value === id);
        return category ? category.label : `دسته ${id}`;
      });

      formData.append('BlogPostCategoriesStr', categoryNames.join('،'));
      formData.append('InsertDate', new Date().toISOString());
      formData.append('ShamsiInsertDate', '');

      // **بررسی و آپلود تصویر - مشابه AddProductScreen**
      console.log('📸 Checking images...');
      console.log('📸 postImages state:', postImages);
      console.log('📸 values.images from Formik:', values.images);

      // استفاده از values.images که توسط Formik مدیریت می‌شود
      const imagesToUpload = values.images && values.images.length > 0 ? values.images : postImages;

      if (imagesToUpload && imagesToUpload.length > 0 && imagesToUpload[0]) {
        const image = imagesToUpload[0];
        console.log('📸 Processing image:', image);

        if (image.uri) {
          // فیکس URI برای iOS (مشابه AddProductScreen)
          let imageUri = image.uri;
          if (Platform.OS === 'ios' && !imageUri.startsWith('file://')) {
            imageUri = `file://${imageUri}`;
          }

          console.log('📸 Final image URI:', imageUri);

          // تعیین نوع فایل
          let fileType = image.type || 'image/jpeg';
          if (!fileType.startsWith('image/')) {
            const uriParts = imageUri.split('.');
            const fileExtension = uriParts[uriParts.length - 1].toLowerCase();

            if (fileExtension === 'png') {
              fileType = 'image/png';
            } else if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
              fileType = 'image/jpeg';
            }
          }

          // نام فایل
          const fileName = image.name || `featured-image-${Date.now()}.jpg`;

          // ساختار صحیح برای React Native FormData
          const imageFile = {
            uri: imageUri,
            type: fileType,
            name: fileName
          };

          console.log('📸 Image file to upload:', imageFile);

          formData.append('featuredImageFile', imageFile as any);
          formData.append('FeaturedImageFileName', fileName);
          formData.append('FeaturedImageURL', '');
        } else {
          console.warn('⚠️ Image URI is missing!');
          formData.append('FeaturedImageFileName', '');
          formData.append('FeaturedImageURL', '');
        }
      } else {
        console.log('📸 No images to upload');
        formData.append('FeaturedImageFileName', '');
        formData.append('FeaturedImageURL', '');
      }

      const url = isEditMode
        ? `${appConfig.mobileApi}BlogPost/Edit`
        : `${appConfig.mobileApi}BlogPost/Add`;
      const method = isEditMode ? 'PUT' : 'POST';

      console.log('Submitting to:', url, 'with method:', method);

      const response = await fetch(url, {
        method: method,
        body: formData,
        headers: {
          'Accept': 'application/json',
        }
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (response.ok) {
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          responseData = { message: responseText };
        }

        showToast(
          isEditMode ? 'پست با موفقیت ویرایش شد' : 'پست با موفقیت ثبت شد',
          'success'
        );

        if (!isEditMode) {
          resetForm();
          setPostImages([]);
        }

        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      } else {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { Message: responseText };
        }

        console.error('Submit error response:', errorData);
        throw new Error(errorData.Message || `خطا در ${isEditMode ? 'ویرایش' : 'ثبت'} پست`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      showToast(
        error.message || `خطا در ${isEditMode ? 'ویرایش' : 'ثبت'} پست`,
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.backgroundContainer}>
      <View style={styles.backgroundWrapper}>
        <Image source={require('../../assets/backgrounds/background-1.jpg')} style={styles.backgroundImage} />
      </View>
      <LinearGradient colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,1)']} style={styles.gradientOverlay}>
        <Screen style={styles.container}>
          <Toast visible={toastVisible} message={toastMessage} type={toastType} onHide={() => setToastVisible(false)} />

          <Animated.View style={[styles.backButton, { opacity: backButtonAnim, transform: [{ scale: backButtonAnim }] }]}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <View style={styles.backButtonGlass}>
                <MaterialIcons name="arrow-forward" size={24} color="white" />
              </View>
            </TouchableOpacity>
          </Animated.View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Animated.View style={[styles.iconContainer, { opacity: iconFadeAnim, transform: [{ translateY: iconSlideAnim }, { scale: pulseAnim }] }]}>
              <LinearGradient colors={[colors.primary, colors.primaryDark || colors.primary]} style={styles.iconCircle}>
                <View style={styles.iconInnerCircle}>
                  <MaterialIcons name={isEditMode ? "edit" : "article"} color={colors.white} size={50} />
                </View>
                <View style={styles.iconRing} />
              </LinearGradient>
            </Animated.View>

            <Animated.View style={[styles.formBox, { opacity: formFadeAnim, transform: [{ translateY: formSlideAnim }] }]}>
              <View style={styles.glassOverlay} />
              <View style={styles.contentContainer}>
                <AppText style={styles.titleText}>{isEditMode ? 'ویرایش پست' : 'افزودن پست جدید'}</AppText>

                <Formik
                  initialValues={{
                    title: isEditMode ? editPostData?.Title || "" : "",
                    content: isEditMode ? editPostData?.Content || "" : "",
                    blogPostCategoryIds: isEditMode ?
                      (editPostData?.BlogPostCategoriesStr ?
                        editPostData.BlogPostCategoriesStr.split("،").map(categoryName => {
                          const trimmedName = categoryName.trim();
                          const foundCategory = categories.find(cat => cat.label === trimmedName);
                          return foundCategory ? foundCategory.value : null;
                        }).filter(id => id !== null)
                        : []
                      ) : [],
                    commentEnabled: isEditMode ? editPostData?.CommentEnabled ?? true : true,
                    active: isEditMode ? editPostData?.Active ?? true : true,
                    images: [],
                  }}
                  onSubmit={submitPost}
                  validate={() => ({})}
                  enableReinitialize={true}
                >
                  {({ handleChange, handleSubmit, errors, values, setFieldValue }) => (
                    <>
                      <AppTextInput
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="title"
                        keyboardType="default"
                        placeholder="عنوان پست"
                        onChangeText={handleChange("title")}
                        value={values.title}
                        error={errors.title}
                        style={{
                          borderColor: errors.title ? '#e74c3c' : undefined
                        }}
                      />
                      {errors.title && (
                        <Text style={styles.errorText}>{errors.title}</Text>
                      )}

                      <AppPicker
                        items={categories}
                        onSelectItem={(item) => { }}
                        onMultiSelectChange={(selectedItems) => {
                          const selectedIds = selectedItems ? selectedItems.map(item => item.value) : [];
                          console.log('Selected categories:', selectedIds);
                          setFieldValue("blogPostCategoryIds", selectedIds);
                        }}
                        selectedItems={
                          (values.blogPostCategoryIds && Array.isArray(values.blogPostCategoryIds)) ?
                            values.blogPostCategoryIds
                              .filter(id => id !== null && id !== undefined)
                              .map(id => {
                                const category = categories.find(cat => cat.value === id);
                                return category || null;
                              })
                              .filter(item => item !== null)
                            : []
                        }
                        icon="category"
                        placeholder={
                          loadingCategories
                            ? "در حال بارگذاری..."
                            : !values.blogPostCategoryIds || values.blogPostCategoryIds.length === 0
                              ? "انتخاب دسته‌بندی پست"
                              : `${values.blogPostCategoryIds.length} دسته انتخاب شده`
                        }
                        disabled={loadingCategories}
                        multiSelect={true}
                        error={errors.blogPostCategoryIds}
                        style={{
                          borderColor: errors.blogPostCategoryIds ? '#e74c3c' : undefined
                        }}
                      />
                      {errors.blogPostCategoryIds && (
                        <Text style={styles.errorText}>{errors.blogPostCategoryIds}</Text>
                      )}

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
                        error={errors.content}
                      />
                      {errors.content && (
                        <Text style={styles.errorText}>{errors.content}</Text>
                      )}

                      <AppPicker
                        items={[{ value: true, label: "منتشر شده" }, { value: false, label: "پیش‌نویس" }]}
                        onSelectItem={(item) => setFieldValue("active", item?.value)}
                        selectedItem={values.active !== null && values.active !== undefined ? { value: values.active, label: values.active ? "منتشر شده" : "پیش‌نویس" } : null}
                        icon="visibility"
                        placeholder="وضعیت انتشار"
                        style={styles.halfWidthPicker}
                      />

                      {/* **اصلاح ImageUpload - مشابه AddProductScreen** */}
                      <ImageUpload
                        onImageChange={(images) => {
                          console.log('📸 ImageUpload onImageChange called:', images);

                          // پردازش تصاویر مشابه AddProductScreen
                          let imageArray = [];

                          if (images) {
                            if (Array.isArray(images)) {
                              imageArray = images.filter(img => img && img.uri);
                            } else if (images.uri) {
                              imageArray = [images];
                            }
                          }

                          console.log('📸 Final image array:', imageArray);

                          // آپدیت هر دو state
                          setPostImages(imageArray);
                          setFieldValue("images", imageArray);
                        }}
                        isMultiple={false}
                        multiple={false}
                        imageQuality={1}
                        allowCamera={true}
                        allowGallery={true}
                        error={errors.images}
                        maxImages={1}
                        placeholder="انتخاب عکس شاخص"
                        style={styles.imageUploadContainer}
                        initialImage={isEditMode && editPostData?.FeaturedImageURL ?
                          {
                            id: 'existing',
                            uri: editPostData.FeaturedImageURL,
                            name: editPostData.FeaturedImageFileName || 'existing-image.jpg',
                            type: 'image/jpeg'
                          } : null
                        }
                        onShowToast={showToast}
                        aspectRatio={[16, 9]}
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
  backgroundContainer: { flex: 1 },
  backgroundWrapper: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  backgroundImage: { width: '100%', height: '100%', resizeMode: 'repeat' },
  gradientOverlay: { flex: 1 },
  container: { padding: 10, backgroundColor: 'transparent' },
  backButton: { position: "absolute", top: 15, right: 15, zIndex: 10 },
  backButtonGlass: { backgroundColor: '#9E22AD', borderRadius: 25, padding: 10, borderWidth: 1, borderColor: 'rgba(255, 206, 232, 0.5)' },
  iconContainer: { justifyContent: "center", alignItems: "center", marginBottom: -110, marginTop: 50, zIndex: 1000 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: "center", alignItems: "center", shadowColor: 'rgba(255, 206, 232, 0.2)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 },
  iconInnerCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255, 206, 232, 0.15)', justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: 'rgba(255, 206, 232, 0.4)', zIndex: 99 },
  iconRing: { position: 'absolute', width: 120, height: 120, borderRadius: 60, borderWidth: 1.5, borderColor: 'rgba(255, 206, 232, 0.3)', borderStyle: 'dashed' },
  formBox: { borderRadius: 25, padding: 25, margin: 5, marginTop: 65, marginBottom: 80, position: 'relative', overflow: 'hidden' },
  glassOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 206, 232, 0.7)', borderRadius: 25, borderWidth: 1.5, borderColor: 'rgba(255, 206, 232, 1)', shadowColor: 'rgba(255, 255, 255, 1)', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6, zIndex: 1 },
  contentContainer: { position: 'relative', zIndex: 1 },
  titleText: { fontSize: 30, marginTop: 35, textAlign: "center", marginBottom: 30, fontFamily: "Yekan_Bakh_Bold", color: colors.primary, textShadowColor: 'rgba(255, 206, 232, 0.1)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  contentInput: { minHeight: 120, textAlignVertical: 'top' },
  imageUploadContainer: { backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: 15, padding: 15, borderWidth: 1, borderColor: 'rgba(255, 206, 232, 0.2)' },
  halfWidthPicker: { flex: 1 },
  buttonContainer: { marginTop: 20, gap: 15 },
  submitButton: { marginBottom: 0 },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 5,
    marginBottom: 10,
    textAlign: 'right',
    fontFamily: "Yekan_Bakh_Regular"
  }
});

export default AddNewPostScreen;