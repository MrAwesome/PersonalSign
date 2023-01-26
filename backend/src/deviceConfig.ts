// NOTE: currently unused
export interface DeviceConfig {
    // Can be inferred from the above, but it's nice to have it explicitly stated
    screenOrientation: ScreenOrientation;
    deviceName: string;

    screenResolution?: {
        width: number;
        height: number;
    }

    deviceType?: DeviceType;
    screenType?: ScreenType;
    refreshDelaySecs?: number;
    additionalHTMLContent?: {
        head?: string[];
        bodyUnderHeading?: string[];
        bodyBottom?: string[];
    }
}

export type ScreenOrientation = "portrait" | "landscape";
export type DeviceType = "mobile" | "tablet" | "desktop" | "tv" | "watch" | "e-reader" | "other";
export type ScreenType = "lcd-ish" | "e-paper";
export type SupportsJS = "yes" | "ancient-android" | "no";

export const DEVICES = {
    "nooksimpletouch-electricsign": {
        screenResolution: {
            width: 600,
            height: 800
        },
        screenOrientation: "portrait",
        deviceName: "Nook Simple Touch",
        deviceType: "e-reader",
        screenType: "epaper",
        // No need to set refreshDelaySecs, since we'll be using ElectricSign to refresh
    },
    
} as const;
export type DeviceID = keyof typeof DEVICES;

// User agent for Nook Simple Touch (BNRV300) default browser, which can support JavaScript if it's explicitly enabled in settings
// User-Agent: Mozilla/5.0 (Linux; U; Android 2.1; en-us; NOOK BNRV300 Build/ERD79) AppleWebKit/530.17 (KHTML, like Gecko) Version/4.0 Mobile Safari/530.17
//
// User agent for Nook Simple Touch (BNRV300) ElectricSign browser, which can't support JavaScript
// User-Agent: Mozilla/5.0 (Linux; U; Android 2.1; en-us; NOOK BNRV300 Build/ERD79) AppleWebKit/530.17 (KHTML, like Gecko) Version/4.0 Mobile Safari/530.17
