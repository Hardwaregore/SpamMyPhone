import { SnakeToCamelCase, ConverToExternalTypes } from '../types/utils'

const toDateObject = (timestamp?: number) => {
  if (typeof timestamp === 'undefined') {
    return timestamp
  }

  const date = new Date(timestamp * 1000)

  /**
   * If for some reason we can't convert to a valid date
   * we'll return the original value
   */
  if (isNaN(date.getTime())) {
    return timestamp
  }

  return date
}

const DEFAULT_OPTIONS = {
  /**
   * Properties coming from the server where their value will be
   * converted to camelCase
   */
  propsToUpdateValue: [
    'updated',
    'layers',
    'members',
    'recordings',
    'playbacks',
  ],
}

/**
 * Follows the same convention as `src/types/utils/IsTimestamp`
 */
const isTimestampProperty = (prop: string) => {
  return prop.endsWith('At')
}

export type ToExternalJSONResult<T> = {
  [Property in NonNullable<keyof T> as SnakeToCamelCase<
    Extract<Property, string>
  >]: ConverToExternalTypes<Extract<Property, string>, T[Property]>
}

/**
 * Converts a record (a JSON coming from the server) to a JSON meant
 * to be consumed by our users. This mostly mean converting properties
 * from snake_case to camelCase along with some other minor case
 * convertions to guarantee that our JS users will always interact
 * with camelCase properties.
 *
 * It's worth noting that this util is suited exactly to meet our
 * needs and won't (propertly) handle cases where the input record
 * doesn't have all its properties with casing other than snake_case.
 * This is on purpose to keep this util as light and fast as possible
 * since we have the guarantee that the server will always send their
 * payloads formatted this way.
 * @internal
 */
export const toExternalJSON = <T>(
  input: T,
  options: typeof DEFAULT_OPTIONS = DEFAULT_OPTIONS
) => {
  // @ts-expect-error
  if (input?.__sw_symbol || input?.__sw_proxy) {
    // Return if the input is a BaseComponent or a Proxy
    return input as unknown as ToExternalJSONResult<T>
  }

  return Object.entries(input).reduce((reducer, [key, value]) => {
    const prop = fromSnakeToCamelCase(key) as any
    const propType = typeof value

    /**
     * While this check won't be enough to detect all possible objects
     * it would cover our needs here since we just need to detect that
     * it's not a primitive value
     */
    if (propType === 'object' && value) {
      if (Array.isArray(value)) {
        if (options.propsToUpdateValue.includes(key)) {
          reducer[prop] = value.map((v) => {
            if (typeof v === 'string') {
              return fromSnakeToCamelCase(v)
            }
            return toExternalJSON(v)
          })
        } else {
          reducer[prop] = value
        }
      } else {
        reducer[prop] = toExternalJSON(value as T)
      }
    } else {
      if (isTimestampProperty(prop)) {
        reducer[prop] = toDateObject(value)
      } else {
        reducer[prop] = value
      }
    }

    return reducer
  }, {} as Record<string, unknown>) as ToExternalJSONResult<T>
}

/**
 * Converts values from snake_case to camelCase
 * @internal
 */
const fromSnakeToCamelCase = (input: string) => {
  if (!input.includes('_')) {
    return input
  }
  return input.split('_').reduce((reducer, part, index) => {
    const fc = part.trim().charAt(0)
    const remainingChars = part.substr(1).toLowerCase()

    return `${reducer}${
      index === 0 ? fc.toLowerCase() : fc.toUpperCase()
    }${remainingChars}`
  }, '')
}
