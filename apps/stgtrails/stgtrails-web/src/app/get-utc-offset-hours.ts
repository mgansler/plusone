export function getUtcOffsetHours(): number {
  return (new Date().getHours() - (new Date().getUTCHours() % 24) + 24) % 24
}
