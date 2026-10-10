import RNFS from 'react-native-fs';

export type CacheResult = {
  uri: string;
  cached: boolean;
};

export type CacheError = {
  error: string;
  fallbackUri?: string;
};

export type UseCachedImageReturn = {
  cachedUri: string | null;
  loading: boolean;
  error: string | null;
  updateImage: (newUrl: string) => Promise<void>;
};

const CACHE_DIR = `${RNFS.CachesDirectoryPath}/images`;

export const initCache = async (): Promise<void> => {
  try {
    const exists = await RNFS.exists(CACHE_DIR);
    if (!exists) {
      await RNFS.mkdir(CACHE_DIR);
    }
  } catch (error) {
    console.error('Init cache error:', error);
  }
};

const getFilePath = (key: string): string => {
  const sanitizedKey = key.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  return `${CACHE_DIR}/${sanitizedKey}.jpg`;
};

export const cacheImage = async (
  url: string,
  key: string
): Promise<string> => {
  try {
    await initCache();
    const filePath = getFilePath(key);
    
    // Check if already cached
    const exists = await RNFS.exists(filePath);
    if (exists) {
      return `file://${filePath}`;
    }

    // Download and cache
    const download = await RNFS.downloadFile({
      fromUrl: url,
      toFile: filePath,
    }).promise;

    if (download.statusCode === 200) {
      return `file://${filePath}`;
    }
    
    throw new Error('Download failed');
  } catch (error) {
    console.error('Cache error:', error);
    return url;
  }
};

export const updateCachedImage = async (
  url: string,
  key: string
): Promise<string> => {
  try {
    await deleteImage(key);
    return await cacheImage(url, key);
  } catch (error) {
    console.error('Update error:', error);
    return url;
  }
};

export const deleteImage = async (key: string): Promise<void> => {
  try {
    const filePath = getFilePath(key);
    const exists = await RNFS.exists(filePath);
    
    if (exists) {
      await RNFS.unlink(filePath);
      console.log(`Deleted cache for key: ${key}`);
    }
  } catch (error) {
    console.error('Delete error:', error);
  }
};

export const deleteImages = async (keys: string[]): Promise<void> => {
  try {
    await Promise.all(keys.map(key => deleteImage(key)));
  } catch (error) {
    console.error('Delete multiple images error:', error);
  }
};

export const clearAllCache = async (): Promise<void> => {
  try {
    const exists = await RNFS.exists(CACHE_DIR);
    
    if (exists) {
      await RNFS.unlink(CACHE_DIR);
      await RNFS.mkdir(CACHE_DIR);
      console.log('All cache cleared');
    }
  } catch (error) {
    console.error('Clear cache error:', error);
  }
};

export const getCachedImagePath = async (
  key: string
): Promise<string | null> => {
  try {
    const filePath = getFilePath(key);
    const exists = await RNFS.exists(filePath);
    
    return exists ? `file://${filePath}` : null;
  } catch (error) {
    console.error('Get cache error:', error);
    return null;
  }
};


export const isImageCached = async (key: string): Promise<boolean> => {
  try {
    const filePath = getFilePath(key);
    return await RNFS.exists(filePath);
  } catch (error) {
    console.error('Check cache error:', error);
    return false;
  }
};

export const getCacheSize = async (): Promise<number> => {
  try {
    const exists = await RNFS.exists(CACHE_DIR);
    if (!exists) return 0;
    
    const files = await RNFS.readDir(CACHE_DIR);
    const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
    return totalSize;
  } catch (error) {
    console.error('Get cache size error:', error);
    return 0;
  }
};
