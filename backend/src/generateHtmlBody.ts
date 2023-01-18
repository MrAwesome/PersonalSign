import {AQIData, CityData, OpenWeatherData} from "./types";
import {calculatePressureVariancePercent, getBarCharacter, getAMPMHourOnly, getDate, mod} from "./utils";


export class HtmlBodyGenerator {

    constructor(
        private cityData: CityData,
        private aqiData: AQIData,
        private openWeatherData: OpenWeatherData,
    ) {
        this.getPrecipitationChanceNext12HoursOnlyBars = this.getPrecipitationChanceNext12HoursOnlyBars.bind(this);
    }

    generateHtmlBody(): string {
        const {cityData, openWeatherData, aqiData} = this;
        const {current, minutely, daily} = openWeatherData;

        const pressureVariancePercent = calculatePressureVariancePercent(current.pressure);

        const precipTable = this.getPrecipitationChanceNext12HoursOnlyBars();

        const windGust = current.wind_gust ? `Wind Gust: ${current.wind_gust.toFixed(1)}mph <br />` : '';

        const [now, ten, thirty] = [minutely[0].precipitation, minutely[10].precipitation, minutely[30].precipitation];

        let precipNextHour = '';
        if (now + ten + thirty > 0) {
            precipNextHour = `Now/10/30: ${now}mm/${ten}mm/${thirty}mm <br />`;
        }


        return `
        <div>
            <h1>AQI & Weather for ${cityData.name}</h1>
            <div>
                AQI: ${aqiData.aqi} <br />
                Temp: ${current.temp.toFixed(0)}°F &nbsp; (Feels Like: ${current.temp.toFixed(0)}°F) <br />
                Humidity: ${current.humidity}% <br />
                Wind Speed: ${current.wind_speed.toFixed(1)}mph <br />
                ${windGust}
                Pressure: ${pressureVariancePercent} <br />

                <br />
                ${precipNextHour}

                ${precipTable}

                <br />
                Today: ${daily[0].weather.map(x => x.description).join(', ')} <br />
                Tomorrow: ${daily[1].weather.map(x => x.description).join(', ')} <br />
            </div>
        </div>
    `;
    }

    getPrecipitationChanceNext12HoursOnlyBars(): string {
        const hourInterval = 6;
        const {openWeatherData} = this;
        const {hourly} = openWeatherData;

        if (hourly.reduce((acc, x) => acc + x.pop, 0) === 0) {
            return '';
        }

        const barchart = hourly
            .map(({pop}) => `${getBarCharacter(pop)}`)
            .join('');
        const labelsUnpadded = hourly
            .filter((_e, index) => { return mod(index, hourInterval) === 0; })
            .map(({dt}) => getAMPMHourOnly(getDate(dt)));
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
//        const {openWeatherData} = this;
//        const {hourly} = openWeatherData;
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

