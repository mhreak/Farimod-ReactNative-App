import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // یا پکیج مشابه
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppText from "../../../components/Text";
import {styles} from '../styles/styles'

export default function JobButton() {
  return (
   <TouchableOpacity activeOpacity={0.85} style={styles.buttonContainer}>
      <LinearGradient
        colors={['#7c3aed', '#a855f7', '#6366f1']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.buttonGradient}
      >
        <MaterialCommunityIcons name="briefcase-search-outline" size={26} color="#fff" />
        
        <View style={styles.buttonTextContainer}>
          <AppText style={styles.buttonTitle}>سایت‌های کاریابی پوشاک و جواهرات</AppText>
          <AppText style={styles.buttonSubtitle}>www.farimod.ir</AppText>
        </View>
        
        <MaterialCommunityIcons name="chevron-left" size={24} color="rgba(255, 255, 255, 0.8)" />
      </LinearGradient>
    </TouchableOpacity>
  );
}