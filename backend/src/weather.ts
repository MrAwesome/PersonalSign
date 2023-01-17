import fetch from 'node-fetch';
import {AQIData, OpenWeatherData, ReturnedError} from './types';

const AQICN_BASE_URL = 'http://api.waqi.info/feed';
const OPENWEATHERMAP_BASE_URL = 'https://api.openweathermap.org/data/2.5/onecall';

export async function getAqiData(aqicnToken: string, aqicnID: string): Promise<AQIData | ReturnedError> {
    const url = `${AQICN_BASE_URL}/${aqicnID}?token=${aqicnToken}`;
    const resp = await fetch(url);
    const obj = await resp.json();

    if (obj.status !== 'ok') {
        return {error: `Bad response from AQICN: ${obj.status}`};
    }

    const aqi = obj['data']['aqi'];
    const city = obj['data']['city'];

    const latLong = city['geo'];
    const cityName = city['name'];

    return {aqi, latLong, cityName};
}

export async function getOpenWeatherData(openWeatherMapToken: string, latLong: [number, number]): Promise<OpenWeatherData | ReturnedError> {
    const [lat, long] = latLong;
    const url = `${OPENWEATHERMAP_BASE_URL}?lat=${lat}&lon=${long}&appid=${openWeatherMapToken}&units=imperial`;

    const resp = await fetch(url);
    const obj = await resp.json();

    if (obj["current"] === undefined) {
        return {error: `Bad response from OpenWeatherMap: ${obj.cod}`};
    }

    const openWeatherData = obj;

    return openWeatherData;
}
