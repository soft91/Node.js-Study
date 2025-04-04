import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(private configService: ConfigService) {}

  @Get()
  getHello(): string {
    const message = this.configService.get<string>('MESSAGE');
    return message;
  }

  @Get('service-url')
  getServiceUrl(): string {
    return this.configService.get<string>('SERVICE_URL');
  }
}
