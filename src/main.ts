import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { LoggingInterceptor } from './shared/interceptor/logging.interceptor'
import { PrismaService } from './shared/service/prisma.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe())
  // for custom validate exceptiion read https://github.com/nestjs/nest/issues/1267
  app.useGlobalInterceptors(new LoggingInterceptor())
  const prismaService: PrismaService = app.get(PrismaService)
  prismaService.enableShutdownHooks(app)
  await app.listen(3000)
}
bootstrap()
