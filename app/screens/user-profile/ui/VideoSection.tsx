import React, { useEffect, useState, memo } from "react";
import { View, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import AppText from "../../../components/Text";
import { VideoView, useVideoPlayer } from 'expo-video'; // اصلاح ایمپورت‌ها
import { styles, modernColors } from "../styles/styles";

export const VideoSection = memo(({ userData, animatedValues }: any) => {
  const [videoError, setVideoError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);

  const hasVideoData = userData?.IntroductionVideoFileName || userData?.IntroductionVideoURL;
  const videoUrl = userData?.IntroductionVideoURL || userData?.VideoURL || null;

  const videoSource = videoUrl ? { uri: videoUrl } : null;

  const player = useVideoPlayer(videoSource, (playerInstance) => {
    playerInstance.loop = false;
  });

  useEffect(() => {
    if (!player) return;

    if (player.status === 'readyToPlay') {
      setVideoLoading(false);
    }

    const statusListener = player.addListener('statusChange', (status) => {
      if (status === 'readyToPlay') {
        setVideoLoading(false);
        setVideoError(false);
      } else if (status === 'loading') {
        setVideoLoading(true);
      } else if (status === 'failed') {
        setVideoError(true);
        setVideoLoading(false);
      }
    });

    return () => {
      statusListener.remove();
    };
  }, [player]);

  if (!hasVideoData) {
    return null;
  }

  if (!videoUrl || videoError) {
    return (
      <View style={styles.videoSection}>
        <View style={styles.videoPlaceholder}>
          <MaterialIcons name="play-circle-outline" size={60} color={modernColors.medium} />
          <AppText style={styles.videoPlaceholderText}>ویدیو موجود نیست</AppText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.videoSection}>
      <LinearGradient
        colors={[modernColors.primary + '10', modernColors.accent + '10']}
        style={styles.videoWrapper}
      >
        <View style={styles.videoShadow}>
          {videoLoading && (
            <View style={styles.videoLoadingContainer}>
              <ActivityIndicator
                size="large"
                color={modernColors.primary}
                style={styles.videoLoadingIndicator}
              />
              <AppText style={styles.videoLoadingText}>در حال بارگذاری ویدیو...</AppText>
            </View>
          )}
          
          <VideoView
            player={player}
            style={[
              styles.videoPlayer,
              {
                width: '100%', 
                height: 200, 
                display: videoLoading ? 'none' : 'flex' 
              }
            ]}
            contentFit="cover"
            nativeControls
          />
        </View>
      </LinearGradient>
    </View>
  );
});



// import React, { useEffect, useRef, useState,memo,useCallback } from "react";
// import {

//   View,
//   ActivityIndicator,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { MaterialIcons } from "@expo/vector-icons";
// import AppText from "../../../components/Text";
// import { VideoView } from 'expo-video';
// import { useVideoPlayer } from 'expo-video';
// import { styles ,modernColors } from "../styles/styles";

// export const VideoSection = memo(({ userData, animatedValues }:any) => {
//   const [videoError, setVideoError] = useState(false);
//   const [videoLoading, setVideoLoading] = useState(true);

//   const hasVideoData = userData?.IntroductionVideoFileName || userData?.IntroductionVideoURL;
//   const videoSource = userData?.IntroductionVideoURL || userData?.VideoURL || null;


//   const player = useVideoPlayer(hasVideoData ? videoSource : null, (playerInstance) => {
//     playerInstance.loop = false;
//   });

//   useEffect(() => {
//     if (!player) return;

//     const statusListener = player.addListener('statusChange', (status) => {
//       if (status === 'readyToPlay') {
//         setVideoLoading(false);
//       } else if (status === 'loading') {
//         setVideoLoading(true);
//       } else if (status === 'failed') {
//         setVideoError(true);
//         setVideoLoading(false);
//       }
//     });

//     return () => {
//       statusListener.remove();
//     };
//   }, [player]);

//   if (!hasVideoData) {
//     return null;
//   }

//   if (!videoSource || videoError) {
//     return (
//       <View style={styles.videoSection}>
//         <View style={styles.videoPlaceholder}>
//           <MaterialIcons name="play-circle-outline" size={60} color={modernColors.medium} />
//           <AppText style={styles.videoPlaceholderText}>ویدیو موجود نیست</AppText>
//         </View>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.videoSection}>
//       <LinearGradient
//         colors={[modernColors.primary + '10', modernColors.accent + '10']}
//         style={styles.videoWrapper}
//       >
//         <View style={styles.videoShadow}>
//           {videoLoading && (
//             <View style={styles.videoLoadingContainer}>
//               <ActivityIndicator
//                 size="large"
//                 color={modernColors.primary}
//                 style={styles.videoLoadingIndicator}
//               />
//               <AppText style={styles.videoLoadingText}>در حال بارگذاری ویدیو...</AppText>
//             </View>
//           )}

//           <VideoView
//             player={player}
//             style={[
//               styles.videoPlayer,
//               {
//                 opacity: videoLoading ? 0 : 1,
//                 zIndex: videoLoading ? 1 : 5
//               }
//             ]}
//             contentFit="cover"
//             nativeControls
//           />
//         </View>
//       </LinearGradient>
//     </View>
//   );
// });