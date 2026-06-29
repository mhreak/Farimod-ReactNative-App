import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  View,
} from "react-native";
import { styles } from "../styles/styles";
import { useNavigation } from "@react-navigation/native";
import { Member} from "../../../config/type";
import { useMembers } from "../../../config/useApi";
import { useCallback } from "react";
import PagerView from "react-native-pager-view";
import { UseAutoScroll } from "../../../hooks/useAutoScroll";
import { AUTO_SCROLL_INTERVALS } from "../contants/AUTO_SCROLL_INTERVALS";
import { SkeletonLoader } from "../ui/skeleton/SkeletonLoader";
import { RenderSectionHeader } from "../ui/rendering/RenderSectionHeader";
import { RenderErrorBlock } from "../ui/rendering/RenderErrorBlock";
import useToast from "../../../hooks/useToast";
import { AppNavigationProp } from "../../../navigation/types";
import {Avatar} from "../ui/Avatar";
import { AvatarSkeleton } from "../ui/skeleton/AvatarSkeleton";

export const Members = () => {
  const navigation = useNavigation<AppNavigationProp>();

  const {
    data: members=[],
    loading: membersLoading,
    error: membersError,
    refetch: refetchMembers,
  } = useMembers();

  const memberPagerRef = useRef<PagerView | null>(null);

  const [currentMemberPage, setCurrentMemberPage] = useState(0);
  const { showToast } = useToast();
  const totalMemberPages = members ? Math.ceil(members.length / 3) : 0;

  UseAutoScroll(
    memberPagerRef,
    totalMemberPages,
    AUTO_SCROLL_INTERVALS.members,
    setCurrentMemberPage,
  );

  useEffect(() => {
    refetchMembers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (membersError)
      showToast("خطا در دریافت اطلاعات اعضا. لطفاً دوباره تلاش کنید.", "error");
  }, [membersError]);

  const handleMemberPress = useCallback(
    (memberData: Member) => {
      requestAnimationFrame(() => {
        try {
          navigation.navigate("UserProfile", { userData: memberData });
        } catch {
          showToast("خطا در باز کردن پروفایل کاربر", "error");
        }
      });
    },
    [navigation, showToast],
  );

  const handleViewAllMembers = useCallback(() => {
    requestAnimationFrame(() => navigation.navigate("AllMembers"));
  }, [navigation]);

  const memberPages = useMemo(() => {
    if (membersLoading) {
      return Array.from({ length: 2 }, (_, i) => (
        <View key={`mem-skel-${i}`} style={{ transform: [{ scaleX: -1 }] }}>
          <View style={styles.peopleContainer}>
            {Array.from({ length: 3 }, (_, j) => (
              <AvatarSkeleton key={`av-skel-${i}-${j}`} size={100} />
            ))}
          </View>
        </View>
      ));
    }
    if (members.length === 0) return [];
    const pages = [];
    for (let i = 0; i < members.length; i += 3) {
      pages.push(
        <View key={`member-page-${i}`} style={{ transform: [{ scaleX: -1 }] }}>
          <View style={styles.peopleContainer}>
            {members.slice(i, i + 3).map((member) => (
              <Avatar
                key={`member-${member.MemberId}`}
                name={member.Name}
                size={100}
                showOnline={true}
                member={member}
                onPress={() => handleMemberPress(member)}
              />
            ))}
          </View>
        </View>,
      );
    }
    return pages;
  }, [members, membersLoading, handleMemberPress]);
  return (
    <>
      <RenderSectionHeader
        label="اعضای جدید"
        dotColor="#FF69B4"
        loading={membersLoading}
        hasError={!!membersError}
        onViewAll={handleViewAllMembers}
      />
      {membersError ? (
        <RenderErrorBlock
          message="خطا در دریافت اطلاعات گالری‌ها"
          onRetry={refetchMembers}
        />
      ) : (
        <PagerView
          ref={memberPagerRef}
          style={[{ minHeight: 170 }, { transform: [{ scaleX: -1 }] }]}
          initialPage={0}
          layoutDirection="rtl"
          pageMargin={20}
          onPageSelected={(e) => setCurrentMemberPage(e.nativeEvent.position)}
        >
          {memberPages}
        </PagerView>
      )}
    </>
  );
};
