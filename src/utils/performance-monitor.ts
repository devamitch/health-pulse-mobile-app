// utils/performance-monitor.ts
import { InteractionManager } from 'react-native';

/**
 * Utility to monitor and optimize performance in React Native
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private frameDrops: number = 0;
  private frameRate: number = 60;
  private lastFrameTimestamp: number = 0;
  private isMonitoring: boolean = false;
  private animationFrameId: number | null = null;
  private listeners: Array<(stats: PerformanceStats) => void> = [];

  /**
   * Get the singleton instance
   */
  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start monitoring performance
   */
  public startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.frameDrops = 0;
    this.lastFrameTimestamp = performance.now();

    this.monitorFrameRate();
  }

  /**
   * Stop monitoring performance
   */
  public stopMonitoring(): void {
    this.isMonitoring = false;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Add a listener for performance stats
   */
  public addListener(callback: (stats: PerformanceStats) => void): () => void {
    this.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Monitor frame rate
   */
  private monitorFrameRate(): void {
    if (!this.isMonitoring) return;

    const now = performance.now();
    const delta = now - this.lastFrameTimestamp;

    // Expected time for 60fps is ~16.67ms
    if (delta > 20) {
      // Frame drop detected
      this.frameDrops++;
    }

    // Calculate current frame rate
    this.frameRate = 1000 / delta;

    // Notify listeners
    this.notifyListeners();

    this.lastFrameTimestamp = now;
    this.animationFrameId = requestAnimationFrame(() =>
      this.monitorFrameRate(),
    );
  }

  /**
   * Notify listeners with current stats
   */
  private notifyListeners(): void {
    const stats: PerformanceStats = {
      frameRate: Math.round(this.frameRate),
      frameDrops: this.frameDrops,
      timestamp: Date.now(),
    };

    // Notify on next tick to avoid blocking the current frame
    InteractionManager.runAfterInteractions(() => {
      this.listeners.forEach(listener => listener(stats));
    });
  }

  /**
   * Get current performance stats
   */
  public getStats(): PerformanceStats {
    return {
      frameRate: Math.round(this.frameRate),
      frameDrops: this.frameDrops,
      timestamp: Date.now(),
    };
  }

  /**
   * Check if the app is experiencing performance issues
   */
  public hasPerformanceIssues(): boolean {
    return this.frameRate < 45 || this.frameDrops > 10;
  }

  /**
   * Reset performance counters
   */
  public reset(): void {
    this.frameDrops = 0;
    this.frameRate = 60;
  }
}

/**
 * Performance statistics interface
 */
export interface PerformanceStats {
  frameRate: number;
  frameDrops: number;
  timestamp: number;
}

export default PerformanceMonitor.getInstance();
