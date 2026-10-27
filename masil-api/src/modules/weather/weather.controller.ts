import { Controller, Get, Query, ParseFloatPipe } from '@nestjs/common';
import { WeatherService } from './weather.service.js';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('current')
  getCurrentWeather(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lon', ParseFloatPipe) lon: number,
  ) {
    return this.weatherService.getCurrentWeatherByLocation(lat, lon);
  }
}
