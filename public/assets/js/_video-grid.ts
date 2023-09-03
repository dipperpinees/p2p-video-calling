export default class CameraGrid {
    _dish: HTMLElement | undefined;
    _conference: HTMLElement | undefined;
    _margin = 10;
    _video = false;
    _ratio = '4:3';
    _scenary: HTMLElement;
    _width: number = 0;
    _height: number = 0;

    // create dish
    constructor(scenary: HTMLElement) {
        // parent space to render dish
        this._scenary = scenary;

        // create the conference and dish
        this.create();

        return this;
    }

    // create Dish
    create() {
        // create conference (dish and screen container)
        this._conference = document.createElement('div');
        this._conference.classList.add('Conference');

        // create dish (cameras container)
        this._dish = document.createElement('div');
        this._dish.classList.add('Dish');

        // append dish to conference
        this._conference.appendChild(this._dish);
        this._scenary.appendChild(this._conference);
    }

    // calculate dimensions
    dimensions() {
        this._width = this._dish!.offsetWidth - this._margin * 2;
        this._height = this._dish!.offsetHeight - this._margin * 2;
    }

    // resizer of cameras
    resizer(width: number) {
        for (var s = 0; s < this._dish!.children.length; s++) {
            // camera fron dish (div without class)
            let element = <HTMLElement>this._dish!.children[s];

            // custom margin
            element!.style.margin = this._margin + 'px';

            // calculate dimensions
            element!.style.width = width + 'px';
            element!.style.height = width * this.ratio() + 'px';
        }
    }

    resize() {
        // get dimensions of dish
        this.dimensions();

        // loop (i recommend you optimize this)
        let max = 0;
        let i = 1;
        while (i < 5000) {
            let area = this.area(i);
            if (area === false) {
                max = i - 1;
                break;
            }
            i++;
        }

        // remove margins
        max = max - this._margin * 2;

        // set dimensions to all cameras
        this.resizer(max);
    }

    // split aspect ratio (format n:n)
    ratio() {
        var ratio = this._ratio.split(':');
        return Number(ratio[1]) / Number(ratio[0]);
    }

    // calculate area of dish:
    area(increment: number) {
        let i = 0;
        let w = 0;
        let h = increment * this.ratio() + this._margin * 2;
        while (i < this._dish!.children.length) {
            if (w + increment > this._width) {
                w = 0;
                h = h + increment * this.ratio() + this._margin * 2;
            }
            w = w + increment + this._margin * 2;
            i++;
        }
        if (h > this._height || increment > this._width) return false;
        else return increment;
    }

    addCamera(id: string, name: string, isMuted = false) {
        const cameraContainer = document.createElement('div');
        const camera = document.createElement('video');
        camera.autoplay = true;
        camera.muted = isMuted;
        cameraContainer.setAttribute('name', name);
        cameraContainer.appendChild(camera);
        cameraContainer.id = id;

        //status (microphone, camera)
        cameraContainer.appendChild(this.getStatusBar());

        this._dish!.appendChild(cameraContainer);
        this.resize();
    }

    getStatusBar() {
        const statusBar = document.createElement('section');
        const microphoneIcon = document.createElement('i');
        microphoneIcon.classList.add('fa-solid');
        microphoneIcon.classList.add('fa-microphone-slash');
        microphoneIcon.style.display = 'none';
        statusBar.appendChild(microphoneIcon);
        const cameraIcon = document.createElement('i');
        cameraIcon.classList.add('fa-solid');
        cameraIcon.classList.add('fa-camera-slash');
        cameraIcon.style.display = 'none';
        statusBar.appendChild(cameraIcon);
        return statusBar;
    }

    toggleMicrophoneIcon(id: string, status: boolean) {
        const microphoneIcon = document.querySelector<HTMLElement>(
            `#${id} > section .fa-microphone-slash`
        );
        if (!microphoneIcon) return;
        if (status) {
            microphoneIcon.style.display = 'none';
        } else {
            microphoneIcon.style.display = 'flex';
        }
    }

    toggleCameraIcon(id: string, status: boolean) {
        const cameraIcon = document.querySelector<HTMLElement>(`#${id} > section .fa-camera-slash`);
        if (!cameraIcon) return;
        if (status) {
            cameraIcon.style.display = 'none';
        } else {
            cameraIcon.style.display = 'flex';
        }
    }

    removeCamera(id: string) {
        document.getElementById(id)?.remove();
        this.resize();
    }

    stream(id: string, stream: MediaStream) {
        const camera = document.querySelector<HTMLVideoElement>(`#${id} video`);
        camera!.srcObject = stream;
    }
}
