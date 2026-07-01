import React from "react";
import {
  View,
  TouchableOpacity,
} from "react-native";
import AppText from "../../../components/Text";
import { MaterialIcons } from "@expo/vector-icons";
import PermissionService from "../../../services/PermissionService";
import { styles  } from "../styles/styles";

export const ProfileCard =React.memo( ({ item, onPress, user, onShowPermissionModal }:any) => {
  const hasPermission = item.permission ? PermissionService.hasPermission(user, item.permission) : true;


  const handlePress = () => {
    if (!hasPermission) {
      onShowPermissionModal(item.permission, item.screenName);
      return;
    }
    onPress(item.screenName);
  };

  return (
    <TouchableOpacity
      style={[
        styles.profileCard,
        { borderColor: hasPermission ? item.color : '#ddd' }
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={[
        styles.glassCard,
        { backgroundColor: hasPermission ? `${item.color}15` : '#f5f5f5' }
      ]}>
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <MaterialIcons
              name={item.icon}
              size={36}
              color={hasPermission ? item.color : '#999'}
            />
            {!hasPermission && (
              <View style={styles.lockOverlay}>
                <MaterialIcons name="lock" size={16} color="#fff" />
              </View>
            )}
          </View>
          <AppText style={[
            styles.cardTitle,
            { color: hasPermission ? "#2c3e50" : "#999" }
          ]}>
            {item.title}
          </AppText>
        </View>

        {!hasPermission && (
          <View style={styles.upgradeTextVertical}>
            <AppText style={styles.upgradeTextRotated}>
              نیاز به ارتقای اشتراک
            </AppText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});