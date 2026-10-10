import { ColorScheme, ElevationScheme } from '@/constants/theme';
import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '@/hooks/themeHook';
import {
  PatienceLevel,
  VideoTrackingData,
} from '@/lib/types/game-progression.types';
import { ReactNativeEmbedPlayerView } from '@gumlet/react-native-embed-player';
import React, { memo, useCallback, useMemo, useRef } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WatchVideoActionProps {
  asset_id?: string;
  accentColor?: string;
  onEnd?: (trackingData?: VideoTrackingData) => void;
  videoUrl?: string;
}

function calculatePatienceLevel(
  completionPercentage: number,
  pauseCount: number,
): PatienceLevel {
  if (completionPercentage >= 90 && pauseCount <= 1) return 'high';
  if (completionPercentage >= 90 && pauseCount > 3) return 'medium';
  return 'low';
}

const WatchVideoAction: React.FC<WatchVideoActionProps> = ({
  asset_id = '694bfe0bb122cbf1763bcd6e',
  accentColor = '#7C60C8',
  onEnd,
}) => {
  const { Colors, DEffect } = useAppTheme();
  const styles = useMemo(
    () => createStyles(Colors, DEffect),
    [Colors, DEffect],
  );

  const startTimeRef = useRef<number>(Date.now());
  const pauseCountRef = useRef<number>(0);
  const playDurationRef = useRef<number>(0);
  const lastPlayStartRef = useRef<number>(Date.now());
  const videoDurationRef = useRef<number>(0);

  const handlePlayerPause = useCallback(() => {
    pauseCountRef.current += 1;
    const now = Date.now();
    playDurationRef.current += (now - lastPlayStartRef.current) / 1000;
  }, []);

  const handlePlayerPlay = useCallback(() => {
    lastPlayStartRef.current = Date.now();
  }, []);

  const handlePlayerEnd = useCallback(() => {
    const now = Date.now();
    playDurationRef.current += (now - lastPlayStartRef.current) / 1000;
    const totalTimeSpent = (now - startTimeRef.current) / 1000;
    const duration = videoDurationRef.current || playDurationRef.current;
    const completionPercentage =
      duration > 0
        ? Math.min(100, (playDurationRef.current / duration) * 100)
        : 100;

    const patienceLevel = calculatePatienceLevel(
      completionPercentage,
      pauseCountRef.current,
    );

    const trackingData: VideoTrackingData = {
      playDuration: Math.round(playDurationRef.current),
      pauseCount: pauseCountRef.current,
      completionPercentage: Math.round(completionPercentage),
      patienceLevel,
      timeSpent: Math.round(totalTimeSpent),
    };

    onEnd?.(trackingData);
  }, [onEnd]);

  return (
    <View style={styles.container}>
      <View style={styles.videoWrapper}>
        <ReactNativeEmbedPlayerView
          video_id={asset_id}
          style={styles.video}
          preload={true}
          onPlayerEnded={handlePlayerEnd}
          onPlayerPaused={handlePlayerPause}
          onPlayerPlaying={handlePlayerPlay}
        />
      </View>
      <View style={styles.infoSection}>
        <MaterialCommunityIcons
          name="meditation"
          size={22}
          color={accentColor}
        />
        <Text style={styles.infoText}>
          Watch the video to complete this quest
        </Text>
      </View>
    </View>
  );
};

const createStyles = (Colors: ColorScheme, _DEffect: ElevationScheme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      marginTop: 8,
    },
    videoWrapper: {
      width: '100%',
      height: SCREEN_WIDTH * 0.47,
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: '#1C1C1E',
    },
    video: {
      width: '100%',
      height: '100%',
    },
    infoSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 14,
      paddingHorizontal: 4,
    },
    infoText: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: Colors.textSecondary,
    },
  });

export { WatchVideoAction };
export default memo(WatchVideoAction);
