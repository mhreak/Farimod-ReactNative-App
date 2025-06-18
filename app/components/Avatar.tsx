import React from "react";
import { StyleSheet, View } from "react-native";
import colors from "../config/colors";
import AppText from "./Text";

interface IProps {
  imageUrl?: string;
  name: string;
}

const Avatar: React.FC<IProps> = ({ imageUrl, name }) => {
  return (
    <>
      <View style={styles.container}>
        <View style={styles.photo}></View>
        <AppText style={{ fontSize: 15 }}>{name}</AppText>
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
    borderWidth: 2,
    borderColor: colors.medium,
    borderRadius: "100%",
    width: 100,
    height: 100,
    marginBottom: 8,
  },
});

export default Avatar;
