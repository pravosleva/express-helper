export function getNormalizedPort(val: string, defaultPort: number = 3000): number {
  const port = parseInt(val, 10)

  if (Number.isNaN(port)) {
    // named pipe
    return Number(val)
  }

  if (port >= 0) {
    // port number
    return port
  }

  return defaultPort
}