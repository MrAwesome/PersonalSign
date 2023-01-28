import http from 'http';
import {ImperialOrMetric} from './types';

type WeatherHandler = (coords: [number, number], imperialOrMetric: ImperialOrMetric) => Promise<string>;

export async function startSimpleHttpServer(weatherHandler: WeatherHandler): Promise<void> {
    const server = http.createServer(async (req, res) => {
        try {
            await handleRequest(weatherHandler, req, res);
        } catch (e) {
            console.error(e);
            res.writeHead(500, {'Content-Type': 'text/html; charset=utf-8'});
            res.end("<html><body><h1>Server Error</h1></body></html>");
        }
    });
    server.listen(8080);
}

async function handleRequest(
    weatherHandler: WeatherHandler,
    req: http.IncomingMessage,
    res: http.ServerResponse
): Promise<void> {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    if (url.pathname === '/transit') {
        const inn = url.searchParams.get('inn')!;
        const [lat, lon] = inn.split(',').map(parseFloat);
        const data = `stub: ${lat},${lon}`;
        //const data = await getDeparturesInfoForLocation([lat, lon]);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(data));
    } else if (url.pathname === '/weather') {
        const imperialOrMetric: ImperialOrMetric = url.searchParams.get('units') === 'imperial' ? 'imperial' : 'metric';
        const coords = url.searchParams.get('at')!;
        const [lat, lon] = coords.split(',').map(parseFloat);
        const html = await weatherHandler([lat, lon], imperialOrMetric);

        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(html);
    } else {
        res.writeHead(404);
        res.end("<html><body><h1>404: Page not found.</h1><br /><br />Try the /transit and /weather endpoints.</body></html>");
    }
}
