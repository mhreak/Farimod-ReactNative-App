import React, { useEffect, useRef, useState } from "react";
import AppText from "../components/Text";
import { Formik } from "formik";
import {
  ScrollView,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Animated,
  Text,
  Platform,
  Alert,
  ActivityIndicator
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import AppTextInput from "../components/TextInput";
import colors from "../config/colors";
import AppButton from "../components/Button";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";
import Screen from "../components/Screen";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import appConfig from "../config/config";
import ImageUpload from "../components/ImageUpload";
import { useAuth } from '../contexts/AuthContext';
import Tooltip from '../components/Tooltip';
import { StatusBar } from "expo-status-bar";


const AddGalleryScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const { toastVisible, setToastVisible, toastMessage, toastType, showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);

  // Animation refs

  const iconFadeAnim = useRef(new Animated.Value(0)).current;
  const iconSlideAnim = useRef(new Animated.Value(-30)).current;
  const formFadeAnim = useRef(new Animated.Value(0)).current;
  const formSlideAnim = useRef(new Animated.Value(30)).current;
  const backButtonAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;



  useEffect(() => {
    Animated.sequence([

      Animated.parallel([
        Animated.timing(iconFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true
        }),
        Animated.timing(iconSlideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true
        }),
      ]),
    ]).start();

  }, []);

  const showValidationErrors = (errors) => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const firstError = errors[errorKeys[0]];
      showToast(firstError, 'error');
    }
  };

  const submitGallery = async (values, { setErrors, resetForm }) => {
    setIsSubmitting(true);

    try {
      // اعتبارسنجی
      const validationErrors = {};

      if (!values.title?.trim()) {
        validationErrors.title = "عنوان گالری الزامی است";
      }

      const imagesToUpload = values.images && values.images.length > 0 ? values.images : galleryImages;

      if (!imagesToUpload || imagesToUpload.length === 0) {
        validationErrors.images = "حداقل یک تصویر الزامی است";
      }

      if (Object.keys(validationErrors).length > 0) {
        console.log('Validation errors:', validationErrors);
        showValidationErrors(validationErrors);
        setErrors(validationErrors);
        setIsSubmitting(false);
        return;
      }

      console.log('🚀 Starting gallery submission...');
      console.log('📸 Images to upload:', imagesToUpload);

      // ═══════════════════════════════════════════════════════════
      // مرحله 1: ایجاد گالری اصلی
      // ═══════════════════════════════════════════════════════════
      console.log('📋 STEP 1: Creating main gallery...');

      const galleryData = {
        ImageGalleryId: 0,
        Title: values.title.trim(),
        MemberId: user?.MemberId || 0,
        MemberName: user?.MemberName || '',
        ImageCount: imagesToUpload.length,
        Rating: 0,
        LikeCount: 0,
        FeaturedImageURL: '',
        Active: true,
        ActiveStr: 'فعال',
        InsertDate: new Date().toISOString(),
        ShamsiInsertDate: '',
        ImageGalleryItemList: []
      };

      console.log('📤 Sending gallery data:', galleryData);

      const galleryResponse = await fetch(
        `${appConfig.mobileApi}ImageGallery/Add`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
          },
          body: JSON.stringify(galleryData)
        }
      );

      console.log('📥 Gallery response status:', galleryResponse.status);

      if (!galleryResponse.ok) {
        const errorText = await galleryResponse.text();
        console.error('❌ Gallery creation error:', errorText);
        throw new Error('خطا در ایجاد گالری');
      }

      const responseText = await galleryResponse.text();
      console.log('📥 Raw response text:', responseText);

      let galleryResult;
      try {
        galleryResult = JSON.parse(responseText);
        console.log('✅ Parsed gallery result:', JSON.stringify(galleryResult, null, 2));
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        throw new Error('خطا در دریافت پاسخ سرور');
      }

      // استخراج Gallery ID
      let imageGalleryId;

      // اول سعی کن ID رو مستقیماً از response بگیری
      if (typeof galleryResult === 'number') {
        imageGalleryId = galleryResult;
        console.log('✅ Gallery ID received directly as number:', imageGalleryId);
      } else {
        imageGalleryId = galleryResult.ImageGalleryId ||
          galleryResult.imageGalleryId ||
          galleryResult.data?.ImageGalleryId ||
          galleryResult.data?.imageGalleryId ||
          galleryResult.Data?.ImageGalleryId ||
          galleryResult.Data?.imageGalleryId ||
          galleryResult.id ||
          galleryResult.Id;

        if (imageGalleryId && imageGalleryId !== 0) {
          console.log('✅ Gallery ID extracted from response:', imageGalleryId);
        }
      }

      // اگر ID پیدا نشد و فقط پیام موفقیت داریم، از لیست بگیر
      if ((!imageGalleryId || imageGalleryId === 0) && galleryResult.Message && galleryResult.Message.includes('موفقیت')) {
        console.log('⚠️ No ID in response, fetching gallery list...');

        try {
          const galleryListResponse = await fetch(
            `${appConfig.mobileApi}ImageGallery/GetByMemberId?memberId=${user?.MemberId || 0}`,
            {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              }
            }
          );

          if (galleryListResponse.ok) {
            const galleryListText = await galleryListResponse.text();
            const galleryList = JSON.parse(galleryListText);
            console.log('📥 Gallery list received:', galleryList);

            let newGallery = null;

            if (Array.isArray(galleryList)) {
              const matchingGalleries = galleryList.filter(g =>
                g.Title === values.title.trim()
              );

              if (matchingGalleries.length > 0) {
                matchingGalleries.sort((a, b) =>
                  new Date(b.InsertDate) - new Date(a.InsertDate)
                );
                newGallery = matchingGalleries[0];
              } else {
                galleryList.sort((a, b) =>
                  new Date(b.InsertDate) - new Date(a.InsertDate)
                );
                newGallery = galleryList[0];
              }
            } else if (galleryList.data && Array.isArray(galleryList.data)) {
              const matchingGalleries = galleryList.data.filter(g =>
                g.Title === values.title.trim()
              );

              if (matchingGalleries.length > 0) {
                matchingGalleries.sort((a, b) =>
                  new Date(b.InsertDate) - new Date(a.InsertDate)
                );
                newGallery = matchingGalleries[0];
              } else {
                galleryList.data.sort((a, b) =>
                  new Date(b.InsertDate) - new Date(a.InsertDate)
                );
                newGallery = galleryList.data[0];
              }
            }

            if (newGallery) {
              imageGalleryId = newGallery.ImageGalleryId || newGallery.imageGalleryId;
              console.log('✅ Found gallery ID from list:', imageGalleryId);
            } else {
              throw new Error('گالری در لیست پیدا نشد');
            }
          } else {
            throw new Error('خطا در دریافت لیست گالری‌ها');
          }
        } catch (fetchError) {
          console.error('❌ Error fetching gallery list:', fetchError);
          throw new Error('خطا در دریافت شناسه گالری');
        }
      }

      // چک نهایی
      if (!imageGalleryId || imageGalleryId === 0) {
        console.error('❌ No valid gallery ID found!');
        console.error('Response was:', galleryResult);
        throw new Error('شناسه گالری دریافت نشد');
      }

      console.log('🎯 Final gallery ID:', imageGalleryId);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // ═══════════════════════════════════════════════════════════
      // مرحله 2: ثبت آیتم‌ها و آپلود تصاویر
      // ═══════════════════════════════════════════════════════════
      console.log('📸 STEP 2: Adding gallery items...');
      console.log(`📊 Total images: ${imagesToUpload.length}`);

      let successCount = 0;
      let failedCount = 0;

      for (let i = 0; i < imagesToUpload.length; i++) {
        const image = imagesToUpload[i];
        console.log(`\n📸 [${i + 1}/${imagesToUpload.length}] Processing image...`);

        try {
          // ساخت FormData
          const itemFormData = new FormData();

          itemFormData.append('ImageGalleryItemId', '0');
          itemFormData.append('ImageGalleryId', imageGalleryId.toString());
          itemFormData.append('Title', image.title || values.title.trim());
          itemFormData.append('ImageFileName', '');
          itemFormData.append('ImageURL', '');
          itemFormData.append('ShowOrder', i.toString());
          itemFormData.append('Active', 'true');
          itemFormData.append('ActiveStr', 'فعال');
          itemFormData.append('InsertDate', new Date().toISOString());
          itemFormData.append('ShamsiInsertDate', '');

          // فیکس URI برای Android
          let imageUri = image.uri;
          if (Platform.OS === 'android' && !imageUri.startsWith('file://')) {
            imageUri = `file://${imageUri}`;
          }

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

          const fileName = image.name || `gallery-image-${Date.now()}-${i}.jpg`;

          const imageFile = {
            uri: imageUri,
            type: fileType,
            name: fileName
          };

          itemFormData.append('imageFile', imageFile);

          console.log(`  ↳ Uploading with axios...`);
          console.log(`  ↳ File:`, { name: fileName, type: fileType, uri: imageUri.substring(0, 50) + '...' });

          // ارسال با axios
          const response = await axios.post(
            `${appConfig.mobileApi}ImageGalleryItem/Add`,
            itemFormData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': '*/*',
              },
              timeout: 60000,
              onUploadProgress: (progressEvent) => {
                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                console.log(`    📤 Upload progress: ${percent}%`);
              },
            }
          );

          console.log(`  ✅ Success! Response:`, response.data);
          successCount++;

        } catch (error) {
          failedCount++;
          console.error(`  ❌ Failed!`, error.response?.data || error.message);
          console.error(`    Status:`, error.response?.status);
        }
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📊 Summary: ${successCount} succeeded, ${failedCount} failed`);

      setIsSubmitting(false);

      if (successCount === imagesToUpload.length) {
        showToast('گالری با موفقیت ایجاد شد', 'success');
        resetForm();
        setGalleryImages([]);

                (navigation as any).navigate("App", { screen: "MyGallery" });

      } else if (successCount > 0) {
        showToast(
          `گالری ایجاد شد اما ${failedCount} تصویر آپلود نشد`,
          'warning'
        );


          (navigation as any).navigate("App", { screen: "MyGallery" });

      } else {
        throw new Error('هیچ تصویری آپلود نشد');
      }

    } catch (error) {
      setIsSubmitting(false);
      console.error('❌ Submit error:', error);
      showToast(
        error.message || 'خطا در ذخیره گالری',
        'error'
      );
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

      <View

        style={styles.gradientOverlay}
      >
        <Screen style={styles.container}>
          <Toast
            visible={toastVisible}
            message={toastMessage}
            type={toastType}
            onHide={() => setToastVisible(false)}
          />
          <View style={styles.headerButtons}>
            <View style={styles.headerLeft}>
              <Tooltip content="گالری تصویری جدید ایجاد کنید. عنوان، توضیحات و دسته‌بندی گالری را مشخص کنید تا تصاویر خود را به صورت دسته‌بندی شده نمایش دهید." />
            </View>

            <View
              style={[
                styles.backButton,
              ]}
            >
              <TouchableOpacity onPress={() => (navigation as any).navigate("App", { screen: "MyGallery" })}>
                <View style={styles.backButtonGlass}>
                  <MaterialIcons name="arrow-forward" size={24} color="white" />
                </View>
              </TouchableOpacity>
            </View>
          </View>


          <ScrollView showsVerticalScrollIndicator={false}>
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  opacity: iconFadeAnim,
                  transform: [
                    { translateY: iconSlideAnim },
                    { scale: pulseAnim }
                  ]
                }
              ]}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark || colors.primary]}
                style={styles.iconCircle}
              >
                <View style={styles.iconInnerCircle}>
                  <MaterialIcons
                    name="photo-library"
                    color={colors.white}
                    size={50}
                  />
                </View>
                <View style={styles.iconRing} />
              </LinearGradient>
            </Animated.View>

            <View
              style={[
                styles.formBox,
              ]}
            >
              <View style={styles.glassOverlay} pointerEvents="none" />

              <View style={styles.contentContainer}>
                <AppText style={styles.titleText}>افزودن گالری جدید</AppText>

                <Formik
                  initialValues={{
                    title: "",
                    images: [],
                  }}
                  onSubmit={submitGallery}
                  validate={() => ({})}
                >
                  {({ handleChange, handleSubmit, errors, values, setFieldValue }) => (
                    <>
                      <AppTextInput
                        label="عنوان گالری"
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="title"
                        keyboardType="default"
                        placeholder="عنوان گالری"
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

                      {values.images && values.images.length > 0 && (
                        <View style={styles.imageCountContainer}>
                          <MaterialIcons
                            name="photo-library"
                            size={20}
                            color={colors.primary}
                          />
                          <Text style={styles.imageCountText}>
                            {values.images.length} تصویر انتخاب شده
                          </Text>
                        </View>
                      )}

                      <ImageUpload
                        onImageChange={(images) => {
                          console.log('📸 ImageUpload callback:', images);

                          let imageArray = [];

                          if (images) {
                            if (Array.isArray(images)) {
                              imageArray = images.filter(img => img && img.uri);
                            } else if (images.uri) {
                              imageArray = [images];
                            }
                          }

                          setGalleryImages(imageArray);
                          setFieldValue("images", imageArray);
                        }}
                        isMultiple={true}
                        multiple={true}
                        imageQuality={0.8}
                        allowCamera={true}
                        allowGallery={true}
                        error={errors.images}
                        maxImages={10}
                        placeholder="انتخاب تصاویر گالری (حداکثر 10 عکس)"
                        style={styles.imageUploadContainer}
                        onShowToast={showToast}
                        aspectRatio={[16, 9]}
                      />
                      {errors.images && (
                        <Text style={styles.errorText}>{errors.images}</Text>
                      )}

                      <View style={styles.helpContainer}>
                        <MaterialIcons
                          name="info-outline"
                          size={16}
                          color={colors.medium}
                        />
                        <Text style={styles.helpText}>
                          می‌توانید چندین تصویر را همزمان انتخاب کنید
                        </Text>
                      </View>

                      <View style={styles.buttonContainer}>
                        <AppButton
                          title={isSubmitting ? "در حال ثبت..." : "ثبت گالری"}
                          onPress={handleSubmit}
                          color={colors.success}
                          disabled={isSubmitting}
                          style={styles.submitButton}
                        />
                      </View>
                    </>
                  )}
                </Formik>
              </View>
            </View>
          </ScrollView>
        </Screen>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1
  },
  backgroundWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  headerButtons: {
    position: 'absolute',
    top: 15,
    left: 15,
    right: 15,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'repeat'
  },
  gradientOverlay: {
    flex: 1
  },
  container: {
    padding: 10,
    backgroundColor: 'transparent'
  },
  backButton: {
    // position: "absolute",
    // top: 15,
    right: 0,
    zIndex: 10,
    flexDirection: 'row-reverse',
    gap: 12,
    alignItems: 'center',
  },
  backButtonGlass: {
    backgroundColor: '#9E22AD',
    borderRadius: 25,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 206, 232, 0.5)'
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: -110,
    marginTop: 50,
    zIndex: 1000
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: 'rgba(255, 206, 232, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8
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
    zIndex: 99
  },
  iconRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 206, 232, 0.3)',
    borderStyle: 'dashed'
  },
  formBox: {
    borderRadius: 25,
    padding: 25,
    margin: 5,
    marginTop: 65,
    marginBottom: 80,
    position: 'relative',
    overflow: 'hidden'
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
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 1
  },
  contentContainer: {
    position: 'relative',
    zIndex: 1
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
    textShadowRadius: 2
  },
  imageUploadContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 206, 232, 0.2)',
    marginBottom: 10
  },
  imageCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 206, 232, 0.3)',
  },
  imageCountText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 8,
    fontFamily: "Yekan_Bakh_Regular",
    fontWeight: '600'
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
    marginBottom: 15,
  },
  helpText: {
    fontSize: 12,
    color: colors.medium,
    marginLeft: 6,
    fontFamily: "Yekan_Bakh_Regular",
  },
  buttonContainer: {
    marginTop: 20,
    gap: 15
  },
  submitButton: {
    marginBottom: 0
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 5,
    marginBottom: 10,
    textAlign: 'right',
    fontFamily: "Yekan_Bakh_Regular"
  }
});

export default AddGalleryScreen;