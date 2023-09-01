import { SocketStream } from '@fastify/websocket';
import { FastifyBaseLogger, FastifyRequest } from 'fastify';
import WSMessage from './wsMessage';
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
        const beforeUpdateRoomData = [
            ...(Rooms.getInstance().get(roomId)?.getMemberWithoutSocket() || []),
        ];
        Rooms.getInstance().add(roomId, newUser);

        connection.socket.send(JSON.stringify(new WSMessage('join_room', beforeUpdateRoomData)));

        connection.socket.on('message', (messageRaw) => {
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            const { type, message } = JSON.parse(messageRaw.toString()) as WSMessage;
            switch (type) {
                case 'microphone':
                    WsClients.getInstance().get(peerId)?.setMicrophone(Boolean(message));
                    Rooms.getInstance()
                        .get(roomId)
                        ?.boardcast(new WSMessage('microphone', { peerId, value: message }));
                    break;
                case 'camera':
                    WsClients.getInstance().get(peerId)?.setCamera(Boolean(message));
                    Rooms.getInstance()
                        .get(roomId)
                        ?.boardcast(new WSMessage('camera', { peerId, value: message }));
                    break;
                case 'message':
                    log.info({ type: 'message', msg: JSON.stringify({ roomId, peerId, message }) });
                    Rooms.getInstance()
                        .get(roomId)
                        ?.boardcast(new WSMessage('message', { peerId, value: message }));
                    break;
                default: return;
            }
        });

        connection.socket.on('close', () => {
            //remove client cache & delete from room
            try {
                Rooms.getInstance().get(roomId)?.removeMember(peerId);
                WsClients.getInstance().delete(peerId);
                Rooms.getInstance().get(roomId)?.boardcast(new WSMessage('disconnect', peerId));
            } catch (err) {
                let message = 'Unknown Error';
                if (err instanceof Error) message = err.message;
                log.info({ type: 'out_room', msg: message });
            }
        });
    };
}
