import fs from 'fs';
import {ZIP_TO_DATA} from './data';
import {DIR_NAME} from './constants';
import readAndValidateConfig from './readAndValidateConfig';
import {generateFinalHtml} from './generateHtml';

const readFile = fs.promises.readFile;
const writeFile = fs.promises.writeFile;
const mkdir = fs.promises.mkdir;
const exists = fs.promises.access;

// TODO: move files from here into their own files
// TODO: add tests
// TODO: add documentation
// TODO: add caching (simple file/memory cache for now is plenty, so you can run it locally many times for testing)
//          (hash based on the location object? or just on which location was actually used / passed to the API?)
// TODO: look up the granularity of lat/long that's most useful to cap at

async function getKeyAndSkeletons() {
    const [htmlSkeleton, cssBody] = await Promise.all([
        readFile('./src/skeleton.html', 'utf8'),
        readFile('./src/style.css', 'utf8'),
    ].map(p => p.then(x => x.trim())));

    return {htmlSkeleton, cssBody};
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
