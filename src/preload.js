const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  steam: {
    searchGames: (query) => ipcRenderer.invoke('steam-search-games', query),
    getGameDetails: (appId) => ipcRenderer.invoke('steam-get-game-details', appId),
    getGameReviews: (appId, options) => ipcRenderer.invoke('steam-get-game-reviews', appId, options),
  },
  
  database: {
    saveGame: (gameData) => ipcRenderer.invoke('db-save-game', gameData),
    getGame: (appId) => ipcRenderer.invoke('db-get-game', appId),
    saveReviews: (appId, reviews) => ipcRenderer.invoke('db-save-reviews', appId, reviews),
    getReviews: (appId) => ipcRenderer.invoke('db-get-reviews', appId),
    saveSummary: (appId, summary) => ipcRenderer.invoke('db-save-summary', appId, summary),
    getSummary: (appId) => ipcRenderer.invoke('db-get-summary', appId),
    getRecentGames: (limit) => ipcRenderer.invoke('db-get-recent-games', limit),
    clearCache: () => ipcRenderer.invoke('db-clear-cache'),
  },
  
  llm: {
    generateSummary: (reviews, gameInfo) => ipcRenderer.invoke('llm-generate-summary', reviews, gameInfo),
    checkConnection: () => ipcRenderer.invoke('llm-check-connection'),
    testConnection: (config) => ipcRenderer.invoke('llm-test-connection', config),
  },
  
  settings: {
    save: (settings) => ipcRenderer.invoke('settings-save', settings),
    load: () => ipcRenderer.invoke('settings-load'),
  },
  
  processing: {
    startAnalysis: (appId, options) => ipcRenderer.invoke('process-game-analysis', appId, options),
    getQueue: () => ipcRenderer.invoke('get-processing-queue'),
    onProgress: (callback) => {
      ipcRenderer.on('analysis-progress', (event, data) => callback(data));
      return () => ipcRenderer.removeAllListeners('analysis-progress');
    },
  },
});