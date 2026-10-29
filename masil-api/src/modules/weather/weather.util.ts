import { BadGatewayException } from '@nestjs/common';
import type {
  CurrentWeather,
  DailyWeather,
  HourlyWeather,
  KmaCurrentWeather,
  GridCoordinates,
  KmaForecastItem,
  KmaWeatherItem,
  KmaMidForecast,
  WeatherCondition,
} from './weather.types.js';

const DAILY_FORECAST_LIMIT = 7;

export function formatWeatherByLocation(
  current: KmaCurrentWeather,
  ultraShort: KmaForecastItem[],
  short: KmaForecastItem[],
  mid: KmaMidForecast[],
  now: Date,
  lat: number,
  lon: number,
): {
  location: { latitude: number; longitude: number; name: null };
  updatedAt: string;
  current: CurrentWeather;
  daily: DailyWeather[];
  hourly: HourlyWeather[];
} {
  const currentSky = findClosestForecastValue(ultraShort, 'SKY');
  const currentSkyNumber = toNumberOrNull(currentSky);

  return {
    current: {
      temperature: current.temperature,
      humidity: current.humidity,
      sky: currentSkyNumber,
      precipitationType: current.precipitationType,
      condition: getWeatherCondition(
        currentSkyNumber ?? 0,
        current.precipitationType,
      ),
      windSpeed: current.windSpeed,
      feelsLike: getFeelsLike(
        current.temperature,
        current.humidity,
        current.windSpeed,
      ),
    },
    location: { latitude: lat, longitude: lon, name: null },
    updatedAt: formatKstIsoDate(now),
    daily: mergeDailyWeather(formatDailyWeather(short), mid),
    hourly: formatHourlyWeather(short, now),
  };
}

export const getWeatherCondition = (
  sky: number,
  pty: number,
): WeatherCondition => {
  const precipitationMap: Record<number, WeatherCondition> = {
    1: 'rain',
    2: 'rain_snow',
    3: 'snow',
    4: 'shower',
  };

  if (pty !== 0) {
    return precipitationMap[pty] ?? 'unknown';
  }

  const skyMap: Record<number, WeatherCondition> = {
    1: 'clear',
    3: 'partly_cloudy',
    4: 'cloudy',
  };

  return skyMap[sky] ?? 'unknown';
};

export function getFeelsLike(
  temperature: number,
  humidity: number,
  windSpeed: number,
): number {
  const vaporPressure =
    (humidity / 100) *
    6.105 *
    Math.exp((17.27 * temperature) / (237.7 + temperature));
  const apparentTemperature =
    temperature + 0.33 * vaporPressure - 0.7 * windSpeed - 4;

  return Math.round(apparentTemperature * 10) / 10;
}

export function getMidForecast(
  landResponse: unknown,
  temperatureResponse: unknown,
  issuedDate: string,
): KmaMidForecast[] {
  const land = getFirstItem(landResponse);
  const temperature = getFirstItem(temperatureResponse);

  return Array.from({ length: 8 }, (_, index) => index + 3).map((day) => {
    const date = addDays(issuedDate, day);
    const amCondition = getMidWeatherCondition(land[`wf${day}Am`]);
    const pmCondition = getMidWeatherCondition(land[`wf${day}Pm`]);
    const probabilities = [land[`rnSt${day}Am`], land[`rnSt${day}Pm`]]
      .map(toUnknownNumber)
      .filter((value): value is number => value !== null);

    return {
      date: formatDate(date),
      minTemperature: toUnknownNumber(temperature[`taMin${day}`]),
      maxTemperature: toUnknownNumber(temperature[`taMax${day}`]),
      condition: amCondition ?? pmCondition,
      maxPrecipitationProbability:
        probabilities.length > 0 ? Math.max(...probabilities) : null,
    };
  });
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

function getFirstItem(response: unknown): Record<string, unknown> {
  const item = getItems(response)[0];

  if (!isRecord(item)) {
    throw new BadGatewayException('기상청 날씨 데이터가 없습니다.');
  }

  return item;
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
  const dailyValues = new Map<string, Map<string, Record<string, string>>>();

  for (const item of items) {
    const forecasts = dailyValues.get(item.fcstDate) ?? new Map();
    const values = forecasts.get(item.fcstTime) ?? {};
    values[item.category] = item.fcstValue;
    forecasts.set(item.fcstTime, values);
    dailyValues.set(item.fcstDate, forecasts);
  }

  return [...dailyValues.entries()]
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, forecasts]) => {
      const values = mergeForecastValues(forecasts);
      const conditionValues = findClosestDailyForecast(forecasts);

      return {
        date: formatDate(date),
        minTemperature: toNumberOrNull(values.TMN),
        maxTemperature: toNumberOrNull(values.TMX),
        condition: getWeatherConditionOrNull(
          toNumberOrNull(conditionValues?.SKY),
          toNumberOrNull(conditionValues?.PTY),
        ),
        maxPrecipitationProbability: getMaxForecastNumber(forecasts, 'POP'),
      };
    });
}

function mergeDailyWeather(
  short: DailyWeather[],
  mid: KmaMidForecast[],
): DailyWeather[] {
  const byDate = new Map(
    [...mid, ...short].map((forecast) => [forecast.date, forecast]),
  );

  return [...byDate.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, DAILY_FORECAST_LIMIT);
}

function formatHourlyWeather(
  items: KmaForecastItem[],
  now: Date,
): HourlyWeather[] {
  const start = formatForecastKey(now);
  const end = formatForecastKey(new Date(now.getTime() + 24 * 60 * 60 * 1000));
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
    .filter(([dateTime]) => dateTime >= start && dateTime < end)
    .map(([dateTime, values]) => ({
      dateTime: `${formatDate(dateTime.slice(0, 8))}T${dateTime.slice(8, 10)}:${dateTime.slice(10, 12)}:00+09:00`,
      temperature: toNumberOrNull(values.TMP),
      humidity: toNumberOrNull(values.REH),
      sky: toNumberOrNull(values.SKY),
      precipitationType: toNumberOrNull(values.PTY),
      condition: getWeatherConditionOrNull(
        toNumberOrNull(values.SKY),
        toNumberOrNull(values.PTY),
      ),
      precipitationProbability: toNumberOrNull(values.POP),
      precipitation: values.PCP ?? null,
      windSpeed: toNumberOrNull(values.WSD),
    }));
}

function formatForecastKey(date: Date): string {
  return `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, '0')}${String(date.getUTCDate()).padStart(2, '0')}${String(date.getUTCHours()).padStart(2, '0')}00`;
}

function formatKstIsoDate(date: Date): string {
  const datePart = formatDate(
    `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, '0')}${String(date.getUTCDate()).padStart(2, '0')}`,
  );
  const timePart = [
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  ]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');

  return `${datePart}T${timePart}+09:00`;
}

function getWeatherConditionOrNull(
  sky: number | null,
  pty: number | null,
): WeatherCondition | null {
  if (sky === null || pty === null) {
    return null;
  }

  return getWeatherCondition(sky, pty);
}

function mergeForecastValues(
  forecasts: Map<string, Record<string, string>>,
): Record<string, string> {
  return Object.assign({}, ...forecasts.values());
}

function findClosestDailyForecast(
  forecasts: Map<string, Record<string, string>>,
): Record<string, string> | undefined {
  return [...forecasts.entries()]
    .filter(
      ([, values]) => values.SKY !== undefined && values.PTY !== undefined,
    )
    .sort(
      ([timeA], [timeB]) =>
        Math.abs(Number(timeA) - 1200) - Math.abs(Number(timeB) - 1200),
    )[0]?.[1];
}

function getMaxForecastNumber(
  forecasts: Map<string, Record<string, string>>,
  category: string,
): number | null {
  const values = [...forecasts.values()]
    .map((forecast) => toNumberOrNull(forecast[category]))
    .filter((value): value is number => value !== null);

  return values.length > 0 ? Math.max(...values) : null;
}

function getMidWeatherCondition(value: unknown): WeatherCondition | null {
  if (typeof value !== 'string') {
    return null;
  }

  if (value.includes('소나기')) return 'shower';
  if (value.includes('비/눈') || value.includes('눈비')) return 'rain_snow';
  if (value.includes('눈')) return 'snow';
  if (value.includes('비')) return 'rain';
  if (value.includes('맑')) return 'clear';
  if (value.includes('구름많')) return 'partly_cloudy';
  if (value.includes('흐')) return 'cloudy';

  return 'unknown';
}

function toUnknownNumber(value: unknown): number | null {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return null;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function addDays(date: string, days: number): string {
  const result = new Date(
    Date.UTC(
      Number(date.slice(0, 4)),
      Number(date.slice(4, 6)) - 1,
      Number(date.slice(6, 8)) + days,
    ),
  );

  return `${result.getUTCFullYear()}${String(result.getUTCMonth() + 1).padStart(2, '0')}${String(result.getUTCDate()).padStart(2, '0')}`;
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
