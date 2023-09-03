import FastifyStatic from '@fastify/static';
import FastifyView from '@fastify/view';
import ws from '@fastify/websocket';
import ejs from 'ejs';
import { fastify } from 'fastify';
import path from 'path';
import routes from './routes';
import handleWS from './utils/handleWebsocket';
import * as dotenv from 'dotenv';
import startCron from './utils/cron';

dotenv.config();

const server = fastify({ logger: true });
(async () => {
    try {
        startCron();

        //serve static
        await server.register(FastifyStatic, {
            root: path.resolve('./public'),
        });

        server.register(FastifyView, {
            engine: {
                ejs,
            },
            root: 'public',
        });

        server.register(routes);

        //websocket
        server.register(ws);
        server.register(async function (fastify) {
            fastify.get('/ws', { websocket: true }, handleWS(server.log));
        });
        server.listen({ port: Number(process.env.PORT) || 3001, host: '0.0.0.0' });
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
})();
