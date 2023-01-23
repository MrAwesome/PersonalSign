import {z} from 'zod';
import {weatherOptionsSchema} from './weatherProviders';
import {locationOptionsSchema} from './locationProviders';

export const DEFAULT_MUST_REPLACE_STRING = 'MUST_REPLACE';

export const DEFAULT_CONFIG = {
    weather: {
        activeProvider: 'openweathermap',
        options: {
            openweathermap: {
                apiKey: DEFAULT_MUST_REPLACE_STRING,
            },
        },
    },
    location: {
        activeProvider: 'openstreetmap',
        options: {
            openstreetmap: {
                email: DEFAULT_MUST_REPLACE_STRING,
            },
        },
    },
} as const;

export const optionsSchema = z.object({
    weather: weatherOptionsSchema,
    location: locationOptionsSchema,
});

export type Options = z.infer<typeof optionsSchema>;
