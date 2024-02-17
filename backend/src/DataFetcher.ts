import OpenWeatherAPI, {Everything as WeatherEverything, Options as OpenWeatherOptions, AirPollution} from 'openweather-api-node';
import {ImperialOrMetric, LocationData, ReturnedError, UncheckedAllData} from './types';
import {tryProm} from './utils';

// TODO: handle location data not being available, give graceful error which includes the given address and offers alternatives

export class DataFetcher {
    private openWeatherAPI: OpenWeatherAPI | null = null;

    constructor(
        private openWeatherMapToken: string, 
        private location: LocationData,
        private imperialOrMetric: ImperialOrMetric,
    ) {
        this.getCurrentAirPollutionData = this.getCurrentAirPollutionData.bind(this);
        //this.getForecastedAirPollutionData = this.getForecastedAirPollutionData.bind(this);
        this.getOpenWeatherAPI = this.getOpenWeatherAPI.bind(this);
        this.getWeatherData = this.getWeatherData.bind(this);
        this.getAllData = this.getAllData.bind(this);
    }
    
    hasLocationData(): boolean {
        const {location} = this;
        const {latLong, zipCode, locationName} = location;

        return latLong !== undefined || zipCode !== undefined || locationName !== undefined;
    }

    private getOpenWeatherAPI(): OpenWeatherAPI {
        const {openWeatherMapToken, location, imperialOrMetric} = this;
        const {latLong, zipCode, locationName} = location;
        if (this.openWeatherAPI === null) {
            const openWeatherOpts: OpenWeatherOptions = {
                key: openWeatherMapToken,
                units: imperialOrMetric, // TODO: make this configurable
            }

            if (latLong !== undefined) {
                openWeatherOpts.coordinates = {
                    lat: latLong[0],
                    lon: latLong[1],
                };
            }

            if (zipCode !== undefined) {
                openWeatherOpts.zipCode = zipCode;
            }

            if (locationName !== undefined) {
                openWeatherOpts.locationName = locationName;
            }


            this.openWeatherAPI = new OpenWeatherAPI(openWeatherOpts);
        }

        return this.openWeatherAPI;

    }

    async getWeatherData(): Promise<WeatherEverything | ReturnedError> {
        const api = this.getOpenWeatherAPI()
        return tryProm(async () => api.getEverything());
    }

    async getCurrentAirPollutionData(): Promise<AirPollution | ReturnedError> {
        const api = this.getOpenWeatherAPI()
        return tryProm(async () => api.getCurrentAirPollution());
    }

//    async getForecastedAirPollutionData(): Promise<AirPollution[] | ReturnedError> {
//        const api = this.getOpenWeatherAPI()
//        return tryProm(async () => api.getForecastedAirPollution());
//    }

    async getAllData(): Promise<UncheckedAllData> {
        const [
            uncheckedWeatherData,
            uncheckedCurrentAirPollutionData,
            //uncheckedForecastedAirPollutionData,
        ] = await Promise.all([
            this.getWeatherData(),
            this.getCurrentAirPollutionData(),
            //this.getForecastedAirPollutionData(),
        ]);

        return {
            uncheckedWeatherData,
            uncheckedCurrentAirPollutionData,
            //uncheckedForecastedAirPollutionData,
        }
    }
}
