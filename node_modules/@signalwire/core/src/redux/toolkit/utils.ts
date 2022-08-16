import type { Middleware } from 'redux'

export class MiddlewareArray<
  Middlewares extends Middleware<any, any>
> extends Array<Middlewares> {
  constructor(arrayLength?: number)
  constructor(...items: Middlewares[])
  constructor(...args: any[]) {
    super(...args)
    Object.setPrototypeOf(this, MiddlewareArray.prototype)
  }

  static get [Symbol.species]() {
    return MiddlewareArray as any
  }

  concat<AdditionalMiddlewares extends ReadonlyArray<Middleware<any, any>>>(
    items: AdditionalMiddlewares
  ): MiddlewareArray<Middlewares | AdditionalMiddlewares[number]>

  concat<AdditionalMiddlewares extends ReadonlyArray<Middleware<any, any>>>(
    ...items: AdditionalMiddlewares
  ): MiddlewareArray<Middlewares | AdditionalMiddlewares[number]>
  concat(...arr: any[]) {
    return super.concat.apply(this, arr)
  }

  prepend<AdditionalMiddlewares extends ReadonlyArray<Middleware<any, any>>>(
    items: AdditionalMiddlewares
  ): MiddlewareArray<AdditionalMiddlewares[number] | Middlewares>

  prepend<AdditionalMiddlewares extends ReadonlyArray<Middleware<any, any>>>(
    ...items: AdditionalMiddlewares
  ): MiddlewareArray<AdditionalMiddlewares[number] | Middlewares>

  prepend(...arr: any[]) {
    if (arr.length === 1 && Array.isArray(arr[0])) {
      return new MiddlewareArray(...arr[0].concat(this))
    }
    return new MiddlewareArray(...arr.concat(this))
  }
}
