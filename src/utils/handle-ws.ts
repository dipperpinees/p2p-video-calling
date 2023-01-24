import { SocketStream } from '@fastify/websocket';
import { FastifyBaseLogger, FastifyRequest } from 'fastify';
import Message from './message';
import Rooms from './rooms';
import { User } from './user';
import WsClients from './wsClients';

type MyRequest = FastifyRequest<{
    Querystring: { roomId: string; peerId: string; name: string };
}>;

export default function handleWS(log: FastifyBaseLogger) {
    return function (connection: SocketStream, request: MyRequest) {
        const { peerId, roomId, name } = request.query;
        //add to client cache & room
        const newUser = new User(peerId, name, connection.socket);
        WsClients.getInstance().add(peerId, newUser);
        const beforeUpdateRoomData = [...(Rooms.getInstance().get(roomId)?.getMemberWithoutSocket() || [])];
        Rooms.getInstance().add(roomId, newUser);

        connection.socket.send(JSON.stringify(new Message('join_room', beforeUpdateRoomData)));

        connection.socket.on('message', (messageRaw) => {
            const { type, message }: Message = JSON.parse(messageRaw.toString());
            switch (type) {
                case 'microphone':
                    WsClients.getInstance().get(peerId)?.setMicrophone(Boolean(message));
                    Rooms.getInstance()
                        .get(roomId)
                        ?.boardcast(new Message('microphone', { peerId, value: message }));
                    break;
                case 'camera':
                    WsClients.getInstance().get(peerId)?.setCamera(Boolean(message));
                    Rooms.getInstance()
                        .get(roomId)
                        ?.boardcast(new Message('camera', { peerId, value: message }));
                    break;
            }
        });

        connection.socket.on('close', () => {
            //remove client cache & delete from room
            try {
                Rooms.getInstance().remove(roomId, peerId);
                WsClients.getInstance().delete(peerId);
                Rooms.getInstance().get(roomId)?.boardcast(new Message('disconnect', peerId));
            } catch (err) {
                let message = 'Unknown Error';
                if (err instanceof Error) message = err.message;
                log.info({ type: 'out_room', msg: message });
            }
        });
    };
}
