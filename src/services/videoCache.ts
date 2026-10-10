import RNFS from 'react-native-fs';
import { Platform } from 'react-native';
import { VideoItem } from './mmkv-redux/apis';

export interface CachedVideoInfo {
  url: string;
  localPath: string;
  fileName: string;
  category: string;
  timestamp: number;
}

// Cache directory paths
const CACHE_DIR = Platform.select({
  ios: RNFS.CachesDirectoryPath + '/video_cache',
  android: RNFS.CachesDirectoryPath + '/video_cache',
  default: '', // Fallback for unknown platforms
});

if (!CACHE_DIR) {
  console.error('[VideoCache] Unsupported platform or RNFS not available');
}

// Video cache configuration
const VIDEO_CACHE_CONFIG = {
  // Maximum cache size in bytes (1GB)
  MAX_CACHE_SIZE: 1024 * 1024 * 1024,
  // Maximum number of videos to cache per category
  MAX_VIDEOS_PER_CATEGORY: 10,
  // Cache expiry (7 days in milliseconds)
  CACHE_EXPIRY: 7 * 24 * 60 * 60 * 1000,
};

/**
 * Video caching service for prefetching and caching videos locally
 */
class VideoCache {
  private cacheIndex: Map<string, CachedVideoInfo> = new Map();

  constructor() {
    this.initializeCache();
  }

  /**
   * Initialize cache directory and load existing cache index
   */
  private async initializeCache(): Promise<void> {
    try {
      console.log(`[VideoCache] Initializing cache directory: ${CACHE_DIR}`);

      // Ensure cache directory exists
      const exists = await RNFS.exists(CACHE_DIR!);
      console.log(`[VideoCache] Cache directory exists: ${exists}`);

      if (!exists) {
        console.log(`[VideoCache] Creating cache directory: ${CACHE_DIR}`);
        await RNFS.mkdir(CACHE_DIR!);

        // Verify directory was created (especially important for iOS)
        const created = await RNFS.exists(CACHE_DIR!);
        if (!created) {
          console.error(
            `[VideoCache] Failed to create cache directory: ${CACHE_DIR}`,
          );
          if (Platform.OS === 'ios') {
            console.warn(
              '[VideoCache] iOS sandboxing may prevent directory creation',
            );
          }
          return; // Don't proceed if directory creation failed
        }
        console.log(
          `[VideoCache] Cache directory created successfully: ${CACHE_DIR}`,
        );
      }

      // One-time cache clearing for sanitized filenames
      const cleanedFlagPath = `${CACHE_DIR}/.cache_cleaned_v2`;
      const cleanedFlagExists = await RNFS.exists(cleanedFlagPath);

      if (!cleanedFlagExists) {
        console.log(
          '[VideoCache] First run with updated file extensions, clearing old cache',
        );
        await this.clearCache();
        await RNFS.writeFile(cleanedFlagPath, 'cleaned');
      }

      // Load cached index from file
      await this.loadCacheIndex();
    } catch (error) {
      console.error(`[VideoCache] Error initializing cache:`, error);
      if (Platform.OS === 'ios') {
        console.error(
          `[VideoCache] iOS file system error - ${
            (error as Error)?.message || error
          }`,
        );
      }
    }
  }

  /**
   * Load cache index from disk
   */
  private async loadCacheIndex(): Promise<void> {
    try {
      const indexPath = this.getCacheIndexPath();
      console.log(`[VideoCache] Loading cache index from: ${indexPath}`);

      const exists = await RNFS.exists(indexPath);
      console.log(`[VideoCache] Cache index file exists: ${exists}`);

      if (exists) {
        const content = await RNFS.readFile(indexPath);
        const data = JSON.parse(content);
        this.cacheIndex = new Map(data);
        console.log(
          `[VideoCache] Loaded ${this.cacheIndex.size} cached videos`,
        );
      } else {
        console.log('[VideoCache] No existing cache index found');
        this.cacheIndex = new Map();
      }
    } catch (error) {
      console.error('[VideoCache] Error loading cache index:', error);
      if (Platform.OS === 'ios') {
        console.error(
          `[VideoCache] iOS cache index load error: ${
            (error as Error)?.message || error
          }`,
        );
      }
      this.cacheIndex = new Map();
    }
  }

  /**
   * Save cache index to disk
   */
  private async saveCacheIndex(): Promise<void> {
    try {
      const indexPath = this.getCacheIndexPath();
      const data = Array.from(this.cacheIndex.entries());
      await RNFS.writeFile(indexPath, JSON.stringify(data));
    } catch (error) {
      console.warn('[VideoCache] Error saving cache index:', error);
    }
  }

  /**
   * Get cache index file path
   */
  private getCacheIndexPath(): string {
    return `${CACHE_DIR}/cache_index.json`;
  }

  /**
   * Extract file extension from URL
   */
  private getFileExtension(url: string): string {
    try {
      // Extract extension from URL (e.g., .mp4, .mov)
      const urlPath = url?.split('?')[0] || ''; // Remove query params
      const match = urlPath.match(/\.([a-zA-Z0-9]+)$/);
      return match ? `.${match[1]}` : '.mp4'; // Default to .mp4 if not found
    } catch (error) {
      console.warn('[VideoCache] Error extracting file extension:', error);
      return '.mp4'; // Default to .mp4
    }
  }

  /**
   * Generate local cache path for a video - CRITICAL FIX for iOS
   */
  private getCachePath(fileName: string, url: string): string {
    // Sanitize filename to remove spaces and special characters
    const sanitizedFileName = fileName
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, '');

    // CRITICAL: Extract and preserve file extension for iOS AVFoundation
    const extension = this.getFileExtension(url);

    // Ensure the file has the correct extension
    const fileNameWithExtension = sanitizedFileName.endsWith(extension)
      ? sanitizedFileName
      : `${sanitizedFileName}${extension}`;

    const fullPath = `${CACHE_DIR}/${fileNameWithExtension}`;

    if (Platform.OS === 'ios') {
      console.log(
        `[VideoCache] iOS cache path: ${fullPath} (extension: ${extension})`,
      );
    }

    return fullPath;
  }

  /**
   * Check if video is cached and not expired
   */
  isVideoCached(url: string): boolean {
    const cached = this.cacheIndex.get(url);
    if (!cached) return false;

    // Check if file actually exists and not expired
    const now = Date.now();
    const expired = now - cached.timestamp > VIDEO_CACHE_CONFIG.CACHE_EXPIRY;

    if (expired) {
      // Clean up expired entry
      this.removeFromCache(url);
      return false;
    }

    return true;
  }

  /**
   * Get cached video info
   */
  getCachedVideo(url: string): CachedVideoInfo | null {
    return this.cacheIndex.get(url) || null;
  }

  private getVideoFileName(video: VideoItem): string {
    return `${video.assetId}.m3u8`;
  }


  /**
   * Download and cache a video
   */
  async cacheVideo(video: VideoItem): Promise<string | null> {
    try {
      if (!video.playbackUrl || !video.assetId) {
        console.warn('[VideoCache] Invalid video data');
        return null;
      }

      const cacheKey = video.playbackUrl;

      // Already cached?
      if (this.isVideoCached(cacheKey)) {
        const cached = this.getCachedVideo(cacheKey);
        if (cached && (await RNFS.exists(cached.localPath))) {
          console.log(`[VideoCache] Already cached: ${cached.localPath}`);
          return cached.localPath;
        } else {
          this.cacheIndex.delete(cacheKey);
          await this.saveCacheIndex();
        }
      }

      // Ensure cache directory exists
      if (!(await RNFS.exists(CACHE_DIR!))) {
        console.error('[VideoCache] Cache directory missing');
        return null;
      }

      await this.cleanupCache();

      const fileName = this.getVideoFileName(video);
      const localPath = this.getCachePath(fileName, video.playbackUrl);

      console.log('[VideoCache] Downloading Gumlet stream');
      console.log(`[VideoCache] From: ${video.playbackUrl}`);
      console.log(`[VideoCache] To: ${localPath}`);

      const result = await RNFS.downloadFile({
        fromUrl: video.playbackUrl,
        toFile: localPath,
        background: true,
        discretionary: false,
        cacheable: true,
      }).promise;

      if (result.statusCode !== 200) {
        console.warn(`[VideoCache] Download failed: ${result.statusCode}`);
        return null;
      }

      if (!(await RNFS.exists(localPath))) {
        console.error('[VideoCache] File not created after download');
        return null;
      }

      // iOS safety check
      if (Platform.OS === 'ios') {
        const stats = await RNFS.stat(localPath);
        if (stats.size === 0) {
          await RNFS.unlink(localPath);
          return null;
        }
      }

      this.cacheIndex.set(cacheKey, {
        url: cacheKey,
        localPath,
        fileName,
        category: video.tag?.[0] ?? 'unknown',
        timestamp: Date.now(),
      });

      await this.saveCacheIndex();

      console.log(`[VideoCache] Cached successfully: ${fileName}`);
      return localPath;
    } catch (error) {
      console.error('[VideoCache] Error caching Gumlet video:', error);
      return null;
    }
  }

  /**
   * Prefetch videos for specified categories
   */
  async prefetchVideos(
    videos: VideoItem[],
    tags: string[],
  ): Promise<void> {
    try {
      console.log(
        `[VideoCache] Prefetching videos for tags: ${tags.join(', ')}`,
      );

      const videosToPrefetch = videos.filter(
        video =>
          video.playbackUrl &&
          video.tag?.some(tag => tags.includes(tag)),
      );

      console.log(
        `[VideoCache] Found ${videosToPrefetch.length} videos to prefetch`,
      );

      const limitedVideos = videosToPrefetch.slice(
        0,
        VIDEO_CACHE_CONFIG.MAX_VIDEOS_PER_CATEGORY * tags.length,
      );

      const promises = limitedVideos.map(async (video, index) => {
        await new Promise(res => setTimeout(res, index * 800));
        return this.cacheVideo(video);
      });

      await Promise.allSettled(promises);
      console.log('[VideoCache] Prefetch completed');
    } catch (error) {
      console.error('[VideoCache] Error prefetching Gumlet videos:', error);
    }
  }

  /**
   * Remove a video from cache
   */
  private async removeFromCache(url: string): Promise<void> {
    try {
      const cached = this.cacheIndex.get(url);
      if (cached) {
        // Delete file if exists
        const exists = await RNFS.exists(cached.localPath);
        if (exists) {
          await RNFS.unlink(cached.localPath);
        }

        this.cacheIndex.delete(url);
        await this.saveCacheIndex();
      }
    } catch (error) {
      console.warn('[VideoCache] Error removing from cache:', error);
    }
  }

  /**
   * Clean up old/unused cache files
   */
  private async cleanupCache(): Promise<void> {
    try {
      const now = Date.now();
      const expiredUrls: string[] = [];

      // Find expired entries
      for (const [url, info] of this.cacheIndex) {
        if (now - info.timestamp > VIDEO_CACHE_CONFIG.CACHE_EXPIRY) {
          expiredUrls.push(url);
        }
      }

      // Remove expired entries
      await Promise.all(expiredUrls.map(url => this.removeFromCache(url)));

      // Check total cache size and remove oldest if needed
      await this.enforceCacheSizeLimit();

      console.log(
        `[VideoCache] Cleaned up ${expiredUrls.length} expired videos`,
      );
    } catch (error) {
      console.warn('[VideoCache] Error during cache cleanup:', error);
    }
  }

  /**
   * Enforce maximum cache size by removing oldest files
   */
  private async enforceCacheSizeLimit(): Promise<void> {
    try {
      // Get cache directory stats
      const stats = await RNFS.getFSInfo();
      if (stats.freeSpace && stats.totalSpace) {
        // For now, just ensure we don't exceed reasonable limits
        // Could be enhanced to track actual file sizes
      }
    } catch (error) {
      console.warn('[VideoCache] Error enforcing cache size limit:', error);
    }
  }

  /**
   * Remove a specific cached video entry
   */
  async removeCachedEntry(url: string): Promise<void> {
    try {
      const cached = this.cacheIndex.get(url);
      if (cached) {
        // Delete file if exists
        const exists = await RNFS.exists(cached.localPath);
        if (exists) {
          await RNFS.unlink(cached.localPath);
          console.log(`[VideoCache] Removed cached file: ${cached.localPath}`);
        }

        this.cacheIndex.delete(url);
        await this.saveCacheIndex();
      }
    } catch (error) {
      console.warn('[VideoCache] Error removing cached entry:', error);
    }
  }

  /**
   * Clear all cached videos
   */
  async clearCache(): Promise<void> {
    try {
      console.log('[VideoCache] Clearing all cached videos');

      // Delete all cached files
      const promises = Array.from(this.cacheIndex.values()).map(async info => {
        try {
          const exists = await RNFS.exists(info.localPath);
          if (exists) {
            await RNFS.unlink(info.localPath);
          }
        } catch (error) {
          console.warn(
            `[VideoCache] Error deleting file ${info.localPath}:`,
            error,
          );
        }
      });

      await Promise.all(promises);

      // Clear cache index
      this.cacheIndex.clear();
      await this.saveCacheIndex();

      console.log('[VideoCache] Cache cleared successfully');
    } catch (error) {
      console.error('[VideoCache] Error clearing cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; videos: number } {
    return {
      size: this.cacheIndex.size,
      videos: this.cacheIndex.size,
    };
  }

  /**
   * Diagnostic test for iOS file system operations
   * Returns detailed information about cache directory and access permissions
   */
  async runIOSDiagnostics(): Promise<{
    cacheDir: string;
    cacheDirExists: boolean;
    cacheDirWritable?: boolean | undefined;
    indexPath: string;
    indexExists: boolean;
    indexReadable?: boolean | undefined;
    indexWritable?: boolean | undefined;
    totalCachedFiles: number;
    platformInfo: {
      os: string;
      version?: string;
    };
  }> {
    const results = {
      cacheDir: CACHE_DIR || '',
      cacheDirExists: false,
      cacheDirWritable: undefined as boolean | undefined,
      indexPath: this.getCacheIndexPath(),
      indexExists: false,
      indexReadable: undefined as boolean | undefined,
      indexWritable: undefined as boolean | undefined,
      totalCachedFiles: this.cacheIndex.size,
      platformInfo: {
        os: Platform.OS,
        version: Platform.Version?.toString(),
      },
    };

    try {
      // Test cache directory existence
      results.cacheDirExists = await RNFS.exists(CACHE_DIR!);

      // Test cache directory writability (iOS specific)
      if (Platform.OS === 'ios') {
        try {
          // Try to create a test file to verify writability
          const testFile = `${CACHE_DIR}/iOS_test.tmp`;
          await RNFS.writeFile(testFile, 'test');
          await RNFS.unlink(testFile); // Clean up test file
          results.cacheDirWritable = true;
        } catch (writeError) {
          console.error(
            '[VideoCache] iOS cache directory writability test failed:',
            writeError,
          );
          results.cacheDirWritable = false;
        }
      }

      // Test index file existence and accessibility
      results.indexExists = await RNFS.exists(results.indexPath);

      if (results.indexExists) {
        try {
          // Test index file readability
          await RNFS.readFile(results.indexPath);
          results.indexReadable = true;
        } catch (readError) {
          console.error(
            '[VideoCache] iOS index file readability test failed:',
            readError,
          );
          results.indexReadable = false;
        }

        try {
          // Test index file writability by attempting to update it
          const backupContent = await RNFS.readFile(results.indexPath);
          await RNFS.writeFile(results.indexPath, backupContent.toString());
          results.indexWritable = true;
        } catch (writeError) {
          console.error(
            '[VideoCache] iOS index file writability test failed:',
            writeError,
          );
          results.indexWritable = false;
        }
      } else {
        console.log('[VideoCache] iOS diagnostics: Cache index does not exist');
      }

      console.log('[VideoCache] iOS diagnostics completed:', results);
      return results;
    } catch (error) {
      console.error('[VideoCache] iOS diagnostics failed:', error);
      return results;
    }
  }
}

// Singleton instance
export const videoCache = new VideoCache();
export default videoCache;
