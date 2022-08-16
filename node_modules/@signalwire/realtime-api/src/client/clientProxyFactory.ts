import { RealtimeClient } from './Client'
import { clientConnect as baseClientConnect } from './clientConnect'

interface ClientInterceptors {
  connect?: (client: RealtimeClient) => Promise<void | RealtimeClient>
}

const defaultInterceptors: ClientInterceptors = {
  connect: baseClientConnect,
}

export const clientProxyFactory = (
  client: RealtimeClient,
  interceptors: ClientInterceptors = defaultInterceptors
) => {
  const clientConnect = interceptors.connect || baseClientConnect

  // Client interceptors
  const clientOn: RealtimeClient['on'] = (...args) => {
    clientConnect(client)

    return client.on(...args)
  }
  const clientOnce: RealtimeClient['once'] = (...args) => {
    clientConnect(client)

    return client.once(...args)
  }

  return new Proxy<RealtimeClient>(client, {
    get(target: RealtimeClient, prop: keyof RealtimeClient, receiver: any) {
      if (prop === 'on') {
        return clientOn
      } else if (prop === 'once') {
        return clientOnce
      }

      return Reflect.get(target, prop, receiver)
    },
  })
}
