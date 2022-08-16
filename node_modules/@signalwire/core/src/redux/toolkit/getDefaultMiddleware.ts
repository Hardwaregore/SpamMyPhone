import { Middleware } from 'redux'
import { MiddlewareArray } from './utils'

interface GetDefaultMiddlewareOptions {}

export type CurriedGetDefaultMiddleware<S = any> = <
  O extends Partial<GetDefaultMiddlewareOptions> = {
    thunk: true
    immutableCheck: true
    serializableCheck: true
  }
>(
  options?: O
) => MiddlewareArray<Middleware<{}, S>>

export function curryGetDefaultMiddleware<
  S = any
>(): CurriedGetDefaultMiddleware<S> {
  return function curriedGetDefaultMiddleware() {
    return [] as unknown as MiddlewareArray<Middleware<{}, S>>
  }
}
