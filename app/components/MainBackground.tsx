import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, ImageBackground, View } from "react-native";

const MainBackground = React.memo(() => {
  return (
    <View style={styles.container} pointerEvents="none">
      <ImageBackground
        source={require('../../assets/backgrounds/background-1.jpg')}
        style={styles.background}
        resizeMode="repeat"
      />
      <LinearGradient
        colors={["#e2bcef", "transparent"]}
        style={styles.gradient}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    width: "100%",
    height: "250%",
    opacity: 0.06,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    width: "100%",
    height: "70%",
  },
});

export default MainBackground;