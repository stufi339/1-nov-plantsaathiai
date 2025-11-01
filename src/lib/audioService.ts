/**
 * AudioService - Centralized text-to-speech functionality
 * Provides queue management and visual feedback for audio playback
 */
export class AudioService {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isPlaying: boolean = false;
  private onStartCallback?: () => void;
  private onEndCallback?: () => void;

  constructor() {
    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser');
    }
  }

  /**
   * Speak the provided text with optional callbacks
   * Stops any currently playing audio before starting new audio
   */
  speak(text: string, onStart?: () => void, onEnd?: () => void): void {
    // Stop any currently playing audio
    this.stop();

    // Check if speech synthesis is available
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not available');
      onEnd?.();
      return;
    }

    // Create new utterance
    this.currentUtterance = new SpeechSynthesisUtterance(text);
    this.onStartCallback = onStart;
    this.onEndCallback = onEnd;

    // Configure utterance properties
    this.currentUtterance.rate = 0.9; // Slightly slower for better comprehension
    this.currentUtterance.pitch = 1.0;
    this.currentUtterance.volume = 1.0;

    // Set up event listeners
    this.currentUtterance.onstart = () => {
      this.isPlaying = true;
      this.onStartCallback?.();
    };

    this.currentUtterance.onend = () => {
      this.isPlaying = false;
      this.currentUtterance = null;
      this.onEndCallback?.();
    };

    this.currentUtterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      this.isPlaying = false;
      this.currentUtterance = null;
      this.onEndCallback?.();
    };

    // Start speaking
    window.speechSynthesis.speak(this.currentUtterance);
  }

  /**
   * Stop any currently playing audio
   */
  stop(): void {
    if (this.isPlaying && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.isPlaying = false;
      this.currentUtterance = null;
      this.onEndCallback?.();
    }
  }

  /**
   * Check if audio is currently playing
   */
  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Get available voices (useful for future voice selection feature)
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!('speechSynthesis' in window)) {
      return [];
    }
    return window.speechSynthesis.getVoices();
  }

  /**
   * Check if speech synthesis is supported
   */
  isSupported(): boolean {
    return 'speechSynthesis' in window;
  }
}

// Create singleton instance
export const audioService = new AudioService();