import React, { useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import ImageInput from "./ImageInput";
import AppButton from "./Button";

interface IProps {
  imageUris: string[];
  onRemoveImage: (uri: string | null) => void;
  onAddImage: (uri: string | null) => void;
  onImagePress?: (uri: string) => void;
  isReadOnly?: boolean;
}

const ImageInputList: React.FC<IProps> = ({
  imageUris = [],
  onRemoveImage,
  onAddImage,
  onImagePress,
  isReadOnly = false,
}) => {
  return (
    <View>
      <ScrollView contentContainerStyle={styles.container}>
        {imageUris.map((uri) => (
          <View key={uri} style={styles.itemContainer}>
            {isReadOnly ? (
              <TouchableOpacity
                onPress={() => onImagePress?.(uri)}
                activeOpacity={0.8}
                style={styles.readOnlyImageWrapper}
              >
                <Image
                  source={{ uri }}
                  style={styles.readOnlyImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ) : (
              <ImageInput
                imageUri={uri}
                onChangeImage={() => onRemoveImage(uri)}
                onImagePress={onImagePress}
              />
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    padding: 10,
  },
  itemContainer: {
    width: Dimensions.get("window").width / 3 - 13, 
    height: Dimensions.get("window").width / 3 - 13, 
    margin: 3, 
  },
  readOnlyImageWrapper: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: '#f0f0f0', 
  },
  readOnlyImage: {
    width: "100%",
    height: "100%",
  },
  gridItem: {},
});

export default ImageInputList;