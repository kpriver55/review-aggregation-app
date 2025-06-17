import React from 'react'
import { Play, Pause, X, Clock, CheckCircle } from 'lucide-react'

const ProcessingQueue = () => {
  const queueItems = []

  const mockQueueItems = [
    {
      id: 1,
      name: 'Baldur\'s Gate 3',
      status: 'processing',
      progress: 65,
      eta: '3 min remaining'
    },
    {
      id: 2,
      name: 'Cyberpunk 2077',
      status: 'queued',
      progress: 0,
      eta: 'Waiting...'
    }
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'queued':
        return <Pause className="h-4 w-4 text-gray-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-500'
      case 'completed':
        return 'bg-green-500'
      case 'queued':
        return 'bg-gray-300'
      default:
        return 'bg-gray-300'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Processing Queue</h2>
        {queueItems.length > 0 && (
          <div className="flex space-x-2">
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <Pause className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      
      {queueItems.length === 0 ? (
        <div className="text-center py-8">
          <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No games in processing queue</p>
          <p className="text-sm text-gray-500 mt-2">
            Games will appear here when you start analysis
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {queueItems.map((item) => (
            <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(item.status)}
                  <span className="font-medium text-gray-900">{item.name}</span>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              {item.status === 'processing' && (
                <div className="mt-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{item.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getStatusColor(item.status)}`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{item.eta}</p>
                </div>
              )}
              
              {item.status === 'queued' && (
                <p className="text-sm text-gray-500 mt-1">{item.eta}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProcessingQueue