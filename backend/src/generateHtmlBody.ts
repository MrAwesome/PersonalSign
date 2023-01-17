import {AQIData, CityData, OpenWeatherData} from "./types";

export function generateHtmlBody(cityData: CityData, aqiData: AQIData, openWeatherData: OpenWeatherData): string {
    // use the data from aqiData and openWeatherData to create a string containing a div containing today's air quality and weather, the precipitation outcast for now and 10/30/60 minutes from now, and the forecast for the next 24 hours.
    // Structure the div however you want.
    //

    const pressureVariance = (openWeatherData.current.pressure / cityData.standardPressure * 100).toFixed(2);


    return `
        <div>
            <h1>AQI & Weather for ${cityData.name}</h1>
            <div>
                <h2>Current AQI</h2>
                <p>${aqiData.aqi}</p>
            </div>
            <div>
                <h2>Current Temperature</h2>
                <p>${openWeatherData.current.temp}</p>
            </div>
            <div>
                <h2>Atmospheric Pressure%</h2>
                <p>${pressureVariance}</p>
            </div>
            <div>
                <h2>Forecast</h2>
                <p>${openWeatherData.daily[1].weather[0].description}</p>
            </div>
        </div>
    `;
}
