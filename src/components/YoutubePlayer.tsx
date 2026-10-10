import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import YoutubeIframe from 'react-native-youtube-iframe';
import { useAppTheme } from '../hooks/themeHook';

interface YoutubePlayerProps {
  exercise: string;
  onClose: () => void;
}

const YoutubePlayer: React.FC<YoutubePlayerProps> = ({ exercise, onClose }) => {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { Colors } = useAppTheme();
  const screenWidth = Dimensions.get('window').width;

  // Timer state
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(sec => sec + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setSeconds(0);
    setIsActive(false);
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  const fetchYoutubeVideos = useCallback(() => {
    try {
      setLoading(true);
      setError(null);

      const id = getVideoIdForExercise(exercise);
      setVideoId(id);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError('Failed to load video. Please try again.');
      console.error('Error fetching YouTube video:', err);
    }
  }, [exercise]);

  useEffect(() => {
    fetchYoutubeVideos();
  }, [fetchYoutubeVideos]);

  const onStateChange = useCallback((state: string) => {
    if (state === 'ended') {
    }
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.white,
      borderRadius: 20,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      backgroundColor: Colors.greyColor100,
    },
    headerText: {
      fontSize: 16,
      fontFamily: 'Nunito-Bold',
      color: Colors.textColor,
      flex: 1,
      textAlign: 'center',
    },
    videoContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      fontSize: 14,
      fontFamily: 'Nunito-Medium',
      color: 'red',
      textAlign: 'center',
      padding: 16,
    },
    retryButton: {
      padding: 10,
      backgroundColor: Colors.primaryColor,
      borderRadius: 8,
      marginTop: 10,
    },
    retryButtonText: {
      color: 'white',
      fontFamily: 'Nunito-Bold',
      fontSize: 14,
    },
    timerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: Colors.white,
    },
    timerText: {
      fontSize: 48,
      fontFamily: 'Nunito-Bold',
      color: Colors.textColor,
      marginBottom: 20,
    },
    timerControls: {
      flexDirection: 'row',
      gap: 20,
    },
    timerButton: {
      backgroundColor: Colors.primaryColor,
      padding: 15,
      borderRadius: 50,
      elevation: 5,
    },
  });

  const getVideoIdForExercise = (exercise: string): string | null => {
    const exerciseVideos: Record<string, string> = {
      squat: '3SPB7Ev7f1w',
      deadlift: '5W4S3Yut1X0',
      lunges: 'BzqcoXo91WY',
      'leg press': 'r6a6FKcKZIs',
      'leg extension': 'LZyVwCyCOC4',
      'leg curl': '0dfKDD8ixic',
      'calf raise': '9cHZT5C2qGA',
      'hip thrust': 'SEtH8QGWBXM',
      'bulgarian split squat': '2C-uNgKwPLE',
      'glute bridge': '8bbE64NuDTU',
      'romanian deadlift': '2SHsk9AzdjA',
      'sumo squat': 'E3ACFBGB-Do',
      'box jump': 'X1TuhAn6C9I',

      'bench press': 'gRVjAtPip0Y',
      'push-up': '0pkjOk0EiAk',
      'overhead press': '2yjwXTZQDDI',
      'chest fly': 'eozdVDA78K0',
      'tricep extension': 'y8PhnAepu7M',
      'tricep pushdown': 'L4kLfxCSo1A',
      dips: '6kALZikXxLc',
      'lateral raise': '3VcKaXpzqRo',
      'front raise': 'sxUPx-BdVoE',
      'chest press': 'VmB1G1K7v94',
      'incline press': 'SrqOu55lrYU',
      'decline press': 'LfyQBUKR8SE',

      'pull-up': 'eGo4IYlbE5g',
      'dumbbell shoulder press': '0JfYxMRsUCQ',
      'chin-up': 'W3sDz9a_WDs',
      row: 'roCP6wCXPqo',
      'lat pulldown': 'CAwf7n6Luuc',
      'bicep curl': 'ykJmrZ5v0Oo',
      'hammer curl': 'b67s00J6b6I',
      'preacher curl': 'fIWP-FRFNU0',
      'face pull': 'rep-n3CS8zc',
      'reverse fly': 'MeIiIdhvXT4',
      shrug: 'yIhQkPp1b40',
      pullover: 'dR4Rz4HIL14',
      'barbell row': 'kBWAon7ItDw',

      plank: 'pSHjTRCQxIw',
      'sit-up': '1fbU_MkV7NE',
      crunch: '5ER5Of4MOPI',
      'russian twist': 'wkD8rjkodUI',
      'leg raise': 'l4kQd9eWclE',
      'mountain climber': 'nmwgirgXLYM',
      bicycle: 'Iwyvozckjak',
      'dead bug': 'g_BYB0V-Rvc',
      'hanging leg raise': 'hdng3Nm1x_E',
      'side plank': 'XeN4xJQJQA4',
      'ab wheel': 'rqiTPdK1c_I',
      'dragon flag': 'kICxJien7xM',

      burpee: 'TU8QYVW0gDw',
      'jumping jack': 'c4DAnQ6DtF8',
      'kettlebell swing': 'YSxHqn5wdZQ',
      'clean and jerk': 'PtDzKJuc6Ws',
      thruster: 'ZW3dzpAzxgI',
      'turkish get-up': '7qBgBHeY48M',
      snatch: 'zJFzXKJ2wSo',
      'bear crawl': 'bfT5TaRFKQw',
      'battle ropes': 'r2-JVbCwPrg',
      'medicine ball slam': 'qGPk0PUQKUg',
      wallball: 'fpUD0mcHLkc',

      running: 'brFHyOtTwH4',
      jogging: 'bYnhjT5ySLQ',
      sprinting: 'mUQBH4xXsFY',
      'jump rope': 'xF6-bM3-KhA',
      cycling: 'bafGhRRk468',
      rowing: 'H0r_ZPXJLtg',
      elliptical: 'mBMX7o8l4h8',
      'stair climber': 'QsMY1Ns8r_Y',
      swimming: 'aMpK6rZJTjI',
      treadmill: 'UPEDkZl7M-4',
      'ski erg': 'PWt5e3t8zYc',
      'assault bike': 'NhYqN4z7lis',

      yoga: 'v7AYKMP6rOE',
      pilates: '3s4d7B6d2WI',
      stretching: 'sTxC3J9CdLA',
      'foam rolling': 'M5BGiOcuPuY',
      'hip flexor stretch': 'YQmpO9VT2mY',
      'hamstring stretch': 'FDwpEdxZ4H4',
      'shoulder mobility': 'Y7fTR8CrAGM',
      'hip mobility': 'NG9qbvAN3gQ',
      'ankle mobility': 'IikP_teeLkI',
      't-spine rotation': 'Cg-Uc_Vsh6E',

      'overhead squat': 'pn3kClUEw5E',
      'front squat': 'v-mQm_droHg',
      'push press': 'X6-DMh-t4nQ',
      'power clean': 'KwYJTpQ5gUU',
      'hang clean': 'WCdhjt5eCzg',
      'hang snatch': '5o8TMa4r2Aw',
      'sumo deadlift': 'iUdkYLYsyVY',
      'zercher squat': 'C6HQkxSYtOA',
      'clean and press': 'uFFbDCLYEOI',
      'deficit deadlift': 'aXvemOtvQvA',

      'muscle up': 'V-Ddo7nlKWA',
      'handstand push-up': 'h6uYMJhJ0uM',
      'pistol squat': 'PZlLHVaf-eA',
      'human flag': 'IrXyv9SMCjk',
      'front lever': 'quFBLtkxMOw',
      'back lever': 'qprzNsC5eNc',
      planche: 'YRfTjstniMY',
      'l-sit': '1y6_DZbHkoo',
      'tuck planche': '14Jlg0p7Hj8',
      'ring dips': 'L9xhnJwTHhI',

      "farmer's walk": 'Fkzk_RqlYig',
      'sled push': 'RoUj4U3EiMQ',
      'prowler push': 'kgA0mHAfvBc',
      'tire flip': 'LUhGJkxWcmE',
      'sandbag carry': 'Z9JpGxzX5zY',
      'yoke walk': 'pHaFIoIK5Lk',
      'atlas stone': 'c_6mM6qpFAo',
      'medicine ball throw': 'VIKbPHBDOOw',
      'box step-up': 'sHv0MlJVVZg',
      "farmer's carry": 'rt17lmnaLSM',

      'dynamic warm-up': '3iN79pl1DqU',
      'joint mobility': 'y9Kw0PtGLyA',
      activation: 'G6Kdp_IgQFo',
      'movement prep': 'GCzL0n_iGXI',
      'primal movement': '7wCKLRXqfiE',
      'animal flow': 'w4rGMxLkfaY',

      'gym workout': 'B0CfitfhlDo',
      workout: 'UBMk30rjy0o',
      exercise: 'gC_L9qAHVJ8',
      fitness: 'vRTwPDLfHCo',
      'cool down and strech for 5-10 minutes': 'u5Hr3rNUZ24',
    };

    const exerciseLower = exercise.toLowerCase();

    if (exerciseVideos[exerciseLower]) {
      return exerciseVideos[exerciseLower];
    }

    for (const key in exerciseVideos) {
      if (exerciseLower.includes(key) || key.includes(exerciseLower)) {
        return exerciseVideos[key];
      }
    }

    return null;
  };

  useEffect(() => {
    try {
      setLoading(true);
      setError(null);
      const id = getVideoIdForExercise(exercise);
      setVideoId(id);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError('Failed to load video thumbnail');
      console.error('Error fetching YouTube video ID:', err);
    }
  }, [exercise]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Icon name="close" size={24} color={Colors.textColor} />
        </TouchableOpacity>
        <Text style={styles.headerText}>{exercise} Tutorial</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryColor} />
          <Text>Loading exercise video...</Text>
        </View>
      ) : error ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchYoutubeVideos}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : videoId ? (
        <View style={styles.videoContainer}>
          <YoutubeIframe
            height={200}
            width={screenWidth - 40}
            videoId={videoId || ''}
            play={true}
            onChangeState={onStateChange}
          />
        </View>
      ) : (
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{formatTime(seconds)}</Text>
          <View style={styles.timerControls}>
            <TouchableOpacity style={styles.timerButton} onPress={toggleTimer}>
              <Icon
                name={isActive ? 'pause' : 'play-arrow'}
                size={32}
                color={Colors.white}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.timerButton} onPress={resetTimer}>
              <Icon name="refresh" size={32} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default YoutubePlayer;
