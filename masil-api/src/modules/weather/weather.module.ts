import { Module } from '@nestjs/common';
import { WeatherController } from './weather.controller.js';
import { WeatherKmaClient } from './weather.kma-client.js';
import { WeatherService } from './weather.service.js';

@Module({
  controllers: [WeatherController],
  providers: [WeatherService, WeatherKmaClient],
})
export class WeatherModule {}
