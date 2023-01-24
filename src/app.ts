import FastifyStatic from '@fastify/static';
import FastifyView from '@fastify/view';
import ws from '@fastify/websocket';
import ejs from 'ejs';
import { fastify } from 'fastify';
import path from 'path';
import routes from './routes';
import handleWS from './utils/handle-ws';

const server = fastify({ logger: true });
(async () => {
    try {
        //serve static
        await server.register(FastifyStatic, {
            root: path.join(__dirname, '/public'),
            prefix: '/public/', // optional: default '/'
        });

        server.register(FastifyView, {
            engine: {
                ejs,
            },
            root: 'public'
        });

        server.register(routes);

        //websocket
        server.register(ws);
        server.register(async function (fastify) {
            fastify.get('/ws', { websocket: true }, handleWS(server.log));
        })
        server.listen({ port: 3001 });
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
})();
