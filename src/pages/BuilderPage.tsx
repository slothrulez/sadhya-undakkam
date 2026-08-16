import { useCallback, useEffect, useRef, useState } from 'react'
import type { Dish, DrawnPortion, GameMode, Stats } from '../types'
import { normalDishes, kannurDishes, MAVELI_REACTIONS_NORMAL, MAVELI_REACTIONS_KANNUR } from '../data/dishes'
import MaveliCharacter from '../components/MaveliCharacter'
import onamBgm from '../imports/onam_bgm_-_athira_gp.mp3'
import kannurBgm from '../imports/Manatharil_Karaoke_With_Lyrics__Kannur_Seenath__Mappila_Karaoke_-_Mappila_Karaoke-1.mp3'
import hmmSound from '../imports/Hmm-mm_-_Sound_Effect_-_Eccentric_Sounds.mp3'

interface BuilderPageProps {
  mode: GameMode
  onFinalize: (snapshot: string, stats: Stats, portions: DrawnPortion[]) => void
  onBack: () => void
}

const EMPTY_STATS: Stats = { power: 0, spice: 0, crunch: 0, chaos: 0, sweetness: 0 }
const FONT = "'Poppins', 'Noto Sans Malayalam', system-ui, sans-serif"

// ── Math helpers ─────────────────────────────────────────────────────────────

function shoelaceArea(pts: { x: number; y: number }[]): number {
  let a = 0
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length
    a += pts[i].x * pts[j].y - pts[j].x * pts[i].y
  }
  return Math.abs(a) / 2
}

function centroid(pts: { x: number; y: number }[]): { x: number; y: number } {
  const s = pts.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 })
  return { x: s.x / pts.length, y: s.y / pts.length }
}

function buildPath2D(path: { x: number; y: number }[]): Path2D {
  const p = new Path2D()
  if (!path.length) return p
  p.moveTo(path[0].x, path[0].y)
  for (let i = 1; i < path.length; i++) p.lineTo(path[i].x, path[i].y)
  p.closePath()
  return p
}

function getBounds(path: { x: number; y: number }[]) {
  const xs = path.map(p => p.x), ys = path.map(p => p.y)
  const minX = Math.min(...xs), minY = Math.min(...ys)
  return { minX, minY, w: Math.max(...xs) - minX, h: Math.max(...ys) - minY }
}

// ── Animated texture system ──────────────────────────────────────────────────

function rng(seed: number) {
  let s = (Math.abs(Math.round(seed)) || 42) % 2147483647
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
}

type Ctx = CanvasRenderingContext2D

function grad(ctx: Ctx, x: number, y: number, w: number, h: number, c1: string, c2: string, angle = 0) {
  const cos = Math.cos(angle), sin = Math.sin(angle)
  const g = ctx.createLinearGradient(x, y, x + w * cos + h * sin, y + w * sin + h * cos)
  g.addColorStop(0, c1); g.addColorStop(1, c2)
  ctx.fillStyle = g; ctx.fillRect(x - 20, y - 20, w + 40, h + 40)
}

function gloss(ctx: Ctx, x: number, y: number, w: number, h: number, t: number, a = 0.18) {
  const s = (Math.sin(t * 0.0007) + 1) / 2
  const gx = x + w * (0.15 + s * 0.7), gy = y + h * 0.25
  const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, w * 0.65)
  g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g; ctx.fillRect(x - 20, y - 20, w + 40, h + 40)
}

function ripple(ctx: Ctx, x: number, y: number, w: number, h: number, t: number, hex: string) {
  for (let i = 0; i < 5; i++) {
    const ph = t * 0.0013 + i * 1.26
    const rx = x + w / 2 + Math.sin(ph) * w * 0.1, ry = y + h / 2 + Math.cos(ph * 0.7) * h * 0.08
    const r = (w + h) * (0.12 + 0.08 * Math.sin(ph * 1.5))
    const g = ctx.createRadialGradient(rx, ry, 0, rx, ry, r)
    g.addColorStop(0, `${hex}1a`); g.addColorStop(1, `${hex}00`)
    ctx.fillStyle = g; ctx.fillRect(x - 20, y - 20, w + 40, h + 40)
  }
}

function steam(ctx: Ctx, x: number, y: number, w: number, h: number, t: number, n = 3) {
  for (let i = 0; i < n; i++) {
    const sx = x + w * (0.2 + (i / Math.max(n - 1, 1)) * 0.6)
    const off = ((t * 0.06 + i * 400) % (h + 40))
    const a = 0.13 * Math.max(0, 1 - off / h)
    if (a < 0.01) continue
    ctx.save()
    ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = 1.8
    ctx.beginPath()
    const ty = y + h - off
    ctx.moveTo(sx, ty)
    ctx.bezierCurveTo(sx + Math.sin(t * 0.001 + i * 2.1) * 10, ty - h * 0.3,
      sx - Math.sin(t * 0.0009 + i * 1.8) * 10, ty - h * 0.65,
      sx + Math.sin(t * 0.0011 + i * 2.4) * 7, ty - h * 0.95)
    ctx.stroke(); ctx.restore()
  }
}

function dots(ctx: Ctx, x: number, y: number, w: number, h: number, r_: () => number,
  color: string, n: number, radius: number, alpha = 0.75) {
  ctx.fillStyle = color; ctx.globalAlpha = alpha
  for (let i = 0; i < n; i++) {
    ctx.beginPath(); ctx.arc(x + r_() * w, y + r_() * h, radius * (0.6 + r_() * 0.8), 0, Math.PI * 2); ctx.fill()
  }
  ctx.globalAlpha = 1
}

function strands(ctx: Ctx, x: number, y: number, w: number, h: number, r_: () => number,
  color: string, n: number, len: number, width = 1.3, alpha = 0.55) {
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.globalAlpha = alpha
  for (let i = 0; i < n; i++) {
    const sx = x + r_() * w, sy = y + r_() * h
    ctx.beginPath(); ctx.moveTo(sx, sy)
    ctx.lineTo(sx + (r_() - 0.5) * len, sy + (r_() - 0.5) * len * 0.4); ctx.stroke()
  }
  ctx.globalAlpha = 1
}

function blobs(ctx: Ctx, x: number, y: number, w: number, h: number, r_: () => number,
  color: string, n: number, sz: number, alpha = 0.8) {
  ctx.fillStyle = color; ctx.globalAlpha = alpha
  for (let i = 0; i < n; i++) {
    const bx = x + r_() * w, by = y + r_() * h, ang = r_() * Math.PI
    ctx.save(); ctx.translate(bx, by); ctx.rotate(ang)
    ctx.beginPath(); ctx.ellipse(0, 0, sz * (1.2 + r_() * 0.8), sz * (0.5 + r_() * 0.5), 0, 0, Math.PI * 2)
    ctx.fill(); ctx.restore()
  }
  ctx.globalAlpha = 1
}

// ── Per-dish texture renderers ──────────────────────────────────────────────

function texChoru(ctx: Ctx, x: number, y: number, w: number, h: number, t: number) {
  grad(ctx, x, y, w, h, '#f5f1e6', '#ece5d4')
  const r_ = rng(x * 7 + y * 13)
  ctx.globalAlpha = 0.75
  for (let i = 0; i < 100; i++) {
    const gx = x + r_() * w, gy = y + r_() * h, b = 0.85 + r_() * 0.15
    ctx.fillStyle = `rgba(${Math.round(255*b)},${Math.round(252*b)},${Math.round(235*b)},${0.7 + r_()*0.3})`
    ctx.save(); ctx.translate(gx, gy); ctx.rotate(r_() * Math.PI)
    ctx.beginPath(); ctx.ellipse(0, 0, 2.5 + r_() * 1.5, 1, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore()
  }
  ctx.globalAlpha = 1
  steam(ctx, x, y, w, h, t, 4)
  gloss(ctx, x, y, w, h, t, 0.08)
}

function texParippu(ctx: Ctx, x: number, y: number, w: number, h: number, t: number) {
  grad(ctx, x, y, w, h, '#f4d03f', '#c8a000')
  dots(ctx, x, y, w, h, rng(x * 11 + y * 7), '#9a7000', 55, 2.3)
  // Curry leaves
  const r_ = rng(x * 3 + y * 17); ctx.fillStyle = '#2d6a2d'; ctx.globalAlpha = 0.7
  for (let i = 0; i < 9; i++) {
    ctx.save(); ctx.translate(x + r_() * w, y + r_() * h); ctx.rotate(r_() * Math.PI)
    ctx.beginPath(); ctx.ellipse(0, 0, 4, 1.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore()
  }
  ctx.globalAlpha = 1
  ripple(ctx, x, y, w, h, t, '#e6b800'); gloss(ctx, x, y, w, h, t, 0.22)
}

function texSambar(ctx: Ctx, x: number, y: number, w: number, h: number, t: number) {
  grad(ctx, x, y, w, h, '#d2691e', '#a04010')
  blobs(ctx, x, y, w, h, rng(x + y * 2), '#e87820', 12, 4)       // carrots
  blobs(ctx, x, y, w, h, rng(x * 2 + y), '#5a8a30', 8, 3.5)      // okra
  // Onion rings
  const r_ = rng(x * 9 + y * 3); ctx.strokeStyle = 'rgba(255,240,220,0.65)'; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.55
  for (let i = 0; i < 6; i++) {
    const or_ = 3 + r_() * 3
    ctx.beginPath(); ctx.ellipse(x + r_() * w, y + r_() * h, or_, or_ * 0.55, r_() * Math.PI, 0, Math.PI * 2); ctx.stroke()
  }
  ctx.globalAlpha = 1
  ripple(ctx, x, y, w, h, t, '#b05820'); gloss(ctx, x, y, w, h, t, 0.18)
}

function texRasam(ctx: Ctx, x: number, y: number, w: number, h: number, t: number) {
  grad(ctx, x, y, w, h, '#c41e3a', '#8b0a1a')
  ctx.fillStyle = 'rgba(180,10,30,0.3)'; ctx.fillRect(x - 20, y - 20, w + 40, h + 40)
  dots(ctx, x, y, w, h, rng(x * 6 + y * 9), '#6a0010', 45, 1.4, 0.6)
  strands(ctx, x, y, w, h, rng(x + y * 5), '#3a7a20', 7, 12, 1.5, 0.65)
  steam(ctx, x, y, w, h, t, 5)
  ripple(ctx, x, y, w, h, t, '#8b0a1a'); gloss(ctx, x, y, w, h, t, 0.12)
}

function texAvial(ctx: Ctx, x: number, y: number, w: number, h: number, t: number) {
  grad(ctx, x, y, w, h, '#52a552', '#2d7a2d')
  blobs(ctx, x, y, w, h, rng(x * 4 + y), '#e06820', 10, 5)        // carrot
  blobs(ctx, x, y, w, h, rng(x * 8 + y * 2), '#f0a030', 8, 5)     // pumpkin
  strands(ctx, x, y, w, h, rng(x + y * 6), '#4a8a20', 12, 14, 2, 0.6) // beans
  // Coconut milk drizzle
  const r_ = rng(x * 3 + y * 8); ctx.strokeStyle = 'rgba(245,240,225,0.7)'; ctx.lineWidth = 2.5; ctx.globalAlpha = 0.6
  for (let i = 0; i < 5; i++) {
    const sx = x + r_() * w, sy = y + r_() * h
    ctx.beginPath(); ctx.moveTo(sx, sy)
    ctx.bezierCurveTo(sx+(r_()-0.5)*18, sy+10, sx+(r_()-0.5)*18, sy+22, sx+(r_()-0.5)*14, sy+32); ctx.stroke()
  }
  ctx.globalAlpha = 1; gloss(ctx, x, y, w, h, t, 0.15)
}

function texOlan(ctx: Ctx, x: number, y: number, w: number, h: number, t: number) {
  grad(ctx, x, y, w, h, '#f0e8d8', '#e0d4b8')
  blobs(ctx, x, y, w, h, rng(x * 5 + y * 3), '#e8a840', 10, 5, 0.55)
  const ph = t * 0.0005
  const g = ctx.createRadialGradient(
    x + w/2 + Math.sin(ph)*w*0.2, y + h/2 + Math.cos(ph)*h*0.15, 0, x+w/2, y+h/2, (w+h)*0.4)
  g.addColorStop(0, 'rgba(255,252,240,0.2)'); g.addColorStop(1, 'rgba(255,252,240,0)')
  ctx.fillStyle = g; ctx.fillRect(x-20, y-20, w+40, h+40)
  gloss(ctx, x, y, w, h, t, 0.12)
}

function texKaalan(ctx: Ctx, x: number, y: number, w: number, h: number, t: number) {
  grad(ctx, x, y, w, h, '#5c4033', '#3a2015')
  blobs(ctx, x, y, w, h, rng(x * 7 + y * 5), '#3a2510', 10, 6, 0.65)
  ctx.fillStyle = 'rgba(25,12,4,0.28)'; ctx.fillRect(x-20, y-20, w+40, h+40)
  ripple(ctx, x, y, w, h, t, '#2a1005'); gloss(ctx, x, y, w, h, t, 0.24)
}

function texErissery(ctx: Ctx, x: number, y: number, w: number, h: number, t: number) {
  grad(ctx, x, y, w, h, '#ff8c42', '#c05a18')
  dots(ctx, x, y, w, h, rng(x*9+y*4), '#d4b870', 22, 3.5, 0.82)
  dots(ctx, x, y, w, h, rng(x*3+y*11), 'rgba(220,100,30,0.4)', 28, 4, 0.5)
  gloss(ctx, x, y, w, h, t, 0.18); ripple(ctx, x, y, w, h, t, '#a03000')
}

function texPuliInji(ctx: Ctx, x: number, y: number, w: number, h: number, t: number) {
  grad(ctx, x, y, w, h, '#8b0000', '#4a0000')
  strands(ctx, x, y, w, h, rng(x*2+y*14), '#c04040', 22, 16, 1.2, 0.62)
  ctx.fillStyle = 'rgba(140,0,0,0.22)'; ctx.fillRect(x-20, y-20, w+40, h+40)
  gloss(ctx, x, y, w, h, t, 0.3)
}

function texPappadam(ctx: Ctx, x: number, y: number, w: number, h: number, t: number) {
  grad(ctx, x, y, w, h, '#daa520', '#b8860b')
  // Crack lines
  const r_ = rng(x*6+y*10); ctx.strokeStyle = '#8b6914'; ctx.lineWidth = 0.8; ctx.globalAlpha = 0.5
  for (let i = 0; i < 20; i++) {
    const cx_ = x + r_() * w, cy_ = y + r_() * h
    ctx.beginPath(); ctx.moveTo(cx_, cy_)
    ctx.lineTo(cx_ + (r_()-0.5)*22, cy_ + (r_()-0.5)*22); ctx.stroke()
  }
  ctx.globalAlpha = 1
  dots(ctx, x, y, w, h, rng(x*4+y*8), 'rgba(200,160,60,0.4)', 65, 1, 0.5)
  gloss(ctx, x, y, w, h, t * 0.4, 0.38)
}

function texPayasam(ctx: Ctx, x: number, y: number, w: number, h: number, t: number) {
  const ph = t * 0.0004
  const g = ctx.createRadialGradient(
    x + w/2 + Math.sin(ph)*w*0.25, y + h/2 + Math.cos(ph)*h*0.2, 0, x+w/2, y+h/2, (w+h)*0.55)
  g.addColorStop(0, '#ffe44c'); g.addColorStop(0.5, '#ffd700'); g.addColorStop(1, '#c8a000')
  ctx.fillStyle = g; ctx.fillRect(x-20, y-20, w+40, h+40)
  // Cashew shapes
  const cr = rng(x*7+y*3); ctx.globalAlpha = 0.85
  for (let i = 0; i < 10; i++) {
    ctx.save(); ctx.translate(x + cr()*w, y + cr()*h); ctx.rotate(cr()*Math.PI)
    ctx.fillStyle = '#f5e8c0'
    ctx.beginPath(); ctx.ellipse(0, -2, 3, 5, 0, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  }
  ctx.globalAlpha = 1
  dots(ctx, x, y, w, h, rng(x*5+y*9), '#3a1a05', 15, 2.8, 0.88)
  gloss(ctx, x, y, w, h, t, 0.34)
}

function texMeen(ctx: Ctx, x: number, y: number, w: number, h: number, t: number) {
  grad(ctx, x, y, w, h, '#ff7f50', '#c04810')
  strands(ctx, x, y, w, h, rng(x*6+y*7), '#ffb880', 22, 14, 1.2, 0.5)
  blobs(ctx, x, y, w, h, rng(x*3+y*5), '#e06828', 8, 6, 0.6)
  ripple(ctx, x, y, w, h, t, '#c04000'); gloss(ctx, x, y, w, h, t, 0.22)
}

function texKozhi(ctx: Ctx, x: number, y: number, w: number, h: number, t: number) {
  grad(ctx, x, y, w, h, '#a0522d', '#6b2810')
  strands(ctx, x, y, w, h, rng(x*3+y*9), '#c87840', 28, 18, 1.5, 0.55)
  dots(ctx, x, y, w, h, rng(x*7+y*4), '#3a1505', 22, 2, 0.5)
  gloss(ctx, x, y, w, h, t, 0.18); ripple(ctx, x, y, w, h, t, '#6b2810')
}

function texMuttaAchar(ctx: Ctx, x: number, y: number, w: number, h: number, t: number) {
  grad(ctx, x, y, w, h, '#ffa500', '#c06800')
  blobs(ctx, x, y, w, h, rng(x*4+y*6), 'rgba(255,250,230,0.82)', 10, 6)
  dots(ctx, x, y, w, h, rng(x*8+y*3), '#e8c030', 9, 3.5, 0.82)
  gloss(ctx, x, y, w, h, t, 0.22); ripple(ctx, x, y, w, h, t, '#a05000')
}

function texBeefFry(ctx: Ctx, x: number, y: number, w: number, h: number, t: number) {
  grad(ctx, x, y, w, h, '#3d2817', '#1a0a05')
  strands(ctx, x, y, w, h, rng(x*5+y*8), '#5a3020', 24, 14, 1.8, 0.45)
  dots(ctx, x, y, w, h, rng(x*6+y*2), '#0d0503', 16, 5, 0.4)
  gloss(ctx, x, y, w, h, t, 0.15)
}

function texPrawn(ctx: Ctx, x: number, y: number, w: number, h: number, t: number) {
  grad(ctx, x, y, w, h, '#d9534f', '#8b1a18')
  const r_ = rng(x*7+y*5); ctx.strokeStyle = '#ff9080'; ctx.lineWidth = 2.5; ctx.globalAlpha = 0.72
  for (let i = 0; i < 8; i++) {
    const pr = 6 + r_() * 6
    ctx.beginPath(); ctx.arc(x + r_() * w, y + r_() * h, pr, Math.PI * 0.2, Math.PI * 1.8); ctx.stroke()
  }
  ctx.globalAlpha = 1; ripple(ctx, x, y, w, h, t, '#8b1a18'); gloss(ctx, x, y, w, h, t, 0.24)
}

function texKozhiRoast(ctx: Ctx, x: number, y: number, w: number, h: number, t: number) {
  grad(ctx, x, y, w, h, '#654321', '#3a2010')
  dots(ctx, x, y, w, h, rng(x*4+y*7), '#8b5a28', 26, 3, 0.52)
  strands(ctx, x, y, w, h, rng(x*9+y*3), '#1a0a00', 12, 20, 2, 0.55)
  gloss(ctx, x, y, w, h, t, 0.22)
}

function texKela(ctx: Ctx, x: number, y: number, w: number, h: number, t: number) {
  grad(ctx, x, y, w, h, '#f0ad4e', '#c07820')
  dots(ctx, x, y, w, h, rng(x*5+y*6), '#e08820', 32, 2.5, 0.5)
  const g = ctx.createRadialGradient(x+w/2, y+h/2, Math.min(w,h)*0.25, x+w/2, y+h/2, Math.max(w,h)*0.6)
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(80,40,0,0.35)')
  ctx.fillStyle = g; ctx.fillRect(x-20, y-20, w+40, h+40)
  gloss(ctx, x, y, w, h, t * 0.8, 0.22)
}

function texUpperi(ctx: Ctx, x: number, y: number, w: number, h: number, t: number) {
  grad(ctx, x, y, w, h, '#ffd89b', '#e8a848')
  const r_ = rng(x*6+y*4); ctx.strokeStyle = '#c08020'; ctx.lineWidth = 1; ctx.globalAlpha = 0.3
  for (let i = 0; i < 14; i++) {
    const ly = y + r_() * h
    ctx.beginPath(); ctx.moveTo(x, ly); ctx.lineTo(x + w, ly + (r_()-0.5)*8); ctx.stroke()
  }
  ctx.globalAlpha = 1
  dots(ctx, x, y, w, h, rng(x*3+y*9), 'rgba(160,100,0,0.3)', 28, 1.5)
  gloss(ctx, x, y, w, h, t * 0.6, 0.32)
}

function texGeneric(ctx: Ctx, x: number, y: number, w: number, h: number, color: string, t: number) {
  ctx.fillStyle = color; ctx.globalAlpha = 0.78
  ctx.fillRect(x - 20, y - 20, w + 40, h + 40)
  ctx.globalAlpha = 1; gloss(ctx, x, y, w, h, t, 0.15)
}

function drawDishTexture(
  ctx: Ctx, p2d: Path2D,
  bounds: { minX: number; minY: number; w: number; h: number },
  dish: Dish, t: number
) {
  const { minX: x, minY: y, w, h } = bounds
  if (w < 4 || h < 4) return
  ctx.save(); ctx.clip(p2d)
  switch (dish.id) {
    case 'choru':      texChoru(ctx, x, y, w, h, t);      break
    case 'parippu':    texParippu(ctx, x, y, w, h, t);    break
    case 'sambar':     texSambar(ctx, x, y, w, h, t);     break
    case 'rasam':      texRasam(ctx, x, y, w, h, t);      break
    case 'avial':      texAvial(ctx, x, y, w, h, t);      break
    case 'olan':       texOlan(ctx, x, y, w, h, t);       break
    case 'kaalan':     texKaalan(ctx, x, y, w, h, t);     break
    case 'erissery':   texErissery(ctx, x, y, w, h, t);   break
    case 'puliinji':   texPuliInji(ctx, x, y, w, h, t);   break
    case 'pappadam':   texPappadam(ctx, x, y, w, h, t);   break
    case 'payasam':
    case 'payasamk':   texPayasam(ctx, x, y, w, h, t);    break
    case 'meen':       texMeen(ctx, x, y, w, h, t);       break
    case 'kozhi':      texKozhi(ctx, x, y, w, h, t);      break
    case 'muttaachar': texMuttaAchar(ctx, x, y, w, h, t); break
    case 'beeffry':    texBeefFry(ctx, x, y, w, h, t);    break
    case 'prawn':      texPrawn(ctx, x, y, w, h, t);      break
    case 'kozhiroast': texKozhiRoast(ctx, x, y, w, h, t); break
    case 'kela':       texKela(ctx, x, y, w, h, t);       break
    case 'upperi':     texUpperi(ctx, x, y, w, h, t);     break
    default:           texGeneric(ctx, x, y, w, h, dish.color, t)
  }
  ctx.restore()
  // Dish-colour border
  ctx.save()
  ctx.strokeStyle = dish.color; ctx.lineWidth = 2.5
  ctx.globalAlpha = 0.82; ctx.lineJoin = 'round'
  ctx.stroke(p2d); ctx.restore()
}

// ── Stat metadata ────────────────────────────────────────────────────────────

const STAT_META = [
  { key: 'power'     as const, label: 'Power',    color: '#d4af37', icon: '⚡' },
  { key: 'spice'     as const, label: 'Spice',     color: '#c41e3a', icon: '🌶️' },
  { key: 'crunch'    as const, label: 'Crunch',    color: '#ff8c42', icon: '💥' },
  { key: 'chaos'     as const, label: 'Chaos',     color: '#9b59b6', icon: '🌀' },
  { key: 'sweetness' as const, label: 'Sweetness', color: '#e87040', icon: '✨' },
]

// ── Banana leaf SVG ──────────────────────────────────────────────────────────

function BananaLeafBg() {
  return (
    <svg viewBox="0 0 800 560" className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="lgLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#2d6228" />
          <stop offset="25%"  stopColor="#3d8235" />
          <stop offset="50%"  stopColor="#4a9840" />
          <stop offset="75%"  stopColor="#3d8235" />
          <stop offset="100%" stopColor="#2d5a28" />
        </linearGradient>
        <radialGradient id="lgSheen" cx="35%" cy="30%" r="55%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.13)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>
      <ellipse cx="400" cy="280" rx="388" ry="266" fill="url(#lgLeaf)" />
      <ellipse cx="400" cy="280" rx="388" ry="266" fill="url(#lgSheen)" />
      <line x1="12" y1="280" x2="788" y2="280" stroke="rgba(255,255,255,0.22)" strokeWidth="4" strokeLinecap="round" />
      {Array.from({ length: 22 }, (_, i) => {
        const sx = 20 + i * 36
        return (
          <g key={i}>
            <line x1={sx} y1="280" x2={Math.max(5, sx-55)} y2="200" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" strokeLinecap="round" />
            <line x1={sx} y1="280" x2={Math.max(5, sx-55)} y2="360" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        )
      })}
      <ellipse cx="400" cy="280" rx="388" ry="266" fill="none" stroke="rgba(0,50,0,0.3)" strokeWidth="6" />
    </svg>
  )
}

// ── Tooltip ──────────────────────────────────────────────────────────────────

interface TooltipState { dish: Dish; x: number; y: number }

function DishTooltip({ dish, x, y }: TooltipState) {
  return (
    <div style={{
      position: 'fixed', left: x, top: y, zIndex: 9999, pointerEvents: 'none', width: 200,
      background: 'rgba(6,8,10,0.96)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12, padding: '12px 14px',
      boxShadow: '0 16px 40px rgba(0,0,0,0.7)', backdropFilter: 'blur(16px)', fontFamily: FONT,
    }}>
      <p style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, fontSize: '0.85rem', marginBottom: 2 }}>{dish.name}</p>
      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', marginBottom: 10 }}>{dish.personality}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {STAT_META.map(m => {
          const val = dish.stats[m.key] ?? 0
          if (!val) return null
          return (
            <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.72rem', width: 16 }}>{m.icon}</span>
              <span style={{ color: 'rgba(255,255,255,0.42)', fontSize: '0.7rem', flex: 1 }}>{m.label}</span>
              <span style={{ color: m.color, fontWeight: 600, fontSize: '0.75rem' }}>+{val}</span>
            </div>
          )
        })}
      </div>
      <p style={{ color: 'rgba(255,255,255,0.22)', fontSize: '0.65rem', marginTop: 8, fontStyle: 'italic', lineHeight: 1.4 }}>
        {dish.funFact}
      </p>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export default function BuilderPage({ mode, onFinalize, onBack }: BuilderPageProps) {
  const dishes  = mode === 'normal' ? normalDishes : kannurDishes
  const isKannur = mode === 'kannur'

  const [selectedDish, setSelectedDish]   = useState<Dish>(dishes[0])
  const [drawnPortions, setDrawnPortions] = useState<DrawnPortion[]>([])
  const [stats, setStats]                 = useState<Stats>({ ...EMPTY_STATS })
  const [maveliState, setMaveliState]     = useState<'idle' | 'happy' | 'excited' | 'thinking'>('idle')
  const [reactionText, setReactionText]   = useState('')
  const [tooltip, setTooltip]             = useState<TooltipState | null>(null)
  const [labels, setLabels]               = useState<{ id: string; text: string; x: number; y: number; color: string }[]>([])

  const canvasRef           = useRef<HTMLCanvasElement>(null)
  const canvasContainerRef  = useRef<HTMLDivElement>(null)
  const isDrawingRef        = useRef(false)
  const currentPathRef      = useRef<{ x: number; y: number }[]>([])
  const portionsRef         = useRef<DrawnPortion[]>([])
  const selectedDishRef     = useRef<Dish>(dishes[0])
  const reactionTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reactionSounds      = useRef<HTMLAudioElement[]>([])
  const reactionIdx         = useRef(0)
  const bgmRef              = useRef<HTMLAudioElement | null>(null)
  const rafIdRef            = useRef<number>(0)

  // Keep selectedDishRef in sync for the RAF closure
  useEffect(() => { selectedDishRef.current = selectedDish }, [selectedDish])

  // Canvas size
  useEffect(() => {
    const canvas = canvasRef.current, container = canvasContainerRef.current
    if (!canvas || !container) return
    const raf = requestAnimationFrame(() => {
      if (container.clientWidth > 0) {
        canvas.width = container.clientWidth; canvas.height = container.clientHeight
      }
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  // Mode BGM
  useEffect(() => {
    const audio = new Audio(isKannur ? kannurBgm : onamBgm)
    audio.loop = true; audio.volume = 0.55
    audio.play().catch(() => {})
    bgmRef.current = audio
    return () => { audio.pause(); audio.src = ''; bgmRef.current = null }
  }, [mode])

  // Reaction sounds
  useEffect(() => {
    reactionSounds.current = [1,2,3].map(n => {
      const a = new Audio(`/audio/reaction-${mode}-${n}.mp3`)
      a.volume = 0.7; return a
    })
  }, [mode])

  // RAF animation loop
  useEffect(() => {
    const animate = (t: number) => {
      const canvas = canvasRef.current
      if (canvas && canvas.width > 0) {
        const ctx = canvas.getContext('2d')!
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        portionsRef.current.forEach(portion => {
          if (portion.path.length < 3) return
          const bounds = getBounds(portion.path)
          drawDishTexture(ctx, buildPath2D(portion.path), bounds, portion.dish, t)
        })
        // Draw in-progress stroke
        const cp = currentPathRef.current
        if (isDrawingRef.current && cp.length > 1) {
          ctx.save()
          ctx.strokeStyle = selectedDishRef.current.color
          ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalAlpha = 0.65
          ctx.beginPath(); ctx.moveTo(cp[0].x, cp[0].y)
          for (let i = 1; i < cp.length; i++) ctx.lineTo(cp[i].x, cp[i].y)
          ctx.stroke(); ctx.restore()
        }
      }
      rafIdRef.current = requestAnimationFrame(animate)
    }
    rafIdRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafIdRef.current)
  }, [])

  const playReactionSound = () => {
    const s = reactionSounds.current
    if (!s.length) return
    const a = s[reactionIdx.current % s.length]
    a.currentTime = 0; a.play().catch(() => {})
    reactionIdx.current++
  }

  const getCanvasPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top)  * (canvas.height / rect.height),
    }
  }

  const triggerReaction = useCallback((dish: Dish, factor: number) => {
    const pool = isKannur ? MAVELI_REACTIONS_KANNUR : MAVELI_REACTIONS_NORMAL
    setReactionText(pool[Math.floor(Math.random() * pool.length)])
    setMaveliState(factor > 0.6 ? 'excited' : 'happy')
    playReactionSound()
    if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current)
    reactionTimerRef.current = setTimeout(() => { setMaveliState('idle'); setReactionText('') }, 2000)
  }, [isKannur])

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    isDrawingRef.current = true
    currentPathRef.current = [getCanvasPos(e)]
  }

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return
    currentPathRef.current.push(getCanvasPos(e))
  }

  const onPointerUp = () => {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false
    const path = currentPathRef.current
    if (path.length < 5) { currentPathRef.current = []; return }

    const canvas = canvasRef.current!
    const area   = shoelaceArea(path)
    const factor = Math.min(1, Math.max(0.15, area / (canvas.width * canvas.height * 0.28)))
    const center = centroid(path)

    const portion: DrawnPortion = {
      id: Date.now().toString(), dish: selectedDish,
      path, portionFactor: factor, centroid: center,
    }
    portionsRef.current = [...portionsRef.current, portion]
    setDrawnPortions([...portionsRef.current])

    const rect = canvas.getBoundingClientRect()
    const sizeLabel = factor >= 0.65 ? 'Large' : factor >= 0.38 ? 'Medium' : 'Small'
    setLabels(prev => [...prev, {
      id: portion.id, text: `${selectedDish.name} · ${sizeLabel}`,
      x: center.x * (rect.width / canvas.width),
      y: center.y * (rect.height / canvas.height),
      color: selectedDish.color,
    }])

    const d = selectedDish.stats
    setStats(prev => ({
      power:     prev.power     + Math.round((d.power     ?? 0) * factor),
      spice:     prev.spice     + Math.round((d.spice     ?? 0) * factor),
      crunch:    prev.crunch    + Math.round((d.crunch    ?? 0) * factor),
      chaos:     prev.chaos     + Math.round((d.chaos     ?? 0) * factor),
      sweetness: prev.sweetness + Math.round((d.sweetness ?? 0) * factor),
    }))

    triggerReaction(selectedDish, factor)
    currentPathRef.current = []
  }

  const handleClear = () => {
    portionsRef.current = []
    setDrawnPortions([]); setStats({ ...EMPTY_STATS }); setLabels([])
    currentPathRef.current = []
    setMaveliState('thinking'); setReactionText('Starting fresh?')
    if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current)
    reactionTimerRef.current = setTimeout(() => { setMaveliState('idle'); setReactionText('') }, 1500)
  }

  const handleFinalize = () => {
    if (drawnPortions.length === 0) {
      setReactionText('Add something first!'); setMaveliState('thinking')
      if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current)
      reactionTimerRef.current = setTimeout(() => { setMaveliState('idle'); setReactionText('') }, 1500)
      return
    }
    if (bgmRef.current) { bgmRef.current.pause(); bgmRef.current = null }
    const hmm = new Audio(hmmSound); hmm.volume = 1; hmm.play().catch(() => {})
    cancelAnimationFrame(rafIdRef.current)
    setMaveliState('excited')
    const snapshot = canvasRef.current!.toDataURL('image/png')
    setTimeout(() => onFinalize(snapshot, stats, drawnPortions), 1500)
  }

  const barPct = (val: number) => Math.min(100, val)

  return (
    <div className="page-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#05080a', fontFamily: FONT }}>
      {tooltip && <DishTooltip {...tooltip} />}

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.055)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{ height: 34, padding: '0 14px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', fontSize: '0.78rem', fontFamily: FONT, transition: 'color 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.9)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)' }}>
            ← Back
          </button>
          <span style={{ fontFamily: FONT, fontWeight: 300, fontSize: '0.8rem', color: 'rgba(255,255,255,0.28)' }}>
            Sadhya ഉണ്ടāക്കāം?
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: '0.72rem' }}>
            {drawnPortions.length} portion{drawnPortions.length !== 1 ? 's' : ''}
          </span>
          <span style={{ height: 26, padding: '0 12px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', border: isKannur ? '1px solid rgba(196,30,58,0.3)' : '1px solid rgba(82,165,82,0.3)', color: isKannur ? 'rgba(255,120,120,0.8)' : 'rgba(100,210,100,0.8)', fontSize: '0.68rem', fontWeight: 500, fontFamily: FONT }}>
            {isKannur ? '🌶️ Kannur' : '🌿 Normal'}
          </span>
        </div>
      </div>

      {/* Main area */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, flexWrap: 'wrap' }}>

        {/* Canvas area */}
        <div style={{ flex: '1 1 400px', position: 'relative', background: '#080d09', minHeight: 400 }}>
          <div style={{ position: 'absolute', inset: 12, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div ref={canvasContainerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
              <BananaLeafBg />
              <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'crosshair', touchAction: 'none' }}
                onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp} />

              {labels.map(lbl => (
                <div key={lbl.id} style={{ position: 'absolute', left: lbl.x, top: lbl.y, transform: 'translate(-50%, -50%)', pointerEvents: 'none', userSelect: 'none' }}>
                  <span style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)', border: `1px solid ${lbl.color}55`, color: lbl.color, fontSize: '0.6rem', fontWeight: 500, fontFamily: FONT, padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                    {lbl.text}
                  </span>
                </div>
              ))}

              {drawnPortions.length === 0 && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: '2rem', opacity: 0.4 }}>✏️</span>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', fontWeight: 300, fontFamily: FONT }}>Select a dish · draw on the leaf</p>
                  <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.72rem', fontFamily: FONT }}>Bigger area = bigger portion</p>
                </div>
              )}
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', border: `1px solid ${selectedDish.color}44`, whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: '1rem' }}>{selectedDish.emoji}</span>
            <span style={{ color: selectedDish.color, fontWeight: 500, fontSize: '0.82rem', fontFamily: FONT }}>{selectedDish.name}</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.68rem', fontFamily: FONT }}>draw!</span>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ width: 284, flexShrink: 0, flex: '0 0 284px', display: 'flex', flexDirection: 'column', background: '#060a0c', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>

          <div style={{ padding: '12px 16px 6px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: FONT }}>Dish</p>
          </div>

          <div style={{ overflowY: 'auto', maxHeight: '42vh', padding: '6px 10px' }}>
            {dishes.map(dish => (
              <button key={dish.id} onClick={() => setSelectedDish(dish)}
                onMouseEnter={e => { const r = e.currentTarget.getBoundingClientRect(); setTooltip({ dish, x: r.right + 10, y: r.top }) }}
                onMouseLeave={() => setTooltip(null)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 10px', borderRadius: 10, marginBottom: 2, background: selectedDish.id === dish.id ? `${dish.color}12` : 'transparent', border: `1px solid ${selectedDish.id === dish.id ? dish.color + '40' : 'rgba(255,255,255,0.045)'}`, cursor: 'pointer', textAlign: 'left', transition: 'all 0.14s ease', fontFamily: FONT }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: dish.imageUrl ? `url(${dish.imageUrl}) center/cover, ${dish.color}` : dish.color, flexShrink: 0, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: selectedDish.id === dish.id ? `0 0 8px ${dish.color}44` : 'none' }}>
                  {!dish.imageUrl && dish.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: selectedDish.id === dish.id ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)', fontWeight: selectedDish.id === dish.id ? 500 : 400, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dish.name}</p>
                  <p style={{ color: 'rgba(255,255,255,0.22)', fontSize: '0.67rem' }}>{dish.subtitle}</p>
                </div>
                {selectedDish.id === dish.id && <div style={{ width: 6, height: 6, borderRadius: '50%', background: dish.color, flexShrink: 0 }} />}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10, fontFamily: FONT }}>Stats</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {STAT_META.map(m => {
                const val = stats[m.key], pct = barPct(val)
                return (
                  <div key={m.key}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: 5, fontFamily: FONT }}><span>{m.icon}</span><span>{m.label}</span></span>
                      <span style={{ color: m.color, fontWeight: 500, fontSize: '0.72rem', fontVariantNumeric: 'tabular-nums' }}>{val}</span>
                    </div>
                    <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 999, overflow: 'hidden' }}>
                      <div className="stat-bar-fill" style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${m.color}66, ${m.color})`, borderRadius: 999 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Maveli */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
            <MaveliCharacter state={maveliState} size={46} />
            <div style={{ flex: 1 }}>
              {reactionText ? (
                <div className="animate-fade-in" style={{ padding: '7px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontFamily: FONT }}>{reactionText}</div>
              ) : (
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.72rem', fontFamily: FONT }}>{drawnPortions.length === 0 ? 'Draw on the leaf!' : `${drawnPortions.length} portion${drawnPortions.length > 1 ? 's' : ''} added`}</p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ padding: '8px 14px 18px', display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
            <button onClick={handleFinalize}
              style={{ height: 48, borderRadius: 999, fontWeight: 500, fontSize: '0.88rem', letterSpacing: '0.02em', border: 'none', cursor: 'pointer', fontFamily: FONT, background: isKannur ? 'rgba(196,30,58,0.9)' : 'rgba(255,255,255,0.92)', color: isKannur ? '#fff' : '#060a0c', boxShadow: isKannur ? '0 4px 20px rgba(196,30,58,0.3)' : '0 4px 20px rgba(255,255,255,0.1)', transition: 'transform 0.15s ease, opacity 0.15s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.opacity = '0.9' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1' }}>
              {isKannur ? '🔥 Finalize Sadhya' : 'Finalize Sadhya →'}
            </button>
            <button onClick={handleClear}
              style={{ height: 38, borderRadius: 999, fontWeight: 400, fontSize: '0.78rem', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.32)', cursor: 'pointer', fontFamily: FONT, transition: 'color 0.15s, border-color 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.32)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}>
              Clear leaf
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
