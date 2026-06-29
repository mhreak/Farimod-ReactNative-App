import React, { useEffect, useRef, useState, useMemo } from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { styles } from "../styles/styles";
import { MaterialIcons } from "@expo/vector-icons";
import AppText from "../../../components/Text";
import { useHomePageSlideNavigator, ClickableSlide } from "../../../components/useHomePageSlideNavigator";
import { useCallback } from "react";
import { useHomePageSlides } from "../../../hooks/home/useHomeData";
import { HeaderSliderSkeleton } from "../ui/skeleton/HeaderSliderSkeleton";
import colors from "../../../config/colors";
import PagerView from "react-native-pager-view";
import { UseAutoScroll } from "../../../hooks/useAutoScroll";
import { AUTO_SCROLL_INTERVALS } from "../contants/AUTO_SCROLL_INTERVALS";
import useToast from "../../../hooks/useToast";

export const HomeSlides = () => {
  const pagerRef2 = useRef<PagerView | null>(null);
  const [currentPage2, setCurrentPage2] = useState(0);
  
  const { data: slides = [], loading: slidesLoading, error: slidesError, refetch: refetchSlides } = useHomePageSlides();
  const { isSlideClickable } = useHomePageSlideNavigator();
  const { showToast } = useToast();

  const totalSlidePages = slides ? slides.length : 0;

  UseAutoScroll(
    pagerRef2,
    totalSlidePages,
    AUTO_SCROLL_INTERVALS.slides,
    setCurrentPage2
  );

  useEffect(() => {
    if (slidesError) {
      showToast("خطا در دریافت اطلاعات اسلایدر. لطفاً دوباره تلاش کنید.", "error");
    }
  }, [slidesError]);

  useEffect(() => {
    refetchSlides();
  }, []);

  const slidePages = useMemo(() => {
    if (!slides || slides.length === 0) return [];
    return slides.map((slide) => (
      <View key={slide.HomePageSlideId} style={{ transform: [{ scaleX: -1 }] }}>
        <ClickableSlide
          slideData={slide}
          showToast={showToast}
          activeOpacity={isSlideClickable(slide) ? 0.8 : 1}
          onSlidePress={() => {}}
        >
          <Image
            style={styles.headerBox}
            source={{ uri: slide.ImageURL }}
            resizeMode="cover"
          />
        </ClickableSlide>
      </View>
    ));
  }, [slides, showToast, isSlideClickable]);

  const handlePrevSlide = useCallback(() => {
    const newPage = currentPage2 > 0 ? currentPage2 - 1 : totalSlidePages - 1;
    pagerRef2.current?.setPage(newPage);
  }, [currentPage2, totalSlidePages]);

  const handleNextSlide = useCallback(() => {
    const newPage = currentPage2 < totalSlidePages - 1 ? currentPage2 + 1 : 0;
    pagerRef2.current?.setPage(newPage);
  }, [currentPage2, totalSlidePages]);

  return (
    <>
      {slidesLoading ? (
        <HeaderSliderSkeleton />
      ) : slidesError ? (
        <View style={styles.errorSliderContainer}>
          <MaterialIcons name="error" size={48} color="#9e9e9e" />
          <AppText style={styles.errorSliderText}>خطا در دریافت اسلایدر</AppText>
          <TouchableOpacity style={styles.retryButton} onPress={refetchSlides}>
            <MaterialIcons name="refresh" size={20} color={colors.white} />
            <AppText style={styles.retryButtonText}>تلاش مجدد</AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.sliderContainer}>
          <PagerView
            ref={pagerRef2}
            style={[{ minHeight: 200 }, { transform: [{ scaleX: -1 }] }]}
            initialPage={0}
            layoutDirection="ltr"
            pageMargin={20}
            onPageSelected={(e) => setCurrentPage2(e.nativeEvent.position)}
            overScrollMode="never"
          >
            {slidePages}
          </PagerView>
          {totalSlidePages > 1 && (
            <>
              <TouchableOpacity style={styles.sliderArrowRight} onPress={handlePrevSlide} activeOpacity={0.7}>
                <View style={styles.arrowIconContainer}>
                  <MaterialIcons name="chevron-right" size={28} color="#fff" />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sliderArrowLeft} onPress={handleNextSlide} activeOpacity={0.7}>
                <View style={styles.arrowIconContainer}>
                  <MaterialIcons name="chevron-left" size={28} color="#fff" />
                </View>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </>
  );
};