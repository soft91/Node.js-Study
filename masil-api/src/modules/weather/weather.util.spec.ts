import { describe, expect, it } from 'vitest';
import {
  formatWeatherByLocation,
  getFeelsLike,
  getMidForecast,
  getWeatherCondition,
} from './weather.util.js';

describe('weather utilities', () => {
  it('converts KMA sky and precipitation codes to a condition', () => {
    expect(getWeatherCondition(1, 0)).toBe('clear');
    expect(getWeatherCondition(3, 0)).toBe('partly_cloudy');
    expect(getWeatherCondition(4, 0)).toBe('cloudy');
    expect(getWeatherCondition(1, 1)).toBe('rain');
    expect(getWeatherCondition(1, 4)).toBe('shower');
  });

  it('calculates apparent temperature to one decimal place', () => {
    expect(getFeelsLike(10.6, 80, 2.3)).toBe(8.4);
  });

  it('combines middle-range land and temperature forecasts', () => {
    const response = (item: Record<string, string>) => ({
      response: { body: { items: { item: [item] } } },
    });
    const forecasts = getMidForecast(
      response({
        wf3Am: '맑음',
        wf3Pm: '비',
        rnSt3Am: '20',
        rnSt3Pm: '60',
      }),
      response({ taMin3: '9', taMax3: '19' }),
      '20261027',
    );

    expect(forecasts[0]).toEqual({
      date: '2026-10-30',
      minTemperature: 9,
      maxTemperature: 19,
      condition: 'clear',
      maxPrecipitationProbability: 60,
    });
  });

  it('keeps middle-range temperatures when the short-range forecast has none', () => {
    const weather = formatWeatherByLocation(
      {
        temperature: 10,
        humidity: 60,
        precipitation: '0',
        precipitationType: 0,
        windSpeed: 1,
        windDirection: 0,
      },
      [
        {
          category: 'SKY',
          fcstDate: '20261105',
          fcstTime: '0000',
          fcstValue: '4',
        },
      ],
      [
        {
          category: 'SKY',
          fcstDate: '20261105',
          fcstTime: '1200',
          fcstValue: '4',
        },
        {
          category: 'PTY',
          fcstDate: '20261105',
          fcstTime: '1200',
          fcstValue: '0',
        },
        {
          category: 'POP',
          fcstDate: '20261105',
          fcstTime: '1200',
          fcstValue: '30',
        },
      ],
      [
        {
          date: '2026-11-05',
          minTemperature: 7,
          maxTemperature: 18,
          condition: 'clear',
          maxPrecipitationProbability: 20,
        },
      ],
      new Date(Date.UTC(2026, 10, 2, 0, 0, 0)),
      37.5665,
      126.978,
    );

    expect(weather.daily).toEqual([
      {
        date: '2026-11-05',
        minTemperature: 7,
        maxTemperature: 18,
        condition: 'cloudy',
        maxPrecipitationProbability: 30,
      },
    ]);
  });
});
