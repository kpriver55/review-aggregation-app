import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Star, ThumbsUp, ThumbsDown, MessageCircle, ExternalLink, Play } from 'lucide-react'
import SentimentChart from '../components/SentimentChart'
import ReviewSummary from '../components/ReviewSummary'
import LoadingSpinner from '../components/LoadingSpinner'
import AnalysisProgress from '../components/AnalysisProgress'

const GameDetailsPage = () => {
  const { appId } = useParams()
  const [game, setGame] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadGameData()
  }, [appId])

  const loadGameData = async () => {
    setLoading(true)
    try {
      if (window.electronAPI?.database && window.electronAPI?.steam) {
        // First check if we have cached data
        let gameData = await window.electronAPI.database.getGame(appId)
        
        // If no cached data, fetch from Steam
        if (!gameData) {
          console.log('Fetching game details from Steam for appId:', appId)
          gameData = await window.electronAPI.steam.getGameDetails(appId)
          
          // Save to database for future use
          if (gameData) {
            await window.electronAPI.database.saveGame(gameData)
          }
        }
        
        // Check for existing summary
        const summaryData = await window.electronAPI.database.getSummary(appId)
        
        setGame(gameData)
        setSummary(summaryData || null)
      } else {
        console.log('Electron API not available, please run with npm run dev')
        setGame({
          appid: appId,
          name: 'Please run the app using npm run dev',
          developer: 'Steam API requires Electron',
          publisher: 'See getting-started.md',
          release_date: 'N/A',
          price: 'N/A',
          description: 'The Steam API is only available when running the app through Electron.',
          header_image: 'https://via.placeholder.com/460x215?text=Run+with+Electron',
          total_reviews: 0
        })
      }
    } catch (error) {
      console.error('Failed to load game data:', error)
      setGame({
        appid: appId,
        name: 'Error loading game',
        developer: 'Error',
        publisher: 'Error',
        release_date: 'N/A',
        price: 'N/A',
        description: error.message || 'Failed to fetch game details from Steam',
        header_image: 'https://via.placeholder.com/460x215?text=Error',
        total_reviews: 0
      })
    } finally {
      setLoading(false)
    }
  }


  const handleStartAnalysis = async () => {
    setProcessing(true)
    try {
      console.log('Starting analysis for game:', appId)
      
      if (window.electronAPI?.processing?.startAnalysis) {
        const result = await window.electronAPI.processing.startAnalysis(appId, {
          maxReviews: 1000,
          language: 'english'
        })
        
        setSummary(result.summary)
        setGame(result.game)
        
        // Reload the page data to show the new summary
        await loadGameData()
      } else {
        console.error('Processing API not available. Please run the app with npm run dev')
        alert('Please run the app using Electron to analyze games. See getting-started.md for instructions.')
      }
    } catch (error) {
      console.error('Analysis failed:', error)
      alert(`Analysis failed: ${error.message || 'Unknown error'}`)
    }
  }

  const handleAnalysisComplete = () => {
    setProcessing(false)
    loadGameData() // Refresh data to show new summary
  }

  const handleAnalysisError = (error) => {
    setProcessing(false)
    console.error('Analysis failed:', error)
    alert(`Analysis failed: ${error.message || 'Unknown error'}`)
  }

  if (loading) {
    return <LoadingSpinner message="Loading game data..." />
  }

  if (!game) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600">Game not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start space-x-6">
          <img
            src={game.header_image}
            alt={game.name}
            className="w-48 h-24 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{game.name}</h1>
            <p className="text-gray-600 mb-4">
              {game.developer} • {game.publisher} • {game.release_date}
            </p>
            <p className="text-gray-700 mb-4">{game.description}</p>
            <div className="flex items-center space-x-4">
              <span className="text-2xl font-bold text-primary-600">{game.price}</span>
              <a
                href={`https://store.steampowered.com/app/${game.appid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Steam
              </a>
            </div>
          </div>
        </div>
      </div>

      {!summary && !processing && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Analysis Yet</h2>
          <p className="text-gray-600 mb-6">
            Start analyzing reviews to get AI-powered insights about this game.
          </p>
          <button
            onClick={handleStartAnalysis}
            className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 mx-auto"
          >
            <Play className="h-5 w-5 mr-2" />
            Start Analysis
          </button>
        </div>
      )}

      {processing && (
        <AnalysisProgress 
          gameId={appId}
          gameName={game.name}
          onComplete={handleAnalysisComplete}
          onError={handleAnalysisError}
        />
      )}

      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Overall Sentiment</h2>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <Star className="h-8 w-8 text-yellow-400 mr-2" />
                  <span className="text-3xl font-bold">{summary.overall_sentiment}/10</span>
                </div>
              </div>
              <SentimentChart data={summary.sentiment_breakdown} />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Common Themes</h2>
              <div className="space-y-3">
                {summary.common_themes.map((theme, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="font-medium">{theme.theme}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{theme.mentions} mentions</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">{theme.sentiment}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <ReviewSummary
              positiveAspects={summary.positive_aspects}
              negativeAspects={summary.negative_aspects}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default GameDetailsPage