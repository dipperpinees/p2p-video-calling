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

const chatDrawer = document.querySelector('.chat');

let messageSound = new Audio('/assets/audio/message.mp3');

navigator.getUserMedia =
    navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

/**
 * @param {Object} peer
 * @param {Object} stream
 * @return {function(user: User): void}
 */
const handleCall = (peer, stream) => {
    return ({ peerId: guestPeerId, name: guestName, openCamera, openMicrophone }) => {
        var call = peer.call(guestPeerId, stream, { metadata: name });
        let isStartedCamera = false;
        call.on('stream', function (stream) {
            if (!isStartedCamera) {
                isStartedCamera = true;
                room.set(guestPeerId, new User({ peerId: guestPeerId, name: guestName }));
                cameraGrid.addCamera('camera-' + guestPeerId, guestName);
                if (!openCamera) cameraGrid.toggleCameraIcon('camera-' + guestPeerId, false);
                if (!openMicrophone)
                    cameraGrid.toggleMicrophoneIcon('camera-' + guestPeerId, false);
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
        const isHttps = location.protocol.includes('https');
        const ws = new WebSocket(
            `${isHttps ? 'wss' : 'ws'}://${
                location.host
            }/ws?roomId=${roomId}&peerId=${peerId}&name=${name}`
        );
        room.set(peerId, new User({ peerId, name }));
        handleCallControl(stream, ws);
        handleSendMessage(ws);
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
                    const { peerId, value } = message;
                    cameraGrid.toggleMicrophoneIcon('camera-' + peerId, value);
                    break;
                }
                case 'camera': {
                    const { peerId, value } = message;
                    cameraGrid.toggleCameraIcon('camera-' + peerId, value);
                    break;
                }
                case 'message': {
                    const { peerId: guestPeerId, value } = message;
                    if (peerId !== guestPeerId) {
                        messageSound.play();
                        createMessageSection(room.get(guestPeerId).name, value);
                    }
                    if (chatDrawer.style.display === 'none') {
                        document.querySelector('.toggle-chat span').style.display = 'block';
                    }
                    break;
                }
                default: {
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
        ws.send(JSON.stringify({ type: 'microphone', message: value }));
    };
};

/**
 * @param {Object} ws websocket
 * @return {Function(value: Boolean) => void}
 */
const sendMessageCamera = (ws) => {
    return (value) => {
        ws.send(JSON.stringify({ type: 'camera', message: value }));
    };
};

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
    document.querySelector('.join').style.display = 'none';
    document.querySelector('.call').style.display = 'block';
    start();
};

[document.querySelector('.toggle-chat'), document.querySelector('.chat-heading-close')].forEach(
    (el) =>
        (el.onclick = () => {
            if (chatDrawer.style.display === 'flex') {
                chatDrawer.style.display = 'none';
                scenary.style.right = '0px';
            } else {
                chatDrawer.style.display = 'flex';
                if (!/Android|iPhone/i.test(navigator.userAgent)) {
                    scenary.style.right = '320px';
                }
                document.querySelector('.toggle-chat span').style.display = 'none';
                chatDrawer.querySelector('form input').focus();
                scrollChatSectionToBottom();
            }
            cameraGrid.resize();
        })
);

const getTime = () => {
    const d = new Date();
    const hours = d.getHours();
    const minutes = d.getMinutes();
    return `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
};

const scrollChatSectionToBottom = () => {
    const chatContentSectionEl = document.querySelector('.chat-content');
    chatContentSectionEl.scrollTop = chatContentSectionEl.scrollHeight;
};

const createMessageSection = (name, message) => {
    message.split(/\s+/).forEach((str) => {
        if (isURL(str)) {
            message = message.replace(
                str,
                `<a target="_blank" rel="noopener noreferrer" href=${str}>${str}</a>`
            );
        }
    });
    const messageSection = document.createElement('div');
    messageSection.className = 'chat-content-message';
    messageSection.innerHTML = `
        <span><strong>${name}</strong> <span>${getTime()}</span></span>
        <p>${message}</p>
    `;
    document.querySelector('.chat-content').appendChild(messageSection);
    scrollChatSectionToBottom();
};

const isURL = (str) => {
    var urlRegex =
        '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
    var url = new RegExp(urlRegex, 'i');
    return str.length < 2083 && url.test(str);
};

const handleSendMessage = (ws) => {
    document.querySelector('.chat form').onsubmit = (e) => {
        e.preventDefault();
        const message = e.target.message.value?.trim();
        createMessageSection('You', message);
        e.target.message.value = '';
        ws.send(JSON.stringify({ type: 'message', message }));
    };
};
