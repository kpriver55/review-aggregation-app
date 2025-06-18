import React, { useState } from 'react'
import { Search, ExternalLink, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const GameSearch = ({ onSearch, searchResults, isSearching }) => {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  const handleAddToQueue = (game) => {
    console.log('Adding to processing queue:', game)
    navigate(`/game/${game.appid}`)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Search Steam Games</h2>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for games..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 placeholder-gray-400"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Search Results</h3>
          <div className="grid gap-4">
            {searchResults.map((game) => (
              <div key={game.appid} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={game.header_image || 'https://via.placeholder.com/100x50?text=No+Image'}
                      alt={game.name}
                      className="w-20 h-10 object-cover rounded"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{game.name}</h4>
                      <p className="text-sm text-gray-600">
                        {game.developer} • {game.release_date} • {game.price || 'Price not available'}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAddToQueue(game)}
                      className="flex items-center px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Analyze
                    </button>
                    <a
                      href={`https://store.steampowered.com/app/${game.appid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Steam
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default GameSearch