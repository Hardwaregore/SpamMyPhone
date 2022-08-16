import { EventTransform } from './interfaces'
import { proxyFactory } from './proxyUtils'

interface InstanceProxyFactoryParams {
  transform: EventTransform
  payload: Record<any, unknown>
}

/**
 * Note: the cached instances within `_instanceByTransformType` will never be
 * cleaned since we're caching by `transform.type` so we will always have one
 * instance per type regardless of the Room/Member/Recording we're working on.
 * This is something we can improve in the future, but not an issue right now.
 * Exported for test purposes
 */
export const _instanceByTransformType = new Map<string, EventTransform>()

const _getOrCreateInstance = ({
  transform,
  payload,
}: InstanceProxyFactoryParams) => {
  if (!_instanceByTransformType.has(transform.type)) {
    const instance = transform.instanceFactory(payload)
    _instanceByTransformType.set(transform.type, instance)

    return instance
  }

  return _instanceByTransformType.get(transform.type)
}

export const instanceProxyFactory = ({
  transform,
  payload,
}: InstanceProxyFactoryParams) => {
  /** Create the instance or pick from cache */
  const cachedInstance = _getOrCreateInstance({
    transform,
    payload,
  })

  const transformedPayload = transform.payloadTransform(payload)
  const proxiedObj = proxyFactory({
    transform,
    payload,
    instance: cachedInstance,
    transformedPayload,
  })

  return proxiedObj
}
