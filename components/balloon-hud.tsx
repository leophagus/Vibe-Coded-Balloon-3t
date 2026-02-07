"use client"

import {
  ArrowUp,
  ArrowDown,
  Thermometer,
  Mountain,
  Timer,
  Gauge,
} from "lucide-react"
import type { BalloonState } from "@/lib/balloon-types"

interface BalloonHudProps {
  state: BalloonState
}

export default function BalloonHud({ state }: BalloonHudProps) {
  const speedDir = state.velocity > 0.05 ? "up" : state.velocity < -0.05 ? "down" : "stable"
  const speedMs = Math.abs(state.velocity * 50).toFixed(1)

  return (
    <div className="absolute top-4 left-4 flex flex-col gap-2">
      {/* Altitude */}
      <div className="bg-card/85 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg border border-border/50 min-w-[180px]">
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
      </div>

      {/* Vertical Speed */}
      <div className="bg-card/85 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg border border-border/50 min-w-[180px]">
        <div className="flex items-center gap-2 mb-1">
          <Gauge className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            V-Speed
          </span>
        </div>
        <div className="flex items-center gap-2">
          {speedDir === "up" && <ArrowUp className="w-4 h-4 text-emerald-500" />}
          {speedDir === "down" && <ArrowDown className="w-4 h-4 text-red-500" />}
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
      <div className="bg-card/85 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg border border-border/50 min-w-[180px]">
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
      <div className="bg-card/85 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg border border-border/50 min-w-[180px]">
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
    </div>
  )
}
