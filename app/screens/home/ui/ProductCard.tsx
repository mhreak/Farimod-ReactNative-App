import { View, Image, TouchableOpacity } from "react-native";
import { styles } from "../styles/styles";
import AppText from "../../../components/Text";
import {
  toPersianDigits,
  safeNumber,
  formatPrice,
  safeString,
} from "../../../utils/converters";
import { Product } from "../../../types/home/home.types";
import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";

export const ProductCard = React.memo(
  ({
    item,
    onPress,
  }: {
    item: Product;
    onPress?: (product: Product) => void;
  }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [imageKey, setImageKey] = useState(0);
    const [lastUrl, setLastUrl] = useState(item.FeaturedImageURL);

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    if (item.FeaturedImageURL !== lastUrl) {
      setLastUrl(item.FeaturedImageURL);
      setImageError(false);
      setImageLoaded(false);
      setRetryCount(0);
      setImageKey(0);
      if (timerRef.current) clearTimeout(timerRef.current);
    }

    const { price, specialPrice, discountPercentage } = useMemo(() => {
      const p = safeNumber(item.Price);
      const sp = safeNumber(item.SpecialSalePrice);
      const discount = p > 0 && sp > 0 ? Math.round(((p - sp) / p) * 100) : 0;
      return { price: p, specialPrice: sp, discountPercentage: discount };
    }, [item.Price, item.SpecialSalePrice]);

    const handlePress = useCallback(() => {
      if (onPress) {
        onPress(item);
      }
    }, [item, onPress]);

    const handleImageError = useCallback(() => {
      const maxRetries = 3;
      if (retryCount < maxRetries) {
        timerRef.current = setTimeout(
          () => {
            setRetryCount((prev) => prev + 1);
            setImageKey((prev) => prev + 1);
          },
          1000 * (retryCount + 1),
        );
      } else {
        setImageError(true);
      }
    }, [retryCount]);

    const handleImageLoad = useCallback(() => {
      setImageLoaded(true);
    }, []);

    useEffect(() => {
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, []);

    const hasValidImage = item.FeaturedImageURL && !imageError;

    return (
      <TouchableOpacity
        style={styles.productCard}
        activeOpacity={0.8}
        onPress={handlePress}
      >
        <View style={styles.productImageContainer}>
          {!imageLoaded && (
            <Image
              source={require("../../../../assets/Product_icon.jpg")}
              style={styles.productImage}
            />
          )}

          {hasValidImage && (
            <Image
              key={imageKey}
              source={{ uri: `${item.FeaturedImageURL}?retry=${imageKey}` }}
              style={[
                styles.productImage,
                !imageLoaded && { position: "absolute", opacity: 0 },
              ]}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}

          {discountPercentage > 0 && (
            <View style={styles.discountBadge}>
              <AppText style={styles.discountText}>
                {toPersianDigits(discountPercentage.toString())}% تخفیف
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
            {safeString(item.ProductName, "نام محصول")}
          </AppText>

          <View style={styles.priceContainer}>
            {discountPercentage > 0 ? (
              <>
                <AppText style={styles.originalPrice}>
                  {formatPrice(price)}
                </AppText>
                <AppText style={styles.specialPrice}>
                  {formatPrice(specialPrice)}
                </AppText>
              </>
            ) : (
              <AppText style={styles.productPrice}>
                {formatPrice(price)}
              </AppText>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.item.ProductId === nextProps.item.ProductId &&
      prevProps.item.Price === nextProps.item.Price &&
      prevProps.item.SpecialSalePrice === nextProps.item.SpecialSalePrice &&
      prevProps.item.Active === nextProps.item.Active &&
      prevProps.item.ProductName === nextProps.item.ProductName &&
      prevProps.item.FeaturedImageURL === nextProps.item.FeaturedImageURL
    );
  },
);
