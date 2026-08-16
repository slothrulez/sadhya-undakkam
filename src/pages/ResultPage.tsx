import { useEffect, useMemo, useRef, useState } from 'react'
import type { DrawnPortion, GameMode, LeaderboardEntry, Stats } from '../types'
import MaveliCharacter from '../components/MaveliCharacter'
import { saveEntry } from '../lib/leaderboard'
import resultNormalVideo from '../imports/Create_a_second_seamless_lo__3_.mp4'
import resultKannurVideo from '../imports/Create_a_second_seamless_lo__1___1_.mp4'
import kannurResultAudio from '../imports/Manatharil_transition__trending__transition__manatharil__kannurseenath_-_Rosenna.mp3'

interface ResultPageProps {
  mode: GameMode
  stats: Stats
  drawnPortions: DrawnPortion[]
  leafSnapshot: string | null
  onRebuild: () => void
  onRebuildSameMode: () => void
  onViewLeaderboard: () => void
}

const FONT = "'Poppins', 'Noto Sans Malayalam', system-ui, sans-serif"

const STAT_META = [
  { key: 'power'     as const, label: 'Power',     color: '#d4af37', icon: '⚡' },
  { key: 'spice'     as const, label: 'Spice',      color: '#c41e3a', icon: '🌶️' },
  { key: 'crunch'    as const, label: 'Crunch',     color: '#ff8c42', icon: '💥' },
  { key: 'chaos'     as const, label: 'Chaos',      color: '#9b59b6', icon: '🌀' },
  { key: 'sweetness' as const, label: 'Sweetness',  color: '#e87040', icon: '✨' },
]

function calculateScore(stats: Stats, portions: DrawnPortion[]): number {
  const uniqueDishes   = new Set(portions.map(p => p.dish.id)).size
  const diversityBonus = Math.min(30, uniqueDishes * 5)
  const powerScore     = Math.min(30, Math.round(stats.power / 3))
  const sweetnessScore = Math.min(15, Math.round(stats.sweetness / 4))
  const spiceScore     = Math.min(10, Math.round(stats.spice / 5))
  const crunchScore    = Math.min(10, Math.round(stats.crunch / 5))
  const chaosScore     = Math.min(5,  Math.round(stats.chaos / 8))
  return Math.min(100, diversityBonus + powerScore + sweetnessScore + spiceScore + crunchScore + chaosScore)
}

function getNickname(stats: Stats, mode: GameMode): string {
  const total = Object.values(stats).reduce((a, b) => a + b, 0)
  if (total === 0)                               return 'The Empty Plate'
  if (stats.chaos > 70)                         return 'Chaos Incarnate'
  if (stats.spice > 60 && mode === 'kannur')    return 'Malabar Fire Build'
  if (stats.spice > 60)                         return 'Spice Fiend Build'
  if (stats.sweetness > 60)                     return 'Payasam Power'
  if (stats.crunch > 55)                        return 'Crunch Lord'
  if (stats.power > 70)                         return 'Sadhya Overlord'
  if (mode === 'kannur')                         return 'Kannur Chaos Build'
  return 'Balanced Feast'
}

function getBadge(score: number, mode: GameMode): string {
  if (mode === 'kannur') {
    if (score >= 70) return 'Malabar Edition™'
    if (score >= 40) return 'Non-Veg Rebel'
    return 'You Have Chosen Violence'
  }
  if (score >= 80) return 'Ammachi Approved™'
  if (score >= 60) return 'Proper Sadhya'
  if (score >= 40) return 'Peak Malayali'
  return 'Needs More Payasam'
}

function getScoreTier(score: number): 'low' | 'mid' | 'high' {
  if (score <= 40) return 'low'
  if (score <= 70) return 'mid'
  return 'high'
}

const TIER_COLORS = { low: '#c4845a', mid: '#d4af37', high: '#52cc52' }

function Confetti() {
  const pieces = useMemo(() =>
    Array.from({ length: 48 }, (_, i) => ({
      id: i, left: Math.random() * 100, delay: Math.random() * 2,
      color: ['#d4af37', '#c41e3a', '#52a552', '#ff8c42', '#9b59b6'][i % 5],
      size: 6 + Math.random() * 10, duration: 2.2 + Math.random() * 1.5,
    })), [])
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 50 }}>
      {pieces.map(p => (
        <div key={p.id} className="animate-confetti" style={{
          position: 'absolute', left: `${p.left}%`, top: -16,
          width: p.size, height: p.size, borderRadius: 2,
          backgroundColor: p.color,
          animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s`,
        }} />
      ))}
    </div>
  )
}

type AnimPhase = 'leaf-zoom' | 'maveli-enter' | 'inspection' | 'results'

export default function ResultPage({
  mode, stats, drawnPortions, leafSnapshot, onRebuild, onRebuildSameMode, onViewLeaderboard,
}: ResultPageProps) {
  const [phase, setPhase]               = useState<AnimPhase>('leaf-zoom')
  const [displayScore, setDisplayScore] = useState(0)
  const [displayStats, setDisplayStats] = useState<Stats>({ power: 0, spice: 0, crunch: 0, chaos: 0, sweetness: 0 })
  const [maveliState, setMaveliState]   = useState<'idle' | 'happy' | 'excited' | 'thinking'>('thinking')
  const [soundOn, setSoundOn]           = useState(true)
  const [playerName, setPlayerName]     = useState('')
  const [saved, setSaved]               = useState(false)
  const [saving, setSaving]             = useState(false)
  const [saveError, setSaveError]       = useState(false)
  const [toast, setToast]               = useState(false)
  const inspectionAudioRef              = useRef<HTMLAudioElement | null>(null)
  const resultVideoRef                  = useRef<HTMLVideoElement>(null)
  const kannurAudioRef                  = useRef<HTMLAudioElement | null>(null)

  const score      = useMemo(() => calculateScore(stats, drawnPortions), [stats, drawnPortions])
  const nickname   = useMemo(() => getNickname(stats, mode), [stats, mode])
  const badge      = useMemo(() => getBadge(score, mode), [score, mode])
  const tier       = getScoreTier(score)
  const isKannur   = mode === 'kannur'
  const scoreColor = TIER_COLORS[tier]

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('maveli-enter'), 900)
    const t2 = setTimeout(() => {
      setPhase('inspection')
      setMaveliState('thinking')
      const audio = new Audio('/audio/inspection.mp3')
      audio.volume = 0.6
      audio.play().catch(() => {})
      inspectionAudioRef.current = audio
    }, 1800)
    const t3 = setTimeout(() => {
      setPhase('results')
      setMaveliState(tier === 'high' ? 'excited' : tier === 'mid' ? 'happy' : 'idle')
    }, 4000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (phase !== 'results') return
    if (isKannur) {
      if (resultVideoRef.current) { resultVideoRef.current.muted = true; resultVideoRef.current.play().catch(() => {}) }
      const audio = new Audio(kannurResultAudio)
      audio.loop = true; audio.volume = 0.75
      kannurAudioRef.current = audio
      // Always attempt to play with sound; setSoundOn reflects what actually worked
      audio.play().catch(() => {})
      setSoundOn(true)
    } else {
      if (!resultVideoRef.current) return
      const v = resultVideoRef.current
      v.muted = false; v.volume = 0.7
      setSoundOn(true)
      v.play().catch(() => { v.muted = true })
    }
    return () => { kannurAudioRef.current?.pause(); kannurAudioRef.current = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  useEffect(() => {
    if (phase !== 'results') return
    let cur = 0
    const step = Math.max(1, Math.ceil(score / 35))
    const id = setInterval(() => {
      cur = Math.min(score, cur + step)
      setDisplayScore(cur)
      if (cur >= score) clearInterval(id)
    }, 40)
    return () => clearInterval(id)
  }, [phase, score])

  useEffect(() => {
    if (phase !== 'results') return
    const id = setTimeout(() => setDisplayStats(stats), 80)
    return () => clearTimeout(id)
  }, [phase, stats])

  const maxStatVal = Math.max(...Object.values(displayStats), 1)

  const toggleSound = () => {
    if (isKannur) {
      const a = kannurAudioRef.current
      if (!a) return
      if (soundOn) { a.pause(); setSoundOn(false) } else { a.play().catch(() => {}); setSoundOn(true) }
    } else {
      const v = resultVideoRef.current
      if (!v) return
      if (soundOn) { v.muted = true; setSoundOn(false) } else { v.muted = false; v.volume = 0.7; setSoundOn(true) }
    }
  }

  const uniqueDishes = [...new Map(drawnPortions.map(p => [p.dish.id, p.dish])).values()]

  const handleSave = async () => {
    const trimmed = playerName.trim()
    if (!trimmed || saving) return
    setSaving(true)
    setSaveError(false)
    const entry: LeaderboardEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: trimmed,
      score,
      mode,
      dishes: uniqueDishes.map(d => ({ id: d.id, name: d.name, emoji: d.emoji, color: d.color })),
      stats,
      badge,
      nickname,
      timestamp: Date.now(),
    }
    try {
      await saveEntry(entry)
      setSaved(true)
      setToast(true)
      setTimeout(() => setToast(false), 3000)
    } catch {
      setSaveError(true)
    } finally {
      setSaving(false)
    }
  }

  // ── PRE-RESULTS loading animation ─────────────────────────────────────────
  if (phase !== 'results') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#05080a', fontFamily: FONT,
      }}>
        <Confetti />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
          <div style={{
            width: 320, height: 220, borderRadius: 16, overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)', background: '#2d6228',
            filter: 'drop-shadow(0 16px 40px rgba(0,0,0,0.6))',
            transform: phase === 'leaf-zoom' ? 'scale(1.3)' : 'scale(1)',
            transition: 'transform 0.9s cubic-bezier(0.22,1,0.36,1)',
          }}>
            {leafSnapshot
              ? <img src={leafSnapshot} alt="Your Sadhya" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🍃</div>}
          </div>

          {(phase === 'maveli-enter' || phase === 'inspection') && (
            <div className="animate-slide-in-bottom" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <MaveliCharacter state={maveliState} size={96} />
              {phase === 'inspection' && (
                <div className="animate-fade-in" style={{
                  padding: '7px 20px', borderRadius: 999,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 300, fontFamily: FONT,
                }}>
                  mmmm... MMMM...
                </div>
              )}
            </div>
          )}

          {phase === 'leaf-zoom' && (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem', fontWeight: 300, fontFamily: FONT }}>
              Reviewing your Sadhya...
            </p>
          )}
        </div>
      </div>
    )
  }

  // ── RESULTS: video full-page bg, cosmos score card on left half ────────────
  return (
    <div style={{ position: 'relative', height: '100vh', overflow: 'hidden', fontFamily: FONT }}>
      <Confetti />

      {/* Full-page video background */}
      <video
        key={mode}
        ref={resultVideoRef}
        src={isKannur ? resultKannurVideo : resultNormalVideo}
        autoPlay loop muted playsInline
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
      />

      {/* Left-side vignette so score text pops */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'linear-gradient(to right, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.24) 52%, rgba(0,0,0,0.02) 100%)',
      }} />

      {/* Sound toggle */}
      <button
        onClick={toggleSound}
        style={{
          position: 'absolute', top: 18, right: 20, zIndex: 20,
          display: 'flex', alignItems: 'center', gap: 6,
          height: 34, padding: '0 16px', borderRadius: 999, cursor: 'pointer',
          border: soundOn ? '1px solid rgba(212,175,55,0.4)' : '1px solid rgba(255,255,255,0.18)',
          background: soundOn ? 'rgba(212,175,55,0.14)' : 'rgba(0,0,0,0.38)',
          color: soundOn ? '#d4af37' : 'rgba(255,255,255,0.7)',
          fontSize: '0.7rem', fontWeight: 400, letterSpacing: '0.06em',
          backdropFilter: 'blur(12px)', fontFamily: FONT,
          transition: 'all 0.22s ease',
        }}
      >
        <span style={{ fontSize: '0.88rem' }}>{soundOn ? '🔊' : '🔇'}</span>
        {soundOn ? 'Sound on' : 'Sound off'}
      </button>

      {/* ── Score card: strictly left 50% ─────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '50%', height: '100%',
        overflowY: 'auto', zIndex: 10,
        display: 'flex', flexDirection: 'column',
        padding: '28px 30px 28px', boxSizing: 'border-box',
      }}>

        {/* Header label */}
        <p style={{
          color: 'rgba(255,255,255,0.25)', fontSize: '0.62rem',
          fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase',
          marginBottom: 18, fontFamily: FONT,
          textShadow: '0 1px 4px rgba(0,0,0,0.9)',
        }}>
          Your Sadhya Result
        </p>

        {/* Score number — cosmos: thin weight, tight tracking */}
        <div className="animate-score-reveal" style={{ animationDelay: '0.25s', marginBottom: 4 }}>
          <span style={{
            fontFamily: FONT, fontWeight: 300,
            fontSize: 'clamp(4rem, 9vw, 6.5rem)',
            color: scoreColor, lineHeight: 1,
            letterSpacing: '-0.04em',
            textShadow: `0 0 60px ${scoreColor}44, 0 4px 20px rgba(0,0,0,0.95)`,
          }}>
            {displayScore}
          </span>
          <span style={{
            fontFamily: FONT, fontWeight: 300,
            fontSize: '1.6rem', color: 'rgba(255,255,255,0.2)',
            letterSpacing: '-0.02em',
          }}>
            /100
          </span>
        </div>

        {/* Build nickname */}
        <h2 style={{
          fontFamily: FONT, fontWeight: 300,
          color: 'rgba(255,255,255,0.88)',
          fontSize: 'clamp(0.9rem, 2vw, 1.2rem)',
          letterSpacing: '-0.02em',
          marginBottom: 14,
          textShadow: '0 2px 12px rgba(0,0,0,0.95)',
        }}>
          {nickname}
        </h2>

        {/* Badge + mode tag */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 18, alignItems: 'center' }}>
          <span style={{
            height: 28, padding: '0 14px', borderRadius: 999, display: 'inline-flex', alignItems: 'center',
            background: `${scoreColor}14`, border: `1px solid ${scoreColor}44`,
            color: scoreColor, fontSize: '0.75rem', fontWeight: 500, fontFamily: FONT,
          }}>
            🏆 {badge}
          </span>
          <span style={{
            height: 26, padding: '0 12px', borderRadius: 999, display: 'inline-flex', alignItems: 'center',
            background: isKannur ? 'rgba(196,30,58,0.14)' : 'rgba(82,165,82,0.14)',
            color:      isKannur ? 'rgba(255,130,130,0.8)'  : 'rgba(100,210,100,0.8)',
            border: `1px solid ${isKannur ? 'rgba(196,30,58,0.28)' : 'rgba(82,165,82,0.28)'}`,
            fontSize: '0.66rem', fontWeight: 500, letterSpacing: '0.08em', fontFamily: FONT,
          }}>
            {isKannur ? '🌶️ Kannur' : '🌿 Normal'}
          </span>
        </div>

        {/* Maveli + verdict */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '12px 14px', borderRadius: 12, marginBottom: 18,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <MaveliCharacter state={maveliState} size={58} />
          <div>
            <p style={{
              fontFamily: FONT, fontWeight: 400,
              color: scoreColor, fontSize: '0.88rem', marginBottom: 3,
            }}>
              {tier === 'high' ? '🎉 Spectacular!' : tier === 'mid' ? '👍 Not bad!' : '😅 Could be better…'}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: '0.74rem', lineHeight: 1.5, fontFamily: FONT, fontWeight: 300 }}>
              {tier === 'high'
                ? (isKannur ? 'Maveli is impressed by your audacity.' : 'Maveli calls this a legendary Sadhya.')
                : tier === 'mid'
                ? 'Maveli approves, but wants more Payasam.'
                : (isKannur ? 'Maveli is confused. Add more non-veg.' : 'Maveli suggests more dishes next time.')}
            </p>
          </div>
        </div>

        {/* Stat bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
          {STAT_META.map((m, i) => {
            const val = displayStats[m.key]
            const pct = Math.min(100, (val / Math.max(maxStatVal, 60)) * 100)
            return (
              <div key={m.key} className="animate-slide-in-right" style={{ animationDelay: `${0.25 + i * 0.08}s` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 5, fontFamily: FONT }}>
                    {m.icon} {m.label}
                  </span>
                  <span style={{ color: m.color, fontWeight: 500, fontSize: '0.72rem', fontVariantNumeric: 'tabular-nums', fontFamily: FONT }}>
                    {stats[m.key]}
                  </span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 999, overflow: 'hidden' }}>
                  <div
                    className="stat-bar-fill"
                    style={{
                      height: '100%', width: `${pct}%`,
                      background: `linear-gradient(90deg, ${m.color}66, ${m.color})`,
                      borderRadius: 999,
                      transitionDelay: `${0.3 + i * 0.1}s`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Dish chips */}
        <div style={{ marginBottom: 20 }}>
          <p style={{
            color: 'rgba(255,255,255,0.22)', fontSize: '0.6rem',
            fontWeight: 500, letterSpacing: '0.16em', marginBottom: 8,
            textTransform: 'uppercase', fontFamily: FONT,
          }}>
            Dishes on leaf
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {uniqueDishes.map(dish => (
              <span key={dish.id} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                height: 24, padding: '0 10px', borderRadius: 999,
                background: `${dish.color}12`, border: `1px solid ${dish.color}30`,
                color: 'rgba(255,255,255,0.65)', fontSize: '0.68rem', fontWeight: 400, fontFamily: FONT,
              }}>
                {dish.emoji} {dish.name}
              </span>
            ))}
            {drawnPortions.length === 0 && (
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', fontFamily: FONT }}>No dishes added</span>
            )}
          </div>
        </div>

        {/* Portion count note */}
        <p style={{
          color: 'rgba(255,255,255,0.2)', fontSize: '0.68rem', marginBottom: 18,
          fontFamily: FONT, fontWeight: 300,
        }}>
          {drawnPortions.length} portion{drawnPortions.length !== 1 ? 's' : ''} ·{' '}
          {uniqueDishes.length} unique dish{uniqueDishes.length !== 1 ? 'es' : ''}
        </p>

        {/* Name entry — save to leaderboard */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 14, marginBottom: 14,
        }}>
          <p style={{
            color: 'rgba(255,255,255,0.22)', fontSize: '0.6rem',
            letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 10, fontFamily: FONT,
          }}>
            Save to leaderboard
          </p>

          {!saved ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                type="text"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
                placeholder="What's your name, legend?"
                maxLength={30}
                style={{
                  height: 40, borderRadius: 999, padding: '0 16px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  color: 'rgba(255,255,255,0.88)', fontSize: '0.82rem',
                  fontFamily: FONT, outline: 'none', boxSizing: 'border-box', width: '100%',
                }}
              />
              <button
                onClick={handleSave}
                disabled={!playerName.trim() || saving}
                style={{
                  height: 40, borderRadius: 999, fontWeight: 500, fontSize: '0.8rem',
                  letterSpacing: '0.04em', border: 'none',
                  cursor: playerName.trim() && !saving ? 'pointer' : 'not-allowed',
                  fontFamily: FONT,
                  background: playerName.trim() && !saving
                    ? (isKannur ? 'rgba(196,30,58,0.85)' : 'rgba(82,180,82,0.85)')
                    : 'rgba(255,255,255,0.08)',
                  color: playerName.trim() && !saving ? '#fff' : 'rgba(255,255,255,0.28)',
                  transition: 'all 0.18s ease',
                }}
              >
                {saving ? 'Saving…' : 'Save my Sadhya 🍛'}
              </button>
              {saveError && (
                <p style={{ color: 'rgba(255,130,130,0.75)', fontSize: '0.68rem', textAlign: 'center', fontFamily: FONT, lineHeight: 1.5 }}>
                  Server not reachable — deploy the edge function in Make Settings, then try again.
                  <br />
                  <span style={{ color: 'rgba(255,255,255,0.3)' }}>(Your entry was saved locally for now.)</span>
                </p>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{
                height: 40, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(82,204,82,0.12)', border: '1px solid rgba(82,204,82,0.25)',
                color: 'rgba(100,220,100,0.9)', fontSize: '0.8rem', fontFamily: FONT, gap: 7,
              }}>
                <span>✓</span> Saved! Check the leaderboard 🍛
              </div>
              <button
                onClick={onViewLeaderboard}
                style={{
                  height: 40, borderRadius: 999, fontWeight: 500, fontSize: '0.8rem',
                  letterSpacing: '0.04em', border: '1px solid rgba(212,175,55,0.35)',
                  background: 'rgba(212,175,55,0.1)', color: '#d4af37',
                  cursor: 'pointer', fontFamily: FONT, transition: 'all 0.18s ease',
                }}
              >
                View Leaderboard →
              </button>
            </div>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <div style={{
            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            padding: '10px 24px', borderRadius: 999, zIndex: 100,
            background: 'rgba(20,20,20,0.92)', border: '1px solid rgba(82,204,82,0.3)',
            color: 'rgba(100,220,100,0.95)', fontSize: '0.82rem', fontFamily: FONT,
            backdropFilter: 'blur(12px)', whiteSpace: 'nowrap',
            animation: 'fadeInUp 0.3s ease-out both',
          }}>
            ✓ Saved! You're on the leaderboard.
          </div>
        )}

        {/* Action buttons */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={onRebuildSameMode}
            style={{
              height: 48, borderRadius: 999, fontWeight: 500, fontSize: '0.88rem',
              letterSpacing: '0.01em', border: 'none', cursor: 'pointer', fontFamily: FONT,
              background: isKannur ? 'rgba(196,30,58,0.9)' : 'rgba(255,255,255,0.92)',
              color: isKannur ? '#fff' : '#06090c',
              boxShadow: isKannur ? '0 4px 20px rgba(196,30,58,0.28)' : '0 4px 20px rgba(255,255,255,0.1)',
              transition: 'transform 0.15s, opacity 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.opacity = '0.9' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1' }}
          >
            ↩ Build Again ({isKannur ? 'Kannur' : 'Normal'})
          </button>
          <button
            onClick={onRebuild}
            style={{
              height: 40, borderRadius: 999, fontWeight: 400, fontSize: '0.8rem',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'transparent',
              color: 'rgba(255,255,255,0.38)',
              cursor: 'pointer', fontFamily: FONT,
              transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.72)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.38)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  )
}
