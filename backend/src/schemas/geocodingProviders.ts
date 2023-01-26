import {z} from 'zod';
import {mandatoryStringValue} from './utils';

const geocodingProvidersSchema = z.union([
    z.literal('here'),
    z.literal('openstreetmap'),
    z.literal('opendatafrance'),
    z.literal('agol'),
    z.literal('smartyStreet'),
    z.literal('google'),
    z.literal('freegeoip'),
    z.literal('datasciencetoolkit'),
    z.literal('locationiq'),
    z.literal('mapquest'),
    z.literal('mapbox'),
    z.literal('openmapquest'),
    z.literal('tomtom'),
    z.literal('nominatimmapquest'),
    z.literal('opencage'),
    z.literal('geocodio'),
    z.literal('yandex'),
    z.literal('teleport'),
    z.literal('pickpoint'),
]);

const genericOptionsSchema = z.object({
    apiKey: z.string().optional(),
    language: z.string().optional(),
    host: z.string().optional(),
});

const hereOptionsSchema = z.object({
    appId: z.string(),
    apiKey: z.string(),
    appCode: z.string().optional(),
    language: z.string().optional(),
    politicalView: z.string().optional(),
    country: z.string().optional(),
    state: z.string().optional(),
    production: z.boolean().optional(),
});

const openStreetMapOptionsSchema = z.object({
    language: z.string().optional(),
    email: mandatoryStringValue('email address'),
    apiKey: z.string().optional(),
    osmServer: z.string().optional(),
});

const openDataFranceOptionsSchema = z.object({
    language: z.string().optional(),
    email: z.string().optional(),
    apiKey: z.string().optional(),
});

const agolOptionsSchema = z.object({
    client_id: z.string().optional(),
    client_secret: z.string().optional(),
});

const smartyStreetsOptionsSchema = z.object({
    auth_id: z.string(),
    auth_token: z.string(),
});

const googleOptionsSchema = z.object({
    clientId: z.string().optional(),
    apiKey: z.string().optional(),
    language: z.string().optional(),
    region: z.string().optional(),
    excludePartialMatches: z.boolean().optional(),
    channel: z.string().optional(),
});

export const geocodingOptionsSchema = z.object({
    activeProvider: geocodingProvidersSchema,
    options: z.object({
        here: hereOptionsSchema.optional(),
        openstreetmap: openStreetMapOptionsSchema.optional(),
        opendatafrance: openDataFranceOptionsSchema.optional(),
        agol: agolOptionsSchema.optional(),
        smartyStreet: smartyStreetsOptionsSchema.optional(),
        google: googleOptionsSchema.optional(),
        freegeoip: genericOptionsSchema.optional(),
        datasciencetoolkit: genericOptionsSchema.optional(),
        locationiq: genericOptionsSchema.optional(),
        mapquest: genericOptionsSchema.optional(),
        mapbox: genericOptionsSchema.optional(),
        openmapquest: genericOptionsSchema.optional(),
        tomtom: genericOptionsSchema.optional(),
        nominatimmapquest: genericOptionsSchema.optional(),
        opencage: genericOptionsSchema.optional(),
        geocodio: genericOptionsSchema.optional(),
        yandex: genericOptionsSchema.optional(),
        teleport: genericOptionsSchema.optional(),
        pickpoint: genericOptionsSchema.optional(),
    }),
});
