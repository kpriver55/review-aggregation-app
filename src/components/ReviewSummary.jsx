import React from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'

const ReviewSummary = ({ positiveAspects, negativeAspects }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <ThumbsUp className="h-6 w-6 text-green-500 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">What Players Love</h2>
        </div>
        <ul className="space-y-2">
          {positiveAspects.map((aspect, index) => (
            <li key={index} className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{aspect}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <ThumbsDown className="h-6 w-6 text-red-500 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">Common Complaints</h2>
        </div>
        <ul className="space-y-2">
          {negativeAspects.map((aspect, index) => (
            <li key={index} className="flex items-start">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{aspect}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default ReviewSummary