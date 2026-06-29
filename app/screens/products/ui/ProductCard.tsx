import React, { useState, useMemo } from "react";
import { View, TouchableOpacity, Image } from "react-native";
import AppText from "../../../components/Text";
import { toPersianDigits, safeNumber, formatPrice, safeString } from "../../../utils/converters";
import appConfig from "../../../config/config";
import { styles } from "../styles/styles";

export const ProductCard = React.memo(({ item, onPress }: any) => {
  const [imageError, setImageError] = useState(false);

  const productData = useMemo(() => {
    const price = safeNumber(item.Price);
    const specialPrice = safeNumber(item.SpecialSalePrice);
    const discount = specialPrice > 0 && price > 0 ? Math.round(((price - specialPrice) / price) * 100) : 0;
    
    return {
      price,
      specialPrice,
      discountPercentage: discount,
      formattedPrice: formatPrice(price),
      formattedSpecialPrice: formatPrice(specialPrice),
      displayTitle: safeString(item.ProductName, 'نام محصول'),
      formattedDiscount: toPersianDigits(discount.toString()) + '% تخفیف'
    };
  }, [item.Price, item.SpecialSalePrice, item.ProductName]);

  const imageSource = useMemo(() => {
    if (imageError) return require("../../../../assets/Product_icon.jpg");
    if (item.FeaturedImageURL) return { uri: item.FeaturedImageURL };
    if (item.FeaturedImageFileName)
      return { uri: `${appConfig.mobileApi}Product/GetProductImage/${item.FeaturedImageFileName}` };
    if (item.ProductImageFileName)
      return { uri: `${appConfig.mobileApi}Product/GetProductImage/${item.ProductImageFileName}` };
    return require("../../../../assets/Product_icon.jpg");
  }, [imageError, item.FeaturedImageURL, item.FeaturedImageFileName, item.ProductImageFileName]);

  return (
    <TouchableOpacity style={styles.productCard} activeOpacity={0.8} onPress={() => onPress(item)}>
      <View style={styles.productImageContainer}>
        <Image
          source={imageSource}
          style={styles.productImage}
          resizeMode="cover"
          onError={() => {
            console.log('خطا در بارگذاری تصویر محصول:', item.ProductName);
            setImageError(true);
          }}
          onLoad={() => { if (imageError) setImageError(false); }}
        />
        {productData.discountPercentage > 0 && (
          <View style={styles.discountBadge}>
            <AppText style={styles.discountText}>
              {productData.formattedDiscount}
            </AppText>
          </View>
        )}
        {!item.Active && (
          <View style={styles.unavailableBadge}>
            <AppText style={styles.unavailableText}>غیرفعال</AppText>
          </View>
        )}
      </View>

      <View style={styles.productContent}>
        <AppText style={styles.productTitle} numberOfLines={2}>
          {productData.displayTitle}
        </AppText>

        <View style={styles.priceSection}>
          {productData.discountPercentage > 0 ? (
            <View style={styles.priceContainer}>
              <AppText style={styles.originalPrice}>{productData.formattedPrice}</AppText>
              <AppText style={styles.specialPrice}>{productData.formattedSpecialPrice}</AppText>
            </View>
          ) : (
            <AppText style={styles.productPrice}>{productData.formattedPrice}</AppText>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});