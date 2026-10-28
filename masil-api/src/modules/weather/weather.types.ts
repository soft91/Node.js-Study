export interface LocationCoordinates {
  /** 위도 (WGS84) */
  lat: number;
  /** 경도 (WGS84) */
  lon: number;
}

export interface GridCoordinates {
  /** 기상청 격자 X 좌표 (동서 방향) */
  nx: number;
  /** 기상청 격자 Y 좌표 (남북 방향) */
  ny: number;
}

export interface BaseDateTime {
  /** 기상청 API의 기준 날짜 (`yyyyMMdd`) */
  baseDate: string;
  /** 기상청 API의 기준 시각 (`HHmm`) */
  baseTime: string;
}

export interface WeatherByLocation {
  /** 현재 관측 날씨 */
  current: CurrentWeather;
  /** 일별 최저·최고 기온 예보 */
  daily: DailyWeather[];
  /** 시간별 날씨 예보 */
  hourly: HourlyWeather[];
}

export interface KmaCurrentWeather {
  /** 현재 기온 (섭씨) */
  temperature: number;
  /** 상대 습도 (퍼센트) */
  humidity: number;
  /** 1시간 강수량 */
  precipitation: string;
  /** 강수 형태 코드 (없음: 0, 비: 1, 비/눈: 2, 눈: 3, 소나기: 5) */
  precipitationType: number;
  /** 풍속 (m/s) */
  windSpeed: number;
  /** 풍향 (각도) */
  windDirection: number;
}

export interface CurrentWeather {
  /** 현재 기온 (섭씨) */
  temperature: number;
  /** 상대 습도 (퍼센트) */
  humidity: number;
  /** 하늘 상태 코드 (맑음: 1, 구름 많음: 3, 흐림: 4) */
  sky: number | null;
  /** 강수 형태 코드 */
  precipitationType: number;
  /** 풍속 (m/s) */
  windSpeed: number;
  /** 체감 온도 (현재 미계산) */
  feelsLike: number | null;
}

export interface DailyWeather {
  /** 예보 날짜 (`yyyy-MM-dd`) */
  date: string;
  /** 최저 기온 (섭씨) */
  minTemperature: number | null;
  /** 최고 기온 (섭씨) */
  maxTemperature: number | null;
}

export interface HourlyWeather {
  /** 예보 일시 (KST ISO 8601) */
  dateTime: string;
  /** 기온 (섭씨) */
  temperature: number | null;
  /** 하늘 상태 코드 */
  sky: number | null;
  /** 강수 형태 코드 */
  precipitationType: number | null;
  /** 강수 확률 (퍼센트) */
  precipitationProbability: number | null;
  /** 강수량 */
  precipitation: string | null;
}

export interface KmaWeatherItem {
  /** 기상청 관측 요소 코드 (예: `T1H`, `REH`, `WSD`) */
  category: string;
  /** 관측 요소의 값 */
  obsrValue: string;
}

export interface KmaForecastItem {
  /** 기상청 예보 요소 코드 (예: `SKY`, `TMN`, `TMX`, `POP`) */
  category: string;
  /** 예보 날짜 (`yyyyMMdd`) */
  fcstDate: string;
  /** 예보 시각 (`HHmm`) */
  fcstTime: string;
  /** 예보 요소의 값 */
  fcstValue: string;
}
