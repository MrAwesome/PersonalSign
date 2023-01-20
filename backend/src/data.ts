import {CityData} from "./types";

export const AVERAGE_PRESSURE = 1013.25; // hPa

export const ZIP_TO_DATA: Record<string, CityData> = {
    '94103': {
        displayName: 'San Francisco, CA',
        aqicnID: '@3900',
        location: {latLong: [37.7675, -122.4217]},
    },
    '29639': {
        displayName: 'Due West, SC',
        aqicnID: 'A07666',
        location: {latLong: [34.3339, -82.3880]},
    },
    
    '85701': {
        displayName: 'Green Valley, AZ',
        aqicnID: '@5958',
        location: {latLong: [31.8308, -111.0052]},
    },
    

//    '29617': {
//        name: 'Greenville',
//        aqicnID: '29617',
//        latLong: [34.8526, -82.3940],
//        standardPressure: 982,
//    },
};

