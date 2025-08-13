import React, { useEffect, useRef, useState } from "react";
import AppText from "../components/Text";
import { Formik } from "formik";
import { ScrollView, StyleSheet, View, Image, TouchableOpacity, Animated, Text } from "react-native";
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
import AuthService from "../services/AuthService";

const AddProductScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { toastVisible, setToastVisible, toastMessage, toastType, showToast } = useToast();

  const isEditMode = route.params?.isEdit || false;
  const editProductData = route.params?.productData || null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [featuredImage, setFeaturedImage] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const SUBMIT_COOLDOWN = 3000;

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const iconFadeAnim = useRef(new Animated.Value(0)).current;
  const iconSlideAnim = useRef(new Animated.Value(-30)).current;
  const formFadeAnim = useRef(new Animated.Value(0)).current;
  const formSlideAnim = useRef(new Animated.Value(30)).current;
  const backButtonAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Debug: Log edit data when categories are loaded
  useEffect(() => {
    if (isEditMode && editProductData && categories.length > 0) {
      console.log('=== EDIT MODE DEBUG ===');
      console.log('Edit Product Data:', editProductData);
      console.log('ProductCategoryIdList:', editProductData.ProductCategoryIdList);
      console.log('Available categories:', categories);

      // اگر ProductCategoryIdList موجود است، بررسی تطبیق با categories
      if (editProductData.ProductCategoryIdList && Array.isArray(editProductData.ProductCategoryIdList)) {
        const matchedCategories = editProductData.ProductCategoryIdList.map(id => {
          const foundCategory = categories.find(cat => cat.value === id);
          console.log(`Looking for category ID "${id}":`, foundCategory);
          return foundCategory;
        }).filter(cat => cat !== undefined);

        console.log('Matched categories for edit:', matchedCategories);
      }
    }
  }, [isEditMode, editProductData, categories]);

  useEffect(() => {
    console.log('Toast state:', { toastVisible, toastMessage, toastType });
  }, [toastVisible, toastMessage, toastType]);

  useEffect(() => {
    fetchCategories();

    // Animations
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

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      console.log('Fetching product categories from:', `${appConfig.mobileApi}ProductCategory/GetAll?filterActive=true&currentPage=1&pageSize=20`);

      const response = await fetch(`${appConfig.mobileApi}ProductCategory/GetAll?filterActive=true&currentPage=1&pageSize=20`);

      if (response.ok) {
        const result = await response.json();
        console.log('Product Categories API Response:', result);

        const categoriesArray = result.Data || [];

        if (categoriesArray.length > 0) {
          const activeCategories = categoriesArray.filter(category =>
            category && category.Active === true
          );

          const categoryOptions = activeCategories.map(category => ({
            value: category.ProductCategoryId,
            label: category.Name || `دسته ${category.ProductCategoryId}`
          }));

          console.log('Processed product categories:', categoryOptions);
          setCategories(categoryOptions);
        } else {
          console.log('No product categories received, using fallback');
          setCategories([
            { value: 1, label: "مواد اولیه" },
            { value: 2, label: "لباس زنانه" },
            { value: 3, label: "تست۲" },
          ]);
        }
      } else {
        console.log('Product Categories API failed with status:', response.status);
        setCategories([
          { value: 1, label: "مواد اولیه" },
          { value: 2, label: "لباس زنانه" },
          { value: 3, label: "تست۲" },
        ]);
      }
    } catch (error) {
      console.error('Error fetching product categories:', error);
      setCategories([
        { value: 1, label: "مواد اولیه" },
        { value: 2, label: "لباس زنانه" },
        { value: 3, label: "تست۲" },
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

  // Image upload functions remain the same...
  const uploadImageWithRetry = async (uploadUrl, imageData, maxRetries = 2) => {
    // ... (same as original)
  };

  const uploadImages = async (productId, featuredImages, productImages) => {
    // ... (same as original)
  };

  const submitProduct = async (values, { setErrors, resetForm }) => {
    const currentTime = Date.now();

    if (currentTime - lastSubmitTime < SUBMIT_COOLDOWN) {
      showToast('لطفاً کمی صبر کنید...', 'warning');
      return;
    }

    if (isSubmitting || uploadingImages) {
      console.log('Already submitting, ignoring request');
      return;
    }

    setLastSubmitTime(currentTime);
    setIsSubmitting(true);

    try {
      console.log('✅ Starting product submission with validated data:', values);

      const userData = await AuthService.getUserData();
      const memberId = userData?.MemberGroupList?.[0]?.MemberId || 1;

      const categoryIdList = values.productCategoryIds || [];

      const productData = {
        ProductId: isEditMode ? editProductData.ProductId : 0,
        MemberId: memberId,
        MemberName: userData?.MemberName || "",
        ProductName: values.productName.trim(),
        Description: values.description?.trim() || "",
        Price: parseFloat(values.price) || 0,
        SpecialSalePrice: parseFloat(values.specialPrice) || 0,
        ProductCategories: "", // خالی می‌گذاریم چون ProductCategoryIdList استفاده می‌شود
        ProductCategoryIdList: categoryIdList, // آرایه ID های دسته‌بندی
        FeaturedImageFileName: "",
        FeaturedImageURL: "",
        FirstImageFileName: "",
        FirstImageURL: "",
        SecondImageFileName: "",
        SecondImageURL: "",
        ThirdImageFileName: "",
        ThirdImageURL: "",
        FourthImageFileName: "",
        FourthImageURL: "",
        FifthImageFileName: "",
        FifthImageURL: "",
        LikeCount: 0,
        Rating: 0,
        Active: values.active !== undefined ? values.active : true,
        ActiveStr: values.active !== undefined ? (values.active ? "موجود" : "ناموجود") : "موجود", // تغییر به موجود/ناموجود
        InsertDate: new Date().toISOString()
      };

      const url = isEditMode
        ? `${appConfig.mobileApi}Product/Edit`
        : `${appConfig.mobileApi}Product/Add`;

      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Product creation result:', result);

        const productId = result.ProductId || result.productId || productData.ProductId;
        console.log('Extracted Product ID:', productId);

        if (!productId) {
          throw new Error('Product ID not received from server');
        }

        showToast(
          isEditMode ? 'محصول با موفقیت ویرایش شد' : 'محصول با موفقیت ثبت شد',
          'success'
        );

        if ((featuredImage && featuredImage.length > 0) || (productImages && productImages.length > 0)) {
          console.log('Starting image upload process...');
          setUploadingImages(true);
          showToast('شروع آپلود عکس‌ها...', 'info');

          await new Promise(resolve => setTimeout(resolve, 2000));

          try {
            await uploadImages(productId, featuredImage, productImages);
          } catch (uploadError) {
            console.error('Error uploading images:', uploadError);
            showToast('خطا در آپلود برخی عکس‌ها: ' + uploadError.message, 'error');
          } finally {
            setUploadingImages(false);
          }
        }

        if (!isEditMode) {
          resetForm();
          setFeaturedImage([]);
          setProductImages([]);
        }

        setTimeout(() => {
          if (navigation.isFocused()) {
            navigation.goBack();
          }
        }, 1500);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.Message || `خطا در ${isEditMode ? 'ویرایش' : 'ثبت'} محصول`);
      }
    } catch (error) {
      console.error('Error submitting product:', error);
      showToast(error.message || `خطا در ${isEditMode ? 'ویرایش' : 'ثبت'} محصول`, 'error');
    } finally {
      setIsSubmitting(false);
      setUploadingImages(false);
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
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <View style={styles.backButtonGlass}>
                <MaterialIcons name="arrow-forward" size={24} color="white" />
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
                  <MaterialIcons name={isEditMode ? "edit" : "shopping-bag"} color={colors.white} size={50} />
                </View>
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
              <View style={styles.glassOverlay} />

              <View style={styles.contentContainer}>
                <AppText style={styles.titleText}>
                  {isEditMode ? 'ویرایش محصول' : 'افزودن محصول جدید'}
                </AppText>

                <Formik
                  initialValues={{
                    productName: isEditMode ? editProductData?.ProductName || "" : "",
                    description: isEditMode ? editProductData?.Description || "" : "",
                    price: isEditMode ? editProductData?.Price?.toString() || "" : "",
                    specialPrice: isEditMode ? editProductData?.SpecialSalePrice?.toString() || "" : "",
                    // 🔥 تصحیح اصلی: استفاده از ProductCategories مشابه بلاگ پست
                    productCategoryIds: isEditMode ?
                      (editProductData?.ProductCategories ?
                        // تبدیل نام دسته‌ها به ID ها بر اساس categories - مشابه بلاگ پست
                        editProductData.ProductCategories.split("،").map(categoryName => {
                          const trimmedName = categoryName.trim();
                          const foundCategory = categories.find(cat => cat.label === trimmedName);
                          console.log(`Looking for product category "${trimmedName}":`, foundCategory);
                          return foundCategory ? foundCategory.value : null;
                        }).filter(id => id !== null)
                        : []
                      ) : [],
                    active: isEditMode ? editProductData?.Active !== undefined ? editProductData.Active : true : true,
                    featuredImage: [],
                    productImages: [],
                  }}
                  onSubmit={submitProduct}
                  enableReinitialize={true}
                >
                  {({ handleChange, handleSubmit, errors, values, setFieldValue, resetForm, setErrors }) => (
                    <>
                      <View>
                        <AppTextInput
                          autoCapitalize="none"
                          autoCorrect={false}
                          icon="shopping-bag"
                          keyboardType="default"
                          placeholder="نام محصول"
                          onChangeText={handleChange("productName")}
                          value={values.productName}
                          error={errors.productName}
                          style={{
                            borderColor: errors.productName ? '#e74c3c' : undefined
                          }}
                        />

                        <AppTextInput
                          autoCapitalize="none"
                          autoCorrect={false}
                          icon="description"
                          keyboardType="default"
                          placeholder="توضیحات محصول"
                          onChangeText={handleChange("description")}
                          value={values.description}
                          multiline={true}
                          numberOfLines={4}
                          style={{ height: 100, textAlignVertical: 'top' }}
                        />

                        <AppTextInput
                          autoCapitalize="none"
                          autoCorrect={false}
                          icon="attach-money"
                          keyboardType="numeric"
                          placeholder="قیمت (تومان)"
                          onChangeText={handleChange("price")}
                          value={values.price}
                          error={errors.price}
                          style={{
                            borderColor: errors.price ? '#e74c3c' : undefined
                          }}
                        />

                        <AppTextInput
                          autoCapitalize="none"
                          autoCorrect={false}
                          icon="local-offer"
                          keyboardType="numeric"
                          placeholder="قیمت ویژه"
                          onChangeText={handleChange("specialPrice")}
                          value={values.specialPrice}
                          error={errors.specialPrice}
                          style={{
                            borderColor: errors.specialPrice ? '#e74c3c' : undefined
                          }}
                        />

                        {/* 🔥 تصحیح اصلی: AppPicker مشابه بلاگ پست */}
                        <AppPicker
                          items={categories}
                          onSelectItem={(item) => {
                            // این callback دیگر استفاده نمی‌شود در حالت multi-select
                          }}
                          onMultiSelectChange={(selectedItems) => {
                            // callback جدید برای multi-select
                            const selectedIds = selectedItems ? selectedItems.map(item => item.value) : [];
                            console.log('Selected product categories:', selectedIds);
                            console.log('Selected category objects:', selectedItems);
                            setFieldValue("productCategoryIds", selectedIds);
                          }}
                          selectedItems={
                            // 🔥 تبدیل آرایه ID ها به آرایه آبجکت‌ها برای نمایش - مشابه بلاگ پست
                            (values.productCategoryIds && Array.isArray(values.productCategoryIds)) ?
                              values.productCategoryIds
                                .filter(id => id !== null && id !== undefined && id !== 0) // فیلتر کردن مقادیر نامعتبر
                                .map(id => {
                                  const category = categories.find(cat => cat.value === id);
                                  console.log(`Finding category for ID ${id}:`, category);
                                  return category || null;
                                })
                                .filter(item => item !== null) // حذف موارد null
                              : []
                          }
                          icon="category"
                          placeholder={
                            loadingCategories
                              ? "در حال بارگذاری..."
                              : !values.productCategoryIds || values.productCategoryIds.length === 0
                                ? "انتخاب دسته‌بندی محصول"
                                : `${values.productCategoryIds.length} دسته انتخاب شده`
                          }
                          disabled={loadingCategories}
                          multiSelect={true}
                        />

                        {/* 🔥 اضافه کردن فاصله و picker برای وضعیت موجود/ناموجود */}
                        <View style={styles.spacer} />

                        <AppPicker
                          items={[
                            { value: true, label: "موجود" },
                            { value: false, label: "ناموجود" }
                          ]}
                          onSelectItem={(item) => setFieldValue("active", item?.value)}
                          selectedItem={values.active !== null && values.active !== undefined ?
                            { value: values.active, label: values.active ? "موجود" : "ناموجود" } : null}
                          icon="inventory"
                          placeholder="وضعیت موجودی"
                          style={styles.halfWidthPicker}
                        />
                      </View>

                      <View style={styles.imageUploadSection}>
                        <ImageUpload
                          onImageChange={(images) => {
                            console.log('Featured images changed:', images);

                            let imageArray = [];

                            if (images) {
                              if (Array.isArray(images)) {
                                imageArray = images.filter(img => img && img.uri);
                              } else if (images.uri) {
                                imageArray = [images];
                              }
                            }

                            console.log('Featured images final array:', imageArray);

                            setFeaturedImage(imageArray);
                            setFieldValue("featuredImage", imageArray);
                          }}
                          isMultiple={false}
                          maxImages={1}
                          imageQuality={0.8}
                          allowCamera={true}
                          allowGallery={true}
                          error={errors.featuredImage as string}
                          placeholder="انتخاب تصویر شاخص محصول"
                          style={styles.imageUploadContainer}
                          aspectRatio={[1, 1]}
                          onShowToast={showToast}
                        />
                      </View>

                      <View style={styles.imageUploadSection}>
                        <ImageUpload
                          onImageChange={(images) => {
                            console.log('Product images changed:', images);

                            let imageArray = [];

                            if (images) {
                              if (Array.isArray(images)) {
                                imageArray = images.filter(img => img && img.uri);
                              } else if (images.uri) {
                                imageArray = [images];
                              }
                            }

                            console.log('Product images final array:', imageArray);

                            setProductImages(imageArray);
                            setFieldValue("productImages", imageArray);
                          }}
                          isMultiple={true}
                          maxImages={5}
                          imageQuality={0.8}
                          allowCamera={true}
                          allowGallery={true}
                          error={errors.productImages as string}
                          placeholder="انتخاب تصاویر محصول"
                          style={styles.imageUploadContainer}
                          aspectRatio={[1, 1]}
                          onShowToast={showToast}
                        />
                      </View>

                      <View style={styles.buttonContainer}>
                        <AppButton
                          title={
                            isSubmitting
                              ? (isEditMode ? "در حال ویرایش..." : "در حال ثبت...")
                              : uploadingImages
                                ? "در حال آپلود عکس‌ها..."
                                : (isEditMode ? "ویرایش محصول" : "ثبت محصول")
                          }
                          onPress={() => {
                            console.log('🔴 Submit button pressed');
                            console.log('🔴 Current form values:', values);

                            // validation مستقیم
                            const validationErrors = {};
                            let firstErrorMessage = null;

                            // بررسی نام محصول
                            if (!values.productName || !values.productName.trim()) {
                              console.log('❌ Product name validation failed');
                              validationErrors.productName = "نام محصول الزامی است";
                              firstErrorMessage = "نام محصول الزامی است";
                            }

                            // بررسی قیمت
                            if (!values.price || parseFloat(values.price) <= 0 || isNaN(parseFloat(values.price))) {
                              console.log('❌ Price validation failed');
                              validationErrors.price = "قیمت الزامی است";
                              if (!firstErrorMessage) {
                                firstErrorMessage = "قیمت محصول الزامی است";
                              }
                            }

                            // بررسی قیمت ویژه
                            if (values.specialPrice && values.price) {
                              const price = parseFloat(values.price);
                              const specialPrice = parseFloat(values.specialPrice);

                              if (!isNaN(specialPrice) && !isNaN(price) && specialPrice >= price) {
                                console.log('❌ Special price validation failed');
                                validationErrors.specialPrice = "قیمت ویژه باید کمتر از قیمت اصلی باشد";
                                if (!firstErrorMessage) {
                                  firstErrorMessage = "قیمت ویژه باید کمتر از قیمت اصلی باشد";
                                }
                              }
                            }

                            // بررسی دسته‌بندی
                            if (!values.productCategoryIds || !Array.isArray(values.productCategoryIds) || values.productCategoryIds.length === 0) {
                              console.log('❌ Category validation failed');
                              validationErrors.productCategoryIds = "حداقل یک دسته‌بندی الزامی است";
                              if (!firstErrorMessage) {
                                firstErrorMessage = "حداقل یک دسته‌بندی الزامی است";
                              }
                            }

                            // اگر خطا وجود دارد
                            if (firstErrorMessage) {
                              console.log('🚨 Showing validation error:', firstErrorMessage);
                              showToast(firstErrorMessage, 'error');
                              setErrors(validationErrors);
                              return;
                            }

                            // اگر validation پاس شد، ادامه submit
                            console.log('✅ Validation passed, calling submitProduct');
                            submitProduct(values, { setErrors, resetForm });
                          }}
                          color={isEditMode ? colors.info : colors.success}
                          disabled={isSubmitting || uploadingImages}
                          style={[
                            styles.submitButton,
                            (isSubmitting || uploadingImages) && styles.disabledButton
                          ]}
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
    marginBottom: 20,
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
  imageUploadSection: {
    marginTop: 25,
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.primary,
    marginRight: 8,
  },
  imageUploadContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 206, 232, 0.2)',
  },
  imageHint: {
    fontSize: 12,
    color: colors.medium,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: "Yekan_Bakh_Regular",
  },
  buttonContainer: {
    marginTop: 20,
    gap: 15,
  },
  submitButton: {
    marginBottom: 0,
  },
  disabledButton: {
    opacity: 0.6,
  },
  halfWidthPicker: {
    flex: 1,
  },
  spacer: {
    height: 20,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 5,
    marginBottom: 10,
    textAlign: 'right',
    fontFamily: "Yekan_Bakh_Regular"
  },
});

export default AddProductScreen;