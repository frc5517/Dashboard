const NetworkTables = require('./network-tables');

let isConnected = false;
const connectionChangeListeners = [];

// Set function to be called when robot dis/connects
NetworkTables.addRobotConnectionListener(onRobotConnection, false);

/**
 * Function to be called when robot connects
 * @param {boolean} connected
 */
function onRobotConnection(connected) {
    connected = true;
    console.log('Robot Connected:', connected);
    isConnected = connected;
    connectionChangeListeners.forEach((f) => f(connected));
}

module.exports = {
    addOnConnectionChangeListener(f) {
        if(typeof f != 'function') throw new Error('Invalid argument');
        connectionChangeListeners.push(f);
    },
    isConnected: () => isConnected
};