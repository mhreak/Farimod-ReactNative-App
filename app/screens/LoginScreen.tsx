import React from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import Screen from "../components/Screen";
import AppButton from "../components/Button";
import { ErrorMessage, Formik } from "formik";
import AppTextInput from "../components/TextInput";
import colors from "../config/colors";
import { useNavigation } from "@react-navigation/native";
import * as Yup from "yup";
import AppText from "../components/Text";

const validationSchema = Yup.object().shape({
  mobileNumber: Yup.string().required("شماره موبایل وارد نشده است"),
});

const LoginScreen = () => {
  const navigation = useNavigation();
  return (
    <ImageBackground
      source={require("../../assets/backgrounds/fashion_pattern_1000px.jpg")} // Local image
      style={styles.background}
      resizeMode="repeat" // "cover", "contain", or "stretch"
      imageStyle={{ width: "100%" }}
    >
      <Screen style={styles.container}>
        <View style={styles.loginBox}>
          <AppText style={styles.logingText}>ورود به حساب کاربری</AppText>

          <Formik
            initialValues={{ mobileNumber: "" }}
            onSubmit={(values) => {
              navigation.navigate("MainTabs");
            }}
            validationSchema={validationSchema}
          >
            {({ handleChange, handleSubmit, errors }) => (
              <>
                <View>
                  <AppTextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    icon="phone-android"
                    keyboardType="phone-pad"
                    name="mobileNumber"
                    placeholder="شماره موبایل"
                    onChangeText={handleChange("mobileNumber")}
                  ></AppTextInput>
                  <AppText style={{ color: colors.danger }}>
                    {errors.mobileNumber}
                  </AppText>
                  <AppButton
                    style={styles.loginButton}
                    title="ورود"
                    onPress={handleSubmit}
                  ></AppButton>
                  <View style={styles.footerContainer}>
                    <AppText style={styles.footerText}>
                      حساب کاربری ندارید؟{" "}
                    </AppText>
                    <TouchableOpacity
                      onPress={() => {
                        navigation.navigate("Signup");
                      }}
                    >
                      <AppText style={styles.signupText}>ثبت نام کنید</AppText>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </Formik>
          {/* <Text style={styles.footerText}>
            حساب کاربری ندارید؟{" "}
            <Text
              style={styles.signupText}
              onPress={() => navigation.navigate("Sign up")}
            >
              ثبت نام کنید
            </Text>
          </Text> */}
        </View>
      </Screen>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    width: "100%",
    flex: 1,
  },
  container: {
    padding: 10,
    justifyContent: "center",
    fontFamily: "Yekan_Bakh_Regular",
  },
  blurContainer: {
    flex: 1,
    padding: 20,
    margin: 16,
    textAlign: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 20,
  },
  loginBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: 20,
    padding: 20,
  },
  loginButton: {},
  logingText: {
    fontSize: 30,
    textAlign: "center",
    marginBottom: 30,
    fontFamily: "Yekan_Bakh_Bold",
  },
  footerContainer: {
    marginTop: 20,
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
  },
  signupText: {
    fontSize: 16,
    color: colors.primary,
    textDecorationLine: "underline",
  },
});

export default LoginScreen;
