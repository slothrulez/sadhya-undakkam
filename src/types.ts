export type GameMode = 'normal' | 'kannur'
export type GamePage = 'home' | 'builder' | 'result' | 'leaderboard'

export interface LeaderboardEntry {
  id: string
  name: string
  score: number
  mode: GameMode
  dishes: { id: string; name: string; emoji: string; color: string }[]
  stats: Stats
  badge: string
  nickname: string
  timestamp: number
}

export interface Stats {
  power: number
  spice: number
  crunch: number
  chaos: number
  sweetness: number
}

export interface DishStats {
  power?: number
  spice?: number
  crunch?: number
  chaos?: number
  sweetness?: number
}

export interface Dish {
  id: string
  name: string
  subtitle: string
  color: string
  emoji: string
  stats: DishStats
  personality: string
  funFact: string
  imageUrl?: string
}

export interface DrawnPortion {
  id: string
  dish: Dish
  path: { x: number; y: number }[]
  portionFactor: number
  centroid: { x: number; y: number }
}

export interface GameState {
  page: GamePage
  mode: GameMode
  stats: Stats
  drawnPortions: DrawnPortion[]
  leafSnapshot: string | null
  finalScore: number | null
}
