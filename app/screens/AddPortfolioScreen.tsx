import React, { useEffect, useRef, useState } from "react";
import AppText from "../components/Text";
import { Formik } from "formik";
import { ScrollView, StyleSheet, View, Image, TouchableOpacity, Animated, FlatList, ActivityIndicator } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import * as Yup from "yup";
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

// const MEMBER_ID = 1;
const ITEMS_PER_PAGE = 10;

const AddPortfolioScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const { toastVisible, setToastVisible, toastMessage, toastType, showToast } = useToast();

  const isEditMode = route.params?.isEdit || false;
  const editPortfolioData = route.params?.portfolioData || null;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [featuredImage, setFeaturedImage] = useState([]);
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const SUBMIT_COOLDOWN = 3000;

  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const iconFadeAnim = useRef(new Animated.Value(0)).current;
  const iconSlideAnim = useRef(new Animated.Value(-30)).current;
  const formFadeAnim = useRef(new Animated.Value(0)).current;
  const formSlideAnim = useRef(new Animated.Value(30)).current;
  const backButtonAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchPortfolios();

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

  const fetchPortfolios = async (page = 1, refresh = false) => {
    if (loading && !refresh) return;

    if (refresh) {
      setRefreshing(true);
      setCurrentPage(1);
      setHasMore(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch(
        `${appConfig.mobileApi}Portfolio/GetAll?page=${page}&pageSize=${ITEMS_PER_PAGE}&memberId=${user?.MemberId}`
      );

      if (response.ok) {
        const result = await response.json();
        const newPortfolios = result.data || [];

        if (refresh || page === 1) {
          setPortfolios(newPortfolios);
        } else {
          setPortfolios(prev => [...prev, ...newPortfolios]);
        }

        setHasMore(newPortfolios.length === ITEMS_PER_PAGE);
        setCurrentPage(page);
      } else {
        showToast('خطا در دریافت پورتفولیوها', 'error');
      }
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      showToast('خطا در دریافت پورتفولیوها', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchPortfolios(currentPage + 1);
    }
  };

  const onRefresh = () => {
    fetchPortfolios(1, true);
  };

  const validationSchema = Yup.object().shape({
    title: Yup.string().required("عنوان نمونه کار الزامی است"),
    description: Yup.string().required("توضیحات نمونه کار الزامی است"),
  });

  const showValidationErrors = (errors) => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const firstError = errors[errorKeys[0]];
      showToast(firstError, 'error');
    }
  };

  const uploadImageWithRetry = async (uploadUrl, imageData, maxRetries = 2) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Upload attempt ${attempt}/${maxRetries} for ${uploadUrl}`);

        const formData = new FormData();
        formData.append('ImageFile', {
          uri: imageData.uri,
          name: imageData.name,
          type: imageData.type,
        } as any);

        console.log('FormData prepared:', {
          uri: imageData.uri.substring(0, 50) + '...',
          name: imageData.name,
          type: imageData.type
        });

        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const responseText = await response.text();
        console.log(`Attempt ${attempt} - Response status:`, response.status);
        console.log(`Attempt ${attempt} - Response:`, responseText);

        if (response.ok) {
          console.log(`✅ Upload successful on attempt ${attempt}`);
          return { success: true, status: response.status, response: responseText };
        } else {
          console.log(`❌ Attempt ${attempt} failed with status ${response.status}`);
          if (attempt === maxRetries) {
            return { success: false, status: response.status, response: responseText };
          }
        }

      } catch (error) {
        console.error(`❌ Attempt ${attempt} error:`, error.message);
        if (attempt === maxRetries) {
          return { success: false, error: error.message };
        }
      }

      if (attempt < maxRetries) {
        const waitTime = 5000 * attempt;
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  };
  const uploadImages = async (portfolioId, featuredImages, portfolioImages) => {
    console.log('=== Starting image upload ===');
    console.log('Portfolio ID:', portfolioId);
    console.log('Featured Images:', featuredImages?.length || 0);
    console.log('Portfolio Images:', portfolioImages?.length || 0);

    const results = [];

    if (featuredImages && Array.isArray(featuredImages) && featuredImages.length > 0) {
      const featuredImage = featuredImages[0];
      console.log('Processing featured image:', featuredImage);

      if (featuredImage && featuredImage.uri) {
        try {
          const fileExtension = featuredImage.uri.split('.').pop()?.toLowerCase() || 'jpg';
          const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';

          const imageData = {
            uri: featuredImage.uri,
            name: featuredImage.name || `featured-image-${Date.now()}.${fileExtension}`,
            type: mimeType
          };

          console.log('Featured image data:', imageData);

          const uploadUrl = `${appConfig.mobileApi}Portfolio/UploadImage?portfolioId=${portfolioId}&type=0`;
          console.log('Featured image upload URL:', uploadUrl);

          const result = await uploadImageWithRetry(uploadUrl, imageData);
          results.push({ type: 'featured', ...result });

          console.log('Featured image upload completed, waiting before next upload...');
          await new Promise(resolve => setTimeout(resolve, 3000));

        } catch (error) {
          console.error('Error preparing featured image:', error);
          results.push({ type: 'featured', success: false, error: error.message });
        }
      } else {
        console.log('Featured image has no valid URI');
      }
    }

    if (portfolioImages && Array.isArray(portfolioImages) && portfolioImages.length > 0) {
      console.log('Processing portfolio images...');

      for (let i = 0; i < Math.min(portfolioImages.length, 5); i++) {
        const image = portfolioImages[i];
        const type = i + 1;

        console.log(`Processing portfolio image ${i + 1}:`, image);

        if (image && image.uri) {
          try {
            const fileExtension = image.uri.split('.').pop()?.toLowerCase() || 'jpg';
            const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';

            const imageData = {
              uri: image.uri,
              name: image.name || `portfolio-image-${i}-${Date.now()}.${fileExtension}`,
              type: mimeType
            };

            console.log(`Portfolio image ${i + 1} data:`, imageData);

            const uploadUrl = `${appConfig.mobileApi}Portfolio/UploadImage?portfolioId=${portfolioId}&type=${type}`;
            console.log(`Portfolio image ${i + 1} upload URL:`, uploadUrl);

            const result = await uploadImageWithRetry(uploadUrl, imageData);
            results.push({ type: `portfolio-${i}`, ...result });

            console.log(`Portfolio image ${i + 1} upload completed, waiting before next upload...`);
            await new Promise(resolve => setTimeout(resolve, 3000));

          } catch (error) {
            console.error(`Error preparing portfolio image ${i + 1}:`, error);
            results.push({ type: `portfolio-${i}`, success: false, error: error.message });
          }
        } else {
          console.log(`Portfolio image ${i + 1} has no valid URI or is null`);
        }
      }
    }

    if (results.length === 0) {
      console.log('No images to upload');
      return;
    }

    console.log(`Upload completed. Total results: ${results.length}`);
    console.log('Upload results:', results);

    const successfulUploads = results.filter(result => result.success).length;
    const failedUploads = results.filter(result => !result.success);

    console.log(`Successful uploads: ${successfulUploads}`);
    console.log(`Failed uploads: ${failedUploads.length}`);

    if (failedUploads.length > 0) {
      console.log('Failed upload details:', failedUploads);

      const firstFailure = failedUploads[0];
      let errorMessage = `${failedUploads.length} عکس آپلود نشد`;

      if (firstFailure.response) {
        errorMessage += `: ${firstFailure.response}`;
      } else if (firstFailure.error) {
        errorMessage += `: ${firstFailure.error}`;
      }

      showToast(errorMessage, 'error');
    } else {
      showToast('تمام عکس‌ها با موفقیت آپلود شدند', 'success');
    }
  };

  const submitPortfolio = async (values, { setErrors, resetForm }) => {
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
      const validationErrors = {};

      if (!values.title?.trim()) {
        validationErrors.title = "عنوان نمونه کار الزامی است";
      }
      if (!values.description?.trim()) {
        validationErrors.description = "توضیحات نمونه کار الزامی است";
      }

      if (Object.keys(validationErrors).length > 0) {
        showValidationErrors(validationErrors);
        setErrors(validationErrors);
        setIsSubmitting(false);
        return;
      }

      const portfolioData = {
        PortfolioId: isEditMode ? editPortfolioData.PortfolioId : 0,
        MemberId: user?.MemberId,
        Title: values.title.trim(),
        Description: values.description.trim(),
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
        Active: values.active !== undefined ? values.active : true,
        InsertDate: new Date().toISOString(),
        Rating: 0,
        LikeCount: 0,
        PortfolioItemViewModelList: []
      };

      const url = isEditMode
        ? `${appConfig.mobileApi}Portfolio/Edit`
        : `${appConfig.mobileApi}Portfolio/Add`;

      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(portfolioData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Portfolio creation result:', result);

        const portfolioId = result.PortfolioId || result.portfolioId || portfolioData.PortfolioId;
        console.log('Extracted Portfolio ID:', portfolioId);

        if (!portfolioId) {
          throw new Error('Portfolio ID not received from server');
        }

        showToast(
          isEditMode ? 'نمونه کار با موفقیت ویرایش شد' : 'نمونه کار با موفقیت ثبت شد',
          'success'
        );

        if ((featuredImage && featuredImage.length > 0) || (portfolioImages && portfolioImages.length > 0)) {
          console.log('Starting image upload process...');
          console.log('Featured images count:', featuredImage?.length || 0);
          console.log('Portfolio images count:', portfolioImages?.length || 0);

          setUploadingImages(true);
          showToast('شروع آپلود عکس‌ها...', 'info');

          await new Promise(resolve => setTimeout(resolve, 2000));

          try {
            await uploadImages(portfolioId, featuredImage, portfolioImages);
          } catch (uploadError) {
            console.error('Error uploading images:', uploadError);
            showToast('خطا در آپلود برخی عکس‌ها: ' + uploadError.message, 'error');
          } finally {
            setUploadingImages(false);
          }
        } else {
          console.log('No images selected for upload');
        }

        if (!isEditMode) {
          resetForm();
          setFeaturedImage([]);
          setPortfolioImages([]);
        }

        fetchPortfolios(1, true);

        setTimeout(() => {
          if (navigation.isFocused()) {
            navigation.goBack();
          }
        }, 1500);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.Message || `خطا در ${isEditMode ? 'ویرایش' : 'ثبت'} نمونه کار`);
      }
    } catch (error) {
      console.error('Error submitting portfolio:', error);
      showToast(error.message || `خطا در ${isEditMode ? 'ویرایش' : 'ثبت'} نمونه کار`, 'error');
    } finally {
      setIsSubmitting(false);
      setUploadingImages(false);
    }
  };

  const renderPortfolioItem = ({ item }) => (
    <View style={styles.portfolioCard}>
      <View style={styles.cardImageContainer}>
        {item.FeaturedImageURL ? (
          <Image source={{ uri: item.FeaturedImageURL }} style={styles.cardImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <MaterialIcons name="image" size={40} color={colors.medium} />
          </View>
        )}
      </View>
      <View style={styles.cardContent}>
        <AppText style={styles.cardTitle} numberOfLines={2}>{item.Title}</AppText>
        <AppText style={styles.cardDescription} numberOfLines={3}>{item.Description}</AppText>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('AddNewPortfolio', {
              isEdit: true,
              portfolioData: item
            })}
          >
            <MaterialIcons name="edit" size={16} color={colors.white} />
            <AppText style={styles.buttonText}>ویرایش</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
        <AppText style={styles.loadingText}>در حال بارگذاری...</AppText>
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
                  <MaterialIcons name={isEditMode ? "edit" : "work"} color={colors.white} size={50} />
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
                  {isEditMode ? 'ویرایش نمونه کار' : 'افزودن نمونه کار جدید'}
                </AppText>

                <Formik
                  initialValues={{
                    title: isEditMode ? editPortfolioData?.Title || "" : "",
                    description: isEditMode ? editPortfolioData?.Description || "" : "",
                    active: isEditMode ? editPortfolioData?.Active !== undefined ? editPortfolioData.Active : true : true,
                    featuredImage: [],
                    portfolioImages: [],
                  }}
                  onSubmit={submitPortfolio}
                  validate={(values) => {
                    return {};
                  }}
                  enableReinitialize={true}
                >
                  {({ handleChange, handleSubmit, errors, values, setFieldValue, resetForm }) => (
                    <>
                      <View>
                        <AppTextInput
                          autoCapitalize="none"
                          autoCorrect={false}
                          icon="title"
                          keyboardType="default"
                          placeholder="عنوان نمونه کار"
                          onChangeText={handleChange("title")}
                          value={values.title}
                        />

                        <AppTextInput
                          autoCapitalize="none"
                          autoCorrect={false}
                          icon="description"
                          keyboardType="default"
                          placeholder="توضیحات نمونه کار"
                          onChangeText={handleChange("description")}
                          value={values.description}
                          multiline={true}
                          numberOfLines={6}
                          textAlignVertical="top"
                          style={styles.descriptionInput}
                        />
                      </View>

                      <View style={styles.imageUploadSection}>
                     

                        <ImageUpload
                          onImageChange={(images) => {
                            console.log('Featured images changed:', images);
                            console.log('Featured images type:', typeof images);
                            console.log('Featured images is array:', Array.isArray(images));

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
                          placeholder="انتخاب تصویر شاخص نمونه کار"
                          style={styles.imageUploadContainer}
                          aspectRatio={[1, 1]}
                          onShowToast={showToast}
                        />
              
                      </View>

                      <View style={styles.imageUploadSection}>
                        <View style={styles.sectionHeader}>
                          <MaterialIcons name="photo-library" size={20} color={colors.primary} />
                          <AppText style={styles.sectionTitle}>تصاویر پورتفولیو</AppText>
                        </View>

                        <ImageUpload
                          onImageChange={(images) => {
                            console.log('Portfolio images changed:', images);
                            console.log('Portfolio images type:', typeof images);
                            console.log('Portfolio images is array:', Array.isArray(images));

                            let imageArray = [];

                            if (images) {
                              if (Array.isArray(images)) {
                                imageArray = images.filter(img => img && img.uri);
                              } else if (images.uri) {
                                imageArray = [images];
                              }
                            }

                            console.log('Portfolio images final array:', imageArray);

                            setPortfolioImages(imageArray);
                            setFieldValue("portfolioImages", imageArray);
                          }}
                          isMultiple={true}
                          maxImages={5}
                          imageQuality={0.8}
                          allowCamera={true}
                          allowGallery={true}
                          error={errors.portfolioImages as string}
                          placeholder="انتخاب تصاویر پورتفولیو"
                          style={styles.imageUploadContainer}
                          aspectRatio={[1, 1]}
                          allowVideos={true}
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
                                : (isEditMode ? "ویرایش نمونه کار" : "ثبت نمونه کار")
                          }
                          onPress={(isSubmitting || uploadingImages) ? undefined : handleSubmit}
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
  descriptionInput: {
    minHeight: 100,
    textAlignVertical: 'top',
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
  portfolioListSection: {
    marginTop: 20,
    marginBottom: 50,
  },
  portfolioListTitle: {
    fontSize: 20,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  portfolioRow: {
    justifyContent: 'space-between',
    marginHorizontal: 5,
  },
  portfolioCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    margin: 5,
    height: 280,
    borderWidth: 1,
    borderColor: 'rgba(255, 206, 232, 0.3)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardImageContainer: {
    height: 120,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.dark,
    marginBottom: 8,
    height: 40,
  },
  cardDescription: {
    fontSize: 12,
    color: colors.medium,
    lineHeight: 18,
    flex: 1,
    fontFamily: "Yekan_Bakh_Regular",
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  editButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.white,
    fontSize: 12,
    marginRight: 4,
    fontFamily: "Yekan_Bakh_Regular",
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginRight: 8,
    color: colors.medium,
    fontSize: 14,
  },
});

export default AddPortfolioScreen;