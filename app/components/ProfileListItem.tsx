import React from "react";
import {
  StyleSheet,
  TouchableHighlight,
  TouchableNativeFeedback,
  TouchableNativeFeedbackBase,
  TouchableOpacity,
  View,
} from "react-native";
import AppText from "./Text";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import colors from "../config/colors";
import { useNavigation } from "@react-navigation/native";
import { AppNavigationProp, RootStackParamList } from "../Navigators";

interface IProps {
  title: string;
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  screenName: keyof RootStackParamList;
}

const ProfileListItem: React.FC<IProps> = ({ title, icon, screenName }) => {
  const navigation = useNavigation<AppNavigationProp>();
  return (
    <TouchableNativeFeedback onPress={() => navigation.navigate(screenName)}>
      <View style={styles.container}>
        <View style={styles.firstSection}>
          <MaterialIcons name={icon} size={30} color={colors.primary} />
          <AppText>{title}</AppText>
        </View>
        <MaterialIcons name={"chevron-left"} size={30} color={colors.primary} />
      </View>
    </TouchableNativeFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    margin: 8,
    marginHorizontal: 15,
    padding: 10,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    borderRadius: 20,
  },
  firstSection: {
    display: "flex",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
  },
});

export default ProfileListItem;
