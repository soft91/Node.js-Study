import { describe, expect, it } from 'vitest';
import {
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
});
