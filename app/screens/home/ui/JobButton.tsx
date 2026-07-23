import React, { useRef, useEffect, useState } from 'react';
import {
  TouchableOpacity,
  Image,
  Linking,
  StyleSheet,
  View,
  FlatList,
  LayoutChangeEvent,
} from 'react-native';

export interface SlideItem {
  id: string;
  imageSource: any;
  url?: string;
}

interface JobSliderProps {
  slides?: SlideItem[];
  autoPlayInterval?: number;
}

const DEFAULT_IMAGE = require('../../../../assets/web.png');
const SECOND_IMAGE = require('../../../../assets/resume.png');
const THIRD_IMAGE = require('../../../../assets/design-learn.png');
 


const DEFAULT_SLIDES: SlideItem[] = [
  { id: '1', imageSource: DEFAULT_IMAGE, url: 'https://www.farimod.ir' },
  { id: '2', imageSource: SECOND_IMAGE, url: 'https://share.google/TZCNi0lESeBnSrJbO' },
  { id: '3', imageSource: THIRD_IMAGE, url: 'https://www.farimod.ir' },
 
];

export default function JobSlider({
  slides = DEFAULT_SLIDES,
  autoPlayInterval = 4000,
}: JobSliderProps) {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!slides || slides.length <= 1 || containerWidth === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % slides.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [slides, autoPlayInterval, containerWidth]);

  const handlePress = async (url?: string) => {
    if (!url) return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.warn(`امکان باز کردن لینک وجود ندارد: ${url}`);
      }
    } catch (error) {
      console.error('خطا در باز کردن لینک:', error);
    }
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    if (width > 0) {
      setContainerWidth(width);
    }
  };

  const renderItem = ({ item }: { item: SlideItem }) => {
    const source =
      typeof item.imageSource === 'string'
        ? { uri: item.imageSource }
        : item.imageSource;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => handlePress(item.url)}
        style={{ width: containerWidth, height: '100%' }}
      >
        <Image source={source} style={styles.image} resizeMode="cover" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.cardWrapper}>
      {/* کانتینر اصلی که borderRadius و overflow داره */}
      <View style={styles.sliderContainer} onLayout={onLayout}>
        {containerWidth > 0 && (
          <FlatList
            ref={flatListRef}
            data={slides}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            bounces={false}
            getItemLayout={(_, index) => ({
              length: containerWidth,
              offset: containerWidth * index,
              index,
            })}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.round(
                e.nativeEvent.contentOffset.x / containerWidth
              );
              setCurrentIndex(newIndex);
            }}
          />
        )}
      </View>

      {/* نقطه‌های راهنما (Indicators) */}
      {slides.length > 1 && (
        <View style={styles.paginationContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    marginTop: 25,
    marginBottom: 10,
    paddingHorizontal: 16,


    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  sliderContainer: {
    width: '100%',
    height: 110,
    borderRadius: 20, 
    overflow: 'hidden', 
    backgroundColor: '#f3f4f6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 18, 
    backgroundColor: '#3b82f6', 
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#d1d5db',
  },
});