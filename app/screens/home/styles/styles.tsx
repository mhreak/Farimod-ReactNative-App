import {
  StyleSheet,
  Dimensions,
} from "react-native";
import { StatusBar } from "react-native";
const { width: screenWidth } = Dimensions.get('window');
import colors from "../../../config/colors";


export const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },

  buttonContainer: {
    width: '90%', // کمی جمع‌تر برای شیک‌تر شدن
    alignSelf: 'center', // وسط‌چین کردن دکمه در عرض صفحه
    marginTop: 25,
    marginBottom: 40, // ایجاد فاصله از لبه پایینی صفحه برای اسکرول راحت
    
    // سایه نئونی و لوکس (مخصوص پوشاک و جواهرات لاکچری)
    shadowColor: "#d946ef", // ترکیب سایه صورتی-بنفش فانتزی
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  buttonGradient: {
    flexDirection: "row-reverse", 
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18, // دکمه کمی ضخیم‌تر و پرو پیمون‌تر شده
    paddingHorizontal: 22,
    borderRadius: 24, // گوشه‌های کاملاً مدرن و کپسولی شیک
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.4)", // خط سفید نیمه شفاف شیشه‌ای
  },
  buttonTextContainer: {
    flex: 1,
    alignItems: "flex-end", 
    marginRight: 16, 
    marginLeft: 8,
  },
  buttonTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontFamily: "Yekan_Bakh_ExtraBold", 
    fontWeight: "800", 
    textAlign: "right",
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.15)', 
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  buttonSubtitle: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 11,
    fontFamily: "IRANSans", 
    fontWeight: "600",
    textAlign: "right",
    opacity: 0.9,
  },

  headerContainer: {
    alignItems: "center",
    marginBottom: 50,
    paddingTop: StatusBar.currentHeight + 35,
    paddingHorizontal: 20,
  },
  frameButton: {
    position: 'absolute',
    top: StatusBar.currentHeight + 45,
    right: 20,
    zIndex: 1000,
  },
  postImage: {
    height: "100%",
    width: "100%",
  },
  frameButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ffffff',
    marginTop: -12
  },
  frameImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    padding: 10
  },
  notificationButton: {
    position: 'absolute',
    top: StatusBar.currentHeight + 45,
    left: 20,
    zIndex: 1000,
  },
  notificationButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -12
  },
  titleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Yekan_Bakh_ExtraBold",
    color: "#2c3e50",
    marginHorizontal: 15,
    textAlign: "center",
    marginTop: -100
  },
  bodyText: {
    fontSize: 20,
    marginRight: 10,

    fontFamily: "Yekan_Bakh_Bold",
  },
  headerBox: {
    height:200,
    width: "100%",
    borderRadius: 20,
  },
  titleBox: {
    zIndex: 10,           
  elevation: 10,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
    marginTop: 15,
  },
  pagerView: {
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 200
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.primary,
    textAlign: 'center',
  },
  slideSkeletonContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
  },
  peopleContainer: {
    height: 170,
    display: "flex",
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
    paddingHorizontal: 10,
    direction:"rtl"
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    marginVertical: 8,
  },
  avatarGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  sliderContainer: {
    position: 'relative',
    minHeight: 200,
    marginBottom: 20,
  },
  sliderArrowLeft: {
    position: 'absolute',
    left: 15,
    top: '50%',
    marginTop: -20,
    zIndex: 999,
  },
  sliderArrowRight: {
    position: 'absolute',
    right: 15,
    top: '50%',
    marginTop: -20,
    zIndex: 999,
  },
  arrowIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  nameText: {
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Yekan_Bakh_Bold',
    color: '#333',
    maxWidth: 120,
    fontWeight: '600',
  },
  productGrid: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    width: '100%',
  },
  productWrapper: {
    width: '48%',
  },
  productCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 10,
  },
  productImageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productContent: {
    padding: 12,
    minHeight: 85,
    justifyContent: 'space-between',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 10,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#fff',
  },
  unavailableBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unavailableText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#fff',
  },
  productTitle: {
    fontSize: 13,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
    lineHeight: 16,
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#667eea',
    textAlign: 'center',
  },
  originalPrice: {
    fontSize: 11,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#999',
    textAlign: 'center',
    textDecorationLine: 'line-through',
  },
  specialPrice: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#ff6b6b',
    textAlign: 'center',
  },
  memberGroupContainer: {
    minHeight: 180,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
    direction:"rtl"
  },
  memberGroupCardWrapper: {
    marginHorizontal: 8,
    marginVertical: 10,
  },
  memberGroupCard: {
    width: 100,        // ✅ تغییر - عرض بیشتر
    height: 100,       // ✅ تغییر - مربعی
    borderRadius: 24,  // ✅ تغییر - گوشه‌های گردتر
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,       // ✅ تغییر - سایه عمیق‌تر
    },
    shadowOpacity: 0.25,  // ✅ تغییر
    shadowRadius: 10,     // ✅ تغییر
    elevation: 10,        // ✅ تغییر
  },
  memberGroupGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,      // ✅ تغییر
    borderWidth: 3,
    borderColor: '#fff',
    borderRadius: 24,
},
  memberGroupContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  memberGroupTitle: {
    fontSize: 12,      // ✅ تغییر - اندازه کوچک‌تر
    fontFamily: "Yekan_Bakh_Bold",
    color: '#000000',
    textAlign: 'center',
    lineHeight: 18,    // ✅ تغییر

    paddingHorizontal: 4,  // ✅ اضافه کردن
    marginBottom: 10,  
  },
  iconContainer: {
    marginTop: 0,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },


  noMemberGroupContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
    width: '100%',
    marginVertical: 20,
  },
  noMemberGroupText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#9e9e9e',
    marginTop: 12,
    textAlign: 'center',
  },
  galleryGrid: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    width: '100%',
  },
  galleryWrapper: {
    width: '48%',
  },
  galleryCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 10,
  },
  galleryImageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    overflow: 'hidden',
    direction:"rtl"
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  galleryGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "70%",
    borderRadius: 16,
  },
  likeCountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  likeCountText: {
    fontSize: 10,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#333',
    marginRight: 3,
  },
  galleryTitleContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    paddingBottom: 20,
  },
  galleryTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
  noGalleryContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 250,
    width: '100%',
    marginVertical: 20,
  },
  noGalleryText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#9e9e9e',
    marginTop: 12,
    textAlign: 'center',
  },
  errorIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    width: '100%',
    marginVertical: 20,
  },
  errorIconText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#9e9e9e',
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  retryButtonText: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.white,
    marginRight: 8,
  },
  galleryImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },  errorSliderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
  },
  errorSliderText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#9e9e9e',
    marginTop: 12,
    textAlign: 'center',
  },
  noCourseContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    width: '100%',
    marginVertical: 20,
  },
  noCourseText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#9e9e9e',
    marginTop: 12,
    textAlign: 'center',
  },
  courseSkeletonContainer: {
    minHeight: 390,
    flexDirection: "column",
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: "#797979",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 8,
    overflow: 'hidden',
    gap: 8
  },
  courseImageSkeleton: {
    position: 'relative',
    height: 250,
    width: "100%",
  },
  courseDetailsSkeleton: {
    paddingHorizontal: 12, // تناسب با کارت اصلی
    paddingTop: 12,
    paddingBottom: 10,
    flex: 1,
  },
  courseHeaderSkeleton: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  locationSectionSkeleton: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
    marginBottom: 8,
  },
  additionalInfoSkeleton: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  blogPostCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
    marginBottom: 10,
  },
  blogPostImageContainer: {
    height: 200,
    width: '100%',
  },
  blogPostImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  blogPostImagePlaceholder: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blogPostContent: {
    padding: 16,
  },
  blogPostTitle: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    textAlign: "right",
    lineHeight: 26,
    marginBottom: 12,
  },
  blogPostMeta: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  blogPostDateContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  blogPostDateText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#666',
    marginRight: 6,
  },
  blogPostLikeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  blogPostLikeText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#666',
    marginLeft: 6,
  },
  blogPostMetaSkeleton: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  noBlogPostContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    width: '100%',
    marginVertical: 20,
  },
  noBlogPostText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#9e9e9e',
    marginTop: 12,
    textAlign: 'center',
  },
  portfolioGrid: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    width: '100%',
  },
  portfolioWrapper: {
    width: '48%',
  },
  portfolioCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 270,
    marginBottom: 10,
  },
  portfolioImageContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
  },
  portfolioImagePlaceholder: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
  },
  portfolioDefaultImage: {
    width: '100%',
    height: '100%',
  },
  likeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(233, 30, 99, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 15,
  },
  likeText: {
    fontSize: 11,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#ffffff',
    marginRight: 3,
  },
  portfolioContent: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  portfolioTitle: {
    fontSize: 15,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    textAlign: "right",
    lineHeight: 22,
    marginBottom: 6,
  },
  portfolioDescription: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#666",
    textAlign: "right",
    lineHeight: 18,
    marginBottom: 10,
  },
  portfolioMeta: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 11,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#666',
    marginRight: 4,
  },
  avatarImageContainer: {
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden',
  },
  avatarImage: {

    
  },
  blueTickContainer: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    marginTop: -15,
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 11,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#666',
    marginLeft: 3,
  },
  portfolioMetaSkeleton: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  noPortfolioContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 250,
    width: '100%',
    marginVertical: 20,
  },
  noPortfolioText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#9e9e9e',
    marginTop: 12,
    textAlign: 'center',
  },
  slideTypeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  slideTypeText: {
    fontSize: 10,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#ffffff',
    textAlign: 'center',
  },
  courseGrid: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    width: '100%',
    minHeight: 420,
  },
  courseWrapper: {
    width: (screenWidth - 70) / 2,  // ✅ تغییر مهم - محاسبه دقیق عرض
    marginHorizontal: 5,  // ✅ اضافه کردن
    minHeight: 410,
  },
});