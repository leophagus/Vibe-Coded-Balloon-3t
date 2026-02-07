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

  const gameOverTitle =
    state.gameOverReason === "crash"
      ? "Crash Landing!"
      : state.gameOverReason === "too_high"
        ? "Lost in the Stratosphere!"
        : state.gameOverReason === "timeout"
          ? "Failed to Launch!"
          : ""

  const gameOverSub =
    state.gameOverReason === "crash"
      ? "You descended too fast."
      : state.gameOverReason === "too_high"
        ? "You flew too high and escaped the screen."
        : state.gameOverReason === "timeout"
          ? "The countdown ran out before takeoff."
          : ""

  const gameOverBg =
    state.gameOverReason === "timeout"
      ? "bg-amber-900/90"
      : state.gameOverReason === "too_high"
        ? "bg-indigo-900/90"
        : "bg-red-900/90"

  return (
    <>
      {/* ── Game Over Overlay (centered on screen) ── */}
      {state.gameOver && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div
            className={`${gameOverBg} text-white rounded-2xl px-8 py-6 text-center backdrop-blur-sm shadow-2xl pointer-events-auto max-w-xs`}
          >
            <p className="text-xl font-bold">{gameOverTitle}</p>
            <p className="text-sm opacity-80 mt-2">{gameOverSub}</p>
            <p className="text-sm opacity-60 mt-1">
              {"Max altitude: "}
              {Math.round(state.maxAltitude)}m
            </p>
            <button
              onClick={onReset}
              className="mt-4 bg-white/90 text-foreground font-semibold px-6 py-2.5 rounded-xl hover:bg-white transition-colors"
            >
              Try Again
            </button>
            <p className="text-xs opacity-50 mt-2">
              {"or press "}
              <kbd className="bg-white/20 rounded px-1.5 py-0.5 font-mono">
                R
              </kbd>
            </p>
          </div>
        </div>
      )}

      {/* ── Safe Landing Overlay ── */}
      {state.isLanded &&
        !state.gameOver &&
        state.hasLiftedOff &&
        state.maxAltitude > 10 && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="bg-emerald-800/90 text-white rounded-2xl px-8 py-6 text-center backdrop-blur-sm shadow-2xl pointer-events-auto max-w-xs">
              <p className="text-xl font-bold">Safe Landing!</p>
              <p className="text-sm opacity-80 mt-2">
                {"Max altitude: "}
                {Math.round(state.maxAltitude)}
                {"m | Flight: "}
                {Math.round(state.flightTime)}s
              </p>
              <button
                onClick={onReset}
                className="mt-4 bg-white/90 text-foreground font-semibold px-6 py-2.5 rounded-xl hover:bg-white transition-colors"
              >
                Fly Again
              </button>
            </div>
          </div>
        )}

      {/* ── Right-side Control Panel ── */}
      <div className="absolute top-4 right-4 bottom-4 flex flex-col gap-3 w-56 z-10">
        {/* Title */}
        <div className="bg-card/90 backdrop-blur-md rounded-xl px-4 py-2.5 shadow-lg border border-border/50 text-center">
          <h1 className="text-sm font-bold text-card-foreground tracking-wide">
            Balloon Simulator
          </h1>
        </div>

        {/* Burner */}
        <div className="bg-card/90 backdrop-blur-md rounded-xl p-4 shadow-lg border border-border/50">
          <div className="flex items-center gap-2 mb-3">
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
            <span className="text-xs text-muted-foreground ml-auto tabular-nums">
              {burnerPercent}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={state.burnerPower}
            onChange={(e) => onBurnerChange(Number(e.target.value))}
            disabled={state.fuel <= 0 || state.gameOver}
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
          <div className="mt-3 flex items-center gap-2">
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
            <span className="text-xs text-muted-foreground w-10 text-right tabular-nums">
              {Math.round(state.fuel)}%
            </span>
          </div>
        </div>

        {/* Sandbags */}
        <div className="bg-card/90 backdrop-blur-md rounded-xl p-4 shadow-lg border border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <Weight className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-card-foreground">
              Weight
            </span>
            <span className="text-xs text-muted-foreground ml-auto tabular-nums">
              {state.sandbags} / {state.maxSandbags}
            </span>
          </div>

          {/* Sandbag dots */}
          <div className="flex gap-1.5 justify-center mb-3">
            {Array.from({ length: state.maxSandbags }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full border transition-all ${
                  i < state.sandbags
                    ? "bg-amber-700 border-amber-800"
                    : "bg-muted border-border"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onAddSandbag}
              disabled={
                state.sandbags >= state.maxSandbags ||
                state.gameOver ||
                !state.isLanded
              }
              className="flex-1 flex items-center justify-center gap-1 bg-muted hover:bg-secondary text-secondary-foreground px-3 py-2 rounded-lg text-xs font-medium disabled:opacity-40 transition-colors"
              aria-label="Add sandbag"
            >
              <ArrowDown className="w-3 h-3" />
              Add
            </button>
            <button
              onClick={onDropSandbag}
              disabled={state.sandbags <= 0 || state.gameOver}
              className="flex-1 flex items-center justify-center gap-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg text-xs font-medium disabled:opacity-40 transition-colors"
              aria-label="Drop sandbag"
            >
              <ArrowUp className="w-3 h-3" />
              Drop
            </button>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Keyboard hints */}
        <div className="bg-card/70 backdrop-blur-md rounded-xl px-3 py-3 shadow-lg border border-border/50 text-xs text-muted-foreground space-y-1.5">
          <div className="flex items-center gap-2">
            <kbd className="bg-muted rounded px-1.5 py-0.5 font-mono text-card-foreground text-[10px]">
              W
            </kbd>
            <span>/ Space to burn</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="bg-muted rounded px-1.5 py-0.5 font-mono text-card-foreground text-[10px]">
              D
            </kbd>
            <span>Drop sandbag</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="bg-muted rounded px-1.5 py-0.5 font-mono text-card-foreground text-[10px]">
              R
            </kbd>
            <span>Restart (game over)</span>
          </div>
        </div>
      </div>
    </>
  )
}
