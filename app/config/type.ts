// types.ts

import { number } from "yup";

export interface Member {
  MemberId: number;
  IsIndividual: boolean;
  IsIndividualStr: string;
  FirstName: string;
  LastName: string;
  Name: string;
  MemberName: string;
  Gender: boolean;
  GenderStr: string;
  CityId: number;
  CityName: string | null;
  ProvinceId: number;
  ProvinceName: string | null;
  Mobile: string;
  Phone1: string | null;
  Phone2: string | null;
  Email: string | null;
  MemberGroupsStr: string;
  InsertDate: string;
  ShamsiInsertDate: string;
}

export interface MemberResponse {
  Data: Member[];
}

// NEW: Detailed member profile interface matching the API response
export interface MemberDocument {
  MemberDocumentId: number;
  Title: string | null;
  MemberId: number;
  MemberName: string | null;
  MemberDocumentTypeId: number;
  MemberDocumentTypeName: string | null;
  InsertDate: string;
  ShamsiInsertDate: string | null;
}

export interface Portfolio {
  PortfolioId: number;
  MemberId: number;
  Title: string;
  Description: string;
  ImageFileName: string | null;
  Category: string | null;
  InsertDate: string;
  ShamsiInsertDate: string;
}

export interface ImageGallery {
  ImageGalleryId: number;
  MemberId: number;
  Title: string;
  ImageFileName: string;
  Likes: number;
  InsertDate: string;
  ShamsiInsertDate: string;
}

export interface MemberProfile {
  MemberId: number;
  IsIndividual: boolean;
  IsIndividualStr: string;
  FirstName: string;
  LastName: string;
  Name: string;
  MemberName: string;
  Gender: boolean;
  GenderStr: string;
  CityId: number;
  CityName: string | null;
  ProvinceId: number;
  ProvinceName: string | null;
  Mobile: string;
  Phone1: string | null;
  Phone2: string | null;
  Email: string | null;
  MemberGroupsStr: string;
  InsertDate: string;
  ShamsiInsertDate: string;
  AboutMe: string;
  MemberDocumentViewModel: MemberDocument;
  PortfolioViewModelList: Portfolio[];
  ProductViewModelList: Product[];
  CourseViewModelList: Course[];
  ImageGalleryViewModelList: ImageGallery[];
}

// Updated Course interface to match API response
export interface Course {
  CourseId: number;
  MemberId: number;
  MemberName: string;
  CourseName: string;
  CourseType: string;
  Description: string;
  Price: number;
  SpecialSalePrice: number | null;
  Location: string;
  PhoneNumber: string | null;
  Coaches: string | null;
  Category: string | null;
  CourseImageFileName: string | null;
  Active: boolean;
  ActiveStr: string;
  InsertDate: string;
  ShamsiInsertDate: string;
  StartDate: string | null;
  EndDate: string | null;
  Duration: number | null; // Duration in hours
  MaxParticipants: number | null;
  CurrentParticipants: number;
}

// Course Response interface
export interface CourseResponse {
  Data: Course[];
}

// Updated Product interface to match API response
export interface Product {
  ProductId: number;
  MemberId: number;
  MemberName: string;
  ProductName: string;
  Price: number;
  SpecialSalePrice: number | null;
  ProductCategories: string;
  ProductImageFileName: string | null;
  Active: boolean;
  ActiveStr: string;
  InsertDate: string;
}

// Updated Product Response interface
export interface ProductResponse {
  Data: Product[];
}

// NEW: MemberGroup interface based on your API response
export interface MemberGroup {
  MemberGroupId: number;
  GroupName: string;
  AllowAddPortfolio: boolean;
  AllowAddImageGallery: boolean;
  AllowAddCourse: boolean;
  AllowAddBlogPost: boolean;
  MemberCount: number;
  Active: boolean;
  ActiveStr: string;
  InsertDate: string;
  ShamsiInsertDate: string;
}

// MemberGroup Response interface
export interface MemberGroupResponse {
  Data: MemberGroup[];
}

export interface Person {
  id: number;
  name: string;
  profession: string;
  avatar?: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  followers: number;
  following: number;
  posts: number;
  skills: string[];
  experience: string;
  education: string;
}

// Navigation types
export interface NavBarItem {
  icon: string;
  title: string;
  screenName: string;
}

// API Response types
export interface ApiResponse<T> {
  Data: T[];
  Success?: boolean;
  Message?: string;
}

// Props types for components
export interface ProductCardProps {
  item: Product;
  onPress?: (product: Product) => void;
}

export interface AvatarProps {
  name: string;
  size?: number;
  onPress?: () => void;
  showOnline?: boolean;
  member?: Member;
}

export interface CourseCardProps {
  course: Course;
  onPress?: (course: Course) => void;
}

// Hook types
export interface UseApiState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Screen navigation props
export interface HomeScreenProps {
  navigation: any; // Replace with proper navigation type from @react-navigation
}

export interface CourseDetailsProps {
  route: {
    params: {
      courseData: Course;
    };
  };
  navigation: any;
}

export interface ProductDetailsProps {
  route: {
    params: {
      productData: Product;
    };
  };
  navigation: any;
}

export interface UserProfileProps {
  route: {
    params: {
      userData: Person | Member;
    };
  };
  navigation: any;
}

export interface MemberReview {
  ContnetId: number;
  reviewItemRatings: string[];
  ContentReviewItemId: number;
  Rating: number;
}
