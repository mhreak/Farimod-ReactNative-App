import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  View,
  TouchableOpacity,
} from "react-native";
import { styles } from "../styles/styles";
import { MaterialIcons } from "@expo/vector-icons";
import AppText from "../../../components/Text";
import { useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import {
  BlogPost,
} from "../../../types/home/home.types";
import {
  useBlogPosts,
} from "../../../hooks/home/useHomeData";
import colors from "../../../config/colors";
import PagerView from "react-native-pager-view";
import { UseAutoScroll } from "../../../hooks/useAutoScroll";
import { AUTO_SCROLL_INTERVALS } from "../contants/AUTO_SCROLL_INTERVALS";
import { RenderSectionHeader } from "../ui/rendering/RenderSectionHeader";
import { RenderErrorBlock } from "../ui/rendering/RenderErrorBlock";
import useToast from "../../../hooks/useToast";
import { AppNavigationProp } from "../../../navigation/types";
import { BlogPostCard } from "../ui/BlogPostCard";
import { BlogPostCardSkeleton } from "../ui/skeleton/BlogPostCardSkeleton";

export const Blog = () => {
  const navigation = useNavigation<AppNavigationProp>();

  const {
    data: blogPosts=[],
    loading: blogPostsLoading,
    error: blogPostsError,
    refetch: refetchBlogPosts,
  } = useBlogPosts();
  const blogPostPagerRef = useRef<PagerView | null>(null);
  const { showToast } = useToast();

  const [currentBlogPostPage, setCurrentBlogPostPage] = useState(0);
  const totalBlogPostPages = Math.max(1, blogPosts.length);
  UseAutoScroll(
    blogPostPagerRef,
    totalBlogPostPages,
    AUTO_SCROLL_INTERVALS.blogPosts,
    setCurrentBlogPostPage,
  );

  useEffect(() => {
    refetchBlogPosts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (blogPostsError)
      showToast(
        "خطا در دریافت اطلاعات مقالات. لطفاً دوباره تلاش کنید.",
        "error",
      );
  }, [blogPostsError]);

  const handleBlogPostPress = useCallback(
    (postData: BlogPost) => {
      requestAnimationFrame(() => {
        try {
          navigation.navigate("MagDetailes", {
            title: postData.Title,
            blogId: postData.BlogPostId,
          });
        } catch {
          showToast("خطا در باز کردن مقاله", "error");
        }
      });
    },
    [navigation, showToast],
  );

  const handleViewAllBlogPosts = useCallback(() => {
    requestAnimationFrame(() => (navigation as any).navigate("وبلاگ"));
  }, [navigation]);

  const blogPostPages = useMemo(() => {
    if (blogPostsLoading) {
      return Array.from({ length: 3 }, (_, i) => (
        <View key={`bp-skel-${i}`} style={{ transform: [{ scaleX: -1 }] }}>
          <BlogPostCardSkeleton />
        </View>
      ));
    }
    if (blogPosts.length === 0) {
      return [
        <View key="no-bp" style={{ transform: [{ scaleX: -1 }] }}>
          <View style={styles.noBlogPostContainer}>
            <MaterialIcons name="article" size={48} color="#9e9e9e" />
            <AppText style={styles.noBlogPostText}>
              هیچ مقاله‌ای موجود نیست
            </AppText>
          </View>
        </View>,
      ];
    }
    return [...blogPosts].reverse().map((post) => (
      <View
        key={`bp-${post.BlogPostId}`}
        style={{ transform: [{ scaleX: -1 }] }}
      >
        <TouchableOpacity onPress={() => handleBlogPostPress(post)} activeOpacity={0.8}>
            <BlogPostCard item={post} onPress={handleBlogPostPress} />
        </TouchableOpacity>
      </View>
    ));
  }, [blogPosts, blogPostsLoading, handleBlogPostPress]);

  return (
    <>
      <RenderSectionHeader
        label="جدیدترین مقالات"
        dotColor={colors.primary}
        loading={blogPostsLoading}
        hasError={!!blogPostsError}
        onViewAll={handleViewAllBlogPosts}
      />
      {blogPostsError ? (
        <RenderErrorBlock
          message="خطا در دریافت اطلاعات مقالات"
          onRetry={refetchBlogPosts}
        />
      ) : (
        <PagerView
          ref={blogPostPagerRef}
          initialPage={0}
          layoutDirection="rtl"
          pageMargin={20}
          style={[
            { transform: [{ scaleX: -1 }] },
            { minHeight: 330, marginBottom: 20 },
          ]}
          onPageSelected={(e) => setCurrentBlogPostPage(e.nativeEvent.position)}
        >
          {blogPostPages}
        </PagerView>
      )}
    </>
  );
};
