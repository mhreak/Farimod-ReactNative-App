import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  View,
} from "react-native";
import { styles } from "../styles/styles";
import { useNavigation } from "@react-navigation/native";
import {  useProducts } from "../../../config/useApi";
import { useCallback } from "react";
import colors from "../../../config/colors";
import PagerView from "react-native-pager-view";
import { UseAutoScroll } from "../../../hooks/useAutoScroll";
import { AUTO_SCROLL_INTERVALS } from "../contants/AUTO_SCROLL_INTERVALS";
import { RenderSectionHeader } from "../ui/rendering/RenderSectionHeader";
import { RenderErrorBlock } from "../ui/rendering/RenderErrorBlock";
import useToast from "../../../hooks/useToast";
import { AppNavigationProp } from "../../../navigation/types";
import { ProductCard } from "../ui/ProductCard";
import { ProductCardSkeleton } from "../ui/skeleton/ProductCardSkeleton";
import { Product } from "../../../types/home/home.types";

const Products = () => {
  const navigation = useNavigation<AppNavigationProp>();

  const {
    data: products=[],
    loading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useProducts();
  const productPagerRef = useRef<PagerView | null>(null);
  const { showToast } = useToast();

  const [currentProductPage, setCurrentProductPage] = useState(0);
  const totalProductPages = products ? Math.ceil(products.length / 2) : 0;
  UseAutoScroll(
    productPagerRef,
    totalProductPages,
    AUTO_SCROLL_INTERVALS.products,
    setCurrentProductPage,
  );

  // useEffect(() => {
  //   refetchProducts();
  // }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (productsError)
      showToast(
        "خطا در دریافت اطلاعات محصولات. لطفاً دوباره تلاش کنید.",
        "error",
      );
  }, [productsError]);

  const handleProductPress = useCallback(
    (productData: Product) => {
      requestAnimationFrame(() => {
        try {
          (navigation as any).navigate("ProductDetails", {
            productData,
            productId: productData.ProductId,
          });
        } catch {
          showToast("خطا در باز کردن جزئیات محصول", "error");
        }
      });
    },
    [navigation, showToast],
  );

  const handleViewAllProducts = useCallback(() => {
    requestAnimationFrame(() => (navigation as any).navigate("AllProducts"));
  }, [navigation]);

  const productPages = useMemo(() => {
    if (productsLoading) {
      return Array.from({ length: 2 }, (_, i) => (
        <View key={`prod-skel-${i}`} style={{ transform: [{ scaleX: -1 }] }}>
          <View style={styles.productGrid}>
            {Array.from({ length: 2 }, (_, j) => (
              <View key={`prod-skel-${i}-${j}`} style={styles.productWrapper}>
                <ProductCardSkeleton />
              </View>
            ))}
          </View>
        </View>
      ));
    }
    if (products.length === 0) return [];
    const reversed = [...products].reverse();
    const pages = [];
    for (let i = 0; i < reversed.length; i += 2) {
      pages.push(
        <View key={`product-page-${i}`} style={{ transform: [{ scaleX: -1 }] }}>
          <View style={styles.productGrid}>
            {reversed.slice(i, i + 2).map((product) => (
              <View
                key={`product-${product.ProductId}`}
                style={styles.productWrapper}
              >
                <ProductCard item={product} onPress={handleProductPress} />
              </View>
            ))}
          </View>
        </View>,
      );
    }
    return pages;
  }, [products, productsLoading, handleProductPress]);

  return (
    <>
      <RenderSectionHeader
        label="جدیدترین محصولات"
        dotColor={colors.primary}
        loading={productsLoading}
        hasError={!!productsError}
        onViewAll={handleViewAllProducts}
      />
      {productsError ? (
        <RenderErrorBlock
          message="خطا در دریافت اطلاعات محصولات"
          onRetry={refetchProducts}
        />
      ) : (
        <PagerView
          ref={productPagerRef}
          initialPage={0}
          layoutDirection="rtl"
          pageMargin={20}
          style={[
            { transform: [{ scaleX: -1 }] },
            { minHeight: 280, marginBottom: 20 },
          ]}
          onPageSelected={(e) => setCurrentProductPage(e.nativeEvent.position)}
        >
          {productPages}
        </PagerView>
      )}
    </>
  );
};
export default React.memo(Products)