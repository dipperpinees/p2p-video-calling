import { User } from './user';
import cryptoRandomString from 'crypto-random-string';
import Message from './message';

export class Room {
    private id: string;
    private member: User[];
    private secretKey: string;

    constructor(id: string) {
        this.member = [];
        this.secretKey = cryptoRandomString(8);
        this.id = id;
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
        return this.member.map(({socket, ...rest}) => rest);
    }

    public addMember(user: User) {
        return this.member.push(user);
    }

    public removeMember(id: string) {
        this.member = this.member.filter(({ peerId }) => peerId !== id);
        return this.member;
    }

    async boardcast(message: Message) {
        const listClients = this.member;
        listClients?.forEach(client => client.socket.send(JSON.stringify(message)));
    }
}
