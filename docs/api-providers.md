# AI Provider Configuration Guide

This document provides detailed instructions for configuring different AI providers with the Game Review Aggregator application.

## Overview

The application supports four AI providers for review analysis:

1. **Ollama** - Local LLM processing (free, requires local setup)
2. **OpenAI** - Cloud-based GPT models (paid, API key required)
3. **Anthropic Claude** - Cloud-based Claude models (paid, API key required)
4. **Azure OpenAI** - Enterprise cloud processing (paid, Azure subscription required)

## Provider Comparison

| Provider | Cost | Setup Complexity | Performance | Privacy | Internet Required |
|----------|------|------------------|-------------|---------|-------------------|
| Ollama | Free | Medium | Variable* | High | No |
| OpenAI | Paid | Low | High | Medium | Yes |
| Anthropic | Paid | Low | High | Medium | Yes |
| Azure OpenAI | Paid | High | High | High | Yes |

*Performance depends on local hardware and model size

## Detailed Setup Instructions

### 1. Ollama (Local)

**Best for**: Users who want free processing and maximum privacy

**Requirements**:
- 8GB+ RAM recommended
- 10GB+ free disk space
- Modern CPU (Apple Silicon/AMD64)

**Setup Steps**:
1. Download Ollama from https://ollama.ai/
2. Install the application
3. Open terminal/command prompt
4. Pull a model: `ollama pull llama2` (or `llama2:13b` for better quality)
5. Start Ollama: `ollama serve` (runs automatically on most systems)
6. In the app settings:
   - Select "Ollama (Local)" as provider
   - Set endpoint to `http://localhost:11434`
   - Set model name (e.g., `llama2`)
   - Test connection

**Available Models**:
- `llama2` - 7B parameters, fastest
- `llama2:13b` - 13B parameters, better quality
- `codellama` - Optimized for code understanding
- `mistral` - Fast and efficient alternative

**Troubleshooting**:
- Check if Ollama is running: `ollama list`
- Verify model is downloaded: `ollama list`
- Check firewall settings if connection fails

### 2. OpenAI

**Best for**: Users wanting high-quality results with minimal setup

**Requirements**:
- OpenAI account
- API key with sufficient credits
- Internet connection

**Setup Steps**:
1. Go to https://platform.openai.com/
2. Create account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Set environment variable:
   - **Windows**: `set OPENAI_API_KEY=your_key_here`
   - **Mac/Linux**: `export OPENAI_API_KEY=your_key_here`
6. Restart the application
7. In app settings:
   - Select "OpenAI" as provider
   - Choose your preferred model
   - Test connection

**Available Models**:
- `gpt-3.5-turbo` - Fast and cost-effective
- `gpt-4` - Highest quality, more expensive
- `gpt-4-turbo-preview` - Balance of speed and quality

**Cost Estimation** (approximate):
- GPT-3.5 Turbo: ~$0.10-0.20 per game analysis
- GPT-4: ~$0.50-1.00 per game analysis

**Troubleshooting**:
- Verify API key is set: Check environment variables
- Check API usage limits in OpenAI dashboard
- Ensure sufficient credits in your account

### 3. Anthropic Claude

**Best for**: Users wanting thoughtful, detailed analysis

**Requirements**:
- Anthropic account
- API key
- Internet connection

**Setup Steps**:
1. Go to https://console.anthropic.com/
2. Create account or sign in
3. Navigate to API Keys
4. Create a new API key
5. Set environment variable:
   - **Windows**: `set ANTHROPIC_API_KEY=your_key_here`
   - **Mac/Linux**: `export ANTHROPIC_API_KEY=your_key_here`
6. Restart the application
7. In app settings:
   - Select "Anthropic Claude" as provider
   - Choose your preferred model
   - Test connection

**Available Models**:
- `claude-3-haiku-20240307` - Fast and efficient
- `claude-3-sonnet-20240229` - Balanced performance
- `claude-3-opus-20240229` - Highest quality

**Cost Estimation** (approximate):
- Claude 3 Haiku: ~$0.05-0.10 per game analysis  
- Claude 3 Sonnet: ~$0.15-0.30 per game analysis
- Claude 3 Opus: ~$0.75-1.50 per game analysis

**Troubleshooting**:
- Verify API key is set correctly
- Check rate limits in Anthropic console
- Ensure you have access to the chosen model

### 4. Azure OpenAI

**Best for**: Enterprise users with existing Azure subscriptions

**Requirements**:
- Azure subscription
- Azure OpenAI resource
- Deployed model
- Internet connection

**Setup Steps**:
1. Create Azure OpenAI resource in Azure portal
2. Deploy a model (e.g., GPT-3.5 Turbo or GPT-4)
3. Get the API key from resource management
4. Note the endpoint URL and deployment name
5. Set environment variable:
   - **Windows**: `set AZURE_OPENAI_API_KEY=your_key_here`
   - **Mac/Linux**: `export AZURE_OPENAI_API_KEY=your_key_here`
6. Restart the application
7. In app settings:
   - Select "Azure OpenAI" as provider
   - Set endpoint URL (e.g., `https://your-resource.openai.azure.com`)
   - Set deployment name (not model name)
   - Test connection

**Available Models**:
- `gpt-35-turbo` - Standard GPT-3.5 deployment
- `gpt-4` - GPT-4 deployment (if available)

**Troubleshooting**:
- Verify resource is created and model is deployed
- Check API key and endpoint URL are correct
- Ensure deployment name (not model name) is used
- Verify Azure OpenAI access is approved

## Security Best Practices

### Environment Variables
- Never hardcode API keys in the application
- Use environment variables for all credentials
- Restart the application after setting environment variables

### API Key Management
- Rotate API keys regularly
- Use separate keys for development and production
- Monitor API usage for unusual activity
- Set usage limits where possible

### Network Security
- Use HTTPS endpoints only
- Consider using VPN for additional security
- Monitor network traffic if required

## Performance Optimization

### Token Usage
- The app sends ~500 reviews per analysis (truncated to 500 chars each)
- Typical prompt is 10,000-50,000 tokens
- Response is usually 500-1,000 tokens

### Rate Limiting
- OpenAI: 3-60 requests per minute (depends on tier)
- Anthropic: 5-60 requests per minute (depends on plan)
- Azure: Configurable (set in deployment)

### Cost Control
- Set API usage limits in provider dashboards
- Monitor costs regularly
- Consider using smaller models for development/testing
- Use local Ollama for development when possible

## Switching Providers

You can change providers at any time:

1. Go to Settings page
2. Select new provider from dropdown
3. Configure provider-specific settings
4. Set required environment variables
5. Test connection
6. Save settings

**Note**: Existing analyses are not affected by provider changes.

## Support and Resources

### Provider Documentation
- [Ollama Documentation](https://ollama.ai/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Azure OpenAI Documentation](https://docs.microsoft.com/en-us/azure/cognitive-services/openai/)

### Getting Help
- Check connection using the "Test Connection" button
- Review application logs for detailed error messages
- Verify environment variables are set correctly
- Ensure sufficient credits/quota for cloud providers

## Troubleshooting Common Issues

### "API Key Not Found" Error
- Verify environment variable is set correctly
- Restart the application after setting environment variables
- Check variable name matches exactly (case-sensitive)

### "Connection Failed" Error
- Check internet connection (for cloud providers)
- Verify service endpoint is accessible
- Test API key using provider's documentation/tools

### "Rate Limit Exceeded" Error
- Wait before retrying
- Check rate limits in provider dashboard
- Consider upgrading to higher tier

### "Model Not Found" Error
- Verify model name is correct and available
- Check if model requires special access
- For Azure: ensure model is deployed (not just available)

### "Insufficient Credits" Error
- Add credits to your account
- Check billing settings
- Monitor usage to prevent future issues