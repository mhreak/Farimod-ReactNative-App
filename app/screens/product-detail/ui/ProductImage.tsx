  import React, { useEffect, useRef, useState, useCallback ,memo} from "react";
import {
  View,
  Image,
  ActivityIndicator,
} from "react-native";



 const ProductImage = ({ source, style, resizeMode = "cover", onError, onLoad }:any) => {
    const [imageError, setImageError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleImageError = (error:any) => {
      console.log('Product image error:', error.nativeEvent?.error);
      setImageError(true);
      setIsLoading(false);
      if (onError) {
        onError(error);
      }
    };

    const handleImageLoad = () => {
      setIsLoading(false);
      setImageError(false);
      if (onLoad) {
        onLoad();
      }
    };

    if (imageError) {
      return (
        <Image
          source={require("../../../../assets/Product_icon.jpg")}
          style={[style, { backgroundColor: '#f5f5f5' }]}
          resizeMode={resizeMode}
        />
      );
    }

    return (
      <>
        <Image
          source={typeof source === 'string' ? { uri: source } : source}
          style={style}
          resizeMode={resizeMode}
          onError={handleImageError}
          onLoad={handleImageLoad}
          onLoadStart={() => setIsLoading(true)}
        />
        {isLoading && (
          <View style={[style, {
            position: 'absolute',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f5f5f5'
          }]}>
            <ActivityIndicator size="small" color="#ccc" />
          </View>
        )}
      </>
    );
  };
export default memo(ProductImage);  