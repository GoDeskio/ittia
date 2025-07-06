// Service Worker for background audio recording
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

let mediaRecorder = null;
let recordingChunks = [];

self.addEventListener('message', async (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'START_RECORDING':
      try {
        // Request notification permission if not granted
        if (Notification.permission !== 'granted') {
          await Notification.requestPermission();
        }

        // Show notification that recording is active
        self.registration.showNotification('Voice Recording Active', {
          body: 'Recording in background...',
          icon: '/mic-icon.png',
          tag: 'voice-recording',
          silent: true,
          ongoing: true
        });

        // Start recording using the MediaStream passed from the main thread
        mediaRecorder = new MediaRecorder(data.stream);
        recordingChunks = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordingChunks.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(recordingChunks, { type: 'audio/webm' });
          // Send the recorded blob back to the main thread
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'RECORDING_COMPLETE',
                data: { blob }
              });
            });
          });
          recordingChunks = [];
        };

        mediaRecorder.start(1000);
      } catch (error) {
        console.error('Error in service worker:', error);
      }
      break;

    case 'STOP_RECORDING':
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        // Clear the notification
        self.registration.getNotifications({ tag: 'voice-recording' })
          .then(notifications => {
            notifications.forEach(notification => notification.close());
          });
      }
      break;
  }
}); 