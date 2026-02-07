"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import BalloonCanvas from "./balloon-canvas"
import BalloonControls from "./balloon-controls"
import BalloonHud from "./balloon-hud"
import {
  GAME_CONSTANTS as GC,
  type BalloonState,
  type Cloud,
  type Star,
  type ScorePopup,
} from "@/lib/balloon-types"

function createInitialState(): BalloonState {
  return {
    altitude: 0,
    velocity: 0,
    airTemperature: GC.AMBIENT_TEMP,
    burnerPower: 0,
    fuel: GC.MAX_FUEL,
    sandbags: 4,
    maxSandbags: 6,
    isLanded: true,
    gameOver: false,
    gameOverReason: null,
    maxAltitude: 0,
    flightTime: 0,
    countdown: GC.COUNTDOWN_SECONDS,
    hasLiftedOff: false,
    score: 0,
    flightScoreAccum: 0,
    wasAboveMountainLine: false,
    wasAboveMiddleLine: false,
    scorePopups: [],
  }
}

function generateClouds(): Cloud[] {
  return Array.from({ length: 8 }, () => ({
    x: Math.random() * 800,
    y: 80 + Math.random() * 250,
    width: 40 + Math.random() * 60,
    height: 15 + Math.random() * 20,
    speed: 0.1 + Math.random() * 0.3,
    opacity: 0.4 + Math.random() * 0.4,
  }))
}

function generateStars(): Star[] {
  return Array.from({ length: 60 }, () => ({
    x: Math.random() * 800,
    y: Math.random() * 300,
    size: 0.5 + Math.random() * 1.5,
    twinkle: Math.random() * Math.PI * 2,
  }))
}

export default function BalloonGame() {
  const [state, setState] = useState<BalloonState>(createInitialState)
  const [tick, setTick] = useState(0)
  const tickRef = useRef(0)
  const keysRef = useRef<Set<string>>(new Set())

  const clouds = useMemo(() => generateClouds(), [])
  const stars = useMemo(() => generateStars(), [])

  const handleBurnerChange = useCallback((value: number) => {
    setState((s) => ({ ...s, burnerPower: value }))
  }, [])

  const handleAddSandbag = useCallback(() => {
    setState((s) =>
      s.sandbags < s.maxSandbags ? { ...s, sandbags: s.sandbags + 1 } : s,
    )
  }, [])

  const handleDropSandbag = useCallback(() => {
    setState((s) => (s.sandbags > 0 ? { ...s, sandbags: s.sandbags - 1 } : s))
  }, [])

  const handleReset = useCallback(() => {
    setState(createInitialState())
  }, [])

  // Keyboard input
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase())
      const key = e.key.toLowerCase()
      if (key === "d") {
        setState((s) =>
          s.sandbags > 0 && !s.gameOver
            ? { ...s, sandbags: s.sandbags - 1 }
            : s,
        )
      }
      if (key === "r") {
        setState((s) => (s.gameOver ? createInitialState() : s))
      }
    }
    const onUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase())
    }
    window.addEventListener("keydown", onDown)
    window.addEventListener("keyup", onUp)
    return () => {
      window.removeEventListener("keydown", onDown)
      window.removeEventListener("keyup", onUp)
    }
  }, [])

  // Game loop
  useEffect(() => {
    let animId: number
    let lastTime = performance.now()

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.67, 3)
      lastTime = time

      setState((prev) => {
        if (prev.gameOver) return prev

        let {
          altitude,
          velocity,
          airTemperature,
          burnerPower,
          fuel,
          sandbags,
          maxAltitude,
          flightTime,
          isLanded,
          countdown,
          hasLiftedOff,
          score,
          flightScoreAccum,
          wasAboveMountainLine,
          wasAboveMiddleLine,
          scorePopups,
        } = prev

        // Countdown timer (only before first liftoff)
        if (!hasLiftedOff) {
          countdown -= dt / 60 // dt is in ~frames, 60 frames/sec
          if (countdown <= 0) {
            return {
              ...prev,
              countdown: 0,
              gameOver: true,
              gameOverReason: "timeout",
            }
          }
        }

        // Keyboard burner control
        const keys = keysRef.current
        if (
          (keys.has("w") || keys.has(" ") || keys.has("arrowup")) &&
          fuel > 0
        ) {
          burnerPower = Math.min(100, burnerPower + 3 * dt)
        }

        // Heating
        if (burnerPower > 0 && fuel > 0) {
          airTemperature = Math.min(
            GC.MAX_TEMP,
            airTemperature + GC.BURNER_HEAT_RATE * (burnerPower / 100) * dt,
          )
          fuel = Math.max(
            0,
            fuel - GC.FUEL_CONSUMPTION_RATE * (burnerPower / 100) * dt,
          )
        }

        // Cooling
        airTemperature = Math.max(
          GC.AMBIENT_TEMP,
          airTemperature - GC.AIR_COOLING_RATE * dt,
        )

        // Turn off burner if no fuel
        if (fuel <= 0) burnerPower = 0

        // Buoyancy
        const tempDiff = airTemperature - GC.AMBIENT_TEMP
        const buoyancy = tempDiff * GC.BUOYANCY_FACTOR * dt

        // Weight from sandbags
        const weight = sandbags * GC.SANDBAG_WEIGHT * dt

        // Gravity
        const gravity = GC.GRAVITY * dt

        // Net force
        velocity += buoyancy - gravity - weight

        // Air drag
        velocity *= Math.pow(GC.DRAG, dt)

        // Update altitude
        altitude += velocity * dt

        // Check if balloon escaped the top of the screen
        if (altitude >= GC.SCREEN_MAX_ALTITUDE) {
          return {
            ...prev,
            altitude: GC.SCREEN_MAX_ALTITUDE,
            velocity: 0,
            airTemperature,
            burnerPower: 0,
            fuel,
            sandbags,
            gameOver: true,
            gameOverReason: "too_high",
            isLanded: false,
            maxAltitude: Math.max(maxAltitude, GC.SCREEN_MAX_ALTITUDE),
            flightTime,
            countdown,
            hasLiftedOff: true,
            score,
            flightScoreAccum,
            wasAboveMountainLine,
            wasAboveMiddleLine,
            scorePopups,
          }
        }

        // Ground collision
        if (altitude <= GC.GROUND_LEVEL) {
          altitude = GC.GROUND_LEVEL
          const wasFlying = !isLanded

          if (wasFlying && Math.abs(velocity) > GC.SAFE_LANDING_SPEED) {
            return {
              ...prev,
              altitude: 0,
              velocity: 0,
              airTemperature,
              burnerPower: 0,
              fuel,
              sandbags,
              gameOver: true,
              gameOverReason: "crash",
              isLanded: true,
              maxAltitude,
              flightTime,
              countdown,
              hasLiftedOff,
              score,
              flightScoreAccum,
              wasAboveMountainLine,
              wasAboveMiddleLine,
              scorePopups,
            }
          }

          velocity = 0
          isLanded = true
        } else {
          isLanded = false
          if (!hasLiftedOff) hasLiftedOff = true
        }

        maxAltitude = Math.max(maxAltitude, altitude)

        if (!isLanded) flightTime += dt / 60

        // ── Scoring ──
        const currentTick = tickRef.current
        const newPopups: ScorePopup[] = []

        // Expire old popups (older than ~90 ticks ≈ 1.5s)
        scorePopups = scorePopups.filter(
          (p) => currentTick - p.tick < 90,
        )

        // 1) Time-based scoring: +1 every 5 seconds of flight
        if (!isLanded) {
          flightScoreAccum += dt / 60
          if (flightScoreAccum >= GC.TIME_SCORE_INTERVAL) {
            flightScoreAccum -= GC.TIME_SCORE_INTERVAL
            score += GC.TIME_SCORE_POINTS
            newPopups.push({ text: `+${GC.TIME_SCORE_POINTS}`, tick: currentTick })
          }
        }

        // 2) Mountain-peak line crossing
        const isAboveMountain = altitude >= GC.MOUNTAIN_LINE_ALTITUDE
        if (isAboveMountain !== wasAboveMountainLine && hasLiftedOff) {
          score += GC.MOUNTAIN_CROSS_SCORE
          newPopups.push({
            text: `+${GC.MOUNTAIN_CROSS_SCORE} Peak!`,
            tick: currentTick,
          })
          wasAboveMountainLine = isAboveMountain
        }

        // 3) Middle line crossing
        const isAboveMiddle = altitude >= GC.MIDDLE_LINE_ALTITUDE
        if (isAboveMiddle !== wasAboveMiddleLine && hasLiftedOff) {
          score += GC.MIDDLE_CROSS_SCORE
          newPopups.push({
            text: `+${GC.MIDDLE_CROSS_SCORE} Mid!`,
            tick: currentTick,
          })
          wasAboveMiddleLine = isAboveMiddle
        }

        if (newPopups.length > 0) {
          scorePopups = [...scorePopups, ...newPopups]
        }

        return {
          ...prev,
          altitude,
          velocity,
          airTemperature,
          burnerPower,
          fuel,
          sandbags,
          isLanded,
          gameOver: false,
          gameOverReason: null,
          maxAltitude,
          flightTime,
          countdown,
          hasLiftedOff,
          score,
          flightScoreAccum,
          wasAboveMountainLine,
          wasAboveMiddleLine,
          scorePopups,
        }
      })

      tickRef.current += 1
      setTick(tickRef.current)
      animId = requestAnimationFrame(loop)
    }

    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <div className="relative w-full h-screen overflow-hidden select-none">
      <BalloonCanvas state={state} clouds={clouds} stars={stars} tick={tick} />
      <BalloonHud state={state} />
      <BalloonControls
        state={state}
        onBurnerChange={handleBurnerChange}
        onAddSandbag={handleAddSandbag}
        onDropSandbag={handleDropSandbag}
        onReset={handleReset}
      />
    </div>
  )
}
