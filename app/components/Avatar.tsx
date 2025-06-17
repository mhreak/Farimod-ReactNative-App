import React from "react";
import { StyleSheet, View } from "react-native";
import colors from "../config/colors";
import AppText from "./Text";
import { MaterialIcons } from "@expo/vector-icons";

interface IProps {
  imageUrl?: string;
  name: string;
}

const Avatar: React.FC<IProps> = ({ imageUrl, name }) => {
  return (
    <>
      <View style={styles.container}>
        <View style={styles.photo}>
          <MaterialIcons
            name="person"
            size={90}
            color={colors.white}
          ></MaterialIcons>
        </View>
        <AppText style={{ fontSize: 15, height: 40 }}>{name}</AppText>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  photo: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.medium,
    borderRadius: 100,
    backgroundColor: colors.gray,
    width: 110,
    height: 110,
    marginBottom: 8,
  },
});

export default Avatar;
