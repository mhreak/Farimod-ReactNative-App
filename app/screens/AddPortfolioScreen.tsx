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
import Tooltip from '../components/Tooltip';

// const MEMBER_ID = 1;
const ITEMS_PER_PAGE = 10;

const AddPortfolioScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const { toastVisible, setToastVisible, toastMessage, toastType, showToast } = useToast();

  const isEditMode = route.params?.isEdit || false;
  const editPortfolioData = route.params?.portfolioData || null;


const getInitialFeaturedImage = () => {
  if (isEditMode && editPortfolioData?.Images && editPortfolioData.Images.length > 0) {
    return [{
      id: 'portfolio-initial-index-0',
      uri: editPortfolioData.Images[0],
      name: 'featured.jpg',
      type: 'image/jpeg'
    }];
  }
  return [];
};

const getInitialPortfolioImages = () => {
  if (isEditMode && editPortfolioData?.Images && editPortfolioData.Images.length > 1) {
    return editPortfolioData.Images.slice(1).map((img, index) => {
      const serverIndex = index + 1;
      return {
        id: `portfolio-initial-index-${serverIndex}`,
        uri: img,
        name: `portfolio_${serverIndex}.jpg`,
        type: 'image/jpeg'
      };
    });
  }
  return [];
};

  const [isSubmitting, setIsSubmitting] = useState(false);

const [featuredImage, setFeaturedImage] = useState(getInitialFeaturedImage());
const [portfolioImages, setPortfolioImages] = useState(getInitialPortfolioImages());
  const [uploadingImages, setUploadingImages] = useState(false);

  const [initialServerFeaturedId, setInitialServerFeaturedId] = useState<string | null>(
    getInitialFeaturedImage().length > 0 ? String(getInitialFeaturedImage()[0].id) : null
  );
  const [initialServerPortfolioIds, setInitialServerPortfolioIds] = useState<string[]>(
    getInitialPortfolioImages().map(img => String(img.id))
  );

  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const SUBMIT_COOLDOWN = 3000;

  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);





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




  const showValidationErrors = (errors) => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const firstError = errors[errorKeys[0]];
      showToast(firstError, 'error');
    }
  };

  useEffect(() => {
    // initialize server image ids when edit data changes
    if (isEditMode && editPortfolioData && editPortfolioData.Images) {
      setInitialServerFeaturedId(editPortfolioData.Images.length > 0 ? 'portfolio-initial-index-0' : null);
      const ids = (editPortfolioData.Images.length > 1 ? editPortfolioData.Images.slice(1) : [])
        .map((_, idx) => `portfolio-initial-index-${idx + 1}`);
      setInitialServerPortfolioIds(ids);
    }
  }, [isEditMode, editPortfolioData]);

  const uploadImageWithRetry = async (uploadUrl, imageData, maxRetries = 2) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {

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

        if (response.ok) {
          return { success: true, status: response.status, response: responseText };
        } else {
          if (attempt === maxRetries) {
            return { success: false, status: response.status, response: responseText };
          }
        }

      } catch (error) {
        if (attempt === maxRetries) {
          return { success: false, error: error.message };
        }
      }

      if (attempt < maxRetries) {
        const waitTime = 5000 * attempt;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  };

  const getFileNameFieldBySlot = (slot) => {
    const mapping = {
      1: 'FirstImageFileName',
      2: 'SecondImageFileName',
      3: 'ThirdImageFileName',
      4: 'FourthImageFileName',
      5: 'FifthImageFileName'
    };
    return mapping[slot];
  };


  const computeSlotAssignments = (currentPortfolioImages, editData, isEdit) => {
    const oldImageForSlot = (slot) =>
      currentPortfolioImages.find(img => img.id === `portfolio-initial-index-${slot}`);

    const newImages = currentPortfolioImages.filter(
      img => !img.id || !String(img.id).startsWith('portfolio-initial-index-')
    );

    let newImageIndex = 0;
    const slots = [];

    for (let slot = 1; slot <= 5; slot++) {
      const oldImage = oldImageForSlot(slot);
      const fileNameField = getFileNameFieldBySlot(slot);
      const hadImageOnServer = !!(isEdit && editData && editData[fileNameField]);

      if (oldImage) {
    
        slots.push({
          slot,
          uri: oldImage.uri,
          name: (editData && editData[fileNameField]) || oldImage.name,
          isNew: false,
          isRemovedOld: false,
        });
        continue;
      }

  
      if (newImages[newImageIndex]) {
        const img = newImages[newImageIndex];
        newImageIndex++;
        slots.push({
          slot,
          uri: img.uri,
          name: img.name,
          isNew: true,
          isRemovedOld: false,
        });
        continue;
      }

      slots.push({
        slot,
        uri: '',
        name: '',
        isNew: false,
        isRemovedOld: hadImageOnServer,
      });
    }

    return slots;
  };

  const uploadImages = async (portfolioId, featuredImages, slotAssignments) => {
    if (featuredImages && featuredImages.length > 0) {
      const fImage = featuredImages[0];
      const isNewFeatured = !fImage.id || !String(fImage.id).startsWith('portfolio-initial-index-');
      if (fImage?.uri && isNewFeatured) {
        try {
          const fileExtension = fImage.uri.split('.').pop()?.toLowerCase() || 'jpg';
          const imageData = { uri: fImage.uri, name: fImage.name, type: fileExtension === 'png' ? 'image/png' : 'image/jpeg' };
          const uploadUrl = `${appConfig.mobileApi}Portfolio/UploadImage?portfolioId=${portfolioId}&type=0`;
          await uploadImageWithRetry(uploadUrl, imageData);
          await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (e) { console.log("Featured upload error:", e.message); }
      }
    }

    for (const slotData of slotAssignments) {
      const { slot, uri, name, isNew, isRemovedOld } = slotData;

      if (isRemovedOld) {
        try {
          console.log(`🧹 ارسال درخواست حذف صریح برای اسلات خالی شده‌ی: ${slot}`);
          const uploadUrl = `${appConfig.mobileApi}Portfolio/UploadImage?portfolioId=${portfolioId}&type=${slot}`;

          const emptyFormData = new FormData();
          const response = await fetch(uploadUrl, {
            method: 'POST',
            body: emptyFormData,
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          console.log(`Cleaned slot ${slot} status:`, response.status);
          await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (error) {
          console.log(`Error clearing slot ${slot}:`, error.message);
        }
        continue;
      }

      if (isNew && uri) {
        try {
          const fileExtension = uri.split('.').pop()?.toLowerCase() || 'jpg';
          const imageData = {
            uri,
            name: name || `portfolio-${slot}-${Date.now()}.${fileExtension}`,
            type: fileExtension === 'png' ? 'image/png' : 'image/jpeg'
          };

          console.log(`🚀 در حال آپلود عکس جدید در اسلات: ${slot}`);
          const uploadUrl = `${appConfig.mobileApi}Portfolio/UploadImage?portfolioId=${portfolioId}&type=${slot}`;
          await uploadImageWithRetry(uploadUrl, imageData);
          await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (error) {
          console.log(`Error uploading to slot ${slot}:`, error.message);
        }
      }
    }

    console.log('Sync process completed successfully.');
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

      
      const slotAssignments = computeSlotAssignments(portfolioImages, editPortfolioData, isEditMode);

      const portfolioData = {
        PortfolioId: isEditMode ? editPortfolioData.PortfolioId : 0,
        MemberId: user?.MemberId,
        Title: values.title.trim(),
        Description: values.description.trim(),

        FeaturedImageURL: featuredImage.length > 0 ? featuredImage[0].uri : "",
        FeaturedImageFileName: featuredImage.length > 0 ? featuredImage[0].name : "",

        FirstImageURL: slotAssignments[0].uri,
        FirstImageFileName: slotAssignments[0].name,

        SecondImageURL: slotAssignments[1].uri,
        SecondImageFileName: slotAssignments[1].name,

        ThirdImageURL: slotAssignments[2].uri,
        ThirdImageFileName: slotAssignments[2].name,

        FourthImageURL: slotAssignments[3].uri,
        FourthImageFileName: slotAssignments[3].name,

        FifthImageURL: slotAssignments[4].uri,
        FifthImageFileName: slotAssignments[4].name,

        Active: values.active !== undefined ? values.active : true,
        InsertDate: new Date().toISOString(),
        Rating: 0,
        LikeCount: 0,
        PortfolioItemViewModelList: []
      };


      console.log('Submitting portfolio data:', portfolioData);
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


        const hasFeaturedChange =
          featuredImage.length > 0 &&
          (!featuredImage[0].id || !String(featuredImage[0].id).startsWith('portfolio-initial-index-'));

        const hasPortfolioImageChanges = slotAssignments.some(s => s.isNew || s.isRemovedOld);

        if (hasFeaturedChange || hasPortfolioImageChanges) {
          console.log('Starting image upload process...');
          console.log('Featured image changed:', hasFeaturedChange);
          console.log('Portfolio slot changes:', slotAssignments.filter(s => s.isNew || s.isRemovedOld));

          setUploadingImages(true);
          showToast('شروع آپلود عکس‌ها...', 'info');

          await new Promise(resolve => setTimeout(resolve, 2000));

          try {
            await uploadImages(portfolioId, featuredImage, slotAssignments);
          } catch (uploadError) {
            console.error('Error uploading images:', uploadError);
            showToast('خطا در آپلود برخی عکس‌ها: ' + uploadError.message, 'error');
          } finally {
            setUploadingImages(false);
          }
        } else {
          console.log('No image changes detected — skipping upload step.');
        }

        if (!isEditMode) {
          resetForm();
          setFeaturedImage([]);
          setPortfolioImages([]);
        }

        fetchPortfolios(1, true);


       navigation.navigate("App", { screen: "PortfolioList" })
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
            onPress={() => navigation.navigate('AddPortfolio', {
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

          <View style={styles.headerButtons}>
            <View style={styles.headerLeft}>
              <Tooltip content="نمونه‌کار جدید اضافه کنید. اطلاعات پروژه شامل عنوان، توضیحات کامل، برچسب‌ها، مهارت‌های استفاده شده و دسته‌بندی را وارد کنید. تصاویر با کیفیت از پروژه خود آپلود کنید تا کارفرمایان و مشتریان بالقوه آن را مشاهده کنند." />
            </View>

            <View
              style={[
                styles.backButton,
              ]}
            >
              <TouchableOpacity onPress={() => navigation.navigate("App", { screen: "PortfolioList" })}>
                <View style={styles.backButtonGlass}>
                  <MaterialIcons name="arrow-forward" size={24} color="white" />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View
              style={[
                styles.iconContainer,
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
            </View>

            <View
              style={[
                styles.formBox,

              ]}
            >
              <View style={styles.glassOverlay} pointerEvents="none"/>

              <View style={styles.contentContainer}>
                <AppText style={styles.titleText}>
                  {isEditMode ? 'ویرایش نمونه کار' : 'افزودن نمونه کار جدید'}
                </AppText>

                <Formik
                  initialValues={{
                    title: isEditMode ? editPortfolioData?.Title || "" : "",
                    description: isEditMode ? editPortfolioData?.Description || "" : "",
                    active: isEditMode ? editPortfolioData?.Active !== undefined ? editPortfolioData.Active : true : true,
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
                        label="عنوان نمونه کار"
                          autoCapitalize="none"
                          autoCorrect={false}
                          icon="title"
                          keyboardType="default"
                          placeholder="عنوان نمونه کار"
                          onChangeText={handleChange("title")}
                          value={values.title}
                        />

                        <AppTextInput
                        label="توضیحات نمونه کار"
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
                    

                            let imageArray = [];

                            if (images) {
                              if (Array.isArray(images)) {
                                imageArray = images.filter(img => img && img.uri);
                              } else if (images.uri) {
                                imageArray = [images];
                              }
                            }


                            const prev = featuredImage || [];
                            const newArr = imageArray || [];

                            if (isEditMode && editPortfolioData?.PortfolioId && prev.length > 0) {
                              const prevInitial = prev[0];
                              const wasServerImage = prevInitial && String(prevInitial.id).startsWith('portfolio-initial-index-');
                              const stillExists = newArr.some(img => String(img.id) === String(prevInitial.id));
                              if (wasServerImage && !stillExists) {
                                const portfolioId = editPortfolioData.PortfolioId;
                                const type = 0; // featured
                                fetch(`${appConfig.mobileApi}Portfolio/DeletePortfolioImage?portfolioId=${portfolioId}&type=${type}`, { method: 'POST' })
                                  .then(res => console.log('Featured delete response', res.status))
                                  .catch(err => console.log('Featured delete error', err));
                              }
                            }

                            setFeaturedImage(imageArray);
                          }}
                          initialImage={featuredImage && featuredImage.length > 0 ? featuredImage[0] : null}
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
                  onImagesChange={(images) => {
                    let imageArray = [];

                    if (images && Array.isArray(images)) {
                      imageArray = images.filter(img => img && img.uri);
                    } else if (images && (images as any).uri) {
                      imageArray = [images];
                    }

                    const prev = portfolioImages || [];
                    const newArr = imageArray || [];

                    if (isEditMode && editPortfolioData?.PortfolioId && prev.length > 0) {
                      const removed = prev.filter(p => p && String(p.id).startsWith('portfolio-initial-index-') && !newArr.some(n => String(n.id) === String(p.id)));
                      if (removed.length > 0) {
                        const portfolioId = editPortfolioData.PortfolioId;
                        removed.forEach(r => {
                          const m = String(r.id).match(/portfolio-initial-index-(\d+)$/);
                          const type = m ? Number(m[1]) : 1;
                          fetch(`${appConfig.mobileApi}Portfolio/DeletePortfolioImage?portfolioId=${portfolioId}&type=${type}`, { method: 'POST' })
                            .then(res => console.log('Delete slot', type, 'status', res.status))
                            .catch(err => console.log('Delete slot error', err));
                        });
                      }
                    }

                    setPortfolioImages(imageArray);
                  }}
                  initialImages={portfolioImages}
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
            </View>
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
  headerLeft: {
  },
  backButton: {

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
