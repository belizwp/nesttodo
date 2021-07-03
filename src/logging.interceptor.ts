import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { Request, Response } from 'express'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>()
    const res = context.switchToHttp().getResponse<Response>()
    const userAgent = req.headers['user-agent']
    const now = Date.now()
    return next
      .handle()
      .pipe(
        tap(() =>
          this.logger.log(
            `${req.method} ${req.path} with ${res.statusCode} in ${Date.now() - now
            } ms. ${userAgent ? userAgent : 'N/A'}`,
            'HTTP',
          ),
        ),
      )
  }
}
