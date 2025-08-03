import React, { useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  Dimensions,
} from "react-native";
import ImageInput from "./ImageInput";
import AppButton from "./Button";

interface IProps {
  imageUris: string[];
  onRemoveImage: (uri: string | null) => void;
  onAddImage: (uri: string | null) => void;
  onImagePress?: (uri: string) => void; // New prop for handling image press
}

const ImageInputList: React.FC<IProps> = ({
  imageUris = [],
  onRemoveImage,
  onAddImage,
  onImagePress,
}) => {
  const renderItems = (uri: string) => {
    if (uri === "") {
      return (
        <View style={styles.gridItem}>
          <ImageInput onChangeImage={(uri) => onAddImage(uri)} />
        </View>
      );
    } else
      return (
        <View style={styles.gridItem}>
          <ImageInput
            imageUri={uri}
            onChangeImage={() => onRemoveImage(uri)}
            onImagePress={onImagePress} // Pass the prop to ImageInput
          />
        </View>
      );
  };

  return (
    <View>
      <ScrollView contentContainerStyle={styles.container}>
       
        {imageUris.map((uri) => (
          <View key={uri} style={styles.itemContainer}>
            <ImageInput
              imageUri={uri}
              onChangeImage={() => onRemoveImage(uri)}
              onImagePress={onImagePress} // Pass the prop to ImageInput
            />
          </View>
        ))}
        {/* <AppButton title={"ذخیره ی گالری"} /> */}
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
  image: {
    marginRight: 10,
  },
  itemContainer: {
    width: Dimensions.get("window").width / 3 - 7,
    height: Dimensions.get("window").width / 3,
    justifyContent: "center",
    alignItems: "center",
  },
  gridItem: {},
});

export default ImageInputList;