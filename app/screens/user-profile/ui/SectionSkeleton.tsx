import React, { memo, useCallback } from "react";
import { View, FlatList } from "react-native";
import { styles } from "../styles/styles";
import { SkeletonLoader } from "./SkeletonLoader";
import { PortfolioCardSkeleton } from "./PortfolioCardSkeleton";
import { CourseCardSkeleton } from "./CourseCardSkeleton";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import { GalleryCardSkeleton } from "./GalleryCardSkeleton";
import { BlogPostCardSkeleton } from "./BlogPostCardSkeleton";

const SKELETON_ITEMS = [{ id: "1" }, { id: "2" }, { id: "3" }];

export const SectionSkeleton = memo(({ title, cardType = "portfolio" }:any) => {
  
  const renderItem = useCallback(({ item }:any) => {
    return (
      <View style={{ marginRight: 15 }}>
        {cardType === "portfolio" && <PortfolioCardSkeleton />}
        {cardType === "course" && <CourseCardSkeleton />}
        {cardType === "product" && <ProductCardSkeleton />}
        {cardType === "gallery" && <GalleryCardSkeleton />}
        {cardType === "blog" && <BlogPostCardSkeleton />}
      </View>
    );
  }, [cardType]);

  const keyExtractor = useCallback((item:any) => `skeleton-${cardType}-${item.id}`, [cardType]);

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <SkeletonLoader width={20} height={20} borderRadius={10} style={{ marginRight: 8 }} />
          <SkeletonLoader width={100} height={18} borderRadius={9} />
        </View>
        <SkeletonLoader width={80} height={14} borderRadius={7} />
      </View>

      <FlatList
        data={SKELETON_ITEMS}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
        removeClippedSubviews={true}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={2}
      />
    </View>
  );
});

SectionSkeleton.displayName = "SectionSkeleton";