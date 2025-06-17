import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Star, ThumbsUp, ThumbsDown, MessageCircle, ExternalLink, Play } from 'lucide-react'
import SentimentChart from '../components/SentimentChart'
import ReviewSummary from '../components/ReviewSummary'
import LoadingSpinner from '../components/LoadingSpinner'

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
      if (window.electronAPI?.database) {
        const gameData = await window.electronAPI.database.getGame(appId)
        const summaryData = await window.electronAPI.database.getSummary(appId)
        
        setGame(gameData || getMockGameData())
        setSummary(summaryData || null)
      } else {
        setGame(getMockGameData())
        setSummary(getMockSummaryData())
      }
    } catch (error) {
      console.error('Failed to load game data:', error)
      setGame(getMockGameData())
    } finally {
      setLoading(false)
    }
  }

  const getMockGameData = () => ({
    appid: appId,
    name: appId === '570' ? 'Dota 2' : 'Sample Game',
    developer: 'Valve',
    publisher: 'Valve',
    release_date: '2013-07-09',
    price: 'Free',
    description: 'A multiplayer online battle arena game.',
    header_image: 'https://via.placeholder.com/460x215?text=Game+Image',
    total_reviews: 1250000
  })

  const getMockSummaryData = () => ({
    overall_sentiment: 8.2,
    sentiment_breakdown: {
      positive: 75,
      mixed: 15,
      negative: 10
    },
    positive_aspects: [
      'Excellent gameplay mechanics',
      'Great graphics and visuals',
      'Strong community support',
      'Regular updates and content'
    ],
    negative_aspects: [
      'Steep learning curve',
      'Some performance issues',
      'Occasional bugs'
    ],
    common_themes: [
      { theme: 'Gameplay', mentions: 450, sentiment: 8.5 },
      { theme: 'Graphics', mentions: 320, sentiment: 8.1 },
      { theme: 'Performance', mentions: 280, sentiment: 6.8 },
      { theme: 'Story', mentions: 210, sentiment: 7.9 }
    ],
    generated_at: new Date().toISOString()
  })

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
      } else {
        await new Promise(resolve => setTimeout(resolve, 3000))
        setSummary(getMockSummaryData())
      }
    } catch (error) {
      console.error('Analysis failed:', error)
      setSummary(getMockSummaryData())
    } finally {
      setProcessing(false)
    }
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
        <LoadingSpinner message="Analyzing reviews... This may take a few minutes." />
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