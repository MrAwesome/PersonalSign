export interface ReturnedError {
    error: string;
}

export interface CityData {
    name: string;
    aqicnID: string;
    latLong: [number, number];
}

export interface AQIData {
    aqi: number;
    latLong: [number, number];
    cityName: string;
}

export interface OpenWeatherData {
    lat: number;
    lon: number;
    timezone: string;
    timezone_offset: number; // offset from UTC in seconds
    current: OpenWeatherCurrent;
    minutely: OpenWeatherMinutely[]; // current minute + 60 minutes
    hourly: OpenWeatherHourly[]; // current hour + 47 hours
    daily: OpenWeatherDaily[]; // today + 7 days
    alerts: OpenWeatherAlert[];
}

export interface OpenWeatherBase {
    dt: number;
}

export interface OpenWeatherBasics extends OpenWeatherBase {
    pressure: number;
    humidity: number;
    dew_point: number;
    uvi: number; // UV index
    clouds: number; // cloudiness %
    wind_speed: number; // wind speed in m/s
    wind_deg: number; // wind direction in degrees
    wind_gust?: number; // wind gust in m/s
    rain?: number; // rain volume for last hour in mm
    snow?: number; // snow volume for last hour in mm
    weather: OpenWeatherDescriptionAndIcon[];
}

export interface OpenWeatherConditions extends OpenWeatherBasics {
    temp: number;
    feels_like: number;
    visibility: number; // visibility in meters
}

export interface OpenWeatherCurrent extends OpenWeatherConditions {
    sunrise: number;
    sunset: number;
}

export interface OpenWeatherMinutely extends OpenWeatherBase {
    precipitation: number; // mm
}

export interface OpenWeatherHourly extends OpenWeatherConditions {
    pop: number; // probability of precipitation
}

export interface OpenWeatherDaily extends OpenWeatherBasics {
    sunrise: number;
    sunset: number;
    moonrise: number;
    moonset: number;
    moon_phase: number;

    temp: {
        day: number;
        min: number;
        max: number;
        night: number;
        eve: number;
        morn: number;
    };

    feels_like: {
        day: number;
        night: number;
        eve: number;
        morn: number;
    };

    pop: number; // probability of precipitation
}

export interface OpenWeatherAlert {
    sender_name: string;
    event: string;
    start: number;
    end: number;
    description: string;
    tags: string[];
}

export interface OpenWeatherDescriptionAndIcon {
    id: number;
    main: string;
    description: string;
    icon: string;
}
