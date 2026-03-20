import { NextResponse } from 'next/server'

// Повний fallback з 50 монетами та sparkline даними
function makeSpark(base: number, change: number): number[] {
  const pts: number[] = []
  let p = base / (1 + change / 100)
  for (let i = 0; i < 168; i++) {
    p *= (1 + (Math.random() - 0.485) * 0.02)
    pts.push(p)
  }
  pts[pts.length - 1] = base
  return pts
}

const RAW = [
  { id:'bitcoin',           symbol:'btc',   name:'Bitcoin',          cmc:1,     p:67842,      mc:1337e9,  v:28.1e9, h1:.12,  h24:.52,   d7:-1.7  },
  { id:'ethereum',          symbol:'eth',   name:'Ethereum',         cmc:1027,  p:3492,       mc:419e9,   v:13.8e9, h1:.08,  h24:1.38,  d7:1.6   },
  { id:'tether',            symbol:'usdt',  name:'Tether',           cmc:825,   p:1,          mc:109e9,   v:71.2e9, h1:.01,  h24:.01,   d7:0     },
  { id:'binancecoin',       symbol:'bnb',   name:'BNB',              cmc:1839,  p:584,        mc:87e9,    v:1.9e9,  h1:-.1,  h24:-.72,  d7:2.1   },
  { id:'solana',            symbol:'sol',   name:'Solana',           cmc:5426,  p:182,        mc:81e9,    v:4.1e9,  h1:.3,   h24:2.14,  d7:8.4   },
  { id:'ripple',            symbol:'xrp',   name:'XRP',              cmc:52,    p:.585,       mc:32e9,    v:1.3e9,  h1:-.05, h24:-.98,  d7:1.4   },
  { id:'usd-coin',          symbol:'usdc',  name:'USD Coin',         cmc:3408,  p:1,          mc:35e9,    v:7.8e9,  h1:.01,  h24:.02,   d7:0     },
  { id:'cardano',           symbol:'ada',   name:'Cardano',          cmc:2010,  p:.608,       mc:21e9,    v:.48e9,  h1:.1,   h24:-1.42, d7:1.6   },
  { id:'avalanche-2',       symbol:'avax',  name:'Avalanche',        cmc:9462,  p:41.8,       mc:17e9,    v:.72e9,  h1:-.15, h24:-2.05, d7:-.8   },
  { id:'dogecoin',          symbol:'doge',  name:'Dogecoin',         cmc:74,    p:.167,       mc:24e9,    v:.92e9,  h1:.2,   h24:.62,   d7:-3.2  },
  { id:'polkadot',          symbol:'dot',   name:'Polkadot',         cmc:6636,  p:9.42,       mc:13e9,    v:.31e9,  h1:.05,  h24:-.48,  d7:-.5   },
  { id:'chainlink',         symbol:'link',  name:'Chainlink',        cmc:1975,  p:18.6,       mc:11e9,    v:.41e9,  h1:.05,  h24:.88,   d7:3.1   },
  { id:'tron',              symbol:'trx',   name:'TRON',             cmc:1958,  p:.124,       mc:10.8e9,  v:.44e9,  h1:.18,  h24:.18,   d7:.2    },
  { id:'toncoin',           symbol:'ton',   name:'Toncoin',          cmc:11419, p:6.18,       mc:31.5e9,  v:.21e9,  h1:-.68, h24:-.68,  d7:-.7   },
  { id:'litecoin',          symbol:'ltc',   name:'Litecoin',         cmc:2,     p:87.5,       mc:6.5e9,   v:.51e9,  h1:-.38, h24:-.38,  d7:-.4   },
  { id:'shiba-inu',         symbol:'shib',  name:'Shiba Inu',        cmc:5994,  p:.0000248,   mc:14.6e9,  v:.61e9,  h1:.5,   h24:1.52,  d7:2.1   },
  { id:'uniswap',           symbol:'uni',   name:'Uniswap',          cmc:7083,  p:12.4,       mc:9.3e9,   v:.15e9,  h1:.28,  h24:.28,   d7:.3    },
  { id:'bitcoin-cash',      symbol:'bch',   name:'Bitcoin Cash',     cmc:1831,  p:482,        mc:9.5e9,   v:.24e9,  h1:-1.1, h24:-1.08, d7:-1.1  },
  { id:'near',              symbol:'near',  name:'NEAR Protocol',    cmc:6535,  p:7.48,       mc:8.7e9,   v:.18e9,  h1:2.28, h24:2.28,  d7:4.5   },
  { id:'matic-network',     symbol:'matic', name:'Polygon',          cmc:3890,  p:.84,        mc:8.4e9,   v:.34e9,  h1:1.18, h24:1.18,  d7:1.2   },
  { id:'stellar',           symbol:'xlm',   name:'Stellar',          cmc:512,   p:.122,       mc:3.5e9,   v:.09e9,  h1:.3,   h24:.45,   d7:.8    },
  { id:'cosmos',            symbol:'atom',  name:'Cosmos',           cmc:3794,  p:8.92,       mc:3.5e9,   v:.12e9,  h1:-.2,  h24:-1.1,  d7:-2.4  },
  { id:'monero',            symbol:'xmr',   name:'Monero',           cmc:328,   p:148,        mc:2.7e9,   v:.04e9,  h1:.1,   h24:.6,    d7:1.2   },
  { id:'ethereum-classic',  symbol:'etc',   name:'Ethereum Classic', cmc:1321,  p:27.4,       mc:4.0e9,   v:.11e9,  h1:-.3,  h24:-.9,   d7:-1.5  },
  { id:'okb',               symbol:'okb',   name:'OKB',              cmc:3897,  p:52.3,       mc:3.1e9,   v:.08e9,  h1:.1,   h24:.4,    d7:.9    },
  { id:'filecoin',          symbol:'fil',   name:'Filecoin',         cmc:2280,  p:5.82,       mc:3.3e9,   v:.14e9,  h1:-.5,  h24:-1.4,  d7:-3.1  },
  { id:'aptos',             symbol:'apt',   name:'Aptos',            cmc:21794, p:10.2,       mc:4.3e9,   v:.2e9,   h1:.8,   h24:.8,    d7:2.4   },
  { id:'arbitrum',          symbol:'arb',   name:'Arbitrum',         cmc:11841, p:1.08,       mc:4.1e9,   v:.22e9,  h1:.3,   h24:.3,    d7:.8    },
  { id:'vechain',           symbol:'vet',   name:'VeChain',          cmc:3077,  p:.0349,      mc:2.8e9,   v:.06e9,  h1:.2,   h24:.2,    d7:.4    },
  { id:'optimism',          symbol:'op',    name:'Optimism',         cmc:11840, p:2.41,       mc:3.0e9,   v:.16e9,  h1:-.4,  h24:-1.2,  d7:-2.8  },
  { id:'the-sandbox',       symbol:'sand',  name:'The Sandbox',      cmc:6210,  p:.478,       mc:1.0e9,   v:.04e9,  h1:.6,   h24:1.8,   d7:3.2   },
  { id:'decentraland',      symbol:'mana',  name:'Decentraland',     cmc:1966,  p:.421,       mc:.8e9,    v:.03e9,  h1:.4,   h24:1.2,   d7:2.1   },
  { id:'aave',              symbol:'aave',  name:'Aave',             cmc:7278,  p:98.4,       mc:1.5e9,   v:.07e9,  h1:-.1,  h24:-.4,   d7:-.9   },
  { id:'maker',             symbol:'mkr',   name:'Maker',            cmc:1518,  p:2840,       mc:2.8e9,   v:.08e9,  h1:-.2,  h24:-.8,   d7:-1.6  },
  { id:'compound-coin',     symbol:'comp',  name:'Compound',         cmc:5692,  p:58.2,       mc:.4e9,    v:.02e9,  h1:.1,   h24:.3,    d7:.7    },
  { id:'curve-dao-token',   symbol:'crv',   name:'Curve DAO',        cmc:6538,  p:.502,       mc:.7e9,    v:.04e9,  h1:-.3,  h24:-1.0,  d7:-2.2  },
  { id:'sui',               symbol:'sui',   name:'Sui',              cmc:20947, p:1.87,       mc:5.4e9,   v:.18e9,  h1:.9,   h24:2.7,   d7:5.1   },
  { id:'sei-network',       symbol:'sei',   name:'Sei',              cmc:23149, p:.549,       mc:1.2e9,   v:.06e9,  h1:.5,   h24:1.5,   d7:3.0   },
  { id:'injective-protocol',symbol:'inj',   name:'Injective',        cmc:7226,  p:28.6,       mc:2.7e9,   v:.12e9,  h1:.7,   h24:2.1,   d7:4.2   },
  { id:'kaspa',             symbol:'kas',   name:'Kaspa',            cmc:20396, p:.116,       mc:2.8e9,   v:.07e9,  h1:.3,   h24:.9,    d7:1.8   },
  { id:'fetch-ai',          symbol:'fet',   name:'Fetch.ai',         cmc:3773,  p:1.74,       mc:1.4e9,   v:.08e9,  h1:1.2,  h24:3.6,   d7:7.2   },
  { id:'render-token',      symbol:'rndr',  name:'Render',           cmc:5690,  p:7.82,       mc:3.8e9,   v:.15e9,  h1:1.1,  h24:3.3,   d7:6.6   },
  { id:'pepe',              symbol:'pepe',  name:'Pepe',             cmc:24478, p:.00001182,  mc:4.9e9,   v:.3e9,   h1:.8,   h24:2.4,   d7:4.8   },
  { id:'floki',             symbol:'floki', name:'FLOKI',            cmc:10804, p:.000184,    mc:1.8e9,   v:.09e9,  h1:.5,   h24:1.5,   d7:3.0   },
  { id:'bonk',              symbol:'bonk',  name:'Bonk',             cmc:23095, p:.0000238,   mc:1.6e9,   v:.08e9,  h1:.9,   h24:2.7,   d7:5.4   },
  { id:'worldcoin-wld',     symbol:'wld',   name:'Worldcoin',        cmc:13502, p:3.24,       mc:4.2e9,   v:.18e9,  h1:-.6,  h24:-1.8,  d7:-3.6  },
  { id:'immutable-x',       symbol:'imx',   name:'Immutable',        cmc:10603, p:1.87,       mc:2.8e9,   v:.12e9,  h1:.4,   h24:1.2,   d7:2.4   },
  { id:'gala',              symbol:'gala',  name:'Gala',             cmc:7080,  p:.0385,      mc:.9e9,    v:.05e9,  h1:.3,   h24:.9,    d7:1.8   },
  { id:'axie-infinity',     symbol:'axs',   name:'Axie Infinity',    cmc:6783,  p:6.42,       mc:.9e9,    v:.04e9,  h1:-.2,  h24:-.6,   d7:-1.2  },
  { id:'the-graph',         symbol:'grt',   name:'The Graph',        cmc:6719,  p:.254,       mc:2.4e9,   v:.07e9,  h1:.2,   h24:.6,    d7:1.2   },
]

const FALLBACK = RAW.map((c, i) => ({
  id: c.id,
  symbol: c.symbol,
  name: c.name,
  image: `https://s2.coinmarketcap.com/static/img/coins/64x64/${c.cmc}.png`,
  current_price: c.p,
  market_cap: c.mc,
  market_cap_rank: i + 1,
  total_volume: c.v,
  price_change_percentage_1h_in_currency: c.h1,
  price_change_percentage_24h_in_currency: c.h24,
  price_change_percentage_24h: c.h24,
  price_change_percentage_7d_in_currency: c.d7,
  sparkline_in_7d: { price: makeSpark(c.p, c.h24) },
}))

export async function GET() {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h%2C24h%2C7d',
      { headers: { 'Accept': 'application/json' }, next: { revalidate: 60 } }
    )
    if (!response.ok) throw new Error(`CoinGecko ${response.status}`)
    const data = await response.json()
    if (!Array.isArray(data) || data.length === 0) throw new Error('Empty response')
    return NextResponse.json(data)
  } catch (error) {
    console.warn('CoinGecko unavailable, using fallback:', error)
    return NextResponse.json(FALLBACK)
  }
}