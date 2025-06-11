import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";

import AppText from "./Text";

interface IProps {
  item: any;
  onPress: () => void;
}

const PickerItem: React.FC<IProps> = ({ item, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <AppText style={styles.text}>{item.label}</AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  text: {
    padding: 20,
  },
});

export default PickerItem;
