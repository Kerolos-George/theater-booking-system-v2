import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

type RequestWithMeta = Request & {
  requestId?: string;
  user?: { sub: string };
};

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<RequestWithMeta>();
    const response = http.getResponse<Response>();

    const requestId =
      (typeof request.headers['x-request-id'] === 'string'
        ? request.headers['x-request-id']
        : undefined) ?? randomUUID().slice(0, 8);

    request.requestId = requestId;
    response.setHeader('X-Request-Id', requestId);

    const { method, originalUrl, ip } = request;
    const userId = request.user?.sub;
    const started = Date.now();

    if (originalUrl.startsWith('/api/docs')) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: () => this.logRequest(method, originalUrl, response.statusCode, started, requestId, userId, ip),
        error: (error: { status?: number; message?: string }) => {
          this.logRequest(
            method,
            originalUrl,
            error.status ?? 500,
            started,
            requestId,
            userId,
            ip,
            error.message,
          );
        },
      }),
    );
  }

  private logRequest(
    method: string,
    url: string,
    status: number,
    started: number,
    requestId: string,
    userId: string | undefined,
    ip: string | undefined,
    errorMessage?: string,
  ): void {
    const ms = Date.now() - started;
    const userPart = userId ? ` user=${userId}` : '';
    const errorPart = errorMessage ? ` — ${errorMessage}` : '';
    const message = `[${requestId}] ${method} ${url} ${status} ${ms}ms${userPart} ip=${ip ?? 'unknown'}${errorPart}`;

    if (status >= 500) {
      this.logger.error(message);
      return;
    }

    if (status >= 400) {
      this.logger.warn(message);
      return;
    }

    this.logger.log(message);
  }
}
