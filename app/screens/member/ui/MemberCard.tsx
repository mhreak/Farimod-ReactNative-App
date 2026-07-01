import React from "react";
import AppText from "../../../components/Text";
import {

  View,

  TouchableOpacity,

} from "react-native";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { safeString } from "../../../utils/converters";
import { styles } from "../styles/styles";
import { Avatar } from "./Avatar";

export const MemberCard =React.memo( ({ member, onPress }:any) => {
  return (
    <TouchableOpacity
      style={styles.memberCard}
      onPress={() => onPress(member)}
      activeOpacity={0.8}
    >

      <View style={styles.memberContent}>
        <Avatar
          name={member.Name}
          size={80}
          member={member}
          onPress={() => onPress(member)}
        />

        <View style={styles.memberInfo}>
          <AppText style={styles.memberName} numberOfLines={1}>
            {safeString(member.Name, 'نام کاربر')}
          </AppText>

          <View style={styles.memberGroupContainer}>
            {member.MemberGroupsStr ? (
              <View style={styles.memberDetailRow}>
                <AppText style={styles.memberDetail} numberOfLines={2} ellipsizeMode="tail">
                  {member.MemberGroupsStr}
                </AppText>
              </View>
            ) : (
              <View style={styles.memberDetailRow}>
                <MaterialIcons name="group" size={16} color="#ccc" />
                <AppText style={styles.memberDetailPlaceholder}>
                  گروه تعریف نشده
                </AppText>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});