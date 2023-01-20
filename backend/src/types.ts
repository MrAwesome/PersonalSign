import {Everything as WeatherEverything, AirPollution} from 'openweather-api-node';

export interface ReturnedError {
    error: true;
    message: string;
}

export interface UncheckedAllData {
    uncheckedAqiData: AirPollution | ReturnedError;
    uncheckedWeatherData: WeatherEverything | ReturnedError;
}

export interface CityData {
    displayName: string;
    aqicnID: string;
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
