import { Controller, Get } from '@nestjs/common';
import { BearerToken } from './bearer-token.decorator';

@Controller()
export class AppController {
  @Get('safe')
  @BearerToken()
  safe(): string {
    return 'safe';
  }

  @Get('unsafe')
  unsafe(): string {
    return 'unsafe';
  }
}
