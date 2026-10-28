import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  KmaCurrentWeather,
  GridCoordinates,
  KmaForecastItem,
  LocationCoordinates,
} from './weather.types.js';
import {
  getCurrentWeather,
  getForecastItems,
  getGridCoordinates,
  getJson,
  getText,
} from './weather.util.js';

@Injectable()
export class WeatherProvider {
  private readonly weatherUrl: string;
  private readonly gridUrl: string;
  private readonly apiKey: string;

  constructor(configService: ConfigService) {
    this.weatherUrl = configService.getOrThrow<string>('WEATHER_API_URL');
    this.gridUrl = configService.getOrThrow<string>('WEATHER_LOCATION_API_URL');
    this.apiKey = configService.getOrThrow<string>('WEATHER_API_KEY');
  }

  // 현재 관측 날씨
  async getCurrentWeather(
    nx: number,
    ny: number,
    baseDate: string,
    baseTime: string,
  ): Promise<KmaCurrentWeather> {
    const response = await getJson(`${this.weatherUrl}/getUltraSrtNcst`, {
      authKey: this.apiKey,
      pageNo: '1',
      numOfRows: '1000',
      dataType: 'JSON',
      base_date: baseDate,
      base_time: baseTime,
      nx: String(nx),
      ny: String(ny),
    });

    return getCurrentWeather(response);
  }

  // 초단기예보: 하늘 상태
  async getUltraShortForecast(
    nx: number,
    ny: number,
    baseDate: string,
    baseTime: string,
  ): Promise<KmaForecastItem[]> {
    const response = await getJson(`${this.weatherUrl}/getUltraSrtFcst`, {
      authKey: this.apiKey,
      pageNo: '1',
      numOfRows: '1000',
      dataType: 'JSON',
      base_date: baseDate,
      base_time: baseTime,
      nx: String(nx),
      ny: String(ny),
    });

    return getForecastItems(response);
  }

  // 단기예보: 최고·최저기온, 강수 확률
  async getShortForecast(
    nx: number,
    ny: number,
    baseDate: string,
    baseTime: string,
  ): Promise<KmaForecastItem[]> {
    const response = await getJson(`${this.weatherUrl}/getVilageFcst`, {
      authKey: this.apiKey,
      pageNo: '1',
      numOfRows: '1000',
      dataType: 'JSON',
      base_date: baseDate,
      base_time: baseTime,
      nx: String(nx),
      ny: String(ny),
    });

    return getForecastItems(response);
  }

  // 위도·경도 → 기상청 격자 좌표
  async getCurrentLocation({
    lat,
    lon,
  }: LocationCoordinates): Promise<GridCoordinates> {
    const response = await getText(this.gridUrl, {
      lat: String(lat),
      lon: String(lon),
      help: '0',
      authKey: this.apiKey,
    });

    return getGridCoordinates(response);
  }
}
