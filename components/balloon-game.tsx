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
    isCrashed: false,
    maxAltitude: 0,
    flightTime: 0,
  }
}

function generateClouds(): Cloud[] {
  return Array.from({ length: 8 }, (_, i) => ({
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
  const keysRef = useRef<Set<string>>(new Set())
  const stateRef = useRef(state)
  stateRef.current = state

  const clouds = useMemo(() => generateClouds(), [])
  const stars = useMemo(() => generateStars(), [])

  const handleBurnerChange = useCallback((value: number) => {
    setState((s) => ({ ...s, burnerPower: value }))
  }, [])

  const handleAddSandbag = useCallback(() => {
    setState((s) =>
      s.sandbags < s.maxSandbags ? { ...s, sandbags: s.sandbags + 1 } : s
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
      if (e.key.toLowerCase() === "d") {
        setState((s) =>
          s.sandbags > 0 && !s.isCrashed
            ? { ...s, sandbags: s.sandbags - 1 }
            : s
        )
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
        if (prev.isCrashed) return prev

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
        } = prev

        // Keyboard burner control
        const keys = keysRef.current
        if (
          (keys.has("w") || keys.has(" ") || keys.has("arrowup")) &&
          fuel > 0
        ) {
          burnerPower = Math.min(100, burnerPower + 3 * dt)
        } else if (!keys.has("w") && !keys.has(" ") && !keys.has("arrowup")) {
          // Only auto-decay if keyboard was controlling it
          // Check if mouse/slider is not being used
          if (burnerPower > 0 && burnerPower === prev.burnerPower) {
            // slider hasn't changed, let keyboard decay
          }
        }

        // Heating
        if (burnerPower > 0 && fuel > 0) {
          airTemperature = Math.min(
            GC.MAX_TEMP,
            airTemperature + GC.BURNER_HEAT_RATE * (burnerPower / 100) * dt
          )
          fuel = Math.max(
            0,
            fuel - GC.FUEL_CONSUMPTION_RATE * (burnerPower / 100) * dt
          )
        }

        // Cooling
        airTemperature = Math.max(
          GC.AMBIENT_TEMP,
          airTemperature - GC.AIR_COOLING_RATE * dt
        )

        // Turn off burner if no fuel
        if (fuel <= 0) {
          burnerPower = 0
        }

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
              isCrashed: true,
              isLanded: true,
              maxAltitude,
              flightTime,
              sandbags,
            }
          }

          velocity = 0
          isLanded = true
        } else {
          isLanded = false
        }

        // Max altitude tracking
        maxAltitude = Math.max(maxAltitude, altitude)

        // Flight time
        if (!isLanded) {
          flightTime += dt / 60
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
          maxAltitude,
          flightTime,
          isCrashed: false,
        }
      })

      setTick((t) => t + 1)
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

      {/* Title */}
      <div className="absolute top-4 right-4">
        <div className="bg-card/85 backdrop-blur-md rounded-xl px-4 py-2 shadow-lg border border-border/50">
          <h1 className="text-sm font-bold text-card-foreground tracking-wide">
            Balloon Simulator
          </h1>
        </div>
      </div>
    </div>
  )
}
