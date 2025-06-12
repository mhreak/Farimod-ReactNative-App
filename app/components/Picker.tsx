import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Modal,
  Button,
  FlatList,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import Text from "./Text";
import defaultStyles from "../config/styles";
import PickerItem from "./PickerItem";
import Screen from "./Screen";
import AppButton from "./Button";
import colors from "../config/colors";
import AppText from "./Text";
import { LinearGradient } from "expo-linear-gradient";

interface IProps {
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  items: { value: string | number; label: string }[];
  numberOfColumns?: number;
  onSelectItem: (item: { value: string | number; label: string }) => void;
  PickerItemComponent?: React.ReactNode;
  placeholder: string;
  selectedItem?: any;
  width?: string;
  error?: string;
}

const AppPicker: React.FC<IProps> = ({
  icon,
  items,
  numberOfColumns = 1,
  onSelectItem,
  PickerItemComponent = PickerItem,
  placeholder,
  selectedItem,
  width = "100%",
  error,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <View style={{ marginBottom: 16 }}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(true)}>
          <View style={[styles.container, { width: width as any }]}>
            {icon && (
              <MaterialIcons
                name={icon}
                size={20}
                color={defaultStyles.colors.medium}
                style={styles.icon}
              />
            )}
            {selectedItem ? (
              <Text style={styles.text}>{selectedItem.label}</Text>
            ) : (
              <Text style={styles.placeholder}>{placeholder}</Text>
            )}

            <MaterialIcons
              name="arrow-drop-down"
              size={20}
              color={defaultStyles.colors.medium}
            />
          </View>
        </TouchableWithoutFeedback>
        {error && <AppText style={styles.errorText}>{error}</AppText>}
      </View>
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.mainContent}>
            <LinearGradient
              style={styles.headerContainer}
              colors={[colors.primaryLight, colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <AppText style={styles.headerText}>{placeholder}</AppText>
            </LinearGradient>
            <FlatList
              data={items}
              keyExtractor={(item) => item.value.toString()}
              numColumns={numberOfColumns}
              renderItem={({ item }) => (
                <PickerItem
                  item={item}
                  // label={item.label}
                  onPress={() => {
                    setModalVisible(false);
                    onSelectItem(item);
                  }}
                  isSelected={selectedItem.value === item.value}
                />
              )}
            />
            <View style={styles.bottonContainer}>
              <AppButton
                title="بستن"
                onPress={() => setModalVisible(false)}
                style={{ width: "80%", padding: 10 }}
                color={colors.danger}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: defaultStyles.colors.white,
    borderRadius: 16,
    flexDirection: "row-reverse",
    padding: 15,

    borderColor: colors.gray,
    borderWidth: 1,
  },
  icon: {
    marginLeft: 10,
    marginVertical: "auto",
    marginRight: -3,
  },
  placeholder: {
    color: defaultStyles.colors.medium,
    flex: 1,
    fontSize: 15,
  },
  text: {
    flex: 1,
    fontSize: 15,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  mainContent: {
    height: 420,
    width: "80%",
    backgroundColor: colors.light,
    borderRadius: 16,
  },
  bottonContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  headerContainer: {
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    padding: 12,
    marginBottom: 15,
  },
  headerText: {
    color: colors.light,
    fontFamily: "Yekan_Bakh_Bold",
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 5,
    textAlign: "right",
    marginRight: 5,
  },
});

export default AppPicker;
