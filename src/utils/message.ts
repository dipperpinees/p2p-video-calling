export default class Message {
    public type: string;
    public message: string | boolean;

    constructor(type: string, message: any) {
        this.type = type;
        this.message = message;
    }
}