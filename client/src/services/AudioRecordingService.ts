export class AudioRecordingService {
  private static instance: AudioRecordingService;
  private serviceWorker: ServiceWorker | null = null;
  private mediaStream: MediaStream | null = null;
  private onRecordingComplete: ((blob: Blob) => void) | null = null;

  private constructor() {
    this.registerServiceWorker();
    this.setupMessageListener();
  }

  public static getInstance(): AudioRecordingService {
    if (!AudioRecordingService.instance) {
      AudioRecordingService.instance = new AudioRecordingService();
    }
    return AudioRecordingService.instance;
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/audioRecorderWorker.js');
        await navigator.serviceWorker.ready;
        this.serviceWorker = registration.active;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  private setupMessageListener() {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'RECORDING_COMPLETE' && this.onRecordingComplete) {
        this.onRecordingComplete(event.data.data.blob);
      }
    });
  }

  public async startRecording(onComplete: (blob: Blob) => void): Promise<void> {
    try {
      // Request necessary permissions
      await this.requestPermissions();

      // Get media stream
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.onRecordingComplete = onComplete;

      // Start recording via service worker
      if (this.serviceWorker) {
        this.serviceWorker.postMessage({
          type: 'START_RECORDING',
          data: { stream: this.mediaStream }
        });
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  public async stopRecording(): Promise<void> {
    if (this.serviceWorker) {
      this.serviceWorker.postMessage({ type: 'STOP_RECORDING' });
    }
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }

  private async requestPermissions(): Promise<void> {
    // Request microphone permission
    await navigator.mediaDevices.getUserMedia({ audio: true });

    // Request notification permission for background recording
    if ('Notification' in window) {
      await Notification.requestPermission();
    }
  }
}

export default AudioRecordingService; 