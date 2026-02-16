import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AppFeature } from './app.entity';

@Global()
@Module({
  imports: [AuthModule, MongooseModule.forFeature([AppFeature], 'test')],
  controllers: [AppController],
})
export class AppModule {}
