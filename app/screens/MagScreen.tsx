import React, { useState } from "react";
import AppText from "../components/Text";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import MainBackground from "../components/MainBackground";
import colors from "../config/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

interface IData {
  id: number;
  name: string;
  date?: string;
}

const MagScreen = () => {
  const navigation = useNavigation();

  // const [data, setData] = useState([]); // Holds the loaded data
  const [page, setPage] = useState(1); // Current page number
  const [loading, setLoading] = useState(false); // Loading state
  const [hasMore, setHasMore] = useState(true); // Whether more data is available
  const data = [
    {
      id: 1,
      name: "لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت.",
      date: "۱۴۰۳/۱۱/۲۹",
    },
    {
      id: 2,
      name: "item 2",
    },
    {
      id: 3,
      name: "item 3",
    },
    {
      id: 4,
      name: "item 4",
    },
    {
      id: 5,
      name: "item 5",
    },
    {
      id: 6,
      name: "item 6",
    },
    {
      id: 7,
      name: "item 7",
    },
    {
      id: 8,
      name: "item 7",
    },
    {
      id: 9,
      name: "item 7",
    },
    {
      id: 10,
      name: "item 7",
    },
    {
      id: 11,
      name: "item 7",
    },
  ];

  // Render each item in the list
  const renderItem = ({ item }: { item: IData }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate("MagDetailes", { title: item.name })}
    >
      <Image
        style={styles.itemImage}
        source={require("../../assets/sample_clothe.jpg")}
      />
      <AppText
        style={{
          textAlign: "justify",
          direction: "rtl",
          fontFamily: "Yekan_Bakh_Bold",
        }}
      >
        {item.name}
      </AppText>
      <View
        style={{ flexDirection: "row-reverse", gap: 10, alignItems: "center" }}
      >
        <MaterialIcons name="calendar-month" size={17} color="black" />
        <AppText style={{ fontSize: 15 }}>{item.date}</AppText>
      </View>
    </TouchableOpacity>
  );

  // Render a loading indicator at the bottom
  const renderFooter = () => {
    // if (!loading) return null;
    return (
      <ActivityIndicator
        style={{ marginVertical: 10 }}
        size="large"
        color={colors.primary}
      />
    );
  };

  return (
    <View>
      <MainBackground />
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        // onEndReached={fetchData} // Triggered when user reaches the end
        onEndReachedThreshold={0.5} // Load more data when 50% of the list is reached
        ListFooterComponent={renderFooter} // Show loading indicator
      />
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
    marginVertical: 5,
    gap: 10,
    display: "flex",
    justifyContent: "center",
    alignContent: "center",
  },
  itemImage: {
    resizeMode: "cover",
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
});

export default MagScreen;
