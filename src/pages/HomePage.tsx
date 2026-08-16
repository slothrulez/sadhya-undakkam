import { useEffect, useRef, useState } from 'react'
import type { GameMode } from '../types'
import normalBgVideo from '../imports/Create_a_second_seamless_lo.mp4'
import kannurBgVideo from '../imports/Create_a_second_seamless_lo__1_.mp4'

interface HomePageProps {
  mode: GameMode
  onModeChange: (mode: GameMode) => void
  onStart: () => void
  onViewLeaderboard: () => void
}

const HERO_FONT = "'Poppins', 'Noto Sans Malayalam', system-ui, sans-serif"

export default function HomePage({ mode, onModeChange, onStart, onViewLeaderboard }: HomePageProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  // Sound is on by default; browsers may hold it muted until first gesture
  const [soundOn, setSoundOn] = useState(true)
  const isKannur = mode === 'kannur'

  // Apply sound preference whenever the video element remounts (mode switch)
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = !soundOn
    if (soundOn) v.volume = 0.72
  }, [mode, soundOn])

  // Attempt to unmute on mount (succeeds if a prior user gesture unlocked audio)
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = false
    v.volume = 0.72
    // If browser blocks unmuted autoplay, fall back silently — first click will unlock
    v.play().catch(() => {})
  }, [])

  const toggleSound = () => {
    setSoundOn(prev => {
      const next = !prev
      const v = videoRef.current
      if (v) { v.muted = !next; if (next) v.volume = 0.72 }
      return next
    })
  }

  // First click anywhere unblocks audio if the browser held the video muted
  const handleUnlock = () => {
    const v = videoRef.current
    if (soundOn && v && v.muted) { v.muted = false; v.volume = 0.72 }
  }

  const handleStart = () => { handleUnlock(); setTimeout(onStart, 200) }
  const handleMode  = (m: GameMode) => { handleUnlock(); onModeChange(m) }

  return (
    <div
      style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}
      onClick={handleUnlock}
    >
      {/* Fallback bg */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: isKannur ? '#100101' : '#060e07',
        transition: 'background 0.5s',
      }} />

      {/* Video — key=mode remounts cleanly on switch */}
      <video
        key={mode}
        ref={videoRef}
        src={isKannur ? kannurBgVideo : normalBgVideo}
        autoPlay loop muted playsInline
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}
      />

      {/* Overlay — cosmos centre-open vignette */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
        background: `linear-gradient(to bottom,
          rgba(0,0,0,0.52) 0%,
          rgba(0,0,0,0.08) 28%,
          rgba(0,0,0,0.08) 72%,
          rgba(0,0,0,0.62) 100%)`,
      }} />

      {/* Mode toggle — top-left pill, cycles on click */}
      <button
        onClick={e => { e.stopPropagation(); handleMode(isKannur ? 'normal' : 'kannur') }}
        style={{
          position: 'absolute', top: 20, left: 20, zIndex: 20,
          display: 'flex', alignItems: 'center', gap: 6,
          height: 36, padding: '0 14px', borderRadius: 999,
          border: isKannur ? '1px solid rgba(220,60,60,0.4)' : '1px solid rgba(82,180,100,0.4)',
          background: isKannur ? 'rgba(120,10,24,0.55)' : 'rgba(20,60,32,0.55)',
          backdropFilter: 'blur(12px)',
          color: 'rgba(255,255,255,0.82)',
          fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.06em',
          cursor: 'pointer', fontFamily: HERO_FONT,
          transition: 'all 0.25s ease',
        }}
      >
        <span>{isKannur ? '🌶️' : '🌿'}</span>
        {isKannur ? 'Kannur' : 'Normal'}
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.65rem' }}>↕</span>
      </button>

      {/* Sound toggle — top-right pill */}
      <button
        onClick={e => { e.stopPropagation(); toggleSound() }}
        style={{
          position: 'absolute', top: 20, right: 20, zIndex: 20,
          display: 'flex', alignItems: 'center', gap: 6,
          height: 36, padding: '0 14px', borderRadius: 999,
          border: soundOn ? '1px solid rgba(255,255,255,0.28)' : '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(0,0,0,0.28)',
          backdropFilter: 'blur(12px)',
          color: soundOn ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
          fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.06em',
          cursor: 'pointer', fontFamily: HERO_FONT,
          transition: 'color 0.2s, border-color 0.2s',
        }}
      >
        <span>{soundOn ? '🔊' : '🔇'}</span>
        {soundOn ? 'Sound on' : 'Sound off'}
      </button>

      {/* Main content */}
      <div style={{
        position: 'relative', zIndex: 10, height: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 24, padding: '80px 24px 60px',
        textAlign: 'center', boxSizing: 'border-box',
      }}>

        {/* Hero headline */}
        <h1 style={{
          fontFamily: HERO_FONT,
          fontSize: 'clamp(2.8rem, 9vw, 7rem)',
          fontWeight: 300, letterSpacing: '-0.04em', lineHeight: 1.05,
          color: 'rgba(255,255,255,0.95)', margin: 0,
          textShadow: '0 2px 32px rgba(0,0,0,0.6)',
          animation: 'fadeInUp 0.6s ease-out 0.15s both', flexShrink: 0,
        }}>
          Sadhya<br />
          <span style={{ fontStyle: 'italic', fontWeight: 300 }}>ഉണ്ടāക്കāം?</span>
        </h1>

        {/* CTA */}
        <button
          onClick={e => { e.stopPropagation(); handleStart() }}
          style={{
            height: 52, padding: '0 44px',
            borderRadius: 999, border: 'none', fontFamily: HERO_FONT,
            fontSize: '0.95rem', fontWeight: 500, letterSpacing: '0.02em',
            cursor: 'pointer',
            background: isKannur ? 'rgba(220,30,55,0.88)' : 'rgba(255,255,255,0.9)',
            color: isKannur ? '#fff' : '#0d1f10',
            backdropFilter: 'blur(8px)',
            animation: 'fadeInUp 0.5s ease-out 0.28s both',
            transition: 'transform 0.18s ease, opacity 0.18s ease, background 0.25s ease',
            flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.opacity = '0.92' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1' }}
        >
          Build my Sadhya →
        </button>

        {/* Subtitle */}
        <p style={{
          fontFamily: HERO_FONT,
          fontSize: 'clamp(0.82rem, 1.5vw, 1rem)',
          fontWeight: 400, letterSpacing: '0.01em',
          color: 'rgba(255,255,255,0.42)',
          margin: 0, maxWidth: 380, lineHeight: 1.65,
          animation: 'fadeInUp 0.5s ease-out 0.38s both',
          textShadow: '0 1px 8px rgba(0,0,0,0.7)', flexShrink: 0,
        }}>
          Draw your portions on a banana leaf.<br />
          How chaotic is your feast?
        </p>

        {/* Leaderboard pill */}
        <button
          onClick={e => { e.stopPropagation(); handleUnlock(); onViewLeaderboard() }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            height: 34, padding: '0 18px', borderRadius: 999,
            border: '1px solid rgba(212,175,55,0.3)',
            background: 'rgba(212,175,55,0.08)',
            backdropFilter: 'blur(10px)',
            color: 'rgba(212,175,55,0.8)', fontSize: '0.72rem',
            fontWeight: 400, letterSpacing: '0.04em',
            cursor: 'pointer', fontFamily: HERO_FONT,
            animation: 'fadeInUp 0.5s ease-out 0.48s both',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(212,175,55,0.14)'
            e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)'
            e.currentTarget.style.color = 'rgba(212,175,55,1)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(212,175,55,0.08)'
            e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)'
            e.currentTarget.style.color = 'rgba(212,175,55,0.8)'
          }}
        >
          🏆 Leaderboard
        </button>

      </div>
    </div>
  )
}
