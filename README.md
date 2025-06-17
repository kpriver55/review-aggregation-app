# Game Review Aggregator

An AI-powered desktop application that analyzes Steam game reviews using local LLM models to provide comprehensive summaries and insights.

## Features

- **Game Search & Discovery**: Search Steam games and view detailed information
- **AI-Powered Review Analysis**: Uses local Ollama LLMs to summarize thousands of reviews
- **Sentiment Analysis**: Comprehensive sentiment breakdown with visual charts
- **Local Database**: Stores games, reviews, and summaries locally using SQLite
- **Processing Queue**: Manage multiple game analysis tasks
- **Caching System**: Efficient data management with configurable cache timeout

## Prerequisites

1. **Node.js**: Version 18 or higher
2. **AI Provider** (choose one):
   - **Local Ollama**: For local LLM processing
     - Download from: https://ollama.ai/
     - Pull a model: `ollama pull llama2` (or your preferred model)
     - Ensure Ollama is running on `http://localhost:11434`
   - **OpenAI API**: For cloud-based processing
     - Get an API key from: https://platform.openai.com/
     - Set environment variable: `export OPENAI_API_KEY=your_key_here`
   - **Anthropic Claude API**: For cloud-based processing
     - Get an API key from: https://console.anthropic.com/
     - Set environment variable: `export ANTHROPIC_API_KEY=your_key_here`
   - **Azure OpenAI**: For enterprise cloud processing
     - Set up Azure OpenAI resource
     - Set environment variable: `export AZURE_OPENAI_API_KEY=your_key_here`

## Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd /home/kpriver/atf/review-aggregation-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

## Usage

### Basic Workflow

1. **Search for Games**: Use the search bar to find Steam games
2. **Analyze Reviews**: Click "Analyze" on any game to start processing
3. **View Results**: See AI-generated summaries, sentiment analysis, and insights
4. **Configure Settings**: Adjust LLM settings, review limits, and cache behavior

### Key Features

#### Game Analysis
- Fetches up to 1,000 reviews (configurable)
- Processes reviews using local LLM
- Generates sentiment scores and themes
- Identifies common positive/negative aspects

#### Settings Configuration
- **Steam API Settings**: Configure review count and language filters
- **LLM Provider Settings**: Choose between Ollama, OpenAI, Anthropic Claude, or Azure OpenAI
- **Data Management**: Cache timeout and processing concurrency

## Project Structure

```
src/
├── components/          # React UI components
│   ├── Layout.jsx      # Main app layout
│   ├── GameSearch.jsx  # Game search interface
│   ├── RecentGames.jsx # Recently analyzed games
│   └── ...
├── pages/              # Main application pages
│   ├── HomePage.jsx    # Dashboard and search
│   ├── GameDetailsPage.jsx # Game analysis results
│   └── SettingsPage.jsx    # App configuration
├── services/           # Core business logic
│   ├── steamApi.js     # Steam API integration
│   ├── database.js     # SQLite database operations
│   └── llmService.js   # Ollama LLM integration
├── main.js            # Electron main process
├── preload.js         # Electron preload script
└── main.jsx           # React application entry
```

## API Integration

### Steam API
- **Game Search**: Uses Steam's search endpoint
- **Game Details**: Fetches comprehensive game information
- **Reviews**: Retrieves user reviews with metadata
- **Rate Limiting**: Implements proper delays and retry logic

### LLM Integration
- **Multiple Providers**: Support for Ollama (local), OpenAI, Anthropic Claude, and Azure OpenAI
- **Secure API Key Management**: Uses environment variables for API credentials
- **Configurable Models**: Support for different models from each provider
- **Structured Output**: Generates JSON-formatted summaries
- **Error Handling**: Fallback summaries when LLM unavailable
- **Connection Testing**: Built-in connection validation for all providers

### Database Schema
- **Games**: Stores game metadata and details
- **Reviews**: Raw review data with sentiment flags
- **Summaries**: AI-generated analysis results
- **Processing Queue**: Tracks analysis status and progress

## Development

### Available Scripts

- `npm run dev`: Start development mode (React + Electron)
- `npm run build`: Build React app for production
- `npm run build:electron`: Build Electron app for distribution
- `npm run start`: Start production Electron app
- `npm test`: Run test suite
- `npm run lint`: Run ESLint code analysis

### Development Mode

The app runs in development with:
- Hot reloading for React components
- Electron DevTools enabled
- Console logging for debugging
- Mock data when services unavailable

## Configuration

### AI Provider Setup

#### Ollama (Local)
1. Install Ollama from https://ollama.ai/
2. Pull a language model: `ollama pull llama2`
3. Start Ollama: `ollama serve`
4. Verify connection in app settings

#### OpenAI
1. Get an API key from https://platform.openai.com/
2. Set environment variable: `export OPENAI_API_KEY=your_key_here`
3. Select OpenAI provider in app settings
4. Choose your preferred model (GPT-3.5 Turbo, GPT-4, etc.)

#### Anthropic Claude
1. Get an API key from https://console.anthropic.com/
2. Set environment variable: `export ANTHROPIC_API_KEY=your_key_here`
3. Select Anthropic provider in app settings
4. Choose your preferred Claude model

#### Azure OpenAI
1. Set up Azure OpenAI resource in Azure portal
2. Set environment variable: `export AZURE_OPENAI_API_KEY=your_key_here`
3. Configure endpoint URL in app settings
4. Set deployment name for your model

### Steam API
- Uses public Steam APIs
- No API key required for basic functionality
- Rate limiting implemented to respect Steam's limits

## Performance

### Optimization Features
- **Caching**: Stores processed data to avoid reprocessing
- **Batch Processing**: Handles multiple reviews efficiently
- **Rate Limiting**: Respects API limits and prevents throttling
- **Database Indexing**: Optimized queries for fast data retrieval

### Resource Usage
- **Memory**: ~4GB RAM during active processing
- **Storage**: Compressed review data and summaries
- **CPU**: Depends on LLM model complexity
- **Network**: Minimal after initial data fetching

## Troubleshooting

### Common Issues

1. **LLM Connection Failed**:
   - **Ollama**: Ensure Ollama is installed and running, check endpoint URL, verify model is downloaded: `ollama list`
   - **OpenAI**: Check API key is set correctly, verify internet connection, ensure sufficient API credits
   - **Anthropic**: Check API key is set correctly, verify internet connection, ensure API access
   - **Azure**: Check API key, endpoint URL, and deployment name are correct

2. **Steam API Errors**:
   - Check internet connection
   - Verify game exists on Steam
   - Try again after rate limit delay

3. **Database Errors**:
   - Check disk space availability
   - Verify write permissions
   - Clear cache if corrupted

### Debug Mode
Enable additional logging by setting `NODE_ENV=development` and check the developer console for detailed error messages.

## License

MIT License - See LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:
- Check the troubleshooting section
- Review console logs for error details
- Verify all prerequisites are met
- Test with different games/models