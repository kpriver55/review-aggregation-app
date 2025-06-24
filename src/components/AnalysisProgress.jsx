import React, { useState, useEffect } from 'react'
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react'

const AnalysisProgress = ({ gameId, gameName, onComplete, onError }) => {
  const [currentStep, setCurrentStep] = useState('')
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('Initializing...')
  const [startTime, setStartTime] = useState(Date.now())
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState('')

  const steps = [
    { key: 'init', label: 'Initializing Analysis', expectedDuration: 1 },
    { key: 'game-details', label: 'Fetching Game Information', expectedDuration: 3 },
    { key: 'reviews', label: 'Collecting Reviews', expectedDuration: 15 },
    { key: 'ai-analysis', label: 'AI Analysis & Summary', expectedDuration: 45 },
    { key: 'complete', label: 'Complete', expectedDuration: 0 }
  ]

  const getStepStatus = (stepKey) => {
    const stepIndex = steps.findIndex(s => s.key === stepKey)
    const currentIndex = steps.findIndex(s => s.key === currentStep)
    
    if (stepIndex < currentIndex || currentStep === 'complete') {
      return 'completed'
    } else if (stepIndex === currentIndex) {
      return 'active'
    } else {
      return 'pending'
    }
  }

  const calculateTimeRemaining = () => {
    if (progress === 0) return ''
    
    const elapsed = (Date.now() - startTime) / 1000 // seconds
    const estimatedTotal = elapsed / (progress / 100)
    const remaining = estimatedTotal - elapsed
    
    if (remaining < 60) {
      return `~${Math.ceil(remaining)} seconds remaining`
    } else {
      return `~${Math.ceil(remaining / 60)} minutes remaining`
    }
  }

  useEffect(() => {
    const cleanup = window.electronAPI.processing.onProgress((data) => {
      if (data.appId === gameId) {
        setCurrentStep(data.step)
        setProgress(data.progress)
        setMessage(data.message)
        
        if (data.step === 'complete') {
          onComplete?.()
        }
      }
    })

    return cleanup
  }, [gameId, onComplete])

  useEffect(() => {
    if (progress > 0 && currentStep !== 'complete') {
      const timer = setInterval(() => {
        setEstimatedTimeRemaining(calculateTimeRemaining())
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [progress, startTime, currentStep])

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'active':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-300" />
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Analyzing {gameName}
        </h2>
        <p className="text-gray-600">{message}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        {estimatedTimeRemaining && (
          <p className="text-sm text-gray-500 mt-2 text-center">
            {estimatedTimeRemaining}
          </p>
        )}
      </div>

      {/* Step List */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const status = getStepStatus(step.key)
          return (
            <div
              key={step.key}
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                status === 'active' 
                  ? 'bg-blue-50 border border-blue-200' 
                  : status === 'completed'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              {getStepIcon(status)}
              <div className="flex-1">
                <p className={`font-medium ${
                  status === 'active' ? 'text-blue-900' : 
                  status === 'completed' ? 'text-green-900' : 'text-gray-500'
                }`}>
                  {step.label}
                </p>
                {status === 'active' && step.key === currentStep && (
                  <p className="text-sm text-gray-600 mt-1">{message}</p>
                )}
              </div>
              {status === 'completed' && (
                <span className="text-xs text-green-600 font-medium">✓</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Additional Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>
            This process typically takes 1-3 minutes depending on the number of reviews
          </span>
        </div>
      </div>
    </div>
  )
}

export default AnalysisProgress