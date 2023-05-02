import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import roomRoutes from './room.router';

export default (fastify: FastifyInstance, opts: FastifyPluginOptions, done: (err?: Error | undefined) => void) => {
    fastify.get('/', function (req, reply) {
        reply.view('home');
    });
    fastify.register(roomRoutes, { prefix: '/room' });
    done();
};
