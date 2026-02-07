export interface BalloonState {
  altitude: number
  velocity: number
  airTemperature: number
  burnerPower: number
  fuel: number
  sandbags: number
  maxSandbags: number
  isLanded: boolean
  isCrashed: boolean
  maxAltitude: number
  flightTime: number
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
  MAX_ALTITUDE: 10000,
  SAFE_LANDING_SPEED: 0.8,
  GROUND_LEVEL: 0,
} as const
