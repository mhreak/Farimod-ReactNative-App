export const transformContentReviewToRatingOptions = (contentReviewList:any) => {
  if (!contentReviewList || contentReviewList.length === 0) {
    return [
      {
        id: 'quality',
        title: 'کیفیت محصول',
        subtitle: 'کیفیت کلی و ساخت',
        contentReviewItemId: 'quality'
      },
      {
        id: 'price',
        title: 'ارزش خرید',
        subtitle: 'تناسب قیمت و کیفیت',
        contentReviewItemId: 'price'
      },
      {
        id: 'design',
        title: 'طراحی',
        subtitle: 'زیبایی و جذابیت',
        contentReviewItemId: 'design'
      },
      {
        id: 'satisfaction',
        title: 'رضایت کلی',
        subtitle: 'رضایت از خرید',
        contentReviewItemId: 'satisfaction'
      }
    ];
  }

  return contentReviewList
    .filter(item => item.Active)
    .sort((a, b) => a.ShowOrder - b.ShowOrder)
    .map(item => ({
      id: `review_${item.ContentReviewItemId}`,
      title: item.Text,
      subtitle: '',
      contentReviewItemId: item.ContentReviewItemId,
      showOrder: item.ShowOrder,
      averageRating: item.CalculatedAverageRating || 0
    }));
};