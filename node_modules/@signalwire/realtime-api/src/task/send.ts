import { request } from 'node:https'

const PATH = '/api/relay/rest/tasks'
const HOST = 'relay.signalwire.com'

/** Parameters for {@link send} */
export interface TaskSendParams {
  /** @ignore */
  host?: string
  /** SignalWire project id, e.g. `a10d8a9f-2166-4e82-56ff-118bc3a4840f` */
  project: string
  /** SignalWire project token, e.g. `PT9e5660c101cd140a1c93a0197640a369cf5f16975a0079c9` */
  token: string
  /** Context to send the task to */
  context: string
  /** Message to send */
  message: Record<string, unknown>
}

/**
 * Send a job to your Task Client in a specific context.
 *
 * @param params
 * @returns
 *
 * @example
 *
 * > Send a task with a message to then make an outbound Call.
 *
 * ```js
 * const message = {
 *   'action': 'call',
 *   'from': '+18881112222'
 *   'to': '+18881113333'
 * }
 *
 * await Task.send({
 *   project: "<project-id>",
 *   token: "<api-token>",
 *   context: 'office',
 *   message: message,
 * })
 * ```
 *
 */
export const send = ({
  host = HOST,
  project,
  token,
  context,
  message,
}: TaskSendParams) => {
  if (!project || !token) {
    throw new Error('Invalid options: project and token are required!')
  }

  return new Promise<void>((resolve, reject) => {
    try {
      const Authorization = `Basic ${Buffer.from(
        `${project}:${token}`
      ).toString('base64')}`

      const data = JSON.stringify({ context, message })
      const options = {
        host,
        port: 443,
        method: 'POST',
        path: PATH,
        headers: {
          Authorization,
          'Content-Type': 'application/json',
          'Content-Length': data.length,
        },
      }
      const req = request(options, ({ statusCode }) => {
        statusCode === 204 ? resolve() : reject()
      })

      req.on('error', reject)

      req.write(data)
      req.end()
    } catch (error) {
      reject(error)
    }
  })
}
