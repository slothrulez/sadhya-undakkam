import { useEffect, useState } from 'react'
import type { GameMode, LeaderboardEntry } from '../types'
import { getEntries, getEntriesFiltered, timeAgo } from '../lib/leaderboard'

interface LeaderboardPageProps {
  onBuildAnother: () => void
}

const FONT = "'Poppins', 'Noto Sans Malayalam', system-ui, sans-serif"
const RANK_MEDALS = ['🥇', '🥈', '🥉']

function ModeTag({ mode }: { mode: GameMode }) {
  const isKannur = mode === 'kannur'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      height: 22, padding: '0 10px', borderRadius: 999,
      background: isKannur ? 'rgba(196,30,58,0.14)' : 'rgba(82,165,82,0.14)',
      border: `1px solid ${isKannur ? 'rgba(196,30,58,0.3)' : 'rgba(82,165,82,0.3)'}`,
      color: isKannur ? 'rgba(255,130,130,0.85)' : 'rgba(100,210,100,0.85)',
      fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.08em', fontFamily: FONT,
      flexShrink: 0,
    }}>
      {isKannur ? '🌶️ Kannur' : '🌿 Normal'}
    </span>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 71 ? '#52cc52' : score >= 41 ? '#d4af37' : '#c4845a'
  return (
    <span style={{
      fontFamily: FONT, fontWeight: 300, fontSize: '1.4rem',
      color, letterSpacing: '-0.03em',
      textShadow: `0 0 20px ${color}55`,
    }}>
      {score}
      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', fontWeight: 300 }}>/100</span>
    </span>
  )
}

function ExpandedRow({ entry, onClose }: { entry: LeaderboardEntry; onClose: () => void }) {
  const isKannur = entry.mode === 'kannur'
  const scoreColor = entry.score >= 71 ? '#52cc52' : entry.score >= 41 ? '#d4af37' : '#c4845a'
  const STATS = [
    { key: 'power'     as const, label: 'Power',   icon: '⚡', color: '#d4af37' },
    { key: 'spice'     as const, label: 'Spice',   icon: '🌶️', color: '#c41e3a' },
    { key: 'crunch'    as const, label: 'Crunch',  icon: '💥', color: '#ff8c42' },
    { key: 'chaos'     as const, label: 'Chaos',   icon: '🌀', color: '#9b59b6' },
    { key: 'sweetness' as const, label: 'Sweet',   icon: '✨', color: '#e87040' },
  ]
  const maxVal = Math.max(...Object.values(entry.stats), 1)

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(480px, 92vw)', maxHeight: '82vh', overflowY: 'auto',
          background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20, padding: '28px 28px 24px', boxSizing: 'border-box',
          fontFamily: FONT,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.58rem', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 5 }}>
              Sadhya Build
            </p>
            <h2 style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 300, fontSize: '1.4rem', letterSpacing: '-0.03em', marginBottom: 4 }}>
              {entry.name}
            </h2>
            <ModeTag mode={entry.mode} />
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontWeight: 300, fontSize: '2.8rem', color: scoreColor, lineHeight: 1,
              letterSpacing: '-0.04em', textShadow: `0 0 40px ${scoreColor}44`,
            }}>
              {entry.score}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', marginTop: 2 }}>/100</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 18 }}>
          <span style={{
            height: 26, padding: '0 12px', borderRadius: 999,
            display: 'inline-flex', alignItems: 'center',
            background: `${scoreColor}14`, border: `1px solid ${scoreColor}35`,
            color: scoreColor, fontSize: '0.72rem', fontWeight: 500,
          }}>
            🏆 {entry.badge}
          </span>
          <span style={{
            height: 26, padding: '0 12px', borderRadius: 999,
            display: 'inline-flex', alignItems: 'center',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem',
          }}>
            {entry.nickname}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }}>
          {STATS.map(m => {
            const val = entry.stats[m.key]
            const pct = Math.min(100, (val / Math.max(maxVal, 60)) * 100)
            return (
              <div key={m.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.68rem' }}>{m.icon} {m.label}</span>
                  <span style={{ color: m.color, fontSize: '0.68rem', fontWeight: 500 }}>{val}</span>
                </div>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 999 }}>
                  <div style={{
                    height: '100%', width: `${pct}%`, borderRadius: 999,
                    background: `linear-gradient(90deg, ${m.color}55, ${m.color})`,
                  }} />
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ marginBottom: 20 }}>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.58rem', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8 }}>
            Full build
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {entry.dishes.map(d => (
              <span key={d.id} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                height: 24, padding: '0 10px', borderRadius: 999,
                background: `${d.color}12`, border: `1px solid ${d.color}30`,
                color: 'rgba(255,255,255,0.65)', fontSize: '0.68rem',
              }}>
                {d.emoji} {d.name}
              </span>
            ))}
          </div>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: '0.62rem', marginBottom: 20 }}>
          {timeAgo(entry.timestamp)} · {isKannur ? 'Kannur Mode' : 'Normal Mode'}
        </p>

        <button
          onClick={onClose}
          style={{
            width: '100%', height: 38, borderRadius: 999, border: '1px solid rgba(255,255,255,0.12)',
            background: 'transparent', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem',
            cursor: 'pointer', fontFamily: FONT, transition: 'color 0.15s',
          }}
        >
          ← Back
        </button>
      </div>
    </div>
  )
}

export default function LeaderboardPage({ onBuildAnother }: LeaderboardPageProps) {
  const [allEntries, setAllEntries]   = useState<LeaderboardEntry[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const [sortBy, setSortBy]           = useState<'score' | 'recent'>('score')
  const [filterMode, setFilterMode]   = useState<GameMode | undefined>(undefined)
  const [expanded, setExpanded]       = useState<LeaderboardEntry | null>(null)
  const [searchQ, setSearchQ]         = useState('')

  const load = async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    try {
      const data = await getEntries()
      setAllEntries(data)
    } catch (e) {
      setError('Could not load entries — check your connection and retry.')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const id = setInterval(() => load(true), 15000)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sorted = getEntriesFiltered(allEntries, sortBy, filterMode)
  const displayed = searchQ.trim()
    ? sorted.filter(e => e.name.toLowerCase().includes(searchQ.toLowerCase()))
    : sorted

  return (
    <div style={{ minHeight: '100vh', background: '#05080a', fontFamily: FONT, display: 'flex', flexDirection: 'column' }}>
      {expanded && <ExpandedRow entry={expanded} onClose={() => setExpanded(null)} />}

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 60,
        background: 'rgba(5,8,10,0.92)', backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1rem' }}>🍃</span>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.82rem', fontWeight: 500, letterSpacing: '-0.01em' }}>
            Sadhya Hall of Fame
          </span>
        </div>
        <button
          onClick={onBuildAnother}
          style={{
            height: 34, padding: '0 16px', borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.7)', fontSize: '0.74rem',
            cursor: 'pointer', fontFamily: FONT, transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
        >
          Build Another →
        </button>
      </div>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '48px 24px 32px' }}>
        <p style={{
          color: 'rgba(255,255,255,0.2)', fontSize: '0.58rem',
          letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12, fontWeight: 500,
        }}>
          All modes · All legends
        </p>
        <h1 style={{
          fontWeight: 300, fontSize: 'clamp(2rem, 6vw, 3.6rem)',
          color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.04em', lineHeight: 1.1,
        }}>
          Sadhya Hall<br />
          <span style={{ fontStyle: 'italic' }}>of Fame</span>
        </h1>
      </div>

      {/* Loading / error */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 24px', color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem', fontFamily: FONT }}>
          Loading entries…
        </div>
      )}
      {error && (
        <div style={{
          margin: '0 24px', padding: '16px 20px', borderRadius: 12,
          background: 'rgba(255,60,60,0.07)', border: '1px solid rgba(255,60,60,0.2)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        }}>
          <p style={{ color: 'rgba(255,130,130,0.85)', fontSize: '0.82rem', fontFamily: FONT, textAlign: 'center' }}>
            Could not reach the leaderboard server.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', fontFamily: FONT, textAlign: 'center' }}>
            Check your connection and retry.
          </p>
          <button
            onClick={() => load()}
            style={{
              height: 34, padding: '0 18px', borderRadius: 999,
              border: '1px solid rgba(212,175,55,0.3)', background: 'rgba(212,175,55,0.08)',
              color: '#d4af37', fontSize: '0.76rem', cursor: 'pointer', fontFamily: FONT,
            }}
          >
            ↺ Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Top 3 podium */}
          {displayed.length >= 1 && (
            <div style={{
              display: 'flex', gap: 12, padding: '0 24px', marginBottom: 32,
              justifyContent: 'center', flexWrap: 'wrap',
            }}>
              {displayed.slice(0, 3).map((entry, i) => {
                const scoreColor = entry.score >= 71 ? '#52cc52' : entry.score >= 41 ? '#d4af37' : '#c4845a'
                const borderColors = ['rgba(212,175,55,0.4)', 'rgba(180,180,180,0.28)', 'rgba(180,100,60,0.28)']
                const bgColors     = ['rgba(212,175,55,0.08)', 'rgba(180,180,180,0.04)', 'rgba(180,100,60,0.04)']
                return (
                  <div
                    key={entry.id}
                    onClick={() => setExpanded(entry)}
                    style={{
                      flex: '1 1 180px', maxWidth: 240,
                      padding: '18px 20px', borderRadius: 16,
                      border: `1px solid ${borderColors[i]}`,
                      background: bgColors[i],
                      cursor: 'pointer',
                      transition: 'transform 0.18s, border-color 0.18s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    <div style={{ fontSize: i === 0 ? '1.6rem' : '1.2rem', marginBottom: 8 }}>{RANK_MEDALS[i]}</div>
                    <p style={{ color: 'rgba(255,255,255,0.88)', fontWeight: 400, fontSize: '0.95rem', marginBottom: 4 }}>
                      {entry.name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                      <span style={{ fontWeight: 300, fontSize: '2rem', color: scoreColor, letterSpacing: '-0.03em' }}>{entry.score}</span>
                      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>/100</span>
                    </div>
                    <ModeTag mode={entry.mode} />
                    <p style={{ color: 'rgba(255,255,255,0.22)', fontSize: '0.62rem', marginTop: 8 }}>
                      {entry.dishes.slice(0, 3).map(d => d.emoji).join(' ')}
                      {entry.dishes.length > 3 && ` +${entry.dishes.length - 3}`}
                    </p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Controls */}
          <div style={{ display: 'flex', gap: 10, padding: '0 24px', marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Search by name…"
              style={{
                flex: '1 1 160px', height: 36, padding: '0 14px', borderRadius: 999,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.8)', fontSize: '0.78rem', fontFamily: FONT, outline: 'none',
              }}
            />

            {(['all', 'normal', 'kannur'] as const).map(m => (
              <button
                key={m}
                onClick={() => setFilterMode(m === 'all' ? undefined : m)}
                style={{
                  height: 34, padding: '0 14px', borderRadius: 999, cursor: 'pointer',
                  fontFamily: FONT, fontSize: '0.72rem', transition: 'all 0.15s',
                  background: (filterMode === undefined && m === 'all') || filterMode === m
                    ? (m === 'kannur' ? 'rgba(196,30,58,0.22)' : m === 'normal' ? 'rgba(82,165,82,0.22)' : 'rgba(212,175,55,0.18)')
                    : 'rgba(255,255,255,0.04)',
                  border: (filterMode === undefined && m === 'all') || filterMode === m
                    ? (m === 'kannur' ? '1px solid rgba(196,30,58,0.4)' : m === 'normal' ? '1px solid rgba(82,165,82,0.35)' : '1px solid rgba(212,175,55,0.35)')
                    : '1px solid rgba(255,255,255,0.1)',
                  color: (filterMode === undefined && m === 'all') || filterMode === m
                    ? (m === 'kannur' ? 'rgba(255,130,130,0.9)' : m === 'normal' ? 'rgba(100,210,100,0.9)' : '#d4af37')
                    : 'rgba(255,255,255,0.4)',
                }}
              >
                {m === 'all' ? 'All' : m === 'normal' ? '🌿 Normal' : '🌶️ Kannur'}
              </button>
            ))}

            <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
              {(['score', 'recent'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  style={{
                    height: 34, padding: '0 14px', borderRadius: 999, cursor: 'pointer',
                    fontFamily: FONT, fontSize: '0.72rem', transition: 'all 0.15s',
                    background: sortBy === s ? 'rgba(255,255,255,0.08)' : 'transparent',
                    border: sortBy === s ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.07)',
                    color: sortBy === s ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.32)',
                  }}
                >
                  {s === 'score' ? '↓ Score' : '↓ Recent'}
                </button>
              ))}
            </div>

            <button
              onClick={() => load()}
              title="Refresh"
              style={{
                height: 34, width: 34, borderRadius: 999, cursor: 'pointer',
                background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
            >
              ↺
            </button>
          </div>

          <p style={{ padding: '0 24px', color: 'rgba(255,255,255,0.18)', fontSize: '0.65rem', letterSpacing: '0.08em', marginBottom: 12 }}>
            {displayed.length} {displayed.length === 1 ? 'entry' : 'entries'}
            {filterMode ? ` · ${filterMode} mode` : ''}
          </p>

          {displayed.length > 0 && (
            <div style={{
              display: 'grid', gridTemplateColumns: '44px 1fr auto auto',
              gap: '0 16px', padding: '0 24px 8px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.2)', fontSize: '0.6rem',
              letterSpacing: '0.14em', textTransform: 'uppercase',
            }}>
              <span>#</span><span>Name</span><span>Mode</span><span style={{ textAlign: 'right' }}>Score</span>
            </div>
          )}

          <div style={{ flex: 1, padding: '0 24px 60px' }}>
            {displayed.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', gap: 14 }}>
                <span style={{ fontSize: '3rem' }}>🍃</span>
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.88rem', fontWeight: 300 }}>
                  {searchQ ? 'No entries match your search.' : 'No Sadhyas saved yet. Be the first!'}
                </p>
                {!searchQ && (
                  <button
                    onClick={onBuildAnother}
                    style={{
                      height: 40, padding: '0 24px', borderRadius: 999,
                      border: '1px solid rgba(255,255,255,0.18)',
                      background: 'rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem',
                      cursor: 'pointer', fontFamily: FONT,
                    }}
                  >
                    Build your Sadhya →
                  </button>
                )}
              </div>
            ) : (
              displayed.map((entry, idx) => {
                const scoreColor = entry.score >= 71 ? '#52cc52' : entry.score >= 41 ? '#d4af37' : '#c4845a'
                const isTop3 = idx < 3
                return (
                  <div
                    key={entry.id}
                    onClick={() => setExpanded(entry)}
                    style={{
                      display: 'grid', gridTemplateColumns: '44px 1fr auto auto',
                      gap: '0 16px', alignItems: 'center',
                      padding: '12px 0', cursor: 'pointer',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      transition: 'background 0.12s', borderRadius: 4,
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.025)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isTop3
                        ? <span style={{ fontSize: '1rem' }}>{RANK_MEDALS[idx]}</span>
                        : <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', fontWeight: 300 }}>{idx + 1}</span>
                      }
                    </div>
                    <div>
                      <p style={{
                        color: isTop3 ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.72)',
                        fontWeight: isTop3 ? 400 : 300, fontSize: '0.88rem', marginBottom: 3,
                      }}>
                        {entry.name}
                      </p>
                      <p style={{ color: 'rgba(255,255,255,0.22)', fontSize: '0.64rem' }}>
                        {entry.dishes.slice(0, 4).map(d => d.emoji).join(' ')}
                        {entry.dishes.length > 4 && ` +${entry.dishes.length - 4}`}
                        {' · '}{timeAgo(entry.timestamp)}
                      </p>
                    </div>
                    <ModeTag mode={entry.mode} />
                    <ScoreBadge score={entry.score} />
                  </div>
                )
              })
            )}
          </div>
        </>
      )}
    </div>
  )
}
