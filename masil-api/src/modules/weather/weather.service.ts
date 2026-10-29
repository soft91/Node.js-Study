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
    const midForecastRegion = this.getMidForecastRegion(lat, lon);
    const midForecastTime = this.getMidForecastBaseDateTime(now);

    const [current, ultraShort, short, mid] = await Promise.all([
      this.weatherProvider.getCurrentWeather(nx, ny, currentDate, currentTime),
      this.weatherProvider.getUltraShortForecast(nx, ny, ultraDate, ultraTime),
      this.weatherProvider.getShortForecast(nx, ny, shortDate, shortTime),
      this.weatherProvider.getMidForecast(
        midForecastRegion.landRegId,
        midForecastRegion.temperatureRegId,
        midForecastTime,
      ),
    ]);

    return formatWeatherByLocation(
      current,
      ultraShort,
      short,
      mid,
      now,
      lat,
      lon,
    );
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

  private getMidForecastBaseDateTime(now: Date): string {
    const baseDateTime = new Date(now);
    const hour = baseDateTime.getUTCHours();

    if (hour < 6) {
      baseDateTime.setUTCDate(baseDateTime.getUTCDate() - 1);
      baseDateTime.setUTCHours(18);
    } else if (hour < 18) {
      baseDateTime.setUTCHours(6);
    } else {
      baseDateTime.setUTCHours(18);
    }

    return `${this.formatBaseDateTime(baseDateTime, '00').baseDate}${String(baseDateTime.getUTCHours()).padStart(2, '0')}00`;
  }

  private getMidForecastRegion(
    lat: number,
    lon: number,
  ): {
    landRegId: string;
    temperatureRegId: string;
  } {
    if (lat < 34.8)
      return { landRegId: '11G00000', temperatureRegId: '11G00201' };
    if (lat < 35.5 && lon < 127.8)
      return { landRegId: '11F20000', temperatureRegId: '11F20503' };
    if (lat < 35.9 && lon >= 127.8)
      return { landRegId: '11H20000', temperatureRegId: '11H20201' };
    if (lat < 36.3)
      return { landRegId: '11F10000', temperatureRegId: '11F10201' };
    if (lat < 36.9 && lon < 127.7)
      return { landRegId: '11C20000', temperatureRegId: '11C20401' };
    if (lat < 37.5 && lon >= 128.1)
      return { landRegId: '11H10000', temperatureRegId: '11H10701' };
    if (lat < 37.5)
      return { landRegId: '11C10000', temperatureRegId: '11C10301' };
    if (lat >= 37.7 && lon >= 128)
      return { landRegId: '11D20000', temperatureRegId: '11D20501' };
    if (lat >= 37.7 && lon >= 127.5)
      return { landRegId: '11D10000', temperatureRegId: '11D10301' };
    return { landRegId: '11B00000', temperatureRegId: '11B10101' };
  }

  private formatBaseDateTime(date: Date, minute: string): BaseDateTime {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hour = String(date.getUTCHours()).padStart(2, '0');

    return { baseDate: `${year}${month}${day}`, baseTime: `${hour}${minute}` };
  }
}
