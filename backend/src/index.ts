import fs from 'fs';
//import {ZIP_TO_DATA} from './data';
//import {DIR_NAME} from './constants';
import readAndValidateConfig from './readAndValidateConfig';
import {generateFinalHtml} from './generateHtml';
import {startSimpleHttpServer} from './startSimpleHttpServer';
import {ImperialOrMetric, LocationData} from './types';

const readFile = fs.promises.readFile;
//const writeFile = fs.promises.writeFile;
//const mkdir = fs.promises.mkdir;
//const exists = fs.promises.access;

// TODO: include weather alerts
// TODO: AQI forecast
// TODO: OpenAI GPT-3 for weather descriptions
// TODO: try background-color + height instead of unicode block chars
// TODO: move files from here into their own files
// TODO: add tests
// TODO: add documentation
// TODO: add caching (simple file/memory cache for now is plenty, so you can run it locally many times for testing)
//          (hash based on the location object? or just on which location was actually used / passed to the API?)
// TODO: look up the granularity of lat/long that's most useful to cap at

async function getHtmlAndStyleFiles() {
    const [htmlSkeleton, cssBody] = await Promise.all([
        readFile('./src/skeleton.html', 'utf8'),
        readFile('./src/style.css', 'utf8'),
    ].map(p => p.then(x => x.trim())));

    return {htmlSkeleton, cssBody};
}

(async () => {
    const {htmlSkeleton, cssBody} = await getHtmlAndStyleFiles();
    //const cityData = ZIP_TO_DATA['94103'];

    // if config.json doesn't exist, create it and populate it with default values: openweathermap as weather provider, openstreetmap as location provider
    // if config.json exists, read it, validate it with zod, and use the values in it

    const config = await readAndValidateConfig();

    const openWeatherMapToken = config.weather.options.openweathermap.apiKey;
    const generateHtml = async (locationData: LocationData, imperialOrMetric: ImperialOrMetric) => {
        // TODO: Fix displayname to come from cached geocoding
        const cityData = {location: locationData, displayName: ""};
        const finalHtmlOrErr = await generateFinalHtml(cityData, openWeatherMapToken, htmlSkeleton, cssBody, imperialOrMetric);
        if ("error" in finalHtmlOrErr) {
            return `Error: ${finalHtmlOrErr.error}`;
        }
        
        const finalHtml = finalHtmlOrErr.html;
        return finalHtml;

    };
    while (true) {
        try {
            await startSimpleHttpServer(generateHtml);
            break;
        } catch (e) {
            console.error("Error in HTTP server: ", e);
            console.error("Retrying in 5 seconds...");
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    //await writeOutTestFile(finalHtml);
})();
