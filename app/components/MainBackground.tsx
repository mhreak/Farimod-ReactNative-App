import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";

const MainBackground = () => {
  return (
    <LinearGradient
      colors={["#e2bcef", "transparent"]}
      style={styles.background}
    />
  );
};

const styles = StyleSheet.create({
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "60%",
  },
});

export default MainBackground;
