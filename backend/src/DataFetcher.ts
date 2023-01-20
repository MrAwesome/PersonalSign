import OpenWeatherAPI, {Everything as WeatherEverything, Options as OpenWeatherOptions, AirPollution} from 'openweather-api-node';
import {AllData, AQIData, LocationData, ReturnedError, UncheckedAllData} from './types';

export class DataFetcher {
    private openWeatherAPI: OpenWeatherAPI | null = null;

    constructor(
        private openWeatherMapToken: string, 
        private location: LocationData,
    ) {
        this.getWeatherData = this.getWeatherData.bind(this);
        this.getWeatherData = this.getWeatherData.bind(this);
        this.getCurrentAirPollutionData = this.getCurrentAirPollutionData.bind(this);
        this.getForecastedAirPollutionData = this.getForecastedAirPollutionData.bind(this);
    }
    
    hasLocationData(): boolean {
        const {location} = this;
        const {latLong, zipCode, locationName} = location;

        return latLong !== undefined || zipCode !== undefined || locationName !== undefined;
    }

    private getOpenWeatherAPI(): OpenWeatherAPI {
        const {openWeatherMapToken, location} = this;
        const {latLong, zipCode, locationName} = location;
        if (this.openWeatherAPI === null) {
            const openWeatherOpts: OpenWeatherOptions = {
                key: openWeatherMapToken,
                units: 'imperial', // TODO: make this configurable
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
        const data = await api.getEverything();

        // TODO: handle errors

        return data;
    }

    async getCurrentAirPollutionData(): Promise<AirPollution | ReturnedError> {
        const api = this.getOpenWeatherAPI()
        const data = await api.getCurrentAirPollution();

        // TODO: handle errors

        return data;
    }

    async getForecastedAirPollutionData(): Promise<AirPollution[] | ReturnedError> {
        const api = this.getOpenWeatherAPI()
        const data = await api.getForecastedAirPollution();

        // TODO: handle errors

        return data;
    }

    async getAllData(): Promise<UncheckedAllData> {
        const [uncheckedAqiData, uncheckedWeatherData] = await Promise.all([
            this.getCurrentAirPollutionData(),
            this.getWeatherData(),
        ]);

        return {
            uncheckedAqiData,
            uncheckedWeatherData,
        }
    }
}

//import fetch from 'node-fetch';
//const AQICN_BASE_URL = 'http://api.waqi.info/feed';
//const OPENWEATHERMAP_BASE_URL = 'https://api.openweathermap.org/data/2.5/onecall';
//
//export async function getAqiData(aqicnToken: string, aqicnID: string): Promise<AQIData | ReturnedError> {
//    const url = `${AQICN_BASE_URL}/${aqicnID}?token=${aqicnToken}`;
//    const resp = await fetch(url);
//    const obj = await resp.json();
//
//    if (obj.status !== 'ok') {
//        return {error: `Bad response from AQICN: ${obj.status}`};
//    }
//
//    const aqi = obj['data']['aqi'];
//    const city = obj['data']['city'];
//
//    const latLong = city['geo'];
//    const cityName = city['name'];
//
//    return {aqi, latLong, cityName};
//}
//
//
//export async function getOpenWeatherData(openWeatherMapToken: string, latLong: [number, number]): Promise<OpenWeatherData | ReturnedError> {
//    const [lat, long] = latLong;
//    const url = `${OPENWEATHERMAP_BASE_URL}?lat=${lat}&lon=${long}&appid=${openWeatherMapToken}&units=imperial`;
//
//    const resp = await fetch(url);
//    const obj = await resp.json();
//
//    if (obj["current"] === undefined) {
//        return {error: `Bad response from OpenWeatherMap: ${obj.cod}`};
//    }
//
//    const openWeatherData = obj;
//
//    return openWeatherData;
//}
