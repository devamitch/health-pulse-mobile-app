import { AppStackParamList } from '@/navigation/main_route';
import { NavigationProp } from '@react-navigation/native';
import { memo, useCallback, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ImageBackground,
  ListRenderItem,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ReactNativeEmbedPlayerView } from '@gumlet/react-native-embed-player';
import { MINDFUL_MORNING, EVENING_WIND_DOWN } from '@/data/gumlet';

const { height } = Dimensions.get('screen');


interface VideoItem {
  id: string;
  assetId: string;
  title: string;
  duration: number;
  playbackUrl: string;
  thumbnailUrl: string;
  tag: string[];
}

interface VideoPlayerProps {
  screen: 'evening_winddown' | 'mindful_morning';
  style?: ViewStyle;
  insetTop: number;
  onBackPress: () => void;
  navigation: NavigationProp<AppStackParamList>;
}

const VideoListItem = memo<{
  item: VideoItem;
  onPress: (assetId: string) => void;
}>(({ item, onPress }) => {
  const handlePress = useCallback(
    () => onPress(item.assetId),
    [onPress, item.assetId],
  );

  return (
    <TouchableOpacity
      style={styles.listItemContainer}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <ImageBackground
        source={{ uri: item.thumbnailUrl }}
        style={styles.listItem}
        imageStyle={styles.listItemImage}
      >
        <View style={styles.playIconContainer}>
          <Ionicons name="play-circle" size={48} color="rgba(255, 255, 255, 0.9)" />
        </View>
        <View style={styles.listItemOverlay} />
        <View style={styles.listItemContent}>
          <Text style={styles.listItemTitle}>{item.title}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
});

VideoListItem.displayName = 'VideoListItem';

const VideoScreen: React.FC<VideoPlayerProps> = ({
  screen,
  insetTop,
  onBackPress,
}) => {
  const videoData = screen === 'evening_winddown' ? EVENING_WIND_DOWN : MINDFUL_MORNING;
  const [currentAssetId, setCurrentAssetId] = useState<string>(videoData[0]?.assetId);

  const handleVideoPress = useCallback((assetId: string) => {
    setCurrentAssetId(assetId);
  }, []);

  const handleVideoEnd = useCallback(() => {
    // Auto-play next video
    const currentIndex = videoData.findIndex(v => v.assetId === currentAssetId);
    const nextIndex = (currentIndex + 1) % videoData.length;
    if (videoData[nextIndex]) {
      setCurrentAssetId(videoData[nextIndex].assetId);
    }
  }, [currentAssetId, videoData]);

  const renderItem: ListRenderItem<VideoItem> = useCallback(
    ({ item }) => <VideoListItem item={item} onPress={handleVideoPress} />,
    [handleVideoPress],
  );

  const keyExtractor = useCallback((item: VideoItem) => item.assetId, []);

  const renderHeader = useCallback(
    () => (
      <View>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        {/* Video Player */}
        <View style={styles.videoContainer}>
          <ReactNativeEmbedPlayerView
            video_id={currentAssetId}
            style={styles.video}
            preload={true}
            onPlayerEnded={handleVideoEnd}
          />
        </View>
      </View>
    ),
    [currentAssetId, handleVideoEnd],
  );

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="transparent"
        barStyle="light-content"
        translucent
      />
      
      <FlatList
        data={videoData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {/* Back Button */}
      <TouchableOpacity
        style={[styles.backButton, { top: insetTop + 25 }]}
        onPress={onBackPress}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

export default memo(VideoScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  listContent: {
    paddingBottom: 24,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding:2,
    borderRadius: 12,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 10,
  },
  videoContainer: {
       marginTop: 64,
    width: '100%',
    height: 220,
    borderRadius: 20,
    marginBottom: 64,
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
    borderRadius: 20,
  },
  listItemContainer: {
    width: '92%',
    height: 110,
    marginTop: 16,
    alignSelf: 'center',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#2C2C2E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  listItem: {
    flex: 1,
    justifyContent: 'center',
  },
  listItemImage: {
    borderRadius: 20,
  },
  playIconContainer: {
    position: 'absolute',
    left: 24,
    zIndex: 3,
  },
  listItemOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
  },
  listItemContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 90,
    paddingRight: 24,
  },
  listItemTitle: {
    fontFamily: 'Nunito-Sans',
    fontWeight: '700',
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'left',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
