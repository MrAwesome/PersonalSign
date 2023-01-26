import http from 'http';
import {ImperialOrMetric} from './types';

export async function startSimpleHttpServer(weatherHandler: (coords: [lat: number, lon: number], imperialOrMetric: ImperialOrMetric) => Promise<string>): Promise<void> {
    const server = http.createServer(async (req, res) => {
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
                          //'Text-Encoding': 'utf-8',
            //});
            res.end(html);
        } else {
            res.writeHead(404);
            res.end();
        }
    });
    server.listen(8080);
}
