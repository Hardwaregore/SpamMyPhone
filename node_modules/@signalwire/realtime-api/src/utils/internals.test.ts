import { config } from '../configure'
import { getCredentials } from './internals'

describe('getCredentials', () => {
  it('should throw if either project and/or token are missing', () => {
    expect(() =>
      getCredentials({
        token: 'some-token',
      })
    ).toThrow('Missing `project`')
    expect(() =>
      getCredentials({
        project: 'some-project',
      })
    ).toThrow('Missing `token`')
    expect(() => getCredentials({})).toThrow()
  })

  describe('Global config', () => {
    const processEnv = process.env
    beforeEach(() => {
      jest.resetModules()
      process.env = { ...processEnv }
    })
    afterAll(() => {
      process.env = processEnv
      config({
        token: undefined,
        project: undefined
      })
    })

    it('should read options from global config (if available)', () => {
      config({
        project: 'global-project',
        token: 'global-token',
        cache: {},
      })

      expect(getCredentials()).toEqual({
        project: 'global-project',
        token: 'global-token',
      })
    })

    it('should have lower priority than local config', () => {
      config({
        project: 'global-project',
        token: 'global-token',
        cache: {},
      })

      expect(
        getCredentials({
          token: 'local-token',
        })
      ).toEqual({
        project: 'global-project',
        token: 'local-token',
      })

      // Local config for token not provided so global
      // config should be used
      expect(
        getCredentials({
          project: 'local-project',
        })
      ).toEqual({
        project: 'local-project',
        token: 'global-token',
      })
    })
  })

  describe('Environment variables', () => {
    const processEnv = process.env
    beforeEach(() => {
      jest.resetModules()
      process.env = { ...processEnv }
    })
    afterEach(() => {
      config({
        project: undefined,
        token: undefined
      })
    })
    afterAll(() => {
      process.env = processEnv
    })

    it("should read from environment variables when the user doesn't provide token and/or project nor a global config", () => {
      process.env.SW_PROJECT = 'env-project'
      process.env.SW_TOKEN = 'env-token'

      expect(getCredentials()).toEqual({
        project: 'env-project',
        token: 'env-token',
      })
    })

    it('should give priority to local config over env variables', () => {
      process.env.SW_PROJECT = 'env-project'
      process.env.SW_TOKEN = 'env-token'

      expect(
        getCredentials({
          project: 'local-project',
          token: 'local-token',
        })
      ).toEqual({
        project: 'local-project',
        token: 'local-token',
      })
    })

    it('should have last order of precedence when it comes to config values', () => {
      config({
        project: 'global-project',
        token: 'global-token',
        cache: {},
      })

      process.env.SW_PROJECT = 'env-project'
      process.env.SW_TOKEN = 'env-token'

      // the global config should have priority over
      // process.env
      expect(getCredentials()).toEqual({
        project: 'global-project',
        token: 'global-token',
      })

      // Local config should have priority over both,
      // process.env and the global config
      expect(
        getCredentials({
          project: 'local-project',
          token: 'local-token',
        })
      ).toEqual({
        project: 'local-project',
        token: 'local-token',
      })

      config({
        token: undefined,
      })
      // Neither local or global config was provided for
      // token so the process.env will be used.
      expect(
        getCredentials({
          project: 'local-project',
        })
      ).toEqual({
        project: 'local-project',
        token: 'env-token',
      })

      config({
        project: 'global-project',
        token: undefined,
      })
      process.env.SW_PROJECT = 'env-project'
      process.env.SW_TOKEN = 'env-token'
      expect(getCredentials()).toEqual({
        project: 'global-project',
        token: 'env-token',
      })

      config({
        project: undefined,
        token: 'global-token',
      })
      expect(getCredentials()).toEqual({
        project: 'env-project',
        token: 'global-token',
      })
    })
  })
})
