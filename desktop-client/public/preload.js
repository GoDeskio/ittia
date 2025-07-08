const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Voice recognition methods
  send: (channel, data) => {
    // Whitelist channels
    const validChannels = [
      'init-voice-recognition',
      'start-listening',
      'stop-listening'
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  
  on: (channel, func) => {
    const validChannels = [
      'voice-result',
      'voice-error'
    ];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  
  removeAllListeners: (channel) => {
    const validChannels = [
      'voice-result',
      'voice-error'
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.removeAllListeners(channel);
    }
  },
  
  // Settings methods
  invoke: (channel, data) => {
    const validChannels = [
      'get-app-path',
      'save-settings',
      'get-settings',
      'select-directory'
    ];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
  }
});