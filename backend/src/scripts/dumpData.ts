import {DataFetcher} from "../DataFetcher";
import readAndValidateConfig from "../readAndValidateConfig";
import type {LocationData} from "../types";

let zipCode = "10001";
if (!process.argv[2]) {
    process.stderr.write("No zipcode argument given, defaulting to 10001.")
} else {
    zipCode = process.argv[2];
}

(async () => {
    const config = await readAndValidateConfig();
    const locationData: LocationData = {
        zipCode,
    };

    const openWeatherMapToken = config.weather.options.openweathermap.apiKey;
    const dataFetcher = new DataFetcher(openWeatherMapToken, locationData, "imperial");
    const res = await dataFetcher.getAllData();
    const resText = JSON.stringify(res, undefined, 4);
    console.log(resText);
})()
