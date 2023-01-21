import fs from 'fs';
import {ZIP_TO_DATA} from './data';
import {HtmlBodyGenerator} from './generateHtmlBody';
import {DataFetcher} from "./DataFetcher";

const readFile = fs.promises.readFile;
const writeFile = fs.promises.writeFile;
const mkdir = fs.promises.mkdir;
const dirExists = fs.promises.access;

(async () => {
    const [openWeatherMapToken, htmlSkeleton] = await Promise.all([
        readFile('.openweathermap_api_key', 'utf8'),
        readFile('./src/skeleton.html', 'utf8'),
    ].map(p => p.then(x => x.trim())));

    const cityData = ZIP_TO_DATA['94103'];

    const dataFetcher = new DataFetcher(openWeatherMapToken, cityData.location);
    
    const {uncheckedAqiData, uncheckedWeatherData} = await dataFetcher.getAllData();

    if ("error" in uncheckedAqiData) {
        console.error("Error fetching AQI data", uncheckedAqiData.error);
        // TODO: display on page
        return;
    }
    const aqiData = uncheckedAqiData;

    if ("error" in uncheckedWeatherData) {
        console.error("Error fetching weather data", uncheckedWeatherData.error);
        return;
    }
    const weatherData = uncheckedWeatherData;

    writeFile('/tmp/everything.json', JSON.stringify({aqiData, weatherData}, null, 2));

    const bodyGenerator = new HtmlBodyGenerator(cityData, aqiData, weatherData);
    const htmlBody = bodyGenerator.generateHtmlBody();

    const finalHtml = htmlSkeleton.replace("<!-- BODY -->", htmlBody);

    let dir;
    const memExists = (await dirExists('/mem').catch(() => false)) !== false;
    if (memExists) {
        dir = '/mem/personalsign';
    } else {
        dir = '/tmp/personalsign';
    };

    await mkdir(dir, {recursive: true});

    const targetFile = `${dir}/index.html`;
    await writeFile(targetFile, finalHtml, 'utf8');
    console.log(`Succesfully wrote output to ${targetFile}`);
})();
