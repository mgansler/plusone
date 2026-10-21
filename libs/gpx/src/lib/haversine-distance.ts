export function calculateHaversineDistance(start: { latitude: number; longitude: number }, end: { latitude: number; longitude: number }) {
  const R = 6_371_000 // radius of the Earth in meters

  const degreeToRadians = (degree: number) => (degree * Math.PI) / 180

  // Convert coordinates to radians
  const phi1 = degreeToRadians(start.latitude)
  const phi2 = degreeToRadians(end.latitude)
  const deltaPhi = degreeToRadians(end.latitude - start.latitude)
  const deltaLambda = degreeToRadians(end.longitude - start.longitude)

  // Apply Haversine formula
  const a = Math.sin(deltaPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2

  const c = 2 * Math.asin(Math.sqrt(a))

  // Result in meters
  return R * c
}

/**
 * Calculate the initial bearing (in degrees) from point A to point B.
 *
 * Returns a value in [0, 360) where 0° = north, 90° = east, etc.
 */
export function calculateBearing(start: { latitude: number; longitude: number }, end: { latitude: number; longitude: number }): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const toDeg = (rad: number) => (rad * 180) / Math.PI

  const phi1 = toRad(start.latitude)
  const phi2 = toRad(end.latitude)
  const dLambda = toRad(end.longitude - start.longitude)

  const y = Math.sin(dLambda) * Math.cos(phi2)
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda)

  const bearing = toDeg(Math.atan2(y, x))
  return (bearing + 360) % 360
}
