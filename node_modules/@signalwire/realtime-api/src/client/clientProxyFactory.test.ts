import { configureFullStack } from '../testUtils'
import { clientProxyFactory } from './clientProxyFactory'
import { getClient } from './getClient'

describe('clientProxyFactory', () => {
  it('should handle the automatic connection every time the user attach an event', () => {
    const { store, emitter, destroy } = configureFullStack()
    const options = {
      project: 'a-proj',
      token: 'a-proj',
      store,
      emitter,
      cache: new Map(),
    }
    const { client } = getClient(options)
    const connectMock = jest.fn()
    const proxiedClient = clientProxyFactory(client, { connect: connectMock })

    expect(connectMock).toHaveBeenCalledTimes(0)

    proxiedClient.on('session.connected', () => {})
    proxiedClient.on('session.reconnecting', () => {})

    expect(connectMock).toHaveBeenCalledTimes(2)

    destroy()
  })
})
