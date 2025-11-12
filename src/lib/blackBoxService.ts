/**
 * BlackBoxService - Comprehensive data logging for user interactions and field measurements
 * Collects all user interactions, field data, and system events for model improvement
 */

interface LocationData {
  lat: number;
  lng: number;
  village?: string;
  district?: string;
  state?: string;
  country?: string;
}

interface VegetationIndicesLog {
  timestamp: Date;
  fieldId: string;
  indices: {
    ndvi: number;
    msavi2?: number;
    ndre: number;
    ndwi: number;
    ndmi: number;
    soc_vis: number;
    rsm: number;
    rvi: number;
  };
  npkData?: {
    nitrogen?: number;
    phosphorus?: number;
    potassium?: number;
    confidence: number;
  };
  userLocation?: LocationData;
  fieldScreenshot?: string; // Satellite image URL or base64
  fieldPolygon?: [number, number][];
}

interface AudioInteractionLog {
  timestamp: Date;
  audioId: string;
  audioType: 'vegetation_index' | 'npk_analysis' | 'soil_summary' | 'management_recommendations' | 'yield_prediction' | 'disease_analysis';
  content: string;
  duration?: number;
  completed: boolean;
  fieldId?: string;
  userLocation?: LocationData;
}

interface FieldAccessLog {
  timestamp: Date;
  fieldId: string;
  accessType: 'view' | 'refresh' | 'navigate_away';
  timeSpent?: number; // in seconds
  sectionsViewed: string[];
  deviceInfo: {
    userAgent: string;
    screenSize: string;
    isMobile: boolean;
  };
  userLocation?: LocationData;
}

interface UserInteractionLog {
  timestamp: Date;
  interactionType: 'button_click' | 'audio_play' | 'scroll' | 'tab_switch' | 'error_retry' | 'page_view' | 'session_start' | 'user_identified';
  elementId: string;
  fieldId?: string;
  additionalData?: Record<string, any>;
  userLocation?: LocationData;
}

interface ErrorLog {
  timestamp: Date;
  errorType: 'api_failure' | 'audio_failure' | 'component_error' | 'network_error';
  errorMessage: string;
  stackTrace?: string;
  fieldId?: string;
  userAction?: string;
  retryAttempted: boolean;
  userLocation?: LocationData;
}

interface UserFeedbackLog {
  timestamp: Date;
  feedbackType: 'rating' | 'comment' | 'suggestion' | 'accuracy_report';
  content: string;
  rating?: number; // 1-5 scale
  fieldId?: string;
  relatedFeature: string;
  userLocation?: LocationData;
}

export class BlackBoxService {
  private logs: {
    vegetationIndices: VegetationIndicesLog[];
    audioInteractions: AudioInteractionLog[];
    fieldAccess: FieldAccessLog[];
    userInteractions: UserInteractionLog[];
    errors: ErrorLog[];
    feedback: UserFeedbackLog[];
  } = {
    vegetationIndices: [],
    audioInteractions: [],
    fieldAccess: [],
    userInteractions: [],
    errors: [],
    feedback: []
  };

  private sessionId: string;
  private userId?: string;
  private sessionStartTime: Date;
  private initialized = false;

  constructor() {
    // Defer heavy work until we know we're in a browser environment
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = new Date();
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      this.safeInitializeSession();
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize the black box session in a safe, browser-only way.
   * - No-op outside browser (SSR/tests).
   * - Applies bounded cleanup rather than wiping all previous sessions.
   */
  private safeInitializeSession(): void {
    if (this.initialized) return;
    this.initialized = true;

    try {
      // Clean up only very old sessions to avoid unbounded growth
      this.cleanupOldSessions();

      // Check storage usage (best-effort)
      const storageInfo = this.getStorageInfo();
      if (storageInfo.percentage > 90) {
        console.warn(`Black box storage at ${storageInfo.percentage.toFixed(1)}% capacity`);
        // If close to limit, clear only blackbox logs, not entire localStorage
        this.clearLogs();
      }

      // Log session start with non-sensitive metadata
      this.logUserInteraction(
        'session_start',
        'app_init',
        undefined,
        {
          sessionId: this.sessionId,
          timestamp: this.sessionStartTime.toISOString(),
          userAgent: navigator.userAgent,
          screenSize: `${window.screen.width}x${window.screen.height}`,
          isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          ),
          storageUsage: `${storageInfo.percentage.toFixed(1)}%`
        }
      );
    } catch (error) {
      // Never let analytics break the app
      console.error('BlackBox initialization failed:', error);
    }
  }

  /**
   * Log vegetation indices data when displayed to user
   */
  logVegetationIndicesView(
    fieldId: string,
    indices: VegetationIndicesLog['indices'],
    npkData?: VegetationIndicesLog['npkData'],
    fieldScreenshot?: string,
    fieldPolygon?: [number, number][],
    locationData?: LocationData
  ): void {
    const log: VegetationIndicesLog = {
      timestamp: new Date(),
      fieldId,
      indices,
      npkData,
      userLocation: locationData || this.getCurrentLocation(),
      fieldScreenshot,
      fieldPolygon
    };

    this.logs.vegetationIndices.push(log);
    this.persistLog('vegetation_indices', log);
  }

  /**
   * Log audio interactions and usage patterns
   */
  logAudioInteraction(
    audioId: string,
    audioType: AudioInteractionLog['audioType'],
    content: string,
    fieldId?: string,
    locationData?: LocationData
  ): void {
    const log: AudioInteractionLog = {
      timestamp: new Date(),
      audioId,
      audioType,
      content,
      completed: false, // Will be updated when audio ends
      fieldId,
      userLocation: locationData
    };

    this.logs.audioInteractions.push(log);
    this.persistLog('audio_interaction', log);
  }

  /**
   * Update audio interaction when completed
   */
  updateAudioInteraction(audioId: string, duration: number, completed: boolean): void {
    const log = this.logs.audioInteractions.find(l => l.audioId === audioId);
    if (log) {
      log.duration = duration;
      log.completed = completed;
      this.persistLog('audio_interaction_update', log);
    }
  }

  /**
   * Log field access patterns and time spent
   */
  logFieldAccess(
    fieldId: string,
    accessType: FieldAccessLog['accessType'],
    sectionsViewed: string[] = [],
    timeSpent?: number,
    locationData?: LocationData
  ): void {
    const log: FieldAccessLog = {
      timestamp: new Date(),
      fieldId,
      accessType,
      timeSpent,
      sectionsViewed,
      deviceInfo: {
        userAgent: navigator.userAgent,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      },
      userLocation: locationData
    };

    this.logs.fieldAccess.push(log);
    this.persistLog('field_access', log);
  }

  /**
   * Log general user interactions
   */
  logUserInteraction(
    interactionType: UserInteractionLog['interactionType'],
    elementId: string,
    fieldId?: string,
    additionalData?: Record<string, any>,
    locationData?: LocationData
  ): void {
    const log: UserInteractionLog = {
      timestamp: new Date(),
      interactionType,
      elementId,
      fieldId,
      additionalData: this.sanitizeAdditionalData(additionalData),
      userLocation: locationData
    };

    this.logs.userInteractions.push(log);
    this.persistLog('user_interaction', log);
  }

  /**
   * Log errors and system failures
   */
  logError(
    errorType: ErrorLog['errorType'],
    errorMessage: string,
    fieldId?: string,
    userAction?: string,
    stackTrace?: string,
    retryAttempted: boolean = false,
    locationData?: LocationData
  ): void {
    const log: ErrorLog = {
      timestamp: new Date(),
      errorType,
      errorMessage,
      stackTrace,
      fieldId,
      userAction,
      retryAttempted,
      userLocation: locationData
    };

    this.logs.errors.push(log);
    this.persistLog('error', log);
    
    // Also log to console for debugging
    console.error('BlackBox Error Log:', log);
  }

  /**
   * Log user feedback and ratings
   */
  logUserFeedback(
    feedbackType: UserFeedbackLog['feedbackType'],
    content: string,
    relatedFeature: string,
    fieldId?: string,
    rating?: number,
    locationData?: LocationData
  ): void {
    const log: UserFeedbackLog = {
      timestamp: new Date(),
      feedbackType,
      content: this.truncateString(content, 500),
      rating,
      fieldId,
      relatedFeature: this.truncateString(relatedFeature, 100),
      userLocation: locationData
    };

    this.logs.feedback.push(log);
    this.persistLog('user_feedback', log);
  }

  /**
   * Get current user location (if available)
   */
  private getCurrentLocation(): LocationData | undefined {
    // This would integrate with geolocation API in a real implementation
    // For now, return undefined
    return undefined;
  }

  /**
   * Get all logs with filters for admin dashboard
   */
  getAllLogs(filters?: {
    startDate?: Date;
    endDate?: Date;
    state?: string;
    district?: string;
    village?: string;
    type?: string;
    userId?: string;
  }): any[] {
    const allLogs: any[] = [];

    // Collect all logs from localStorage
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('blackbox_'));
      
      keys.forEach(key => {
        try {
          const logs = JSON.parse(localStorage.getItem(key) || '[]');
          allLogs.push(...logs);
        } catch (e) {
          console.error('Failed to parse log:', key, e);
        }
      });

      // Apply filters
      let filtered = allLogs;

      if (filters?.startDate) {
        filtered = filtered.filter(log => new Date(log.timestamp) >= filters.startDate!);
      }
      if (filters?.endDate) {
        filtered = filtered.filter(log => new Date(log.timestamp) <= filters.endDate!);
      }
      if (filters?.state) {
        filtered = filtered.filter(log => log.userLocation?.state === filters.state);
      }
      if (filters?.district) {
        filtered = filtered.filter(log => log.userLocation?.district === filters.district);
      }
      if (filters?.village) {
        filtered = filtered.filter(log => log.userLocation?.village === filters.village);
      }
      if (filters?.userId) {
        filtered = filtered.filter(log => log.userId === filters.userId);
      }

      return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error('Failed to get all logs:', error);
      return [];
    }
  }

  /**
   * Get aggregated statistics
   */
  getStatistics(filters?: any): {
    totalEntries: number;
    uniqueUsers: number;
    uniqueFields: number;
    byType: Record<string, number>;
    byState: Record<string, number>;
    byDistrict: Record<string, number>;
    errorCount: number;
  } {
    const logs = this.getAllLogs(filters);
    
    const stats = {
      totalEntries: logs.length,
      uniqueUsers: new Set(logs.map(l => l.userId).filter(Boolean)).size,
      uniqueFields: new Set(logs.map(l => l.fieldId).filter(Boolean)).size,
      byType: {} as Record<string, number>,
      byState: {} as Record<string, number>,
      byDistrict: {} as Record<string, number>,
      errorCount: 0
    };

    logs.forEach(log => {
      // Count by type (inferred from log structure)
      const logType = this.inferLogType(log);
      stats.byType[logType] = (stats.byType[logType] || 0) + 1;

      // Count by location
      if (log.userLocation?.state) {
        stats.byState[log.userLocation.state] = (stats.byState[log.userLocation.state] || 0) + 1;
      }
      if (log.userLocation?.district) {
        stats.byDistrict[log.userLocation.district] = (stats.byDistrict[log.userLocation.district] || 0) + 1;
      }

      // Count errors
      if (log.errorType || logType === 'error') {
        stats.errorCount++;
      }
    });

    return stats;
  }

  /**
   * Infer log type from log structure
   */
  private inferLogType(log: any): string {
    if (log.indices) return 'vegetation';
    if (log.audioType) return 'audio';
    if (log.accessType) return 'field_access';
    if (log.errorType) return 'error';
    if (log.feedbackType) return 'feedback';
    if (log.interactionType) return 'user_interaction';
    return 'unknown';
  }

  /**
   * Persist log data to local storage and prepare for backend sync
   */
  private persistLog(logType: string, logData: any): void {
    try {
      // Store in localStorage for offline capability with size limit
      const storageKey = `blackbox_${logType}_${this.sessionId}`;
      const existingLogs = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      // Add new log
      existingLogs.push({
        ...logData,
        sessionId: this.sessionId,
        userId: this.userId
      });
      
      // Keep only last 50 logs per type to prevent quota exceeded
      const trimmedLogs = existingLogs.slice(-50);
      
      try {
        localStorage.setItem(storageKey, JSON.stringify(trimmedLogs));
      } catch (quotaError) {
        // If still quota exceeded, clear old sessions and retry
        this.cleanupOldSessions();
        
        // Try again with just the last 20 logs
        const minimalLogs = existingLogs.slice(-20);
        try {
          localStorage.setItem(storageKey, JSON.stringify(minimalLogs));
        } catch (retryError) {
          // If still failing, just keep in memory
          console.warn('localStorage full, keeping logs in memory only');
        }
      }

      // In a real implementation, this would also queue for backend sync
      this.queueForBackendSync(logType, logData);
    } catch (error) {
      console.error('Failed to persist log:', error);
    }
  }

  /**
   * Clean up old session data from localStorage
   */
  private cleanupOldSessions(): void {
    try {
      const now = Date.now();
      const keys = Object.keys(localStorage);
      const blackboxKeys = keys.filter(key => key.startsWith('blackbox_'));

      let removed = 0;

      blackboxKeys.forEach(key => {
        try {
          const raw = localStorage.getItem(key);
          if (!raw) {
            localStorage.removeItem(key);
            removed++;
            return;
          }

          const logs = JSON.parse(raw);
          if (!Array.isArray(logs) || logs.length === 0) {
            localStorage.removeItem(key);
            removed++;
            return;
          }

          const last = logs[logs.length - 1];
          const ts = last.timestamp ? new Date(last.timestamp).getTime() : NaN;

          // Remove sessions older than 30 days or clearly invalid
          const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
          if (!Number.isFinite(ts) || now - ts > THIRTY_DAYS) {
            localStorage.removeItem(key);
            removed++;
          }
        } catch {
          // On parse error, remove corrupted entry
          localStorage.removeItem(key);
          removed++;
        }
      });

      if (removed > 0) {
        console.log(`BlackBox: cleaned up ${removed} old/invalid session log sets`);
      }
    } catch (error) {
      console.error('Failed to cleanup old sessions:', error);
    }
  }

  /**
   * Queue data for backend synchronization
   */
  private queueForBackendSync(logType: string, logData: any): void {
    // In a real implementation, this would:
    // 1. Add to a sync queue
    // 2. Attempt immediate sync if online
    // 3. Retry failed syncs
    // 4. Handle offline scenarios
    
    // Reduced logging to prevent console spam
    // console.log(`Queued for backend sync: ${logType}`, logData);
  }

  /**
   * Get analytics summary for debugging/monitoring
   */
  getAnalyticsSummary(): {
    sessionId: string;
    sessionDuration: number;
    totalInteractions: number;
    audioUsage: number;
    errorCount: number;
    fieldsViewed: string[];
  } {
    const sessionDuration = Date.now() - this.sessionStartTime.getTime();
    const fieldsViewed = [...new Set([
      ...this.logs.fieldAccess.map(log => log.fieldId),
      ...this.logs.vegetationIndices.map(log => log.fieldId)
    ])];

    return {
      sessionId: this.sessionId,
      sessionDuration: Math.floor(sessionDuration / 1000), // in seconds
      totalInteractions: this.logs.userInteractions.length,
      audioUsage: this.logs.audioInteractions.length,
      errorCount: this.logs.errors.length,
      fieldsViewed
    };
  }

  /**
   * Export all logs for analysis (development/debugging)
   */
  exportLogs(): string {
    return JSON.stringify({
      sessionInfo: {
        sessionId: this.sessionId,
        userId: this.userId,
        sessionStartTime: this.sessionStartTime,
        exportTime: new Date()
      },
      logs: this.logs,
      summary: this.getAnalyticsSummary()
    }, null, 2);
  }

  /**
   * Clear logs (for privacy/storage management)
   */
  clearLogs(): void {
    this.logs = {
      vegetationIndices: [],
      audioInteractions: [],
      fieldAccess: [],
      userInteractions: [],
      errors: [],
      feedback: []
    };

    // Clear from localStorage
    const keys = Object.keys(localStorage).filter(key => key.startsWith(`blackbox_`));
    keys.forEach(key => localStorage.removeItem(key));
    
    console.log('Black box logs cleared');
  }

  /**
   * Get storage usage information
   */
  getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      let totalSize = 0;
      const keys = Object.keys(localStorage).filter(key => key.startsWith('blackbox_'));
      
      keys.forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += item.length;
        }
      });
      
      // Estimate available space (5MB typical limit)
      const estimatedLimit = 5 * 1024 * 1024; // 5MB in bytes
      const percentage = (totalSize / estimatedLimit) * 100;
      
      return {
        used: totalSize,
        available: estimatedLimit - totalSize,
        percentage: Math.min(percentage, 100)
      };
    } catch (error) {
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  /**
   * Set user ID for better tracking
   */
  setUserId(userId: string): void {
    // Expect a non-sensitive internal identifier (no phone/PII)
    this.userId = this.truncateString(userId, 128);
    this.logUserInteraction('user_identified', 'auth_system', undefined, {
      userId: this.userId
    });
  }

  /**
   * Best-effort sanitization for arbitrary additionalData fields.
   * - Strips obviously sensitive keys.
   * - Truncates large values.
   */
  private sanitizeAdditionalData(data?: Record<string, any>): Record<string, any> | undefined {
    if (!data) return undefined;
    const SENSITIVE_KEYS = [
      'password',
      'token',
      'auth',
      'authorization',
      'cookie',
      'secret',
      'phone',
      'email'
    ];

    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.some(sk => lowerKey.includes(sk))) {
        continue;
      }
      if (typeof value === 'string') {
        sanitized[key] = this.truncateString(value, 500);
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        sanitized[key] = value;
      } else if (Array.isArray(value)) {
        sanitized[key] = value.slice(0, 20);
      } else if (value && typeof value === 'object') {
        // Avoid deep recursion; shallow-copy non-sensitive summary
        sanitized[key] = '[object]';
      }
    }
    return Object.keys(sanitized).length ? sanitized : undefined;
  }

  /**
   * Truncate a string to a safe maximum length.
   */
  private truncateString(input: string, max: number): string {
    if (!input) return input;
    return input.length > max ? input.slice(0, max) + '…' : input;
  }
}

// Create singleton instance
export const blackBoxService = new BlackBoxService();
