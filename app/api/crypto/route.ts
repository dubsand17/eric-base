import { NextResponse } from 'next/server'
export const runtime = 'edge'

// 简易内存缓存（同进程）
type CryptoPayload = { data: Array<{ symbol: string; price: number; percent: number }>; ts: number }
let CACHE: { ts: number; payload: CryptoPayload } | null = null
const TTL_MS = 60_000 // 60s 新鲜
const STALE_MAX_MS = 10 * 60_000 // 10 分钟内可作为过期兜底

// GET /api/crypto -> { data: Array<{ symbol: string; price: number; percent: number }>, ts: number }
export async function GET() {
  try {
    // 命中缓存直接返回
    const now = Date.now()
    if (CACHE && now - CACHE.ts < TTL_MS) {
      const res = NextResponse.json(CACHE.payload)
      res.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=300')
      res.headers.set('X-Cache', 'HIT')
      return res
    }

    const symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT"]
    const query = `symbols=${encodeURIComponent(JSON.stringify(symbols))}`
    const hosts = [
      'https://data.binance.com',         // CDN 加速域
      'https://data-api.binance.vision',  // 官方开源镜像
      'https://api-gcp.binance.com',      // GCP 边缘
      'https://api1.binance.com',         // 轮询域
      'https://api2.binance.com',
      'https://api3.binance.com',
      'https://api.binance.com',          // 主域，可能 451
      'https://api.binance.me'            // 备用域
    ]

    let parsedArray: Array<any> | null = null
    let lastStatus: number | undefined

    // 每个主机 5s 超时
    const fetchWithTimeout = async (url: string) => {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 5000)
      try {
        const r = await fetch(url, {
          signal: controller.signal,
          next: { revalidate: 15 },
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'eric-base/1.0 (+https://github.com/1xdali/eric-base)'
          }
        })
        return r
      } finally {
        clearTimeout(timer)
      }
    }

    for (const host of hosts) {
      const url = `${host}/api/v3/ticker/24hr?${query}`
      try {
        const r = await fetchWithTimeout(url)
        lastStatus = r.status
        if (!r.ok) {
          // 对 451/403/429 等继续尝试下一个 host
          if ([451, 403, 429, 502, 503, 504].includes(r.status)) continue
          else continue
        }
        const ct = r.headers.get('content-type') || ''
        const txt = await r.text()
        if (!txt || !txt.trim()) continue
        let json: any
        try {
          json = JSON.parse(txt)
        } catch {
          // 非 JSON，继续尝试下一个 host
          continue
        }
        if (Array.isArray(json)) {
          parsedArray = json
          break
        } else if (json && typeof json === 'object' && json.symbol) {
          parsedArray = [json]
          break
        } else {
          // 格式不符合预期，继续下一个 host
          continue
        }
      } catch (e) {
        // 超时/网络错误，尝试下一个 host
        continue
      }
    }

    if (!parsedArray) {
      // 无法回源时，如有可用过期缓存，返回 STALE 兜底
      if (CACHE && now - CACHE.ts < STALE_MAX_MS) {
        const stale = NextResponse.json(CACHE.payload)
        stale.headers.set('Cache-Control', 'public, s-maxage=0, stale-while-revalidate=300')
        stale.headers.set('X-Cache', 'STALE')
        return stale
      }
      // 二级兜底：CoinGecko（USD 视作 USDT 展示）
      try {
        const gecko = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true', {
          headers: { 'Accept': 'application/json', 'User-Agent': 'eric-base/1.0' },
          next: { revalidate: 30 }
        })
        if (gecko.ok) {
          const j = await gecko.json() as any
          const data = [
            { symbol: 'BTCUSDT', price: Number(j?.bitcoin?.usd ?? NaN), percent: Number(j?.bitcoin?.usd_24h_change ?? NaN) },
            { symbol: 'ETHUSDT', price: Number(j?.ethereum?.usd ?? NaN), percent: Number(j?.ethereum?.usd_24h_change ?? NaN) },
            { symbol: 'SOLUSDT', price: Number(j?.solana?.usd ?? NaN), percent: Number(j?.solana?.usd_24h_change ?? NaN) },
          ].filter(x => Number.isFinite(x.price) && Number.isFinite(x.percent))
          if (data.length) {
            const payload: CryptoPayload = { data, ts: Date.now() }
            CACHE = { ts: now, payload }
            const ok = NextResponse.json(payload)
            ok.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=300')
            ok.headers.set('X-Cache', 'FALLBACK-COINGECKO')
            return ok
          }
        }
      } catch {}
      return NextResponse.json({ error: 'Upstream error', status: lastStatus ?? 500 }, { status: 502 })
    }

    const raw = parsedArray
    const data = raw.map(item => ({
      symbol: item.symbol as string,
      price: parseFloat(item.lastPrice),
      percent: parseFloat(item.priceChangePercent)
    }))

    const payload: CryptoPayload = { data, ts: Date.now() }
    CACHE = { ts: now, payload }
    const ok = NextResponse.json(payload)
    ok.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=300')
    ok.headers.set('X-Cache', CACHE ? 'MISS->SET' : 'MISS')
    return ok
  } catch (e: any) {
    const now = Date.now()
    if (CACHE && now - CACHE.ts < STALE_MAX_MS) {
      const stale = NextResponse.json(CACHE.payload)
      stale.headers.set('Cache-Control', 'public, s-maxage=0, stale-while-revalidate=300')
      stale.headers.set('X-Cache', 'STALE')
      return stale
    }
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 })
  }
}
