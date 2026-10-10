import { useEffect, useRef } from 'react';
import videoCache from '@/services/videoCache';
import { useGetPlaylistsQuery, useGetVideoDataMutation } from '@/services/mmkv-redux/apis/gumlet';

const VIDEO_CATEGORIES = ['mindful_morning', 'evening_winddown'];

/**
 * Hook for prefetching videos on app launch
 * This ensures videos are cached and ready to play instantly when users navigate to video screens
 */
export const useVideoPrefetch = () => {
  const prefetchCompletedRef = useRef(false);
  // const { data: fileResponse, isSuccess } = useGetFilesQuery();
  const { data: playlistInfo, isSuccess: isPlaylistFetched } = useGetPlaylistsQuery();

  const [ getVideoData ] = useGetVideoDataMutation();
  
  useEffect(() => {
    const getData = async () => {
      if(!prefetchCompletedRef.current && playlistInfo && isPlaylistFetched){
        prefetchCompletedRef.current = true;
        const data = await Promise.all(playlistInfo.map(async (pl) => await getVideoData(pl._id).unwrap() ?? []));
        videoCache
          .prefetchVideos(data.flat(), VIDEO_CATEGORIES)
          .then(() => {
            console.log('[VideoPrefetch] Video prefetch completed successfully');
          })
          .catch(error => {
            console.error('[VideoPrefetch] Video prefetch failed:', error);
          });;
      }
    }

    getData();
  }, [playlistInfo, isPlaylistFetched])

  // useEffect(() => {
  //   // Only prefetch once and only when data is available
  //   if (!prefetchCompletedRef.current && isSuccess && fileResponse) {
  //     prefetchCompletedRef.current = true;

  //     console.log('[VideoPrefetch] Starting video prefetch on app launch');

  //     // Start prefetching videos for both categories
  //     videoCache
  //       .prefetchVideos(fileResponse, VIDEO_CATEGORIES)
  //       .then(() => {
  //         console.log('[VideoPrefetch] Video prefetch completed successfully');
  //       })
  //       .catch(error => {
  //         console.error('[VideoPrefetch] Video prefetch failed:', error);
  //       });
  //   }
  // }, [fileResponse, isSuccess]);
};

export default useVideoPrefetch;
