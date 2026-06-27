import ApiService from "./ApiService";

const ProfileService = {
  getProfileInfoToEdit: async (memberId, userContext = null) => {
    try {
      console.log("Getting profile info for member:", memberId);

      const response = await ApiService.get(
        `/MobileApp/MemberInfo/GetProfileInfoToEdit?memberId=${memberId}`,
      );

      console.log("Profile info received:", response.data);

      if (!response.data.Mobile && userContext?.Mobile) {
        console.log(
          "⚠️ Mobile is null in API response, using user context:",
          userContext.Mobile,
        );
        response.data.Mobile = userContext.Mobile;
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error getting profile info:", error);
      return {
        success: false,
        error: error.message || "خطا در دریافت اطلاعات پروفایل",
      };
    }
  },

  getProfileAvatar: async (currentMemberId, memberId = null) => {
    try {
      const targetMemberId = memberId || currentMemberId;
      const url = `/MobileApp/Member/Get?currentMemberId=${currentMemberId}&memberId=${targetMemberId}`;

      console.log("Fetching avatar for member:", targetMemberId);

      const response = await ApiService.get(url);

      if (response.data && response.data.AvatarImageURL) {
        console.log(
          "Avatar fetched successfully:",
          response.data.AvatarImageURL,
        );
        return {
          success: true,
          avatarUrl: response.data.AvatarImageURL,
          data: response.data,
        };
      }

      return {
        success: false,
        avatarUrl: null,
        data: response.data,
        message: "هیچ عکس پروفایلی یافت نشد",
      };
    } catch (error) {
      console.error("Error fetching avatar:", error);
      return {
        success: false,
        avatarUrl: null,
        error: error.message || "خطا در دریافت عکس پروفایل",
      };
    }
  },

  updateProfile: async (profileData) => {
    try {
      console.log("Updating profile with data:", profileData);

      if (!profileData.Mobile) {
        throw new Error("شماره موبایل الزامی است");
      }

      const response = await ApiService.post(
        "/MobileApp/MemberInfo/UpdateProfile",
        profileData,
      );

      console.log("Profile updated successfully:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating profile:", error);
      return {
        success: false,
        error: error.message || "خطا در بروزرسانی پروفایل",
      };
    }
  },
};

export default ProfileService;
