import {AVERAGE_PRESSURE} from "./data";
import {ReturnedError} from "./types";

export function noop(_: any) {}

export function mod(n: number, m: number) {
        return ((n % m) + m) % m;
}

export function calculatePressureVariancePercent(pressure: number): string {
    const difference = pressure - AVERAGE_PRESSURE;

    let prefix = "";
    if (difference > 0) {
        prefix = "+";
    }

    const variance = (difference / AVERAGE_PRESSURE * 100).toFixed(2);
    return `${prefix}${variance}%`;
}

export function getDate(dt: number): Date {
    return new Date((dt) * 1000);
}

export function getDateWithOffset(dt: number, timezone_offset: number): Date {
    return new Date((dt + timezone_offset) * 1000);
}

export function getAMPMHourOnly(date: Date): string {
    return date
        .toLocaleTimeString("en-US", {hour: "numeric", hour12: true})
        .toLowerCase()
        .replace(/\s/g, "");
}

const BAR_CHARS = "x▁▂▃▄▅▆▇█";
//const BAR_CHARS = "⢀⣀⣤⣶⣿";
//const BAR_CHARS = "\u2003▁▂▃▄▅▆▇█";
//const BAR_CHARS = "x⢀⣀⣠⣤⣴⣶⣾⣿";

export function checkAboveBarThreshold(percentage: number): boolean {
    return Math.round(percentage * (BAR_CHARS.length - 1)) === 0;
}

export function getBarCharacter(percentage: number): string {
    const index = Math.round(percentage * (BAR_CHARS.length - 1));
    return BAR_CHARS[index].replace("x", "&nbsp;");
}

export async function tryProm<T>(fn: () => Promise<T>): Promise<T | ReturnedError> {
    try {
        return fn();
    } catch (e) {
        console.error(e);
        return {error: true, message: `${e}`};
    }
}

export function getOWIconURL(icon: string): string {
    return `http://openweathermap.org/img/wn/${icon}.png`;
}
