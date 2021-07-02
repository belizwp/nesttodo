import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthGuard } from './auth.guard'
import { ValidationPipe } from '@nestjs/common'
import { HttpExceptionFilter } from './http-exception.filter'
import { LoggingInterceptor } from './logging.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalGuards(new AuthGuard());
  app.useGlobalPipes(new ValidationPipe());
  // for custom validate exceptiion read https://github.com/nestjs/nest/issues/1267
  // app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.enableShutdownHooks()
  await app.listen(3000);
}
bootstrap();
