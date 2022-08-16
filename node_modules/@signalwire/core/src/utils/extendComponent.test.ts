import { extendComponent } from './extendComponent'

describe('extendComponent', () => {
  it('should allow us to extend an classes with new methods', () => {
    class A {}
    const ExtendedClass = extendComponent<any, any>(A, {
      methodA: {},
      methodB: {},
      methodC: {},
      methodD: {},
    })

    const instance = new ExtendedClass()

    expect(instance).toHaveProperty('methodA')
    expect(instance).toHaveProperty('methodB')
    expect(instance).toHaveProperty('methodC')
    expect(instance).toHaveProperty('methodD')
  })

  it('should throw if the base class already has the method defined', () => {
    expect(() =>
      extendComponent<any, any>(
        class {
          methodA() {}
        },
        {
          methodA: {},
          methodB: {},
          methodC: {},
          methodD: {},
        }
      )
    ).toThrow()
  })
})
