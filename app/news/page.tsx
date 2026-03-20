'use client'

import { Header } from '@/components/header'
import useSWR from 'swr'
import { ExternalLink, Clock, Newspaper, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface NewsItem {
  title: string
  url: string
  published_at: string
  thumb_2x?: string | null
  description?: string | null
  author?: { name: string }
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

function timeAgo(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1)  return 'щойно'
    if (mins < 60) return `${mins} хв тому`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} год тому`
    const days = Math.floor(hours / 24)
    return `${days} дн тому`
  } catch { return '' }
}

function SkeletonCard() {
  return (
    <Card className="p-4 border border-border">
      <div className="flex gap-4 animate-pulse">
        <div className="w-24 h-20 bg-muted rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-4/5" />
          <div className="h-3 bg-muted rounded w-2/5 mt-3" />
        </div>
      </div>
    </Card>
  )
}

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" className="block group">
      <Card className="p-4 border border-border hover:border-[#8DC63F]/60 hover:shadow-sm transition-all">
        <div className="flex gap-4">
          {/* Thumbnail */}
          <div className="w-24 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
            {item.thumb_2x ? (
              <img
                src={item.thumb_2x}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  const el = e.currentTarget
                  el.style.display = 'none'
                  const parent = el.parentElement
                  if (parent) {
                    parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg xmlns=\'http://www.w3.org/2000/svg\' width=\'28\' height=\'28\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'#94a3b8\' stroke-width=\'1.5\'><path d=\'M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4\'/><polyline points=\'14 2 14 8 20 8\'/><path d=\'M2 15h10\'/><path d=\'m9 18 3-3-3-3\'/></svg></div>'
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Newspaper className="h-7 w-7 text-muted-foreground/40" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <h3 className="font-medium text-foreground text-sm leading-snug mb-1.5 line-clamp-2 group-hover:text-[#8DC63F] transition-colors">
                {item.title}
              </h3>
              {item.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              {item.author?.name && (
                <span className="font-medium text-foreground/70 truncate max-w-[120px]">
                  {item.author.name}
                </span>
              )}
              <span className="flex items-center gap-1 flex-shrink-0">
                <Clock className="h-3 w-3" />
                {timeAgo(item.published_at)}
              </span>
              <ExternalLink className="h-3 w-3 ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </Card>
    </a>
  )
}

export default function NewsPage() {
  const { data, isLoading, mutate } = useSWR('/api/news', fetcher, {
    refreshInterval: 5 * 60 * 1000,
    revalidateOnFocus: false,
  })

  const news: NewsItem[] = data?.data || []

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Newspaper className="h-6 w-6 text-[#8DC63F]" />
              Крипто-новини
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Актуальні новини зі світу криптовалют · Оновлюється кожні 5 хвилин
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => mutate()} className="gap-2 flex-shrink-0">
            <RefreshCw className="h-4 w-4" />
            Оновити
          </Button>
        </div>

        {/* News grid */}
        <div className="space-y-3">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : news.map((item, i) => <NewsCard key={i} item={item} />)
          }
        </div>

        {!isLoading && news.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Newspaper className="h-14 w-14 mx-auto mb-4 opacity-20" />
            <p className="font-medium">Новини тимчасово недоступні</p>
            <p className="text-sm mt-1">Спробуйте оновити сторінку</p>
          </div>
        )}

        {!isLoading && news.length > 0 && (
          <p className="text-center text-xs text-muted-foreground mt-6">
            Показано {news.length} новин · Дані з відкритих джерел
          </p>
        )}
      </main>
    </div>
  )
}