import { ReduxComponent, SDKState } from '../../interfaces'

export const getComponent = ({ components }: SDKState, id: string) => {
  return components.byId?.[id]
}

export const getComponentsById = ({ components }: SDKState) => {
  return components.byId
}

export const getComponentsToCleanup = (state: SDKState) => {
  const components = getComponentsById(state)

  let toCleanup: Array<ReduxComponent['id']> = []
  Object.keys(components).forEach((id) => {
    if (components[id].responses || components[id].errors) {
      toCleanup.push(id)
    }
  })

  return toCleanup
}
