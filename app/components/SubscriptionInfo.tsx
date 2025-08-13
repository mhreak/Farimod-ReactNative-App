import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import AppText from '../components/Text';
import { toPersianDigits } from '../utils/converters';
import PermissionService from '../services/PermissionService';

const SubscriptionInfo = ({ user, onUpgradePress }) => {
  const subscriptionInfo = PermissionService.getSubscriptionInfo(user);
  const isActive = PermissionService.isSubscriptionActive(user);
  const subscriptionLevel = PermissionService.getSubscriptionLevel(user);

  if (!subscriptionInfo) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#ff4444', '#cc0000']}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <MaterialIcons name="error" size={24} color="white" />
            <AppText style={styles.planName}>بدون اشتراک</AppText>
          </View>
          <AppText style={styles.noSubscriptionText}>
            هیچ اشتراک فعالی ندارید
          </AppText>
          <TouchableOpacity style={styles.upgradeButton} onPress={onUpgradePress}>
            <AppText style={styles.upgradeButtonText}>خرید اشتراک</AppText>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  // انتخاب رنگ بر اساس وضعیت
  const getGradientColors = () => {
    if (!isActive) return ['#ff9800', '#e65100'];
    if (subscriptionInfo.remainingDays < 7) return ['#ff5722', '#d84315'];
    return ['#4CAF50', '#2E7D32'];
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getGradientColors()}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <MaterialIcons 
            name={isActive ? 'verified' : 'warning'} 
            size={24} 
            color="white" 
          />
          <AppText style={styles.planName}>{subscriptionInfo.planName}</AppText>
          {subscriptionInfo.isInfinity && (
            <View style={styles.infinityBadge}>
              <MaterialIcons name="all-inclusive" size={16} color="white" />
            </View>
          )}
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoRow}>
            <AppText style={styles.label}>شروع:</AppText>
            <AppText style={styles.value}>{subscriptionInfo.startDate}</AppText>
          </View>

          {!subscriptionInfo.isInfinity && (
            <>
              <View style={styles.infoRow}>
                <AppText style={styles.label}>پایان:</AppText>
                <AppText style={styles.value}>{subscriptionInfo.finishDate}</AppText>
              </View>

              <View style={styles.infoRow}>
                <AppText style={styles.label}>باقی‌مانده:</AppText>
                <AppText style={[
                  styles.value, 
                  { color: subscriptionInfo.remainingDays < 7 ? '#ffeb3b' : 'white' }
                ]}>
                  {toPersianDigits(subscriptionInfo.remainingDays)} روز
                </AppText>
              </View>
            </>
          )}

          {subscriptionInfo.subscriptionPrice > 0 && (
            <View style={styles.infoRow}>
              <AppText style={styles.label}>قیمت:</AppText>
              <AppText style={styles.value}>
                {toPersianDigits(subscriptionInfo.finalAmount.toLocaleString())} تومان
              </AppText>
            </View>
          )}
        </View>

        {/* نمایش سطح اشتراک */}
        <View style={styles.levelContainer}>
          <AppText style={styles.levelText}>
            سطح: {subscriptionLevel === 'none' ? 'پایه' : 
                  subscriptionLevel === 'basic' ? 'ابتدایی' :
                  subscriptionLevel === 'premium' ? 'پیشرفته' : 'نامحدود'}
          </AppText>
        </View>

        {/* دکمه ارتقا یا تمدید */}
        {((!isActive || subscriptionInfo.remainingDays < 7) && !subscriptionInfo.isInfinity) && (
          <TouchableOpacity style={styles.upgradeButton} onPress={onUpgradePress}>
            <AppText style={styles.upgradeButtonText}>
              {isActive ? 'تمدید اشتراک' : 'فعال‌سازی اشتراک'}
            </AppText>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  gradient: {
    padding: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  planName: {
    fontSize: 18,
    fontFamily: 'Yekan_Bakh_Bold',
    color: 'white',
    marginLeft: 8,
    flex: 1,
  },
  infinityBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  infoGrid: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 3,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Yekan_Bakh_Regular',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  value: {
    fontSize: 14,
    fontFamily: 'Yekan_Bakh_Bold',
    color: 'white',
  },
  levelContainer: {
    alignItems: 'center',
    marginVertical: 8,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
  },
  levelText: {
    fontSize: 14,
    fontFamily: 'Yekan_Bakh_Bold',
    color: 'white',
  },
  upgradeButton: {
    marginTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  upgradeButtonText: {
    fontSize: 14,
    fontFamily: 'Yekan_Bakh_Bold',
    color: 'white',
  },
  noSubscriptionText: {
    fontSize: 16,
    fontFamily: 'Yekan_Bakh_Regular',
    color: 'white',
    textAlign: 'center',
    marginVertical: 12,
  },
});

export default SubscriptionInfo;

