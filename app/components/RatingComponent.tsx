import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { toPersianDigits } from '../utils/converters';
import appConfig from '../config/config';

const colors = {
  primary: "#667eea",
  secondary: "#ff6b6b",
  warning: "#f39c12",
  success: "#2ecc71",
  error: "#e74c3c",
  gold: "#ffd700",
  silver: "#c0c0c0",
  bronze: "#cd7f32",
  white: "#ffffff",
  dark: "#2c3e50",
  light: "#ecf0f1",
  gray: "#95a5a6",
  primaryButton: "#667eea",
  primaryDarkButton: "#764ba2",
};

const StarDisplay = ({
  rating = 0,
  maxStars = 5,
  size = 20,
  color = colors.gold,
  emptyColor = colors.silver,
  showHalfStars = true,
  style = {},
  onPress = null,
  animated = false,
  rtl = false
}) => {
  const animatedValues = useRef(
    Array.from({ length: maxStars }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (animated) {
      const animations = animatedValues.map((animValue, index) =>
        Animated.timing(animValue, {
          toValue: 1,
          duration: 200,
          delay: index * 100,
          useNativeDriver: true,
        })
      );

      Animated.stagger(100, animations).start();
    }
  }, [animated, rating]);

  const renderStar = (index) => {
    const starValue = index + 1;
    let iconName = 'star-border';
    let starColor = emptyColor;

    if (rating >= starValue) {
      iconName = 'star';
      starColor = color;
    } else if (showHalfStars && rating >= starValue - 0.5) {
      iconName = 'star-half';
      starColor = color;
    }

    const StarComponent = animated ? Animated.View : View;
    const starStyle = animated ? {
      transform: [{
        scale: animatedValues[index].interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 1],
        })
      }],
      opacity: animatedValues[index]
    } : {};

    return (
      <StarComponent key={index} style={starStyle}>
        <TouchableOpacity
          onPress={() => onPress && onPress(starValue)}
          disabled={!onPress}
          style={styles.starButton}
        >
          <MaterialIcons
            name={iconName}
            size={size}
            color={starColor}
          />
        </TouchableOpacity>
      </StarComponent>
    );
  };

  return (
    <View style={[styles.starsContainer, { flexDirection: rtl ? 'row-reverse' : 'row' }, style]}>
      {Array.from({ length: maxStars }, (_, index) => renderStar(index))}
    </View>
  );
};

const MultiOptionRatingComponent = ({
  contentId, 
  initialRating = 0,
  initialDetailedRatings = {},
  maxStars = 5,
  size = 24,
  showRatingText = true,
  showRatingCount = true,
  ratingCount = 0,
  averageRating = 0,
  onRatingChange = null,
  onRatingSubmitted = null, 
  onRatingError = null, 
  readonly = false,
  style = {},
  starColor = colors.gold,
  emptyStarColor = colors.silver,
  textColor = colors.dark,
  animated = true,
  showModal = true,
  modalTitle = "امتیاز شما",
  submitButtonText = "ثبت امتیاز",
  cancelButtonText = "لغو",
  onSubmit = null,
  allowHalfStars = false,
  rtl = false,
  enableMultipleOptions = false,
  ratingOptions = [],
  detailedRatingsAverages = {},
}) => {
  const [currentRating, setCurrentRating] = useState(initialRating);
  const [currentDetailedRatings, setCurrentDetailedRatings] = useState(initialDetailedRatings);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [tempRating, setTempRating] = useState(0);
  const [tempDetailedRatings, setTempDetailedRatings] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const modalBackdropAnim = useRef(new Animated.Value(0)).current;
  const modalSlideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleStarPress = (rating) => {
    if (readonly) return;

    if (showModal) {
      if (enableMultipleOptions) {
        setTempDetailedRatings(currentDetailedRatings);
        setShowRatingModal(true);
        showModalAnimation();
      } else {
        setTempRating(rating);
        setShowRatingModal(true);
        showModalAnimation();
      }
    } else {
      setCurrentRating(rating);
      onRatingChange && onRatingChange(rating);
    }

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const showModalAnimation = () => {
    Animated.parallel([
      Animated.timing(modalBackdropAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(modalSlideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideModalAnimation = () => {
    Animated.parallel([
      Animated.timing(modalBackdropAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(modalSlideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowRatingModal(false);
      setTempRating(0);
      setTempDetailedRatings({});
    });
  };

  const calculateAverageFromDetailedRatings = (detailedRatings) => {
    const ratings = Object.values(detailedRatings);
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    return sum / ratings.length;
  };

  const buildReviewItemRatings = (detailedRatings) => {
    return ratingOptions
      .filter(option => detailedRatings[option.id] && detailedRatings[option.id] > 0)
      .map(option => ({
        ContentReviewItemId: option.contentReviewItemId || option.id,
        Rating: detailedRatings[option.id]
      }));
  };

  const validateRatings = () => {
    if (enableMultipleOptions) {
      return Object.values(tempDetailedRatings).some(rating => rating > 0);
    }
    return tempRating > 0;
  };

  const submitRatingToAPI = async () => {
    try {
      let reviewData;

      if (enableMultipleOptions) {
        reviewData = {
          ContnetId: contentId,
          reviewItemRatings: buildReviewItemRatings(tempDetailedRatings)
        };
      } else {
        reviewData = {
          ContnetId: contentId,
          reviewItemRatings: [{
            ContentReviewItemId: 0, 
            Rating: tempRating
          }]
        };
      }

      console.log('Submitting review data:', reviewData);

      const response = await fetch(`${appConfig.mobileApi}MemberReview/SendReview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Review API Response:', result);

      return result;
    } catch (error) {
      console.error('Review submission error:', error);
      throw error;
    }
  };

  const handleSubmitRating = async () => {
    if (!validateRatings()) {
      Alert.alert('خطا', 'لطفاً حداقل یک امتیاز انتخاب کنید');
      return;
    }

    setIsSubmitting(true);

    try {
      const apiResult = await submitRatingToAPI();

      if (enableMultipleOptions) {
        const averageFromDetailed = calculateAverageFromDetailedRatings(tempDetailedRatings);
        setCurrentRating(averageFromDetailed);
        setCurrentDetailedRatings(tempDetailedRatings);
        onRatingChange && onRatingChange(averageFromDetailed, tempDetailedRatings);
        onSubmit && onSubmit(averageFromDetailed, tempDetailedRatings);

        onRatingSubmitted && onRatingSubmitted({
          ratings: tempDetailedRatings,
          averageRating: averageFromDetailed,
          reviewItemRatings: buildReviewItemRatings(tempDetailedRatings),
          response: apiResult
        });
      } else {
        setCurrentRating(tempRating);
        onRatingChange && onRatingChange(tempRating);
        onSubmit && onSubmit(tempRating);

        onRatingSubmitted && onRatingSubmitted({
          rating: tempRating,
          response: apiResult
        });
      }

      hideModalAnimation();

    } catch (error) {
      onRatingError && onRatingError(error.message || 'خطا در ثبت امتیاز');
      Alert.alert('خطا', error.message || 'خطا در ثبت امتیاز');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (rating) => {
    if (rating === 0) return '';
    if (rating <= 1) return 'خیلی ضعیف';
    if (rating <= 2) return 'ضعیف';
    if (rating <= 3) return 'متوسط';
    if (rating <= 4) return 'خوب';
    return 'عالی';
  };

  const handleDetailedRatingChange = (optionId, rating) => {
    setTempDetailedRatings(prev => ({
      ...prev,
      [optionId]: rating
    }));
  };

  const isSubmitEnabled = () => {
    if (isSubmitting) return false;
    return validateRatings();
  };

  const getCurrentDisplayRating = () => {
    if (enableMultipleOptions && Object.keys(currentDetailedRatings).length > 0) {
      return calculateAverageFromDetailedRatings(currentDetailedRatings);
    }
    return currentRating;
  };

  return (
    <View style={[styles.container, style]}>
      {averageRating > 0 && (
        <View style={styles.averageRatingContainer}>
          <Text style={[styles.userRatingLabel, { color: textColor }]}>
            میانگین امتیازات
          </Text>
          <StarDisplay
            rating={averageRating}
            maxStars={maxStars}
            size={size - 4}
            color={starColor}
            emptyColor={emptyStarColor}
            showHalfStars={true}
            animated={animated}
          />
          <View style={styles.ratingInfo}>
            <Text style={[styles.averageText, { color: textColor }]}>
              {toPersianDigits(averageRating.toFixed(1))}
            </Text>
            {showRatingCount && ratingCount > 0 && (
              <Text style={[styles.countText, { color: colors.gray }]}>
                ({toPersianDigits(ratingCount.toString())} نظر)
              </Text>
            )}
          </View>
        </View>
      )}

      {!readonly && (
        <View style={styles.userRatingContainer}>


          <TouchableOpacity
            style={[
              styles.submitButton,

            ]}
            onPress={handleStarPress}

          >
            <LinearGradient
              colors={[colors.primaryButton, colors.primaryDarkButton]}
              style={styles.submitButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <MaterialIcons name="star" size={20} color={colors.white} />
              )}
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'در حال ثبت...' : "امتیاز خود را ثبت کنید !"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={showRatingModal}
        transparent={true}
        animationType="none"
        onRequestClose={hideModalAnimation}
      >
        <View style={styles.modalContainer}>
          <Animated.View
            style={[
              styles.modalBackdrop,
              { opacity: modalBackdropAnim }
            ]}
          >
            <TouchableOpacity
              style={styles.backdropTouchable}
              onPress={!isSubmitting ? hideModalAnimation : null}
              activeOpacity={1}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [
                  {
                    translateY: modalSlideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{modalTitle}</Text>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {enableMultipleOptions ? (
                <View style={styles.multiOptionContainer}>
                  <Text style={styles.modalDescription}>
                    لطفاً به هر بخش امتیاز دهید
                  </Text>

                  {ratingOptions.map((option) => (
                    <View key={option.id} style={styles.optionContainer}>
                      <View style={styles.optionHeader}>
                        <View style={styles.optionTitleSection}>
                          <Text style={styles.optionTitle}>{option.title}</Text>
                          <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                        </View>

                        {option.averageRating > 0 && (
                          <View style={styles.optionAverageSection}>
                            <Text style={styles.optionAverageScore}>
                              {toPersianDigits(option.averageRating.toFixed(1))}
                            </Text>
                            <MaterialIcons name="star" size={16} color={colors.gold} />
                          </View>
                        )}
                      </View>

                      <View style={styles.optionRatingContainer}>
                        <StarDisplay
                          rating={tempDetailedRatings[option.id] || 0}
                          maxStars={maxStars}
                          size={32}
                          color={starColor}
                          emptyColor={emptyStarColor}
                          showHalfStars={allowHalfStars}
                          onPress={!isSubmitting ? (rating) => handleDetailedRatingChange(option.id, rating) : null}
                          animated={false}
                          style={styles.optionStars}
                        />

                        {tempDetailedRatings[option.id] > 0 && (
                          <Text style={styles.optionRatingText}>
                            {getRatingText(tempDetailedRatings[option.id])}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}

                  {Object.keys(tempDetailedRatings).length > 0 && (
                    <View style={styles.totalAverageContainer}>
                      <Text style={styles.totalAverageLabel}>میانگین کلی:</Text>
                      <View style={styles.totalAverageDisplay}>
                        <StarDisplay
                          rating={calculateAverageFromDetailedRatings(tempDetailedRatings)}
                          maxStars={maxStars}
                          size={28}
                          color={starColor}
                          emptyColor={emptyStarColor}
                          showHalfStars={true}
                          animated={false}
                        />
                        <Text style={styles.totalAverageText}>
                          {toPersianDigits(calculateAverageFromDetailedRatings(tempDetailedRatings).toFixed(1))}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.singleOptionContainer}>
                  <StarDisplay
                    rating={tempRating}
                    maxStars={maxStars}
                    size={40}
                    color={starColor}
                    emptyColor={emptyStarColor}
                    showHalfStars={allowHalfStars}
                    onPress={!isSubmitting ? setTempRating : null}
                    animated={false}
                    style={styles.modalStars}
                  />

                  {tempRating > 0 && (
                    <Text style={styles.modalRatingText}>
                      {getRatingText(tempRating)}
                    </Text>
                  )}

                  <Text style={styles.modalDescription}>
                    لطفاً امتیاز خود را انتخاب کنید
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={hideModalAnimation}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>{cancelButtonText}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !isSubmitEnabled() && styles.submitButtonDisabled
                ]}
                onPress={handleSubmitRating}
                disabled={!isSubmitEnabled()}
              >
                <LinearGradient
                  colors={isSubmitEnabled() ? [colors.primaryButton, colors.primaryDarkButton] : [colors.gray, colors.gray]}
                  style={styles.submitButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <MaterialIcons name="star" size={20} color={colors.white} />
                  )}
                  <Text style={styles.submitButtonText}>
                    {isSubmitting ? 'در حال ثبت...' : submitButtonText}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starButton: {
    padding: 2,
  },
  averageRatingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    width: '100%',
  },
  ratingInfo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  averageText: {
    fontSize: 18,
    fontFamily: 'Yekan_Bakh_Bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  countText: {
    fontSize: 12,
    fontFamily: 'Yekan_Bakh_Regular',
    textAlign: 'center',
  },
  userRatingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  userRatingLabel: {
    fontSize: 14,
    fontFamily: 'Yekan_Bakh_Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Yekan_Bakh_Regular',
    marginTop: 5,
    textAlign: 'center',
  },
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
    backgroundColor: colors.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 15,
    paddingBottom: 35,
    paddingHorizontal: 25,
    maxHeight: '85%',
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
    fontSize: 20,
    fontFamily: 'Yekan_Bakh_Bold',
    color: colors.dark,
  },
  modalBody: {
    maxHeight: 400,
    marginBottom: 20,
  },
  singleOptionContainer: {
    alignItems: 'center',
  },
  modalStars: {
    marginBottom: 15,
  },
  modalRatingText: {
    fontSize: 18,
    fontFamily: 'Yekan_Bakh_Bold',
    color: colors.dark,
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 14,
    fontFamily: 'Yekan_Bakh_Regular',
    color: colors.gray,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: -4,
  },
  multiOptionContainer: {
    width: '100%',
  },
  optionContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  optionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  optionTitleSection: {
    alignItems: 'flex-end',
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: 'Yekan_Bakh_Bold',
    color: colors.dark,
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 13,
    fontFamily: 'Yekan_Bakh_Regular',
    color: colors.gray,
  },
  optionAverageSection: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderRadius: 12,
    marginTop: -25,
    gap: 4,
  },
  optionAverageScore: {
    fontSize: 14,
    fontFamily: 'Yekan_Bakh_Bold',
    color: "#868686",
  },
  optionRatingContainer: {
    alignItems: 'center',
  },
  optionStars: {
    marginBottom: 8,
  },
  optionRatingText: {
    fontSize: 14,
    fontFamily: 'Yekan_Bakh_Bold',
    color: colors.primary,
    marginBottom: 4,
  },
  totalAverageContainer: {
    backgroundColor: colors.primaryDarkButton,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  totalAverageLabel: {
    fontSize: 16,
    fontFamily: 'Yekan_Bakh_Bold',
    color: colors.white,
    marginBottom: 12,
  },
  totalAverageDisplay: {
    alignItems: 'center',
  },
  totalAverageText: {
    fontSize: 20,
    fontFamily: 'Yekan_Bakh_Bold',
    color: colors.white,
    marginTop: 8,
  },
  modalActions: {
    flexDirection: 'row-reverse',
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Yekan_Bakh_Bold',
    color: colors.gray,
  },
  submitButton: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 10,
  },
  submitButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonGradient: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Yekan_Bakh_Bold',
    color: colors.white,
  },
});

export default MultiOptionRatingComponent;
export { StarDisplay };