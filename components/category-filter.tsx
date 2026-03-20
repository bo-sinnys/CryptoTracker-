'use client'

import { Button } from '@/components/ui/button'

const CATEGORIES = [
  { id: 'all', name: 'Усі монети' },
  { id: 'decentralized-finance-defi', name: 'DeFi' },
]

interface CategoryFilterProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-2">
      {CATEGORIES.map((cat) => (
        <Button
          key={cat.id}
          variant={selectedCategory === cat.id ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onCategoryChange(cat.id)}
          className={selectedCategory === cat.id
            ? 'bg-[#8DC63F] hover:bg-[#7ab534] text-white'
            : 'text-muted-foreground hover:text-foreground'
          }
        >
          {cat.name}
        </Button>
      ))}
    </div>
  )
}
