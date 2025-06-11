import React from "react";
import AppText from "../components/Text";
import { StyleSheet, View } from "react-native";
import AppTextInput from "../components/TextInput";
import AppButton from "../components/Button";
import Screen from "../components/Screen";
import colors from "../config/colors";

const EditProfileScreen = () => {
  return (
    <Screen style={styles.container}>
      <View style={styles.editBox}>
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
        <AppButton title="ذخیره" onPress={() => {}}></AppButton>
      </View>
    </Screen>
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
  },
});

export default EditProfileScreen;
