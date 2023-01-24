import { WebSocket } from 'ws';

export class User {
    public name: string;
    public peerId: string;
    public readonly socket: WebSocket;
    private openCamera: boolean;
    private openMicrophone: boolean;

    constructor(peerId: string, name: string, socket: WebSocket) {
        this.name = name;
        this.peerId = peerId;
        this.openCamera = true;
        this.openMicrophone = true;
        this.socket = socket;
    }
    setCamera(openCamera: boolean) {
        this.openCamera = openCamera;
    }

    setMicrophone(openMicrophone: boolean) {
        this.openMicrophone = openMicrophone;
    }
}
