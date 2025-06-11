import React from "react";
import AppText from "../components/Text";
import { Formik } from "formik";
import { ScrollView, StyleSheet, View } from "react-native";
import * as Yup from "yup";
import AppTextInput from "../components/TextInput";
import colors from "../config/colors";
import AppButton from "../components/Button";
import MainBackground from "../components/MainBackground";
import AppPicker from "../components/Picker";

const AddNewCourseScreen = () => {
  const validationSchema = Yup.object().shape({
    courseName: Yup.string().required(""),
    courseType: Yup.number().required(""),
    poster: Yup.string(),
    description: Yup.string().required(""),
    coursePrice: Yup.number().required(""),
    eventLocation: Yup.number().required(""),
    phoneNumber: Yup.number().required(""),
    coaches: Yup.number().required(""),
    category: Yup.number().required(""),
  });
  return (
    <ScrollView>
      {/* <MainBackground /> */}
      <View style={styles.formBox}>
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
                  keyboardType="default"
                  name="mobileNumber"
                  placeholder="نام دوره"
                  onChangeText={handleChange("mobileNumber")}
                ></AppTextInput>
                <AppPicker
                  items={[
                    { value: 1, label: "حضوری" },
                    { value: 2, label: "مجازی" },
                    { value: 3, label: "حضوری و مجازی" },
                  ]}
                  onSelectItem={(item) => console.log(item)}
                  selectedItem={{ value: 1, label: "حضوری" }}
                  icon="phone-android"
                  placeholder="نوع دوره"
                ></AppPicker>
                <AppTextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  icon="phone-android"
                  keyboardType="default"
                  name="mobileNumber"
                  placeholder="پوستر"
                  onChangeText={handleChange("mobileNumber")}
                ></AppTextInput>
                <AppTextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  icon="phone-android"
                  keyboardType="default"
                  name="mobileNumber"
                  placeholder="توضیحات"
                  onChangeText={handleChange("mobileNumber")}
                  multiline={true}
                  numberOfLines={5}
                ></AppTextInput>
                <AppTextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  icon="phone-android"
                  keyboardType="phone-pad"
                  name="mobileNumber"
                  placeholder="هزینه ثبت نام"
                  onChangeText={handleChange("mobileNumber")}
                ></AppTextInput>
                <AppTextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  icon="phone-android"
                  keyboardType="default"
                  name="mobileNumber"
                  placeholder="محل برگزاری"
                  onChangeText={handleChange("mobileNumber")}
                ></AppTextInput>
                <AppTextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  icon="phone-android"
                  keyboardType="phone-pad"
                  name="mobileNumber"
                  placeholder="تلفن تماس"
                  onChangeText={handleChange("mobileNumber")}
                ></AppTextInput>
                <AppPicker
                  items={[]}
                  onSelectItem={(item) => console.log(item)}
                  icon="phone-android"
                  placeholder="مربیان"
                ></AppPicker>
                <AppPicker
                  items={[]}
                  onSelectItem={(item) => console.log(item)}
                  icon="phone-android"
                  placeholder="دسته بندی"
                ></AppPicker>

                <AppText style={{ color: colors.danger }}>
                  {errors.mobileNumber}
                </AppText>
                <AppButton title="ثبت دوره" onPress={handleSubmit}></AppButton>
              </View>
            </>
          )}
        </Formik>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  formBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: 20,
    padding: 20,
    margin: 20,
  },
});

export default AddNewCourseScreen;
