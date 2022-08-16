import type { APIMethodsMap } from './interfaces'
import type { ConstructableType } from '../types/utils'

export const extendComponent = <T, M>(
  klass: any,
  methods: APIMethodsMap<M>
) => {
  Object.keys(methods).forEach((methodName) => {
    if (klass.prototype.hasOwnProperty(methodName)) {
      throw new Error(`[extendComponent] Duplicated method name: ${methodName}`)
    }
  })

  Object.defineProperties(klass.prototype, methods)

  return klass as ConstructableType<T>
}
