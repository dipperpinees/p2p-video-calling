import { FastifyReply } from 'fastify';
import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import Rooms from '../utils/rooms';

type MyRequest = FastifyRequest<{
    Params: { id: string };
    Querystring: {
        name: string;
        k: string; //secret key
    };
}>;

export default function roomRoutes(
    fastify: FastifyInstance,
    opts: FastifyPluginOptions,
    done: (err?: Error | undefined) => void
) {
    fastify.post('/:id', (req: MyRequest, reply: FastifyReply) => {
        reply.send(Rooms.getInstance().new(req.params.id));
    });

    fastify.get('/:id', (req: MyRequest, reply: FastifyReply) => {
        const secretKey = req.query.k;
        const thisRoom = Rooms.getInstance().get(req.params.id);
        if (!thisRoom || thisRoom.getSecretKey() !== secretKey) {
            return reply.redirect('/');
        }
        reply.view('call', { roomId: req.params.id });
    });

    done();
}
