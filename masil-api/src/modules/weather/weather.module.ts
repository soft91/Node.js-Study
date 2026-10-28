import { Module } from '@nestjs/common';
import { WeatherController } from './weather.controller.js';
import { WeatherProvider } from './weather.provider.js';
import { WeatherService } from './weather.service.js';

@Module({
  controllers: [WeatherController],
  providers: [WeatherService, WeatherProvider],
})
export class WeatherModule {}
