import fs from 'fs';
import {ZIP_TO_DATA} from './data';
import {HtmlBodyGenerator} from './generateHtmlBody';
import {noop} from "./utils";
import {getAqiData, getOpenWeatherData} from "./weather";

const readFile = fs.promises.readFile;
const writeFile = fs.promises.writeFile;

(async () => {
    const [aqicnToken, openWeatherMapToken, htmlSkeleton] = await Promise.all([
        readFile('.aqicn_api_key', 'utf8'),
        readFile('.openweathermap_api_key', 'utf8'),
        readFile('./src/skeleton.html', 'utf8'),
    ].map(p => p.then(x => x.trim())));
    
    const cityData = ZIP_TO_DATA['85701'];
    const aqiData = await getAqiData(aqicnToken, cityData.aqicnID);
    const openWeatherData = await getOpenWeatherData(openWeatherMapToken, cityData.latLong);

    if ("error" in openWeatherData) {
        console.error(openWeatherData.error);
        return;
    }

    if ("error" in aqiData) {
        console.error(aqiData.error);
        return;
    }

    const bodyGenerator = new HtmlBodyGenerator(cityData, aqiData, openWeatherData);
    const htmlBody = bodyGenerator.generateHtmlBody();

    //const {sunset,sunrise,temp,feels_like,pressure,humidity,wind_speed,wind_deg,clouds,weather} = openWeatherData.current;
    //console.log(`The current temperature in ${cityData.name} is ${temp}°F, but it feels like ${feels_like}°F.`);

    await writeFile('/tmp/weather.html', htmlSkeleton.replace('<!-- BODY -->', htmlBody), 'utf8');


    noop(aqiData);
    noop(openWeatherData);
})();
