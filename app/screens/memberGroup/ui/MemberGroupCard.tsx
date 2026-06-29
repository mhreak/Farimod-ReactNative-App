

import React, { useCallback } from "react";
import {

  View,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { safeString } from "../../../utils/converters";
import { MemberGroupType } from "../../../types/memberGroup/memberGroup.types";
import { styles } from "../styles/styles";
import AppText from "../../../components/Text";


export const MemberGroupCard = React.memo(({
  item,
  onPress,
  selectedGradient,
  selectedIcon
}: {
  item: MemberGroupType;
  onPress?: (group: MemberGroupType) => void;
  selectedGradient: string[];
  selectedIcon: string;
}) => {
  const handlePress = useCallback(() => {
    if (onPress) {
      onPress(item);
    }
  }, [onPress, item]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={!onPress}
      style={styles.groupCardWrapper}
    >
      <View style={styles.groupCard}>
        <LinearGradient
          colors={selectedGradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.groupGradient}
        >
          <View style={styles.groupContent}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={selectedIcon as any}
                size={38}
                color="rgba(0, 0, 0, 0.95)"
              />
            </View>

            <AppText style={styles.groupTitle} numberOfLines={2}>
              {safeString(item.GroupName, 'گروه بدون نام')}
            </AppText>


          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
});