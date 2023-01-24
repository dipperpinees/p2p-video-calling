class User {
    /**
     * Create a user.
     * @param {User} user
     * @param {string} user.peerId
     * @param {string} user.name
     * @param {string} user.avatar
     */
    constructor({ peerId, name, avatar }) {
        this.peerId = peerId;
        this.name = name;
        this.avatar = avatar;
    }
}

/**
 * Description
 * @type {Map<string, User>}
 */
const room = new Map();

/**
 * Description
 * @type {string}
 */
let name;

navigator.getUserMedia =
    navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;


/**
 * @param {Object} peer
 * @param {Object} stream
 * @return {function(user: User): void}
 */
const handleCall = (peer, stream) => {
    return ({ peerId: guestPeerId, name: guestName, openCamera, openMicrophone}) => {
        var call = peer.call(guestPeerId, stream, { metadata: name });
        let isStartedCamera = false;
        call.on('stream', function (stream) {
            if (!isStartedCamera) {
                isStartedCamera = true;
                room.set(guestPeerId, new User({ peerId: guestPeerId, name: guestName}));
                cameraGrid.addCamera('camera-' + guestPeerId, guestName);
                if (!openCamera) cameraGrid.toggleCameraIcon('camera-' + guestPeerId, false);
                if (!openMicrophone) cameraGrid.toggleMicrophoneIcon('camera-' + guestPeerId, false);
            }
            cameraGrid.stream('camera-' + guestPeerId, stream);
        });
    };
};

/**
 * @param {Object} stream
 * @return {function(call: Object): void} remove user's camera
 */
const handleAnswer = (stream) => {
    return (call) => {
        const guestPeerId = call.peer;
        const guestName = call.metadata;
        // Answer the call, providing our mediaStream
        call.answer(stream);
        let isStartedCamera = false;
        call.on('stream', function (stream) {
            if (!isStartedCamera) {
                isStartedCamera = true;
                room.set(guestPeerId, new User({ guestPeerId, name: guestName }));
                cameraGrid.addCamera('camera-' + guestPeerId, guestName);
            }
            cameraGrid.stream('camera-' + guestPeerId, stream);
        });
    };
};

/**
 * @param {string} peerId
 * @return {function(): void} remove user's camera
 */
const handleCloseCall = (peerId) => {
    cameraGrid.removeCamera('camera-' + peerId);
    room.delete(peerId);
};

/**
 * @param {Object} stream
 */
const onSuccess = (stream) => {
    const peer = new Peer();
    peer.on('open', function (peerId) {
        const ws = new WebSocket(
            `ws://${location.host}/ws?roomId=${roomId}&peerId=${peerId}&name=${name}`
        );
        room.set(peerId, new User({ peerId, name }));
        handleCallControl(stream, ws);
        ws.onmessage = ({ data }) => {
            const { type, message } = JSON.parse(data);

            switch (type) {
                case 'join_room': {
                    message.forEach(handleCall(peer, stream));
                    break;
                }
                case 'disconnect': {
                    handleCloseCall(message);
                    break;
                }
                case 'microphone': {
                    const {peerId, value} = message;
                    cameraGrid.toggleMicrophoneIcon("camera-" + peerId, value);
                    break;
                }
                case 'camera': {
                    const {peerId, value} = message;
                    cameraGrid.toggleCameraIcon("camera-" + peerId, value);
                    break;
                }
            }
        };

        peer.on('call', handleAnswer(stream));
    });
};

/**
 * @param {Object} ws websocket
 * @return {Function(value: Boolean) => void}
 */
const sendMessageMicrophone = (ws) => {
    return (value) => {
        ws.send(JSON.stringify({type: "microphone", message: value}));
    }
}

/**
 * @param {Object} ws websocket
 * @return {Function(value: Boolean) => void}
 */
 const sendMessageCamera = (ws) => {
    return (value) => {
        ws.send(JSON.stringify({type: "camera", message: value}));
    }
}

/**
 * @param {Object} stream
 * @param {Object} ws websocket
 */
const handleCallControl = (stream, ws) => {
    document
        .querySelectorAll('.toggle-audio')
        .forEach((el) => (el.onclick = () => toggleAudio(stream, sendMessageMicrophone(ws))));
    document
        .querySelectorAll('.toggle-video')
        .forEach((el) => (el.onclick = () => toggleVideo(stream, sendMessageCamera(ws))));
    document.querySelector('.leave-room').onclick = () => (window.location.href = '/');
};

const start = () => {
    navigator.getUserMedia(
        { audio: true, video: true },
        (stream) => {
            cameraGrid.addCamera('my-camera', 'You', true);
            cameraGrid.stream('my-camera', stream);
            onSuccess(stream);
        },
        (err) => console.error(err)
    );
};

document.querySelector('#create-room').onclick = async (e) => {
    name = document.querySelector('#name').value;
    if (!name) return;
    e.preventDefault();
    Cookies.set('name', name);
    document.querySelector(".join").style.display = "none";
    document.querySelector(".call").style.display = "block";
    start();
};
