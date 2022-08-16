export interface GlobalConfig {
  token?: string
  project?: string
}

let GLOBAL_CONFIG: GlobalConfig = {}

export const getConfig = (): GlobalConfig => {
  return GLOBAL_CONFIG
}

/** @ignore */
export interface ConfigOptions extends GlobalConfig {
  /** @internal */
  cache?: GlobalConfig
}

/** @internal */
export const config = ({
  cache = GLOBAL_CONFIG,
  ...options
}: ConfigOptions) => {
  if (cache) {
    GLOBAL_CONFIG = cache
  }

  Object.entries(options).forEach(([key, value]) => {
    // TODO: filter out properties
    // @ts-expect-error
    GLOBAL_CONFIG[key] = value
  })
}
