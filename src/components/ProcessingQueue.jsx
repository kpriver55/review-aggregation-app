import React, { useState, useEffect } from 'react'
import { Play, Pause, X, Clock, CheckCircle, AlertCircle } from 'lucide-react'

const ProcessingQueue = () => {
  const [queueItems, setQueueItems] = useState([])
  const [loading, setLoading] = useState(true)

  const loadQueue = async () => {
    try {
      if (window.electronAPI?.processing?.getQueue) {
        const queue = await window.electronAPI.processing.getQueue()
        setQueueItems(queue)
      }
    } catch (error) {
      console.error('Failed to load processing queue:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadQueue()
    
    // Refresh queue every 5 seconds
    const interval = setInterval(loadQueue, 5000)
    return () => clearInterval(interval)
  }, [])

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'processing': return 'Processing'
      case 'completed': return 'Completed'
      case 'queued': return 'Queued'
      case 'failed': return 'Failed'
      default: return status
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'queued':
        return <Pause className="h-4 w-4 text-gray-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
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
      case 'failed':
        return 'bg-red-500'
      default:
        return 'bg-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Processing Queue</h2>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading...</p>
        </div>
      </div>
    )
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
                  <span className="font-medium text-gray-900">{item.game_name || `Game ${item.appid}`}</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">{getStatusText(item.status)}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {item.started_at && `Started: ${formatTimestamp(item.started_at)}`}
                </div>
              </div>
              
              {item.status === 'processing' && (
                <div className="mt-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{item.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getStatusColor(item.status)}`}
                      style={{ width: `${item.progress || 0}%` }}
                    />
                  </div>
                </div>
              )}
              
              {item.status === 'failed' && item.error_message && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {item.error_message}
                </div>
              )}
              
              {item.status === 'completed' && item.completed_at && (
                <p className="text-sm text-green-600 mt-1">
                  Completed at {formatTimestamp(item.completed_at)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProcessingQueue