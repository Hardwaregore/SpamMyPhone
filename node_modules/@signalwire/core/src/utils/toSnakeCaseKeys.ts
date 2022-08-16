import { CamelToSnakeCase } from '../types/utils'
import { fromCamelToSnakeCase } from './common'

type ToSnakeCaseKeys<T> = {
  [Property in NonNullable<keyof T> as CamelToSnakeCase<
    Extract<Property, string>
  >]: T[Property]
}

export const toSnakeCaseKeys = <T extends Record<string, any>>(
  obj: T,
  transform: (value: string) => any = (value: string) => value,
  result: Record<string, any> = {}
) => {
  if (Array.isArray(obj)) {
    result = obj.map((item: any, index: number) =>
      toSnakeCaseKeys(item, transform, result[index])
    )
  } else {
    Object.keys(obj).forEach((key) => {
      const newKey = fromCamelToSnakeCase(key)
      // Both 'object's and arrays will enter this branch
      if (obj[key] && typeof obj[key] === 'object') {
        result[newKey] = toSnakeCaseKeys(obj[key], transform, result[newKey])
      } else {
        result[newKey] = transform(obj[key])
      }
    })
  }

  return result as ToSnakeCaseKeys<T>
}
