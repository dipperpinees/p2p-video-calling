export default class WSMessage {
    public type: string;
    public message: string | boolean;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(type: string, message: any) {
        this.type = type;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.message = message;
    }
}
