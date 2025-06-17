import React, { useState, useEffect } from 'react'
import { Save, Database, Cpu, Globe, Trash2, Key, AlertCircle } from 'lucide-react'

const SettingsPage = () => {
  useEffect(() => {
    if (window.electronAPI?.settings?.load) {
      window.electronAPI.settings.load().then(loadedSettings => {
        if (loadedSettings) {
          setSettings(prev => ({ ...prev, ...loadedSettings }))
        }
      })
    }
  }, [])
  const [settings, setSettings] = useState({
    maxReviews: 1000,
    reviewLanguage: 'english',
    llmProvider: 'ollama',
    ollamaEndpoint: 'http://localhost:11434',
    ollamaModel: 'llama2',
    openaiModel: 'gpt-3.5-turbo',
    anthropicModel: 'claude-3-haiku-20240307',
    azureEndpoint: '',
    azureModel: 'gpt-35-turbo',
    cacheTimeout: 7,
    enableAutoUpdate: true,
    processingConcurrency: 3
  })

  const [connectionStatus, setConnectionStatus] = useState({
    testing: false,
    connected: null,
    message: ''
  })

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    console.log('Saving settings:', settings)
    if (window.electronAPI?.settings?.save) {
      window.electronAPI.settings.save(settings)
    }
  }

  const testConnection = async () => {
    setConnectionStatus({ testing: true, connected: null, message: 'Testing connection...' })
    
    try {
      if (window.electronAPI?.llm?.testConnection) {
        const result = await window.electronAPI.llm.testConnection({
          provider: settings.llmProvider,
          endpoint: settings.llmProvider === 'ollama' ? settings.ollamaEndpoint : 
                   settings.llmProvider === 'azure' ? settings.azureEndpoint : null,
          model: getCurrentModel()
        })
        
        setConnectionStatus({
          testing: false,
          connected: result.success,
          message: result.message || (result.success ? 'Connection successful!' : 'Connection failed')
        })
      }
    } catch (error) {
      setConnectionStatus({
        testing: false,
        connected: false,
        message: error.message || 'Connection test failed'
      })
    }
  }

  const getCurrentModel = () => {
    switch (settings.llmProvider) {
      case 'openai': return settings.openaiModel
      case 'anthropic': return settings.anthropicModel
      case 'azure': return settings.azureModel
      case 'ollama':
      default: return settings.ollamaModel
    }
  }

  const getProviderConfig = () => {
    const providers = [
      { id: 'ollama', name: 'Ollama (Local)', requiresApiKey: false },
      { id: 'openai', name: 'OpenAI', requiresApiKey: true },
      { id: 'anthropic', name: 'Anthropic Claude', requiresApiKey: true },
      { id: 'azure', name: 'Azure OpenAI', requiresApiKey: true }
    ]
    return providers.find(p => p.id === settings.llmProvider) || providers[0]
  }

  const getEnvVarName = () => {
    switch (settings.llmProvider) {
      case 'openai': return 'OPENAI_API_KEY'
      case 'anthropic': return 'ANTHROPIC_API_KEY'
      case 'azure': return 'AZURE_OPENAI_API_KEY'
      default: return null
    }
  }

  const handleClearCache = () => {
    console.log('Clearing cache...')
    if (window.electronAPI?.database?.clearCache) {
      window.electronAPI.database.clearCache()
    }
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Configure the application behavior and preferences</p>
      </div>

      <div className="grid gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Globe className="h-6 w-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Steam API Settings</h2>
          </div>
          
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Reviews per Game
              </label>
              <input
                type="number"
                value={settings.maxReviews}
                onChange={(e) => handleSettingChange('maxReviews', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                min="100"
                max="10000"
                step="100"
              />
              <p className="text-sm text-gray-500 mt-1">
                Higher values provide more comprehensive analysis but take longer to process
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Language
              </label>
              <select
                value={settings.reviewLanguage}
                onChange={(e) => handleSettingChange('reviewLanguage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Languages</option>
                <option value="english">English Only</option>
                <option value="spanish">Spanish Only</option>
                <option value="french">French Only</option>
                <option value="german">German Only</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Cpu className="h-6 w-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">LLM Provider Settings</h2>
          </div>
          
          <div className="grid gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Provider
              </label>
              <select
                value={settings.llmProvider}
                onChange={(e) => {
                  handleSettingChange('llmProvider', e.target.value)
                  setConnectionStatus({ testing: false, connected: null, message: '' })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="ollama">Ollama (Local)</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic Claude</option>
                <option value="azure">Azure OpenAI</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Choose your preferred AI provider for review analysis
              </p>
            </div>

            {getProviderConfig().requiresApiKey && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex items-center mb-2">
                  <Key className="h-4 w-4 text-yellow-600 mr-2" />
                  <span className="text-sm font-medium text-yellow-800">API Key Required</span>
                </div>
                <p className="text-sm text-yellow-700 mb-2">
                  Set the <code className="bg-yellow-100 px-1 rounded">{getEnvVarName()}</code> environment variable with your API key.
                </p>
                <p className="text-xs text-yellow-600">
                  Environment variables are used for security - API keys are never stored in the application.
                </p>
              </div>
            )}

            {settings.llmProvider === 'ollama' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ollama Endpoint
                  </label>
                  <input
                    type="url"
                    value={settings.ollamaEndpoint}
                    onChange={(e) => handleSettingChange('ollamaEndpoint', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="http://localhost:11434"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    URL where Ollama is running. Make sure Ollama is installed and running.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ollama Model
                  </label>
                  <input
                    type="text"
                    value={settings.ollamaModel}
                    onChange={(e) => handleSettingChange('ollamaModel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="llama2"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Name of the Ollama model to use for review summarization
                  </p>
                </div>
              </>
            )}

            {settings.llmProvider === 'openai' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI Model
                </label>
                <select
                  value={settings.openaiModel}
                  onChange={(e) => handleSettingChange('openaiModel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-4-turbo-preview">GPT-4 Turbo Preview</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Choose the OpenAI model for review analysis
                </p>
              </div>
            )}

            {settings.llmProvider === 'anthropic' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anthropic Model
                </label>
                <select
                  value={settings.anthropicModel}
                  onChange={(e) => handleSettingChange('anthropicModel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                  <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                  <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Choose the Anthropic Claude model for review analysis
                </p>
              </div>
            )}

            {settings.llmProvider === 'azure' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Azure OpenAI Endpoint
                  </label>
                  <input
                    type="url"
                    value={settings.azureEndpoint}
                    onChange={(e) => handleSettingChange('azureEndpoint', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://your-resource.openai.azure.com"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Your Azure OpenAI resource endpoint URL
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Azure Deployment Name
                  </label>
                  <input
                    type="text"
                    value={settings.azureModel}
                    onChange={(e) => handleSettingChange('azureModel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="gpt-35-turbo"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    The deployment name for your Azure OpenAI model
                  </p>
                </div>
              </>
            )}

            <div className="pt-4 border-t">
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={testConnection}
                  disabled={connectionStatus.testing}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {connectionStatus.testing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Globe className="h-4 w-4 mr-2" />
                  )}
                  Test Connection
                </button>
                {connectionStatus.connected !== null && (
                  <div className={`flex items-center text-sm ${
                    connectionStatus.connected ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {connectionStatus.message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Database className="h-6 w-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Data Management</h2>
          </div>
          
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cache Timeout (days)
              </label>
              <input
                type="number"
                value={settings.cacheTimeout}
                onChange={(e) => handleSettingChange('cacheTimeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                min="1"
                max="30"
              />
              <p className="text-sm text-gray-500 mt-1">
                How long to keep cached data before refreshing
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Processing Concurrency
              </label>
              <input
                type="number"
                value={settings.processingConcurrency}
                onChange={(e) => handleSettingChange('processingConcurrency', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                min="1"
                max="5"
              />
              <p className="text-sm text-gray-500 mt-1">
                Number of games that can be processed simultaneously
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoUpdate"
                checked={settings.enableAutoUpdate}
                onChange={(e) => handleSettingChange('enableAutoUpdate', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="autoUpdate" className="ml-2 block text-sm text-gray-700">
                Enable automatic updates for tracked games
              </label>
            </div>

            <div className="pt-4 border-t">
              <button
                onClick={handleClearCache}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Cache
              </button>
              <p className="text-sm text-gray-500 mt-2">
                This will remove all cached game data and summaries
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Save className="h-5 w-5 mr-2" />
          Save Settings
        </button>
      </div>

      {getProviderConfig().requiresApiKey && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Environment Variable Setup</h3>
          <p className="text-blue-800 mb-4">
            To use {getProviderConfig().name}, you need to set up your API key as an environment variable:
          </p>
          <div className="bg-blue-100 rounded-md p-3 mb-4">
            <code className="text-sm text-blue-900">
              {process.platform === 'win32' ? (
                `set ${getEnvVarName()}=your_api_key_here`
              ) : (
                `export ${getEnvVarName()}=your_api_key_here`
              )}
            </code>
          </div>
          <p className="text-sm text-blue-700">
            Restart the application after setting the environment variable.
          </p>
        </div>
      )}
    </div>
  )
}

export default SettingsPage