import { BadGatewayException } from '@nestjs/common';
import type {
  CurrentWeather,
  DailyWeather,
  HourlyWeather,
  KmaCurrentWeather,
  GridCoordinates,
  KmaForecastItem,
  KmaWeatherItem,
} from './weather.types.js';

const DAILY_FORECAST_LIMIT = 2;
const HOURLY_FORECAST_LIMIT = 24;

export function formatWeatherByLocation(
  current: KmaCurrentWeather,
  ultraShort: KmaForecastItem[],
  short: KmaForecastItem[],
): {
  current: CurrentWeather;
  daily: DailyWeather[];
  hourly: HourlyWeather[];
} {
  const currentSky = findClosestForecastValue(ultraShort, 'SKY');

  return {
    current: {
      temperature: current.temperature,
      humidity: current.humidity,
      sky: toNumberOrNull(currentSky),
      precipitationType: current.precipitationType,
      windSpeed: current.windSpeed,
      feelsLike: null,
    },
    daily: formatDailyWeather(short),
    hourly: formatHourlyWeather(short),
  };
}

export async function getJson(
  url: string,
  params: Record<string, string>,
): Promise<unknown> {
  return (await request(url, params)).json();
}

export async function getText(
  url: string,
  params: Record<string, string>,
): Promise<string> {
  return (await request(url, params)).text();
}

export function getCurrentWeather(response: unknown): KmaCurrentWeather {
  const values = Object.fromEntries(
    getWeatherItems(response).map(({ category, obsrValue }) => [
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

export function getForecastItems(response: unknown): KmaForecastItem[] {
  return getItems(response).filter(
    (item): item is KmaForecastItem =>
      isRecord(item) &&
      typeof item.category === 'string' &&
      typeof item.fcstDate === 'string' &&
      typeof item.fcstTime === 'string' &&
      typeof item.fcstValue === 'string',
  );
}

export function getGridCoordinates(text: string): GridCoordinates {
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
    throw new BadGatewayException('기상청 격자 좌표 응답이 올바르지 않습니다.');
  }

  return { nx, ny };
}

async function request(
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

function getWeatherItems(response: unknown): KmaWeatherItem[] {
  return getItems(response).filter(
    (item): item is KmaWeatherItem =>
      isRecord(item) &&
      typeof item.category === 'string' &&
      typeof item.obsrValue === 'string',
  );
}

function getItems(response: unknown): unknown[] {
  const root = toRecord(response);
  const responseData = toRecord(root?.response);
  const body = toRecord(responseData?.body);
  const items = toRecord(body?.items)?.item;

  if (!Array.isArray(items)) {
    throw new BadGatewayException('기상청 날씨 데이터가 없습니다.');
  }

  return items;
}

function toRecord(value: unknown): Record<string, unknown> | undefined {
  return isRecord(value) ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function findClosestForecastValue(
  items: KmaForecastItem[],
  category: string,
): string | undefined {
  return items
    .filter((item) => item.category === category)
    .sort((a, b) =>
      `${a.fcstDate}${a.fcstTime}`.localeCompare(`${b.fcstDate}${b.fcstTime}`),
    )[0]?.fcstValue;
}

function formatDailyWeather(items: KmaForecastItem[]): DailyWeather[] {
  const dailyValues = new Map<string, Record<string, string>>();

  for (const item of items) {
    if (item.category !== 'TMN' && item.category !== 'TMX') {
      continue;
    }

    const values = dailyValues.get(item.fcstDate) ?? {};
    values[item.category] = item.fcstValue;
    dailyValues.set(item.fcstDate, values);
  }

  return [...dailyValues.entries()]
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .slice(0, DAILY_FORECAST_LIMIT)
    .map(([date, values]) => ({
      date: formatDate(date),
      minTemperature: toNumberOrNull(values.TMN),
      maxTemperature: toNumberOrNull(values.TMX),
    }));
}

function formatHourlyWeather(items: KmaForecastItem[]): HourlyWeather[] {
  const hourlyValues = new Map<string, Record<string, string>>();

  for (const item of items) {
    const key = `${item.fcstDate}${item.fcstTime}`;
    const values = hourlyValues.get(key) ?? {};
    values[item.category] = item.fcstValue;
    hourlyValues.set(key, values);
  }

  return [...hourlyValues.entries()]
    .sort(([dateTimeA], [dateTimeB]) => dateTimeA.localeCompare(dateTimeB))
    .filter(([, values]) => values.TMP !== undefined)
    .slice(0, HOURLY_FORECAST_LIMIT)
    .map(([dateTime, values]) => ({
      dateTime: `${formatDate(dateTime.slice(0, 8))}T${dateTime.slice(8, 10)}:${dateTime.slice(10, 12)}:00+09:00`,
      temperature: toNumberOrNull(values.TMP),
      sky: toNumberOrNull(values.SKY),
      precipitationType: toNumberOrNull(values.PTY),
      precipitationProbability: toNumberOrNull(values.POP),
      precipitation: values.PCP ?? null,
    }));
}

function formatDate(date: string): string {
  return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
}

function toNumberOrNull(value: string | undefined): number | null {
  if (value === undefined) {
    return null;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : null;
}
