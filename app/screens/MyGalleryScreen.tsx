import React from "react";
import AppText from "../components/Text";
import * as ImagePicker from "expo-image-picker";
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "../config/colors";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MainBackground from "../components/MainBackground";
import { LinearGradient } from "expo-linear-gradient";

interface IGalleryItem {
  id: number;
  name: string;
}

const MyGalleryScreen = () => {
  const navigation = useNavigation();

  const galleries = [
    {
      id: 1,
      name: "Gallery 1",
    },
    {
      id: 2,
      name: "Gallery 2",
    },
    {
      id: 3,
      name: "Gallery 3",
    },
    {
      id: 4,
      name: "Gallery 4",
    },
  ];

  const renderItem = (item: IGalleryItem) => {
    return (
      <TouchableOpacity
        style={styles.gridItem}
        onPress={() => navigation.navigate("GalleryItem", { title: item.name })}
      >
        <Image
          style={{
            resizeMode: "stretch",
            width: "100%",
            height: "100%",
            borderRadius: 15,
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
          }}
          source={require("../../assets/sample_clothe2.jpg")}
        />
        <LinearGradient
          colors={["#3f3f3f", "transparent"]}
          style={styles.background}
        />
        <AppText style={{}}>{item.name}</AppText>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <MainBackground />
      <FlatList
        data={galleries}
        numColumns={2}
        renderItem={({ item }) => renderItem(item)}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity style={styles.addIcon}>
        <MaterialIcons name="add" size={30} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
    borderRadius: 15,
  },
  list: {
    padding: 10,
  },
  gridItem: {
    flex: 1,
    margin: 5,
    width: 150,
    height: 175,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    // backgroundColor: colors.gray,
    borderRadius: 15,
  },
  addIcon: {
    width: 60,
    height: 60,
    padding: 10,
    borderRadius: "100%",
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 10,
    right: 10,
  },
});

export default MyGalleryScreen;
