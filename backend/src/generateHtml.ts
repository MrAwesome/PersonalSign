import {DataFetcher} from "./DataFetcher";
import {HtmlBodyGenerator} from "./generateHtmlBody";
import {CityData, err, ImperialOrMetric, ReturnedError, UserAgentInfo} from "./types";

export async function generateFinalHtml(ua: UserAgentInfo, cityData: CityData, openWeatherMapToken: string, htmlSkeleton: string, cssBody: string, imperialOrMetric: ImperialOrMetric): Promise<{html: string} | ReturnedError> {
    const dataFetcher = new DataFetcher(openWeatherMapToken, cityData.location, imperialOrMetric);
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

    const bodyGenerator = new HtmlBodyGenerator(ua, cityData, currentAirPollutionData, weatherData, imperialOrMetric);
    const htmlBody = bodyGenerator.generateHtmlBody();

    const finalHtml = htmlSkeleton
        .replace("/* CSS-REPLACE */", cssBody)
        .replace("<!-- BODY-REPLACE -->", htmlBody);

    return {html: finalHtml};
}
