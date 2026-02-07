"use client"

import { Flame, Weight, ArrowUp, ArrowDown } from "lucide-react"
import type { BalloonState } from "@/lib/balloon-types"

interface BalloonControlsProps {
  state: BalloonState
  onBurnerChange: (value: number) => void
  onAddSandbag: () => void
  onDropSandbag: () => void
  onReset: () => void
}

export default function BalloonControls({
  state,
  onBurnerChange,
  onAddSandbag,
  onDropSandbag,
  onReset,
}: BalloonControlsProps) {
  const burnerPercent = Math.round(state.burnerPower)

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 w-full max-w-md px-4">
      {/* Game Over Overlay */}
      {state.isCrashed && (
        <div className="bg-red-900/90 text-white rounded-xl px-6 py-4 text-center backdrop-blur-sm">
          <p className="text-lg font-bold">Crash Landing!</p>
          <p className="text-sm opacity-80 mt-1">
            {"You descended too fast. Max altitude: "}
            {Math.round(state.maxAltitude)}m
          </p>
          <button
            onClick={onReset}
            className="mt-3 bg-white text-red-900 font-semibold px-5 py-2 rounded-lg hover:bg-red-100 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {state.isLanded && !state.isCrashed && state.maxAltitude > 10 && (
        <div className="bg-emerald-800/90 text-white rounded-xl px-6 py-4 text-center backdrop-blur-sm">
          <p className="text-lg font-bold">Safe Landing!</p>
          <p className="text-sm opacity-80 mt-1">
            {"Max altitude: "}
            {Math.round(state.maxAltitude)}
            {"m | Flight time: "}
            {Math.round(state.flightTime)}s
          </p>
          <button
            onClick={onReset}
            className="mt-3 bg-white text-emerald-900 font-semibold px-5 py-2 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            Fly Again
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="bg-card/90 backdrop-blur-md rounded-2xl p-4 w-full shadow-lg border border-border/50">
        <div className="flex items-center gap-4">
          {/* Burner Control */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Flame
                className={`w-5 h-5 transition-colors ${
                  state.burnerPower > 0 && state.fuel > 0
                    ? "text-orange-500"
                    : "text-muted-foreground"
                }`}
              />
              <span className="text-sm font-semibold text-card-foreground">
                Burner
              </span>
              <span className="text-xs text-muted-foreground ml-auto">
                {burnerPercent}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={state.burnerPower}
              onChange={(e) => onBurnerChange(Number(e.target.value))}
              disabled={state.fuel <= 0 || state.isCrashed}
              className="w-full h-3 rounded-full appearance-none cursor-pointer
                bg-muted
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-5
                [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-orange-500
                [&::-webkit-slider-thumb]:shadow-md
                [&::-webkit-slider-thumb]:border-2
                [&::-webkit-slider-thumb]:border-white
                [&::-moz-range-thumb]:w-5
                [&::-moz-range-thumb]:h-5
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-orange-500
                [&::-moz-range-thumb]:shadow-md
                [&::-moz-range-thumb]:border-2
                [&::-moz-range-thumb]:border-white
                disabled:opacity-50
              "
              aria-label="Burner power"
            />
            {/* Fuel bar */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Fuel</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${state.fuel}%`,
                    backgroundColor:
                      state.fuel > 30
                        ? "#22c55e"
                        : state.fuel > 10
                          ? "#eab308"
                          : "#ef4444",
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-10 text-right">
                {Math.round(state.fuel)}%
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-24 bg-border" />

          {/* Sandbag Controls */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1">
              <Weight className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-card-foreground">
                Weight
              </span>
            </div>
            <div className="text-xs text-muted-foreground text-center">
              {state.sandbags} / {state.maxSandbags}
            </div>
            <div className="flex gap-2">
              <button
                onClick={onAddSandbag}
                disabled={
                  state.sandbags >= state.maxSandbags ||
                  state.isCrashed ||
                  !state.isLanded
                }
                className="flex items-center gap-1 bg-muted hover:bg-secondary text-secondary-foreground px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40 transition-colors"
                aria-label="Add sandbag"
              >
                <ArrowDown className="w-3 h-3" />
                Add
              </button>
              <button
                onClick={onDropSandbag}
                disabled={state.sandbags <= 0 || state.isCrashed}
                className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40 transition-colors"
                aria-label="Drop sandbag"
              >
                <ArrowUp className="w-3 h-3" />
                Drop
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard hints */}
      <p className="text-xs text-white/60 text-center">
        {"Hold "}
        <kbd className="bg-white/20 rounded px-1.5 py-0.5 font-mono text-white/80">
          W
        </kbd>
        {" or "}
        <kbd className="bg-white/20 rounded px-1.5 py-0.5 font-mono text-white/80">
          Space
        </kbd>
        {" to burn | "}
        <kbd className="bg-white/20 rounded px-1.5 py-0.5 font-mono text-white/80">
          D
        </kbd>
        {" to drop sandbag"}
      </p>
    </div>
  )
}
