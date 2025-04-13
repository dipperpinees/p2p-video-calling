import { User } from './user';

export default class WsClient {
    private static instance: WsClient;
    private data: Map<string, User>;
    private constructor() {
        this.data = new Map<string, User>();
    }

    public add(id: string, client: User) {
        return this.data.set(id, client);
    }

    public get(id: string) {
        return this.data.get(id);
    }

    public delete(id: string) {
        if (!this.data.has(id)) throw new Error('This user is not exists');
        this.data.delete(id);
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new WsClient();
        }
        return this.instance;
    }
}
