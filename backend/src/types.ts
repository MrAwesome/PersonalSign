import {Everything as WeatherEverything, AirPollution} from 'openweather-api-node';

export class ReturnedError {
    error: true = true;
    message: string;

    private constructor(message: string) {
        this.message = message;
    }

    static err(message: string): ReturnedError {
        return new ReturnedError(message);
    }
}

export const err = ReturnedError.err;

export type ImperialOrMetric = 'imperial' | 'metric';

export interface UncheckedAllData {
    uncheckedWeatherData: WeatherEverything | ReturnedError;
    uncheckedCurrentAirPollutionData: AirPollution | ReturnedError;
    uncheckedForecastedAirPollutionData: AirPollution[] | ReturnedError;
}

export interface CityData {
    displayName: string;
    aqicnID?: string;
    location: LocationData;
}

// Listed in the order of priority - higher up items will take precedence
interface LocationDataOptional {
  latLong?: [number, number];
  zipCode?: string;
  locationName?: string;
}

type AtLeastOneField = {
  latLong: [number, number];
} | {
  zipCode: string;
} | {
  locationName: string;
}

export type LocationData = LocationDataOptional & AtLeastOneField;

export interface UserAgentInfo {
    skipUnicodeTextModeOverride?: boolean,
}
