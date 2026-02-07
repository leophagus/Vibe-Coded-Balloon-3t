"use client"

import { useRef, useEffect, useCallback } from "react"
import type { BalloonState, Cloud, Star } from "@/lib/balloon-types"

interface BalloonCanvasProps {
  state: BalloonState
  clouds: Cloud[]
  stars: Star[]
  tick: number
}

function drawSky(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  altitude: number
) {
  const altPct = Math.min(altitude / 8000, 1)

  const r1 = Math.round(135 - altPct * 100)
  const g1 = Math.round(206 - altPct * 150)
  const b1 = Math.round(235 - altPct * 100)

  const r2 = Math.round(200 - altPct * 80)
  const g2 = Math.round(230 - altPct * 100)
  const b2 = Math.round(255 - altPct * 60)

  const gradient = ctx.createLinearGradient(0, 0, 0, h)
  gradient.addColorStop(0, `rgb(${r1},${g1},${b1})`)
  gradient.addColorStop(1, `rgb(${r2},${g2},${b2})`)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, w, h)
}

function drawStars(
  ctx: CanvasRenderingContext2D,
  stars: Star[],
  altitude: number,
  tick: number
) {
  const starOpacity = Math.max(0, (altitude - 3000) / 5000)
  if (starOpacity <= 0) return

  for (const star of stars) {
    const twinkle = Math.sin(tick * 0.05 + star.twinkle) * 0.3 + 0.7
    ctx.beginPath()
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 255, 255, ${starOpacity * twinkle})`
    ctx.fill()
  }
}

function drawClouds(
  ctx: CanvasRenderingContext2D,
  clouds: Cloud[],
  w: number,
  altitude: number,
  tick: number
) {
  const cloudAltMin = 200
  const cloudAltMax = 4000

  if (altitude > cloudAltMax + 500) return

  const cloudOpacity =
    altitude < cloudAltMin
      ? Math.max(0.2, altitude / cloudAltMin)
      : altitude > cloudAltMax
        ? Math.max(0, 1 - (altitude - cloudAltMax) / 500)
        : 1

  for (const cloud of clouds) {
    const cx = ((cloud.x + tick * cloud.speed) % (w + 200)) - 100
    ctx.save()
    ctx.globalAlpha = cloud.opacity * cloudOpacity
    ctx.fillStyle = "#fff"

    // main cloud body
    ctx.beginPath()
    ctx.ellipse(cx, cloud.y, cloud.width, cloud.height, 0, 0, Math.PI * 2)
    ctx.fill()

    // puffs
    ctx.beginPath()
    ctx.ellipse(
      cx - cloud.width * 0.5,
      cloud.y + 5,
      cloud.width * 0.6,
      cloud.height * 0.7,
      0,
      0,
      Math.PI * 2
    )
    ctx.fill()

    ctx.beginPath()
    ctx.ellipse(
      cx + cloud.width * 0.45,
      cloud.y + 3,
      cloud.width * 0.55,
      cloud.height * 0.65,
      0,
      0,
      Math.PI * 2
    )
    ctx.fill()

    ctx.restore()
  }
}

function drawMountains(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  altitude: number
) {
  const groundY = h - 60
  const altOffset = Math.min(altitude * 0.02, groundY - 100)

  // far mountains
  ctx.fillStyle = "#6b8ea3"
  ctx.beginPath()
  ctx.moveTo(0, groundY - 120 + altOffset)
  const farPeaks = [0.1, 0.2, 0.35, 0.5, 0.65, 0.8, 0.95, 1]
  const farHeights = [80, 140, 100, 170, 130, 150, 90, 60]
  for (let i = 0; i < farPeaks.length; i++) {
    ctx.lineTo(w * farPeaks[i], groundY - farHeights[i] + altOffset)
  }
  ctx.lineTo(w, groundY + altOffset)
  ctx.lineTo(0, groundY + altOffset)
  ctx.closePath()
  ctx.fill()

  // near mountains
  ctx.fillStyle = "#4a7c59"
  ctx.beginPath()
  ctx.moveTo(0, groundY - 40 + altOffset)
  const nearPeaks = [0.08, 0.18, 0.3, 0.45, 0.58, 0.72, 0.88, 1]
  const nearHeights = [50, 90, 60, 110, 75, 95, 55, 40]
  for (let i = 0; i < nearPeaks.length; i++) {
    ctx.lineTo(w * nearPeaks[i], groundY - nearHeights[i] + altOffset)
  }
  ctx.lineTo(w, groundY + altOffset)
  ctx.lineTo(0, groundY + altOffset)
  ctx.closePath()
  ctx.fill()
}

function drawGround(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  altitude: number
) {
  const groundY = h - 60
  const altOffset = Math.min(altitude * 0.02, groundY)

  if (groundY + altOffset > h) return

  // grass
  const gradient = ctx.createLinearGradient(0, groundY + altOffset, 0, h)
  gradient.addColorStop(0, "#5a9e3e")
  gradient.addColorStop(1, "#3d7a2a")
  ctx.fillStyle = gradient
  ctx.fillRect(0, groundY + altOffset, w, h - groundY - altOffset)

  // darker line
  ctx.strokeStyle = "#3d6b2a"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, groundY + altOffset)
  ctx.lineTo(w, groundY + altOffset)
  ctx.stroke()
}

function drawBalloon(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: BalloonState,
  tick: number
) {
  const balloonX = w / 2
  const groundY = h - 60
  const altOffset = Math.min(state.altitude * 0.02, groundY - 200)
  const balloonY = Math.max(140, groundY - 120 - altOffset)

  // subtle sway
  const sway = Math.sin(tick * 0.02) * 3

  ctx.save()
  ctx.translate(balloonX + sway, balloonY)

  // ropes
  ctx.strokeStyle = "#5a4a3a"
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(-22, 50)
  ctx.lineTo(-18, 85)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(22, 50)
  ctx.lineTo(18, 85)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(-8, 55)
  ctx.lineTo(-8, 85)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(8, 55)
  ctx.lineTo(8, 85)
  ctx.stroke()

  // basket
  ctx.fillStyle = "#8B6914"
  ctx.strokeStyle = "#6B4F12"
  ctx.lineWidth = 2
  roundRect(ctx, -20, 85, 40, 25, 3)
  ctx.fill()
  ctx.stroke()

  // basket weave lines
  ctx.strokeStyle = "#6B4F12"
  ctx.lineWidth = 0.8
  for (let i = -15; i <= 15; i += 6) {
    ctx.beginPath()
    ctx.moveTo(i, 87)
    ctx.lineTo(i, 108)
    ctx.stroke()
  }
  for (let j = 90; j <= 107; j += 5) {
    ctx.beginPath()
    ctx.moveTo(-18, j)
    ctx.lineTo(18, j)
    ctx.stroke()
  }

  // sandbags hanging from basket
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

    // rope to basket
    ctx.strokeStyle = "#5a4a3a"
    ctx.lineWidth = 0.8
    ctx.beginPath()
    ctx.moveTo(side * 19, 90)
    ctx.lineTo(bagX, bagY - 3)
    ctx.stroke()
  }

  // flame effect when burner is on
  if (state.burnerPower > 0 && state.fuel > 0) {
    const flameHeight = 10 + state.burnerPower * 0.25
    const flicker = Math.sin(tick * 0.3) * 3

    // outer flame glow
    ctx.save()
    ctx.globalAlpha = 0.3
    ctx.fillStyle = "#ff6600"
    ctx.beginPath()
    ctx.ellipse(0, 58, 8 + flicker, flameHeight * 0.8, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    // inner flame
    ctx.fillStyle = "#ff9900"
    ctx.beginPath()
    ctx.moveTo(-4 + flicker * 0.5, 65)
    ctx.quadraticCurveTo(0, 65 - flameHeight, 4 - flicker * 0.5, 65)
    ctx.fill()

    // core
    ctx.fillStyle = "#ffdd44"
    ctx.beginPath()
    ctx.moveTo(-2, 65)
    ctx.quadraticCurveTo(0, 65 - flameHeight * 0.6, 2, 65)
    ctx.fill()
  }

  // envelope (balloon)
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

  // outline
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

  // vertical seams
  ctx.strokeStyle = "rgba(29, 53, 87, 0.3)"
  ctx.lineWidth = 1
  for (const offset of [-25, 0, 25]) {
    ctx.beginPath()
    ctx.moveTo(offset * 0.2, 55)
    ctx.quadraticCurveTo(offset, -30, offset * 0.3, -88)
    ctx.stroke()
  }

  // highlight
  ctx.save()
  ctx.globalAlpha = 0.15
  ctx.fillStyle = "#fff"
  ctx.beginPath()
  ctx.ellipse(-20, -40, 15, 30, -0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // heat shimmer at top
  if (state.airTemperature > 60) {
    const shimmerOpacity = Math.min((state.airTemperature - 60) / 140, 0.2)
    ctx.save()
    ctx.globalAlpha = shimmerOpacity
    ctx.fillStyle = "#ffccaa"
    ctx.beginPath()
    ctx.ellipse(
      0,
      -95 + Math.sin(tick * 0.1) * 3,
      20,
      8,
      0,
      0,
      Math.PI * 2
    )
    ctx.fill()
    ctx.restore()
  }

  ctx.restore()
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
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
    drawSky(ctx, w, h, state.altitude)
    drawStars(ctx, stars, state.altitude, tick)
    drawClouds(ctx, clouds, w, state.altitude, tick)
    drawMountains(ctx, w, h, state.altitude)
    drawGround(ctx, w, h, state.altitude)
    drawBalloon(ctx, w, h, state, tick)
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
