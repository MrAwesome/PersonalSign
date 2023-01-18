import {CityData} from "./types";

export const AVERAGE_PRESSURE = 1013.25; // hPa

export const ZIP_TO_DATA: Record<string, CityData> = {
    '94103': {
        name: 'San Francisco, CA',
        aqicnID: '@3900',
        latLong: [37.7675, -122.4217],
    },
    '29639': {
        name: 'Due West, SC',
        aqicnID: 'A07666',
        latLong: [34.3339, -82.3880],
    },
    
    '85701': {
        name: 'Green Valley, AZ',
        aqicnID: '@5958',
        latLong: [31.8308, -111.0052],
    },
    

//    '29617': {
//        name: 'Greenville',
//        aqicnID: '29617',
//        latLong: [34.8526, -82.3940],
//        standardPressure: 982,
//    },
};

