import {CityData, ImperialOrMetric, UserAgentInfo} from "./types";
import {AirPollution, Everything as WeatherEverything} from "openweather-api-node";
import {calculatePressureVariancePercent, getBarCharacter, getAMPMHourOnly, mod, checkAboveBarThreshold, getOWIconURL, degreeToArrow, noop, getDateAsTimeDay, roundDateToNearestTenMinutes} from "./utils";
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
const PRECIP_BAR_FULL_THRESHOLD_MM = 4.0 as const;

export class HtmlBodyGenerator {
    constructor(
        private ua: UserAgentInfo,
        private cityData: CityData,
        private currentAirPollutionData: AirPollution,
        private weatherData: WeatherEverything,
        private imperialOrMetric: ImperialOrMetric,
    ) {
        this.getPrecipitationChanceNext48HoursOnlyBars = this.getPrecipitationChanceNext48HoursOnlyBars.bind(this);
        this.getPrecipitationAmountNext48HoursOnlyBars = this.getPrecipitationAmountNext48HoursOnlyBars.bind(this);
        this.getIconsNext12Hours = this.getIconsNext12Hours.bind(this);
        this.generateHtmlBody = this.generateHtmlBody.bind(this);
        this.getTempNext12Hours = this.getTempNext12Hours.bind(this);
        this.getTempNext3Days = this.getTempNext3Days.bind(this);
        this.getPrecipNextHour = this.getPrecipNextHour.bind(this);
        noop(this.ua);
    }

    generateHtmlBody(): string {
        const {cityData, weatherData, currentAirPollutionData} = this;
        const {current, daily} = weatherData;

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

        const hoursAndMin =
            roundDateToNearestTenMinutes(now)
                .toLocaleTimeString('en-US', {hour: 'numeric', minute: 'numeric', timeZone})
                .replace(/\s/g, ' ')

        const pressureVariancePercent = calculatePressureVariancePercent(currentWeather.pressure);

        const precipNextHour = this.getPrecipNextHour();
        const precipChanceTable48Hours = this.getPrecipitationChanceNext48HoursOnlyBars();
        const precipAmountTable48Hours = this.getPrecipitationAmountNext48HoursOnlyBars();

        const todayHighLow = `${daily[0].weather.temp.max.toFixed(0)}°/${daily[0].weather.temp.min.toFixed(0)}°`;

        const windUnit = this.imperialOrMetric === 'imperial' ? 'mph' : 'km';

        // 1m/s = 3.6km/h
        const windSpeedMultiplier = this.imperialOrMetric === 'imperial' ? 1 : 3.6;

        const windSpeedNum = currentWeather.wind.speed * windSpeedMultiplier;

        const windDirectionIndicator = degreeToArrow(currentWeather.wind.deg)
        //const arrowEmojiSuffix = ua.skipUnicodeTextModeOverride === true ? "" : "\uFE0E";

        let windGustText = '';
        if (currentWeather.wind.gust) {
            const windGustNum = currentWeather.wind.gust * windSpeedMultiplier;
            windGustText = currentWeather.wind.gust ? `%P%Gust:%PP%</td><td class="lowpri right">${windGustNum.toFixed(0)}${windUnit}` : '';
        }

        const windSpeedText = `${windSpeedNum.toFixed(0)}${windUnit} ${windDirectionIndicator}`;

        const tempNext12Hours = this.getTempNext12Hours();

        const tempNext3Days = this.getTempNext3Days();

        let alertText = ""
        if ("alerts" in weatherData) {
            if (weatherData.alerts !== undefined && weatherData.alerts.length > 0) {
                alertText += `<table class="alerts">
                <th>Alert</th>
                <th>Until</th>
                `;

                for (const a of weatherData.alerts) {
                    alertText += `<tr>`;
                    alertText += `<td>%B%${a.event}%BB%</td>`;
                    alertText += `<td>${getDateAsTimeDay(a.end)}</td>`;
                    alertText += `</tr>`;
                }
                alertText += `</table>`;
            }
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
                <table class="outer-main-table">
                <tr>
                    <td> %P% Temp: %PP%</td><td>%B%${currentWeather.temp.cur.toFixed(0)}%DEG%%BB%</td>
                    <td>%P%Feels Like:%PP%</td><td class="right">${currentWeather.feelsLike.cur.toFixed(0)}%DEG%</td>
                </tr>
                <tr>
                    <td>%P% Today H/L: %PP%</td><td class="lowpri right">${todayHighLow}</td>
                    <td>%P% Humidity: %PP%</td><td class="lowpri">${currentWeather.humidity}%</td>
                </tr>
                <tr>
                    <td>%P% Pressure: %PP%</td><td class="lowpri">${pressureVariancePercent}</td>
                    <td>%P%PM2.5: %PP%</td><td class="lowpri right">${currentAirPollutionData.components.pm2_5}</td>
                <tr>
                    <td>%P%Wind:%PP%</td><td class="lowpri">${windSpeedText}</td>
                    <td>${windGustText}</td>
                </tr>
                </table>


                ${precipNextHour}
                ${precipChanceTable48Hours}
                ${precipAmountTable48Hours}

                <br />

                <table class="outer-temps-table">
                <tr>
                    <td>
                    %P% Next 12 hours:&nbsp;&nbsp;%PP% 
                    </td>
                    <td>
                    ${tempNext12Hours}
                    </td>
                </tr>
                <tr>
                    <td>
                    %P%Next 3 days: %PP%
                    </td>
                    <td>
                    ${tempNext3Days}
                    </td>

                </tr>
                </table>

                ${alertText}

            </div>
        </div>
        `;

        const processedHtml = preProcessedHtml
            .replace(/%DEG%/g, this.imperialOrMetric === 'imperial' ? '°F' : '°C')
            .replace(/%P%/g, '<div class="prefix">')
            .replace(/%PP%/g, '</div>')
            .replace(/%B%/g, '<div class="bigbold">')
            .replace(/%BB%/g, '</div>');

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

    getPrecipitationAmountNext48HoursOnlyBars(): string {
        const hourInterval = 6;
        const {weatherData} = this;
        const {hourly} = weatherData;

        if (hourly.map(h => getPrecipAmountBarPercent(Math.max(h.weather.rain, h.weather.snow))).every(checkAboveBarThreshold)) {
            return '';
        }

        const barchart = hourly
            .map(({weather}) => {
                const precipmm = Math.max(weather.rain, weather.snow);
                const barPercent = getPrecipAmountBarPercent(precipmm);
                return getBarCharacter(barPercent);
            })
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
                <div class="precipitation-graph-header">Precipitation Amount Next 48 Hours:</div>
                <div class="precipitation-graph-data">${barchart} <br /> ${fixedLabels}</div>
            </div>
        `;
    }

    getTempNext3Days(): string {
        const {weatherData} = this;
        const {daily} = weatherData;
        let temps = daily.slice(1, 4).map(({weather}) => {
            const {min, max} = weather.temp;

            return `<td>${max.toFixed(0)}°/${min.toFixed(0)}°</td>`;
        });

        const tempDisplay = temps.join("");

        return `<table class="daily-temps"><tr>${tempDisplay}</tr></table>`;
    }

    getTempNext12Hours(): string {
        const {weatherData} = this;
        const {hourly} = weatherData;

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

        const makeRow = (row: string[]) =>
            `<tr>${row.map(t => `<td>${t}°</td>`).join('')}</tr>`;

        return `<table class="hourly-temps">${makeRow(topRow)}${makeRow(bottomRow)}</table>`;
    }

    getIconsNext12Hours(): string {
        const {weatherData} = this;
        const {hourly} = weatherData;

        const icons = hourly
            .slice(0, 12)
            .map(({weather}) => `<img class="hourly-icon" src="${getOWIconURL(weather.icon.raw)}" />`);

        return `<div class="hourly-icons">${icons.join('')}</div>`;
    }

    getPrecipNextHour(): string {
        const {weatherData} = this;
        const {minutely} = weatherData;
        const bar_height = 40; //px

        let positivePrecip = false;
        let output = '<div class="histogram">';
        minutely.forEach((m) => {
            const precip = m?.weather?.rain ?? 0;
            let height = 0;
            if (precip >= 0.1) {
                positivePrecip = true;
                height = getPrecipAmountBarPercent(precip) * bar_height;
            }

            output += `<span style="height: ${height}px"></span>`;
        });

        if (positivePrecip) {
            output += '</div>';

            return `<div class="precipitation-graph wide-border">
                <div class="precipitation-graph-header bolded">Precipitation Amount Next Hour:</div>
                <div class="precipitation-graph-data">${output}</div>
            </div>`;
        } else {
            return '';
        }
    }
}


function getPrecipAmountBarPercent(precipmm: number) {
    const rawPct = (precipmm / PRECIP_BAR_FULL_THRESHOLD_MM);
    const clamped = Math.min(1, rawPct);
    return clamped;
}
