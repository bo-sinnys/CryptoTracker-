'use client'

import useSWR from 'swr'
import { Card } from '@/components/ui/card'

interface FearGreedData {
  data: {
    value: string
    value_classification: string
    timestamp: string
  }[]
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

function getGaugeColor(value: number): string {
  if (value <= 25) return '#ea3943'
  if (value <= 45) return '#f5a623'
  if (value <= 55) return '#f5d423'
  if (value <= 75) return '#a4d037'
  return '#16c784'
}

function getClassificationUa(classification: string): string {
  const map: Record<string, string> = {
    'Extreme Fear': 'Екстремальний страх',
    'Fear': 'Страх',
    'Neutral': 'Нейтрально',
    'Greed': 'Жадібність',
    'Extreme Greed': 'Екстремальна жадібність'
  }
  return map[classification] || classification
}

export function FearGreedIndex() {
  const { data, isLoading, error } = useSWR<FearGreedData>(
    '/api/fear-greed',
    fetcher,
    { refreshInterval: 300000 }
  )

  if (isLoading) {
    return (
      <Card className="p-4 border border-border animate-pulse">
        <div className="h-32 bg-muted rounded" />
      </Card>
    )
  }

  if (error || !data?.data?.[0]) {
    return null
  }

  const currentValue = parseInt(data.data[0].value)
  const classification = data.data[0].value_classification
  const color = getGaugeColor(currentValue)
  
  // Sparkline data for last 30 days
  const sparklineData = data.data.slice(0, 30).reverse().map(d => parseInt(d.value))

  return (
    <Card className="p-4 border border-border w-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-foreground text-sm">Fear & Greed Index</span>
        <span className="text-xs text-muted-foreground">Оновлюється щодня</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <svg width="100" height="60" viewBox="0 0 100 60">
            {/* Background arc */}
            <path
              d="M 10 55 A 40 40 0 0 1 90 55"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Gradient segments */}
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ea3943" />
                <stop offset="25%" stopColor="#f5a623" />
                <stop offset="50%" stopColor="#f5d423" />
                <stop offset="75%" stopColor="#a4d037" />
                <stop offset="100%" stopColor="#16c784" />
              </linearGradient>
            </defs>
            <path
              d="M 10 55 A 40 40 0 0 1 90 55"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Needle */}
            <g transform={`rotate(${(currentValue / 100) * 180 - 90}, 50, 55)`}>
              <line
                x1="50"
                y1="55"
                x2="50"
                y2="22"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="50" cy="55" r="4" fill={color} />
            </g>
          </svg>
        </div>
        
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold" style={{ color }}>{currentValue}</span>
            <span className="text-sm text-muted-foreground">/ 100</span>
          </div>
          <p className="text-sm font-medium" style={{ color }}>
            {getClassificationUa(classification)}
          </p>
        </div>
      </div>
      
      {/* Mini sparkline */}
      <div className="mt-auto pt-3 border-t border-border">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Останні 30 днів</span>
        </div>
        <svg viewBox="0 0 120 30" className="w-full h-8">
          <defs>
            <linearGradient id="sparklineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {sparklineData.length > 1 && (
            <>
              <path
                d={`M 0 ${30 - (sparklineData[0] / 100) * 28} ${sparklineData.map((v, i) => 
                  `L ${(i / (sparklineData.length - 1)) * 120} ${30 - (v / 100) * 28}`
                ).join(' ')} L 120 30 L 0 30 Z`}
                fill="url(#sparklineGrad)"
              />
              <polyline
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                points={sparklineData.map((v, i) => 
                  `${(i / (sparklineData.length - 1)) * 120},${30 - (v / 100) * 28}`
                ).join(' ')}
              />
            </>
          )}
        </svg>
      </div>
    </Card>
  )
}