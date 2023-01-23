import {z} from 'zod';
import {mandatoryStringValue} from './utils';

const weatherProvidersSchema = //z.union([
    z.literal('openweathermap');
//]);

const openWeatherMapOptionsSchema = z.object({
    apiKey: mandatoryStringValue('API key', 'Go to https://home.openweathermap.org/api_keys to create or find yours.')
});

export const weatherOptionsSchema = z.object({
    activeProvider: weatherProvidersSchema,
    options: z.object({
        openweathermap: openWeatherMapOptionsSchema,
    }),
});
