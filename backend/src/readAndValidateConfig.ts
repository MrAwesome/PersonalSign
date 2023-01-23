import fs from 'fs';
import z from 'zod';
import colors from 'colors';
import {CONFIG_JSON_ENV_VAR, CONFIG_LOCATION_ENV_VAR, DEFAULT_CONFIG_FILE_NAME} from './constants';
import {DEFAULT_CONFIG, DEFAULT_MUST_REPLACE_STRING, Options, optionsSchema} from './schemas/config';

const readFile = fs.promises.readFile;
const writeFile = fs.promises.writeFile;
const mkdir = fs.promises.mkdir;
const exists = fs.promises.access;

async function readConfigInternal(unparsedConfigPassedDirectly?: any): Promise<any> {
    // if the config doesn't exist, check the PERSONAL_SIGN_CONFIG env var
    // if the env var doesn't exist, create the config file with default values
    // if the env var does exist, read it and validate it

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
        // check if default config file exists in the current directory

        const configFileExists = await exists(DEFAULT_CONFIG_FILE_NAME).catch(() => false) !== false;
        // If the config file doesn't exist, create it with default values which will then fail validation
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

export default async function readAndValidateConfig(unparsedConfigPassedDirectly?: any): Promise<Options> {
    const {configContents, source} = await readConfigInternal(unparsedConfigPassedDirectly);

    let unparsedConfig: any;
    try {
        unparsedConfig = JSON.parse(configContents);
    } catch (e) {
        console.log(e);
        console.error(`[ERROR] ${source} does not appear to contain valid JSON. Contents:\n${configContents}`);
        process.exit(1);
    }

    console.log(`Using config from ${source}...`);
    const parsed = optionsSchema.safeParse(unparsedConfig);

    if (!parsed.success) {
        console.error(`[ERROR] Error parsing config from ${source}!`);
        parsed.error.issues.forEach((issue) => {
            const msg = colors.red(issue.path.join('.')) + ': ' + issue.message;
            // use colors library
            console.error(msg);
        });
        process.exit(1);
    } else {
        return parsed.data;
    }

}
