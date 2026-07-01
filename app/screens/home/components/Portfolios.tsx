import React, { useEffect, useRef, useState, useMemo } from "react";
import { View } from "react-native";
import { styles } from "../styles/styles";
import { MaterialIcons } from "@expo/vector-icons";
import AppText from "../../../components/Text";
import { useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import { Portfolio } from "../../../types/home/home.types";
import { usePortfolios } from "../../../hooks/home/useHomeData";
import PagerView from "react-native-pager-view";
import { UseAutoScroll } from "../../../hooks/useAutoScroll";
import { AUTO_SCROLL_INTERVALS } from "../contants/AUTO_SCROLL_INTERVALS";
import { RenderSectionHeader } from "../ui/rendering/RenderSectionHeader";
import { RenderErrorBlock } from "../ui/rendering/RenderErrorBlock";
import useToast from "../../../hooks/useToast";
import { AppNavigationProp } from "../../../navigation/types";
import { PortfolioCardSkeleton } from "../ui/skeleton/PortfolioCardSkeleton";
import { PortfolioCard } from "../ui/PortfolioCard";

const Portfolios = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const {
    data: portfolios = [],
    loading: portfoliosLoading,
    error: portfoliosError,
    refetch: refetchPortfolios,
  } = usePortfolios();
  
  const portfolioPagerRef = useRef<PagerView>(null);
  const { showToast } = useToast();

  const [currentPortfolioPage, setCurrentPortfolioPage] = useState(0);
  const totalPortfolioPages = portfolios ? Math.ceil(portfolios.length / 2) : 0;

  UseAutoScroll(
    portfolioPagerRef,
    totalPortfolioPages,
    AUTO_SCROLL_INTERVALS.portfolios,
    setCurrentPortfolioPage
  );

  // useEffect(() => {
  //   refetchPortfolios();
  // }, []);

  useEffect(() => {
    if (portfoliosError) {
      showToast(
        "خطا در دریافت اطلاعات نمونه کارها. لطفاً دوباره تلاش کنید.",
        "error"
      );
    }
  }, [portfoliosError]);

  const handlePortfolioPress = useCallback(
    (portfolioData: Portfolio) => {
      const portfolioId = portfolioData.PortfolioId || portfolioData.PotfolioId;
      if (!portfolioId || portfolioId === 0) {
        showToast("خطا: شناسه نمونه کار نامعتبر است", "error");
        return;
      }
      requestAnimationFrame(() => {
        try {
          navigation.navigate("PortfolioDetail", {
            title: portfolioData.Title,
            portfolioId,
          });
        } catch {
          showToast("خطا در باز کردن نمونه کار", "error");
        }
      });
    },
    [navigation, showToast]
  );

  const handleViewAllPortfolios = useCallback(() => {
    requestAnimationFrame(() => (navigation as any).navigate("AllPortfolio"));
  }, [navigation]);

  const portfolioPages = useMemo(() => {
    if (portfoliosLoading) {
      return Array.from({ length: 2 }, (_, i) => (
        <View key={`pf-skel-${i}`} style={{ transform: [{ scaleX: -1 }] }}>
          <View style={styles.portfolioGrid}>
            {Array.from({ length: 2 }, (_, j) => (
              <View key={`pf-skel-${i}-${j}`} style={styles.portfolioWrapper}>
                <PortfolioCardSkeleton />
              </View>
            ))}
          </View>
        </View>
      ));
    }

    if (!portfolios || portfolios.length === 0) {
      return [
        <View key="no-pf" style={{ transform: [{ scaleX: -1 }] }}>
          <View style={styles.noPortfolioContainer}>
            <MaterialIcons name="brush" size={48} color="#9e9e9e" />
            <AppText style={styles.noPortfolioText}>
              هیچ نمونه کاری موجود نیست
            </AppText>
          </View>
        </View>,
      ];
    }

    const reversed = [...portfolios].reverse();
    const pages = [];
    for (let i = 0; i < reversed.length; i += 2) {
      pages.push(
        <View key={`pf-page-${i}`} style={{ transform: [{ scaleX: -1 }] }}>
          <View style={styles.portfolioGrid}>
            {reversed.slice(i, i + 2).map((portfolio, idx) => {
              const id = portfolio.PortfolioId || portfolio.PotfolioId;
              return (
                <View
                  key={`pf-${id}-p${Math.floor(i / 2)}-${idx}`}
                  style={styles.portfolioWrapper}
                >
                  <PortfolioCard
                    item={portfolio}
                    onPress={handlePortfolioPress}
                  />
                </View>
              );
            })}
          </View>
        </View>
      );
    }
    return pages;
  }, [portfolios, portfoliosLoading, handlePortfolioPress]);

  return (
    <>
      <RenderSectionHeader
        label="جدیدترین نمونه کارها"
        dotColor="#9370DB"
        loading={portfoliosLoading}
        hasError={!!portfoliosError}
        onViewAll={handleViewAllPortfolios}
      />
      {portfoliosError ? (
        <RenderErrorBlock
          message="خطا در دریافت اطلاعات نمونه کارها"
          onRetry={refetchPortfolios}
        />
      ) : (
        <PagerView
          ref={portfolioPagerRef}
          initialPage={0}
          layoutDirection="rtl"
          pageMargin={20}
          style={[
            { transform: [{ scaleX: -1 }] },
            { minHeight: 300, marginBottom: 20 },
          ]}
          onPageSelected={(e) =>
            setCurrentPortfolioPage(e.nativeEvent.position)
          }
        >
          {portfolioPages}
        </PagerView>
      )}
    </>
  );
};

export default React.memo(Portfolios);