import { BadRequestException, Injectable } from '@nestjs/common';
import { WeatherProvider } from './weather.provider.js';
import { formatWeatherByLocation } from './weather.util.js';
import type {
  BaseDateTime,
  GridCoordinates,
  WeatherByLocation,
} from './weather.types.js';

@Injectable()
export class WeatherService {
  constructor(private readonly weatherProvider: WeatherProvider) {}

  async getCurrentWeatherByLocation(
    lat: number,
    lon: number,
  ): Promise<WeatherByLocation> {
    const { nx, ny } = await this.getCurrentLocation(lat, lon);
    const now = this.getKstNow();
    const { baseDate: currentDate, baseTime: currentTime } =
      this.getCurrentBaseDateTime(now);
    const { baseDate: ultraDate, baseTime: ultraTime } =
      this.getUltraShortBaseDateTime(now);
    const { baseDate: shortDate, baseTime: shortTime } =
      this.getShortBaseDateTime(now);

    const [current, ultraShort, short] = await Promise.all([
      this.weatherProvider.getCurrentWeather(nx, ny, currentDate, currentTime),
      this.weatherProvider.getUltraShortForecast(nx, ny, ultraDate, ultraTime),
      this.weatherProvider.getShortForecast(nx, ny, shortDate, shortTime),
    ]);

    return formatWeatherByLocation(current, ultraShort, short);
  }

  private async getCurrentLocation(
    lat: number,
    lon: number,
  ): Promise<GridCoordinates> {
    this.validateLocation(lat, lon);

    return this.weatherProvider.getCurrentLocation({ lat, lon });
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

  private getKstNow(): Date {
    return new Date(Date.now() + 9 * 60 * 60 * 1000);
  }

  private getCurrentBaseDateTime(now: Date): BaseDateTime {
    const baseDateTime = new Date(now);

    if (baseDateTime.getUTCMinutes() < 40) {
      baseDateTime.setUTCHours(baseDateTime.getUTCHours() - 1);
    }

    return this.formatBaseDateTime(baseDateTime, '00');
  }

  private getUltraShortBaseDateTime(now: Date): BaseDateTime {
    const baseDateTime = new Date(now);

    if (baseDateTime.getUTCMinutes() < 45) {
      baseDateTime.setUTCHours(baseDateTime.getUTCHours() - 1);
    }

    return this.formatBaseDateTime(baseDateTime, '30');
  }

  private getShortBaseDateTime(now: Date): BaseDateTime {
    const baseDateTime = new Date(now);

    if (baseDateTime.getUTCMinutes() < 10) {
      baseDateTime.setUTCHours(baseDateTime.getUTCHours() - 1);
    }

    const baseHour = [23, 20, 17, 14, 11, 8, 5, 2].find(
      (hour) => hour <= baseDateTime.getUTCHours(),
    );

    if (baseHour === undefined) {
      baseDateTime.setUTCDate(baseDateTime.getUTCDate() - 1);
      baseDateTime.setUTCHours(23);
    } else {
      baseDateTime.setUTCHours(baseHour);
    }

    return this.formatBaseDateTime(baseDateTime, '00');
  }

  private formatBaseDateTime(date: Date, minute: string): BaseDateTime {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hour = String(date.getUTCHours()).padStart(2, '0');

    return { baseDate: `${year}${month}${day}`, baseTime: `${hour}${minute}` };
  }
}
