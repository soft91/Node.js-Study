import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('weather')
export class WeatherController {
  constructor(private configService: ConfigService) {}

  @Get()
  public getWeather() {
    const apiUrl = this.configService.get<string>('WEATHER_API_URL');
    const apiKey = this.configService.get<string>('WEATHER_API_KEY');

    return this.callWheatherApi(apiUrl, apiKey);
  }

  private callWheatherApi(apiUrl: string, apiKey: string) {
    // call api
    console.log(apiUrl);
    console.log(apiKey);
    return '내일은 맑음';
  }
}
