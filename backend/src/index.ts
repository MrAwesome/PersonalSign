import fs from 'fs';
import {ZIP_TO_DATA} from './data';
import {HtmlBodyGenerator} from './generateHtmlBody';
import {DataFetcher} from "./DataFetcher";
import {CityData, err, ReturnedError} from './types';

const readFile = fs.promises.readFile;
const writeFile = fs.promises.writeFile;
const mkdir = fs.promises.mkdir;
const dirExists = fs.promises.access;

const DIR_NAME = 'personalsign';

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
    const [openWeatherMapToken, htmlSkeleton, cssBody] = await Promise.all([
        readFile('.openweathermap_api_key', 'utf8'),
        readFile('./src/skeleton.html', 'utf8'),
        readFile('./src/style.css', 'utf8'),
    ].map(p => p.then(x => x.trim())));

    return {openWeatherMapToken, htmlSkeleton, cssBody};
}

async function writeOutTestFile(finalHtml: string) {
    const memExists = (await dirExists('/mem').catch(() => false)) !== false;

    const dirPrefix = memExists ? '/mem' : '/tmp';
    const dir = `${dirPrefix}/${DIR_NAME}`;

    await mkdir(dir, {recursive: true});

    const targetFile = `${dir}/index.html`;
    await writeFile(targetFile, finalHtml, 'utf8');
    console.log(`Succesfully wrote output to ${targetFile}`);
}

(async () => {
    const {openWeatherMapToken, htmlSkeleton, cssBody} = await getKeyAndSkeletons();
    const cityData = ZIP_TO_DATA['94103'];

    const finalHtmlOrErr = await generateFinalHtml(cityData, openWeatherMapToken, htmlSkeleton, cssBody);

    if ("error" in finalHtmlOrErr) {
        console.error("Error generating HTML", finalHtmlOrErr.error);
        return;
    }
    const finalHtml = finalHtmlOrErr.html;

    await writeOutTestFile(finalHtml);
})();
