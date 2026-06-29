import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  View,
} from "react-native";
import { styles } from "../styles/styles";
import { MaterialIcons } from "@expo/vector-icons";
import AppText from "../../../components/Text";
import { useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import {
  ImageGallery,
} from "../../../types/home/home.types";
import {
  useImageGalleries,
} from "../../../hooks/home/useHomeData";
import PagerView from "react-native-pager-view";
import { UseAutoScroll } from "../../../hooks/useAutoScroll";
import { AUTO_SCROLL_INTERVALS } from "../contants/AUTO_SCROLL_INTERVALS";
import { RenderSectionHeader } from "../ui/rendering/RenderSectionHeader";
import { RenderErrorBlock } from "../ui/rendering/RenderErrorBlock";
import useToast from "../../../hooks/useToast";
import { AppNavigationProp } from "../../../navigation/types";
import { GalleryCard } from "../ui/GalleryCard";
import { GalleryCardSkeleton } from "../ui/skeleton/GalleryCardSkeleton";

export const Gallery = () => {
  const navigation = useNavigation<AppNavigationProp>();

  const {
    data: galleries=[],
    loading: galleriesLoading,
    error: galleriesError,
    refetch: refetchGalleries,
  } = useImageGalleries();

  const galleryPagerRef = useRef<PagerView | null>(null);

  // ── Page indicator state (used only for dots, NOT for interval logic) ──────
  const [currentGalleryPage, setCurrentGalleryPage] = useState(0);
  const { showToast } = useToast();
  const totalGalleryPages = galleries ? Math.ceil(galleries.length / 2) : 0;

  UseAutoScroll(
    galleryPagerRef,
    totalGalleryPages,
    AUTO_SCROLL_INTERVALS.galleries,
    setCurrentGalleryPage,
  );

  useEffect(() => {
    refetchGalleries();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (galleriesError)
      showToast(
        "خطا در دریافت اطلاعات گالری‌ها. لطفاً دوباره تلاش کنید.",
        "error",
      );
  }, [galleriesError]);

  const handleGalleryPress = useCallback(
    (galleryData: ImageGallery) => {
      requestAnimationFrame(() => {
        try {
          (navigation as any).navigate("GalleryItem", {
            title: galleryData.Title,
            galleryId: galleryData.ImageGalleryId,
            galleryData,
          });
        } catch {
          showToast("خطا در باز کردن گالری", "error");
        }
      });
    },
    [navigation, showToast],
  );

  const handleViewAllGalleries = useCallback(() => {
    requestAnimationFrame(() => (navigation as any).navigate("AllGalleries"));
  }, [navigation]);

  const galleryPages = useMemo(() => {
    if (galleriesLoading) {
      return Array.from({ length: 2 }, (_, i) => (
        <View key={`gl-skel-${i}`} style={{ transform: [{ scaleX: -1 }] }}>
          <View style={styles.galleryGrid}>
            {Array.from({ length: 2 }, (_, j) => (
              <View key={`gl-skel-${i}-${j}`} style={styles.galleryWrapper}>
                <GalleryCardSkeleton />
              </View>
            ))}
          </View>
        </View>
      ));
    }
    if (galleries.length === 0) {
      return [
        <View key="no-gl" style={{ transform: [{ scaleX: -1 }] }}>
          <View style={styles.noGalleryContainer}>
            <MaterialIcons name="photo-library" size={48} color="#9e9e9e" />
            <AppText style={styles.noGalleryText}>
              هیچ گالری‌ای موجود نیست
            </AppText>
          </View>
        </View>,
      ];
    }
    const reversed = [...galleries].reverse();
    const pages = [];
    for (let i = 0; i < reversed.length; i += 2) {
      pages.push(
        <View key={`gallery-page-${i}`} style={{ transform: [{ scaleX: -1 }] }}>
          <View style={styles.galleryGrid}>
            {reversed.slice(i, i + 2).map((gallery) => (
              <View
                key={`gallery-${gallery.ImageGalleryId}`}
                style={styles.galleryWrapper}
              >
                <GalleryCard item={gallery} onPress={handleGalleryPress} />
              </View>
            ))}
          </View>
        </View>,
      );
    }
    return pages;
  }, [galleries, galleriesLoading, handleGalleryPress]);
  return (
    <>
      <RenderSectionHeader
        label="جدیدترین گالری‌ها"
        dotColor="#9C27B0"
        loading={galleriesLoading}
        hasError={!!galleriesError}
        onViewAll={handleViewAllGalleries}
      />
      {galleriesError ? (
        <RenderErrorBlock
          message="خطا در دریافت اطلاعات گالری‌ها"
          onRetry={refetchGalleries}
        />
      ) : (
        <PagerView
          ref={galleryPagerRef}
          initialPage={0}
          layoutDirection="rtl"
          pageMargin={20}
          style={[
            { transform: [{ scaleX: -1 }] },
            { minHeight: 200, marginBottom: 10 },
          ]}
          onPageSelected={(e) => setCurrentGalleryPage(e.nativeEvent.position)}
        >
          {galleryPages}
        </PagerView>
      )}
    </>
  );
};
