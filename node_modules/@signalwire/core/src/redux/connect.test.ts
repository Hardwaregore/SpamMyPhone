import { configureJestStore } from '../testUtils'
import { BaseComponent } from '../BaseComponent'
import { connect } from './connect'
import { componentActions, sessionActions } from './features'
import { EventEmitter } from '../utils/EventEmitter'
import { SDKStore } from './'

describe('Connect', () => {
  let store: SDKStore
  let instance: any
  let updateStateAction: any
  let updateRemoteSDPAction: any
  const mockOnRemoteSDP = jest.fn()

  Object.defineProperties(BaseComponent.prototype, {
    onAuth: {
      value: jest.fn(),
    },
    checkRaceOne: {
      value: jest.fn(),
    },
    checkRaceTwo: {
      value: jest.fn(),
    },
  })

  beforeEach(() => {
    store = configureJestStore()
    instance = connect({
      store,
      componentListeners: {
        state: 'emit',
        remoteSDP: mockOnRemoteSDP,
        raceOne: 'checkRaceOne',
        raceTwo: 'checkRaceTwo',
      },
      sessionListeners: {
        authStatus: 'onAuth',
      },
      Component: BaseComponent,
    })({
      emitter: new EventEmitter(),
    })
    instance.onAuth.mockClear()
    instance.emit = jest.fn()
    mockOnRemoteSDP.mockClear()

    updateStateAction = componentActions.upsert({
      id: instance.__uuid,
      state: 'active',
    })

    updateRemoteSDPAction = componentActions.upsert({
      id: instance.__uuid,
      remoteSDP: '<SDP>',
    })
  })

  it('should invoke the instance method if onStateChangeListeners provided a string name', () => {
    store.dispatch(updateStateAction)

    expect(instance.emit).toHaveBeenCalledTimes(1)
    expect(instance.emit).toHaveBeenCalledWith({
      id: instance.__uuid,
      state: 'active',
    })
  })

  it('should unsubscribe after destroy', () => {
    store.dispatch(updateStateAction)
    expect(instance.emit).toHaveBeenCalledTimes(1)

    instance.destroy()
    instance.emit.mockClear()

    store.dispatch(updateStateAction)
    expect(instance.emit).not.toHaveBeenCalled()
  })

  it('should not invoke the instance method if something else in redux changed', () => {
    store.dispatch(updateRemoteSDPAction)
    expect(instance.emit).not.toHaveBeenCalled()
  })

  it('should invoke the function within onStateChangeListeners', () => {
    store.dispatch(updateRemoteSDPAction)

    expect(mockOnRemoteSDP).toHaveBeenCalledTimes(1)
    expect(mockOnRemoteSDP).toHaveBeenCalledWith({
      id: instance.__uuid,
      remoteSDP: '<SDP>',
    })
  })

  it('should invoke the function within sessionListeners', () => {
    store.dispatch(sessionActions.authStatus('authorized'))

    expect(instance.onAuth).toHaveBeenCalledTimes(1)
    expect(instance.onAuth).toHaveBeenCalledWith({
      protocol: '',
      iceServers: [],
      authStatus: 'authorized',
      authError: undefined,
      authCount: 0,
    })
  })

  it('should not invoke the instance method after destroyer', () => {
    /**
     * First update will set the component in the
     * store and invoke both listeners
     */
    const firstUpdate = {
      id: instance.__uuid,
      raceOne: 'something',
      raceTwo: 'wrong',
    }
    instance.checkRaceOne.mockImplementationOnce((comp: any) => {
      expect(comp).toStrictEqual(firstUpdate)
    })
    store.dispatch(componentActions.upsert(firstUpdate))
    expect(instance.checkRaceOne).toHaveBeenCalledTimes(1)
    expect(instance.checkRaceTwo).toHaveBeenCalledTimes(1)

    /**
     * Second update we intentionally `destroy` the component
     * to unsubscribe from redux updates.
     * It should invoke only `checkRaceOne` and skip `checkRaceTwo`
     */
    instance.checkRaceOne.mockImplementationOnce(() => {
      instance.destroy()
    })
    const secondUpdate = {
      id: instance.__uuid,
      raceOne: 'got this race',
      raceTwo: 'and fix it',
    }
    store.dispatch(componentActions.upsert(secondUpdate))

    expect(instance.checkRaceOne).toHaveBeenCalledTimes(2)
    expect(instance.checkRaceTwo).toHaveBeenCalledTimes(1)
  })
})
