/**
 * You can use the realtime SDK to listen for and react to events from
 * SignalWire's RealTime APIs.
 *
 * To get started, create a realtime client, for example with
 * {@link Video.Client} and listen for events. For example:
 *
 * ```javascript
 * import { Video } from '@signalwire/realtime-api'
 *
 * const video = new Video.Client({
 *   project: '<project-id>',
 *   token: '<project-token>'
 * })
 *
 * video.on('room.started', async (roomSession) => {
 *   console.log("Room started")
 *
 *   roomSession.on('member.joined', async (member) => {
 *     console.log(member)
 *   })
 * });
 * ```
 *
 * @module
 */

/**
 * Access the Video API Consumer. You can instantiate a {@link Video.Client} to
 * subscribe to Video events. Please check {@link Video.VideoClientApiEvents}
 * for the full list of events that a {@link Video.Client} can subscribe to.
 *
 * @example
 *
 * The following example logs whenever a room session is started or a user joins
 * it:
 *
 * ```javascript
 * const video = new Video.Client({ project, token })
 *
 * // Listen for events:
 * video.on('room.started', async (roomSession) => {
 *   console.log('Room has started:', roomSession.name)
 *
 *   roomSession.on('member.joined', async (member) => {
 *     console.log('Member joined:', member.name)
 *   })
 * })
 * ```
 */
export * as Video from './video/Video'

export * from './createClient'

/**
 * Access the Chat API Consumer. You can instantiate a {@link Chat.Client} to
 * subscribe to Chat events. Please check {@link Chat.ChatClientApiEvents}
 * for the full list of events that a {@link Chat.Client} can subscribe to.
 *
 * @example
 *
 * The following example logs the messages sent to the "welcome" channel.
 *
 * ```javascript
 * const chatClient = new Chat.Client({
 *   project: '<project-id>',
 *   token: '<api-token>'
 * })
 *
 * chatClient.on('message', m => console.log(m))
 *
 * await chatClient.subscribe("welcome")
 * ```
 */
export * as Chat from './chat/Chat'

/**
 * Access the PubSub API Consumer. You can instantiate a {@link PubSub.Client} to
 * subscribe to PubSub events. Please check {@link PubSub.PubSubClientApiEvents}
 * for the full list of events that a {@link PubSub.Client} can subscribe to.
 *
 * @example
 *
 * The following example logs the messages sent to the "welcome" channel.
 *
 * ```javascript
 * const pubSubClient = new PubSub.Client({
 *   project: '<project-id>',
 *   token: '<api-token>'
 * })
 *
 * pubSubClient.on('message', m => console.log(m))
 *
 * await pubSubClient.subscribe("welcome")
 * ```
 */
export * as PubSub from './pubSub/PubSub'

/** @ignore */
export * from './configure'

/**
 * Access the Task API. You can instantiate a {@link Task.Client} to
 * receive tasks from a different application. Please check
 * {@link Task.TaskClientApiEvents} for the full list of events that
 * a {@link Task.Client} can subscribe to.
 *
 * @example
 *
 * The following example listens for incoming tasks.
 *
 * ```javascript
 * const client = new Task.Client({
 *   project: "<project-id>",
 *   token: "<api-token>",
 *   contexts: ['office']
 * })
 *
 * client.on('task.received', (payload) => {
 *   console.log('Task Received', payload)
 *   // Do something with the payload...
 * })
 * ```
 *
 * From a different process, even on a different machine, you can then send tasks:
 *
 * ```js
 * await Task.send({
 *   project: "<project-id>",
 *   token: "<api-token>",
 *   context: 'office',
 *   message: { hello: ['world', true] },
 * })
 * ```
 */
export * as Task from './task/Task'

/**
 * Access the Messaging API. You can instantiate a {@link Messaging.Client} to
 * send or receive SMS and MMS. Please check
 * {@link Messaging.MessagingClientApiEvents} for the full list of events that
 * a {@link Messaging.Client} can subscribe to.
 *
 * @example
 *
 * The following example listens for incoming SMSs over an "office" context,
 * and also sends an SMS.
 *
 * ```javascript
 * const client = new Messaging.Client({
 *   project: "<project-id>",
 *   token: "<api-token>",
 *   contexts: ['office']
 * })
 *
 * client.on('message.received', (message) => {
 *   console.log('message.received', message)
 * })
 *
 * await client.send({
 *   from: '+1xxx',
 *   to: '+1yyy',
 *   body: 'Hello World!'
 * })
 * ```
 */
export * as Messaging from './messaging/Messaging'

/**
 * Access the Voice API. You can instantiate a {@link Voice.Client} to
 * make or receive calls. Please check
 * {@link Voice.VoiceClientApiEvents} for the full list of events that
 * a {@link Voice.Client} can subscribe to.
 *
 * @example
 *
 * The following example answers any call in the "office" context,
 * and immediately plays some speech.
 *
 * ```javascript
 * const client = new Voice.Client({
 *   project: "<project-id>",
 *   token: "<api-token>",
 *   contexts: ['office']
 * })
 *
 * client.on('call.received', async (call) => {
 *   console.log('Got call', call.from, call.to)
 *
 *   try {
 *     await call.answer()
 *     console.log('Inbound call answered')
 *
 *     await call.playTTS({ text: "Hello! This is a test call."})
 *   } catch (error) {
 *     console.error('Error answering inbound call', error)
 *   }
 * })
 * ```
 */
export * as Voice from './voice/Voice'
