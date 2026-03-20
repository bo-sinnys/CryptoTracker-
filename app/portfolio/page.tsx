'use client'

import { useState, useEffect, useMemo } from 'react'
import useSWR from 'swr'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CryptoData, PortfolioItem } from '@/lib/types'
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet, DollarSign, Percent, Search, X } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

const STORAGE_KEY = 'crypto-portfolio'

function formatNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + ' B'
  if (num >= 1e6) return (num / 1e6).toFixed(2) + ' M'
  if (num >= 1e3) return (num / 1e3).toFixed(2) + ' K'
  return num.toFixed(2)
}

function formatPrice(price: number): string {
  if (price >= 1) return price.toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (price >= 0.01) return price.toFixed(4)
  return price.toFixed(8)
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoData | null>(null)
  const [amount, setAmount] = useState('')
  const [buyPrice, setBuyPrice] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)

  const { data: cryptoData } = useSWR<CryptoData[]>('/api/crypto', fetcher, {
    refreshInterval: 60000,
  })

  // Load portfolio from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setPortfolio(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse portfolio', e)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save portfolio to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio))
    }
  }, [portfolio, isLoaded])

  const filteredCryptos = useMemo(() => {
    if (!cryptoData || !searchQuery) return cryptoData || []
    const query = searchQuery.toLowerCase()
    return cryptoData.filter(
      c => c.name.toLowerCase().includes(query) || c.symbol.toLowerCase().includes(query)
    )
  }, [cryptoData, searchQuery])

  const portfolioStats = useMemo(() => {
    if (!cryptoData || portfolio.length === 0) {
      return { totalValue: 0, totalInvested: 0, totalPnl: 0, totalPnlPercent: 0 }
    }

    let totalValue = 0
    let totalInvested = 0

    portfolio.forEach(item => {
      const crypto = cryptoData.find(c => c.id === item.id)
      if (crypto) {
        totalValue += crypto.current_price * item.amount
        totalInvested += item.buyPrice * item.amount
      }
    })

    const totalPnl = totalValue - totalInvested
    const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0

    return { totalValue, totalInvested, totalPnl, totalPnlPercent }
  }, [cryptoData, portfolio])

  const handleAddToPortfolio = () => {
    if (!selectedCrypto || !amount || parseFloat(amount) <= 0) return

    const price = buyPrice ? parseFloat(buyPrice) : selectedCrypto.current_price

    const newItem: PortfolioItem = {
      id: selectedCrypto.id,
      symbol: selectedCrypto.symbol,
      name: selectedCrypto.name,
      image: selectedCrypto.image,
      amount: parseFloat(amount),
      buyPrice: price,
      addedAt: Date.now(),
    }

    // Check if already exists
    const existingIndex = portfolio.findIndex(p => p.id === selectedCrypto.id)
    if (existingIndex >= 0) {
      // Merge - calculate average buy price
      const existing = portfolio[existingIndex]
      const totalAmount = existing.amount + newItem.amount
      const avgPrice = (existing.buyPrice * existing.amount + newItem.buyPrice * newItem.amount) / totalAmount
      
      const updated = [...portfolio]
      updated[existingIndex] = {
        ...existing,
        amount: totalAmount,
        buyPrice: avgPrice,
      }
      setPortfolio(updated)
    } else {
      setPortfolio([...portfolio, newItem])
    }

    // Reset form
    setSelectedCrypto(null)
    setAmount('')
    setBuyPrice('')
    setSearchQuery('')
    setIsAddModalOpen(false)
  }

  const handleRemove = (id: string) => {
    setPortfolio(portfolio.filter(p => p.id !== id))
  }

  const selectCrypto = (crypto: CryptoData) => {
    setSelectedCrypto(crypto)
    setBuyPrice(crypto.current_price.toString())
    setSearchQuery('')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Моє портфоліо</h1>
            <p className="text-muted-foreground mt-1">Відстежуйте свої криптоінвестиції</p>
          </div>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#8DC63F] hover:bg-[#7ab536] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Додати актив
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-[#8DC63F]/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-[#8DC63F]" />
              </div>
              <span className="text-sm text-muted-foreground">Загальна вартість</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${formatNumber(portfolioStats.totalValue)}
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-sm text-muted-foreground">Інвестовано</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${formatNumber(portfolioStats.totalInvested)}
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                portfolioStats.totalPnl >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
              }`}>
                {portfolioStats.totalPnl >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                )}
              </div>
              <span className="text-sm text-muted-foreground">PnL</span>
            </div>
            <p className={`text-2xl font-bold ${
              portfolioStats.totalPnl >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {portfolioStats.totalPnl >= 0 ? '+' : ''}{formatNumber(portfolioStats.totalPnl)}$
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                portfolioStats.totalPnlPercent >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
              }`}>
                <Percent className={`w-5 h-5 ${
                  portfolioStats.totalPnlPercent >= 0 ? 'text-green-500' : 'text-red-500'
                }`} />
              </div>
              <span className="text-sm text-muted-foreground">PnL %</span>
            </div>
            <p className={`text-2xl font-bold ${
              portfolioStats.totalPnlPercent >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {portfolioStats.totalPnlPercent >= 0 ? '+' : ''}{portfolioStats.totalPnlPercent.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Portfolio Table */}
        {portfolio.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Портфоліо порожнє</h3>
            <p className="text-muted-foreground mb-4">Додайте свої криптоактиви для відстеження</p>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#8DC63F] hover:bg-[#7ab536] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Додати перший актив
            </Button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Актив</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">Ціна</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">24ч</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">Кількість</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">Ціна купівлі</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">Вартість</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground">PnL</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map((item) => {
                  const crypto = cryptoData?.find(c => c.id === item.id)
                  const currentPrice = crypto?.current_price || 0
                  const currentValue = currentPrice * item.amount
                  const investedValue = item.buyPrice * item.amount
                  const pnl = currentValue - investedValue
                  const pnlPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0
                  const change24h = crypto?.price_change_percentage_24h_in_currency || 0

                  return (
                    <tr key={item.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="w-8 h-8 rounded-full" />
                          <div>
                            <p className="font-medium text-foreground">{item.name}</p>
                            <p className="text-sm text-muted-foreground uppercase">{item.symbol}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-4 px-4 font-medium text-foreground">
                        ${formatPrice(currentPrice)}
                      </td>
                      <td className="text-right py-4 px-4">
                        <span className={change24h >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
                        </span>
                      </td>
                      <td className="text-right py-4 px-4 text-foreground">
                        {item.amount.toLocaleString('uk-UA', { maximumFractionDigits: 8 })}
                      </td>
                      <td className="text-right py-4 px-4 text-muted-foreground">
                        ${formatPrice(item.buyPrice)}
                      </td>
                      <td className="text-right py-4 px-4 font-medium text-foreground">
                        ${formatNumber(currentValue)}
                      </td>
                      <td className="text-right py-4 px-4">
                        <div className={pnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                          <p className="font-medium">
                            {pnl >= 0 ? '+' : ''}${formatNumber(Math.abs(pnl))}
                          </p>
                          <p className="text-sm">
                            {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                          </p>
                        </div>
                      </td>
                      <td className="text-right py-4 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(item.id)}
                          className="text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Додати актив</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAddModalOpen(false)
                    setSelectedCrypto(null)
                    setSearchQuery('')
                    setAmount('')
                    setBuyPrice('')
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Crypto Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Криптовалюта
                </label>
                {selectedCrypto ? (
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <img src={selectedCrypto.image} alt={selectedCrypto.name} className="w-8 h-8 rounded-full" />
                      <div>
                        <p className="font-medium text-foreground">{selectedCrypto.name}</p>
                        <p className="text-sm text-muted-foreground uppercase">{selectedCrypto.symbol}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCrypto(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Пошук криптовалюти..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                    {searchQuery && filteredCryptos.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-auto z-10">
                        {filteredCryptos.slice(0, 10).map((crypto) => (
                          <button
                            key={crypto.id}
                            onClick={() => selectCrypto(crypto)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                          >
                            <img src={crypto.image} alt={crypto.name} className="w-6 h-6 rounded-full" />
                            <div className="flex-1">
                              <p className="font-medium text-foreground text-sm">{crypto.name}</p>
                              <p className="text-xs text-muted-foreground uppercase">{crypto.symbol}</p>
                            </div>
                            <p className="text-sm text-foreground">${formatPrice(crypto.current_price)}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Amount */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Кількість
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="any"
                />
              </div>

              {/* Buy Price */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Ціна купівлі (USD)
                </label>
                <Input
                  type="number"
                  placeholder="Поточна ціна"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  min="0"
                  step="any"
                />
                {selectedCrypto && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Поточна ціна: ${formatPrice(selectedCrypto.current_price)}
                  </p>
                )}
              </div>

              {/* Summary */}
              {selectedCrypto && amount && parseFloat(amount) > 0 && (
                <div className="bg-muted/30 rounded-lg p-4 mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Загальна вартість:</span>
                    <span className="font-medium text-foreground">
                      ${formatNumber((parseFloat(buyPrice) || selectedCrypto.current_price) * parseFloat(amount))}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsAddModalOpen(false)
                    setSelectedCrypto(null)
                    setSearchQuery('')
                    setAmount('')
                    setBuyPrice('')
                  }}
                >
                  Скасувати
                </Button>
                <Button
                  className="flex-1 bg-[#8DC63F] hover:bg-[#7ab536] text-white"
                  onClick={handleAddToPortfolio}
                  disabled={!selectedCrypto || !amount || parseFloat(amount) <= 0}
                >
                  Додати
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
