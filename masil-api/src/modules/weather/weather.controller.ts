import {
  Controller,
  Get,
  Query,
  ParseFloatPipe,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { WeatherService } from './weather.service.js';

const WEATHER_CACHE_TTL = 10 * 60 * 1000;

@Controller('weather')
@UseInterceptors(CacheInterceptor)
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('current')
  @CacheTTL(WEATHER_CACHE_TTL)
  getCurrentWeather(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lon', ParseFloatPipe) lon: number,
  ) {
    return this.weatherService.getCurrentWeatherByLocation(lat, lon);
  }
}
