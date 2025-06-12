import React from "react";
import AppText from "../components/Text";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import AppTextInput from "../components/TextInput";
import AppButton from "../components/Button";
import Screen from "../components/Screen";
import colors from "../config/colors";
import FabricBackground from "../components/FabricBackground";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { AppNavigationProp } from "../Navigators";

const EditProfileScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  return (
    <FabricBackground>
      <Screen style={styles.container}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginRight: 15, position: "absolute", top: 15, right: 0 }}
        >
          <Ionicons name="arrow-forward" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <View style={styles.editBox}>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <MaterialIcons name="person" color={colors.primary} size={65} />
              </View>
            </View>
            <AppText style={styles.logingText}>ویرایش پروفایل</AppText>
            <AppTextInput
              autoCapitalize="none"
              autoCorrect={false}
              icon="account-box"
              keyboardType="default"
              name="userName"
              placeholder="نام کاربری"
              onChangeText={() => {}}
            ></AppTextInput>
            <AppTextInput
              autoCapitalize="none"
              autoCorrect={false}
              icon="person"
              keyboardType="default"
              name="fullName"
              placeholder="نام و نام خانوادگی"
              onChangeText={() => {}}
            ></AppTextInput>
            <AppTextInput
              autoCapitalize="none"
              autoCorrect={false}
              icon="phone-android"
              keyboardType="phone-pad"
              name="mobileNumber"
              placeholder="شماره موبایل"
              onChangeText={() => {}}
            ></AppTextInput>
            <AppButton
              title="ذخیره"
              onPress={() => {}}
              color={colors.success}
            ></AppButton>
          </View>
        </View>
      </Screen>
    </FabricBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    justifyContent: "center",
  },
  editBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: 20,
    padding: 20,
    width: "100%",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  iconCircle: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderRadius: 50,
    borderColor: colors.primaryLight,
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: -70,
  },
  logingText: {
    fontSize: 30,
    textAlign: "center",
    marginBottom: 30,
    fontFamily: "Yekan_Bakh_Bold",
  },
});

export default EditProfileScreen;
