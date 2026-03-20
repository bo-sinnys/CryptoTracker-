export interface CryptoData {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  total_volume: number
  price_change_percentage_1h_in_currency: number | null
  price_change_percentage_24h_in_currency: number | null
  price_change_percentage_7d_in_currency: number | null
  sparkline_in_7d: {
    price: number[]
  }
}

export interface GlobalData {
  data: {
    total_market_cap: { usd: number }
    total_volume: { usd: number }
    market_cap_percentage: { btc: number; eth: number }
    market_cap_change_percentage_24h_usd: number
  }
}

export interface PortfolioItem {
  id: string
  symbol: string
  name: string
  image: string
  amount: number
  buyPrice: number
  addedAt: number
}

export interface CoinDetail {
  id: string
  symbol: string
  name: string
  image: {
    large: string
    small: string
    thumb: string
  }
  market_cap_rank: number
  market_data: {
    current_price: { usd: number }
    market_cap: { usd: number }
    fully_diluted_valuation: { usd: number | null }
    total_volume: { usd: number }
    high_24h: { usd: number }
    low_24h: { usd: number }
    price_change_24h: number
    price_change_percentage_24h: number
    price_change_percentage_7d: number
    price_change_percentage_30d: number
    price_change_percentage_1y: number
    ath: { usd: number }
    ath_change_percentage: { usd: number }
    ath_date: { usd: string }
    atl: { usd: number }
    atl_change_percentage: { usd: number }
    circulating_supply: number
    total_supply: number | null
    max_supply: number | null
  }
  links: {
    homepage: string[]
    whitepaper: string
    blockchain_site: string[]
    repos_url: {
      github: string[]
    }
  }
  description: {
    en: string
  }
}

export interface ChartData {
  prices: [number, number][]
  market_caps: [number, number][]
  total_volumes: [number, number][]
}
