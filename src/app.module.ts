import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health/health.controller';

@Module({
  imports: [TerminusModule, TasksModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule { }
