import { Platform, TextStyle } from "react-native";

import colors from "./colors";

export default {
  colors,
  text: {
    color: colors.dark,
    fontSize: 18,
    // fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir",
    fontFamily: "Yekan_Bakh_Regular",
    textAlign: "right",
  } as const satisfies TextStyle,
  headerStyle: {
    backgroundColor: colors.primary,
    height: 110,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitleStyle: {
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 20,
    color: colors.white,
    marginTop: 10,
  },
};
