export interface ReturnedError {
    error: string;
}

export interface CityData {
    name: string;
    aqicnID: string;
    latLong: [number, number];
    standardPressure: number;
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

export interface OpenWeatherConditions extends OpenWeatherBase {
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
    dew_point: number;
    uvi: number;
    clouds: number; // cloudiness %
    visibility: number; // visibility in meters
    wind_speed: number; // wind speed in m/s
    wind_deg: number; // wind direction in degrees
    wind_gust: number; // wind gust in m/s
    weather: OpenWeatherDescriptionAndIcon[];
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

export interface OpenWeatherDaily extends OpenWeatherBase {
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

    pressure: number;
    humidity: number;
    dew_point: number;
    wind_speed: number;
    wind_deg: number;
    wind_gust: number;
    weather: OpenWeatherDescriptionAndIcon[];
    clouds: number; // cloudiness %
    pop: number; // probability of precipitation
    uvi: number; // UV index
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
