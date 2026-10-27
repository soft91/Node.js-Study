import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface GridCoordinates {
  nx: number;
  ny: number;
}

interface BaseDateTime {
  baseDate: string;
  baseTime: string;
}

export interface CurrentWeather {
  temperature: number;
  humidity: number;
  precipitation: string;
  precipitationType: number;
  windSpeed: number;
  windDirection: number;
}

interface KmaWeatherItem {
  category: string;
  obsrValue: string;
}

@Injectable()
export class WeatherKmaClient {
  private readonly weatherUrl: string;
  private readonly gridUrl: string;
  private readonly apiKey: string;

  constructor(configService: ConfigService) {
    this.weatherUrl = configService.getOrThrow<string>('WEATHER_API_URL');
    this.gridUrl = configService.getOrThrow<string>('WEATHER_LOCATION_API_URL');
    this.apiKey = configService.getOrThrow<string>('WEATHER_API_KEY');
  }

  async getGridCoordinates(lat: number, lon: number): Promise<GridCoordinates> {
    const text = await this.getText(this.gridUrl, {
      lat: String(lat),
      lon: String(lon),
      help: '0',
      authKey: this.apiKey,
    });
    const dataLine = text
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line && !line.startsWith('#'));
    const values = dataLine?.split(',').map((value) => Number(value.trim()));
    const nx = values?.[2];
    const ny = values?.[3];

    if (
      typeof nx !== 'number' ||
      typeof ny !== 'number' ||
      !Number.isInteger(nx) ||
      !Number.isInteger(ny)
    ) {
      throw new BadGatewayException(
        '기상청 격자 좌표 응답이 올바르지 않습니다.',
      );
    }

    return { nx, ny };
  }

  async getCurrentWeather(
    { nx, ny }: GridCoordinates,
    { baseDate, baseTime }: BaseDateTime,
  ): Promise<CurrentWeather> {
    const response = await this.getJson(`${this.weatherUrl}/getUltraSrtNcst`, {
      authKey: this.apiKey,
      pageNo: '1',
      numOfRows: '1000',
      dataType: 'JSON',
      base_date: baseDate,
      base_time: baseTime,
      nx: String(nx),
      ny: String(ny),
    });
    const values = Object.fromEntries(
      this.getWeatherItems(response).map(({ category, obsrValue }) => [
        category,
        obsrValue,
      ]),
    );

    return {
      temperature: Number(values.T1H),
      humidity: Number(values.REH),
      precipitation: values.RN1 ?? '0',
      precipitationType: Number(values.PTY),
      windSpeed: Number(values.WSD),
      windDirection: Number(values.VEC),
    };
  }

  private async getJson(
    url: string,
    params: Record<string, string>,
  ): Promise<unknown> {
    return (await this.request(url, params)).json();
  }

  private async getText(
    url: string,
    params: Record<string, string>,
  ): Promise<string> {
    return (await this.request(url, params)).text();
  }

  private async request(
    url: string,
    params: Record<string, string>,
  ): Promise<Response> {
    try {
      const response = await fetch(`${url}?${new URLSearchParams(params)}`, {
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new BadGatewayException(
          `기상청 API 요청에 실패했습니다. (HTTP ${response.status})`,
        );
      }

      return response;
    } catch (error) {
      if (error instanceof BadGatewayException) {
        throw error;
      }

      throw new BadGatewayException('기상청 API에 연결할 수 없습니다.');
    }
  }

  private getWeatherItems(response: unknown): KmaWeatherItem[] {
    const root = this.toRecord(response);
    const responseData = this.toRecord(root?.response);
    const body = this.toRecord(responseData?.body);
    const items = this.toRecord(body?.items)?.item;

    if (!Array.isArray(items)) {
      throw new BadGatewayException('기상청 날씨 데이터가 없습니다.');
    }

    return items.filter(
      (item): item is KmaWeatherItem =>
        this.isRecord(item) &&
        typeof item.category === 'string' &&
        typeof item.obsrValue === 'string',
    );
  }

  private toRecord(value: unknown): Record<string, unknown> | undefined {
    return this.isRecord(value) ? value : undefined;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
