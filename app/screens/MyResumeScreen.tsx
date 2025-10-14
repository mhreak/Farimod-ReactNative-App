import React, { useEffect, useRef, useState } from "react";
import AppText from "../components/Text";
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
  Alert,
  Platform
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../config/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import MainBackground from "../components/MainBackground";
import * as DocumentPicker from 'expo-document-picker';
import appConfig from "../config/config";
import { usePostApi, useDeleteApi } from "../config/useApi";
import { useAuth } from '../contexts/AuthContext';


const { width, height } = Dimensions.get('window');

const modernColors = {
  ...colors,
  primary: "#6366f1",
  primaryDark: "#4f46e5",
  primaryLight: "#e0e7ff",
  secondary: "#8b5cf6",
  tertiary: "#06b6d4",
  accent: "#10b981",
  surface: "#ffffff",
  dark: "#2c3e50",
  medium: "#34495e",
  light: "#ecf0f1",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#06b6d4",
  gradientStart: "#6366f1",
  gradientEnd: "#8b5cf6",
  fashionIcon: "#8b5cf6",
  skillIcon: "#10b981",
  experienceIcon: "#f59e0b",
  educationIcon: "#8b5cf6",
  contactIcon: "#06b6d4",
  hobbyIcon: "#ef4444",
  goalIcon: "#6366f1",
  uploadIcon: "#06b6d4",
  resumeIcon: "#8b5cf6",
  portfolioIcon: "#10b981",
  certificateIcon: "#f59e0b",
  projectIcon: "#ef4444",
  otherIcon: "#6366f1",
};

const documentColors = [
  "#6366f1", // Primary Blue
  "#8b5cf6", // Purple
  "#10b981", // Green
  "#f59e0b", // Orange
  "#ef4444", // Red
  "#06b6d4", // Cyan
];

const MyResumeScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const { postData, loading: postLoading, error: postError } = usePostApi();
  const { deleteData, loading: deleteLoading, error: deleteError } = useDeleteApi();
    // const isOwnContent = contentData.MemberId === user?.MemberId;


  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState('');
  const [error, setError] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState({});

  const [personalData, setPersonalData] = useState({
    name: "فاطمه رضایی",
    title: "طراح پارچه و لباس",
    bio: "من فاطمه هستم، طراح پارچه و لباس با نگاهی نو به ترکیب سنت و مدرنیته. علاقه‌مند به خلق طراحی‌هایی که هویت ایرانی را با جهانی‌بودن ترکیب کند.",
  });

  const fetchDocumentTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      // const memberId = 1; // Changed to 1 as requested
      console.log('🔍 Fetching document types for memberId:',  user?.MemberId);

      const response = await fetch(`${appConfig.mobileApi}MemberDocumentType/GetAllByMemberId?memberId=${user?.MemberId}`);
      console.log('📥 Document types response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📋 Document types result:', result);

      if (result.Data && Array.isArray(result.Data) && result.Data.length > 0) {
        const uniqueTypes = result.Data.filter((item, index, self) =>
          index === self.findIndex(t => t.MemberDocumentTypeId === item.MemberDocumentTypeId)
        );
        console.log('✅ Unique document types:', uniqueTypes);
        setDocumentTypes(uniqueTypes);
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

  // Test function to check FormData creation
  const testFormDataCreation = (file) => {
    console.log('🧪 Testing FormData creation for file:', file);

    try {
      const formData = new FormData();

      // Test different approaches
      const approaches = [
        // Approach 1: Basic object
        {
          name: 'Basic Object',
          data: {
            uri: file.uri,
            type: file.mimeType || 'application/pdf',
            name: file.name,
          }
        },
        // Approach 2: Platform specific
        {
          name: 'Platform Specific',
          data: Platform.OS === 'ios' ? {
            uri: file.uri,
            type: file.mimeType || 'application/pdf',
            name: file.name,
          } : {
            uri: file.uri,
            type: file.mimeType || 'application/pdf',
            name: file.name,
          }
        }
      ];

      approaches.forEach((approach, index) => {
        try {
          const testFormData = new FormData();
          testFormData.append('memberDocumentFile', approach.data);
          console.log(`✅ ${approach.name} approach works:`, approach.data);
        } catch (err) {
          console.error(`❌ ${approach.name} approach failed:`, err);
        }
      });

    } catch (error) {
      console.error('❌ FormData test failed:', error);
    }
  };

  // Enhanced pickDocument function with proper API integration and detailed logging
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

      // Fix: Check for new DocumentPicker structure
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const files = result.assets; // Use assets array instead
        const documentType = documentTypes.find(doc => doc.MemberDocumentTypeId === documentTypeId);

        console.log('📝 Selected files:', files);
        console.log('🗂️ Document type:', documentType);

        let successCount = 0;
        let totalFiles = files.length;

        // Process each file
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          console.log(`\n📄 Processing file ${i + 1}/${totalFiles}:`, {
            name: file.name,
            size: file.size,
            uri: file.uri,
            mimeType: file.mimeType,
            type: file.type
          });

          try {
            // Step 1: Add document record via API
            const addDocumentPayload = {
              MemberDocumentId: 0,
              Title: file.name,
              MemberId: user?.MemberId,
              MemberName: personalData.name,
              MemberDocumentTypeId: documentTypeId,
              MemberDocumentTypeName: documentType.Name,
              InsertDate: new Date().toISOString(),
              ShamsiInsertDate: new Date().toLocaleDateString('fa-IR'),
              MemberDocumentFileName: file.name
            };

            console.log('📤 Sending add document request with payload:', addDocumentPayload);
            const addDocumentResult = await postData('MemberDocument/Add', addDocumentPayload);
            console.log('✅ Add document response:', addDocumentResult);

            // Check if the API returned a document ID
            const memberDocumentId = addDocumentResult.Data?.MemberDocumentId || addDocumentResult.MemberDocumentId;
            console.log('🆔 Extracted memberDocumentId:', memberDocumentId);

            if (!memberDocumentId) {
              throw new Error('No document ID returned from API');
            }

            // Step 2: Upload the actual file
            console.log('📁 Creating FormData for file upload...');
            const formData = new FormData();

            // Log different approaches for different file types
            const fileObj = {
              uri: file.uri,
              type: file.mimeType || 'application/pdf', // Default to PDF for PDF files
              name: file.name,
            };

            console.log('📎 File object for FormData:', fileObj);
            formData.append('memberDocumentFile', fileObj);

            const uploadUrl = `${appConfig.mobileApi}MemberDocument/UploadMemberDocumentFile?memberDocumentId=${memberDocumentId}`;
            console.log('🔗 Upload URL:', uploadUrl);

            console.log('📤 Starting file upload...');
            const uploadResponse = await fetch(uploadUrl, {
              method: 'POST',
              headers: {
                'accept': '*/*',
                'Content-Type': 'multipart/form-data',
              },
              body: formData,
            });

            console.log('📥 Upload response status:', uploadResponse.status);
            console.log('📥 Upload response headers:', Object.fromEntries(uploadResponse.headers.entries()));

            if (!uploadResponse.ok) {
              const errorText = await uploadResponse.text();
              console.error('❌ Upload failed with response:', errorText);
              throw new Error(`Failed to upload file: ${uploadResponse.status} - ${errorText}`);
            }

            const uploadResult = await uploadResponse.text();
            console.log('✅ Upload successful, response:', uploadResult);

            // Add the file to local state with the document ID for future reference
            const fileWithId = {
              ...file,
              memberDocumentId: memberDocumentId,
              uploadDate: new Date().toISOString(),
              documentTypeName: documentType.Name
            };

            console.log('💾 Adding file to local state:', fileWithId);

            setUploadedFiles(prev => ({
              ...prev,
              [documentTypeId]: [...(prev[documentTypeId] || []), fileWithId]
            }));

            successCount++;
            console.log(`✅ File ${i + 1} uploaded successfully`);

          } catch (fileError) {
            console.error(`❌ Error uploading file ${file.name}:`, fileError);
            console.error('❌ Full error details:', {
              message: fileError.message,
              stack: fileError.stack,
              name: fileError.name
            });
            Alert.alert('خطا در اپلود', `مشکلی در اپلود فایل ${file.name} پیش آمد: ${fileError.message}`);
          }
        }

        // Show success message
        console.log(`🎉 Upload process completed. Success: ${successCount}/${totalFiles}`);
        if (successCount > 0) {
          Alert.alert('موفق', `${successCount} از ${totalFiles} فایل به بخش ${documentType.Name} اپلود شد`);
        }

      } else if (result.canceled) {
        console.log('ℹ️ User cancelled file picker');
      } else {
        console.log('❌ No files selected or unknown picker result structure');
      }
    } catch (error) {
      console.error('❌ Error in pickDocument:', error);
      console.error('❌ Full error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      Alert.alert('خطا', 'مشکلی در انتخاب فایل پیش آمد');
    } finally {
      setIsUploading('');
      console.log('🏁 pickDocument process finished');
    }
  };

  // Enhanced removeFile function with API integration
  const removeFile = async (documentTypeId, index) => {
    const documentType = documentTypes.find(doc => doc.MemberDocumentTypeId === documentTypeId);
    const file = uploadedFiles[documentTypeId][index];

    Alert.alert(
      'حذف فایل',
      `آیا از حذف این فایل از بخش ${documentType.Name} اطمینان دارید؟`,
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              // If file has a memberDocumentId, call delete API
              if (file.memberDocumentId) {
                await deleteData(`MemberDocument/Delete?id=${file.memberDocumentId}`);
              }

              // Remove from local state
              setUploadedFiles(prev => ({
                ...prev,
                [documentTypeId]: (prev[documentTypeId] || []).filter((_, i) => i !== index)
              }));

              Alert.alert('موفق', 'فایل با موفقیت حذف شد');

            } catch (error) {
              console.error('Error deleting file:', error);
              Alert.alert('خطا', 'مشکلی در حذف فایل از سرور پیش آمد');
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    fetchDocumentTypes();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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

  const FileUploadCard = ({ documentType, index }) => {
    const color = getColorForIndex(index);
    const files = uploadedFiles[documentType.MemberDocumentTypeId] || [];
    const isCurrentlyUploading = isUploading === documentType.MemberDocumentTypeId.toString();

    return (
      <View style={styles.detailItem}>
        <View style={[styles.labelContainer, { justifyContent: 'space-between' }]}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', flex: 1 }}>
            <LinearGradient
              colors={[color, color + 'CC']}
              style={styles.iconWrapper}
            >
              <MaterialIcons
                name="description"
                size={22}
                color={modernColors.surface}
              />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <AppText style={styles.label}>{documentType.Name}</AppText>
              <AppText style={styles.categoryDescription}>{documentType.Name}</AppText>
            </View>
          </View>
        </View>

        <View style={styles.contentContainer}>
          {/* Upload Button */}
          <TouchableOpacity
            style={[styles.uploadButton, isCurrentlyUploading && styles.uploadButtonDisabled]}
            onPress={() => pickDocument(documentType.MemberDocumentTypeId)}
            disabled={isCurrentlyUploading || postLoading}
          >
            <LinearGradient
              colors={[color, color + 'DD']}
              style={styles.uploadButtonGradient}
            >
              <MaterialIcons
                name={isCurrentlyUploading ? "hourglass_empty" : "add"}
                size={24}
                color={modernColors.surface}
              />
              <AppText style={styles.uploadButtonText}>
                {isCurrentlyUploading ? 'در حال اپلود...' : 'انتخاب فایل'}
              </AppText>
            </LinearGradient>
          </TouchableOpacity>

          {/* Uploaded Files List */}
          {files.length > 0 && (
            <View style={styles.filesContainer}>
              <AppText style={styles.filesTitle}>
                فایل‌های اپلود شده ({files.length}):
              </AppText>
              {files.map((file, fileIndex) => (
                <View key={fileIndex} style={styles.fileItem}>
                  <View style={styles.fileInfo}>
                    <MaterialIcons
                      name={getFileIcon(file.name)}
                      size={20}
                      color={color}
                      style={styles.fileIcon}
                    />
                    <View style={styles.fileDetails}>
                      <AppText style={styles.fileName} numberOfLines={1}>
                        {file.name}
                      </AppText>
                      <AppText style={styles.fileSize}>
                        {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'نامشخص'}
                      </AppText>
                      {file.uploadDate && (
                        <AppText style={styles.uploadDate}>
                          {new Date(file.uploadDate).toLocaleDateString('fa-IR')}
                        </AppText>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFile(documentType.MemberDocumentTypeId, fileIndex)}
                    disabled={deleteLoading}
                  >
                    <MaterialIcons
                      name={deleteLoading ? "hourglass_empty" : "close"}
                      size={18}
                      color={modernColors.error}
                    />
                  </TouchableOpacity>
                </View>
              ))}
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

  const SkeletonCard = () => (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonIcon} />
        <View style={styles.skeletonTextContainer}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonSubtitle} />
        </View>
      </View>
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonButton} />
        <View style={styles.skeletonEmptyState} />
      </View>
    </View>
  );

  // Show error state if API fails
  if (!loading && error) {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View style={styles.container}>
          <MainBackground />

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
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

  // Show empty state if no documents found
  if (!loading && !error && documentTypes.length === 0) {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View style={styles.container}>
          <MainBackground />

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
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
            <MaterialIcons name="folder_open" size={80} color="#9e9e9e" />
            <AppText style={styles.errorTitle}>هیچ نوع مدرکی یافت نشد</AppText>
            <AppText style={styles.errorSubtitle}>
              در حال حاضر هیچ دسته‌ای برای آپلود مدارک تعریف نشده است
            </AppText>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => fetchDocumentTypes()}
            >
              <MaterialIcons name="refresh" size={20} color={modernColors.surface} />
              <AppText style={styles.retryButtonText}>بررسی مجدد</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

  // Show loading skeleton while data is being fetched
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
              onPress={() => navigation.goBack()}
            >
              <View style={styles.backButtonContainer}>
                <MaterialIcons
                  name="arrow-forward"
                  size={24}
                  color="#6366f1"
                />
              </View>
            </TouchableOpacity>

            <Animated.View
              style={[
                styles.profileHeaderContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
            </Animated.View>

            <Animated.View
              style={[
                styles.sectionTitleContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <AppText style={styles.sectionTitle}>فایل ها و مدارک</AppText>
              <View style={styles.sparkleContainer}>
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
              </View>
            </Animated.View>

            <Animated.View
              style={[
                styles.cardsContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {[1, 2, 3].map((index) => (
                <SkeletonCard key={index} />
              ))}
            </Animated.View>

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
        {/* Main Background */}
        <MainBackground />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <View style={styles.backButtonContainer}>
              <MaterialIcons
                name="arrow-forward"
                size={24}
                color="#6366f1"
              />
            </View>
          </TouchableOpacity>

          {/* Profile Header */}
          <Animated.View
            style={[
              styles.profileHeaderContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
          </Animated.View>

          {/* Section Title */}
          <Animated.View
            style={[
              styles.sectionTitleContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <AppText style={styles.sectionTitle}>فایل ها و مدارک</AppText>
            <View style={styles.sparkleContainer}>
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
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.cardsContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {documentTypes.map((documentType, index) => (
              <FileUploadCard
                key={documentType.MemberDocumentTypeId}
                documentType={documentType}
                index={index}
              />
            ))}
          </Animated.View>

          <View style={styles.decorativeElements}>
            <View style={styles.floatingElements}>
              <Animated.View style={[styles.star1, { transform: [{ rotate: spin }] }]}>
                <MaterialIcons
                  name="auto-awesome"
                  size={22}
                  color="rgba(139, 92, 246, 0.3)"
                />
              </Animated.View>
              <Animated.View style={[styles.star2, { transform: [{ rotate: spin }] }]}>
                <MaterialIcons
                  name="palette"
                  size={18}
                  color="rgba(99, 102, 241, 0.3)"
                />
              </Animated.View>
              <Animated.View style={[styles.star3, { transform: [{ rotate: spin }] }]}>
                <MaterialIcons
                  name="brush"
                  size={20}
                  color="rgba(6, 182, 212, 0.3)"
                />
              </Animated.View>
              <Animated.View style={[styles.star4, { transform: [{ rotate: spin }] }]}>
                <MaterialIcons
                  name="cut"
                  size={24}
                  color="rgba(139, 92, 246, 0.2)"
                />
              </Animated.View>
            </View>
          </View>

          {/* Bottom Spacer */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  backButton: {
    position: 'absolute',
    top: StatusBar.currentHeight + 48,
    right: 20,
    zIndex: 1000,
  },
  backButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginTop: -32,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  profileHeaderContainer: {
    alignItems: "center",
    marginBottom: 30,
    paddingTop: StatusBar.currentHeight + 80,
    paddingHorizontal: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    marginTop: -90,
    position: "relative",
    paddingHorizontal: 20,
  },
  sparkleContainer: {
    position: "relative",
  },
  sparkle1: {
    position: "absolute",
    top: -10,
    right: 90,
  },
  sparkle2: {
    position: "absolute",
    top: 5,
    right: 25,
  },
  sectionTitle: {
    textAlign: "center",
    fontSize: 26,
    fontFamily: "Yekan_Bakh_ExtraBold",
    color: "#2c3e50",
  },
  cardsContainer: {
    paddingHorizontal: 20,
  },
  detailItem: {
    marginBottom: 20,
    backgroundColor: "rgba(248, 250, 252, 0.3)",
    backdropFilter: "blur(15px)",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(203, 213, 225, 0.4)",
    position: "relative",
    overflow: "hidden",
    marginHorizontal: 5,
  },
  labelContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  label: {
    fontSize: 17,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    textAlign: 'right',
  },
  categoryDescription: {
    fontSize: 13,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#6b7280",
    textAlign: 'right',
    marginTop: 2,
  },
  contentContainer: {
    paddingHorizontal: 15,
    marginTop: 15,
  },
  featureAccent: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 6,
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },

  // File Upload Styles
  uploadButton: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  uploadButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  uploadButtonText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#ffffff',
    marginLeft: 10,
  },
  filesContainer: {
    marginTop: 10,
  },
  filesTitle: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    marginBottom: 15,
    textAlign: 'right',
  },
  fileItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
  },
  fileInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  fileIcon: {
    marginLeft: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#2c3e50",
    textAlign: 'right',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#6b7280",
    textAlign: 'right',
  },
  uploadDate: {
    fontSize: 11,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#9ca3af",
    textAlign: 'right',
    marginTop: 2,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#6b7280",
    marginTop: 12,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#9ca3af",
    marginTop: 4,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#6b7280",
    marginTop: 12,
    textAlign: 'center',
  },

  // Skeleton Styles
  skeletonCard: {
    marginBottom: 20,
    backgroundColor: "rgba(248, 250, 252, 0.3)",
    backdropFilter: "blur(15px)",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(203, 213, 225, 0.4)",
    position: "relative",
    overflow: "hidden",
    marginHorizontal: 5,
  },
  skeletonHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 15,
  },
  skeletonIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e2e8f0',
    marginLeft: 12,
  },
  skeletonTextContainer: {
    flex: 1,
  },
  skeletonTitle: {
    height: 18,
    backgroundColor: '#e2e8f0',
    borderRadius: 9,
    marginBottom: 8,
    width: '60%',
    alignSelf: 'flex-end',
  },
  skeletonSubtitle: {
    height: 14,
    backgroundColor: '#f1f5f9',
    borderRadius: 7,
    width: '80%',
    alignSelf: 'flex-end',
  },
  skeletonContent: {
    paddingHorizontal: 15,
  },
  skeletonButton: {
    height: 52,
    backgroundColor: '#e2e8f0',
    borderRadius: 18,
    marginBottom: 20,
  },
  skeletonEmptyState: {
    height: 120,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },

  // Error state styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#2c3e50',
    marginTop: 20,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#9e9e9e',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: modernColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 24,
    shadowColor: modernColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.surface,
    marginRight: 8,
  },

  bottomSpacer: {
    height: 50,
  },
  decorativeElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  floatingElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star1: {
    position: "absolute",
    top: 400,
    left: 60,
  },
  star2: {
    position: "absolute",
    top: 600,
    right: 70,
  },
  star3: {
    position: "absolute",
    top: 800,
    left: 50,
  },
  star4: {
    position: "absolute",
    top: 1000,
    right: 90,
  },
});

export default MyResumeScreen;