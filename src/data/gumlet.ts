// export const MINDFUL_MORNING = [
//   {
//     "id": "694bfee24a66e617af191322",
//     "assetId": "694bfe0bb122cbf1763bcd6e",
//     "title": "Walk In The Woods",
//     "duration": 114.932161,
//     "playbackUrl": "https://video.gumlet.io/69370ff13dd43f39be9a1b6b/694bfe0bb122cbf1763bcd6e/main.m3u8",
//     "thumbnailUrl": "https://video.gumlet.io/69370ff13dd43f39be9a1b6b/694bfe0bb122cbf1763bcd6e/thumbnail-1-0.png",
//     "tag": [
//       "mindful_morning"
//     ]
//   },
//   {
//     "id": "694bff084a66e617af191324",
//     "assetId": "694bfe0bf1ad267a0646f1c5",
//     "title": "Coffee And Me",
//     "duration": 111.16556,
//     "playbackUrl": "https://video.gumlet.io/69370ff13dd43f39be9a1b6b/694bfe0bf1ad267a0646f1c5/main.m3u8",
//     "thumbnailUrl": "https://video.gumlet.io/69370ff13dd43f39be9a1b6b/694bfe0bf1ad267a0646f1c5/thumbnail-1-0.png",
//     "tag": [
//       "mindful_morning"
//     ]
//   },
//   {
//     "id": "694bfea74a66e617af191320",
//     "assetId": "694bfe0be086c47a8221d49f",
//     "title": "Sun Rise on The Shores",
//     "duration": 119.965495,
//     "playbackUrl": "https://video.gumlet.io/69370ff13dd43f39be9a1b6b/694bfe0be086c47a8221d49f/main.m3u8",
//     "thumbnailUrl": "https://video.gumlet.io/69370ff13dd43f39be9a1b6b/694bfe0be086c47a8221d49f/thumbnail-1-0.png",
//     "tag": [
//       "mindful_morning"
//     ]
//   }
// ]

// export const EVENING_WIND_DOWN = [
//   {
//     "id": "694bff384a66e617af191326",
//     "assetId": "694bfe0be086c47a8221d4a5",
//     "title": "Northern Lights",
//     "duration": 119.965495,
//     "playbackUrl": "https://video.gumlet.io/69370ff13dd43f39be9a1b6b/694bfe0be086c47a8221d4a5/main.m3u8",
//     "thumbnailUrl": "https://video.gumlet.io/69370ff13dd43f39be9a1b6b/694bfe0be086c47a8221d4a5/thumbnail-1-0.png",
//     "tag": [
//       "evening_winddown"
//     ]
//   },
//   {
//     "id": "694bfec24a66e617af191321",
//     "assetId": "694bfe0bf1ad267a0646f1c7",
//     "title": "The Milky Way",
//     "duration": 119.965495,
//     "playbackUrl": "https://video.gumlet.io/69370ff13dd43f39be9a1b6b/694bfe0bf1ad267a0646f1c7/main.m3u8",
//     "thumbnailUrl": "https://video.gumlet.io/69370ff13dd43f39be9a1b6b/694bfe0bf1ad267a0646f1c7/thumbnail-1-0.png",
//     "tag": [
//       "evening_winddown"
//     ]
//   },
//   {
//     "id": "694bff204a66e617af191325",
//     "assetId": "694bfe0bb122cbf1763bcd6c",
//     "title": "Stargazing",
//     "duration": 119.965495,
//     "playbackUrl": "https://video.gumlet.io/69370ff13dd43f39be9a1b6b/694bfe0bb122cbf1763bcd6c/main.m3u8",
//     "thumbnailUrl": "https://video.gumlet.io/69370ff13dd43f39be9a1b6b/694bfe0bb122cbf1763bcd6c/thumbnail-1-0.png",
//     "tag": [
//       "evening_winddown"
//     ]
//   }
// ]

// ============================================================================
// GUMLET VIDEO DATA — used by task generation for watch_video tasks
// ============================================================================

export interface GumletVideo {
  id: string;
  assetId: string;
  title: string;
  duration: number;
  playbackUrl: string;
  thumbnailUrl: string;
  tag: string[];
}

export const MINDFUL_MORNING: GumletVideo[] = [
  {
    id: '694bfee24a66e617af191322',
    assetId: '694bfe0bb122cbf1763bcd6e',
    title: 'Walk In The Woods',
    duration: 114.932161,
    playbackUrl:
      'https://video.gumlet.io/69370ff13dd43f39be9a1b6b/694bfe0bb122cbf1763bcd6e/main.m3u8',
    thumbnailUrl:
      'https://video.gumlet.io/69370ff13dd43f39be9a1b6b/694bfe0bb122cbf1763bcd6e/thumbnail-1-0.png',
    tag: ['mindful_morning'],
  },
  {
    id: '694bff084a66e617af191324',
    assetId: '694bfe0bf1ad267a0646f1c5',
    title: 'Coffee And Me',
    duration: 111.16556,
    playbackUrl:
      'https://video.gumlet.io/69370ff13dd43f39be9a1b6b/694bfe0bf1ad267a0646f1c5/main.m3u8',
    thumbnailUrl:
      'https://video.gumlet.io/69370ff13dd43f39be9a1b6b/694bfe0bf1ad267a0646f1c5/thumbnail-1-0.png',
    tag: ['mindful_morning'],
  },
  {
    id: '694bfea74a66e617af191320',
    assetId: '694bfe0be086c47a8221d49f',
    title: 'Sun Rise on The Shores',
    duration: 119.965495,
    playbackUrl:
      'https://video.gumlet.io/69370ff13dd43f39be9a1b6b/694bfe0be086c47a8221d49f/main.m3u8',
    thumbnailUrl:
      'https://video.gumlet.io/69370ff13dd43f39be9a1b6b/694bfe0be086c47a8221d49f/thumbnail-1-0.png',
    tag: ['mindful_morning'],
  },
];

export const EVENING_WIND_DOWN: GumletVideo[] = [
  {
    id: '694bff384a66e617af191326',
    assetId: '694bfe0be086c47a8221d4a5',
    title: 'Northern Lights',
    duration: 119.965495,
    playbackUrl:
      'https://video.gumlet.io/69370ff13dd43f39be9a1b6b/694bfe0be086c47a8221d4a5/main.m3u8',
    thumbnailUrl:
      'https://video.gumlet.io/69370ff13dd43f39be9a1b6b/694bfe0be086c47a8221d4a5/thumbnail-1-0.png',
    tag: ['evening_winddown'],
  },
  {
    id: '694bfec24a66e617af191321',
    assetId: '694bfe0bf1ad267a0646f1c7',
    title: 'The Milky Way',
    duration: 119.965495,
    playbackUrl:
      'https://video.gumlet.io/69370ff13dd43f39be9a1b6b/694bfe0bf1ad267a0646f1c7/main.m3u8',
    thumbnailUrl:
      'https://video.gumlet.io/69370ff13dd43f39be9a1b6b/694bfe0bf1ad267a0646f1c7/thumbnail-1-0.png',
    tag: ['evening_winddown'],
  },
  {
    id: '694bff204a66e617af191325',
    assetId: '694bfe0bb122cbf1763bcd6c',
    title: 'Stargazing',
    duration: 119.965495,
    playbackUrl:
      'https://video.gumlet.io/69370ff13dd43f39be9a1b6b/694bfe0bb122cbf1763bcd6c/main.m3u8',
    thumbnailUrl:
      'https://video.gumlet.io/69370ff13dd43f39be9a1b6b/694bfe0bb122cbf1763bcd6c/thumbnail-1-0.png',
    tag: ['evening_winddown'],
  },
];

/** Pick a random video from a list */
export function pickRandomVideo(videos: GumletVideo[]): GumletVideo {
  return videos[Math.floor(Math.random() * videos.length)];
}

/** Pick video appropriate for time of day */
export function pickVideoForTime(
  timeOfDay: 'morning' | 'evening',
): GumletVideo {
  const pool = timeOfDay === 'evening' ? EVENING_WIND_DOWN : MINDFUL_MORNING;
  return pickRandomVideo(pool);
}

/** Get all video titles for prompt context */
export function getAvailableVideoTitles(): {
  morning: string[];
  evening: string[];
} {
  return {
    morning: MINDFUL_MORNING.map(v => v.title),
    evening: EVENING_WIND_DOWN.map(v => v.title),
  };
}
