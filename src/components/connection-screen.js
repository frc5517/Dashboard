const ipc = require('electron').ipcRenderer;
const connection = require('../connection');
const config = require('./config.json');

const state = {
    showLogin: false
};

const elements = {
    address: document.getElementById('connect-address'),
    connect: document.getElementById('connect'),
    buttonConnect: document.getElementById('connect-button'),
    loginClose: document.getElementById('login-close'),
};

connection.addOnConnectionChangeListener((connected) => {
    if (connected) {
        // On connect hide the connect popup
        hideLogin();
    } else if (state.showLogin) {
        showLogin();
    }
});

// Show login and 'connecting' first thing
// showLogin();
// showConnectPending();

function hideLogin() {
    document.body.classList.toggle('login', false);
    state.showLogin = false;
}
function showLogin() {
    document.body.classList.toggle('login', true);
    state.showLogin = true;
    // Enable the input and the button
    elements.address.disabled = elements.connect.disabled = false;
    elements.connect.textContent = 'Connect';
    elements.address.value = config.host;
    elements.address.focus();
    elements.address.setSelectionRange(8, 12);
}
function showConnectPending() {
    elements.address.disabled = elements.connect.disabled = true;
    elements.connect.textContent = 'Connecting...';
}

// elements.buttonConnect.onclick = showLogin;
elements.loginClose.onclick = hideLogin;

// On click try to connect and disable the input and the button
elements.connect.onclick = () => {
    ipc.send('connect', elements.address.value);
    showConnectPending();
};

elements.address.onkeydown = (ev) => {
    if (ev.key === 'Enter') {
        elements.connect.click();
        ev.preventDefault();
        ev.stopPropagation();
    }
};

// Hide the connect box when pressing escape key
window.onkeydown = key => {
    if (key.key === 'Escape') {
        hideLogin();
    }
};