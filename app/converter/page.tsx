'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { ArrowDownUp, Search, TrendingUp, TrendingDown } from 'lucide-react'
import { Header } from '@/components/header'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { CryptoData } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then(res => res.json())

function CoinSelector({ 
  coins, 
  selected, 
  onSelect, 
  label 
}: { 
  coins: CryptoData[]
  selected: CryptoData | undefined
  onSelect: (id: string) => void
  label: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredCoins = coins.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.symbol.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="relative flex-1">
      <span className="text-sm text-muted-foreground mb-2 block">{label}</span>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 rounded-xl border border-input hover:border-[#8DC63F] hover:bg-accent/50 transition-all w-full bg-background"
      >
        {selected && (
          <img src={selected.image} alt={selected.name} className="w-8 h-8 rounded-full" />
        )}
        <div className="flex-1 text-left">
          <div className="font-semibold text-lg">{selected?.symbol.toUpperCase() || 'Виберіть'}</div>
          <div className="text-muted-foreground text-sm truncate">{selected?.name}</div>
        </div>
        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-input rounded-xl shadow-xl z-20 max-h-80 overflow-hidden">
            <div className="p-3 border-b border-input">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Пошук криптовалюти..."
                  className="pl-10 h-10"
                  autoFocus
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-60">
              {filteredCoins.map(coin => (
                <button
                  key={coin.id}
                  onClick={() => {
                    onSelect(coin.id)
                    setIsOpen(false)
                    setSearch('')
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-accent transition-colors"
                >
                  <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                  <div className="flex-1 text-left">
                    <span className="font-medium">{coin.symbol.toUpperCase()}</span>
                    <span className="text-muted-foreground text-sm ml-2">{coin.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">${coin.current_price.toLocaleString()}</div>
                    <div className={`text-xs flex items-center gap-1 justify-end ${coin.price_change_percentage_24h >= 0 ? 'text-[#16c784]' : 'text-[#ea3943]'}`}>
                      {coin.price_change_percentage_24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function ConverterPage() {
  const [fromCrypto, setFromCrypto] = useState('bitcoin')
  const [toCrypto, setToCrypto] = useState('tether')
  const [fromAmount, setFromAmount] = useState('1')
  const [toAmount, setToAmount] = useState('')

  const { data: cryptoData, isLoading } = useSWR<CryptoData[]>(
    '/api/crypto',
    fetcher,
    { refreshInterval: 60000 }
  )

  const fromCoin = cryptoData?.find(c => c.id === fromCrypto)
  const toCoin = cryptoData?.find(c => c.id === toCrypto)

  useEffect(() => {
    if (fromCoin && toCoin && fromAmount) {
      const amount = parseFloat(fromAmount) || 0
      const result = (amount * fromCoin.current_price) / toCoin.current_price
      setToAmount(result.toFixed(8).replace(/\.?0+$/, ''))
    }
  }, [fromAmount, fromCrypto, toCrypto, fromCoin, toCoin])

  const swapCurrencies = () => {
    setFromCrypto(toCrypto)
    setToCrypto(fromCrypto)
    setFromAmount(toAmount)
  }

  const usdValue = fromCoin && fromAmount ? parseFloat(fromAmount) * fromCoin.current_price : 0

  if (isLoading || !cryptoData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-secondary rounded w-1/2 mx-auto" />
            <div className="h-64 bg-secondary rounded-xl" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Конвертер криптовалют</h1>
          <p className="text-muted-foreground">Конвертуйте криптовалюти за актуальним курсом</p>
        </div>

        <Card className="p-6 md:p-8">
          <div className="space-y-6">
            {/* From Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <span className="text-sm text-muted-foreground mb-2 block">Сума</span>
                  <Input
                    type="number"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    className="text-2xl font-semibold h-14 text-center"
                    placeholder="0"
                  />
                </div>
                <CoinSelector
                  coins={cryptoData}
                  selected={fromCoin}
                  onSelect={setFromCrypto}
                  label="Валюта"
                />
              </div>
              {fromCoin && (
                <div className="flex items-center justify-between text-sm px-1">
                  <span className="text-muted-foreground">Курс: 1 {fromCoin.symbol.toUpperCase()} = ${fromCoin.current_price.toLocaleString()}</span>
                  <span className={`flex items-center gap-1 ${fromCoin.price_change_percentage_24h >= 0 ? 'text-[#16c784]' : 'text-[#ea3943]'}`}>
                    {fromCoin.price_change_percentage_24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(fromCoin.price_change_percentage_24h).toFixed(2)}% (24h)
                  </span>
                </div>
              )}
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={swapCurrencies}
                className="h-12 w-12 rounded-full border-2 hover:border-[#8DC63F] hover:bg-[#8DC63F]/10 transition-all"
              >
                <ArrowDownUp className="h-5 w-5" />
              </Button>
            </div>

            {/* To Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <span className="text-sm text-muted-foreground mb-2 block">Результат</span>
                  <Input
                    type="text"
                    value={toAmount}
                    readOnly
                    className="text-2xl font-semibold h-14 bg-secondary text-center"
                    placeholder="0"
                  />
                </div>
                <CoinSelector
                  coins={cryptoData}
                  selected={toCoin}
                  onSelect={setToCrypto}
                  label="Валюта"
                />
              </div>
              {toCoin && (
                <div className="flex items-center justify-between text-sm px-1">
                  <span className="text-muted-foreground">Курс: 1 {toCoin.symbol.toUpperCase()} = ${toCoin.current_price.toLocaleString()}</span>
                  <span className={`flex items-center gap-1 ${toCoin.price_change_percentage_24h >= 0 ? 'text-[#16c784]' : 'text-[#ea3943]'}`}>
                    {toCoin.price_change_percentage_24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(toCoin.price_change_percentage_24h).toFixed(2)}% (24h)
                  </span>
                </div>
              )}
            </div>

            {/* Conversion Result */}
            {fromCoin && toCoin && fromAmount && parseFloat(fromAmount) > 0 && (
              <div className="bg-[#8DC63F]/10 border border-[#8DC63F]/30 rounded-xl p-5 mt-4">
                <div className="text-center">
                  <p className="text-lg">
                    <span className="font-bold text-foreground">{fromAmount} {fromCoin.symbol.toUpperCase()}</span>
                    <span className="text-muted-foreground mx-3">=</span>
                    <span className="font-bold text-[#8DC63F] text-xl">{toAmount} {toCoin.symbol.toUpperCase()}</span>
                  </p>
                  <p className="text-muted-foreground mt-2">
                    ~ ${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Convert Buttons */}
        <div className="mt-6">
          <p className="text-sm text-muted-foreground mb-3 text-center">Швидка конвертація</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { from: 'bitcoin', to: 'ethereum', label: 'BTC → ETH' },
              { from: 'bitcoin', to: 'tether', label: 'BTC → USDT' },
              { from: 'ethereum', to: 'tether', label: 'ETH → USDT' },
              { from: 'solana', to: 'tether', label: 'SOL → USDT' },
            ].map((pair) => (
              <Button
                key={pair.label}
                variant="outline"
                size="sm"
                onClick={() => {
                  setFromCrypto(pair.from)
                  setToCrypto(pair.to)
                  setFromAmount('1')
                }}
                className="hover:border-[#8DC63F] hover:text-[#8DC63F]"
              >
                {pair.label}
              </Button>
            ))}
          </div>
        </div>

        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>Курси оновлюються кожні 60 секунд з CoinGecko API</p>
        </footer>
      </main>
    </div>
  )
}
