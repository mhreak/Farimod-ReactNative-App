

import {
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native";
import colors from "../../../config/colors";

const { width,height } = Dimensions.get('window');

export const modernColors = {
  ...colors,
  primary: "#667eea",
  primaryDark: "#764ba2",
  primaryLight: "#f0f4ff",
  secondary: "#ff6b6b",
  tertiary: "#4ecdc4",
  accent: "#45b7d1",
  surface: "#ffffff",
  dark: "#2c3e50",
  medium: "#34495e",
  light: "#ecf0f1",
  success: "#2ecc71",
  warning: "#f39c12",
  error: "#e74c3c",
  info: "#3498db",
  gradientStart: "#667eea",
  gradientEnd: "#764ba2",
  priceIcon: "#2ecc71",
  sellerIcon: "#3498db",
  categoryIcon: "#9b59b6",
  statusIcon: "#e67e22",
  dateIcon: "#e74c3c",
  likeIcon: "#e91e63",
  fashionGold: "#ffd700",
};


export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
    paddingTop: StatusBar.currentHeight + 35,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: StatusBar.currentHeight + 45,
    right: 20,
    zIndex: 1000,
  },
  backButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    marginTop: -12
  },
  menuButton: {
    position: 'absolute',
    top: StatusBar.currentHeight + 45,
    left: 20,
    zIndex: 1000,
  },
  menuButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
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
  },
  floatingHeart: {
    position: 'absolute',
    top: height * 0.4,
    left: width * 0.5 - 25,
    zIndex: 1000,
    pointerEvents: 'none',
  },



  imageDots: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  imageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  imageDotActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 20,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    padding: 15,
    justifyContent: 'flex-end',
  },
  titleBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 20,
    padding: 20,
    backdropFilter: 'blur(15px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
  },
  productTitle: {
    fontSize: 24,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.surface,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 12,
    lineHeight: 32,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statusText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: modernColors.surface,
    marginLeft: 6,
  },
  discountBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  discountText: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#fff',
  },
  // Updated owner badge styles with dynamic positioning
  ownerBadge: {
    position: 'absolute',
    top: 15, // Will be at top when no discount
    right: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  ownerBadgeWithDiscount: {
    position: 'absolute',
    top: 60, // Original position when discount badge exists
    right: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  ownerText: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#ffffff',
  },
  topLikeBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  topLikeContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  topLikeCount: {
    fontSize: 15,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#ffffff',
    marginRight: 6,
  },
  imageGalleryWrapper: {
    marginHorizontal: 20,
    marginBottom: 20,

  },
  imageGalleryContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 20,

    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.3)',
  },
  thumbnailsContainer: {
    padding: 10,

  },
  thumbnailContainer: {
    width: 70,
    height: 70,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedThumbnail: {
    borderColor: modernColors.primary,
    transform: [{ scale: 1.1 }],
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },

  priceSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  productPrice: {
    fontSize: 20,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.priceIcon,
    textAlign: 'right',
  },


  likeSectionContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  likeButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeCountText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.dark,
    marginTop: 4,
    textAlign: 'center',
  },
  floatingDecoration1: {
    position: 'absolute',
    bottom: 50,
    right: 75,
  },
  floatingDecoration2: {
    position: 'absolute',
    top: 800,
    left: 100,
  },
  sectionTitleContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    marginTop: 10,
    position: "relative",
    paddingHorizontal: 20,
  },
  cardsContainer: {
    paddingHorizontal: 20,
  },
  sectionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
  },
  sparkleContainer: {
    position: "absolute",
    top: -10,
    right: -10,
  },
  sparkle1: {
    position: "absolute",
    top: 0,
    right: 90,
  },
  sparkle2: {
    position: "absolute",
    top: 350,
    right: 25,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
  },
  detailItem: {
    marginBottom: 14,
    backgroundColor: "rgba(248, 250, 252, 0.3)",
    backdropFilter: "blur(15px)",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(203, 213, 225, 0.4)",
    position: "relative",
    overflow: "hidden",
    marginHorizontal: 5,
  },
  // Skeleton styles
  detailItemSkeleton: {
    marginBottom: 14,
    backgroundColor: "rgba(248, 250, 252, 0.3)",
    backdropFilter: "blur(15px)",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(203, 213, 225, 0.4)",
    position: "relative",
    overflow: "hidden",
    marginHorizontal: 5,
  },
  skeletonRowContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  // Row container for label and value in same line
  rowContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  valueContainer: {
    flex: 1,
    paddingLeft: 15,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  label: {
    fontSize: 17,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
  },
  value: {
    fontSize: 16,
    color: "#374151",
    textAlign: 'left',
    lineHeight: 26,
    fontFamily: "Yekan_Bakh_Regular",
  },
  contentContainer: {
    paddingHorizontal: 15,
    marginTop: 15,
  },
  descriptionValue: {
    fontSize: 16,
    color: "#374151",
    textAlign: 'justify',
    lineHeight: 26,
    direction: "rtl",
    fontFamily: "Yekan_Bakh_Regular",
  },
  featureAccent: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 6,
    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  ratingSection: {
    marginTop: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  ratingComponent: {
    alignItems: 'flex-end',
  },
  // User's detailed ratings
  userDetailedRatingsContainer: {
    marginTop: 20,
    backgroundColor: '#e8f5e8',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  userDetailedRatingsTitle: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    textAlign: 'right',
    marginBottom: 15,
  },
  userRatingRow: {
    marginBottom: 10,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e8f5e8',
  },
  userRatingRowContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userRatingRowText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  userRatingRowTitle: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  userRatingRowStars: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginLeft: 15,
    gap: 8,
  },
  userRatingScore: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.success,
  },
  // Average ratings from other users
  detailedRatingsContainer: {
    marginTop: 15,
    backgroundColor: 'rgba(255, 248, 225, 0.5)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  detailedRatingsTitle: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    textAlign: 'right',
    marginBottom: 10,
  },
  detailedRatingRow: {
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.1)',
  },
  ratingRowContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingRowText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  ratingRowTitle: {
    fontSize: 13,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
  },
  ratingRowStars: {
    // marginLeft: 0,
    // marginRight:20
  },
  averageRatingScore: {
    fontSize: 12,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#868686",
  },
  buttonsContainer: {
    alignItems: "center",
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  primaryButton: {
    width: "92%",
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 20,
    marginBottom: 18,
    marginTop: 15,
  },
  buttonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 35,
  },
  primaryButtonText: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: "white",
    marginLeft: 12,
  },
  secondaryButton: {
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 2,
  },
  secondaryButtonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 35,
  },
  secondaryButtonText: {
    fontSize: 17,
    fontFamily: "Yekan_Bakh_Regular",
    textAlign: "center",
  },
  // Error state styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#2c3e50',
    marginTop: 20,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: '#9e9e9e',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: modernColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 24,
    shadowColor: modernColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.white,
    marginRight: 8,
  },
  decorativeElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  floatingElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star1: {
    position: "absolute",
    top: 600,
    left: 60,
  },
  star2: {
    position: "absolute",
    top: 800,
    right: 70,
  },
  star3: {
    position: "absolute",
    bottom: 100,
    left: 50,
  },
  bottomSpacer: {
    height: 30,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouchable: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 15,
    // paddingBottom: 35,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
  },
  modalActions: {
    marginBottom: 20,
  },
  modalActionItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderRadius: 15,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  modalActionContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  modalActionIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  modalActionText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  modalActionTitle: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    marginBottom: 2,
  },
  modalActionSubtitle: {
    fontSize: 13,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#6c757d",
  },
  modalCancelButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 30
  },
  modalCancelText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#6c757d',
  },
  // Delete Modal Styles
  deleteModalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 15,
    paddingBottom: 35,
    paddingHorizontal: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  deleteModalHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  deleteWarningIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: modernColors.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: modernColors.error,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#2c3e50",
    marginBottom: 15,
  },
  deleteModalMessage: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: "#6c757d",
    textAlign: 'center',
    lineHeight: 24,
  },
  deleteModalActions: {
    marginTop: 10,
  },
  deleteButtonsRow: {
    flexDirection: 'row-reverse',
    gap: 15,
  },
  confirmDeleteButton: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: modernColors.error,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmDeleteGradient: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 10,
  },
  confirmDeleteText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#ffffff',
  },
  deleteModalCancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  deleteModalCancelText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#6c757d',
  },
  imageHeaderContainer: {
    position: 'relative',
    height: width - 40, // ارتفاع برابر با عرض برای مربعی کردن
    margin: 20,
    borderRadius: 20, // کاهش radius برای ظاهر مربعی‌تر
    overflow: 'hidden',
    shadowColor: modernColors.primary,
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,

  },

  // Style تصویر اصلی مربعی
  headerImageSquare: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },

  // ScrollView برای تصاویر مربعی
  imageScrollView: {
    height: width - 40, // ارتفاع مربعی
  },

  // هر slide تصویر مربعی
  imageSlide: {
    width: width - 40,
    height: width - 40, // ارتفاع مربعی
  },

  // Container thumbnail مربعی
  thumbnailContainer: {
    width: 80, // اندازه بزرگ‌تر برای نمایش بهتر
    height: 80,
    borderRadius: 12, // radius کمتر برای مربعی‌تر بودن
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },

  // تصویر thumbnail مربعی
  thumbnailImageSquare: {
    width: '100%',
    height: '100%',
  },

  // تصحیح selected thumbnail
  selectedThumbnail: {
    borderColor: modernColors.primary,
    transform: [{ scale: 1.05 }], // کمتر از قبل برای ظاهر بهتر

  },

  // تصحیح container gallery
  imageGalleryContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.4)',


  },

  // تصحیح قیمت برای مرکز قرار گیری
  priceSection: {
    flex: 1,
    alignItems: 'center', // مرکز قرار گیری
    justifyContent: 'center',
  },

  // بهبود نمایش قیمت
  priceContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  productPrice: {
    fontSize: 22,
    fontFamily: "Yekan_Bakh_Bold",
    color: modernColors.priceIcon,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  originalPrice: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    textDecorationLine: 'line-through',
    marginBottom: 4,
  },

  specialPrice: {
    fontSize: 22,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#ff6b6b',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // بهبود productInfoContainer
  productInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // تغییر از space-between به center
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.3)',

  },
  priceInOverlay: {
    alignItems: 'center',
    marginTop: 10,
  },
  originalPriceOverlay: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: "#a1a1a1",
    textAlign: 'center',
    textDecorationLine: 'line-through',
    marginBottom: 4,
  },
  specialPriceOverlay: {
    fontSize: 20,
    fontFamily: "Yekan_Bakh_Bold",
    color: '#ff6b6b',
    textAlign: 'center',
  },
});