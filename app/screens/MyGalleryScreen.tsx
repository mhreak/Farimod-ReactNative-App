import React, { useEffect, useRef } from "react";
import AppText from "../components/Text";
import * as ImagePicker from "expo-image-picker";
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  StatusBar,
  Animated,
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

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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
        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            source={require("../../assets/sample_clothe2.jpg")}
          />
          <LinearGradient
            colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.8)"]}
            style={styles.background}
          />
          <View style={styles.textContainer}>
            <AppText style={styles.galleryTitle}>{item.name}</AppText>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={{ flex: 1 }}>
        <MainBackground />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.backButtonContainer}>
            <MaterialIcons
              name="arrow-forward"
              size={26}
              color="#6366f1"
            />
          </View>
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.headerContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.addIconHeader}>
              <LinearGradient
                colors={['#4CAF50', '#45A049']}
                style={styles.addIconGradient}
              >
                <MaterialIcons name="add" size={26} color="white" />
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.titleWrapper}>
              <AppText style={styles.headerTitle}>گالری های من</AppText>
              <View style={styles.sparkleContainer}>
                <Animated.View style={[{ transform: [{ rotate: spin }] }]}>
                  <MaterialIcons
                    name="star-half"
                    size={16}
                    color="#FFD700"
                    style={styles.sparkle1}
                  />
                </Animated.View>
                <Animated.View style={[{ transform: [{ rotate: spin }] }]}>
                  <MaterialIcons
                    name="diamond"
                    size={12}
                    color="#FF6B6B"
                    style={styles.sparkle2}
                  />
                </Animated.View>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.galleryContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <FlatList
            data={galleries}
            numColumns={2}
            renderItem={({ item }) => renderItem(item)}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        </Animated.View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
    paddingTop: StatusBar.currentHeight + 35,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "relative",
  },
  addIconHeader: {
    position: "absolute",
    left: 0,
    borderRadius: 25,
    overflow: "hidden",
    
    marginTop: 8,

  },
  addIconGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    // marginTop: 5,
  },
  backButton: {
    position: 'absolute',
    top: StatusBar.currentHeight + 45,
    right: 20,
    zIndex: 1000,
  },
  backButtonContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    marginTop: -17
  },
  titleWrapper: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  headerIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    marginLeft: 15,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Yekan_Bakh_ExtraBold",
    color: "#2c3e50",
    marginHorizontal: 15,
    textAlign: "center",
  },
  sparkleContainer: {
    position: "absolute",
    top: 100,
    left: 10,
  },
  sparkle1: {
    position: "absolute",
    top: 0,
    left: 90,
  },
  sparkle2: {
    position: "absolute",
    top: 25,
    left: 25,
  },
  galleryContent: {
    flex: 1,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "70%",
    borderRadius: 20,
  },
  list: {
    padding: 15,
  },
  gridItem: {
    flex: 1,
    margin: 8,
    height: 200,
    borderRadius: 20,
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 4,
    // },
    // shadowOpacity: 0.3,
    // shadowRadius: 8,
    // elevation: 10,
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  textContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    paddingBottom: 20,
  },
  galleryTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
  addIcon: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 25,
    right: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 15,
  },
});

export default MyGalleryScreen;