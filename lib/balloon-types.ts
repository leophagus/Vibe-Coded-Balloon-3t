export type GameOverReason = "crash" | "too_high" | "timeout" | null

export interface ScorePopup {
  text: string
  tick: number
}

export interface BalloonState {
  altitude: number
  velocity: number
  airTemperature: number
  burnerPower: number
  fuel: number
  sandbags: number
  maxSandbags: number
  isLanded: boolean
  gameOver: boolean
  gameOverReason: GameOverReason
  maxAltitude: number
  flightTime: number
  countdown: number
  hasLiftedOff: boolean
  score: number
  flightScoreAccum: number
  wasAboveMountainLine: boolean
  wasAboveMiddleLine: boolean
  scorePopups: ScorePopup[]
}

export interface Cloud {
  x: number
  y: number
  width: number
  height: number
  speed: number
  opacity: number
}

export interface Star {
  x: number
  y: number
  size: number
  twinkle: number
}

export const GAME_CONSTANTS = {
  GRAVITY: 0.015,
  BUOYANCY_FACTOR: 0.00035,
  DRAG: 0.995,
  AIR_COOLING_RATE: 0.15,
  BURNER_HEAT_RATE: 0.8,
  AMBIENT_TEMP: 20,
  MAX_TEMP: 200,
  FUEL_CONSUMPTION_RATE: 0.03,
  MAX_FUEL: 100,
  SANDBAG_WEIGHT: 0.008,
  /** The altitude that maps to the top of the playable screen area */
  SCREEN_MAX_ALTITUDE: 800,
  SAFE_LANDING_SPEED: 0.8,
  GROUND_LEVEL: 0,
  /** Countdown in seconds before takeoff is required */
  COUNTDOWN_SECONDS: 30,
  TOP_MARGIN: 100,
  BOTTOM_MARGIN: 170,
  /** Altitude of the mountain-peak scoring line */
  MOUNTAIN_LINE_ALTITUDE: 100,
  /** Altitude of the middle scoring line */
  MIDDLE_LINE_ALTITUDE: 400,
  /** Points awarded every 5 seconds of flight */
  TIME_SCORE_POINTS: 1,
  /** Seconds between time-based score awards */
  TIME_SCORE_INTERVAL: 5,
  /** Points for crossing the mountain-peak line */
  MOUNTAIN_CROSS_SCORE: 10,
  /** Points for crossing the middle line */
  MIDDLE_CROSS_SCORE: 5,
} as const
