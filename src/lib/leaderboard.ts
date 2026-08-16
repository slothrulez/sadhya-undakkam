import type { LeaderboardEntry } from '../types'
import { projectId, publicAnonKey } from '../../utils/supabase/info'

const REST = `https://${projectId}.supabase.co/rest/v1/leaderboard`
const HEADERS = {
  'apikey': publicAnonKey,
  'Authorization': `Bearer ${publicAnonKey}`,
  'Content-Type': 'application/json',
}

// localStorage fallback

const LOCAL_KEY = 'sadhya_lb_local'

function localLoad(): LeaderboardEntry[] {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]') } catch { return [] }
}

function localSave(entry: LeaderboardEntry) {
  const list = localLoad()
  if (!list.find(e => e.id === entry.id)) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify([entry, ...list].slice(0, 300)))
  }
}

// API

export async function saveEntry(entry: LeaderboardEntry): Promise<void> {
  localSave(entry)
  const res = await fetch(REST, {
    method: 'POST',
    headers: { ...HEADERS, 'Prefer': 'return=minimal' },
    body: JSON.stringify({
      id: entry.id,
      name: entry.name,
      score: entry.score,
      mode: entry.mode,
      dishes: entry.dishes,
      stats: entry.stats,
      badge: entry.badge,
      nickname: entry.nickname,
      timestamp: entry.timestamp,
    }),
  })
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || `HTTP ${res.status}`)
  }
}

export async function getEntries(): Promise<LeaderboardEntry[]> {
  const res = await fetch(
    `${REST}?select=*&order=score.desc,timestamp.desc&limit=500`,
    { headers: HEADERS },
  )
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || `HTTP ${res.status}`)
  }
  const data: LeaderboardEntry[] = await res.json()
  const serverIds = new Set(data.map(e => e.id))
  const localOnly = localLoad().filter(e => !serverIds.has(e.id))
  return [...data, ...localOnly]
}

// helpers

export function getEntriesFiltered(
  entries: LeaderboardEntry[],
  sortBy: 'score' | 'recent',
  filterMode?: 'normal' | 'kannur',
): LeaderboardEntry[] {
  let list = filterMode ? entries.filter(e => e.mode === filterMode) : entries
  return sortBy === 'score'
    ? [...list].sort((a, b) => b.score - a.score || b.timestamp - a.timestamp)
    : [...list].sort((a, b) => b.timestamp - a.timestamp)
}

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const s = Math.floor(diff / 1000)
  if (s < 5)  return 'Just now'
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} min ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
