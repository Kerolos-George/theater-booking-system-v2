import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common'
import { BookingFlowError } from './booking-flow.error'

export function rethrowBookingFlowError(error: unknown): never {
  if (error instanceof BookingFlowError) {
    switch (error.httpStatus) {
      case 400:
        throw new BadRequestException(error.payload ?? error.message)
      case 404:
        throw new NotFoundException(error.payload ?? error.message)
      case 409:
        throw new ConflictException(error.payload ?? error.message)
      default:
        throw error
    }
  }

  throw error
}
