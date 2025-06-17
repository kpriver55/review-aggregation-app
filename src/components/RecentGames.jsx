import React, { useState, useEffect } from 'react'
import { Clock, Star, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const RecentGames = () => {
  const navigate = useNavigate()
  const [recentGames, setRecentGames] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecentGames()
  }, [])

  const loadRecentGames = async () => {
    try {
      if (window.electronAPI?.database?.getRecentGames) {
        const games = await window.electronAPI.database.getRecentGames(5)
        const formattedGames = games.map(game => ({
          appid: game.appid,
          name: game.name,
          lastAnalyzed: formatDate(game.last_analyzed),
          sentiment: game.overall_sentiment || 0,
          reviewCount: game.review_count || 0,
          status: 'completed'
        }))
        setRecentGames(formattedGames)
      } else {
        setRecentGames([])
      }
    } catch (error) {
      console.error('Failed to load recent games:', error)
      setRecentGames([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  const handleGameClick = (appid) => {
    navigate(`/game/${appid}`)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Recently Analyzed</h2>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recent games...</p>
        </div>
      ) : recentGames.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No games analyzed yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Search for a game above to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentGames.map((game) => (
            <div
              key={game.appid}
              onClick={() => handleGameClick(game.appid)}
              className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{game.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {game.lastAnalyzed}
                    </span>
                    <span className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {game.reviewCount} reviews
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 mr-1" />
                  <span className="font-semibold">{game.sentiment}/10</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RecentGames