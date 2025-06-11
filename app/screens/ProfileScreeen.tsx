import React from "react";
import { FlatList, Image, ScrollView, StyleSheet, View } from "react-native";
import colors from "../config/colors";
import AppText from "../components/Text";
import ProfileListItem from "../components/ProfileListItem";
import { toPersianDigits } from "../utils/converters";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import MainBackground from "../components/MainBackground";
import AppButton from "../components/Button";
import { MaterialIcons } from "@expo/vector-icons";
import AddNewCourseScreen from "./AddNewCourseScreen";
import { AppNavigationProp, RootStackParamList } from "../Navigators";

interface IProfileItem {
  id: number;
  title: string;
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  screenName: keyof RootStackParamList;
}

const profileItems: IProfileItem[] = [
  {
    id: 1,
    title: "درباره ی من",
    icon: "info",
    screenName: "AboutMe",
  },
  {
    id: 2,
    title: "رزومه ی من",
    icon: "my-library-books",
    screenName: "MyResume",
  },
  {
    id: 3,
    title: "گالری من",
    icon: "image",
    screenName: "MyGallery",
  },
  {
    id: 4,
    title: "پست های منتشر شده",
    icon: "article",
    screenName: "MyPosts",
  },
  {
    id: 5,
    title: "دوره های ثبت نام شده",
    icon: "fact-check",
    screenName: "MyCourses",
  },
];

const ProfileScreeen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  return (
    <ScrollView>
      <View>
        <MainBackground />
        <Image
          style={styles.profilePhoto}
          source={require("../../assets/profile_avatar.png")}
        ></Image>
        <AppText style={styles.userNameText}>نام و نام خانوادگی</AppText>
        <AppText style={styles.userNameMobileText}>
          {toPersianDigits("09131234567")}
        </AppText>
        <FlatList
          style={styles.flatList}
          data={profileItems}
          keyExtractor={(profileItems) => profileItems.id.toString()}
          renderItem={({ item }) => (
            <ProfileListItem
              title={item.title}
              icon={item.icon}
              screenName={item.screenName}
            />
          )}
          scrollEnabled={false}
        />
        <View style={{ marginHorizontal: 15 }}>
          <AppButton
            title={"ثبت دوره ی جدید"}
            onPress={() => navigation.navigate("AddNewCourse")}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  flatList: {
    marginTop: 30,
  },
  profilePhoto: {
    width: 150,
    height: 150,
    alignSelf: "center",
    marginVertical: 50,
  },
  userNameText: {
    textAlign: "center",
    fontSize: 25,
    fontFamily: "Yekan_Bakh_Bold",
  },
  userNameMobileText: {
    textAlign: "center",
    marginTop: 5,
  },
});

export default ProfileScreeen;
