import fs from 'fs';
import colors from 'colors';
import {CONFIG_JSON_ENV_VAR, CONFIG_LOCATION_ENV_VAR, DEFAULT_CONFIG_FILE_NAME} from './constants';
import {DEFAULT_CONFIG, Options, optionsSchema} from './schemas/config';

const readFile = fs.promises.readFile;
const writeFile = fs.promises.writeFile;
const exists = fs.promises.access;

async function readConfigInternal(unparsedConfigPassedDirectly?: any): Promise<any> {
    let configContents: string;
    let source: string;
    if (unparsedConfigPassedDirectly) {
        configContents = unparsedConfigPassedDirectly;
        source = 'the config passed directly to readAndValidateConfig';
    } else if (process.env[CONFIG_JSON_ENV_VAR]) {
        configContents = process.env[CONFIG_JSON_ENV_VAR];
        source = `the environment variable "${CONFIG_JSON_ENV_VAR}"`;
    } else if (process.env[CONFIG_LOCATION_ENV_VAR]) {
        const location = process.env[CONFIG_LOCATION_ENV_VAR];

        try {
            configContents = await readFile(location, 'utf8');
            source = `the file "${location}", from the environment variable "${CONFIG_LOCATION_ENV_VAR}"`;
        } catch (e) {
            console.log(e);
            console.error(`[ERROR] The "${CONFIG_LOCATION_ENV_VAR}" environment variable was set to "${location}", but that file does not appear to exist.`);
            process.exit(1);
        }
    } else {
        const configFileExists = await exists(DEFAULT_CONFIG_FILE_NAME).catch(() => false) !== false;

        if (!configFileExists) {
            await writeFile(DEFAULT_CONFIG_FILE_NAME, JSON.stringify(DEFAULT_CONFIG, null, 2));
        }

        try {
            configContents = await readFile(DEFAULT_CONFIG_FILE_NAME, 'utf8');
            source = `the config file "${DEFAULT_CONFIG_FILE_NAME}"`;
            source.toUpperCase();
        } catch (e) {
            console.log(e);
            console.error(`[ERROR] The "${DEFAULT_CONFIG_FILE_NAME}" file does not appear to exist. It should be generated automatically when you run the app for the first time. Do you have write access to the directory you're running the app from?`);
            process.exit(1);
        }
    }

    return {source, configContents};
}

function convertToJSON(configContents: string, source: string): any {
    let unparsedConfig: any;
    try {
        unparsedConfig = JSON.parse(configContents);
    } catch (e) {
        console.log(e);
        console.error(`[ERROR] ${source} does not appear to contain valid JSON. Contents:\n${configContents}`);
        process.exit(1);
    }

    return unparsedConfig;
}

function parseConfig(unparsedConfig: any, source: string): any {
    process.stderr.write(`Using config from ${source}...\n`);
    const parsed = optionsSchema.safeParse(unparsedConfig);

    if (!parsed.success) {
        console.error(`[ERROR] Error parsing config from ${source}!`);
        parsed.error.issues.forEach((issue) => {
            const msg = colors.red(issue.path.join('.')) + ': ' + issue.message;
            console.error(msg);
        });
        process.exit(1);
    } else {
        return parsed.data;
    }
}

export default async function readAndValidateConfig(unparsedConfigPassedDirectly?: any): Promise<Options> {
    const {configContents, source} = await readConfigInternal(unparsedConfigPassedDirectly);
    const unparsedConfig = convertToJSON(configContents, source);
    return parseConfig(unparsedConfig, source);
}
