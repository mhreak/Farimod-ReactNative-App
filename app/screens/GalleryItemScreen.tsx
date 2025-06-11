import React, { useState } from "react";
import AppText from "../components/Text";
import ImageInput from "../components/ImageInput";
import { Image, View } from "react-native";
import ImageInputList from "../components/ImageInputList";
import FormImagePicker from "../components/forms/FormImagePicker";
import MainBackground from "../components/MainBackground";

const GalleryItemScreen = () => {
  const [imageUri, setImageUri] = useState([]);

  return (
    <View>
      <MainBackground />
      <ImageInputList
        imageUris={imageUri}
        onAddImage={(uri) => setImageUri((prev) => [...prev, uri])}
        onRemoveImage={(uri) =>
          setImageUri(imageUri.filter((image) => image !== uri))
        }
      />
      {/* <Image
        source={{ uri: imageUri }}
        style={{ width: "100%", height: "100%", backgroundColor: "#c0c0c0" }}
      /> */}
      {/* <FormImagePicker /> */}
    </View>
  );
};

export default GalleryItemScreen;
