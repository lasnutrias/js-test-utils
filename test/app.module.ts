import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth.module';

@Global()
@Module({
  imports: [AuthModule],
  controllers: [AppController],
})
export class AppModule {}
