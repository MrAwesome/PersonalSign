import fs from 'fs';
import {ZIP_TO_DATA} from './data';
import {HtmlBodyGenerator} from './generateHtmlBody';
import {DataFetcher} from "./DataFetcher";
import {CityData, err, ReturnedError} from './types';
import {DEFAULT_MUST_REPLACE_STRING, Options} from './schemas/config';
import {DIR_NAME} from './constants';
import readAndValidateConfig from './readAndValidateConfig';

const readFile = fs.promises.readFile;
const writeFile = fs.promises.writeFile;
const mkdir = fs.promises.mkdir;
const exists = fs.promises.access;

async function generateFinalHtml(cityData: CityData, openWeatherMapToken: string, htmlSkeleton: string, cssBody: string): Promise<{html: string} | ReturnedError> {
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

async function getKeyAndSkeletons() {
    const [htmlSkeleton, cssBody] = await Promise.all([
        readFile('./src/skeleton.html', 'utf8'),
        readFile('./src/style.css', 'utf8'),
    ].map(p => p.then(x => x.trim())));

    return {htmlSkeleton, cssBody};
}

// TODO: abstract away, and also allow for reading from env var
// TODO: document
// TODO: set up data structures and way to decide which/if api to use
async function getLocationIQApiKey(): Promise<string> {
    if (process.env.LOCATIONIQ_API_KEY) {
        return process.env.LOCATIONIQ_API_KEY.trim();
    }
    const locationIQApiKey = await readFile('.locationiq_api_key', 'utf8');
    return locationIQApiKey.trim();
}

async function writeOutTestFile(finalHtml: string) {
    const memExists = (await exists('/mem').catch(() => false)) !== false;

    const dirPrefix = memExists ? '/mem' : '/tmp';
    const dir = `${dirPrefix}/${DIR_NAME}`;

    await mkdir(dir, {recursive: true});

    const targetFile = `${dir}/index.html`;
    await writeFile(targetFile, finalHtml, 'utf8');
    console.log(`Succesfully wrote output to ${targetFile}`);
}



(async () => {
    const {htmlSkeleton, cssBody} = await getKeyAndSkeletons();
    const cityData = ZIP_TO_DATA['94103'];

    // if config.json doesn't exist, create it and populate it with default values: openweathermap as weather provider, openstreetmap as location provider
    // if config.json exists, read it, validate it with zod, and use the values in it

    const config = await readAndValidateConfig();

    const openWeatherMapToken = config.weather.options.openweathermap.apiKey;
    const finalHtmlOrErr = await generateFinalHtml(cityData, openWeatherMapToken, htmlSkeleton, cssBody);

    if ("error" in finalHtmlOrErr) {
        console.error("Error generating HTML", finalHtmlOrErr.error);
        return;
    }
    const finalHtml = finalHtmlOrErr.html;

    await writeOutTestFile(finalHtml);
})();
