import {DataFetcher} from "./DataFetcher";
import {HtmlBodyGenerator} from "./generateHtmlBody";
import {CityData, err, ReturnedError} from "./types";

export async function generateFinalHtml(cityData: CityData, openWeatherMapToken: string, htmlSkeleton: string, cssBody: string): Promise<{html: string} | ReturnedError> {
    const dataFetcher = new DataFetcher(openWeatherMapToken, cityData.location);
    const {uncheckedCurrentAirPollutionData, uncheckedWeatherData} = await dataFetcher.getAllData();

    if ("error" in uncheckedCurrentAirPollutionData) {
        const {message} = uncheckedCurrentAirPollutionData;
        console.error("Error fetching AQI data", message);
        // TODO: display on page
        return err("Error fetching AQI data");
    }
    const currentAirPollutionData = uncheckedCurrentAirPollutionData;

    if ("error" in uncheckedWeatherData) {
        const {message} = uncheckedWeatherData;
        console.error("Error fetching weather data", message);
        return err("Error fetching weather data");
    }
    const weatherData = uncheckedWeatherData;

    //writeFile('/tmp/everything.json', JSON.stringify({currentAirPollutionData, weatherData}, null, 2));

    const bodyGenerator = new HtmlBodyGenerator(cityData, currentAirPollutionData, weatherData);
    const htmlBody = bodyGenerator.generateHtmlBody();

    const finalHtml = htmlSkeleton
        .replace("/* CSS-REPLACE */", cssBody)
        .replace("<!-- BODY-REPLACE -->", htmlBody);

    return {html: finalHtml};
}
