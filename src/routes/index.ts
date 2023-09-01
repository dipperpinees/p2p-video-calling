import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import roomRoutes from './room.router';

export default async (
    fastify: FastifyInstance,
    opts: FastifyPluginOptions,
    done: (err?: Error | undefined) => void
) => {
    fastify.get('/', async function (req, reply) {
        await reply.view('home');
    });
    await fastify.register(roomRoutes, { prefix: '/room' });
    done();
};
