import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";

import AppText from "./Text";
import colors from "../config/colors";
import { MaterialIcons } from "@expo/vector-icons";

interface IProps {
  item: any;
  onPress: () => void;
  isSelected: boolean;
}

const PickerItem: React.FC<IProps> = ({ item, onPress, isSelected }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <AppText style={styles.text}>{item.label}</AppText>
      {isSelected && (
        <MaterialIcons
          name="circle"
          style={styles.icon}
          color={colors.primaryLight}
          size={18}
        ></MaterialIcons>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  text: {
    padding: 10,
  },
  container: {
    borderRadius: 16,
    borderBottomWidth: 1,
    borderColor: colors.primary,
    margin: 5,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  icon: {
    marginLeft: 15,
  },
});

export default PickerItem;
