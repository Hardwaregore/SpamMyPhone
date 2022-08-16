export class AuthError extends Error {
  name = 'AuthError'

  constructor(public code: number, public message: string) {
    super(message)
    Object.setPrototypeOf(this, AuthError.prototype)
  }
}

export class HttpError extends Error {
  name = 'HttpError'

  constructor(
    public code: number,
    public message: string,
    public response?: Record<string, any>
  ) {
    super(message)
    Object.setPrototypeOf(this, HttpError.prototype)
  }
}
