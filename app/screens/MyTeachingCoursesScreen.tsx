import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Animated,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AppText from "../components/Text";
import MainBackground from "../components/MainBackground";

const MyTeachingCoursesScreen = () => {
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

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        <MainBackground />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {/* Header with back and add buttons */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <View style={styles.backButtonContainer}>
              <MaterialIcons
                name="arrow-forward"
                size={24}
                color="white"
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("AddNewCourse")}
          >
            <View style={styles.addButtonContainer}>
              <MaterialIcons
                name="add"
                size={24}
                color="white"
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
            <View style={styles.titleWrapper}>
              <AppText style={styles.headerTitle}>دوره‌های تدریس من</AppText>
            </View>
          </Animated.View>

          {/* Content */}
          <Animated.View
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <AppText style={styles.contentText}>MyTeachingCoursesScreen</AppText>
          </Animated.View>

          {/* Decorative Elements */}
          <View style={styles.decorativeElements}>
            <View style={styles.floatingElements}>
              <Animated.View style={[styles.star1, { transform: [{ rotate: spin }] }]}>
                <MaterialIcons
                  name="auto-awesome"
                  size={22}
                  color="rgba(139, 92, 246, 0.3)"
                />
              </Animated.View>
              <Animated.View style={[styles.star2, { transform: [{ rotate: spin }] }]}>
                <MaterialIcons
                  name="school"
                  size={18}
                  color="rgba(99, 102, 241, 0.3)"
                />
              </Animated.View>
              <Animated.View style={[styles.star3, { transform: [{ rotate: spin }] }]}>
                <MaterialIcons
                  name="menu-book"
                  size={20}
                  color="rgba(6, 182, 212, 0.3)"
                />
              </Animated.View>
              <Animated.View style={[styles.star4, { transform: [{ rotate: spin }] }]}>
                <MaterialIcons
                  name="star"
                  size={24}
                  color="rgba(139, 92, 246, 0.2)"
                />
              </Animated.View>
            </View>
          </View>

          {/* Bottom Spacer */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  // Header styles (مطابق ProfileScreen)
  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
    paddingTop: StatusBar.currentHeight + 35,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: StatusBar.currentHeight + 45,
    right: 20,
    zIndex: 1000,
    backgroundColor: '#6366f1',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -12,
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButton: {
    position: 'absolute',
    top: StatusBar.currentHeight + 45,
    left: 20,
    zIndex: 1000,
  },
  addButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -12,
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  titleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Yekan_Bakh_ExtraBold",
    color: "#2c3e50",
    marginHorizontal: 15,
    textAlign: "center",
  },
  // Content
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  contentText: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#2c3e50",
    textAlign: "center",
  },
  // Decorative Elements (مطابق ProfileScreen)
  decorativeElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  floatingElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star1: {
    position: "absolute",
    top: 300,
    left: 60,
  },
  star2: {
    position: "absolute",
    top: 500,
    right: 70,
  },
  star3: {
    position: "absolute",
    top: 700,
    left: 50,
  },
  star4: {
    position: "absolute",
    top: 900,
    right: 90,
  },
  bottomSpacer: {
    height: 50,
  },
});

export default MyTeachingCoursesScreen;