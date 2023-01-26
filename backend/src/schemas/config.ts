import {z} from 'zod';
import {weatherOptionsSchema} from './weatherProviders';
import {geocodingOptionsSchema} from './geocodingProviders';

export const DEFAULT_MUST_REPLACE_STRING = 'MUST_REPLACE';


// TODO: only generate a section if it's asked for in the run?
//       cmdline args like `weather --disable-geocoding`?
export const DEFAULT_CONFIG = {
    weather: {
        activeProvider: 'openweathermap',
        options: {
            openweathermap: {
                apiKey: DEFAULT_MUST_REPLACE_STRING,
            },
        },
    },
    geocoding: {
        activeProvider: 'openstreetmap',
        options: {
            openstreetmap: {
                email: DEFAULT_MUST_REPLACE_STRING,
            },
        },
    },
    transit: {
        activeProvider: 'here',
        options: {
            here: {
                apiKey: DEFAULT_MUST_REPLACE_STRING,
            },
        },
    }
} as const;

export const optionsSchema = z.object({
    weather: weatherOptionsSchema,
    geocoding: geocodingOptionsSchema,
});

export type Options = z.infer<typeof optionsSchema>;
