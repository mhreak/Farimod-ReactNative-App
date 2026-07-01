import React, { useEffect, useRef, useState, useMemo } from "react";
import { View } from "react-native";
import { styles } from "../styles/styles";
import { MaterialIcons } from "@expo/vector-icons";
import AppText from "../../../components/Text";
import { useNavigation } from "@react-navigation/native";
import CourseCard from "../../../components/CourseCard";
import { Course } from "../../../config/type";
import { useCourses } from "../../../config/useApi";
import { useCallback } from "react";
import PagerView from "react-native-pager-view";
import { UseAutoScroll } from "../../../hooks/useAutoScroll";
import { AUTO_SCROLL_INTERVALS } from "../contants/AUTO_SCROLL_INTERVALS";
import { RenderSectionHeader } from "../ui/rendering/RenderSectionHeader";
import { RenderErrorBlock } from "../ui/rendering/RenderErrorBlock";
import useToast from "../../../hooks/useToast";
import { AppNavigationProp } from "../../../navigation/types";
import { CourseCardSkeleton } from "../ui/skeleton/CourseCardSkeleton";

const Courses = () => {
  const {
    data: courses = [],
    loading: coursesLoading,
    error: coursesError,
    refetch: refetchCourses,
  } = useCourses();
  
  const { showToast } = useToast();
  const navigation = useNavigation<AppNavigationProp>();
  const coursePagerRef = useRef<PagerView | null>(null);
  const [currentCoursePage, setCurrentCoursePage] = useState(0);
  
  const totalCoursePages = courses ? Math.ceil(courses.length / 2) : 0;

  const handleViewAllCourses = useCallback(() => {
    requestAnimationFrame(() => (navigation as any).navigate("AllCourses"));
  }, [navigation]);

  UseAutoScroll(
    coursePagerRef,
    totalCoursePages,
    AUTO_SCROLL_INTERVALS.courses,
    setCurrentCoursePage
  );

  const handleCoursePress = useCallback(
    (courseData: Course) => {
      requestAnimationFrame(() => {
        try {
          navigation.navigate("CourseDetails", { courseData });
        } catch {
          showToast("خطا در باز کردن جزئیات دوره", "error");
        }
      });
    },
    [navigation, showToast]
  );

  const coursePages = useMemo(() => {
    if (coursesLoading) {
      return Array.from({ length: 2 }, (_, i) => (
        <View key={`cs-skel-${i}`} style={{ transform: [{ scaleX: -1 }] }}>
          <View style={styles.courseGrid}>
            {Array.from({ length: 2 }, (_, j) => (
              <View key={`cs-skel-${i}-${j}`} style={styles.courseWrapper}>
                <CourseCardSkeleton />
              </View>
            ))}
          </View>
        </View>
      ));
    }

    if (!courses || courses.length === 0) {
      return [
        <View key="no-courses" style={{ transform: [{ scaleX: -1 }] }}>
          <View style={styles.noCourseContainer}>
            <MaterialIcons name="school" size={48} color="#9e9e9e" />
            <AppText style={styles.noCourseText}>
              هیچ دوره‌ای موجود نیست
            </AppText>
          </View>
        </View>,
      ];
    }

    const pages = [];
    const reversed = [...courses].reverse();
    for (let i = 0; i < reversed.length; i += 2) {
      const pageCourses = reversed.slice(i, i + 2);
      pages.push(
        <View key={`course-page-${i}`} style={{ transform: [{ scaleX: -1 }] }}>
          <View style={styles.courseGrid}>
            {pageCourses.map((course, idx) => (
              <View
                key={`course-${course.CourseId}-${idx}`}
                style={styles.courseWrapper}
              >
                <CourseCard course={course} onPress={handleCoursePress} />
              </View>
            ))}
            {pageCourses.length === 1 && <View style={styles.courseWrapper} />}
          </View>
        </View>
      );
    }
    return pages;
  }, [courses, coursesLoading, handleCoursePress]);

  // useEffect(() => {
  //   refetchCourses();
  // }, []);

  useEffect(() => {
    if (coursesError) {
      showToast(
        "خطا در دریافت اطلاعات دوره‌ها. لطفاً دوباره تلاش کنید.",
        "error"
      );
    }
  }, [coursesError]);

  return (
    <>
      <RenderSectionHeader
        label="جدیدترین دوره ها"
        dotColor="#FFD700"
        loading={coursesLoading}
        hasError={!!coursesError}
        onViewAll={handleViewAllCourses}
      />
      {coursesError ? (
        <RenderErrorBlock
          message="خطا در دریافت اطلاعات دوره‌ها"
          onRetry={refetchCourses}
        />
      ) : (
        <PagerView
          ref={coursePagerRef}
          initialPage={0}
          layoutDirection="rtl"
          pageMargin={20}
          style={[
            styles.pagerView,
            { transform: [{ scaleX: -1 }] },
            { minHeight: 450, marginBottom: 20, minWidth: "100%" },
          ]}
          onPageSelected={(e) => setCurrentCoursePage(e.nativeEvent.position)}
        >
          {coursePages}
        </PagerView>
      )}
    </>
  );
};
export default React.memo(Courses)