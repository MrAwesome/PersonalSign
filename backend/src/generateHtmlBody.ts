import {CityData, ImperialOrMetric} from "./types";
import {AirPollution, DailyTemperatures, Everything as WeatherEverything} from "openweather-api-node";
import {calculatePressureVariancePercent, getBarCharacter, getAMPMHourOnly, mod, checkAboveBarThreshold, getOWIconURL} from "./utils";
import {find as geofind} from "geo-tz";


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
        private imperialOrMetric: ImperialOrMetric,
    ) {
        this.getPrecipitationChanceNext48HoursOnlyBars = this.getPrecipitationChanceNext48HoursOnlyBars.bind(this);
        this.getIconsNext12Hours = this.getIconsNext12Hours.bind(this);
        this.generateHtmlBody = this.generateHtmlBody.bind(this);
        this.getTempNext12Hours = this.getTempNext12Hours.bind(this);
        this.getDailyTempDisplay = this.getDailyTempDisplay.bind(this);
    }

    generateHtmlBody(): string {
        const {cityData, weatherData, currentAirPollutionData} = this;
        const {current, minutely, daily} = weatherData;

        const currentWeather = current.weather;

        let timeZone: string | undefined;
        if (Array.isArray(cityData.location.latLong)) {
            const [lat, lon] = cityData.location.latLong;
            const foundTimeZones = geofind(lat, lon);
            if (foundTimeZones.length > 0) {
                timeZone = foundTimeZones[0];
            }
        }

        const now = new Date();

        const monthAndDay = now
            .toLocaleDateString('en-US', {month: 'short', day: 'numeric', timeZone});

        const hoursAndMin = now
            .toLocaleTimeString('en-US', {hour: 'numeric', minute: 'numeric', timeZone})
            .replace(/\s/g, ' ')

        const pressureVariancePercent = calculatePressureVariancePercent(currentWeather.pressure);

        const precipTable = this.getPrecipitationChanceNext48HoursOnlyBars();

        const windUnit = this.imperialOrMetric === 'imperial' ? 'mph' : 'km';

        // 1m/s = 3.6km/h
        const windSpeedMultiplier = this.imperialOrMetric === 'imperial' ? 1 : 3.6;

        const windSpeedNum = parseInt(currentWeather.wind.speed.toFixed(0)) * windSpeedMultiplier;
        const windSpeedText = `%P% Wind Speed: %PP% ${windSpeedNum}${windUnit} <br />`;

        let windGustText = '';
        if (currentWeather.wind.gust) {
            const windGustNum = parseInt(currentWeather.wind.gust?.toFixed(0)) * windSpeedMultiplier;
            windGustText = currentWeather.wind.gust ? `%P% Wind Gust: %PP% ${windGustNum}${windUnit} <br />` : '';
        }

        let positivePrecip = false;
        const upcomingPrecipitation = [0,10,30].map(i => {
            const precip = minutely[i]?.weather?.rain ?? 0;
            if (precip >= 0.1) {
                positivePrecip = true;
            }

            return {
                minAway: i,
                amountMm: precip.toFixed(1),
            }
        });

        let precipNextHour = '';
        if (positivePrecip) {
            const precipNextHourAmount = upcomingPrecipitation.map(({amountMm}) => {
                return `${amountMm}`;
            }).join('/');
            const precipNextHourMin = upcomingPrecipitation.map(({minAway}) => {
                return `${minAway}`;
            }).join('/');
            //precipNextHour = `%P% Now/10/30: %PP% ${precipNow}mm/${precipTen}mm/${precipThirty}mm <br />`;
            precipNextHour = `%P% Precipitation ${precipNextHourMin}min (mm): %PP% ${precipNextHourAmount} <br />`;
        }

        const tempNext12Hours = this.getTempNext12Hours();

        const tempRangeToday = this.getDailyTempDisplay(daily[0].weather.temp);
        const tempRangeTomorrow = this.getDailyTempDisplay(daily[1].weather.temp);


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
                %P% Temp: %PP% ${currentWeather.temp.cur.toFixed(0)}%DEG% %P%(Feels Like:%PP%${currentWeather.feelsLike.cur.toFixed(0)}%DEG%%P%)%PP% <br />
                %P% Humidity: %PP% ${currentWeather.humidity}% <br />
                ${windSpeedText}
                ${windGustText}
                %P% Pressure: %PP% ${pressureVariancePercent} <br />

                ${precipNextHour}
                ${precipTable}

                <br />

                %P% Today: %PP% ${daily[0].weather.description} ${tempRangeToday} <br />
                %P% Tomorrow: %PP% ${daily[1].weather.description} ${tempRangeTomorrow} <br />

                ${tempNext12Hours}


            </div>
        </div>
        `;

        const processedHtml = preProcessedHtml
            .replace(/%DEG%/g, this.imperialOrMetric === 'imperial' ? '°F' : '°C')
            .replace(/%P%/g, '<div class="prefix">')
            .replace(/%PP%/g, '</div>');

        return processedHtml;
    }

    getPrecipitationChanceNext48HoursOnlyBars(): string {
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
                <div class="precipitation-graph-header">Precipitation Chance Next 48 Hours:</div>
                <div class="precipitation-graph-data">${barchart} <br /> ${fixedLabels}</div>
            </div>
        `;
    }

    getDailyTempDisplay(temps: DailyTemperatures): string {
        const {min, max} = temps;

        const tempDisplay = [
            min.toFixed(0),
            max.toFixed(0),
            //morn.toFixed(0),
            //day.toFixed(0),
            //eve.toFixed(0),
            //night.toFixed(0),
        ].join('-');

        return `<div class="daily-temp-display">(${tempDisplay})</div>`;
    }

    getTempNext12Hours(): string {
        const {weatherData} = this;
        const {hourly} = weatherData;

        // Don't bother showing the current hour if it's almost over
        const now = new Date();
        let startHour = 0;
        let endHour = 12;
        if (now.getMinutes() > 45) {
            startHour = 1;
            endHour = 13;
        }

        const temps = hourly
            .slice(startHour, endHour)
            .map(({weather}) => weather.temp.cur.toFixed(0));

        const topRow = temps.slice(0, 6);
        const bottomRow = temps.slice(6, 12);

        const tempsRows = [topRow, bottomRow].map(x => x.join(', ')).join('<br />');

        return `%P% Next 12 hours: %PP% <div class="hourly-temps">${tempsRows}</div>`;

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

