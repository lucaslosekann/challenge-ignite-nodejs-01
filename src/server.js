import http from 'node:http';
import { json } from './middlewares/json.js';
import { routes } from './routes.js';



const server = http.createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const { method, url } = req;
    if(req.headers['content-type'] === 'application/json'){
        req.body = await json(req, res);
    }
    
    const route = routes.find(route => (
        route.method === method && route.path.test(url)
    ));
    if (route) {
        const routeParams = req.url.match(route.path);
        const { query, ...params } = routeParams.groups;
        req.params = params;
        req.query = Object.fromEntries(new URLSearchParams(query));
        return route.handler(req, res);
    }

    return res.writeHead(404).end('Not Found');
});

server.listen(3333);

