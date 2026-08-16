import { useEffect, useRef, useState } from 'react'
import type { DrawnPortion, GameMode, GamePage, Stats } from './types'
import HomePage from './pages/HomePage'
import BuilderPage from './pages/BuilderPage'
import ResultPage from './pages/ResultPage'
import LeaderboardPage from './pages/LeaderboardPage'

const EMPTY_STATS: Stats = { power: 0, spice: 0, crunch: 0, chaos: 0, sweetness: 0 }

export default function App() {
  const [page, setPage]                   = useState<GamePage>('home')
  const [mode, setMode]                   = useState<GameMode>('normal')
  const [stats, setStats]                 = useState<Stats>({ ...EMPTY_STATS })
  const [drawnPortions, setDrawnPortions] = useState<DrawnPortion[]>([])
  const [leafSnapshot, setLeafSnapshot]   = useState<string | null>(null)

  const bgAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (page === 'home') {
      bgAudioRef.current?.pause()
      bgAudioRef.current = null
    }
  }, [page])

  useEffect(() => {
    if (page === 'home') return
    bgAudioRef.current?.pause()
    const audio = new Audio(
      mode === 'normal' ? '/audio/normal-bg.mp3' : '/audio/kannur-bg.mp3'
    )
    audio.loop   = true
    audio.volume = 0.38
    bgAudioRef.current = audio
    audio.play().catch(() => {})
    return () => { audio.pause() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  // Page handlers

  const handleStart = () => setPage('builder')

  const handleFinalize = (snapshot: string, finalStats: Stats, portions: DrawnPortion[]) => {
    setLeafSnapshot(snapshot)
    setStats(finalStats)
    setDrawnPortions(portions)
    setPage('result')
  }

  const handleRebuild = () => {
    setStats({ ...EMPTY_STATS })
    setDrawnPortions([])
    setLeafSnapshot(null)
    setPage('home')
  }

  const handleRebuildSameMode = () => {
    setStats({ ...EMPTY_STATS })
    setDrawnPortions([])
    setLeafSnapshot(null)
    setPage('builder')
  }

  const handleViewLeaderboard = () => setPage('leaderboard')

  const handleBuildAnother = () => {
    setStats({ ...EMPTY_STATS })
    setDrawnPortions([])
    setLeafSnapshot(null)
    setPage('home')
  }

  return (
    <div key={page} style={{ width: '100%', minHeight: '100vh' }}>
      {page === 'home' && (
        <HomePage
          mode={mode}
          onModeChange={setMode}
          onStart={handleStart}
          onViewLeaderboard={handleViewLeaderboard}
        />
      )}
      {page === 'builder' && (
        <BuilderPage
          mode={mode}
          onFinalize={handleFinalize}
          onBack={() => setPage('home')}
        />
      )}
      {page === 'result' && (
        <ResultPage
          mode={mode}
          stats={stats}
          drawnPortions={drawnPortions}
          leafSnapshot={leafSnapshot}
          onRebuild={handleRebuild}
          onRebuildSameMode={handleRebuildSameMode}
          onViewLeaderboard={handleViewLeaderboard}
        />
      )}
      {page === 'leaderboard' && (
        <LeaderboardPage
          onBuildAnother={handleBuildAnother}
        />
      )}
    </div>
  )
}
