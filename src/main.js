const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const SteamAPI = require('./services/steamApi');
const Database = require('./services/database');
const LLMService = require('./services/llmService');

const isDev = process.env.NODE_ENV === 'development';

let steamAPI;
let database;
let llmService;
let appSettings = {
  llmProvider: 'ollama',
  ollamaEndpoint: 'http://localhost:11434',
  ollamaModel: 'llama2',
  openaiModel: 'gpt-3.5-turbo',
  anthropicModel: 'claude-3-haiku-20240307',
  azureEndpoint: '',
  azureModel: 'gpt-35-turbo'
};

async function initializeServices() {
  try {
    steamAPI = new SteamAPI();
    database = new Database();
    await database.init();
    
    createLLMService();
    
    console.log('All services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
  }
}

function createLLMService() {
  const llmOptions = {
    provider: appSettings.llmProvider,
    endpoint: appSettings.llmProvider === 'ollama' ? appSettings.ollamaEndpoint : 
              appSettings.llmProvider === 'azure' ? appSettings.azureEndpoint : null,
    model: getCurrentModel()
  };
  
  llmService = new LLMService(llmOptions);
}

function getCurrentModel() {
  switch (appSettings.llmProvider) {
    case 'openai': return appSettings.openaiModel;
    case 'anthropic': return appSettings.anthropicModel;
    case 'azure': return appSettings.azureModel;
    case 'ollama':
    default: return appSettings.ollamaModel;
  }
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(async () => {
  await initializeServices();
  createWindow();
});

app.on('window-all-closed', () => {
  if (database) {
    database.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('steam-search-games', async (event, query) => {
  try {
    return await steamAPI.searchGames(query);
  } catch (error) {
    console.error('Steam search failed:', error);
    throw error;
  }
});

ipcMain.handle('steam-get-game-details', async (event, appId) => {
  try {
    return await steamAPI.getGameDetails(appId);
  } catch (error) {
    console.error('Failed to get game details:', error);
    throw error;
  }
});

ipcMain.handle('steam-get-game-reviews', async (event, appId, options) => {
  try {
    return await steamAPI.getGameReviews(appId, options);
  } catch (error) {
    console.error('Failed to get game reviews:', error);
    throw error;
  }
});

ipcMain.handle('db-save-game', async (event, gameData) => {
  try {
    return await database.saveGame(gameData);
  } catch (error) {
    console.error('Failed to save game:', error);
    throw error;
  }
});

ipcMain.handle('db-get-game', async (event, appId) => {
  try {
    return await database.getGame(appId);
  } catch (error) {
    console.error('Failed to get game:', error);
    throw error;
  }
});

ipcMain.handle('db-save-reviews', async (event, appId, reviews) => {
  try {
    return await database.saveReviews(appId, reviews);
  } catch (error) {
    console.error('Failed to save reviews:', error);
    throw error;
  }
});

ipcMain.handle('db-get-reviews', async (event, appId) => {
  try {
    return await database.getReviews(appId);
  } catch (error) {
    console.error('Failed to get reviews:', error);
    throw error;
  }
});

ipcMain.handle('db-save-summary', async (event, appId, summary) => {
  try {
    return await database.saveSummary(appId, summary);
  } catch (error) {
    console.error('Failed to save summary:', error);
    throw error;
  }
});

ipcMain.handle('db-get-summary', async (event, appId) => {
  try {
    return await database.getSummary(appId);
  } catch (error) {
    console.error('Failed to get summary:', error);
    throw error;
  }
});

ipcMain.handle('db-get-recent-games', async (event, limit) => {
  try {
    return await database.getRecentGames(limit);
  } catch (error) {
    console.error('Failed to get recent games:', error);
    throw error;
  }
});

ipcMain.handle('db-clear-cache', async (event) => {
  try {
    return await database.clearCache();
  } catch (error) {
    console.error('Failed to clear cache:', error);
    throw error;
  }
});

ipcMain.handle('llm-generate-summary', async (event, reviews, gameInfo) => {
  try {
    return await llmService.generateSummary(reviews, gameInfo);
  } catch (error) {
    console.error('Failed to generate summary:', error);
    throw error;
  }
});

ipcMain.handle('llm-check-connection', async (event) => {
  try {
    return await llmService.checkConnection();
  } catch (error) {
    console.error('Failed to check LLM connection:', error);
    return false;
  }
});

ipcMain.handle('llm-test-connection', async (event, config) => {
  try {
    const testService = new LLMService(config);
    const connected = await testService.checkConnection();
    
    let message = '';
    if (connected) {
      message = `Successfully connected to ${config.provider}`;
    } else {
      switch (config.provider) {
        case 'openai':
          message = 'Failed to connect to OpenAI. Check your API key and internet connection.';
          break;
        case 'anthropic':
          message = 'Failed to connect to Anthropic. Check your API key and internet connection.';
          break;
        case 'azure':
          message = 'Failed to connect to Azure OpenAI. Check your endpoint, API key, and deployment.';
          break;
        case 'ollama':
        default:
          message = 'Failed to connect to Ollama. Make sure Ollama is running on the specified endpoint.';
          break;
      }
    }
    
    return { success: connected, message };
  } catch (error) {
    console.error('LLM connection test failed:', error);
    return { 
      success: false, 
      message: error.message || 'Connection test failed with unknown error'
    };
  }
});

ipcMain.handle('settings-save', async (event, newSettings) => {
  try {
    appSettings = { ...appSettings, ...newSettings };
    createLLMService();
    
    console.log('Settings saved:', appSettings);
    return { success: true };
  } catch (error) {
    console.error('Failed to save settings:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('settings-load', async (event) => {
  try {
    return appSettings;
  } catch (error) {
    console.error('Failed to load settings:', error);
    return null;
  }
});

ipcMain.handle('process-game-analysis', async (event, appId, options = {}) => {
  try {
    await database.updateProcessingStatus(appId, 'processing', 0);
    
    let gameData = await database.getGame(appId);
    if (!gameData) {
      gameData = await steamAPI.getGameDetails(appId);
      await database.saveGame(gameData);
    }
    
    await database.updateProcessingStatus(appId, 'processing', 20);
    
    const reviews = await steamAPI.getGameReviews(appId, options);
    await database.saveReviews(appId, reviews);
    
    await database.updateProcessingStatus(appId, 'processing', 60);
    
    const summary = await llmService.generateSummary(reviews, gameData);
    await database.saveSummary(appId, summary);
    
    await database.updateProcessingStatus(appId, 'completed', 100);
    
    return {
      game: gameData,
      summary: summary,
      reviewCount: reviews.length
    };
  } catch (error) {
    await database.updateProcessingStatus(appId, 'failed', 0, error.message);
    console.error('Game analysis failed:', error);
    throw error;
  }
});