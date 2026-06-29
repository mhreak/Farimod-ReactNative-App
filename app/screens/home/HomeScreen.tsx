import React, {
  useEffect,
  useState,
  useCallback,
} from "react";
import { View, ScrollView, Image, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AppText from "../../components/Text";
import { useNavigation } from "@react-navigation/native";
import MainBackground from "../../components/MainBackground";
import { AppNavigationProp } from "../../navigation/types";
import Toast from "../../components/Toast";
import MenuModal from "../../components/MenuModal";
import { useAuth } from "../../contexts/AuthContext";
import { CommonActions } from "@react-navigation/native";
import { useAppUpdate } from "../../contexts/AppUpdateContext";
import { styles } from "./styles/styles";
import { HomeSlides } from "./components/Slide";
import useToast from "../../hooks/useToast";
import { MemberGroup } from "./components/MemberGroup";
import { Courses } from "./components/Courses";
import { Products } from "./components/Products";
import { Blog } from "./components/Blog";
import { Portfolios } from "./components/Portfolios";
import { Gallery } from "./components/Gellery";
import { Members } from "./components/Member";

const HomeScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { logout } = useAuth();
  const { setHomeScreenStatus } = useAppUpdate();
  const { showToast, toastVisible, toastMessage, toastType, setToastVisible } =
    useToast();

  const [showMenuModal, setShowMenuModal] = useState(false);

  useEffect(() => {
    setHomeScreenStatus(true);
    return () => setHomeScreenStatus(false);
  }, [setHomeScreenStatus]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      showToast("با موفقیت خارج شدید", "success");
      navigation.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: "Login" }] }),
      );
    } catch {
      showToast("خطا در خروج از حساب کاربری", "error");
    }
  }, [logout, navigation, showToast]);

  const handleMenuNavigation = useCallback(
    (screen: string) => {
      if (screen === "LOGOUT") handleLogout();
      else (navigation as any).navigate(screen as keyof RootStackParamList);
    },
    [handleLogout, navigation],
  );

  const handleHideToast = useCallback(() => setToastVisible(false), []);
  const handleOpenMenu = useCallback(() => setShowMenuModal(true), []);
  const handleCloseMenu = useCallback(() => setShowMenuModal(false), []);

  return (
    <View style={styles.container}>
      <MainBackground />

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={handleHideToast}
      />

      <TouchableOpacity style={styles.frameButton} onPress={() => {}}>
        <View style={styles.frameButtonContainer}>
          <Image
            source={require("../../../assets/main-icon.png")}
            style={styles.frameImage}
          />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.notificationButton}
        onPress={handleOpenMenu}
      >
        <View style={styles.notificationButtonContainer}>
          <MaterialIcons name="menu" size={24} color="#6366f1" />
        </View>
      </TouchableOpacity>

      <View style={styles.headerContainer}>
        <View style={styles.titleWrapper}>
          <AppText style={styles.headerTitle}>فریمد</AppText>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <HomeSlides />
        <MemberGroup />
        <Courses />
        <Products />
        <Blog />
        <Portfolios />
        <Gallery/>
        <Members/>
      </ScrollView>
      <MenuModal
        visible={showMenuModal}
        onClose={handleCloseMenu}
        onNavigate={handleMenuNavigation}
        showToast={showToast}
      />
    </View>
  );
};
export default HomeScreen;
