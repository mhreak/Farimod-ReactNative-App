import React, { memo, useMemo } from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AppText from "../../../components/Text";
import { safeString } from "../../../utils/converters";
import appConfig from "../../../config/config";
import { styles } from "../styles/styles";

const DEFAULT_IMAGE = require("../../../../assets/portfolio_icon.jpg");

export const PortfolioCard = memo(({ item, onPress }:any) => {
  
  const imageSource = useMemo(() => {
    if (item?.ImageFileName) {
      return { uri: `${appConfig.mobileApi}Portfolio/GetImage/${item.ImageFileName}` };
    }
    if (item?.FeaturedImageURL) {
      return { uri: item.FeaturedImageURL };
    }
    return DEFAULT_IMAGE;
  }, [item?.ImageFileName, item?.FeaturedImageURL]);

  const handlePress = () => {
    if (onPress) {
      onPress(item);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.portfolioCard} 
      activeOpacity={0.8} 
      onPress={handlePress}
    >
      <Image
        source={imageSource}
        style={styles.portfolioImage}
        fadeDuration={150} 
      />
      <View style={styles.portfolioOverlay}>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.portfolioGradient}
        >
          <View style={styles.portfolioContent}>
            <AppText style={styles.portfolioTitle} numberOfLines={2}>
              {safeString(item?.Title, 'عنوان پروژه')}
            </AppText>
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
});

PortfolioCard.displayName = 'PortfolioCard';