import React, { useState } from "react";
import {

  View,

  Image,
} from "react-native";

import { styles } from "../styles/styles";


export const PortfolioImageComponent = ({ item }:any) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const hasValidImage = item.FeaturedImageURL &&
    !item.FeaturedImageURL.endsWith('/') &&
    item.FeaturedImageURL.trim() !== '';

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  if (!hasValidImage || imageError) {
    return (
      <View style={styles.portfolioImageContainer}>
        <View style={styles.portfolioImagePlaceholder}>
          <Image
            style={styles.portfolioDefaultImage}
            source={require("../../../../assets/portfolio_icon.jpg")}
            resizeMode="cover"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.portfolioImageContainer}>
      <Image
        source={{ uri: item.FeaturedImageURL }}
        style={styles.portfolioImage}
        onError={handleImageError}
        onLoad={handleImageLoad}
        resizeMode="cover"
      />
    </View>
  );
};