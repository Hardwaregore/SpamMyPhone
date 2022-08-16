import { MessagingMessageState } from '@signalwire/core'

/**
 * An object representing an SMS or MMS message.
 */
export interface MessageContract {
  /** The unique identifier of the message. */
  id: string
  /** The current state of the message. */
  state: MessagingMessageState
  /** The context of the message. */
  context: string
  /** The phone number the message comes from. */
  from: string
  /** The destination number of the message. */
  to: string
  /** The direction of the message: `inbound` or `outbound`. */
  direction: string
  /** Array of strings with message tags. */
  tags: string[]
  /** Body of the message */
  body: string
  /** Array of URLs media. */
  media: string[]
  /** Number of segments of the message. */
  segments: number
  /** Reason why the message was not sent. This is present only in case of failure. */
  reason?: string
}

interface MessageOptions {
  message_id: string
  message_state: MessagingMessageState
  context: string
  from_number: string
  to_number: string
  direction: 'inbound' | 'outbound'
  tags: string[]
  body: string
  media: string[]
  segments: number
  reason?: string
}

/** @internal */
export class Message implements MessageContract {
  public id: string
  public state: MessagingMessageState
  public context: string
  public from: string
  public to: string
  public body: string
  public direction: 'inbound' | 'outbound'
  public media: string[]
  public segments: number
  public tags: string[]
  public reason?: string

  constructor(options: MessageOptions) {
    this.id = options.message_id
    this.state = options.message_state
    this.context = options.context
    this.from = options.from_number
    this.to = options.to_number
    this.body = options.body
    this.direction = options.direction
    this.media = options.media || []
    this.segments = options.segments
    this.tags = options.tags || []
    this.reason = options.reason
  }
}
