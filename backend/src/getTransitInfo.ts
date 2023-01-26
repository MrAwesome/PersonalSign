import fetch from 'node-fetch';


//interface Location {
//    
//}
//
//abstract class TransitInfoFetcher {
//    abstract async getNearbyStationInfo(location: Location): Promise<TransitInfo>;
//}
//

const apiKey = 'stub';

export async function getNearbyStationInfo([latitude, longitude]: [number, number]): Promise<any> {
    const url = `https://transit.hereapi.com/v8/stations?in=${latitude},${longitude}&apiKey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

export async function getDeparturesInfoForStation(stationID: string): Promise<any> {
  const url = `https://transit.hereapi.com/v8/departures?ids=${stationID}&apiKey=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  // TODO: use zod to verify
  return data;
}

export async function getDeparturesInfoForLocation([latitude, longitude]: [number, number]): Promise<any> {
    const url = `https://transit.hereapi.com/v8/departures?in=${latitude},${longitude}&apiKey=${apiKey}`; // can add ;r=500 to set radius in meters
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

//export async function startSimpleHttpServer() {
//    const server = http.createServer(async (req, res) => {
//        console.log(req);
//        const url = new URL(req.url!, `http://${req.headers.host}`);
//        if (url.pathname === '/transit') {
//            const inn = url.searchParams.get('in')!;
//            const [lat, lon] = inn.split(',').map(parseFloat);
//            const data = await getDeparturesInfoForLocation([lat, lon]);
//            res.writeHead(200, {'Content-Type': 'application/json'});
//            res.end(JSON.stringify(data));
//        } else {
//            res.writeHead(404);
//            res.end();
//        }
//    });
//    server.listen(8080);
//}
//
//(async () => {
//    await startSimpleHttpServer();
//})();
