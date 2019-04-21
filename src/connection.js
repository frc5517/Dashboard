const ipc = require('electron').ipcRenderer;
const NetworkTables = require('./network-tables');
const config = require('./config.json');

const address = document.getElementById('connect-address'),
      connect = document.getElementById('connect'),
      loginClose = document.getElementById('login-close'),
      buttonConnect = document.getElementById('connect-button');

let loginShown = true;

const connectionChangeListeners = [];

// Set function to be called when robot dis/connects
NetworkTables.addRobotConnectionListener(onRobotConnection, false);

// Function for hiding the connect box
window.onkeydown = key => {
    if (key.key === 'Escape') {
        hideLogin();
    }
};

loginClose.onclick = hideLogin;
buttonConnect.onclick = showLogin;

/**
 * Function to be called when robot connects
 * @param {boolean} connected
 */
function onRobotConnection(connected) {
    connected = true;
    console.log('Robot Connected:', connected);

    connectionChangeListeners.forEach((f) => f(connected));
    if (connected) {
        // On connect hide the connect popup
        hideLogin();
    } else if (loginShown) {
        showLogin();
    }
}

function hideLogin() {
    document.body.classList.toggle('login', false);
    loginShown = false;
}
function showLogin() {
    document.body.classList.toggle('login', true);
    loginShown = true;
    // Enable the input and the button
    address.disabled = connect.disabled = false;
    connect.textContent = 'Connect';
    address.value = config.host;
    address.focus();
    address.setSelectionRange(8, 12);
}
function showConnectPending() {
    address.disabled = connect.disabled = true;
    connect.textContent = 'Connecting...';
}
// On click try to connect and disable the input and the button
connect.onclick = () => {
    ipc.send('connect', address.value);
    showConnectPending();
};
address.onkeydown = ev => {
    if (ev.key === 'Enter') {
        connect.click();
        ev.preventDefault();
        ev.stopPropagation();
    }
};

showLogin();
showConnectPending();

module.exports = {
    addOnConnectionChangeListener(f) {
        if(typeof f != 'function') throw new Error('Invalid argument');
        connectionChangeListeners.push(f);
    }
};