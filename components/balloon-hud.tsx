"use client"

import {
  ArrowUp,
  ArrowDown,
  Thermometer,
  Mountain,
  Timer,
  Gauge,
  Star,
  Trophy,
} from "lucide-react"
import type { BalloonState } from "@/lib/balloon-types"
import { GAME_CONSTANTS as GC } from "@/lib/balloon-types"

interface BalloonHudProps {
  state: BalloonState
  bestScore: number
}

export default function BalloonHud({ state, bestScore }: BalloonHudProps) {
  const speedDir =
    state.velocity > 0.05 ? "up" : state.velocity < -0.05 ? "down" : "stable"
  const speedMs = Math.abs(state.velocity * 50).toFixed(1)
  const altPct = Math.min(state.altitude / GC.SCREEN_MAX_ALTITUDE, 1)

  return (
    <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
      {/* Altitude */}
      <div className="bg-card/85 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg border border-border/50 min-w-[170px]">
        <div className="flex items-center gap-2 mb-1">
          <Mountain className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Altitude
          </span>
        </div>
        <div className="flex items-end gap-1">
          <span className="text-2xl font-bold text-card-foreground tabular-nums">
            {Math.round(state.altitude)}
          </span>
          <span className="text-sm text-muted-foreground mb-0.5">m</span>
        </div>
        {/* Altitude bar */}
        <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-150"
            style={{
              width: `${altPct * 100}%`,
              backgroundColor:
                altPct > 0.85
                  ? "#ef4444"
                  : altPct > 0.65
                    ? "#eab308"
                    : "#3b82f6",
            }}
          />
        </div>
      </div>

      {/* Vertical Speed */}
      <div className="bg-card/85 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg border border-border/50 min-w-[170px]">
        <div className="flex items-center gap-2 mb-1">
          <Gauge className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            V-Speed
          </span>
        </div>
        <div className="flex items-center gap-2">
          {speedDir === "up" && (
            <ArrowUp className="w-4 h-4 text-emerald-500" />
          )}
          {speedDir === "down" && (
            <ArrowDown className="w-4 h-4 text-red-500" />
          )}
          {speedDir === "stable" && (
            <div className="w-4 h-0.5 bg-muted-foreground rounded" />
          )}
          <span
            className={`text-lg font-bold tabular-nums ${
              speedDir === "down"
                ? "text-red-500"
                : speedDir === "up"
                  ? "text-emerald-500"
                  : "text-card-foreground"
            }`}
          >
            {speedMs}
          </span>
          <span className="text-xs text-muted-foreground">m/s</span>
        </div>
      </div>

      {/* Temperature */}
      <div className="bg-card/85 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg border border-border/50 min-w-[170px]">
        <div className="flex items-center gap-2 mb-1">
          <Thermometer className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Air Temp
          </span>
        </div>
        <div className="flex items-end gap-1">
          <span className="text-lg font-bold text-card-foreground tabular-nums">
            {Math.round(state.airTemperature)}
          </span>
          <span className="text-sm text-muted-foreground mb-0.5">
            {"°C"}
          </span>
        </div>
      </div>

      {/* Flight Time */}
      <div className="bg-card/85 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg border border-border/50 min-w-[170px]">
        <div className="flex items-center gap-2 mb-1">
          <Timer className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Flight Time
          </span>
        </div>
        <div className="flex items-end gap-1">
          <span className="text-lg font-bold text-card-foreground tabular-nums">
            {Math.round(state.flightTime)}
          </span>
          <span className="text-sm text-muted-foreground mb-0.5">s</span>
        </div>
      </div>

      {/* Current Score */}
      <div className="bg-card/85 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg border border-border/50 min-w-[170px]">
        <div className="flex items-center gap-2 mb-1">
          <Star className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Score
          </span>
        </div>
        <div className="flex items-end gap-1">
          <span className="text-lg font-bold text-amber-500 tabular-nums">
            {state.score}
          </span>
          <span className="text-sm text-muted-foreground mb-0.5">pts</span>
        </div>
      </div>

      {/* Best Score */}
      <div className="bg-card/85 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg border border-border/50 min-w-[170px]">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Best
          </span>
        </div>
        <div className="flex items-end gap-1">
          <span className="text-lg font-bold text-yellow-500 tabular-nums">
            {Math.max(bestScore, state.score)}
          </span>
          <span className="text-sm text-muted-foreground mb-0.5">pts</span>
        </div>
      </div>
    </div>
  )
}
