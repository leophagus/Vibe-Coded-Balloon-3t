"use client"

import { useRef, useEffect, useCallback } from "react"
import type { BalloonState, Cloud, Star } from "@/lib/balloon-types"
import { GAME_CONSTANTS as GC } from "@/lib/balloon-types"

interface BalloonCanvasProps {
  state: BalloonState
  clouds: Cloud[]
  stars: Star[]
  tick: number
}

/* ── Sky (static gradient) ── */
function drawSky(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const gradient = ctx.createLinearGradient(0, 0, 0, h)
  gradient.addColorStop(0, "rgb(60, 100, 170)")
  gradient.addColorStop(0.5, "rgb(135, 206, 235)")
  gradient.addColorStop(1, "rgb(200, 230, 255)")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, w, h)
}

/* ── Stars (static positions, visible subtly) ── */
function drawStars(
  ctx: CanvasRenderingContext2D,
  stars: Star[],
  tick: number,
) {
  for (const star of stars) {
    const twinkle = Math.sin(tick * 0.05 + star.twinkle) * 0.3 + 0.7
    ctx.beginPath()
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 255, 255, ${0.15 * twinkle})`
    ctx.fill()
  }
}

/* ── Clouds (static Y, drift X) ── */
function drawClouds(
  ctx: CanvasRenderingContext2D,
  clouds: Cloud[],
  w: number,
  tick: number,
) {
  for (const cloud of clouds) {
    const cx = ((cloud.x + tick * cloud.speed) % (w + 200)) - 100
    ctx.save()
    ctx.globalAlpha = cloud.opacity
    ctx.fillStyle = "#fff"
    ctx.beginPath()
    ctx.ellipse(cx, cloud.y, cloud.width, cloud.height, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(cx - cloud.width * 0.5, cloud.y + 5, cloud.width * 0.6, cloud.height * 0.7, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(cx + cloud.width * 0.45, cloud.y + 3, cloud.width * 0.55, cloud.height * 0.65, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

/* ── Mountains (static at bottom) ── */
function drawMountains(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const groundY = h - 60

  ctx.fillStyle = "#6b8ea3"
  ctx.beginPath()
  ctx.moveTo(0, groundY - 120)
  const farPeaks = [0.1, 0.2, 0.35, 0.5, 0.65, 0.8, 0.95, 1]
  const farHeights = [80, 140, 100, 170, 130, 150, 90, 60]
  for (let i = 0; i < farPeaks.length; i++) {
    ctx.lineTo(w * farPeaks[i], groundY - farHeights[i])
  }
  ctx.lineTo(w, groundY)
  ctx.lineTo(0, groundY)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = "#4a7c59"
  ctx.beginPath()
  ctx.moveTo(0, groundY - 40)
  const nearPeaks = [0.08, 0.18, 0.3, 0.45, 0.58, 0.72, 0.88, 1]
  const nearHeights = [50, 90, 60, 110, 75, 95, 55, 40]
  for (let i = 0; i < nearPeaks.length; i++) {
    ctx.lineTo(w * nearPeaks[i], groundY - nearHeights[i])
  }
  ctx.lineTo(w, groundY)
  ctx.lineTo(0, groundY)
  ctx.closePath()
  ctx.fill()
}

/* ── Ground (static at bottom) ── */
function drawGround(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const groundY = h - 60
  const gradient = ctx.createLinearGradient(0, groundY, 0, h)
  gradient.addColorStop(0, "#5a9e3e")
  gradient.addColorStop(1, "#3d7a2a")
  ctx.fillStyle = gradient
  ctx.fillRect(0, groundY, w, 60)

  ctx.strokeStyle = "#3d6b2a"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, groundY)
  ctx.lineTo(w, groundY)
  ctx.stroke()
}

/* ── Balloon (Y position mapped from altitude) ── */
function drawBalloon(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: BalloonState,
  tick: number,
) {
  const groundY = h - 60
  const topMargin = GC.TOP_MARGIN
  const bottomY = groundY - 120 // balloon center when on ground
  const topY = topMargin       // balloon center at max altitude

  // Map altitude [0..SCREEN_MAX_ALTITUDE] → [bottomY..topY]
  const altPct = Math.min(state.altitude / GC.SCREEN_MAX_ALTITUDE, 1)
  const balloonY = bottomY - altPct * (bottomY - topY)

  const balloonX = w * 0.35 // shifted left so controls on right don't overlap
  const sway = Math.sin(tick * 0.02) * 3

  ctx.save()
  ctx.translate(balloonX + sway, balloonY)

  // Ropes
  ctx.strokeStyle = "#5a4a3a"
  ctx.lineWidth = 1.5
  for (const [x1, x2] of [[-22, -18], [22, 18], [-8, -8], [8, 8]]) {
    ctx.beginPath()
    ctx.moveTo(x1, 50)
    ctx.lineTo(x2, 85)
    ctx.stroke()
  }

  // Basket
  ctx.fillStyle = "#8B6914"
  ctx.strokeStyle = "#6B4F12"
  ctx.lineWidth = 2
  roundRect(ctx, -20, 85, 40, 25, 3)
  ctx.fill()
  ctx.stroke()

  // Basket weave
  ctx.strokeStyle = "#6B4F12"
  ctx.lineWidth = 0.8
  for (let i = -15; i <= 15; i += 6) {
    ctx.beginPath(); ctx.moveTo(i, 87); ctx.lineTo(i, 108); ctx.stroke()
  }
  for (let j = 90; j <= 107; j += 5) {
    ctx.beginPath(); ctx.moveTo(-18, j); ctx.lineTo(18, j); ctx.stroke()
  }

  // Sandbags
  for (let i = 0; i < state.sandbags; i++) {
    const side = i % 2 === 0 ? -1 : 1
    const row = Math.floor(i / 2)
    const bagX = side * (24 + row * 4)
    const bagY = 92 + row * 8
    ctx.fillStyle = "#8B7355"
    ctx.strokeStyle = "#5a4a3a"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.ellipse(bagX, bagY, 5, 4, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.strokeStyle = "#5a4a3a"
    ctx.lineWidth = 0.8
    ctx.beginPath()
    ctx.moveTo(side * 19, 90)
    ctx.lineTo(bagX, bagY - 3)
    ctx.stroke()
  }

  // Flame
  if (state.burnerPower > 0 && state.fuel > 0) {
    const flameHeight = 10 + state.burnerPower * 0.25
    const flicker = Math.sin(tick * 0.3) * 3

    ctx.save()
    ctx.globalAlpha = 0.3
    ctx.fillStyle = "#ff6600"
    ctx.beginPath()
    ctx.ellipse(0, 58, 8 + flicker, flameHeight * 0.8, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    ctx.fillStyle = "#ff9900"
    ctx.beginPath()
    ctx.moveTo(-4 + flicker * 0.5, 65)
    ctx.quadraticCurveTo(0, 65 - flameHeight, 4 - flicker * 0.5, 65)
    ctx.fill()

    ctx.fillStyle = "#ffdd44"
    ctx.beginPath()
    ctx.moveTo(-2, 65)
    ctx.quadraticCurveTo(0, 65 - flameHeight * 0.6, 2, 65)
    ctx.fill()
  }

  // Envelope
  const envGrad = ctx.createLinearGradient(-55, -70, 55, 50)
  envGrad.addColorStop(0, "#e63946")
  envGrad.addColorStop(0.3, "#e63946")
  envGrad.addColorStop(0.3, "#f1faee")
  envGrad.addColorStop(0.5, "#f1faee")
  envGrad.addColorStop(0.5, "#457b9d")
  envGrad.addColorStop(0.7, "#457b9d")
  envGrad.addColorStop(0.7, "#f1faee")
  envGrad.addColorStop(1, "#f1faee")

  ctx.fillStyle = envGrad
  ctx.beginPath()
  ctx.moveTo(0, 55)
  ctx.bezierCurveTo(-15, 50, -55, 10, -50, -30)
  ctx.bezierCurveTo(-45, -70, -20, -90, 0, -90)
  ctx.bezierCurveTo(20, -90, 45, -70, 50, -30)
  ctx.bezierCurveTo(55, 10, 15, 50, 0, 55)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = "#1d3557"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, 55)
  ctx.bezierCurveTo(-15, 50, -55, 10, -50, -30)
  ctx.bezierCurveTo(-45, -70, -20, -90, 0, -90)
  ctx.bezierCurveTo(20, -90, 45, -70, 50, -30)
  ctx.bezierCurveTo(55, 10, 15, 50, 0, 55)
  ctx.closePath()
  ctx.stroke()

  // Seams
  ctx.strokeStyle = "rgba(29, 53, 87, 0.3)"
  ctx.lineWidth = 1
  for (const offset of [-25, 0, 25]) {
    ctx.beginPath()
    ctx.moveTo(offset * 0.2, 55)
    ctx.quadraticCurveTo(offset, -30, offset * 0.3, -88)
    ctx.stroke()
  }

  // Highlight
  ctx.save()
  ctx.globalAlpha = 0.15
  ctx.fillStyle = "#fff"
  ctx.beginPath()
  ctx.ellipse(-20, -40, 15, 30, -0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Heat shimmer
  if (state.airTemperature > 60) {
    const shimmerOpacity = Math.min((state.airTemperature - 60) / 140, 0.2)
    ctx.save()
    ctx.globalAlpha = shimmerOpacity
    ctx.fillStyle = "#ffccaa"
    ctx.beginPath()
    ctx.ellipse(0, -95 + Math.sin(tick * 0.1) * 3, 20, 8, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  ctx.restore()
}

/* ── Countdown overlay on the canvas ── */
function drawCountdown(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: BalloonState,
  tick: number,
) {
  if (state.hasLiftedOff || state.gameOver) return

  const seconds = Math.ceil(state.countdown)
  const urgencyPct = 1 - state.countdown / GC.COUNTDOWN_SECONDS

  // Position it in the upper-center-left area (not overlapping right panel)
  const cx = w * 0.35
  const cy = 50

  // Pulsing effect when urgent
  const pulse = state.countdown < 10 ? Math.sin(tick * 0.15) * 0.15 + 0.85 : 1
  const fontSize = 38 * pulse

  // Background pill
  const pillW = 200
  const pillH = 54
  ctx.save()
  ctx.globalAlpha = 0.8
  ctx.fillStyle = urgencyPct > 0.7 ? "#991b1b" : urgencyPct > 0.4 ? "#92400e" : "#1e3a5f"
  roundRect(ctx, cx - pillW / 2, cy - pillH / 2, pillW, pillH, 14)
  ctx.fill()
  ctx.restore()

  // Label
  ctx.fillStyle = "rgba(255,255,255,0.7)"
  ctx.font = "bold 11px sans-serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("LAUNCH IN", cx, cy - 14)

  // Timer
  ctx.fillStyle =
    urgencyPct > 0.7 ? "#fca5a5" : urgencyPct > 0.4 ? "#fcd34d" : "#bfdbfe"
  ctx.font = `bold ${fontSize}px monospace`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(`${seconds}s`, cx, cy + 10)

  // Progress bar
  const barW = pillW - 24
  const barH = 4
  const barX = cx - barW / 2
  const barY = cy + pillH / 2 - 10
  ctx.fillStyle = "rgba(255,255,255,0.2)"
  roundRect(ctx, barX, barY, barW, barH, 2)
  ctx.fill()
  ctx.fillStyle =
    urgencyPct > 0.7 ? "#ef4444" : urgencyPct > 0.4 ? "#f59e0b" : "#60a5fa"
  roundRect(ctx, barX, barY, barW * (1 - urgencyPct), barH, 2)
  ctx.fill()
}

/* ── Danger zone edge warnings ── */
function drawEdgeWarnings(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: BalloonState,
) {
  if (state.gameOver) return
  const altPct = state.altitude / GC.SCREEN_MAX_ALTITUDE

  // Top warning
  if (altPct > 0.75) {
    const warningAlpha = Math.min((altPct - 0.75) / 0.25, 0.5)
    const grad = ctx.createLinearGradient(0, 0, 0, 80)
    grad.addColorStop(0, `rgba(239, 68, 68, ${warningAlpha})`)
    grad.addColorStop(1, "rgba(239, 68, 68, 0)")
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, 80)
  }

  // Bottom warning (near ground with high descent speed)
  if (state.altitude < 60 && state.velocity < -0.3) {
    const warningAlpha = Math.min(Math.abs(state.velocity) / 1.5, 0.5)
    const grad = ctx.createLinearGradient(0, h, 0, h - 80)
    grad.addColorStop(0, `rgba(239, 68, 68, ${warningAlpha})`)
    grad.addColorStop(1, "rgba(239, 68, 68, 0)")
    ctx.fillStyle = grad
    ctx.fillRect(0, h - 80, w, 80)
  }
}

/* ── Helpers ── */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

/* ── Main Component ── */
export default function BalloonCanvas({
  state,
  clouds,
  stars,
  tick,
}: BalloonCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height

    ctx.clearRect(0, 0, w, h)
    drawSky(ctx, w, h)
    drawStars(ctx, stars, tick)
    drawClouds(ctx, clouds, w, tick)
    drawMountains(ctx, w, h)
    drawGround(ctx, w, h)
    drawBalloon(ctx, w, h, state, tick)
    drawEdgeWarnings(ctx, w, h, state)
    drawCountdown(ctx, w, h, state, tick)
  }, [state, clouds, stars, tick])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
      draw()
    }

    resize()
    window.addEventListener("resize", resize)
    return () => window.removeEventListener("resize", resize)
  }, [draw])

  useEffect(() => {
    draw()
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-label="Hot air balloon game view"
    />
  )
}
