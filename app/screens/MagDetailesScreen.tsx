import React from "react";
import AppText from "../components/Text";
import { useNavigation } from "@react-navigation/native";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import colors from "../config/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const MagDetailesScreen = ({ route }) => {
  const navigation = useNavigation();
  const { title } = route.params;
  return (
    <ScrollView>
      <Image
        style={styles.itemImage}
        source={require("../../assets/sample_clothe.jpg")}
      />
      <View style={styles.textContainer}>
        <AppText style={styles.titleText}>{title}</AppText>
        <AppText style={styles.bodyText}>
          لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده
          از طراحان گرافیک است. چاپگرها و متون بلکه روزنامه و مجله در ستون و
          سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی مورد نیاز و کاربردهای
          متنوع با هدف بهبود ابزارهای کاربردی می باشد. کتابهای زیادی در شصت و سه
          درصد گذشته، حال و آینده شناخت فراوان جامعه و متخصصان را می طلبد تا با
          نرم افزارها شناخت بیشتری را برای طراحان رایانه ای علی الخصوص طراحان
          خلاقی و فرهنگ پیشرو در زبان فارسی ایجاد کرد. در این صورت می توان امید
          داشت که تمام و دشواری موجود در ارائه راهکارها و شرایط سخت تایپ به
          پایان رسد و زمان مورد نیاز شامل حروفچینی دستاوردهای اصلی و جوابگوی
          سوالات پیوسته اهل دنیای موجود طراحی اساسا مورد استفاده قرار گیرد.
        </AppText>
      </View>
      <View
        style={{
          flexDirection: "row-reverse",
          gap: 10,
          alignItems: "center",
          marginRight: 25,
          marginVertical: 10,
        }}
      >
        <MaterialIcons name="calendar-month" size={17} color="black" />
        <AppText style={{ fontSize: 15 }}>۱۴۰۳/۱۱/۲۹</AppText>
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  itemImage: {
    resizeMode: "cover",
    width: "100%",
    height: 200,
  },
  titleText: {
    fontFamily: "Yekan_Bakh_Bold",
    marginBottom: 10,
    textAlign: "justify",
    direction: "rtl",
  },
  textContainer: {
    paddingHorizontal: 25,
    paddingTop: 25,
    borderBottomWidth: 1,
    borderBlockColor: colors.gray,
  },
  bodyText: {
    textAlign: "justify",
    direction: "rtl",
    lineHeight: 35,
  },
});
export default MagDetailesScreen;
