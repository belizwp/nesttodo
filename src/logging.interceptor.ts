import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { Request, Response } from 'express'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>()
    const res = context.switchToHttp().getResponse<Response>()
    const userAgent = req.headers['user-agent']
    const now = Date.now()
    return next
      .handle()
      .pipe(
        tap(() =>
          console.log(
            `${req.method} ${req.path} with ${res.statusCode} in ${
              Date.now() - now
            } ms. ${userAgent ? userAgent : 'N/A'}`,
          ),
        ),
      )
  }
}
