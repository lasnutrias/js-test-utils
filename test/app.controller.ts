import { Body, Controller, Get, Post } from '@nestjs/common';
import { BearerToken } from './bearer-token.decorator';
import { App, AppDocument } from './app.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Controller()
export class AppController {
  constructor(
    @InjectModel(App.name, 'test') private readonly model: Model<App>,
  ) {}

  @Get('safe')
  @BearerToken()
  safe(): string {
    return 'safe';
  }

  @Post('app')
  @BearerToken()
  async createApp(@Body() app: App): Promise<AppDocument> {
    const newApp: AppDocument = await this.model.insertOne(app);
    console.log(newApp);
    return newApp;
  }

  @Get('unsafe')
  unsafe(): string {
    return 'unsafe';
  }
}
