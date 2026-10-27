import { BadRequestException, Injectable } from '@nestjs/common';
import { WeatherKmaClient } from './weather.kma-client.js';
import type { CurrentWeather } from './weather.kma-client.js';

@Injectable()
export class WeatherService {
  constructor(private readonly weatherKmaClient: WeatherKmaClient) {}

  async getCurrentWeatherByLocation(
    lat: number,
    lon: number,
  ): Promise<CurrentWeather> {
    this.validateLocation(lat, lon);

    const gridCoordinates = await this.weatherKmaClient.getGridCoordinates(
      lat,
      lon,
    );

    return this.weatherKmaClient.getCurrentWeather(
      gridCoordinates,
      this.getLatestBaseDateTime(),
    );
  }

  private validateLocation(lat: number, lon: number): void {
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      throw new BadRequestException('위도와 경도는 숫자여야 합니다.');
    }

    if (
      lat < 31.651814 ||
      lat > 43.39349 ||
      lon < 123.310165 ||
      lon > 132.774963
    ) {
      throw new BadRequestException('기상청 지원 범위 밖의 좌표입니다.');
    }
  }

  private getLatestBaseDateTime() {
    const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);

    if (kstNow.getUTCMinutes() < 40) {
      kstNow.setUTCHours(kstNow.getUTCHours() - 1);
    }

    const year = kstNow.getUTCFullYear();
    const month = String(kstNow.getUTCMonth() + 1).padStart(2, '0');
    const day = String(kstNow.getUTCDate()).padStart(2, '0');
    const hour = String(kstNow.getUTCHours()).padStart(2, '0');

    return { baseDate: `${year}${month}${day}`, baseTime: `${hour}00` };
  }
}
