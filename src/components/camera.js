const config = require('../config');
const buildStreamUrl = (port) => `http://${config.host}:${port}/?action=stream`;

const state = {
    enabled: false,
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

function showStream(index = state.selectedIndex) {
    const url = buildStreamUrl(state.streamPorts[index]);
    console.log(`Camera: Showing Stream ${state.selectedNumber}: ${url}`);
    elements.camera.style.backgroundImage = url;
    elements.currentStreamNumber.textContent = index+1;
    elements.streamCount.textContent = state.streamCount;
    return url;
}

function enable() {
    console.log('Camera: Enable');
    elements.toggleButton.textContent = 'Disable Camera';
    elements.camera.classList.remove('disabled');
    state.enabled = true;
    showStream();
}

function disable() {
    console.log('Camera: Disable');
    elements.toggleButton.textContent = 'Enable Camera';
    elements.camera.classList.add('disabled');
    state.enabled = false;
    elements.camera.style.backgroundImage = null;
}

function toggle() {
    state.enabled ? disable() : enable();
}

// Switch to next stream in list
function switchStream() {
    const newIndex = (state.selectedIndex + 1) % state.streamPorts.length;
    if(newIndex !== state.selectedIndex) {
        state.selectedIndex = newIndex;
        console.log('Camera: Switching Stream');
        enable();
    }
}

module.exports = {
    enable
};