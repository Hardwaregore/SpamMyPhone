const UPPERCASE_REGEX = /[A-Z]/g
/**
 * Converts values from camelCase to snake_case
 * @internal
 */
export const fromCamelToSnakeCase = <T>(event: T): T => {
  // @ts-ignore
  return event.replace(UPPERCASE_REGEX, (letter) => {
    return `_${letter.toLowerCase()}`
  }) as T
}
