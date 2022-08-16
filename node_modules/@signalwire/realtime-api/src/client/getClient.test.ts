import { configureFullStack } from '../testUtils'
import { getClient } from './getClient'

describe('getClient', () => {
  it('should cache clients by project and key', () => {
    const { store, emitter, destroy } = configureFullStack()
    const options = {
      project: 'a-proj',
      token: 'a-proj',
      store,
      emitter,
      cache: new Map(),
    }
    const clientA = getClient(options)
    const clientB = getClient(options)
    const clientC = getClient({
      ...options,
      project: 'c-project',
    })
    const clientD = getClient({
      ...options,
      token: 'd-project',
    })

    expect(clientA).toEqual(clientB)
    expect(clientA).not.toEqual(clientC)
    expect(clientA).not.toEqual(clientD)
    expect(options.cache.size).toEqual(3)

    destroy()
  })
})
