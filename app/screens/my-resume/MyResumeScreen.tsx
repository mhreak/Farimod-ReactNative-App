import React, { useEffect, useRef, useState } from "react";
import AppText from "../../components/Text";
import Toast from "../../components/Toast";
import {
  ScrollView,
  StyleSheet,
  View,
  Image,
  Dimensions,
  Animated,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  Platform,
  Linking
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../../config/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import MainBackground from "../../components/MainBackground";
import * as DocumentPicker from 'expo-document-picker';
import appConfig from "../../config/config";
import { usePostApi, useDeleteApi } from "../../config/useApi";
import { useAuth } from '../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { modernColors,styles,documentColors } from "./styles/styles";
import { SkeletonCard } from "./ui/SkeletonCard";


const MyResumeScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const { deleteData, loading: deleteLoading, error: deleteError } = useDeleteApi();
  const insets = useSafeAreaInsets();

  const [deleteSlideAnim] = useState(new Animated.Value(300));
  const [deleteOpacityAnim] = useState(new Animated.Value(0));

  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState('');
  const [error, setError] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'info'
  });

  const [personalData, setPersonalData] = useState({
    name: user?.MemberName || "کاربر",
    title: "طراح پارچه و لباس",
    bio: "من فاطمه هستم، طراح پارچه و لباس با نگاهی نو به ترکیب سنت و مدرنیته. علاقه‌مند به خلق طراحی‌هایی که هویت ایرانی را با جهانی‌بودن ترکیب کند.",
  });

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  const fetchDocumentTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Fetching all document types...');

      const typesResponse = await fetch(`${appConfig.mobileApi}MemberDocumentType/GetAll?filterActive=true&currentPage=1&pageSize=50`);
      console.log('📥 Document types response status:', typesResponse.status);

      if (!typesResponse.ok) {
        throw new Error(`HTTP error! status: ${typesResponse.status}`);
      }

      const typesResult = await typesResponse.json();
      console.log('📋 Document types result:', typesResult);

      if (typesResult.Data && Array.isArray(typesResult.Data) && typesResult.Data.length > 0) {
        console.log('✅ Document types loaded:', typesResult.Data.length);
        setDocumentTypes(typesResult.Data);

        await fetchExistingDocuments();
      } else {
        console.log('⚠️ No document types found');
        setDocumentTypes([]);
      }
    } catch (error) {
      console.error('❌ Error fetching document types:', error);
      setError(error.message);
      setDocumentTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingDocuments = async () => {
    try {
      console.log('🔍 Fetching existing documents for memberId:', user?.MemberId);

      const documentsResponse = await fetch(`${appConfig.mobileApi}MemberDocument/GetAllByMemberId?memberId=${user?.MemberId}`);
      console.log('📥 Documents response status:', documentsResponse.status);

      if (!documentsResponse.ok) {
        throw new Error(`HTTP error! status: ${documentsResponse.status}`);
      }

      const documentsResult = await documentsResponse.json();
      console.log('📋 Existing documents result:', documentsResult);

      if (documentsResult.Data && Array.isArray(documentsResult.Data) && documentsResult.Data.length > 0) {
        const organizedFiles = {};
        documentsResult.Data.forEach(doc => {
          const typeId = doc.MemberDocumentTypeId;
          if (!organizedFiles[typeId]) {
            organizedFiles[typeId] = [];
          }

          organizedFiles[typeId].push({
            memberDocumentId: doc.MemberDocumentId,
            name: doc.MemberDocumentFileName || 'فایل بدون نام',
            size: null,
            uri: doc.FileURL ? `${doc.FileURL}` : '',
            uploadDate: doc.InsertDate,
            documentTypeName: doc.MemberDocumentTypeName,
          });
        });

        console.log('✅ Organized files:', organizedFiles);
        setUploadedFiles(organizedFiles);
      } else {
        console.log('⚠️ No existing documents found');
        setUploadedFiles({});
      }
    } catch (error) {
      console.error('❌ Error fetching existing documents:', error);
      setUploadedFiles({});
    }
  };

  const openFileUrl = async (url) => {
    try {
      console.log('🔗 Opening URL:', url);
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        showToast('امکان باز کردن این فایل وجود ندارد', 'error');
      }
    } catch (error) {
      console.error('❌ Error opening URL:', error);
      showToast('مشکلی در باز کردن فایل پیش آمد', 'error');
    }
  };

  const pickDocument = async (documentTypeId) => {
    console.log('🚀 Starting pickDocument for documentTypeId:', documentTypeId);

    try {
      setIsUploading(documentTypeId.toString());

      console.log('📁 Opening document picker...');
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: true,
      });

      console.log('📋 Document picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const files = result.assets;
        const documentType = documentTypes.find(doc => doc.MemberDocumentTypeId === documentTypeId);

        console.log('📝 Selected files:', files);
        console.log('🗂️ Document type:', documentType);

        let successCount = 0;
        let totalFiles = files.length;

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          console.log(`\n📄 Processing file ${i + 1}/${totalFiles}:`, {
            name: file.name,
            size: file.size,
            uri: file.uri,
            mimeType: file.mimeType,
          });

          try {
            console.log('📁 Creating FormData for file upload...');
            const formData = new FormData();

            const fileObj = {
              uri: file.uri,
              type: file.mimeType || 'application/octet-stream',
              name: file.name,
            };
            formData.append('file', fileObj);

            formData.append('MemberDocumentId', '0');
            formData.append('MemberId', user?.MemberId.toString());
            formData.append('MemberName', personalData.name);
            formData.append('MemberDocumentTypeId', documentTypeId.toString());
            formData.append('MemberDocumentTypeName', documentType.Name);
            formData.append('InsertDate', new Date().toISOString());
            formData.append('ShamsiInsertDate', new Date().toLocaleDateString('fa-IR'));
            formData.append('MemberDocumentFileName', '');
            formData.append('FileURL', '');

            const addUrl = `${appConfig.mobileApi}MemberDocument/Add`;
            console.log('🔗 Add URL:', addUrl);

            console.log('📤 Starting file upload with Add API...');
            const uploadResponse = await fetch(addUrl, {
              method: 'POST',
              headers: {
                'accept': '*/*',
              },
              body: formData,
            });

            console.log('📥 Upload response status:', uploadResponse.status);

            if (!uploadResponse.ok) {
              const errorText = await uploadResponse.text();
              console.error('❌ Upload failed with response:', errorText);
              throw new Error(`Failed to upload file: ${uploadResponse.status} - ${errorText}`);
            }

            const uploadResult = await uploadResponse.json();
            console.log('✅ Upload successful, response:', uploadResult);

            successCount++;
            console.log(`✅ File ${i + 1} uploaded successfully`);

          } catch (fileError) {
            console.error(`❌ Error uploading file ${file.name}:`, fileError);
            showToast(`مشکلی در اپلود فایل ${file.name} پیش آمد`, 'error');
          }
        }

        console.log(`🎉 Upload process completed. Success: ${successCount}/${totalFiles}`);
        if (successCount > 0) {
          showToast(`یک فایل به بخش ${documentType.Name} اپلود شد`, 'success');
          await fetchExistingDocuments();
        }

      } else if (result.canceled) {
        console.log('ℹ️ User cancelled file picker');
      } else {
        console.log('❌ No files selected or unknown picker result structure');
      }
    } catch (error) {
      console.error('❌ Error in pickDocument:', error);
      showToast('مشکلی در انتخاب فایل پیش آمد', 'error');
    } finally {
      setIsUploading('');
      console.log('🏁 pickDocument process finished');
    }
  };

  const removeFile = (documentTypeId, index) => {
    const documentType = documentTypes.find(doc => doc.MemberDocumentTypeId === documentTypeId);
    const file = uploadedFiles[documentTypeId][index];

    setFileToDelete({ documentTypeId, index, file, documentType });
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;

    const { documentTypeId, index, file } = fileToDelete;

    try {
      console.log('🗑️ Deleting file with ID:', file.memberDocumentId);

      if (file.memberDocumentId) {
        const deleteUrl = `${appConfig.mobileApi}MemberDocument/Delete?memberDocumentId=${file.memberDocumentId}`;
        console.log('🔗 Delete URL:', deleteUrl);

        const deleteResponse = await fetch(deleteUrl, {
          method: 'DELETE',
          headers: {
            'accept': '*/*',
          },
        });

        if (!deleteResponse.ok) {
          throw new Error(`Delete failed: ${deleteResponse.status}`);
        }

        const result = await deleteResponse.json();
        console.log('✅ File deleted from server:', result);
      }

      setUploadedFiles(prev => ({
        ...prev,
        [documentTypeId]: (prev[documentTypeId] || []).filter((_, i) => i !== index)
      }));

      setDeleteModalVisible(false);
      showToast('فایل با موفقیت حذف شد', 'success');

      await fetchExistingDocuments();

    } catch (error) {
      console.error('❌ Error deleting file:', error);
      setDeleteModalVisible(false);
      showToast('مشکلی در حذف فایل از سرور پیش آمد', 'error');
    } finally {
      setFileToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setFileToDelete(null);
  };

  useEffect(() => {
    if (deleteModalVisible) {
      Animated.parallel([
        Animated.spring(deleteSlideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(deleteOpacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(deleteSlideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(deleteOpacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [deleteModalVisible]);

  useEffect(() => {
    if (user?.MemberId) {
      fetchDocumentTypes();
    }
  }, [user?.MemberId]);

  const getColorForIndex = (index) => {
    return documentColors[index % documentColors.length];
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'picture-as-pdf';
      case 'doc':
      case 'docx':
        return 'description';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image';
      case 'mp4':
      case 'avi':
      case 'mov':
        return 'videocam';
      default:
        return 'insert-drive-file';
    }
  };

  const FileUploadCard = ({ documentType, index }:any) => {
    const color = getColorForIndex(index);
    const files = uploadedFiles[documentType.MemberDocumentTypeId] || [];
    const isCurrentlyUploading = isUploading === documentType.MemberDocumentTypeId.toString();

    return (
      <View style={styles.detailItem}>
        <View style={[styles.labelContainer, { justifyContent: 'space-between' }]}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', flex: 1 }}>
            <View
       
              style={styles.iconWrapper}
            >
              <MaterialIcons
                name="description"
                size={22}
                color={modernColors.surface}
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppText style={styles.label}>{documentType.Name}</AppText>
              {documentType.ShortDescription && (
                <AppText style={styles.categoryDescription}>{documentType.ShortDescription}</AppText>
              )}
            </View>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <TouchableOpacity
            style={[styles.uploadButton, isCurrentlyUploading && styles.uploadButtonDisabled]}
            onPress={() => pickDocument(documentType.MemberDocumentTypeId)}
            disabled={isCurrentlyUploading}
          >
            <View
          style={[styles.uploadButtonGradient, { backgroundColor: color }]}
            >
              <MaterialIcons
                name={isCurrentlyUploading ? "timer" : "add"}
                size={24}
                color={modernColors.surface}
              />
              <AppText style={styles.uploadButtonText}>
                {isCurrentlyUploading ? 'در حال اپلود...' : 'انتخاب فایل'}
              </AppText>
            </View>
          </TouchableOpacity>

          {files.length > 0 && (
            <View style={styles.filesContainer}>
              <View style={styles.filesTitleContainer}>
                <MaterialIcons
                  name="check-circle"
                  size={18}
                  color={color}
                  style={styles.filesTitleIcon}
                />
                <AppText style={styles.filesTitle}>
                  فایل های آپلود شده
                </AppText>
              </View>
              <View style={styles.filesGrid}>
                {files.map((file, fileIndex) => (
                  <TouchableOpacity
                    key={fileIndex}
                    style={[styles.fileCard, { borderColor: color + '30' }]}
                    onPress={() => openFileUrl(file.uri)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={[color + '15', color + '05']}
                      style={styles.fileCardGradient}
                    >
                      <View style={[styles.fileIconContainer, { backgroundColor: color + '20' }]}>
                        <MaterialIcons
                          name={getFileIcon(file.name)}
                          size={28}
                          color={color}
                        />
                      </View>

                      <View style={styles.fileActions}>
                        <TouchableOpacity
                          style={[styles.viewButton, { backgroundColor: color + '20' }]}
                          onPress={(e) => {
                            e.stopPropagation();
                            openFileUrl(file.uri);
                          }}
                        >
                          <MaterialIcons
                            name="visibility"
                            size={16}
                            color={color}
                          />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            removeFile(documentType.MemberDocumentTypeId, fileIndex);
                          }}
                          disabled={deleteLoading}
                        >
                          <MaterialIcons
                            name={deleteLoading ? "hourglass_empty" : "delete-outline"}
                            size={16}
                            color="#ef4444"
                          />
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {files.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialIcons
                name="description"
                size={48}
                color={color + '30'}
              />
              <AppText style={styles.emptyStateText}>
                هنوز فایلی در این بخش اپلود نشده
              </AppText>
              <AppText style={styles.emptyStateSubtext}>
                فایل‌های {documentType.Name} را اینجا اپلود کنید
              </AppText>
            </View>
          )}
        </View>
        <View style={[styles.featureAccent, { backgroundColor: color + "60" }]} />
      </View>
    );
  };


  if (!loading && error) {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View style={styles.container}>
          <MainBackground />

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("App", { screen: "MainTabs", params: { screen: "خانه" } })}
          >
            <View style={styles.backButtonContainer}>
              <MaterialIcons
                name="arrow-forward"
                size={24}
                color="#6366f1"
              />
            </View>
          </TouchableOpacity>

          <View style={styles.errorContainer}>
            <MaterialIcons name="error" size={80} color="#9e9e9e" />
            <AppText style={styles.errorTitle}>خطا در دریافت اطلاعات</AppText>
            <AppText style={styles.errorSubtitle}>
              لطفاً اتصال اینترنت خود را بررسی کنید
            </AppText>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => fetchDocumentTypes()}
            >
              <MaterialIcons name="refresh" size={20} color={modernColors.surface} />
              <AppText style={styles.retryButtonText}>تلاش مجدد</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

  if (!loading && !error && documentTypes.length === 0) {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View style={styles.container}>
          <MainBackground />

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => (navigation as any).navigate("App", { screen: "MainTabs", params: { screen: "خانه" } })}
          >
            <View style={styles.backButtonContainer}>
              <MaterialIcons
                name="arrow-forward"
                size={24}
                color="#6366f1"
              />
            </View>
          </TouchableOpacity>

          <View style={styles.errorContainer}>
            <MaterialIcons name="folder" size={80} color="#9e9e9e" />
            <AppText style={styles.errorTitle}>هیچ نوع مدرکی یافت نشد</AppText>
            <AppText style={styles.errorSubtitle}>
              در حال حاضر هیچ دسته‌ای برای آپلود مدارک تعریف نشده است
            </AppText>
          </View>
        </View>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View style={styles.container}>
          <MainBackground />

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate("App", { screen: "MainTabs", params: { screen: "خانه" } })}
            >
              <View style={styles.backButtonContainer}>
                <MaterialIcons
                  name="arrow-forward"
                  size={24}
                  color="#6366f1"
                />
              </View>
            </TouchableOpacity>

            <View style={styles.profileHeaderContainer}>
            </View>

            <View style={styles.sectionTitleContainer}>
              <AppText style={styles.sectionTitle}>فایل ها و مدارک</AppText>
              {/* <View style={styles.sparkleContainer}>
                <MaterialIcons
                  name="star"
                  size={16}
                  color="#FFD700"
                  style={styles.sparkle1}
                />
                <MaterialIcons
                  name="auto-awesome"
                  size={12}
                  color="#FF69B4"
                  style={styles.sparkle2}
                />
              </View> */}
            </View>

            <View style={styles.cardsContainer}>
              {[1, 2, 3].map((index) => (
                <SkeletonCard key={index} />
              ))}
            </View>

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        <MainBackground />

        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={hideToast}
        />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
         

          <View style={styles.profileHeaderContainer}>
          </View>

          <View style={styles.sectionTitleContainer}>
             <TouchableOpacity
            style={styles.backButton}
            onPress={() => (navigation as any).navigate("App", { screen: "MainTabs", params: { screen: "پروفایل" } })}
          >
            <View style={styles.backButtonContainer}>
              <MaterialIcons
                name="arrow-forward"
                size={24}
                color="#6366f1"
              />
            </View>
          </TouchableOpacity>
            <AppText style={styles.sectionTitle}>فایل ها و مدارک</AppText>
            {/* <View style={styles.sparkleContainer}>
              <MaterialIcons
                name="star"
                size={16}
                color="#FFD700"
                style={styles.sparkle1}
              />
              <MaterialIcons
                name="auto-awesome"
                size={12}
                color="#FF69B4"
                style={styles.sparkle2}
              />
            </View> */}
          </View>

          <View style={styles.cardsContainer}>
            {documentTypes.map((documentType, index) => (
              <FileUploadCard
                key={documentType.MemberDocumentTypeId}
                documentType={documentType}
                index={index}
              />
            ))}
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Delete Confirmation Modal */}
        <Modal
          visible={deleteModalVisible}
          transparent={true}
          animationType="none"
          onRequestClose={cancelDelete}
        >
          <Pressable style={styles.deleteModalOverlay} onPress={cancelDelete}>
            <Animated.View
              style={[
                styles.deleteModalContent,
                {
                  transform: [{ translateY: deleteSlideAnim }],
                  opacity: deleteOpacityAnim,
                  marginBottom: Math.max(insets.bottom, 20),
                }
              ]}
            >
              {/* Icon */}
              <View style={styles.deleteIconContainer}>
                <MaterialIcons name="warning" size={48} color="#EF4444" />
              </View>

              {/* Title */}
              <AppText style={styles.deleteTitle}>حذف فایل</AppText>

              {/* Message */}
              <AppText style={styles.deleteMessage}>
                آیا مطمئن هستید که می‌خواهید این فایل را از بخش {fileToDelete?.documentType?.Name} حذف کنید؟
              </AppText>

              {/* Buttons */}
              <View style={styles.deleteButtonsContainer}>
                <TouchableOpacity
                  style={[styles.deleteButton, styles.cancelDeleteButton]}
                  onPress={cancelDelete}
                >
                  <AppText style={styles.cancelDeleteText}>خیر</AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.deleteButton, styles.confirmDeleteButton]}
                  onPress={confirmDelete}
                >
                  <AppText style={styles.confirmDeleteText}>بله، حذف کن</AppText>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Pressable>
        </Modal>
      </View>
    </>
  );
};


export default MyResumeScreen;