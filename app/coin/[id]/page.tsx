'use client'

import { useParams } from 'next/navigation'
import useSWR from 'swr'
import Link from 'next/link'
import { ChevronRight, Star, ExternalLink, Plus } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import type { CoinDetail, ChartData, PortfolioItem } from '@/lib/types'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const fetcher = (url: string) => fetch(url).then(res => res.json())

const timeRanges = [
  { label: '24г', days: '1' },
  { label: '7д', days: '7' },
  { label: '14д', days: '14' },
  { label: '30д', days: '30' },
  { label: '1р', days: '365' },
  { label: 'Макс', days: 'max' },
]

function formatPrice(price: number): string {
  if (price >= 1) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (price >= 0.01) return `$${price.toFixed(4)}`
  return `$${price.toFixed(8)}`
}

function formatLargeNumber(num: number | null): string {
  if (num === null) return '∞'
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)} трлн`
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)} млрд`
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)} млн`
  return `$${num.toLocaleString()}`
}

function formatSupply(num: number | null): string {
  if (num === null) return '∞'
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)} млрд`
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)} млн`
  return num.toLocaleString()
}

function PriceChange({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted-foreground">-</span>
  const isPositive = value >= 0
  return (
    <span className={`font-medium ${isPositive ? 'text-[#16c784]' : 'text-[#ea3943]'}`}>
      {isPositive ? '+' : ''}{value.toFixed(2)}%
    </span>
  )
}

export default function CoinPage() {
  const params = useParams()
  const id = params.id as string
  const [selectedRange, setSelectedRange] = useState('7')
  const [isFavorite, setIsFavorite] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [amount, setAmount] = useState('')

  const { data: coin, isLoading: coinLoading, error: coinError } = useSWR<CoinDetail>(
    `/api/coin/${id}`,
    fetcher,
    { refreshInterval: 60000 }
  )

  const { data: chartData, isLoading: chartLoading } = useSWR<ChartData>(
    `/api/coin/${id}/chart?days=${selectedRange}`,
    fetcher,
    { refreshInterval: 60000 }
  )

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    setIsFavorite(favorites.includes(id))
  }, [id])

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    if (isFavorite) {
      const newFavorites = favorites.filter((f: string) => f !== id)
      localStorage.setItem('favorites', JSON.stringify(newFavorites))
    } else {
      favorites.push(id)
      localStorage.setItem('favorites', JSON.stringify(favorites))
    }
    setIsFavorite(!isFavorite)
  }

  const addToPortfolio = () => {
    if (!coin || !amount || parseFloat(amount) <= 0) return
    
    const portfolio: PortfolioItem[] = JSON.parse(localStorage.getItem('portfolio') || '[]')
    const newItem: PortfolioItem = {
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: coin.image.small,
      amount: parseFloat(amount),
      buyPrice: coin.market_data.current_price.usd,
      addedAt: Date.now()
    }
    portfolio.push(newItem)
    localStorage.setItem('portfolio', JSON.stringify(portfolio))
    setShowAddModal(false)
    setAmount('')
  }

  const priceChartData = useMemo(() => {
    if (!chartData?.prices) return []
    return chartData.prices.map(([timestamp, price]) => ({
      timestamp,
      price,
      date: new Date(timestamp).toLocaleDateString('uk-UA', { 
        day: 'numeric', 
        month: 'short',
        ...(selectedRange === 'max' || selectedRange === '365' ? { year: 'numeric' } : {})
      }),
    }))
  }, [chartData, selectedRange])

  const volumeChartData = useMemo(() => {
    if (!chartData?.total_volumes) return []
    return chartData.total_volumes.map(([timestamp, volume]) => ({
      timestamp,
      volume,
      date: new Date(timestamp).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' }),
    }))
  }, [chartData])

  const isPriceUp = useMemo(() => {
    if (!priceChartData.length) return true
    return priceChartData[priceChartData.length - 1].price >= priceChartData[0].price
  }, [priceChartData])

  if (coinError) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Монету не знайдено</h1>
          <Link href="/" className="text-primary hover:underline">Повернутися на головну</Link>
        </div>
      </div>
    )
  }

  if (coinLoading || !coin) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-48 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-12 bg-muted rounded w-64" />
                <div className="h-16 bg-muted rounded w-48" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-64 bg-muted rounded" />
              </div>
              <div className="h-96 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const priceRange24h = coin.market_data.high_24h.usd - coin.market_data.low_24h.usd
  const currentInRange = ((coin.market_data.current_price.usd - coin.market_data.low_24h.usd) / priceRange24h) * 100

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Криптовалюти</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Курс {coin.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Coin Info */}
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <img src={coin.image.large} alt={coin.name} className="w-10 h-10 rounded-full" />
              <h1 className="text-2xl font-bold">{coin.name}</h1>
              <span className="text-muted-foreground uppercase">{coin.symbol}</span>
              <span className="bg-secondary text-muted-foreground text-sm px-2 py-0.5 rounded">#{coin.market_cap_rank}</span>
            </div>

            {/* Price */}
            <div className="mb-4">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-4xl font-bold">{formatPrice(coin.market_data.current_price.usd)}</span>
                <PriceChange value={coin.market_data.price_change_percentage_24h} />
              </div>
              <div className="text-[#16c784] text-sm">
                +{coin.market_data.ath_change_percentage.usd > 0 ? '' : ''}{Math.abs(coin.market_data.ath_change_percentage.usd).toFixed(1)}% від ATH
              </div>
            </div>

            {/* 24h Range */}
            <div className="mb-6">
              <div className="relative h-2 bg-secondary rounded-full mb-2">
                <div 
                  className="absolute h-full bg-[#16c784] rounded-full"
                  style={{ width: `${Math.max(0, Math.min(100, currentInRange))}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatPrice(coin.market_data.low_24h.usd)}</span>
                <span className="text-foreground">Діапазон 24г</span>
                <span>{formatPrice(coin.market_data.high_24h.usd)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                <Plus className="h-4 w-4" />
                Додати в портфоліо
              </button>
              <button 
                onClick={toggleFavorite}
                className="p-2 border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                <Star className={`h-5 w-5 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
              </button>
            </div>

            {/* Stats */}
            <div className="border border-border rounded-lg divide-y divide-border">
              <div className="flex justify-between p-4">
                <span className="text-muted-foreground">Ринкова капіталізація</span>
                <span className="font-medium">{formatLargeNumber(coin.market_data.market_cap.usd)}</span>
              </div>
              <div className="flex justify-between p-4">
                <span className="text-muted-foreground">Повна розбавл. оцінка</span>
                <span className="font-medium">{formatLargeNumber(coin.market_data.fully_diluted_valuation.usd)}</span>
              </div>
              <div className="flex justify-between p-4">
                <span className="text-muted-foreground">Обсяг торгів за 24г</span>
                <span className="font-medium">{formatLargeNumber(coin.market_data.total_volume.usd)}</span>
              </div>
              <div className="flex justify-between p-4">
                <span className="text-muted-foreground">Кількість в обігу</span>
                <span className="font-medium">{formatSupply(coin.market_data.circulating_supply)} {coin.symbol.toUpperCase()}</span>
              </div>
              <div className="flex justify-between p-4">
                <span className="text-muted-foreground">Загальне пропозиція</span>
                <span className="font-medium">{formatSupply(coin.market_data.total_supply)}</span>
              </div>
              <div className="flex justify-between p-4">
                <span className="text-muted-foreground">Максимальна пропозиція</span>
                <span className="font-medium">{formatSupply(coin.market_data.max_supply)}</span>
              </div>
            </div>

            {/* Links */}
            {(coin.links.homepage[0] || coin.links.whitepaper) && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Інформація</h3>
                <div className="flex flex-wrap gap-2">
                  {coin.links.homepage[0] && (
                    <a 
                      href={coin.links.homepage[0]} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors"
                    >
                      Веб-сайт <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {coin.links.whitepaper && (
                    <a 
                      href={coin.links.whitepaper} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors"
                    >
                      Whitepaper <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {coin.links.repos_url?.github?.[0] && (
                    <a 
                      href={coin.links.repos_url.github[0]} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors"
                    >
                      GitHub <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Chart */}
          <div>
            {/* Time Range Selector */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {timeRanges.map((range) => (
                <button
                  key={range.days}
                  onClick={() => setSelectedRange(range.days)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedRange === range.days
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* Price Chart */}
            <div className="border border-border rounded-lg p-4 mb-4">
              <h3 className="text-sm text-muted-foreground mb-4">Ціна</h3>
              {chartLoading ? (
                <div className="h-72 bg-muted animate-pulse rounded" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={priceChartData}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isPriceUp ? '#16c784' : '#ea3943'} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={isPriceUp ? '#16c784' : '#ea3943'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      domain={['auto', 'auto']}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                      width={80}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [formatPrice(value), 'Ціна']}
                      labelFormatter={(label) => label}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke={isPriceUp ? '#16c784' : '#ea3943'}
                      strokeWidth={2}
                      fill="url(#priceGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Volume Chart */}
            <div className="border border-border rounded-lg p-4">
              <h3 className="text-sm text-muted-foreground mb-4">Обсяг торгів</h3>
              {chartLoading ? (
                <div className="h-32 bg-muted animate-pulse rounded" />
              ) : (
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={volumeChartData}>
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 10 }}
                      interval="preserveStartEnd"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [formatLargeNumber(value), 'Обсяг']}
                    />
                    <Bar dataKey="volume" fill="#6366f1" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Price Changes Table */}
            <div className="mt-4 border border-border rounded-lg p-4">
              <h3 className="text-sm text-muted-foreground mb-3">Зміна ціни</h3>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">24г</div>
                  <PriceChange value={coin.market_data.price_change_percentage_24h} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">7д</div>
                  <PriceChange value={coin.market_data.price_change_percentage_7d} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">30д</div>
                  <PriceChange value={coin.market_data.price_change_percentage_30d} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">1р</div>
                  <PriceChange value={coin.market_data.price_change_percentage_1y} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add to Portfolio Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Додати в портфоліо</h2>
            <div className="flex items-center gap-3 mb-4 p-3 bg-secondary rounded-lg">
              <img src={coin.image.small} alt={coin.name} className="w-8 h-8 rounded-full" />
              <div>
                <div className="font-medium">{coin.name}</div>
                <div className="text-sm text-muted-foreground">{formatPrice(coin.market_data.current_price.usd)}</div>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Кількість {coin.symbol.toUpperCase()}</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {amount && parseFloat(amount) > 0 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Вартість: {formatPrice(parseFloat(amount) * coin.market_data.current_price.usd)}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                Скасувати
              </button>
              <button
                onClick={addToPortfolio}
                disabled={!amount || parseFloat(amount) <= 0}
                className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Додати
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
