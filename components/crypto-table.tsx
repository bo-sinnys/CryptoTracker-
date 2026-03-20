'use client'

import { Star, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import type { CryptoData } from '@/lib/types'

interface CryptoTableProps {
  data: CryptoData[]
  isLoading: boolean
}

type SortField = 'market_cap_rank' | 'name' | 'current_price' | 'price_change_percentage_1h_in_currency' | 'price_change_percentage_24h_in_currency' | 'price_change_percentage_7d_in_currency' | 'total_volume' | 'market_cap'
type SortDirection = 'asc' | 'desc' | null

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  if (!data || data.length === 0) return <div className="w-32 h-10" />
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 128
    const y = 40 - ((value - min) / range) * 36
    return `${x},${y}`
  }).join(' ')
  return (
    <svg viewBox="0 0 128 40" className="w-32 h-10" preserveAspectRatio="none">
      <polyline fill="none" stroke={positive ? '#16c784' : '#ea3943'} strokeWidth="1.5" points={points} />
    </svg>
  )
}

function formatPrice(price: number): string {
  if (price >= 1) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (price >= 0.01) return `$${price.toFixed(4)}`
  return `$${price.toFixed(6)}`
}

function formatMarketCap(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(0)} трлн`
  if (num >= 1e9) return `$${(num / 1e9).toFixed(0)} млрд`
  if (num >= 1e6) return `$${(num / 1e6).toFixed(0)} млн`
  return `$${num.toLocaleString()}`
}

function PriceChange({ value }: { value: number | null }) {
  if (value === null || value === undefined) return <span className="text-muted-foreground">-</span>
  const isPositive = value > 0
  const isNegative = value < 0
  return (
    <span className={`inline-flex items-center gap-0.5 ${isPositive ? 'text-[#16c784]' : isNegative ? 'text-[#ea3943]' : 'text-muted-foreground'}`}>
      {isPositive && <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M5 2L9 8H1L5 2Z" /></svg>}
      {isNegative && <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M5 8L1 2H9L5 8Z" /></svg>}
      {Math.abs(value).toFixed(1)}%
    </span>
  )
}

function SortIcon({ direction }: { direction: SortDirection }) {
  if (direction === 'asc') return <ChevronUp className="h-4 w-4" />
  if (direction === 'desc') return <ChevronDown className="h-4 w-4" />
  return <ChevronsUpDown className="h-4 w-4 opacity-50" />
}

function SortableHeader({ label, field, currentSort, direction, onSort, align = 'right', className = '' }: {
  label: string; field: SortField; currentSort: SortField | null; direction: SortDirection
  onSort: (field: SortField) => void; align?: 'left' | 'right'; className?: string
}) {
  const isActive = currentSort === field
  return (
    <th className={`p-4 text-sm font-medium text-muted-foreground ${className}`}>
      <button onClick={() => onSort(field)} className={`flex items-center gap-1 hover:text-foreground transition-colors ${align === 'right' ? 'ml-auto' : ''}`}>
        <span>{label}</span>
        <SortIcon direction={isActive ? direction : null} />
      </button>
    </th>
  )
}

// localStorage key
const LS_KEY = 'cryptotracker_favorites'

function loadFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return new Set(JSON.parse(raw))
  } catch {}
  return new Set()
}

function saveFavorites(favs: Set<string>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify([...favs]))
  } catch {}
}

export function CryptoTable({ data, isLoading }: CryptoTableProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  // Load from localStorage on mount
  useEffect(() => {
    setFavorites(loadFavorites())
  }, [])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'desc') setSortDirection('asc')
      else if (sortDirection === 'asc') { setSortField(null); setSortDirection(null) }
      else setSortDirection('desc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      saveFavorites(next)
      return next
    })
  }

  const sortedData = useMemo(() => {
    if (!sortField || !sortDirection) return data
    return [...data].sort((a, b) => {
      if (sortField === 'name') {
        const av = a.name.toLowerCase(), bv = b.name.toLowerCase()
        return sortDirection === 'asc' ? (av < bv ? -1 : 1) : (av > bv ? -1 : 1)
      }
      const aNum = (a[sortField] as number) ?? 0
      const bNum = (b[sortField] as number) ?? 0
      return sortDirection === 'asc' ? aNum - bNum : bNum - aNum
    })
  }, [data, sortField, sortDirection])

  if (isLoading) {
    return (
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <div className="animate-pulse">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-border">
              <div className="w-8 h-8 bg-muted rounded-full" />
              <div className="flex-1"><div className="h-4 bg-muted rounded w-24" /></div>
              <div className="h-4 bg-muted rounded w-20" />
              <div className="h-4 bg-muted rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left p-4 text-sm font-medium text-muted-foreground w-12"></th>
              <SortableHeader label="#" field="market_cap_rank" currentSort={sortField} direction={sortDirection} onSort={handleSort} align="left" className="w-12" />
              <SortableHeader label="Монета" field="name" currentSort={sortField} direction={sortDirection} onSort={handleSort} align="left" />
              <SortableHeader label="Ціна" field="current_price" currentSort={sortField} direction={sortDirection} onSort={handleSort} />
              <SortableHeader label="1г" field="price_change_percentage_1h_in_currency" currentSort={sortField} direction={sortDirection} onSort={handleSort} />
              <SortableHeader label="24г" field="price_change_percentage_24h_in_currency" currentSort={sortField} direction={sortDirection} onSort={handleSort} />
              <SortableHeader label="7д" field="price_change_percentage_7d_in_currency" currentSort={sortField} direction={sortDirection} onSort={handleSort} />
              <SortableHeader label="Обсяг 24г" field="total_volume" currentSort={sortField} direction={sortDirection} onSort={handleSort} className="hidden lg:table-cell" />
              <SortableHeader label="Капіталізація" field="market_cap" currentSort={sortField} direction={sortDirection} onSort={handleSort} className="hidden md:table-cell" />
              <th className="text-right p-4 text-sm font-medium text-muted-foreground hidden xl:table-cell">7 днів</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((coin) => {
              const is7dPositive = (coin.price_change_percentage_7d_in_currency || 0) >= 0
              const isFav = favorites.has(coin.id)
              return (
                <tr key={coin.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                  <td className="p-4">
                    <button onClick={(e) => toggleFavorite(coin.id, e)} className="hover:scale-110 transition-transform" title={isFav ? 'Видалити з улюблених' : 'Додати до улюблених'}>
                      <Star className={`h-4 w-4 transition-colors ${isFav ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground hover:text-yellow-400'}`} />
                    </button>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    <Link href={`/coin/${coin.id}`} className="block">{coin.market_cap_rank}</Link>
                  </td>
                  <td className="p-4">
                    <Link href={`/coin/${coin.id}`} className="flex items-center gap-3">
                      <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                      <div>
                        <span className="font-medium text-foreground">{coin.name}</span>
                        <span className="text-muted-foreground text-xs ml-2 uppercase">{coin.symbol}</span>
                      </div>
                    </Link>
                  </td>
                  <td className="p-4 text-right font-medium text-foreground">
                    <Link href={`/coin/${coin.id}`} className="block">{formatPrice(coin.current_price)}</Link>
                  </td>
                  <td className="p-4 text-right text-sm"><Link href={`/coin/${coin.id}`} className="block"><PriceChange value={coin.price_change_percentage_1h_in_currency} /></Link></td>
                  <td className="p-4 text-right text-sm"><Link href={`/coin/${coin.id}`} className="block"><PriceChange value={coin.price_change_percentage_24h_in_currency} /></Link></td>
                  <td className="p-4 text-right text-sm"><Link href={`/coin/${coin.id}`} className="block"><PriceChange value={coin.price_change_percentage_7d_in_currency} /></Link></td>
                  <td className="p-4 text-right text-sm text-foreground hidden lg:table-cell"><Link href={`/coin/${coin.id}`} className="block">{formatMarketCap(coin.total_volume)}</Link></td>
                  <td className="p-4 text-right text-sm text-foreground hidden md:table-cell"><Link href={`/coin/${coin.id}`} className="block">{formatMarketCap(coin.market_cap)}</Link></td>
                  <td className="p-4 text-right hidden xl:table-cell">
                    <Link href={`/coin/${coin.id}`} className="block">
                      <Sparkline data={coin.sparkline_in_7d?.price || []} positive={is7dPositive} />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}