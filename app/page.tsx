'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { RefreshCw, Search } from 'lucide-react'
import { Header } from '@/components/header'
import { MarketOverview } from '@/components/market-overview'
import { CryptoTable } from '@/components/crypto-table'
import { FearGreedIndex } from '@/components/fear-greed-index'
import { CategoryFilter } from '@/components/category-filter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { CryptoData, GlobalData } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  const apiUrl = selectedCategory === 'all' 
    ? '/api/crypto' 
    : `/api/crypto/category?category=${selectedCategory}`
  
  const { data: cryptoData, isLoading: cryptoLoading, mutate: mutateCrypto } = useSWR<CryptoData[]>(
    apiUrl,
    fetcher,
    { refreshInterval: 60000 }
  )
  
  const { data: globalData, isLoading: globalLoading } = useSWR<GlobalData>(
    '/api/global',
    fetcher,
    { refreshInterval: 60000 }
  )

  const filteredData = useMemo(() => {
    if (!cryptoData) return []
    if (!searchQuery) return cryptoData
    
    const query = searchQuery.toLowerCase()
    return cryptoData.filter(
      coin => 
        coin.name.toLowerCase().includes(query) ||
        coin.symbol.toLowerCase().includes(query)
    )
  }, [cryptoData, searchQuery])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setSearchQuery('')
  }

  const isLoading = cryptoLoading || globalLoading

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground text-balance">
              Курси криптовалют за ринковою капіталізацією
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Капіталізація світового ринку криптовалюти сьогодні складає{' '}
              {globalData ? (
                <span className="font-medium text-foreground">
                  ${(globalData.data.total_market_cap.usd / 1e12).toFixed(2)} трлн
                </span>
              ) : '...'}, зміна{' '}
              {globalData ? (
                <span className={globalData.data.market_cap_change_percentage_24h_usd >= 0 ? 'text-[#16c784]' : 'text-[#ea3943]'}>
                  {globalData.data.market_cap_change_percentage_24h_usd >= 0 ? '+' : ''}
                  {globalData.data.market_cap_change_percentage_24h_usd.toFixed(1)}%
                </span>
              ) : '...'}{' '}
              за останні 24 години.
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => mutateCrypto()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Оновити
          </Button>
        </div>

        {/* Market Overview with Fear & Greed Index */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6 items-stretch">
          <div className="lg:col-span-3">
            <MarketOverview 
              globalData={globalData || null} 
              cryptoData={cryptoData || []} 
              isLoading={isLoading}
            />
          </div>
          <div className="lg:col-span-1 flex flex-col">
            <FearGreedIndex />
          </div>
        </div>

        {/* Category Filter and Search */}
        <div className="my-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CategoryFilter 
            selectedCategory={selectedCategory} 
            onCategoryChange={handleCategoryChange} 
          />
          
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Пошук криптовалюти..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full sm:w-64 h-9 bg-secondary border-0"
            />
          </div>
        </div>

        <CryptoTable data={filteredData} isLoading={cryptoLoading} />

        <footer className="mt-8 py-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>Дані надаються CoinGecko API та Alternative.me. Оновлюються кожні 60 секунд.</p>
          <p className="mt-1">Навчальна практика з WEB програмування 2026</p>
        </footer>
      </main>
    </div>
  )
}