export class BookingFlowError extends Error {
  constructor(
    message: string,
    readonly httpStatus: number,
    readonly payload?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'BookingFlowError'
  }
}
