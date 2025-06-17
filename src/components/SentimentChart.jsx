import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const SentimentChart = ({ data }) => {
  const chartData = [
    { name: 'Positive', value: data.positive, color: '#10b981' },
    { name: 'Mixed', value: data.mixed, color: '#f59e0b' },
    { name: 'Negative', value: data.negative, color: '#ef4444' }
  ]

  const COLORS = {
    'Positive': '#10b981',
    'Mixed': '#f59e0b',
    'Negative': '#ef4444'
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SentimentChart