import Message from './message';
import { Room } from './room';
import { User } from './user';
import WsClient from './wsClients';

export default class Rooms {
    private static instance: Rooms;
    private data: Map<string, Room>;

    private constructor() {
        this.data = new Map<string, Room>();
    }

    public new(roomID: string) {
        if (this.data.has(roomID)) throw new Error('This room is exists');
        const newRoom = new Room(roomID);
        this.data.set(roomID, newRoom);
        return newRoom;
    }

    public add(roomID: string, user: User) {
        if (!this.data.has(roomID)) throw new Error('This room is not exists');
        return this.data.get(roomID)?.addMember(user);
    }

    public get(roomID: string): Room | undefined {
        return this.data.get(roomID);
    }

    public delete(roomID: string) {
        if (!this.data.has(roomID)) throw new Error('This room is not exists');
        return this.data.delete(roomID);
    }

    public remove(roomID: string, userID: string) {
        if (!this.data.has(roomID)) throw new Error('This room is not exists');
        this.data.get(roomID)?.removeMember(userID);
        const FIVE_MINUTES = 5 * 60 * 1000;
        setTimeout(() => {
            if (this.data.get(roomID)?.getMember.length === 0) {
                this.data.delete(roomID);
            }
        }, FIVE_MINUTES);
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new Rooms();
        }
        return this.instance;
    }
}
