export type MemberGroup = {
  MemberGroupId: number;
  MemberGroupName: string;
};

export type ProfileData = {
  aboutMe: string;
  avatarUrl: string | null;
  introVideo: string | null;
  name: string;
  title: string;
  cityId: number | null;
  cityName: string;
  provinceId: number | null;
  provinceName: string;
  phone1: string;
  phone2: string;
  email: string;
  websiteAddress: string;
  telegramAccountId: string;
  instagramAccountId: string;
  whatsappAccountMobileNumber: string;
  address: string;
  mobile: string;
  memberGroupList: MemberGroup[];
};
