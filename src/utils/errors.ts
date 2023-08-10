export function must<T>(run: () => T, fail: (error: Error) => unknown): T {
  try {
    return run()
  } catch (error) {
    fail(error as Error)
    process.exit(1)
  }
}

export function mustAsync<T>(
  run: () => Promise<T>,
  fail: (error: Error) => unknown,
): Promise<T> {
  return run().catch((error) => {
    fail(error as Error)
    process.exit(1)
  })
}
