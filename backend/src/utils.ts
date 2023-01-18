import {AVERAGE_PRESSURE} from "./data";

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

export function getBarCharacter(percentage: number): string {
    //const bar = "⢀⣀⣤⣶⣿";
    //const bar = "\u2003▁▂▃▄▅▆▇█";
    const bar = "x▁▂▃▄▅▆▇█";
    const index = Math.round(percentage * (bar.length - 1));
    return bar[index].replace("x", "&nbsp;");
}
