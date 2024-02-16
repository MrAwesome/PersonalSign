import http from 'http';
import {ImperialOrMetric, LocationData} from './types';
import {locationDataFromText} from './utils';

type WeatherHandler = (locationData: LocationData, imperialOrMetric: ImperialOrMetric) => Promise<string>;

const PORT: number = process.env.PERSONALSIGN_PORT === undefined 
    ? 8080 
    : parseInt(process.env.PERSONALSIGN_PORT, 10);

export async function startSimpleHttpServer(weatherHandler: WeatherHandler): Promise<http.Server> {
    const server = http.createServer(async (req, res) => {
        try {
            await handleRequest(weatherHandler, req, res);
        } catch (e) {
            console.error(e);
            res.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'});
            res.end("<html><body><h1>Server Error</h1></body></html>");
        }
    });
    server.listen(PORT);

    const addr = server.address();
    if (typeof addr === 'string') {
        console.log("Started HTTP server on:", addr);
    } else {
        console.log("Started HTTP server on port:", addr?.port);
    }

    return server;
}

async function handleRequest(
    weatherHandler: WeatherHandler,
    req: http.IncomingMessage,
    res: http.ServerResponse
): Promise<void> {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    
    if (process.env.ACCESS_TOKEN !== undefined) {
        if (url.searchParams.get('access_token') !== process.env.ACCESS_TOKEN) {
            res.writeHead(401);
            res.end("<html><body><h1>401: Unauthorized</h1><p>You must provide an access_token parameter. The sysadmin will know it.</body></html>");
            return;
        }
    }

    if (url.pathname === '/transit') {
        const inn = url.searchParams.get('inn')!;
        const [lat, lon] = inn.split(',').map(parseFloat);
        const data = `stub: ${lat},${lon}`;
        //const data = await getDeparturesInfoForLocation([lat, lon]);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(data));
    } else if (url.pathname === '/weather') {
        const imperialOrMetric: ImperialOrMetric = url.searchParams.get('units') === 'imperial' ? 'imperial' : 'metric';
        const at = url.searchParams.get('at')!.trim();
        const locationData = locationDataFromText(at);
        const html = await weatherHandler(locationData as LocationData, imperialOrMetric);

        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(html);
    } else {
        res.writeHead(404);
        res.end("<html><body><h1>404: Page not found.</h1><br /><br />Try the /transit and /weather endpoints.</body></html>");
    }
}
