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
}

const ImageInputList: React.FC<IProps> = ({
  imageUris = [],
  onRemoveImage,
  onAddImage,
}) => {
  const renderItems = (uri: string) => {
    if (uri === "") {
      return (
        <View style={styles.gridItem}>
          <ImageInput onChangeImage={(uri) => onAddImage(uri)} />;
        </View>
      );
    } else
      return (
        <View style={styles.gridItem}>
          <ImageInput imageUri={uri} onChangeImage={() => onRemoveImage(uri)} />
        </View>
      );
  };

  return (
    <View>
      {/* <FlatList
        data={imageUris}
        numColumns={3}
        renderItem={({ item }) => renderItems(item)}
        keyExtractor={(item) => item}
        contentContainerStyle={{ padding: 10 }}
      /> */}
      {/* <ScrollView
        ref={scrollView}
        horizontal
        onContentSizeChange={() => scrollView.current.scrollToEnd()}
      >
        <View style={styles.container}>
          {imageUris.map((uri) => (
            <View key={uri} style={styles.image}>
              <ImageInput
                imageUri={uri}
                onChangeImage={() => onRemoveImage(uri)}
              />
            </View>
          ))}
          <ImageInput onChangeImage={(uri) => onAddImage(uri)} />
        </View>
      </ScrollView> */}
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.itemContainer}>
          <ImageInput onChangeImage={(uri) => onAddImage(uri)} />
        </View>
        {imageUris.map((uri) => (
          <View key={uri} style={styles.itemContainer}>
            <ImageInput
              imageUri={uri}
              onChangeImage={() => onRemoveImage(uri)}
            />
          </View>
        ))}
        <AppButton title={"ذخیره ی گالری"} />
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
