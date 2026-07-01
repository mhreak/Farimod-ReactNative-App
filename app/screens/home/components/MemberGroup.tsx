import React, { useEffect, useRef, useState, useMemo } from "react";
import { View } from "react-native";
import { styles } from "../styles/styles";
import { MaterialIcons } from "@expo/vector-icons";
import AppText from "../../../components/Text";
import { useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import { MemberGroup as MemberGroupType } from "../../../types/home/home.types";
import { useMemberGroups } from "../../../hooks/home/useHomeData";
import PagerView from "react-native-pager-view";
import { UseAutoScroll } from "../../../hooks/useAutoScroll";
import { AUTO_SCROLL_INTERVALS } from "../contants/AUTO_SCROLL_INTERVALS";
import { RenderSectionHeader } from "../ui/rendering/RenderSectionHeader";
import { RenderErrorBlock } from "../ui/rendering/RenderErrorBlock";
import useToast from "../../../hooks/useToast";
import { MemberGroupCardSkeleton } from "../ui/skeleton/MemberGroupCardSkeleton";
import { MemberGroupCard } from "../ui/MemberGroupCard";
import { AppNavigationProp } from "../../../navigation/types";

const MemberGroup = () => {
  const {
    data: memberGroups = [],
    loading: memberGroupsLoading,
    error: memberGroupsError,
    refetch: refetchMemberGroups,
  } = useMemberGroups();


  const { showToast } = useToast();
  const navigation = useNavigation<AppNavigationProp>();

  const memberGroupPagerRef = useRef<PagerView>(null);
  const [currentMemberGroupPage, setCurrentMemberGroupPage] = useState(0);
  
  const totalMemberGroupPages = memberGroups
    ? Math.ceil(memberGroups.length / 3)
    : 0;

  const handleViewAllMemberGroups = useCallback(() => {
    requestAnimationFrame(() => {
      try {
        (navigation as any).navigate("AllMemberGroups");
      } catch {
        showToast("خطا در باز کردن لیست گروه‌ها", "error");
      }
    });
  }, [navigation, showToast]);

  UseAutoScroll(
    memberGroupPagerRef,
    totalMemberGroupPages,
    AUTO_SCROLL_INTERVALS.memberGroups,
    setCurrentMemberGroupPage
  );

  const handleMemberGroupPress = useCallback(
    (groupData: MemberGroupType) => {
      requestAnimationFrame(() => {
        try {
          (navigation as any).navigate("AllMembers", {
            filterGroupId: groupData.MemberGroupId,
            filterGroupName: groupData.GroupName,
          });
        } catch {
          showToast("خطا در باز کردن گروه", "error");
        }
      });
    },
    [navigation, showToast]
  );

  const memberGroupPages = useMemo(() => {
    if (memberGroupsLoading) {
      return Array.from({ length: 2 }, (_, i) => (
        <View key={`mg-skel-${i}`} style={{ transform: [{ scaleX: -1 }] }}>
          <View style={styles.memberGroupContainer}>
            {Array.from({ length: 3 }, (_, j) => (
              <MemberGroupCardSkeleton key={`mg-skel-${i}-${j}`} />
            ))}
          </View>
        </View>
      ));
    }

    if (!memberGroups || memberGroups.length === 0) {
      return [
        <View key="no-mg" style={{ transform: [{ scaleX: -1 }] }}>
          <View style={styles.noMemberGroupContainer}>
            <MaterialIcons name="group" size={48} color="#9e9e9e" />
            <AppText style={styles.noMemberGroupText}>
              هیچ گروهی موجود نیست
            </AppText>
          </View>
        </View>,
      ];
    }

    const pages = [];
    const reversed = [...memberGroups].reverse();
    for (let i = 0; i < reversed.length; i += 3) {
      pages.push(
        <View key={`mg-page-${i}`} style={{ transform: [{ scaleX: -1 }] }}>
          <View style={styles.memberGroupContainer}>
            {reversed.slice(i, i + 3).map((g) => (
              <MemberGroupCard
                key={g.MemberGroupId}
                item={g}
                onPress={handleMemberGroupPress}
              />
            ))}
          </View>
        </View>
      );
    }
    return pages;
  }, [memberGroups, memberGroupsLoading, handleMemberGroupPress]);

  // useEffect(() => {
  //   refetchMemberGroups();
  // }, []);

  // useEffect(() => {
  //   if (memberGroupsError) {
  //     showToast(
  //       "خطا در دریافت اطلاعات گروه‌های اصلی. لطفاً دوباره تلاش کنید.",
  //       "error"
  //     );
  //   }
  // }, [memberGroupsError]);

  return (
    <>
      <RenderSectionHeader
        label="گروه‌های اصلی"
        dotColor="#00BCD4"
        loading={memberGroupsLoading}
        hasError={!!memberGroupsError}
        onViewAll={handleViewAllMemberGroups}
      />
      {memberGroupsError ? (
        <RenderErrorBlock
          message="خطا در دریافت اطلاعات گروه‌ها"
          onRetry={refetchMemberGroups}
        />
      ) : (
        <PagerView
          ref={memberGroupPagerRef}
          style={[
            { minHeight: 180, marginTop: -30 },
            { transform: [{ scaleX: -1 }] },
          ]}
          initialPage={0}
          layoutDirection="ltr"
          pageMargin={20}
          onPageSelected={(e) =>
            setCurrentMemberGroupPage(e.nativeEvent.position)
          }
        >
          {memberGroupPages}
        </PagerView>
      )}
    </>
  );
};
export default React.memo(MemberGroup)