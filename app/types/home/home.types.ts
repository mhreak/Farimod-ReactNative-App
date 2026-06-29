import { AvatarProps as BaseAvatarProps } from "../../config/type";

export interface HomePageSlide {
  HomePageSlideId: number;
  ClickTrigger: number | null;
  ImageURL: string;
  TargetEntityName: string | null;
  Active: boolean;
  ShowOrder: boolean;
}

export interface MemberGroup {
  MemberGroupId: number;
  GroupName: string;
  MemberCount: number;
  Active: boolean;
  ActiveStr: string;
  InsertDate: string;
  ShamsiInsertDate: string;
}

export interface Portfolio {
  PortfolioId: number;
  PotfolioId?: number;
  Title: string;
  Description: string;
  ShamsiInsertDate: string;
  Active: boolean;
  LikeCount: number;
  Rating: number | null;
  FeaturedImageURL?: string;
}

export interface BlogPost {
  BlogPostId: number;
  BlogPostCategoryId: number;
  MemberId: number;
  Title: string;
  ShamsiInsertDate: string;
  Content: string;
  CommentEnabled: boolean;
  LikeCount: number;
  FeaturedImageFileName: string | null;
  FeaturedImageURL: string;
  Rating: number | null;
  Active: boolean;
}

export interface ImageGallery {
  ImageGalleryId: number;
  Title: string;
  MemberId: number;
  MemberName: string | null;
  ImageCount: number;
  Active: boolean;
  ActiveStr: string;
  InsertDate: string;
  ShamsiInsertDate: string;
  Rating: number | null;
  LikeCount: number;
  ImageGalleryItemList: any[];
  FeaturedImageURL?: string;
}

export interface Product {
  ProductId: number;
  MemberId: number;
  MemberName?: string;
  ProductName: string;
  Price: number;
  SpecialSalePrice: number;
  ProductCategories: string;
  FeaturedImageURL?: string;
  LikeCount: number;
  Rating?: number;
  Active: boolean;
  InsertDate: string;
}

export interface ExtendedAvatarProps extends BaseAvatarProps {
  name: string;
  size?: number;
  onPress?: () => void;
  showOnline?: boolean;
}