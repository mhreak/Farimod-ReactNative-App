import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import appConfig from '../config/config';
import axios from 'axios';

const ContentReviewForm = ({ ContentId, reviewItemList = [], onSubmit }) => {
  const [ratings, setRatings] = useState({});

  const handleRating = (rating, itemId) => {
    setRatings(prev => ({
      ...prev,
      [itemId]: rating,
    }));
  };

  const handleSubmit = async () => {
    const reviewItemRatings = Object.entries(ratings).map(([id, rating]) => ({
      ContentReviewItemId: parseInt(id),
      Rating: rating,
    }));

    if (reviewItemRatings.length === 0) return;

    const payload = {
      ContnetId: ContentId, 
      reviewItemRatings,
    };

    try {
      await axios.post(`${appConfig.mobileApi}MemberReview/SendReview`, payload);
      onSubmit && onSubmit(ratings); 
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

 
};

export default ContentReviewForm;
