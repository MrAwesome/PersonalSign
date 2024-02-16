import {DataFetcher} from "../DataFetcher";
import readAndValidateConfig from "../readAndValidateConfig";
import parseArgs from "minimist";
import {locationDataFromText} from "../utils";

let at = "NYC";
const args = parseArgs(process.argv.slice(2), {boolean: true});

process.stderr.write(JSON.stringify(args, undefined, 4));

if (args._.length === 0) {
    process.stderr.write("No location argument given, defaulting to 'NYC'.")
} else {
    at = args._.join(" ")
}

(async () => {
    const config = await readAndValidateConfig();
    const locationData = locationDataFromText(at);

    const openWeatherMapToken = config.weather.options.openweathermap.apiKey;
    const dataFetcher = new DataFetcher(openWeatherMapToken, locationData, "imperial");
    let res: any;
    if (args.aqi) {
        res = await dataFetcher.getCurrentAirPollutionData();
    } else if (args.futureaqi) {
        res = await dataFetcher.getForecastedAirPollutionData();
    } else {
        res = await dataFetcher.getAllData();
    }
    const resText = JSON.stringify(res, undefined, 4);
    console.log(resText);
})()
