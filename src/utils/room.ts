import { User } from './user';
import { v4 as uuidv4 } from 'uuid';
import WSMessage from './wsMessage';

export class Room {
    private id: string;
    private member: User[];
    private secretKey: string;
    private updatedAt: Date;
    private createdAt: Date;

    constructor(id: string) {
        this.member = [];
        this.secretKey = uuidv4();
        this.id = id;
        this.updatedAt = new Date();
        this.createdAt = new Date();
    }

    public getId() {
        return this.id;
    }

    public getSecretKey() {
        return this.secretKey;
    }

    public getMember() {
        return this.member;
    }

    public getMemberWithoutSocket() {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return this.member.map(({ socket, ...rest }) => rest);
    }

    public addMember(user: User) {
        this.updatedAt = new Date();
        return this.member.push(user);
    }

    public removeMember(id: string) {
        this.updatedAt = new Date();
        this.member = this.member.filter(({ peerId }) => peerId !== id);
        return this.member;
    }

    boardcast(message: WSMessage) {
        const listClients = this.member;
        listClients?.forEach((client) => client.socket.send(JSON.stringify(message)));
    }

    public getCreatedAt() {
        return this.createdAt;
    }

    public getUpdatedAt() {
        return this.updatedAt;
    }
}
