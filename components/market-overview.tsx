'use client'

import { TrendingUp, TrendingDown, Flame, Rocket } from 'lucide-react'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import type { GlobalData, CryptoData } from '@/lib/types'

interface MarketOverviewProps {
  globalData: GlobalData | null
  cryptoData: CryptoData[]
  isLoading: boolean
}

function formatNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)} трлн`
  if (num >= 1e9)  return `$${(num / 1e9).toFixed(2)} млрд`
  if (num >= 1e6)  return `$${(num / 1e6).toFixed(2)} млн`
  return `$${num.toLocaleString()}`
}

function formatPrice(price: number): string {
  if (price >= 1)    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (price >= 0.01) return `$${price.toFixed(4)}`
  return `$${price.toFixed(6)}`
}

function MiniSparkline({ data, positive }: { data: number[]; positive: boolean }) {
  if (!data || data.length === 0) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 100}`).join(' ')
  return (
    <svg viewBox="0 0 100 100" className="w-20 h-10" preserveAspectRatio="none">
      <polyline fill="none" stroke={positive ? '#16c784' : '#ea3943'} strokeWidth="2.5" points={points} />
    </svg>
  )
}

function CoinRow({ coin }: { coin: CryptoData }) {
  const change = coin.price_change_percentage_24h_in_currency ?? 0
  const isUp = change >= 0
  return (
    <Link
      href={`/coin/${coin.id}`}
      className="flex items-center justify-between rounded-lg px-2 py-1.5 -mx-2 hover:bg-secondary/40 transition-colors"
    >
      <div className="flex items-center gap-2 min-w-0">
        <img src={coin.image} alt={coin.name} className="w-5 h-5 rounded-full flex-shrink-0" />
        <span className="text-sm text-foreground truncate">{coin.name}</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        <span className="text-sm font-medium text-foreground tabular-nums">
          {formatPrice(coin.current_price)}
        </span>
        <span className={`text-xs font-medium w-12 text-right tabular-nums ${isUp ? 'text-[#16c784]' : 'text-[#ea3943]'}`}>
          {isUp ? '▲' : '▼'}{Math.abs(change).toFixed(1)}%
        </span>
      </div>
    </Link>
  )
}

export function MarketOverview({ globalData, cryptoData, isLoading }: MarketOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-4 animate-pulse h-full">
            <div className="h-full min-h-[140px] bg-muted rounded" />
          </Card>
        ))}
      </div>
    )
  }

  const topGainers = [...cryptoData]
    .filter(c => (c.price_change_percentage_24h_in_currency ?? null) !== null)
    .sort((a, b) => (b.price_change_percentage_24h_in_currency || 0) - (a.price_change_percentage_24h_in_currency || 0))
    .slice(0, 5)

  const trending = [...cryptoData]
    .sort((a, b) => b.total_volume - a.total_volume)
    .slice(0, 5)

  const mcapPositive = (globalData?.data.market_cap_change_percentage_24h_usd ?? 0) >= 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">

      {/* ── Ринкова капіталізація ── */}
      <Card className="p-5 border border-border h-full flex flex-col justify-between">
        {/* Top: mcap */}
        <div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground leading-tight">
                {globalData ? formatNumber(globalData.data.total_market_cap.usd) : '—'}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">Ринкова капіталізація</p>
              {globalData && (
                <p className={`text-sm flex items-center gap-1 mt-1 font-medium ${mcapPositive ? 'text-[#16c784]' : 'text-[#ea3943]'}`}>
                  {mcapPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {mcapPositive ? '+' : ''}{globalData.data.market_cap_change_percentage_24h_usd.toFixed(1)}%
                </p>
              )}
            </div>
            {cryptoData[0]?.sparkline_in_7d && (
              <MiniSparkline
                data={cryptoData[0].sparkline_in_7d.price.slice(-24)}
                positive={mcapPositive}
              />
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-3" />

        {/* Bottom: volume */}
        <div>
          <p className="text-xl font-bold text-foreground leading-tight">
            {globalData ? formatNumber(globalData.data.total_volume.usd) : '—'}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">Обсяг торгів за 24г</p>
        </div>
      </Card>

      {/* ── Популярно ── */}
      <Card className="p-5 border border-border h-full flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="font-semibold text-foreground text-sm">Популярно</span>
        </div>
        <div className="flex flex-col gap-0.5 flex-1">
          {trending.length > 0
            ? trending.map(coin => <CoinRow key={coin.id} coin={coin} />)
            : [1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5 animate-pulse">
                  <div className="w-5 h-5 rounded-full bg-muted flex-shrink-0" />
                  <div className="h-3 bg-muted rounded flex-1" />
                  <div className="h-3 bg-muted rounded w-16" />
                </div>
              ))
          }
        </div>
      </Card>

      {/* ── Найбільший ріст ── */}
      <Card className="p-5 border border-border h-full flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <Rocket className="h-4 w-4 text-[#16c784]" />
          <span className="font-semibold text-foreground text-sm">Найбільший ріст</span>
        </div>
        <div className="flex flex-col gap-0.5 flex-1">
          {topGainers.length > 0
            ? topGainers.map(coin => <CoinRow key={coin.id} coin={coin} />)
            : [1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5 animate-pulse">
                  <div className="w-5 h-5 rounded-full bg-muted flex-shrink-0" />
                  <div className="h-3 bg-muted rounded flex-1" />
                  <div className="h-3 bg-muted rounded w-16" />
                </div>
              ))
          }
        </div>
      </Card>

    </div>
  )
}