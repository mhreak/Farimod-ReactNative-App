import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
  Modal,
  Pressable,
  TouchableOpacity,
  Animated,
} from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from "./Text";

import colors from "../config/colors";

interface IProps {
  imageUri?: string;
  onChangeImage: (value: string | null) => void;
  onImagePress?: (uri: string) => void;
  disableImageActions?: boolean;
}

const ImageInput: React.FC<IProps> = ({
  imageUri,
  onChangeImage,
  onImagePress,
  disableImageActions = false
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(300));
  const [opacityAnim] = useState(new Animated.Value(0));
  const [deleteSlideAnim] = useState(new Animated.Value(300));
  const [deleteOpacityAnim] = useState(new Animated.Value(0));

  const insets = useSafeAreaInsets();

  useEffect(() => {
    requestPermission();
  }, []);

  useEffect(() => {
    if (modalVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [modalVisible]);

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

  const requestPermission = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) alert("You need to enable permission to access the library.");
  };

  const handlePress = () => {
    if (!imageUri) {
      selectImage();
    } else {
      setModalVisible(true);
    }
  };

  const selectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        quality: 0.5,
      });
      if (!result.canceled) onChangeImage(result.assets[0].uri);
    } catch (error) {
      console.log("Error reading an image", error);
    }
  };

  const handleDeleteImage = () => {
    setModalVisible(false);
    setTimeout(() => {
      setDeleteModalVisible(true);
    }, 300);
  };

  const confirmDelete = () => {
    setDeleteModalVisible(false);
    onChangeImage(null);
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
  };

  const handleViewImage = () => {
    setModalVisible(false);
    setTimeout(() => {
      if (onImagePress) {
        onImagePress(imageUri!);
      }
    }, 300);
  };

  const handleEditImage = () => {
    setModalVisible(false);
    setTimeout(() => {
      selectImage();
    }, 300);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={handlePress}>
        <View style={styles.container}>
          {!imageUri && (
            <MaterialCommunityIcons
              color={colors.medium}
              name="camera"
              size={40}
            />
          )}
          {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
        </View>
      </TouchableWithoutFeedback>

      {/* Actions Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ translateY: slideAnim }],
                opacity: opacityAnim,
                paddingBottom: Math.max(insets.bottom, 20) + 20, // حداقل 20 + safe area
              }
            ]}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              {/* View Image */}
              <TouchableOpacity style={styles.actionItem} onPress={handleViewImage}>
                <View style={[styles.actionIcon, { backgroundColor: '#3B82F6' }]}>
                  <MaterialIcons name="visibility" size={24} color="white" />
                </View>
                <AppText style={styles.actionText}>مشاهده</AppText>
              </TouchableOpacity>

              {/* Edit Image */}
              <TouchableOpacity style={styles.actionItem} onPress={handleEditImage}>
                <View style={[styles.actionIcon, { backgroundColor: '#8B5CF6' }]}>
                  <MaterialIcons name="edit" size={24} color="white" />
                </View>
                <AppText style={styles.actionText}>ویرایش</AppText>
              </TouchableOpacity>

              {/* Share Image */}
      

              {/* Delete Image */}
              <TouchableOpacity style={styles.actionItem} onPress={handleDeleteImage}>
                <View style={[styles.actionIcon, { backgroundColor: '#EF4444' }]}>
                  <MaterialIcons name="delete" size={24} color="white" />
                </View>
                <AppText style={styles.actionText}>حذف</AppText>
              </TouchableOpacity>
            </View>

            {/* Cancel Button */}
            <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
              <AppText style={styles.cancelText}>لغو</AppText>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>

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
                marginBottom: Math.max(insets.bottom, 20), // safe area از پایین
              }
            ]}
          >
            {/* Icon */}
            <View style={styles.deleteIconContainer}>
              <MaterialIcons name="warning" size={48} color="#EF4444" />
            </View>

            {/* Title */}
            <AppText style={styles.deleteTitle}>حذف عکس</AppText>

            {/* Message */}
            <AppText style={styles.deleteMessage}>
              آیا مطمئن هستید که می‌خواهید این عکس را حذف کنید؟
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
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.gray,
    borderRadius: 15,
    height: 120,
    justifyContent: "center",
    marginVertical: 10,
    overflow: "hidden",
    width: 120,
  },
  image: {
    height: "100%",
    width: "100%",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  modalHeader: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  actionItem: {
    alignItems: 'center',
    padding: 10,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    color: '#374151',
    fontFamily: "Yekan_Bakh_Regular",
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 15,
    paddingVertical: 16,
    marginTop: 15, // کمی بیشتر شده
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  cancelText: {
    fontSize: 16,
    color: '#DC2626',
    fontFamily: "Yekan_Bakh_Bold",
    textAlign: 'center',
  },

  // Delete Modal Styles
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  deleteModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
    width: '100%',
    maxWidth: 350,
  },
  deleteIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  deleteTitle: {
    fontSize: 20,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  deleteMessage: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  deleteButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelDeleteButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  confirmDeleteButton: {
    backgroundColor: '#EF4444',
  },
  cancelDeleteText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#374151',
  },
  confirmDeleteText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#FFFFFF',
  },
});

export default ImageInput;