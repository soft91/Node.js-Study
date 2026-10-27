import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { WeatherModule } from './modules/weather/weather.module.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), WeatherModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
