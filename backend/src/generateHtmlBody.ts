import {CityData} from "./types";
import {AirPollution, Everything as WeatherEverything} from "openweather-api-node";
import {calculatePressureVariancePercent, getBarCharacter, getAMPMHourOnly, mod, checkAboveBarThreshold, getOWIconURL} from "./utils";


//import geocoder from "node-geocoder";
//
//const now = Date.now();
//const lol = geocoder({
//    provider: "openstreetmap",
//}).reverse({ lat: 34.29752308708957, lon: -82.40668218013909}, (err, res) => {
//    console.log((Date.now() - now) / 1000);
//    console.log(res);
//});


export class HtmlBodyGenerator {
    constructor(
        private cityData: CityData,
        private currentAirPollutionData: AirPollution,
        private weatherData: WeatherEverything,
    ) {
        this.getPrecipitationChanceNext12HoursOnlyBars = this.getPrecipitationChanceNext12HoursOnlyBars.bind(this);
        this.getIconsNext12Hours = this.getIconsNext12Hours.bind(this);
        this.generateHtmlBody = this.generateHtmlBody.bind(this);
    }

    generateHtmlBody(): string {
        const {cityData, weatherData, currentAirPollutionData} = this;
        const {current, minutely, daily} = weatherData;

        const currentWeather = current.weather;

        const now = new Date();

        const monthAndDay = now
            .toLocaleDateString('en-US', {month: 'short', day: 'numeric'});

        const hoursAndMin = now
            .toLocaleTimeString('en-US', {hour: 'numeric', minute: 'numeric'})
            .replace(/\s/g, ' ')

        const pressureVariancePercent = calculatePressureVariancePercent(currentWeather.pressure);

        const precipTable = this.getPrecipitationChanceNext12HoursOnlyBars();

        const windGust = currentWeather.wind.gust ? `%P% Wind Gust: %PP% ${currentWeather.wind.gust.toFixed(0)}mph <br />` : '';

        const [precipNow, precipTen, precipThirty] = [minutely[0].weather.rain, minutely[10].weather.rain, minutely[30].weather.rain];

        let precipNextHour = '';
        if (precipNow + precipTen + precipThirty > 0) {
            precipNextHour = `%P% Now/10/30: %PP% ${precipNow}mm/${precipTen}mm/${precipThirty}mm <br />`;
        }


        const preProcessedHtml = `
        <div>
            <div class="heading-container">
                <div class="heading">
                    <div class="datetime-heading">${monthAndDay} / ${hoursAndMin} </div>
                    <div class="city-heading">${cityData.displayName}</div>
                </div>
            </div>
            <div>
                %P% AQI: %PP% ${currentAirPollutionData.aqi} <br />
                %P% Temp: %PP% ${currentWeather.temp.cur.toFixed(0)}°F %P%(Feels Like:%PP%${currentWeather.feelsLike.cur.toFixed(0)}°F%P%)%PP% <br />
                %P% Humidity: %PP% ${currentWeather.humidity}% <br />
                %P% Wind Speed: %PP% ${currentWeather.wind.speed.toFixed(0)}mph <br />
                ${windGust}
                %P% Pressure: %PP% ${pressureVariancePercent} <br />

                ${precipNextHour}
                ${precipTable}

                <br />

                %P% Today: %PP% ${daily[0].weather.description} <br />
                %P% Tomorrow: %PP% ${daily[1].weather.description} <br />

            </div>
        </div>
        `;

        const processedHtml = preProcessedHtml
            .replace(/%P%/g, '<div class="prefix">')
            .replace(/%PP%/g, '</div>');

        return processedHtml;
    }

    getPrecipitationChanceNext12HoursOnlyBars(): string {
        const hourInterval = 6;
        const {weatherData} = this;
        const {hourly} = weatherData;

        if (hourly.map(h => h.weather.pop).every(checkAboveBarThreshold)) {
            return '';
        }

        const barchart = hourly
            .map(({weather}) => `${getBarCharacter(weather.pop)}`)
            .join('');

        const labelsUnpadded = hourly
            .filter((_e, index) => {return mod(index, hourInterval) === 0;})
            .map(({dt}) => getAMPMHourOnly(dt));
        const [firstLabel, ...restLabels] = labelsUnpadded;
        const fixedRestLabels = restLabels
            .map((l) => l.padStart(hourInterval, 'x'))
            .join('')
            .replace(/x/g, "&nbsp;");

        const fixedLabels = `${firstLabel}${fixedRestLabels}`;

        return `
            <div class="precipitation-graph">
                <div class="precipitation-graph-header">Precipitation Next 48 Hours:</div>
                <div class="precipitation-graph-data">${barchart} <br /> ${fixedLabels}</div>
            </div>
        `;
    }

    getIconsNext12Hours(): string {
        const {weatherData} = this;
        const {hourly} = weatherData;

        const icons = hourly
            .slice(0, 12)
            .map(({weather}) => `<img class="hourly-icon" src="${getOWIconURL(weather.icon.raw)}" />`);

        return `<div class="hourly-icons">${icons.join('')}</div>`;
    }


    //    getPrecipitationChanceNext12Hours(): string {
    //        const {weatherData} = this;
    //        const {hourly} = weatherData;
    //        const percipHourlyTable = hourly; //.slice(0, 12);
    //
    //        //const tableHeader = `<table><tr><th>Hour</th><th>Precipitation</th></tr>`;
    //        const tableHeader = `<table class="precipitation-graph">`;
    //        const tableFooter = `</table>`;
    //        let table = tableHeader;
    //
    //        table += '<tr>';
    //        const data = percipHourlyTable.map((h) => {
    //            return {date: getDate(h.dt), pop: h.pop}
    //        });
    //
    //        table += data.map(({date}) => `<td>${getAMPMHourOnly(date)}</td>`).join('');
    //        table += `</tr>`;
    //        table += '<tr>';
    //        table += data.map(({pop}) => `<td>${getBarCharacter(pop)}</td>`).join('');
    //
    //        table += `</tr>`;
    //        table += tableFooter;
    //        return table;
    //    }

}

