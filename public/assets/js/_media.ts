function toggleVideoStream(stream: MediaStream, status: boolean) {
    stream.getTracks().forEach(function (track) {
        if (track.readyState == 'live' && track.kind === 'video') {
            track.enabled = status;
        }
    });
}

function toggleAudioStream(stream: MediaStream, status: boolean) {
    stream.getTracks().forEach(function (track) {
        if (track.readyState == 'live' && track.kind === 'audio') {
            track.enabled = status;
        }
    });
}

function toggleAudio(stream: MediaStream, wsCallback: (status: boolean) => void) {
    const enableButton = document.querySelector<HTMLElement>('.enable-audio');
    const disableButton = document.querySelector<HTMLElement>('.disable-audio');
    if (enableButton!.style.display === 'none') {
        enableButton!.style.display = 'flex';
        disableButton!.style.display = 'none';
        toggleAudioStream(stream, false);
        wsCallback(false);
    } else {
        enableButton!.style.display = 'none';
        disableButton!.style.display = 'flex';
        toggleAudioStream(stream, true);
        wsCallback(true);
    }
}

function toggleVideo(stream: MediaStream, wsCallback: (status: boolean) => void) {
    const enableButton = document.querySelector<HTMLElement>('.enable-video');
    const disableButton = document.querySelector<HTMLElement>('.disable-video');
    if (enableButton!.style.display === 'none') {
        enableButton!.style.display = 'flex';
        disableButton!.style.display = 'none';
        toggleVideoStream(stream, false);
        wsCallback(false);
    } else {
        enableButton!.style.display = 'none';
        disableButton!.style.display = 'flex';
        toggleVideoStream(stream, true);
        wsCallback(true);
    }
}
