import React, { useState } from 'react'
import { Search, Clock, Star, Users } from 'lucide-react'
import GameSearch from '../components/GameSearch'
import RecentGames from '../components/RecentGames'
import ProcessingQueue from '../components/ProcessingQueue'

const HomePage = () => {
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (query) => {
    setIsSearching(true)
    try {
      if (window.electronAPI?.steam?.searchGames) {
        const results = await window.electronAPI.steam.searchGames(query)
        setSearchResults(results)
      } else {
        console.log('Development mode: Mock search for:', query)
        setSearchResults([
          {
            appid: 570,
            name: 'Dota 2',
            developer: 'Valve',
            price: 'Free',
            release_date: '2013-07-09',
            header_image: 'https://via.placeholder.com/460x215?text=Dota+2'
          },
          {
            appid: 730,
            name: 'Counter-Strike 2',
            developer: 'Valve',
            price: 'Free',
            release_date: '2012-08-21',
            header_image: 'https://via.placeholder.com/460x215?text=CS2'
          }
        ])
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const stats = [
    { name: 'Games Processed', value: '0', icon: Star },
    { name: 'Reviews Analyzed', value: '0', icon: Users },
    { name: 'Processing Time Saved', value: '0h', icon: Clock },
  ]

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Discover Games Through AI-Powered Review Analysis
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Get instant insights from thousands of Steam reviews using local AI models. 
          Make informed gaming decisions without the review fatigue.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <stat.icon className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <GameSearch 
        onSearch={handleSearch}
        searchResults={searchResults}
        isSearching={isSearching}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentGames />
        <ProcessingQueue />
      </div>
    </div>
  )
}

export default HomePage