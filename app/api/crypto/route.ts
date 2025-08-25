import { NextResponse } from 'next/server'

// GET /api/crypto -> { data: Array<{ symbol: string; price: number; percent: number }>, ts: number }
export async function GET() {
  try {
    const symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT"]
    const url = `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(symbols))}`

    const res = await fetch(url, {
      // Short revalidate to allow edge caching a bit if needed
      next: { revalidate: 15 },
      headers: { 'Accept': 'application/json' }
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Upstream error', status: res.status }, { status: 502 })
    }

    const raw = await res.json() as Array<any>
    const data = raw.map(item => ({
      symbol: item.symbol as string,
      price: parseFloat(item.lastPrice),
      percent: parseFloat(item.priceChangePercent)
    }))

    return NextResponse.json({ data, ts: Date.now() })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 })
  }
}
