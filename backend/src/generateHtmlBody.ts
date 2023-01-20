import {CityData} from "./types";
import {AirPollution, Everything as WeatherEverything} from "openweather-api-node";
import {calculatePressureVariancePercent, getBarCharacter, getAMPMHourOnly, mod, checkAboveBarThreshold} from "./utils";


export class HtmlBodyGenerator {
    constructor(
        private cityData: CityData,
        private aqiData: AirPollution,
        private weatherData: WeatherEverything,
    ) {
        this.getPrecipitationChanceNext12HoursOnlyBars = this.getPrecipitationChanceNext12HoursOnlyBars.bind(this);
    }

    generateHtmlBody(): string {
        const {cityData, weatherData, aqiData} = this;
        const {current, minutely, daily} = weatherData;

        const currentWeather = current.weather;

        const now = new Date();

        const monthAndDay = now
            .toLocaleDateString('en-US', {month: 'short', day: 'numeric'});

        const hoursAndMin = now
            .toLocaleTimeString('en-US', {hour: 'numeric', minute: 'numeric'});

        const pressureVariancePercent = calculatePressureVariancePercent(currentWeather.pressure);

        const precipTable = this.getPrecipitationChanceNext12HoursOnlyBars();

        const windGust = currentWeather.wind.gust ? `Wind Gust: ${currentWeather.wind.gust.toFixed(1)}mph <br />` : '';

        const [precipNow, precipTen, precipThirty] = [minutely[0].weather.rain, minutely[10].weather.rain, minutely[30].weather.rain];

        let precipNextHour = '';
        if (precipNow + precipTen + precipThirty > 0) {
            precipNextHour = `Now/10/30: ${precipNow}mm/${precipTen}mm/${precipThirty}mm <br />`;
        }


        return `
        <div>
            <div class="heading">
                <div class="datetime-heading">${monthAndDay} / ${hoursAndMin} </div>
                <div class="city-heading">${cityData.displayName}</div>
            </div>
            <div>
                AQI: ${aqiData.aqi} <br />
                Temp: ${currentWeather.temp.cur.toFixed(0)}°F &nbsp; (Feels Like: ${currentWeather.feelsLike.cur.toFixed(0)}°F) <br />
                Humidity: ${currentWeather.humidity}% <br />
                Wind Speed: ${currentWeather.wind.speed.toFixed(1)}mph <br />
                ${windGust}
                Pressure: ${pressureVariancePercent} <br />

                ${precipNextHour}
                ${precipTable}

                <br />

                Today: ${daily[0].weather.description} <br />
                Tomorrow: ${daily[1].weather.description} <br />
            </div>
        </div>
    `;
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
            .filter((_e, index) => { return mod(index, hourInterval) === 0; })
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

