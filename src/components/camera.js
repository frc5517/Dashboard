const config = require('../config');
const connection = require('../connection');

const state = {
    isEnabled: false,
    selectedIndex: 0, // default to first port
    streamPorts: config.cameraStreamPorts,
    get selectedPort() {
        return this.streamPorts[this.selectedIndex];
    },
    get streamCount() {
        return this.streamPorts.length;
    },
    get selectedNumber() {
        return this.selectedIndex + 1;
    },
};

const elements = {
    camera: document.getElementById('camera'),
    toggleButton: document.getElementById('camera-toggle'),
    switchButton: document.getElementById('camera-switch'),
    currentStreamNumber: document.getElementById('camera-current-stream-number'),
    streamCount: document.getElementById('camera-stream-count'),
};

elements.camera.onclick = switchStream;
elements.toggleButton.onclick = toggle;
elements.switchButton.onclick = switchStream;

function updateElements() {
    elements.toggleButton.disabled = elements.switchButton.disabled = !connection.isConnected();
    elements.currentStreamNumber.textContent = state.selectedNumber;
    elements.streamCount.textContent = state.streamCount;

    if(state.isEnabled) {
        elements.toggleButton.textContent = 'Disable Camera';
        elements.camera.classList.remove('disabled');

        const url = `http://${config.host}:${state.selectedPort}/?action=stream`;
        console.log(`Camera: Showing Stream ${state.selectedNumber}: ${url}`);
        elements.camera.style.backgroundImage = `url(${url})`;

    } else {
        elements.toggleButton.textContent = 'Enable Camera';
        elements.camera.classList.add('disabled');
        elements.camera.style.backgroundImage = null;
    }
}

function enable() {
    if(!connection.isConnected()) {
        return;
    }
    console.log('Camera: Enable');
    state.isEnabled = true;
    updateElements();
}

function disable() {
    console.log('Camera: Disable');
    state.isEnabled = false;
    updateElements();
}

function toggle(on = undefined) {
    if(on || !state.isEnabled) {
        enable();
    } else {
        disable();
    }
}

// Switch to next stream in list
function switchStream() {
    if(!connection.isConnected()) {
        return;
    }
    const newIndex = (state.selectedIndex + 1) % state.streamPorts.length;
    if(newIndex !== state.selectedIndex) {
        state.selectedIndex = newIndex;
        console.log('Camera: Switching Stream');
        updateElements();
    }
}

module.exports = {
    init: updateElements,
    toggle,
};