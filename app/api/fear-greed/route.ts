import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch(
      'https://api.alternative.me/fng/?limit=30',
      { next: { revalidate: 300 } }
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch fear and greed index')
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching fear and greed index:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fear and greed index' },
      { status: 500 }
    )
  }
}
