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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
import Tooltip from "../components/Tooltip";
import { getFontFamily } from "../components/TextInput";

const AddProductScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { toastVisible, setToastVisible, toastMessage, toastType, showToast } =
    useToast();

  const isEditMode = route.params?.isEdit || false;
  const editProductData = route.params?.productData || null;
  console.log("Edit Product Data:", editProductData);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [featuredImage, setFeaturedImage] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const [originalFeaturedImageId, setOriginalFeaturedImageId] = useState<string | null>(null);
  const [originalProductImageIds, setOriginalProductImageIds] = useState<string[]>([]);
  const SUBMIT_COOLDOWN = 3000;
  const PRODUCT_IMAGE_INITIAL_ID_PREFIX = "product-initial-index-";

  // initialize server images when editing
  useEffect(() => {
    if (isEditMode && editProductData) {
      const f = [];
      if (editProductData.FeaturedImageURL) {
        f.push({
          id: `${PRODUCT_IMAGE_INITIAL_ID_PREFIX}0`,
          uri: editProductData.FeaturedImageURL,
          name: "featured.jpg",
        });
      }

      const p = [];
      const fields = [
        "FirstImageURL",
        "SecondImageURL",
        "ThirdImageURL",
        "FourthImageURL",
        "FifthImageURL",
      ];

      fields.forEach((field, idx) => {
        const url = editProductData[field];
        if (url) {
          p.push({
            id: `${PRODUCT_IMAGE_INITIAL_ID_PREFIX}${idx + 1}`,
            uri: url,
            name: `product_${idx + 1}.jpg`,
          });
        }
      });

      setFeaturedImage(f);
      setProductImages(p);
      setOriginalFeaturedImageId(f.length > 0 ? String(f[0].id) : null);
      setOriginalProductImageIds(p.map((img) => String(img.id)));
    }
  }, [isEditMode, editProductData]);

  const isServerImage = (image: any) => {
    return image?.id && String(image.id).startsWith(PRODUCT_IMAGE_INITIAL_ID_PREFIX);
  };

  const getProductImageSlot = (image: any) => {
    if (!isServerImage(image)) return null;
    const match = String(image.id).match(/product-initial-index-(\d+)$/);
    return match ? Number(match[1]) : null;
  };

  const deleteProductImage = async (productId: number, type: number) => {
    try {
      const response = await fetch(
        `${appConfig.mobileApi}Product/DeleteProductImage?productId=${productId}&type=${type}`,
        { method: "POST" },
      );
      console.log(`Deleted product image type ${type} status`, response.status);
    } catch (error) {
      console.log(`Delete product image type ${type} failed`, error);
    }
  };

  const getRemovedServerImageSlots = (prevImages: any[], nextImages: any[]) => {
    return prevImages
      .filter(
        (prev) =>
          isServerImage(prev) &&
          !nextImages.some((next) => String(next.id) === String(prev.id)),
      )
      .map((removed) => getProductImageSlot(removed))
      .filter((slot) => slot !== null) as number[];
  };

  const getFileNameFieldBySlot = (slot) => {
    const mapping: Record<number, string> = {
      1: "FirstImageFileName",
      2: "SecondImageFileName",
      3: "ThirdImageFileName",
      4: "FourthImageFileName",
      5: "FifthImageFileName",
    };
    return mapping[slot];
  };

  const computeProductSlotAssignments = (
    currentImages: any[],
    editData: any,
    isEdit: boolean,
  ) => {
    const oldImageForSlot = (slot: number) =>
      currentImages.find(
        (img) => String(img.id) === `${PRODUCT_IMAGE_INITIAL_ID_PREFIX}${slot}`,
      );

    const newImages = currentImages.filter(
      (img) => !img.id || !String(img.id).startsWith(PRODUCT_IMAGE_INITIAL_ID_PREFIX),
    );

    let newImageIndex = 0;
    const slots: Array<{
      slot: number;
      uri: string;
      name: string;
      isNew: boolean;
      isRemovedOld: boolean;
    }> = [];

    for (let slot = 1; slot <= 5; slot += 1) {
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
        newImageIndex += 1;
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
        uri: "",
        name: "",
        isNew: false,
        isRemovedOld: hadImageOnServer,
      });
    }

    return slots;
  };

  // Animation refs
  const iconFadeAnim = useRef(new Animated.Value(0)).current;
  const iconSlideAnim = useRef(new Animated.Value(-30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Debug: Log edit data when categories are loaded
  useEffect(() => {
    if (isEditMode && editProductData && categories.length > 0) {
      console.log("=== EDIT MODE DEBUG ===");
      console.log("Edit Product Data:", editProductData);
      console.log(
        "ProductCategoryIdList:",
        editProductData.ProductCategoryIdList,
      );
      console.log("Available categories:", categories);

      if (
        editProductData.ProductCategoryIdList &&
        Array.isArray(editProductData.ProductCategoryIdList)
      ) {
        const matchedCategories = editProductData.ProductCategoryIdList.map(
          (id) => {
            const foundCategory = categories.find((cat) => cat.value === id);
            console.log(`Looking for category ID "${id}":`, foundCategory);
            return foundCategory;
          },
        ).filter((cat) => cat !== undefined);

        console.log("Matched categories for edit:", matchedCategories);
      }
    }
  }, [isEditMode, editProductData, categories]);

  useEffect(() => {
    console.log("Toast state:", { toastVisible, toastMessage, toastType });
  }, [toastVisible, toastMessage, toastType]);

  useEffect(() => {
    fetchCategories();

    // Animations
    Animated.sequence([
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
      ]),
    ).start();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);

      const response = await fetch(
        `${appConfig.mobileApi}ProductCategory/GetAll?filterActive=true&currentPage=1&pageSize=20`,
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Product Categories API Response:", result);

        const categoriesArray = result.Data || [];

        if (categoriesArray.length > 0) {
          const activeCategories = categoriesArray.filter(
            (category) => category && category.Active === true,
          );

          const categoryOptions = activeCategories.map((category) => ({
            value: category.ProductCategoryId,
            label: category.Name || `دسته ${category.ProductCategoryId}`,
          }));

          console.log("Processed product categories:", categoryOptions);
          setCategories(categoryOptions);
        } else {
          console.log("No product categories received, using fallback");
          setCategories([
            { value: 1, label: "مواد اولیه" },
            { value: 2, label: "لباس زنانه" },
            { value: 3, label: "تست۲" },
          ]);
        }
      } else {
        console.log(
          "Product Categories API failed with status:",
          response.status,
        );
        setCategories([
          { value: 1, label: "مواد اولیه" },
          { value: 2, label: "لباس زنانه" },
          { value: 3, label: "تست۲" },
        ]);
      }
    } catch (error) {
      console.error("Error fetching product categories:", error);
      setCategories([
        { value: 1, label: "مواد اولیه" },
        { value: 2, label: "لباس زنانه" },
        { value: 3, label: "تست۲" },
      ]);
    } finally {
      setLoadingCategories(false);
    }
  };
  // ✅ جایگزین کن:
  const uploadImageWithXHR = async (productId, imageData, imageType) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();

      // فیکس URI برای Android و iOS
      let imageUri = imageData.uri;
      if (Platform.OS === "android" && !imageUri.startsWith("file://")) {
        imageUri = `file://${imageUri}`;
      } else if (Platform.OS === "ios" && imageUri.startsWith("file://")) {
        // برای iOS ممکنه نیاز به حذف file:// باشه
        // اما معمولاً نیازی نیست
      }

      // تعیین نوع فایل
      let fileType = imageData.type || "image/jpeg";
      if (!fileType.startsWith("image/")) {
        const uriParts = imageUri.split(".");
        const fileExtension = uriParts[uriParts.length - 1].toLowerCase();
        fileType = fileExtension === "png" ? "image/png" : "image/jpeg";
      }

      const fileName =
        imageData.fileName ||
        imageData.name ||
        `product_${imageType}_${Date.now()}.jpg`;

      // اضافه کردن فایل به FormData
      formData.append("ProductImageFile", {
        uri: imageUri,
        type: fileType,
        name: fileName,
      });

      const uploadUrl = `${appConfig.mobileApi}Product/AddProductImage?productId=${productId}&type=${imageType}`;

      console.log("📤 XHR Upload starting:", {
        url: uploadUrl,
        imageType,
        fileName,
        fileType,
        uriPreview: imageUri.substring(0, 50) + "...",
      });

      xhr.open("POST", uploadUrl);
      xhr.setRequestHeader("Accept", "application/json");
      xhr.timeout = 60000; // 60 ثانیه

      xhr.onload = () => {
        console.log("📥 XHR Response status:", xhr.status);
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            console.log(
              `✅ XHR Upload successful (type ${imageType}):`,
              result,
            );
            resolve({ success: true, data: result });
          } catch (parseError) {
            console.log(
              `✅ XHR Upload successful (type ${imageType}) - Plain text response`,
            );
            resolve({ success: true, data: { message: "آپلود موفق" } });
          }
        } else {
          console.error(`❌ XHR Upload failed:`, xhr.status, xhr.responseText);
          reject(new Error(`آپلود ناموفق: ${xhr.status}`));
        }
      };

      xhr.onerror = (error) => {
        console.error("❌ XHR Upload error:", error);
        reject(new Error("خطا در ارتباط با سرور"));
      };

      xhr.ontimeout = () => {
        console.error("⏱️ XHR Upload timeout");
        reject(new Error("زمان آپلود تمام شد"));
      };

      console.log("🚀 Sending XHR request...");
      xhr.send(formData);
    });
  };
  // تابع آپلود تک عکس با retry
  const uploadImageWithRetry = async (
    productId,
    imageData,
    imageType,
    maxRetries = 2,
  ) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `Uploading image attempt ${attempt}/${maxRetries}, type: ${imageType}`,
        );
        console.log("Image data:", {
          uri: imageData.uri,
          type: imageData.type,
          fileName: imageData.fileName,
        });

        // ایجاد FormData با تنظیمات صحیح
        const formData = new FormData();

        // در React Native باید به این شکل فایل را append کنیم
        formData.append("ProductImageFile", {
          uri: imageData.uri,
          type: imageData.type || "image/jpeg",
          name:
            imageData.fileName ||
            `product_image_${imageType}_${Date.now()}.jpg`,
        } as any);

        const uploadUrl = `${appConfig.mobileApi}Product/AddProductImage?productId=${productId}&type=${imageType}`;
        console.log("Upload URL:", uploadUrl);
        console.log("FormData keys:", Object.keys(formData));

        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
          body: formData,
        });

        console.log("Upload response status:", response.status);

        if (response.ok) {
          const result = await response.json();
          console.log(`Image upload successful (type ${imageType}):`, result);
          return { success: true, data: result };
        } else {
          const errorText = await response.text();
          console.error(
            `Upload failed (attempt ${attempt}):`,
            response.status,
            errorText,
          );

          if (attempt === maxRetries) {
            throw new Error(`آپلود ناموفق: ${response.status} - ${errorText}`);
          }
        }
      } catch (error) {
        console.error(`Upload attempt ${attempt} failed:`, error);
        console.error("Error details:", {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });

        if (attempt === maxRetries) {
          throw error;
        }

        // کمی صبر کردن قبل از retry
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  };

  const uploadImages = async (productId, featuredImages, slotAssignments) => {
    try {
      const results = [];

      if (
        featuredImages &&
        featuredImages.length > 0 &&
        !isServerImage(featuredImages[0])
      ) {
        console.log("Uploading featured image...");
        showToast("در حال آپلود عکس شاخص...", "info");

        try {
          const featured = featuredImages[0];
          const fileExtension = featured.uri.split('.').pop()?.toLowerCase() || 'jpg';
          const imageData = {
            uri: featured.uri,
            name: featured.name || `featured_${Date.now()}.${fileExtension}`,
            type: fileExtension === 'png' ? 'image/png' : 'image/jpeg',
          };

          let result;
          try {
            result = await uploadImageWithRetry(productId, imageData, 0, 1);
          } catch (fetchError) {
            console.log("Fetch failed, trying XHR method...");
            result = await uploadImageWithXHR(productId, imageData, 0);
          }

          results.push({ type: "featured", success: true, data: result.data });
          showToast("عکس شاخص آپلود شد", "success");
        } catch (error) {
          console.error("Featured image upload failed:", error);
          results.push({
            type: "featured",
            success: false,
            error: error.message,
          });
          showToast("خطا در آپلود عکس شاخص", "error");
        }
      }

      const newAssignments = slotAssignments.filter((assignment) => assignment.isNew);

      if (newAssignments.length > 0) {
        console.log(`Uploading ${newAssignments.length} new product images...`);
      }

      for (let index = 0; index < newAssignments.length; index += 1) {
        const { slot, uri, name } = newAssignments[index];

        try {
          showToast(
            `در حال آپلود عکس ${index + 1} از ${newAssignments.length}...`,
            "info",
          );

          const fileExtension = uri.split('.').pop()?.toLowerCase() || 'jpg';
          const imageData = {
            uri,
            name: name || `product_${slot}_${Date.now()}.${fileExtension}`,
            type: fileExtension === 'png' ? 'image/png' : 'image/jpeg',
          };

          let result;
          try {
            result = await uploadImageWithRetry(productId, imageData, slot, 1);
          } catch (fetchError) {
            console.log(
              `Fetch failed for new product image slot ${slot}, trying XHR method...`,
            );
            result = await uploadImageWithXHR(productId, imageData, slot);
          }

          results.push({
            type: `product_${slot}`,
            success: true,
            data: result.data,
          });
          console.log(`Product image slot ${slot} uploaded successfully`);

          if (index < newAssignments.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`Product image slot ${slot} upload failed:`, error);
          results.push({
            type: `product_${slot}`,
            success: false,
            error: error.message,
          });
        }
      }

      const successfulUploads = results.filter((r) => r.success).length;
      const totalUploads = results.length;

      if (successfulUploads === totalUploads && totalUploads > 0) {
        showToast("همه عکس‌ها با موفقیت آپلود شدند", "success");
      } else if (successfulUploads > 0) {
        showToast(
          `${successfulUploads} از ${totalUploads} عکس آپلود شد`,
          "warning",
        );
      } else if (totalUploads > 0) {
        throw new Error("هیچ عکسی آپلود نشد");
      }

      console.log("Image upload process completed:", results);
      return results;
    } catch (error) {
      console.error("Image upload process failed:", error);
      showToast("خطا در فرآیند آپلود عکس‌ها", "error");
      throw error;
    }
  };

  const submitProduct = async (values, { setErrors, resetForm }) => {
    const currentTime = Date.now();

    if (currentTime - lastSubmitTime < SUBMIT_COOLDOWN) {
      showToast("لطفاً کمی صبر کنید...", "warning");
      return;
    }

    if (isSubmitting || uploadingImages) {
      console.log("Already submitting, ignoring request");
      return;
    }

    setLastSubmitTime(currentTime);
    setIsSubmitting(true);

    try {
      console.log(
        "✅ Starting product submission with validated data:",
        values,
      );

      const userData = await AuthService.getUserData();
      const memberId =
        userData?.MemberGroupList?.[0]?.MemberId || userData?.MemberId;

      const categoryIdList = values.productCategoryIds || [];

      const productData = {
        ProductId: isEditMode ? editProductData.ProductId : 0,
        MemberId: memberId,
        MemberName: userData?.MemberName || "",
        ProductName: values.productName.trim(),
        Description: values.description?.trim() || "",
        Price: parseFloat(values.price) || 0,
        SpecialSalePrice: parseFloat(values.specialPrice) || 0,
        ProductCategories: "",
        ProductCategoryIdList: categoryIdList,
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
        ActiveStr:
          values.active !== undefined
            ? values.active
              ? "فعال"
              : "غیرفعال"
            : "فعال",
        InsertDate: new Date().toISOString(),
      };

      const url = isEditMode
        ? `${appConfig.mobileApi}Product/Edit`
        : `${appConfig.mobileApi}Product/Add`;

      const method = isEditMode ? "PUT" : "POST";

      console.log("Sending product data:", productData);

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Product creation result:", result);

        // استخراج ProductId از پاسخ سرور
        const productId =
          result.ProductId ||
          result.productId ||
          result.Data?.ProductId ||
          productData.ProductId;
        console.log("Extracted Product ID:", productId);

        if (!productId) {
          throw new Error("Product ID not received from server");
        }

        showToast(
          isEditMode ? "محصول با موفقیت ویرایش شد" : "محصول با موفقیت ثبت شد",
          "success",
        );

        // آپلود عکس‌ها فقط وقتی عکس جدید وجود دارد
        const featuredImageNeedsUpload =
          featuredImage &&
          featuredImage.length > 0 &&
          !isServerImage(featuredImage[0]);

        const slotAssignments = computeProductSlotAssignments(
          productImages,
          editProductData,
          isEditMode,
        );
        const productImagesNeedUpload = slotAssignments.some(
          (assignment) => assignment.isNew,
        );

        if (featuredImageNeedsUpload || productImagesNeedUpload) {
          console.log("Starting image upload process...");
          setUploadingImages(true);
          showToast("شروع آپلود عکس‌ها...", "info");

          await new Promise((resolve) => setTimeout(resolve, 1000));

          try {
            await uploadImages(productId, featuredImage, slotAssignments);
          } catch (uploadError) {
            console.error("Error uploading images:", uploadError);
            showToast(
              "خطا در آپلود برخی عکس‌ها: " + uploadError.message,
              "error",
            );
          } finally {
            setUploadingImages(false);
          }
        }

        if (!isEditMode) {
          resetForm();
          setFeaturedImage([]);
          setProductImages([]);
        }

        if (navigation.isFocused()) {
          navigation.navigate("App", {
            screen: "MyProduct",
            params: { screen: "خانه" },
          });
        }
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.Message || `خطا در ${isEditMode ? "ویرایش" : "ثبت"} محصول`,
        );
      }
    } catch (error) {
      console.error("Error submitting product:", error);
      showToast(
        error.message || `خطا در ${isEditMode ? "ویرایش" : "ثبت"} محصول`,
        "error",
      );
    } finally {
      setIsSubmitting(false);
      setUploadingImages(false);
    }
  };

  return (
    <View style={styles.backgroundContainer}>
      <View style={styles.backgroundWrapper}>
        <Image
          source={require("../../assets/backgrounds/background-1.jpg")}
          style={styles.backgroundImage}
        />
      </View>

      <LinearGradient
        colors={[
          "rgba(255,255,255,0.1)",
          "rgba(255,255,255,0.6)",
          "rgba(255,255,255,0.8)",
          "rgba(255,255,255,1)",
        ]}
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
              <Tooltip content="محصول جدید برای فروش اضافه کنید. اطلاعات کامل محصول شامل عنوان، توضیحات، قیمت، موجودی، دسته‌بندی و ویژگی‌ها را وارد کنید. می‌توانید چندین تصویر از محصول آپلود کنید تا خریداران بهتر آن را بشناسند." />
            </View>

            <Animated.View style={[styles.backButton]}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("App", {
                    screen: "MyProduct",
                    params: { screen: "خانه" },
                  })
                }
              >
                <View style={styles.backButtonGlass}>
                  <MaterialIcons name="arrow-forward" size={24} color="white" />
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>

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
                  <MaterialIcons
                    name={isEditMode ? "edit" : "shopping-bag"}
                    color={colors.white}
                    size={50}
                  />
                </View>
                <View style={styles.iconRing} />
              </LinearGradient>
            </Animated.View>

            <View style={[styles.formBox]}>
              <View style={styles.glassOverlay} pointerEvents="none" />

              <View style={styles.contentContainer}>
                <AppText style={styles.titleText}>
                  {isEditMode ? "ویرایش محصول" : "افزودن محصول جدید"}
                </AppText>

                <Formik
                  initialValues={{
                    productName: isEditMode
                      ? editProductData?.ProductName || ""
                      : "",
                    description: isEditMode
                      ? editProductData?.Description || ""
                      : "",
                    price: isEditMode
                      ? editProductData?.Price?.toString() || ""
                      : "",
                    specialPrice: isEditMode
                      ? editProductData?.SpecialSalePrice?.toString() || ""
                      : "",
                    productCategoryIds: isEditMode
                      ? editProductData?.ProductCategories
                        ? editProductData.ProductCategories.split("،")
                            .map((categoryName) => {
                              const trimmedName = categoryName.trim();
                              const foundCategory = categories.find(
                                (cat) => cat.label === trimmedName,
                              );
                              console.log(
                                `Looking for product category "${trimmedName}":`,
                                foundCategory,
                              );
                              return foundCategory ? foundCategory.value : null;
                            })
                            .filter((id) => id !== null)
                        : []
                      : [],
                    active: isEditMode
                      ? editProductData?.Active !== undefined
                        ? editProductData.Active
                        : true
                      : true,
                    featuredImage: [],
                    productImages: [],
                  }}
                  onSubmit={submitProduct}
                  enableReinitialize={true}
                >
                  {({
                    handleChange,
                    handleSubmit,
                    errors,
                    values,
                    setFieldValue,
                    resetForm,
                    setErrors,
                  }) => (
                    <>
                      <View>
                        <AppTextInput
                          label="نام محصول"
                          autoCapitalize="none"
                          autoCorrect={false}
                          icon="shopping-bag"
                          keyboardType="default"
                          placeholder="نام محصول"
                          onChangeText={handleChange("productName")}
                          value={values.productName}
                          error={errors.productName}
                          style={{
                            borderColor: errors.productName
                              ? "#e74c3c"
                              : undefined,
                          }}
                        />

                        <AppTextInput
                          label="توضیحات محصول"
                          autoCapitalize="none"
                          autoCorrect={false}
                          icon="description"
                          keyboardType="default"
                          placeholder="توضیحات محصول"
                          onChangeText={handleChange("description")}
                          value={values.description}
                          multiline={true}
                          numberOfLines={4}
                          style={{ height: 100, textAlignVertical: "top" }}
                        />

                        <AppTextInput
                          label="قیمت (تومان)"
                          autoCapitalize="none"
                          autoCorrect={false}
                          icon="attach-money"
                          keyboardType="numeric"
                          placeholder="قیمت (تومان)"
                          onChangeText={(text) => {
                            const cleanNumberString = text.replace(
                              /[^0-9]/g,
                              "",
                            );
                            setFieldValue(
                              "price",
                              cleanNumberString
                                ? Number(cleanNumberString)
                                : "",
                            );
                          }}
                          value={
                            values.price
                              ? values.price
                                  .toString()
                                  .replace(/[^0-9]/g, "")
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                              : ""
                          }
                          error={errors.price}
                          style={{
                            borderColor: errors.price ? "#e74c3c" : undefined,
                          }}
                        />

                        <AppTextInput
                          label="قیمت ویژه (تومان)"
                          autoCapitalize="none"
                          autoCorrect={false}
                          icon="local-offer"
                          keyboardType="numeric"
                          placeholder="قیمت ویژه (تومان)"
                          onChangeText={(text) => {
                            const cleanNumberString = text.replace(
                              /[^0-9]/g,
                              "",
                            );
                            setFieldValue(
                              "specialPrice",
                              cleanNumberString
                                ? Number(cleanNumberString)
                                : "",
                            );
                          }}
                          value={
                            values.specialPrice
                              ? values.specialPrice
                                  .toString()
                                  .replace(/[^0-9]/g, "")
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                              : ""
                          }
                          error={errors.specialPrice}
                          style={{
                            borderColor: errors.specialPrice
                              ? "#e74c3c"
                              : undefined,
                          }}
                        />

                        <View>
                          <Text style={[styles.inputLabel]}>دسته بندی</Text>
                          <AppPicker
                            items={categories}
                            onSelectItem={(item) => {
                              // این callback دیگر استفاده نمی‌شود در حالت multi-select
                            }}
                            onMultiSelectChange={(selectedItems) => {
                              const selectedIds = selectedItems
                                ? selectedItems.map((item) => item.value)
                                : [];
                              console.log(
                                "Selected product categories:",
                                selectedIds,
                              );
                              console.log(
                                "Selected category objects:",
                                selectedItems,
                              );
                              setFieldValue("productCategoryIds", selectedIds);
                            }}
                            selectedItems={
                              values.productCategoryIds &&
                              Array.isArray(values.productCategoryIds)
                                ? values.productCategoryIds
                                    .filter(
                                      (id) =>
                                        id !== null &&
                                        id !== undefined &&
                                        id !== 0,
                                    )
                                    .map((id) => {
                                      const category = categories.find(
                                        (cat) => cat.value === id,
                                      );
                                      console.log(
                                        `Finding category for ID ${id}:`,
                                        category,
                                      );
                                      return category || null;
                                    })
                                    .filter((item) => item !== null)
                                : []
                            }
                            icon="category"
                            placeholder={
                              loadingCategories
                                ? "در حال بارگذاری..."
                                : !values.productCategoryIds ||
                                    values.productCategoryIds.length === 0
                                  ? "انتخاب دسته‌بندی محصول"
                                  : `${values.productCategoryIds.length} دسته انتخاب شده`
                            }
                            disabled={loadingCategories}
                            multiSelect={true}
                          />
                        </View>

                        <View style={styles.spacer} />

                        <View>
                          <Text style={[styles.inputLabel]}>وضعیت محصول</Text>
                          <AppPicker
                            items={[
                              { value: true, label: "فعال" },
                              { value: false, label: "غیرفعال" },
                            ]}
                            onSelectItem={(item) =>
                              setFieldValue("active", item?.value)
                            }
                            selectedItem={
                              values.active !== null &&
                              values.active !== undefined
                                ? {
                                    value: values.active,
                                    label: values.active ? "فعال" : "غیرفعال",
                                  }
                                : null
                            }
                            icon="inventory"
                            placeholder="وضعیت محصول"
                            style={styles.halfWidthPicker}
                          />
                        </View>
                      </View>

                      <View style={styles.imageUploadSection}>
                        <ImageUpload
                          onImageChange={(images) => {
                            let imageArray = [];

                            if (images) {
                              if (Array.isArray(images)) {
                                imageArray = images.filter(
                                  (img) => img && img.uri,
                                );
                              } else if (images.uri) {
                                imageArray = [images];
                              }
                            }

                            if (
                              isEditMode &&
                              editProductData?.ProductId &&
                              originalFeaturedImageId
                            ) {
                              const stillExists = imageArray.some(
                                (img) => String(img.id) === originalFeaturedImageId,
                              );

                              if (!stillExists) {
                                deleteProductImage(
                                  editProductData.ProductId,
                                  0,
                                );
                              }
                            }

                            setFeaturedImage(imageArray);
                            setFieldValue("featuredImage", imageArray);
                          }}
                          initialImage={
                            featuredImage && featuredImage.length > 0
                              ? featuredImage[0]
                              : null
                          }
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
                            let imageArray = [];

                            if (images && Array.isArray(images)) {
                              imageArray = images.filter(
                                (img) => img && img.uri,
                              );
                            } else if (images && (images as any).uri) {
                              imageArray = [images];
                            }

                            if (
                              isEditMode &&
                              editProductData?.ProductId &&
                              productImages.length > 0
                            ) {
                              const removedSlots = getRemovedServerImageSlots(
                                productImages,
                                imageArray,
                              );

                              removedSlots.forEach((type) => {
                                if (type !== null) {
                                  deleteProductImage(editProductData.ProductId, type);
                                }
                              });
                            }

                            setProductImages(imageArray);
                            setFieldValue("productImages", imageArray);
                          }}
                          initialImages={
                            productImages && productImages.length > 0
                              ? productImages
                              : []
                          }
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
                              ? isEditMode
                                ? "در حال ویرایش..."
                                : "در حال ثبت..."
                              : uploadingImages
                                ? "در حال آپلود عکس‌ها..."
                                : isEditMode
                                  ? "ویرایش محصول"
                                  : "ثبت محصول"
                          }
                          onPress={() => {
                            console.log("🔴 Submit button pressed");
                            console.log("🔴 Current form values:", values);

                            // validation مستقیم
                            const validationErrors = {};
                            let firstErrorMessage = null;

                            // بررسی نام محصول
                            if (
                              !values.productName ||
                              !values.productName.trim()
                            ) {
                              console.log("❌ Product name validation failed");
                              validationErrors.productName =
                                "نام محصول الزامی است";
                              firstErrorMessage = "نام محصول الزامی است";
                            }

                            // بررسی قیمت ویژه
                            if (values.specialPrice && values.price) {
                              const price = parseFloat(values.price);
                              const specialPrice = parseFloat(
                                values.specialPrice,
                              );

                              if (
                                !isNaN(specialPrice) &&
                                !isNaN(price) &&
                                specialPrice >= price
                              ) {
                                console.log(
                                  "❌ Special price validation failed",
                                );
                                validationErrors.specialPrice =
                                  "قیمت ویژه باید کمتر از قیمت اصلی باشد";
                                if (!firstErrorMessage) {
                                  firstErrorMessage =
                                    "قیمت ویژه باید کمتر از قیمت اصلی باشد";
                                }
                              }
                            }

                            // بررسی دسته‌بندی
                            if (
                              !values.productCategoryIds ||
                              !Array.isArray(values.productCategoryIds) ||
                              values.productCategoryIds.length === 0
                            ) {
                              console.log("❌ Category validation failed");
                              validationErrors.productCategoryIds =
                                "حداقل یک دسته‌بندی الزامی است";
                              if (!firstErrorMessage) {
                                firstErrorMessage =
                                  "حداقل یک دسته‌بندی الزامی است";
                              }
                            }

                            // اگر خطا وجود دارد
                            if (firstErrorMessage) {
                              console.log(
                                "🚨 Showing validation error:",
                                firstErrorMessage,
                              );
                              showToast(firstErrorMessage, "error");
                              setErrors(validationErrors);
                              return;
                            }

                            // اگر validation پاس شد، ادامه submit
                            console.log(
                              "✅ Validation passed, calling submitProduct",
                            );
                            submitProduct(values, { setErrors, resetForm });
                          }}
                          color={isEditMode ? colors.info : colors.success}
                          disabled={isSubmitting || uploadingImages}
                          style={[
                            styles.submitButton,
                            (isSubmitting || uploadingImages) &&
                              styles.disabledButton,
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

  inputLabel: {
    fontSize: 15,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
    color: colors.dark,
    marginBottom: 8,
    textAlign: "right",
  },
  backgroundWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerButtons: {
    position: "absolute",
    // top: 15,
    left: 15,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerLeft: {
    top: 15,
  },

  backButton: {
    zIndex: 10,
  },

  backButtonGlass: {
    backgroundColor: "#9E22AD",
    borderRadius: 25,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 206, 232, 0.5)",
  },

  backgroundImage: {
    width: "100%",
    height: "100%",
    resizeMode: "repeat",
  },
  gradientOverlay: {
    flex: 1,
  },
  container: {
    padding: 10,
    backgroundColor: "transparent",
  },
  backButton: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 10,
  },
  backButtonGlass: {
    backgroundColor: "#9E22AD",
    borderRadius: 25,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 206, 232, 0.5)",
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
    shadowColor: "rgba(255, 206, 232, 0.2)",
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
    backgroundColor: "rgba(255, 206, 232, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 206, 232, 0.4)",
    zIndex: 99,
  },
  iconRing: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: "rgba(255, 206, 232, 0.3)",
    borderStyle: "dashed",
  },
  formBox: {
    borderRadius: 25,
    padding: 25,
    margin: 5,
    marginTop: 65,
    marginBottom: 20,
    position: "relative",
    overflow: "hidden",
  },
  glassOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 206, 232, 0.7)",
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: "rgba(255, 206, 232, 1)",
    shadowColor: "rgba(255, 255, 255, 1)",
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
    position: "relative",
    zIndex: 1,
  },
  titleText: {
    fontSize: 30,
    marginTop: 35,
    textAlign: "center",
    marginBottom: 30,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.primary,
    textShadowColor: "rgba(255, 206, 232, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  imageUploadSection: {
    marginTop: 25,
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
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
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 206, 232, 0.2)",
  },
  imageHint: {
    fontSize: 12,
    color: colors.medium,
    textAlign: "center",
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
    color: "#e74c3c",
    fontSize: 12,
    marginTop: 5,
    marginBottom: 10,
    textAlign: "right",
    fontFamily: "Yekan_Bakh_Regular",
  },
});

export default AddProductScreen;
