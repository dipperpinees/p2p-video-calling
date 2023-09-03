/**
 * @param {Object} stream
 * @param {Boolean} status
 */
function toggleVideoStream(stream, status) {
    stream.getTracks().forEach(function (track) {
        if (track.readyState == 'live' && track.kind === 'video') {
            track.enabled = status;
        }
    });
}

/**
 * @param {Object} stream
 * @param {Boolean} status
 */
function toggleAudioStream(stream, status) {
    stream.getTracks().forEach(function (track) {
        if (track.readyState == 'live' && track.kind === 'audio') {
            track.enabled = status;
        }
    });
}

/**
 * @param {Object} stream
 * @param {Function(value: Boolean) => void} wsCallback
 */
function toggleAudio(stream, wsCallback) {
    const enableButton = document.querySelector('.enable-audio');
    const disableButton = document.querySelector('.disable-audio');
    if (enableButton.style.display === 'none') {
        enableButton.style.display = 'flex';
        disableButton.style.display = 'none';
        toggleAudioStream(stream, false);
        wsCallback(false);
    } else {
        enableButton.style.display = 'none';
        disableButton.style.display = 'flex';
        toggleAudioStream(stream, true);
        wsCallback(true);
    }
}

/**
 * @param {Object} stream
 * @param {Function(value: Boolean) => void} wsCallback
 */
function toggleVideo(stream, wsCallback) {
    const enableButton = document.querySelector('.enable-video');
    const disableButton = document.querySelector('.disable-video');
    if (enableButton.style.display === 'none') {
        enableButton.style.display = 'flex';
        disableButton.style.display = 'none';
        toggleVideoStream(stream, false);
        wsCallback(false);
    } else {
        enableButton.style.display = 'none';
        disableButton.style.display = 'flex';
        toggleVideoStream(stream, true);
        wsCallback(true);
    }
}
