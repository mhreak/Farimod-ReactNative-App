export interface ImageGalleryItem {
  ImageGalleryItemId: number;
  ImageGalleryId: number;
  Title: string;
  ImageFileName: string;
  ImageURL: string;
  ShowOrder: number;
  Active: boolean;
  ActiveStr: string;
  InsertDate: string;
  ShamsiInsertDate: string;
}

export interface IGalleryItem {
  ImageGalleryId: number;
  Title: string;
  MemberId: number;
  MemberName: string;
  ImageCount: number;
  Rating: number | null;
  LikeCount: number;
  FeaturedImageURL: string | null;
  Active: boolean;
  ActiveStr: string;
  InsertDate: string;
  ShamsiInsertDate: string;
  ImageGalleryItemList: ImageGalleryItem[];
}

export interface ApiResponse {
  Items: IGalleryItem[];
  CurrentPage: number;
  TotalPages: number;
  PageSize: number;
  TotalCount: number;
  HasPrevious: boolean;
  HasNext: boolean;
}